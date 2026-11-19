"use client";

import { useEffect, useState } from "react";

const PASOS = [
  { n: "1", titulo: "Dinos quién come", texto: "Un perfil por comensal: celiaquía, embarazo, veganos, alergias…" },
  { n: "2", titulo: "Revisamos la carta", texto: "Plato a plato e ingrediente a ingrediente, también los ocultos." },
  { n: "3", titulo: "Pedid sin miedo", texto: "Qué puede pedir cada uno y qué decir al camarero: «sin chorizo»." },
];

/** Los 3 pasos de "Cómo funciona". */
export function Pasos({ compacto = false }: { compacto?: boolean }) {
  return (
    <ol className={`flex flex-col ${compacto ? "gap-3" : "gap-4"}`}>
      {PASOS.map((p) => (
        <li key={p.n} className="flex gap-3">
          <span className={`flex shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-white ${compacto ? "h-7 w-7 text-sm" : "h-8 w-8 text-sm"}`}>{p.n}</span>
          <span>
            <span className={`block font-semibold ${compacto ? "text-[15px]" : ""}`}>{p.titulo}</span>
            <span className={`block text-muted ${compacto ? "text-[13px]" : "text-sm"}`}>{p.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Móvil: botón en la cabecera que abre "Cómo funciona" en una hoja inferior. */
export function ComoFuncionaBoton() {
  const [abierto, setAbierto] = useState(false);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
      >
        <span aria-hidden>▶</span> ¿Cómo funciona?
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-como-funciona"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-background px-5 pt-5 text-foreground shadow-2xl"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" aria-hidden />
            <h2 id="titulo-como-funciona" className="mb-4 text-lg font-bold">¿Cómo funciona?</h2>
            <Pasos />
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">🟢 Apto tal cual</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">🟡 Pidiendo cambios</span>
              <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">🔴 Mejor evitar</span>
            </div>
            <button onClick={() => setAbierto(false)} className="mt-5 w-full rounded-2xl bg-brand py-3 font-semibold text-white">
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
