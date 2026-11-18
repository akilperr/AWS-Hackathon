// Prueba comparativa de modelos de IA: rapidez y calidad en las 3 tareas de la app.
// Uso: npm run benchmark                (todos los modelos)
//      npm run benchmark -- haiku nova  (solo los que contengan esos textos)
//
// A. Semáforo: casos difíciles con respuesta conocida (aciertos y errores PELIGROSOS)
// B. Agente completo: búsqueda de grupo de principio a fin (tiempo y formato)
// C. Visión: leer una foto de carta (platos y precios)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { generateText, isStepCount, type LanguageModel } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { forzarModelo } from "@/lib/ai/model";
import { auditarCarta, limpiarCacheAuditoria } from "@/lib/semaforo/auditoria";
import { extraerCarta } from "@/lib/semaforo/extraer";
import { herramientas } from "@/lib/agente/tools";
import { SYSTEM_PROMPT } from "@/lib/agente/prompt";
import { supabaseServer } from "@/lib/supabase/server";
import type { Plato } from "@/lib/supabase/types";
import type { Restriccion } from "@/lib/restricciones";

const REPETICIONES = Number(process.env.BENCH_REPS ?? 2);
const TIMEOUT_MS = 180_000;
const FOTO = process.env.BENCH_FOTO ?? "scripts/fixtures/carta-prueba.png";

// ---------------------------------------------------------------------------
// Modelos candidatos
// ---------------------------------------------------------------------------
const e = process.env;
const bedrock = createAmazonBedrock({ region: e.AWS_REGION ?? "us-east-1", accessKeyId: e.AWS_ACCESS_KEY_ID, secretAccessKey: e.AWS_SECRET_ACCESS_KEY, sessionToken: e.AWS_SESSION_TOKEN || undefined });
const google = createGoogleGenerativeAI({ apiKey: e.GOOGLE_GENERATIVE_AI_API_KEY });

const TODOS: [string, LanguageModel][] = [
  ["Claude Opus 5.5 (Bedrock)", bedrock("us.anthropic.claude-opus-5-5")],
  ["Claude Sonnet 5.5 (Bedrock)", bedrock("us.anthropic.claude-sonnet-5-5")],
  ["Claude Haiku 5.5 (Bedrock)", bedrock("us.anthropic.claude-haiku-5-5")],
  ["Amazon Nova Pro (Bedrock)", bedrock("us.amazon.nova-pro-v1:0")],
  ["Amazon Nova 2 Lite (Bedrock)", bedrock("us.amazon.nova-2-lite-v1:0")],
  ["Gemini 3.5 Flash", google("gemini-3.5-flash")],
  ["Gemini 3.5 Flash Lite", google("gemini-3.5-flash-lite")],
  ["Gemini 3.1 Flash Lite", google("gemini-3.1-flash-lite")],
];
const filtro = process.argv.slice(2).map((x) => x.toLowerCase());
const MODELOS = filtro.length ? TODOS.filter(([n]) => filtro.some((f) => n.toLowerCase().includes(f))) : TODOS;

// ---------------------------------------------------------------------------
// A. Casos del semáforo con respuesta conocida
// ---------------------------------------------------------------------------
type Estado = "verde" | "amarillo" | "rojo";
type Caso = { plato: string; r: Restriccion; ok: Estado[]; porque: string };

