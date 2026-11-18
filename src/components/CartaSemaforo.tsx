"use client";

import { useState } from "react";
import type { AuditoriaGrupo, Veredicto } from "@/lib/semaforo/auditoria";
import type { Plato } from "@/lib/supabase/types";
import { ETIQUETAS } from "@/lib/restricciones";

const ORDEN_CATEGORIA: Record<Plato["categoria"], number> = { Entrante: 0, Principal: 1, Postre: 2, Bebida: 3 };
const porCategoria = (a: Veredicto, b: Veredicto) => ORDEN_CATEGORIA[a.categoria] - ORDEN_CATEGORIA[b.categoria];

/**
 * Pantalla 4 del diseño: carta en 3 bloques (aptos / con modificación /
 * no recomendados) con selector de comensal arriba.
 */
export function CartaSemaforo({ auditoria, platos, titulo, subtitulo, onConfirmar }: {
  auditoria: AuditoriaGrupo;
  platos: Plato[];
  /** Sin título solo se muestra el % de encaje (la página ya enseña el nombre) */
  titulo?: string;
  subtitulo?: string;
  /** Solo para restaurantes de la base de datos (alimenta la memoria colectiva). */
  onConfirmar?: () => Promise<{ veces_elegido: number }>;
}) {
  const [i, setI] = useState(0);
  const [confirmacion, setConfirmacion] = useState<"idle" | "enviando" | { veces: number } | "error">("idle");
  const c = auditoria.comensales[i] ?? auditoria.comensales[0];
  const info = new Map(platos.map((p) => [p.id, p]));
  const color = auditoria.encaje_pct >= 100 ? "bg-verde" : auditoria.encaje_pct >= 50 ? "bg-amarillo" : "bg-rojo";

  const confirmar = async () => {
    if (!onConfirmar) return;
    setConfirmacion("enviando");
    try {
      const r = await onConfirmar();
      setConfirmacion({ veces: r.veces_elegido });
    } catch {
      setConfirmacion("error");
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${onConfirmar ? "pb-28" : "pb-8"}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {titulo && <h2 className="text-2xl font-bold leading-tight">{titulo}</h2>}
          {subtitulo && <p className="mt-1 text-sm text-muted">{subtitulo}</p>}
          {!titulo && auditoria.comensales.length > 1 && <p className="text-sm text-muted">Encaje de la mesa</p>}
        </div>
        {auditoria.comensales.length > 1 && (
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-white ${color}`} title="100 % = todos tienen un principal apto; quien solo puede tomar entrantes o postres cuenta la mitad">
            {auditoria.encaje_pct}%
          </span>
        )}
      </header>

      {/* Selector por comensal (fijo arriba al hacer scroll) */}
      {auditoria.comensales.length > 1 && (
        <div className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur">
          {auditoria.comensales.map((x, j) => (
            <button key={x.nombre} onClick={() => setI(j)} aria-pressed={j === i}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${j === i ? "border-foreground bg-foreground text-white" : "border-line bg-card"}`}>
              {x.cubierto ? "" : "⚠️ "}{x.nombre}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-muted">
        {c.restricciones.length ? c.restricciones.map((r) => ETIQUETAS[r]).join(" · ") : "Sin restricciones"}
        {" — "}
        <strong className="text-foreground">{c.verdes.length + c.amarillos.length}</strong> de {platos.length} platos posibles
        {!c.cubierto && <span className="text-amarillo"> · ningún principal apto</span>}
      </p>

      <Bloque titulo="Aptos tal cual" punto="bg-verde" vacio="Ningún plato apto tal cual.">
        {[...c.verdes].sort(porCategoria).map((v) => <Fila key={v.plato_id} v={v} plato={info.get(v.plato_id)} />)}
      </Bloque>

      <Bloque titulo="Aptos con modificación" punto="bg-amarillo" vacio="Ninguno.">
        {[...c.amarillos].sort(porCategoria).map((v) => (
          <Fila key={v.plato_id} v={v} plato={info.get(v.plato_id)}>
            {v.instruccion && <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm">💬 {v.instruccion}</p>}
          </Fila>
        ))}
      </Bloque>

      {c.rojos.length > 0 && (
        <details className="rounded-2xl border border-line bg-card">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-rojo" aria-hidden /> No recomendados ({c.rojos.length})
          </summary>
          <ul className="flex flex-col divide-y divide-line border-t border-line">
            {[...c.rojos].sort(porCategoria).map((v) => (
              <Fila key={v.plato_id} v={v} plato={info.get(v.plato_id)} conMotivo />
            ))}
          </ul>
        </details>
      )}

      <p className="text-xs text-muted">
        🤖 = valorado por la IA porque la carta no lo dejaba claro. Con alergias graves, confirmad siempre con el personal.
      </p>

      {onConfirmar && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto max-w-md md:max-w-2xl">
            {typeof confirmacion === "object" ? (
              <p className="rounded-2xl bg-green-50 py-3 text-center text-sm">
                ✅ <strong>¡Elección registrada!</strong> Ya la han elegido {confirmacion.veces} {confirmacion.veces === 1 ? "grupo" : "grupos"} como el vuestro.
              </p>
            ) : (
              <button onClick={confirmar} disabled={confirmacion === "enviando"}
                className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white disabled:opacity-60">
                {confirmacion === "enviando" ? "Guardando…" : confirmacion === "error" ? "No se pudo guardar · Reintentar" : "Confirmar elección de este sitio"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Bloque({ titulo, punto, vacio, children }: { titulo: string; punto: string; vacio: string; children: React.ReactNode[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card">
      <h3 className="flex items-center gap-2 px-4 py-3 font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full ${punto}`} aria-hidden /> {titulo} ({children.length})
      </h3>
      {children.length ? (
        <ul className="flex flex-col divide-y divide-line border-t border-line">{children}</ul>
      ) : (
        <p className="border-t border-line px-4 py-3 text-sm text-muted">{vacio}</p>
      )}
    </section>
  );
}

function Fila({ v, plato, conMotivo, children }: { v: Veredicto; plato?: Plato; conMotivo?: boolean; children?: React.ReactNode }) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 font-medium">
          {v.plato} {v.fuente === "ia" && <span title="Valorado por la IA" className="text-xs">🤖</span>}
        </p>
        {plato?.precio != null && <span className="shrink-0 text-sm text-muted">{plato.precio.toFixed(2).replace(".", ",")} €</span>}
      </div>
      <p className="text-xs uppercase tracking-wide text-muted">{v.categoria}</p>
      {plato?.descripcion && <p className="mt-1 text-sm text-muted">{plato.descripcion}</p>}
      {conMotivo && v.motivo && <p className="mt-1 text-sm text-rojo">{v.motivo}</p>}
      {v.ingredientes_inferidos && (
        <p className="mt-1 text-xs text-muted">Ingredientes supuestos: {v.ingredientes_inferidos.join(", ")}</p>
      )}
      {children}
    </li>
  );
}
