/**
 * Auditoría de una carta para un grupo (capa 1 reglas + capa 2 IA).
 * Se usa desde la tool `auditar_carta_grupo` del agente y desde la API
 * /api/carta/auditar (ficha del local y cartas leídas de una foto o texto).
 */
import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model";
import type { Plato } from "@/lib/supabase/types";
import type { Perfil } from "@/lib/restricciones";
import { evaluarPlato, type Conflicto } from "./reglas";

export type Veredicto = {
  plato_id: string;
  plato: string;
  categoria: Plato["categoria"];
  estado: "verde" | "amarillo" | "rojo";
  /** Por qué no es apto, o qué riesgo se ha evitado. */
  motivo?: string;
  /** Qué decir al camarero (solo amarillo). */
  instruccion?: string;
  /** 'reglas' = determinista; 'ia' = lo ha decidido el modelo (mostrar como "valorado por IA"). */
  fuente: "reglas" | "ia";
  ingredientes_inferidos?: string[];
};

export type AuditoriaComensal = {
  nombre: string;
  restricciones: Perfil["restricciones"];
  verdes: Veredicto[];
  amarillos: Veredicto[];
  rojos: Veredicto[];
  /** Tiene al menos un plato principal apto (verde o amarillo). */
  cubierto: boolean;
};

export type AuditoriaGrupo = {
  /**
   * Encaje del grupo (0-100): media por comensal de 100 si tiene algún principal
   * apto (o adaptable), 50 si solo puede tomar entrantes/postres y 0 si nada.
   */
  encaje_pct: number;
  comensales: AuditoriaComensal[];
  llamadas_ia: number;
};

const clasificacionIA = z.object({
  resultados: z.array(
    z.object({
      clave: z.string().describe("La clave exacta recibida, formato '<plato_id>|<comensal>'"),
      estado: z.enum(["verde", "amarillo", "rojo"]),
      motivo: z.string().describe("Explicación breve (máx. 20 palabras) en español"),
      instruccion: z.string().nullable().describe("Solo si es amarillo: qué pedir al camarero, p.ej. 'Pedir sin chorizo (huevos y patatas son aptos)'"),
      ingredientes_inferidos: z.array(z.string()).describe("Si el plato no traía ingredientes, los probables; si no, lista vacía"),
    }),
  ),
});

const PROMPT_IA = `Eres un auditor de seguridad alimentaria. Clasifica cada caso (plato × comensal) en:
- verde: apto tal cual.
- amarillo: apto SOLO si se retira un ingrediente superficial o guarnición, o se pide una elaboración distinta (p.ej. huevo bien hecho). Da la instrucción literal para el camarero.
- rojo: no apto, el riesgo está integrado en el plato (p.ej. carne en el ragú, harina en el rebozado, huevo crudo en la crema).

Reglas:
- Si no hay ingredientes, infiere los habituales de la receta tradicional y decide con ellos.
- Embarazo: evitar lácteos sin pasteurizar, carne/pescado crudo o poco hecho, embutidos curados sin cocinar, huevo crudo o poco cocinado, alcohol que no se evapora, paté y foie. Embutido cocinado a alta temperatura (p.ej. chorizo a la plancha) es aceptable. Huevo frito, poché o a baja temperatura suele llevar la yema líquida: amarillo con "Pedir el huevo bien hecho, con la yema cuajada".
- Si el riesgo depende de algo que no consta (tipo de caldo, si el queso es pasteurizado, si lleva vino) y NO es una alergia grave, elige amarillo con la pregunta concreta para el camarero ("Preguntar si el caldo es de verduras").
- Ante una duda real sobre alergias graves (gluten, frutos secos, marisco), elige rojo. La contaminación cruzada (freidora compartida, trazas) cuenta como riesgo real para celíacos y alérgicos.
- Sé conservador: nunca verde si dudas.
- Si el plato no trae nota_cocina, no sabes qué admite esa cocina: formula la instrucción de los amarillos como pregunta al camarero ("Preguntar si pueden servirlo sin chorizo") y solo cuando retirar el ingrediente sea razonable (guarnición, topping, salsa aparte).`;

/** Casos (plato × comensal) por llamada a la IA; los lotes van en paralelo. */
const TAM_LOTE = 5;

/** Caché en memoria para no repetir llamadas idénticas (útil en la demo). */
const cache = new Map<string, z.infer<typeof clasificacionIA>["resultados"][number]>();

/** Vacía la caché (para pruebas comparativas entre modelos). */
export const limpiarCacheAuditoria = () => cache.clear();