const CASOS: Caso[] = [
  // Restaurantes de la base de datos
  { plato: "Croquetas de la abuela", r: "sin_gluten", ok: ["rojo"], porque: "bechamel con harina y pan rallado" },
  { plato: "Croquetas de la abuela", r: "vegetariano", ok: ["rojo", "amarillo"], porque: "suelen ser de jamón" },
  { plato: "Tortilla de patatas jugosa", r: "embarazo", ok: ["amarillo"], porque: "poco cuajada → pedirla bien hecha" },
  { plato: "Huevos rotos con chorizo", r: "embarazo", ok: ["amarillo"], porque: "yema líquida → pedir huevo hecho" },
  { plato: "Patatas bravas", r: "embarazo", ok: ["amarillo"], porque: "alioli casero (huevo crudo) → sin alioli" },
  { plato: "Falafel con salsa de yogur", r: "sin_gluten", ok: ["rojo"], porque: "freidora compartida con trigo" },
  { plato: "Ensalada de quinoa y feta", r: "embarazo", ok: ["amarillo"], porque: "feta sin confirmar pasteurización" },
  { plato: "Hamburguesa de ternera con pan sin gluten", r: "vegetariano", ok: ["rojo"], porque: "la carne es estructural" },
  { plato: "Cocido madrileño", r: "vegetariano", ok: ["rojo"], porque: "carnes y embutidos" },
  { plato: "Plat du jour", r: "sin_gluten", ok: ["rojo", "amarillo"], porque: "plato desconocido: nunca verde" },
  { plato: "Chuletón madurado (1 kg)", r: "embarazo", ok: ["amarillo"], porque: "poco hecho → pedirlo muy hecho" },
  { plato: "Quesadilla de queso Oaxaca", r: "embarazo", ok: ["amarillo", "rojo"], porque: "pasteurización sin confirmar" },
  { plato: "Tabla de quesos artesanos", r: "embarazo", ok: ["amarillo", "rojo"], porque: "quesos de leche cruda" },
  { plato: "Tarta de queso cremosa", r: "embarazo", ok: ["rojo", "amarillo"], porque: "centro poco cuajado" },
  // Carta externa (foto)
  { plato: "Salmorejo cordobés", r: "sin_gluten", ok: ["rojo"], porque: "lleva pan" },
  { plato: "Mousse de chocolate", r: "embarazo", ok: ["rojo", "amarillo"], porque: "huevo crudo" },
  { plato: "Pisto manchego", r: "embarazo", ok: ["amarillo"], porque: "huevo frito → bien hecho" },
  { plato: "Torrijas", r: "sin_gluten", ok: ["rojo"], porque: "pan de trigo" },
  { plato: "Calamares a la andaluza", r: "vegetariano", ok: ["rojo"], porque: "calamar" },
  { plato: "Rabo de toro", r: "sin_gluten", ok: ["amarillo", "rojo"], porque: "salsa suele espesarse con harina" },
  { plato: "Risotto de boletus y trufa", r: "vegetariano", ok: ["amarillo", "verde"], porque: "depende del caldo" },
  // Casos POSITIVOS: penalizan ser exageradamente conservador
  { plato: "Lubina a la sal", r: "sin_gluten", ok: ["verde"], porque: "pescado a la sal, sin gluten" },
  { plato: "Lubina a la sal", r: "embarazo", ok: ["verde"], porque: "pescado bien cocinado" },
  { plato: "Pisto manchego", r: "sin_gluten", ok: ["verde"], porque: "verduras y huevo" },
];

/** Carta de la foto de prueba, tal como la extrae el sistema (fija para comparar solo el semáforo). */
const CARTA_FOTO: Plato[] = [
  ["Salmorejo cordobés", "Entrante", "con huevo y jamón", ["huevo", "jamón"], []],
  ["Calamares a la andaluza", "Entrante", null, [], ["gluten", "moluscos"]],
  ["Pisto manchego", "Entrante", "con huevo frito", ["huevo frito"], []],
  ["Rabo de toro", "Principal", "estofado al vino tinto", ["rabo de toro", "vino tinto"], []],
  ["Lubina a la sal", "Principal", null, [], []],
  ["Risotto de boletus y trufa", "Principal", null, ["boletus", "trufa"], []],
  ["Torrijas", "Postre", null, [], []],
  ["Mousse de chocolate", "Postre", "casera", ["chocolate"], []],
].map(([nombre, categoria, descripcion, ingredientes, alergenos], i) => ({
  id: `00000000-0000-4000-b000-00000000000${i}`, restaurante_id: "externo", nombre: nombre as string,
  categoria: categoria as Plato["categoria"], descripcion: descripcion as string | null, precio: null,
  ingredientes: ingredientes as string[], alergenos_declarados: alergenos as string[], permite_modificacion: true, nota_cocina: null,
}));

const FOTO_ESPERADA: [string, number][] = [
  ["salmorejo", 7.5], ["calamares", 11], ["pisto", 9], ["rabo de toro", 16],
  ["lubina", 18.5], ["risotto", 14], ["torrijas", 6], ["mousse", 5.5],
];

