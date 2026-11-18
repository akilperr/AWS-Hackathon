/**
 * Motor de reglas del semáforo (capa 1, determinista).
 *
 * Para cada plato y comensal decide:
 *   verde    → apto tal cual
 *   amarillo → apto quitando un ingrediente superficial que la cocina permite retirar
 *   rojo     → no apto (motivo)
 *   dudoso   → las reglas no bastan (faltan ingredientes, riesgo solo insinuado
 *              en la nota de cocina, posible adaptación…) → lo decide la IA.
 *
 * Las reglas son conservadoras: ante la duda nunca devuelven verde.
 */
import type { Plato } from "@/lib/supabase/types";
import type { Restriccion } from "@/lib/restricciones";

export type Estado = "verde" | "amarillo" | "rojo" | "dudoso";

export type Conflicto = {
  ingrediente: string;
  motivo: string;
  /** El ingrediente prohibido ES el plato (está en el núcleo del nombre: "Alitas de pollo") */
  estructural?: boolean;
};

export type ResultadoReglas = {
  estado: Estado;
  conflictos: Conflicto[];
  /** Instrucción para el camarero cuando es amarillo. */
  instruccion?: string;
  /** Pistas para la IA cuando es dudoso. */
  pistas: string[];
};

// ---------------------------------------------------------------------------
// Vocabulario (en minúsculas y sin tildes; se comparan palabras completas,
// admitiendo plural en -s/-es; las que acaban en * son prefijos)
// ---------------------------------------------------------------------------
const CARNE = ["carne", "ternera", "vaca", "cerdo", "pollo", "cordero", "chorizo", "bacon", "jamon", "guanciale", "panceta", "salchicha", "higado", "chuleton", "solomillo", "chashu", "pato", "foie", "tocino", "morcilla", "pavo", "caldo de cerdo", "caldo de ternera", "caldo de pollo", "caldo de ave", "caracol", "molleja", "callos", "morro", "oreja", "manteca de cerdo", "entrecot", "cochinita", "paletilla", "gelatina", "salami", "pepperoni", "salchichon", "fuet", "chistorra", "sobrasada", "butifarra", "mortadela", "cecina", "lacon", "lomo", "alita", "costilla", "chuleta", "pechuga", "muslo", "carrillera", "rabo", "conejo", "codorniz", "perdiz", "venado", "jabali", "kebab", "shawarma", "pastrami", "secreto iberico", "presa iberica"];
const PESCADO = ["pescado", "atun", "salmon", "anchoa", "merluza", "corvina", "boqueron", "bacalao", "ventresca", "worcestershire", "sardina", "surimi", "bonito", "dashi", "lubina"];
const MARISCO = ["marisco", "gamba", "langostino", "pulpo", "calamar", "mejillon", "almeja", "sepia", "cangrejo", "bogavante"];
const LACTEOS = ["leche", "queso", "nata", "mantequilla", "yogur", "bechamel", "mascarpone", "mozzarella", "parmesano", "pecorino", "ghee", "paneer", "crema agria", "feta", "provolone", "cheddar", "gruyere", "camembert", "roquefort", "comte", "helado", "burrata", "oaxaca"];
const HUEVO = ["huevo", "yema*", "clara", "mayonesa", "alioli", "bizcocho*"];
const GLUTEN = ["trigo", "harina", "pan", "pasta", "spaghetti", "trofie", "lasana", "pizza", "masa", "bizcocho*", "galleta", "picatoste*", "rebozad*", "tempura", "cebada", "centeno", "avena", "cuscus", "seitan", "granola", "fideos", "naan", "pita", "brioche", "hojaldre", "filo", "quebrada", "salsa de soja", "ponzu", "teriyaki", "bulgur", "cerveza", "yakisoba", "hamburguesa", "bocadillo", "sandwich", "montadito", "tosta", "empanada", "empanadilla", "croissant", "bollo", "molde"];
const FRUTOS_SECOS = ["nuez", "nueces", "almendra", "anacardo", "pistacho", "pinon", "pinones", "avellana", "cacahuete", "pesto", "pecana", "macadamia", "sate", "satay", "praline", "mazapan", "turron", "romesco"];
const OTROS_ANIMALES = ["miel"];

