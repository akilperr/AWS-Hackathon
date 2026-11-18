"use client";

import { useEffect, useState } from "react";
import { ETIQUETAS, RESTRICCIONES, type Restriccion } from "@/lib/restricciones";
import { borrarMesa, esMesaInicial, guardarMesa, mesaInicial, nuevoComensal, PRECIO, type Mesa } from "@/lib/mesa";

const ICONO: Record<Restriccion, string> = {
  vegetariano: "🥕",
  vegano: "🌱",
  sin_gluten: "🌾",
  sin_lactosa: "🥛",
  embarazo: "🤰",
  frutos_secos: "🥜",
  marisco: "🦐",
};

/** Pantalla 2 del diseño: configurador de perfil / grupo. */
export function Configurador({ mesa, onChange, onBuscar, modo = "buscar", textoBoton = "Buscar restaurantes" }: {
  mesa: Mesa; onChange: (m: Mesa) => void; onBuscar: () => void;
  /** "mesa" (Modo 2) oculta presupuesto y preferencias: ya estáis en el restaurante */
  modo?: "buscar" | "mesa"; textoBoton?: string;
}) {
  const [activo, setActivo] = useState(mesa.comensales[0]?.id);
  const actual = mesa.comensales.find((c) => c.id === activo) ?? mesa.comensales[0];

  const editar = (cambios: Partial<(typeof mesa.comensales)[number]>) =>
    onChange({ ...mesa, comensales: mesa.comensales.map((c) => (c.id === actual.id ? { ...c, ...cambios } : c)) });

  const toggle = (r: Restriccion) =>
    editar({ restricciones: actual.restricciones.includes(r) ? actual.restricciones.filter((x) => x !== r) : [...actual.restricciones, r] });

  const añadir = () => {
    const c = nuevoComensal(mesa.comensales.length + 1);
    onChange({ ...mesa, comensales: [...mesa.comensales, c] });
    setActivo(c.id);
  };

  const quitar = () => {
    const resto = mesa.comensales.filter((c) => c.id !== actual.id);
    onChange({ ...mesa, comensales: resto });
    setActivo(resto[0]?.id);
  };

  // Limpiar filtros: vuelve al estado inicial y olvida la mesa guardada.
  // Se puede deshacer durante unos segundos por si se pulsa sin querer.
  const [anterior, setAnterior] = useState<Mesa | null>(null);
  useEffect(() => {
    if (!anterior) return;
    const t = setTimeout(() => setAnterior(null), 6000);
    return () => clearTimeout(t);
  }, [anterior]);

  const limpiar = () => {
    const limpia = mesaInicial();
    setAnterior(mesa);
    borrarMesa();
    onChange(limpia);
    setActivo(limpia.comensales[0].id);
  };

  const deshacer = () => {
    if (!anterior) return;
    guardarMesa(anterior);
    onChange(anterior);
    setActivo(anterior.comensales[0]?.id);
    setAnterior(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* Comensales */}
      {anterior && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-white" role="status">
          <span>Filtros limpiados</span>
          <button onClick={deshacer} className="font-semibold text-orange-300">Deshacer</button>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">¿Quiénes vais?</h2>
          <button
            onClick={limpiar}
            disabled={esMesaInicial(mesa)}
            className="shrink-0 rounded-full border border-line bg-card px-3 py-1 text-sm text-muted transition hover:border-rojo hover:text-rojo disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted"
          >
            ↺ Limpiar filtros
          </button>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {mesa.comensales.map((c) => (
            <button
              key={c.id}
              onClick={() => setActivo(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                c.id === actual.id ? "border-brand bg-brand text-white" : "border-line bg-card"
              }`}
            >
              {c.nombre || "Sin nombre"}
              {c.restricciones.length > 0 && <span className="ml-1 opacity-80">· {c.restricciones.length}</span>}
            </button>
          ))}
          <button onClick={añadir} className="shrink-0 rounded-full border border-dashed border-muted px-4 py-2 text-sm text-muted">
            + Añadir comensal
          </button>
        </div>

        <div className="mt-3 rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-2">
            <input
              value={actual.nombre}
              onChange={(e) => editar({ nombre: e.target.value })}
              placeholder="Nombre"
              aria-label="Nombre del comensal"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-base"
            />
            {mesa.comensales.length > 1 && (
              <button onClick={quitar} className="rounded-lg px-3 py-2 text-sm text-rojo" aria-label="Quitar comensal">
                Quitar
              </button>
            )}
          </div>
          <p className="mt-3 mb-2 text-sm text-muted">¿Tiene alguna restricción?</p>
          <div className="flex flex-wrap gap-2">
            {RESTRICCIONES.map((r) => {
              const on = actual.restricciones.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggle(r)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on ? "border-brand bg-brand-soft font-medium text-brand" : "border-line bg-card"
                  }`}
                >
                  {ICONO[r]} {ETIQUETAS[r]}
                </button>
              );
            })}
          </div>
          {actual.restricciones.length === 0 && <p className="mt-3 text-xs text-muted">Sin restricciones: come de todo.</p>}
        </div>
      </section>

      {modo === "buscar" && (<>
      {/* Presupuesto */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Presupuesto</h2>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((p) => (
            <button
              key={p}
              onClick={() => onChange({ ...mesa, presupuesto: p })}
              aria-pressed={mesa.presupuesto === p}
              className={`rounded-xl border py-3 text-lg font-semibold transition ${
                mesa.presupuesto === p ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-muted"
              }`}
            >
              {PRECIO[p]}
            </button>
          ))}
        </div>
      </section>

      {/* Preferencias en lenguaje natural */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">¿Qué os apetece o qué queréis evitar?</h2>
        <textarea
          value={mesa.preferencias}
          onChange={(e) => onChange({ ...mesa, preferencias: e.target.value })}
          rows={3}
          placeholder="Ej.: italiano o tapas, pero nada de fritos ni picante"
          className="w-full rounded-2xl border border-line bg-card p-3 text-base"
        />
      </section>
      </>)}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <button onClick={onBuscar} className="mx-auto block w-full max-w-md rounded-2xl md:max-w-2xl bg-brand py-4 text-base font-semibold text-white shadow-sm active:scale-[0.99]">
          {textoBoton}
        </button>
      </div>
    </div>
  );
}