export async function auditarCarta(platos: Plato[], perfiles: Perfil[]): Promise<AuditoriaGrupo> {
  type Caso = { clave: string; plato: Plato; perfil: Perfil; conflictos: Conflicto[]; pistas: string[] };
  const dudosos: Caso[] = [];
  const veredictos = new Map<string, Veredicto>();

  // Capa 1: reglas
  for (const perfil of perfiles) {
    for (const plato of platos) {
      const clave = `${plato.id}|${perfil.nombre}`;
      const r = evaluarPlato(plato, perfil.restricciones);
      // Carta externa (foto o texto): los ingredientes escritos son solo una parte
      // de la receta, así que lo que las reglas dan por bueno lo revisa también la IA.
      if (plato.restaurante_id === "externo" && r.estado === "verde" && perfil.restricciones.length) {
        r.estado = "dudoso";
        r.pistas.push("Carta externa: la lista de ingredientes puede estar incompleta. Deduce la receta tradicional completa (p.ej. el salmorejo lleva pan) y cómo se elabora (p.ej. huevo frito con yema líquida, mousse con huevo crudo).");
      }
      const base = { plato_id: plato.id, plato: plato.nombre, categoria: plato.categoria, fuente: "reglas" as const };
      if (r.estado === "dudoso") {
        const cacheKey = `${plato.id}|${[...perfil.restricciones].sort().join("+")}`;
        const enCache = cache.get(cacheKey);
        if (enCache) veredictos.set(clave, aVeredicto(base, enCache));
        else dudosos.push({ clave, plato, perfil, conflictos: r.conflictos, pistas: r.pistas });
      } else if (r.estado === "verde") {
        veredictos.set(clave, { ...base, estado: "verde" });
      } else if (r.estado === "amarillo") {
        veredictos.set(clave, { ...base, estado: "amarillo", instruccion: r.instruccion, motivo: r.conflictos.map((c) => `${c.ingrediente}: ${c.motivo}`).join("; ") });
      } else {
        veredictos.set(clave, { ...base, estado: "rojo", motivo: r.conflictos.map((c) => `${c.ingrediente} (${c.motivo})`).join("; ") });
      }
    }
  }

  // Capa 2: IA solo para los dudosos, en lotes pequeños EN PARALELO (más rápido
  // que una única llamada enorme, y si un lote falla los demás siguen valiendo)
  let llamadas = 0;
  if (dudosos.length) {
    const lotes: Caso[][] = [];
    for (let i = 0; i < dudosos.length; i += TAM_LOTE) lotes.push(dudosos.slice(i, i + TAM_LOTE));
    llamadas = lotes.length;

    await Promise.all(
      lotes.map(async (lote) => {
        const casos = lote.map((d) => ({
          clave: d.clave,
          plato: d.plato.nombre,
          descripcion: d.plato.descripcion,
          ingredientes: d.plato.ingredientes,
          alergenos_declarados: d.plato.alergenos_declarados,
          permite_modificacion: d.plato.permite_modificacion,
          nota_cocina: d.plato.nota_cocina,
          restricciones_comensal: d.perfil.restricciones,
          conflictos_detectados: d.conflictos,
          pistas: d.pistas,
        }));
        try {
          const { output } = await generateText({
            model: getModel(),
            output: Output.object({ schema: clasificacionIA }),
            system: PROMPT_IA,
            prompt: `Clasifica estos ${casos.length} casos. Devuelve un resultado por clave.\n${JSON.stringify(casos)}`,
          });
          for (const res of output.resultados) {
            const d = lote.find((x) => x.clave === res.clave);
            if (!d) continue;
            cache.set(`${d.plato.id}|${[...d.perfil.restricciones].sort().join("+")}`, res);
            veredictos.set(d.clave, aVeredicto({ plato_id: d.plato.id, plato: d.plato.nombre, categoria: d.plato.categoria, fuente: "ia" }, res));
          }
        } catch (e) {
          console.error("[auditoria] fallo de la IA en un lote, sus platos se marcan como no recomendados:", e);
        }
      }),
    );
    // Lo que la IA no haya devuelto (o si falló) se queda en rojo por seguridad
    for (const d of dudosos) {
      if (!veredictos.has(d.clave)) {
        veredictos.set(d.clave, { plato_id: d.plato.id, plato: d.plato.nombre, categoria: d.plato.categoria, estado: "rojo", fuente: "reglas", motivo: "No se ha podido verificar; consulta al personal." });
      }
    }
  }

  const comensales: AuditoriaComensal[] = perfiles.map((perfil) => {
    const vs = platos.map((p) => veredictos.get(`${p.id}|${perfil.nombre}`)!);
    const verdes = vs.filter((v) => v.estado === "verde");
    const amarillos = vs.filter((v) => v.estado === "amarillo");
    return {
      nombre: perfil.nombre,
      restricciones: perfil.restricciones,
      verdes,
      amarillos,
      rojos: vs.filter((v) => v.estado === "rojo"),
      cubierto: [...verdes, ...amarillos].some((v) => v.categoria === "Principal"),
    };
  });

  const puntos = comensales.reduce((n, c) => n + (c.cubierto ? 100 : c.verdes.length + c.amarillos.length > 0 ? 50 : 0), 0);
  return {
    encaje_pct: perfiles.length ? Math.round(puntos / perfiles.length) : 100,
    comensales,
    llamadas_ia: llamadas,
  };
}

function aVeredicto(
  base: Pick<Veredicto, "plato_id" | "plato" | "categoria" | "fuente">,
  r: z.infer<typeof clasificacionIA>["resultados"][number],
): Veredicto {
  return {
    ...base,
    fuente: "ia",
    estado: r.estado,
    motivo: r.motivo,
    instruccion: r.estado === "amarillo" ? (r.instruccion ?? undefined) : undefined,
    ingredientes_inferidos: r.ingredientes_inferidos.length ? r.ingredientes_inferidos : undefined,
  };
}
