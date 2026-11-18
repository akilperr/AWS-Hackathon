/**
 * Configuración de la "mesa" (grupo) en el cliente: tipos, persistencia en
 * localStorage (perfiles recientes) y conversión a mensaje para el agente.
 */
import { ETIQUETAS, type Restriccion } from "@/lib/restricciones";

export type Comensal = { id: string; nombre: string; restricciones: Restriccion[] };
export type Mesa = { comensales: Comensal[]; presupuesto: 1 | 2 | 3; preferencias: string };

const CLAVE = "agent-locally:ultima-mesa";

export const nuevoComensal = (n: number): Comensal => ({
  id: crypto.randomUUID(),
  nombre: n === 1 ? "Yo" : `Comensal ${n}`,
  restricciones: [],
});

export const mesaInicial = (): Mesa => ({ comensales: [nuevoComensal(1)], presupuesto: 2, preferencias: "" });

export function guardarMesa(m: Mesa) {
  try { localStorage.setItem(CLAVE, JSON.stringify(m)); } catch { /* sin almacenamiento: no pasa nada */ }
}

export function borrarMesa() {
  try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento: no pasa nada */ }
}

/** ¿La mesa está como recién abierta (un comensal sin restricciones, €€, sin preferencias)? */
export const esMesaInicial = (m: Mesa) =>
  m.comensales.length === 1 && m.comensales[0].restricciones.length === 0 && m.presupuesto === 2 && !m.preferencias.trim();

export function cargarMesa(): Mesa | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Mesa) : null;
  } catch { return null; }
}

export const PRECIO = ["", "€", "€€", "€€€"] as const;

/** Emoji por tipo de cocina (pines del mapa y listas). */
export const EMOJI_COCINA: Record<string, string> = {
  italiana: "🍝", tapas: "🍤", vegana: "🥗", japonesa: "🍣", asador: "🥩", "sin gluten": "🌾",
  mexicana: "🌮", "mediterránea": "🫒", casera: "🍲", india: "🍛", francesa: "🧀", poke: "🥢",
};
export const emojiCocina = (c: string) => EMOJI_COCINA[c.toLowerCase()] ?? "🍽️";

/** Punto de partida por defecto para distancias y mapa (no se pide la ubicación). */
export const UBICACION = { nombre: "Puerta del Sol", coords: [40.4169, -3.7035] as [number, number] };

/** Resumen corto, p.ej. "3 comensales · Sin gluten, Embarazo · €€" */
export function resumenMesa(m: Mesa) {
  const r = [...new Set(m.comensales.flatMap((c) => c.restricciones))].map((x) => ETIQUETAS[x]);
  const n = m.comensales.length;
  return `${n} ${n === 1 ? "comensal" : "comensales"}${r.length ? ` · ${r.join(", ")}` : ""} · ${PRECIO[m.presupuesto]}`;
}

/** Perfiles para las APIs, con nombres únicos (la auditoría los usa como clave). */
export function perfilesDeMesa(m: Mesa) {
  const vistos = new Map<string, number>();
  return m.comensales.map((c, i) => {
    const base = c.nombre.trim() || `Comensal ${i + 1}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return { nombre: n > 1 ? `${base} (${n})` : base, restricciones: c.restricciones };
  });
}

/** Mensaje en lenguaje natural + datos exactos para el agente. */
export function mesaAPrompt(m: Mesa) {
  const lineas = perfilesDeMesa(m).map((c) =>
    `- ${c.nombre}: ${c.restricciones.length ? c.restricciones.join(", ") : "sin restricciones"}`);
  return [
    `Somos ${m.comensales.length} ${m.comensales.length === 1 ? "persona" : "personas"}:`,
    ...lineas,
    `Presupuesto máximo: ${m.presupuesto} (${PRECIO[m.presupuesto]}).`,
    m.preferencias.trim() ? `Preferencias: ${m.preferencias.trim()}` : "Sin preferencias concretas de cocina.",
    "Recomiéndanos dónde ir.",
  ].join("\n");
}