// ---------------------------------------------------------------------------
const conTimeout = <T,>(p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`timeout ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS))]);
const seg = (t: number) => (Date.now() - t) / 1000;
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const err = (x: unknown) => (x instanceof Error ? x.message.split("\n")[0].slice(0, 90) : String(x));

// Errores de la IA en una sola línea (si no, el registro es ilegible)
const errorOriginal = console.error;
console.error = (...a: unknown[]) => errorOriginal(`    ⚠️ ${a.map((x) => (x instanceof Error ? x.message.split("\n")[0].slice(0, 120) : String(x))).join(" ")}`);

const { data: platosBD } = await supabaseServer().from("platos").select("*");
const todos = [...(platosBD as Plato[]), ...CARTA_FOTO];

async function pruebaSemaforo() {
  limpiarCacheAuditoria();
  const porRestriccion = new Map<Restriccion, Caso[]>();
  CASOS.forEach((c) => porRestriccion.set(c.r, [...(porRestriccion.get(c.r) ?? []), c]));
  const t = Date.now();
  // Una auditoría por restricción, en paralelo (como varias cartas a la vez en la app)
  const resultados = await Promise.all(
    [...porRestriccion].map(async ([r, casos]) => {
      const platos = casos.map((c) => todos.find((p) => p.nombre === c.plato)!);
      const a = await auditarCarta(platos, [{ nombre: "P", restricciones: [r] }]);
      const vs = [...a.comensales[0].verdes, ...a.comensales[0].amarillos, ...a.comensales[0].rojos];
      return casos.map((c) => ({ c, v: vs.find((v) => v.plato === c.plato) }));
    }),
  );
  const todas = resultados.flat();
  // Los casos sin respuesta de la IA (caída, timeout) no cuentan como error de criterio
  const sinVeredictoIA = todas.filter(({ v }) => v?.motivo?.startsWith("No se ha podido verificar")).length;
  const filas = todas.filter(({ v }) => v && !v.motivo?.startsWith("No se ha podido verificar"));
  const aciertos = filas.filter(({ c, v }) => v && c.ok.includes(v.estado)).length;
  const peligrosos = filas.filter(({ c, v }) => v?.estado === "verde" && !c.ok.includes("verde"));
  const conservador = filas.filter(({ c, v }) => c.ok.includes("verde") && v && v.estado !== "verde").length;
  if (process.env.BENCH_DETALLE) for (const { c, v } of filas.filter(({ c, v }) => v && !c.ok.includes(v.estado)))
    console.log(`    ✗ ${c.plato} / ${c.r}: ${v!.estado} (esperado ${c.ok.join(" o ")}) · ${v!.instruccion ?? v!.motivo ?? ""}`);
  return { tiempo: seg(t), aciertos, total: filas.length, peligrosos: peligrosos.map(({ c }) => `${c.plato}/${c.r}`), conservador, sinVeredictoIA };
}

async function pruebaAgente() {
  limpiarCacheAuditoria();
  const t = Date.now();
  const res = await generateText({
    model: MODELO_ACTUAL!,
    system: SYSTEM_PROMPT,
    prompt: "Somos 4 personas:\n- Ana: sin_gluten\n- Bea: embarazo\n- Carlos: vegetariano\n- Dani: sin restricciones\nPresupuesto máximo: 2 (€€).\nPreferencias: italiano o tapas, nada de picante\nRecomiéndanos dónde ir.",
    tools: herramientas,
    stopWhen: isStepCount(8),
  });
  const llamadas = res.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName));
  const auditados = res.steps.flatMap((s) => s.toolResults)
    .filter((r) => r.toolName === "auditar_carta_grupo")
    .map((r) => String((r.output as { restaurante?: string }).restaurante ?? "").toLowerCase());
  const titulos = [...res.text.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].replace(/[*]/g, "").trim().toLowerCase());
  const formato = [
    llamadas.includes("buscar_candidatos"),
    llamadas.includes("auditar_carta_grupo"),
    titulos.length >= 1 && titulos.length <= 3,
    titulos.every((tt) => auditados.some((a) => a && (tt.includes(a) || a.includes(tt)))), // no inventa restaurantes
    /⚠️/.test(res.text),
    res.text.length < 1500, // breve, sin listas de platos
  ];
  return { tiempo: seg(t), pasos: res.steps.length, formato: formato.filter(Boolean).length, formatoTotal: formato.length };
}

async function pruebaVision() {
  if (!existsSync(FOTO)) return { tiempo: NaN, platos: 0, total: 0, precios: 0 };
  const t = Date.now();
  const r = await extraerCarta({ imagenes: [{ base64: readFileSync(FOTO).toString("base64"), mediaType: "image/png" }] });
  const nombres = r.platos.map((p) => p.nombre.toLowerCase());
  const platos = FOTO_ESPERADA.filter(([n]) => nombres.some((x) => x.includes(n))).length;
  const precios = FOTO_ESPERADA.filter(([n, pr]) => r.platos.some((p) => p.nombre.toLowerCase().includes(n) && Number(p.precio) === pr)).length;
  return { tiempo: seg(t), platos, total: FOTO_ESPERADA.length, precios };
}

// ---------------------------------------------------------------------------
let MODELO_ACTUAL: LanguageModel | null = null;
type Fila = { modelo: string; A: Awaited<ReturnType<typeof pruebaSemaforo>>[]; B: Awaited<ReturnType<typeof pruebaAgente>>[]; C: Awaited<ReturnType<typeof pruebaVision>>[]; fallos: string[] };
const tabla: Fila[] = [];

console.log(`\n🏁 Prueba comparativa · ${MODELOS.length} modelos · ${REPETICIONES} repeticiones · ${CASOS.length} casos de semáforo\n`);

for (const [nombre, modelo] of MODELOS) {
  MODELO_ACTUAL = modelo;
  forzarModelo(modelo);
  const fila: Fila = { modelo: nombre, A: [], B: [], C: [], fallos: [] };
  for (let i = 1; i <= REPETICIONES; i++) {
    for (const [letra, prueba] of [["A", pruebaSemaforo], ["B", pruebaAgente], ["C", pruebaVision]] as const) {
      try {
        const r = await conTimeout((prueba as () => Promise<never>)());
        (fila[letra] as unknown[]).push(r);
        console.log(`  ${nombre} · ${letra}${i} · ${JSON.stringify(r)}`);
      } catch (x) {
        fila.fallos.push(`${letra}${i}: ${err(x)}`);
        console.log(`  ${nombre} · ${letra}${i} · ❌ ${err(x)}`);
      }
    }
  }
  tabla.push(fila);
}
forzarModelo(null);

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
const resumen = tabla.map((f) => {
  const okA = f.A.length ? media(f.A.filter((a) => a.total).map((a) => a.aciertos / a.total)) : NaN;
  const sinRespuesta = f.A.reduce((n, a) => n + a.sinVeredictoIA, 0);
  const pelig = f.A.reduce((n, a) => n + a.peligrosos.length, 0);
  const okB = f.B.length ? media(f.B.map((b) => b.formato / b.formatoTotal)) : NaN;
  const okC = f.C.length ? media(f.C.map((c) => (c.platos + c.precios) / (2 * c.total || 1))) : NaN;
  const calidad = [okA * 0.6, okB * 0.25, okC * 0.15].every(Number.isFinite) ? okA * 0.6 + okB * 0.25 + okC * 0.15 : NaN;
  return {
    modelo: f.modelo,
    "A semáforo s": +media(f.A.map((a) => a.tiempo)).toFixed(1),
    "A aciertos %": Math.round(okA * 100),
    "A peligrosos": pelig,
    "B agente s": +media(f.B.map((b) => b.tiempo)).toFixed(1),
    "B formato %": Math.round(okB * 100),
    "C foto s": +media(f.C.map((c) => c.tiempo)).toFixed(1),
    "C lectura %": Math.round(okC * 100),
    "calidad %": Math.round(calidad * 100),
    "A sin respuesta": sinRespuesta,
    fallos: f.fallos.length,
    detallePeligrosos: [...new Set(f.A.flatMap((a) => a.peligrosos))],
  };
});

console.log("\n📊 RESUMEN (medias)\n");
console.table(resumen.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== "detallePeligrosos"))));
for (const r of resumen) if (r.detallePeligrosos.length) console.log(`⚠️  ${r.modelo} dio 🟢 a: ${r.detallePeligrosos.join(", ")}`);

writeFileSync("scripts/fixtures/benchmark-resultados.json", JSON.stringify({ fecha: new Date().toISOString(), resumen, detalle: tabla }, null, 2));
console.log("\n💾 Resultados completos en scripts/fixtures/benchmark-resultados.json");
