// Prueba del motor de reglas (sin IA) con los casos del documento de diseño.
// Uso: npm run test:reglas
import { supabaseServer } from "@/lib/supabase/server";
import { evaluarPlato } from "@/lib/semaforo/reglas";
import type { Plato } from "@/lib/supabase/types";
import type { Restriccion } from "@/lib/restricciones";

const CASOS: [string, Restriccion, string][] = [
  // [plato, restricción, estado esperado]
  ["Huevos rotos con chorizo", "vegetariano", "amarillo"],
  ["Lasaña boloñesa", "vegetariano", "rojo"],
  ["Tiramisú de la casa", "embarazo", "rojo"],
  ["Ensalada César", "embarazo", "amarillo"],
  ["Spaghetti carbonara", "embarazo", "rojo"],
  ["Burrito vegetal", "vegano", "amarillo"],
  ["Merluza a la romana", "sin_gluten", "rojo"],
  ["Pizza sin gluten de verduras", "sin_gluten", "verde"],
  ["Edamame", "sin_gluten", "verde"],
  ["Trofie al pesto", "frutos_secos", "rojo"],
  ["Croquetas de la abuela", "sin_gluten", "dudoso"],
  ["Tortilla de patatas jugosa", "embarazo", "dudoso"],
  ["Curry de garbanzos y coco", "vegano", "verde"],
  ["Provolone a la brasa", "embarazo", "verde"],
  ["Patatas bravas", "embarazo", "dudoso"], // alioli casero (huevo crudo), retirable según la nota → lo confirma la IA
  ["Ensaladilla rusa", "embarazo", "rojo"],
  ["Falafel con salsa de yogur", "sin_gluten", "dudoso"], // freidora compartida con trigo
  // Ingredientes ocultos (ampliación de cartas)
  ["Pizza diavola", "vegetariano", "amarillo"], // salami → pedir sin salami
  ["Panna cotta con frutos rojos", "vegetariano", "rojo"], // gelatina animal
  ["Sopa de miso", "vegetariano", "rojo"], // dashi = caldo de bonito
  ["Lasaña de verduras", "frutos_secos", "rojo"], // crema de anacardos
  ["Uramaki California", "marisco", "rojo"], // surimi con crustáceo
  ["Pad thai de tofu", "frutos_secos", "amarillo"], // pedir sin cacahuetes
  ["Enchiladas de pollo con mole", "frutos_secos", "rojo"], // mole con cacahuete y almendra
  ["Escargots à la bourguignonne", "vegetariano", "rojo"], // caracoles
];

const { data } = await supabaseServer().from("platos").select("*");

// Platos de una carta leída de una foto: muchas veces solo hay nombre y descripción
const externo = (nombre: string, descripcion: string | null): Plato =>
  ({ id: nombre, restaurante_id: "externo", nombre, categoria: "Entrante", descripcion, precio: null, ingredientes: [], alergenos_declarados: [], permite_modificacion: true, nota_cocina: null });
const EXTERNOS = [
  externo("Alitas de pollo", "con salsa sweet chili y paté saté"),
  externo("Ensalada de tomate", "aguacate, aceite de aceituna, jamón ibérico y albahaca"),
  externo("Bocadillo de calamares", null),
  externo("Hamburguesa vegetariana", "Ricota, tomate kétchup y mézclum"),
];
CASOS.push(
  ["Alitas de pollo", "vegetariano", "rojo"], // la carne ES el plato: rojo sin pasar por la IA
  ["Alitas de pollo", "vegano", "rojo"],
  ["Ensalada de tomate", "vegetariano", "dudoso"], // jamón como añadido: la IA puede proponer "sin jamón"
  ["Bocadillo de calamares", "marisco", "rojo"],
  ["Hamburguesa vegetariana", "sin_gluten", "rojo"], // el pan de hamburguesa lleva trigo
);
const platos = [...(data as Plato[]), ...EXTERNOS];
const icono = { verde: "🟢", amarillo: "🟡", rojo: "🔴", dudoso: "❔" } as const;
let fallos = 0;

for (const [nombre, r, esperado] of CASOS) {
  const plato = platos.find((p) => p.nombre === nombre);
  if (!plato) { console.log(`⚠️  No encontrado: ${nombre}`); fallos++; continue; }
  const res = evaluarPlato(plato, [r]);
  const ok = res.estado === esperado;
  if (!ok) fallos++;
  const detalle = res.instruccion ?? res.conflictos.map((c) => c.ingrediente).join(", ") ?? "";
  console.log(`${ok ? "✅" : "❌"} ${icono[res.estado]} ${nombre} · ${r} → ${res.estado}${ok ? "" : ` (esperado ${esperado})`}  ${detalle ? `— ${detalle}` : ""}`);
  if (res.estado === "dudoso") console.log(`      pistas para la IA: ${res.pistas.join(" | ")}`);
}
console.log(fallos ? `\n${fallos} caso(s) no coinciden` : "\n🎉 Todas las reglas se comportan como se espera");
process.exit(fallos ? 1 : 0);