/** Si el ingrediente contiene una de estas frases, se considera seguro para esa restricción. */
const EXCEPCIONES: Partial<Record<Restriccion, string[]>> = {
  sin_gluten: ["sin gluten", "harina de arroz", "harina de almendra", "harina de maiz", "harina de garbanzo", "tortilla de maiz", "fideos de arroz", "arroz glutinoso", "totopos de maiz"],
  sin_lactosa: ["leche de coco", "queso vegano", "sin lactosa", "leche de avena", "leche de soja"],
  vegano: ["mayonesa vegana", "queso vegano", "leche de coco", "leche de avena", "leche de soja"],
};

/** Riesgos de embarazo que, presentes en los INGREDIENTES, son rojo directo. */
const EMBARAZO_ROJO = ["crudo", "cruda", "crudas", "crudos", "leche cruda", "sin pasteurizar", "lait cru", "poco cocinad*", "poco cuajad*", "yema liquida", "yema cruda", "yemas crudas", "huevo crudo", "mayonesa", "alioli", "pate", "higado", "foie", "roquefort", "camembert", "salmon ahumado", "tartar", "ceviche", "licor", "amaretto", "conac", "ron", "whisky", "brandy"];
/** Riesgos que dependen de la elaboración → dudoso, lo valora la IA. */
const EMBARAZO_DUDOSO = ["vino", "cerveza", "escalfad*", "cotija", "chorizo", "jamon", "guanciale", "salami", "embutido", "queso fresco", "brie", "oaxaca", "feta", "sin confirmar", "consultar", "poco hecho", "poco hecha", "marinad*", ...EMBARAZO_ROJO];
const PASTEURIZADO = ["pasteurizad"];

/** Alérgenos declarados que bastan para marcar conflicto por restricción. */
const ALERGENOS: Partial<Record<Restriccion, string[]>> = {
  sin_gluten: ["gluten"],
  sin_lactosa: ["lacteos"],
  frutos_secos: ["frutos_secos", "cacahuete"],
  marisco: ["crustaceos", "moluscos"],
  vegetariano: ["pescado", "crustaceos", "moluscos"],
  vegano: ["pescado", "crustaceos", "moluscos", "huevo", "lacteos"],
};

const VOCAB: Record<Exclude<Restriccion, "embarazo">, { palabras: string[]; motivo: string }> = {
  vegetariano: { palabras: [...CARNE, ...PESCADO, ...MARISCO], motivo: "contiene carne o pescado" },
  vegano: { palabras: [...CARNE, ...PESCADO, ...MARISCO, ...LACTEOS, ...HUEVO, ...OTROS_ANIMALES], motivo: "contiene ingredientes de origen animal" },
  sin_gluten: { palabras: GLUTEN, motivo: "contiene gluten" },
  sin_lactosa: { palabras: LACTEOS, motivo: "contiene lácteos" },
  frutos_secos: { palabras: FRUTOS_SECOS, motivo: "contiene frutos secos" },
  marisco: { palabras: MARISCO, motivo: "contiene marisco" },
};

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------
export const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n");

const regexCache = new Map<string, RegExp>();
function regex(palabra: string): RegExp {
  let r = regexCache.get(palabra);
  if (!r) {
    const prefijo = palabra.endsWith("*");
    const base = (prefijo ? palabra.slice(0, -1) : palabra).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    r = new RegExp(`(^|[^a-z])${base}${prefijo ? "" : "(s|es)?(?![a-z])"}`);
    regexCache.set(palabra, r);
  }
  return r;
}

/** Devuelve la primera palabra del vocabulario que aparece en el texto. */
function buscar(texto: string, palabras: string[]): string | undefined {
  return palabras.find((p) => regex(p).test(texto));
}

const CONTAMINACION = /(compartid|trazas|contaminacion cruzada|mismo aceite|misma freidora)/;

/**
 * ¿La palabra está en el núcleo del nombre del plato? El núcleo es lo que va
 * antes de " con ", " y ", " sin ", " al/a la "… → "Alitas de pollo" sí;
 * "Huevos rotos con chorizo" no (el chorizo es un añadido que se puede quitar).
 */
function enNucleo(nombreNormalizado: string, palabra: string) {
  const nucleo = nombreNormalizado.split(/\s+(?:con|y|sin|al|a la|en|sobre)\s+|[,(·]/)[0];
  return regex(palabra).test(nucleo);
}

const VERBOS_RETIRADA = /(quitar|retirar|omitir|sin |aparte|cambiar|al final|se puede pedir|se pueden)/;

/** Nombre corto de un ingrediente: lo que va antes del paréntesis. */
const cabeza = (ing: string) => ing.split("(")[0].trim();

// ---------------------------------------------------------------------------
// Evaluación
// ---------------------------------------------------------------------------
export function evaluarPlato(plato: Plato, restricciones: Restriccion[]): ResultadoReglas {
  const ingredientes = plato.ingredientes ?? [];
  const nota = normalizar(plato.nota_cocina ?? "");
  const nombre = normalizar(plato.nombre);
  const desc = normalizar(`${plato.nombre}. ${plato.descripcion ?? ""}`);

  if (restricciones.length === 0) return { estado: "verde", conflictos: [], pistas: [] };

  const conflictos: Conflicto[] = [];
  const pistas: string[] = [];

  if (ingredientes.length === 0) {
    pistas.push("La carta no detalla ingredientes: inferir los habituales de este plato.");
  }

  for (const r of restricciones) {
    // 1) Ingredientes
    for (const ing of ingredientes) {
      const n = normalizar(ing);
      if (r === "embarazo") {
        if (buscar(n, PASTEURIZADO) || n.includes("vegana")) continue;
        const rojo = buscar(n, EMBARAZO_ROJO);
        if (rojo) conflictos.push({ ingrediente: ing, motivo: `riesgo en embarazo (${rojo.replace("*", "")})` });
        else {
          const dudoso = buscar(n, EMBARAZO_DUDOSO);
          if (dudoso) pistas.push(`Embarazo: '${ing}' puede ser de riesgo según elaboración.`);
        }
        continue;
      }
      if (EXCEPCIONES[r]?.some((e) => n.includes(e))) continue;
      const hit = buscar(n, VOCAB[r].palabras);
      if (hit) conflictos.push({ ingrediente: ing, motivo: VOCAB[r].motivo });
    }

    // 2) Nombre y descripción del plato: en cartas leídas de una foto muchas veces
    //    son lo único que hay ("Alitas de pollo · con salsa sweet chili").
    if (r !== "embarazo") {
      for (const [texto, origen] of [[nombre, "nombre"], [desc, "descripción"]] as const) {
        if (EXCEPCIONES[r]?.some((x) => texto.includes(x))) continue;
        const hit = buscar(texto, VOCAB[r].palabras);
        if (!hit) continue;
        const base = hit.replace("*", "");
        if (conflictos.some((c) => normalizar(c.ingrediente).includes(base))) continue; // ya detectado en ingredientes
        conflictos.push({
          ingrediente: base,
          motivo: `${VOCAB[r].motivo} (según ${origen === "nombre" ? "el nombre" : "la descripción"} del plato)`,
          estructural: origen === "nombre" && enNucleo(nombre, base),
        });
      }
      // Lo prohibido en el núcleo del nombre también es estructural aunque venga de los ingredientes
      for (const c of conflictos) {
        if (!c.estructural && VOCAB[r].palabras.some((w) => regex(w).test(normalizar(c.ingrediente)) && enNucleo(nombre, w.replace("*", "")))) c.estructural = true;
      }
    }

    // 3) Alérgenos declarados que no hemos podido atribuir a un ingrediente concreto
    const declarados = (ALERGENOS[r] ?? []).filter((a) => plato.alergenos_declarados?.includes(a));
    if (declarados.length && !conflictos.some((c) => c.motivo === VOCAB[r as keyof typeof VOCAB]?.motivo)) {
      conflictos.push({ ingrediente: `alérgeno declarado: ${declarados.join(", ")}`, motivo: `declarado por el restaurante` });
    }

    // 4) Contaminación cruzada en alergias (freidora compartida, trazas…)
    if ((r === "sin_gluten" || r === "frutos_secos" || r === "marisco") && CONTAMINACION.test(nota)) {
      pistas.push(`Alergia (${r}): la nota de cocina indica posible contaminación cruzada: "${plato.nota_cocina}"`);
    }

    // 5) Riesgos de embarazo mencionados solo en descripción / nota de cocina
    if (r === "embarazo") {
      const enTexto = buscar(`${desc} ${nota}`, EMBARAZO_DUDOSO);
      if (enTexto && !buscar(`${desc} ${nota}`, PASTEURIZADO)) pistas.push(`Embarazo: la descripción/nota menciona '${enTexto.replace("*", "")}'.`);
    }
  }

  // Sin conflictos: verde, salvo que haya pistas que obliguen a revisar
  if (conflictos.length === 0) {
    return pistas.length ? { estado: "dudoso", conflictos, pistas } : { estado: "verde", conflictos, pistas };
  }

  // Con conflictos: ¿se pueden retirar todos según la nota de cocina?
  const unicos = dedupe(conflictos);
  const retirable = (c: Conflicto) => {
    if (c.ingrediente.startsWith("alérgeno declarado")) return false;
    const n = normalizar(c.ingrediente);
    const claves = [normalizar(cabeza(c.ingrediente)), ...n.split(/[\s(),]+/).filter((w) => w.length > 3)];
    return claves.some((k) => k && nota.includes(k));
  };

  if (plato.permite_modificacion && VERBOS_RETIRADA.test(nota) && unicos.every(retirable)) {
    const quitar = unicos.map((c) => cabeza(c.ingrediente));
    const resto = ingredientes.filter((i) => !unicos.some((c) => c.ingrediente === i)).map(cabeza);
    return {
      estado: pistas.length ? "dudoso" : "amarillo",
      conflictos: unicos,
      instruccion: `Pedir sin ${lista(quitar)}${resto.length ? ` (${lista(resto.slice(0, 4))} son aptos)` : ""}`,
      pistas: pistas.length ? [...pistas, `Adaptable quitando: ${lista(quitar)}.`] : pistas,
    };
  }

  // El ingrediente prohibido ES el plato ("Alitas de pollo" para un vegetariano):
  // rojo sin pasar por la IA, salvo que la nota de cocina ofrezca cambiarlo.
  if (unicos.some((c) => c.estructural) && !/cambiar|sustitu|en lugar de|version/.test(nota)) {
    return { estado: "rojo", conflictos: unicos, pistas };
  }

  // Modificable pero las reglas no saben si basta → que lo valore la IA
  if (plato.permite_modificacion) {
    return { estado: "dudoso", conflictos: unicos, pistas: [...pistas, plato.nota_cocina ? "El plato admite modificaciones; valorar si quitar el ingrediente lo hace apto o si es estructural." : "Carta externa: no se sabe qué admite la cocina; valorar si el ingrediente es retirable (guarnición, topping, salsa) o estructural."] };
  }

  return { estado: "rojo", conflictos: unicos, pistas };
}

function dedupe(c: Conflicto[]) {
  const vistos = new Set<string>();
  return c.filter((x) => (vistos.has(x.ingrediente) ? false : (vistos.add(x.ingrediente), true)));
}

const lista = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
