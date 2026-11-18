"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { AgenteMessage } from "@/lib/agente/tipos";
import { emojiCocina, mesaAPrompt, resumenMesa, UBICACION, type Mesa } from "@/lib/mesa";
import type { PuntoMapa } from "./Mapa";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
  loading: () => <div className="h-[60vh] animate-pulse rounded-2xl bg-line" />,
});

type Parte = AgenteMessage["parts"][number];
type Salida<T extends Parte["type"]> = Extract<Parte, { type: T; state: "output-available" }>["output"];
type Candidato = NonNullable<Salida<"tool-buscar_candidatos">["candidatos"]>[number];
type Auditoria = Required<Omit<Salida<"tool-auditar_carta_grupo">, "error">>;
type Experiencia = NonNullable<NonNullable<Salida<"tool-consultar_experiencia_previa">["resultados"]>[number]>;

/** Pantalla 3 del diseño: resultados (lista + mapa) con el agente trabajando en vivo. */
export function Resultados({ mesa, onEditar }: { mesa: Mesa; onEditar: () => void }) {
  const { messages, sendMessage, status, error, regenerate, stop } = useChat<AgenteMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [vista, setVista] = useState<"lista" | "mapa">("lista");
  const [texto, setTexto] = useState("");
  const [destacado, setDestacado] = useState<string>();
  const [enfoque, setEnfoque] = useState<string>();
  const enviado = useRef(false);

  // Lanzar la búsqueda una sola vez.
  // En desarrollo, React (StrictMode) monta → desmonta → vuelve a montar, y al
  // desmontar useChat CANCELA la petición en curso. Por eso el envío se programa
  // con un setTimeout que la limpieza anula: solo sale el del montaje definitivo.
  useEffect(() => {
    if (enviado.current) return;
    const t = setTimeout(() => {
      enviado.current = true;
      sendMessage({ text: mesaAPrompt(mesa) });
    }, 0);
    return () => clearTimeout(t);
  }, [mesa, sendMessage]);

  // Datos de las herramientas en toda la conversación (la última versión gana)
  const datos = useMemo(() => {
    const candidatos = new Map<string, Candidato>();
    const auditorias = new Map<string, Auditoria>();
    const experiencia = new Map<string, Experiencia>();
    let registro: { veces: number } | undefined;
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "tool-buscar_candidatos" && p.state === "output-available")
          p.output.candidatos?.forEach((c) => candidatos.set(c.id, c));
        if (p.type === "tool-auditar_carta_grupo" && p.state === "output-available" && p.output.restaurante_id)
          auditorias.set(p.output.restaurante_id, p.output as Auditoria);
        if (p.type === "tool-consultar_experiencia_previa" && p.state === "output-available")
          p.output.resultados?.forEach((r) => r && (!experiencia.has(r.restaurante_id) || r.coincidencia === "exacta") && experiencia.set(r.restaurante_id, r));
        if (p.type === "tool-registrar_feedback_eleccion" && p.state === "output-available" && "veces_elegido" in p.output)
          registro = { veces: p.output.veces_elegido };
      }
    }
    return { candidatos, auditorias, experiencia, registro };
  }, [messages]);

  const trabajando = status === "submitted" || status === "streaming";
  const asistente = messages.filter((m) => m.role === "assistant");
  const primeraRespuesta = asistente[0];
  const seguimiento = primeraRespuesta ? messages.slice(messages.indexOf(primeraRespuesta) + 1) : [];

  // Respuesta del agente: resumen + una nota por restaurante (formato "### Nombre")
  const respuesta = useMemo(() => parsearRespuesta(textoDe(primeraRespuesta)), [primeraRespuesta]);

  const distancia = (c?: Candidato) => (c ? haversine(UBICACION.coords, [c.latitud, c.longitud]) : undefined);

  // Orden: el que propone el agente; si aún no ha escrito, por encaje y memoria colectiva
  const ranking = [...datos.auditorias.values()].sort((a, b) => {
    const ia = respuesta.orden.indexOf(norm(a.restaurante ?? ""));
    const ib = respuesta.orden.indexOf(norm(b.restaurante ?? ""));
    if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return (
      b.encaje_pct - a.encaje_pct ||
      (datos.experiencia.get(b.restaurante_id)?.veces_elegido ?? 0) - (datos.experiencia.get(a.restaurante_id)?.veces_elegido ?? 0)
    );
  });

  // Cuando el agente ya ha escrito su recomendación, separamos lo que recomienda
  // de lo que ha revisado y descartado (p.ej. el italiano que pedisteis, al 0 %).
  const hayRecomendacion = respuesta.orden.length > 0;
  const recomendados = hayRecomendacion ? ranking.filter((a) => respuesta.orden.includes(norm(a.restaurante ?? ""))) : ranking;
  const descartados = hayRecomendacion ? ranking.filter((a) => !respuesta.orden.includes(norm(a.restaurante ?? ""))) : [];

  // Candidatos que el agente no ha auditado, del más cercano al más lejano
  const otros = trabajando
    ? []
    : [...datos.candidatos.values()]
        .filter((c) => !datos.auditorias.has(c.id))
        .sort((a, b) => (distancia(a) ?? 0) - (distancia(b) ?? 0));

  const idsPuntos = [...datos.candidatos.keys()].join() + "|" + [...datos.auditorias.keys()].join();
  const puntos: PuntoMapa[] = useMemo(
    () =>
      [...datos.candidatos.values()].map((c) => ({
        id: c.id, nombre: c.nombre, latitud: c.latitud, longitud: c.longitud, precio: c.precio, direccion: c.direccion,
        encaje: datos.auditorias.get(c.id)?.encaje_pct, distanciaKm: distancia(c),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsPuntos],
  );

  const enviar = (t: string) => {
    if (!t.trim() || trabajando) return;
    sendMessage({ text: t });
    setTexto("");
  };

  /** De la tarjeta al mapa: centra el restaurante y abre su ficha. */
  const verEnMapa = (id: string) => {
    setEnfoque(id);
    setVista("mapa");
    setTimeout(() => document.getElementById("vista-resultados")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  /** Del mapa a la tarjeta. */
  const seleccionar = (id: string) => {
    setDestacado(id);
    setVista("lista");
    setTimeout(() => document.getElementById(`r-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Resumen de la mesa */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm">
        <span className="min-w-0">{resumenMesa(mesa)}</span>
        <button onClick={onEditar} className="shrink-0 font-medium text-brand">Editar</button>
      </div>

      {/* Progreso del agente (se pliega al terminar) */}
      <Progreso mensaje={primeraRespuesta} candidatos={datos.candidatos} trabajando={trabajando && asistente.length <= 1} />

      {!error && !trabajando && !primeraRespuesta && messages.length > 0 && (
        <div className="rounded-2xl border border-line bg-card p-4 text-sm">
          <p className="font-medium">La búsqueda se ha interrumpido.</p>
          <button onClick={() => regenerate()} className="mt-3 rounded-lg bg-brand px-4 py-2 text-white">Volver a buscar</button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rojo/30 bg-red-50 p-4 text-sm">
          <p className="font-medium text-rojo">El agente no ha podido responder.</p>
          <p className="mt-1 text-muted">{error.message.slice(0, 160)}</p>
          <button onClick={() => regenerate()} className="mt-3 rounded-lg bg-rojo px-4 py-2 text-white">Reintentar</button>
        </div>
      )}

      {/* Resumen del agente */}
      {respuesta.resumen && (
        <div className="flex gap-3 rounded-2xl border border-line bg-card p-4">
          <span className="text-xl" aria-hidden>🤖</span>
          <div className="texto-agente min-w-0 [&>p]:my-0">
            <ReactMarkdown>{respuesta.resumen}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Lista / Mapa */}
      {(ranking.length > 0 || datos.candidatos.size > 0) && (
        <section id="vista-resultados" className="flex scroll-mt-4 flex-col gap-3">
          <div className="grid grid-cols-2 rounded-xl border border-line bg-card p-1 text-sm" role="tablist">
            {(["lista", "mapa"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={vista === v} onClick={() => { setVista(v); setEnfoque(undefined); }}
                className={`rounded-lg py-2 font-medium ${vista === v ? "bg-foreground text-white" : "text-muted"}`}>
                {v === "lista" ? "☰ Lista" : "🗺️ Mapa"}
              </button>
            ))}
          </div>

          {vista === "mapa" ? (
            <>
              {enfoque && (
                <button onClick={() => setEnfoque(undefined)} className="self-start text-sm font-medium text-brand">
                  ← Ver todos los restaurantes
                </button>
              )}
              <Mapa key={enfoque ?? "todos"} puntos={puntos} yo={UBICACION.coords} nombreYo={UBICACION.nombre} enfocar={enfoque} onSeleccionar={seleccionar} />
              <p className="text-xs text-muted">📍 Distancias desde {UBICACION.nombre}. Pulsa un pin para ver su información.</p>
            </>
          ) : (
            <>
            {recomendados.map((a) => (
              <Tarjeta
                key={a.restaurante_id}
                auditoria={a}
                candidato={datos.candidatos.get(a.restaurante_id)}
                experiencia={datos.experiencia.get(a.restaurante_id)}
                nota={respuesta.notas.get(norm(a.restaurante ?? ""))}
                distanciaKm={distancia(datos.candidatos.get(a.restaurante_id))}
                destacado={destacado === a.restaurante_id}
                deshabilitado={trabajando}
                onVerMapa={() => verEnMapa(a.restaurante_id)}
                onElegir={() => enviar(`Confirmamos la elección: ${a.restaurante} (restaurante_id ${a.restaurante_id}).`)}
              />
            ))}
            {ranking.length === 0 && trabajando && <p className="text-sm text-muted">Revisando cartas…</p>}

            {/* Revisados pero NO recomendados: plegados y con el motivo */}
            {descartados.length > 0 && (
              <details key={destacado} open={descartados.some((a) => a.restaurante_id === destacado) || undefined} className="rounded-2xl border border-line bg-card">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
                  Revisados y descartados ({descartados.length})
                </summary>
                <ul className="divide-y divide-line border-t border-line">
                  {descartados.map((a) => {
                    const sinOpciones = a.comensales.filter((c) => c.aptos.length + c.con_modificacion.length === 0).map((c) => c.nombre);
                    const sinPrincipal = a.comensales.filter((c) => !c.tiene_principal_apto).map((c) => c.nombre);
                    const motivo = sinOpciones.length
                      ? `Ningún plato apto para ${sinOpciones.join(", ")}`
                      : sinPrincipal.length ? `Sin plato principal apto para ${sinPrincipal.join(", ")}` : "Encaja peor que los recomendados";
                    return (
                      <li key={a.restaurante_id} id={`r-${a.restaurante_id}`} className="flex items-center gap-3 px-4 py-3">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{a.restaurante}</span>
                          <span className="block text-sm text-rojo">{motivo}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-muted">{a.encaje_pct}%</span>
                        <Link href={`/restaurante/${a.restaurante_id}`} className="shrink-0 text-sm font-medium text-brand">Ver carta</Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}

            {/* El resto de restaurantes del presupuesto, sin auditar: se puede abrir su carta igualmente */}
            {otros.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <h3 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
                  {ranking.length ? "Más restaurantes en vuestro presupuesto" : "Restaurantes en vuestro presupuesto"}
                </h3>
                {otros.map((c) => (
                  <div key={c.id} id={`r-${c.id}`}
                    className={`flex items-center gap-3 rounded-2xl border bg-card p-3 ${destacado === c.id ? "border-brand ring-2 ring-brand/30" : "border-line"}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl" aria-hidden>{emojiCocina(c.cocina)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{c.nombre}</span>
                      <span className="block truncate text-sm text-muted">
                        {c.cocina} · {c.precio} · {distancia(c)!.toFixed(1).replace(".", ",")} km de Sol
                      </span>
                    </span>
                    <button onClick={() => verEnMapa(c.id)} className="shrink-0 rounded-lg px-2 py-1.5 text-sm" aria-label={`Ver ${c.nombre} en el mapa`}>📍</button>
                    <Link href={`/restaurante/${c.id}`} className="shrink-0 rounded-lg bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">Ver carta</Link>
                  </div>
                ))}
              </div>
            )}
            </>
          )}
        </section>
      )}

      {respuesta.aviso && <p className="px-1 text-xs text-muted">{respuesta.aviso}</p>}

      {/* Si el agente no siguió el formato, mostramos su texto tal cual */}
      {respuesta.resto && (
        <div className="texto-agente rounded-2xl border border-line bg-card p-4">
          <ReactMarkdown>{respuesta.resto}</ReactMarkdown>
        </div>
      )}

      {datos.registro && (
        <div className="rounded-2xl border border-verde/30 bg-green-50 p-4 text-sm">
          ✅ <strong>Elección registrada.</strong> Ya la han elegido {datos.registro.veces} {datos.registro.veces === 1 ? "grupo" : "grupos"} con vuestro perfil. ¡Esto ayudará a los próximos!
        </div>
      )}

      {/* Conversación de seguimiento */}
      {seguimiento.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2 text-sm text-white">
            {textoDe(m)}
          </div>
        ) : textoDe(m) ? (
          <div key={m.id} className="texto-agente mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-2">
            <ReactMarkdown>{textoDe(m).replace(/^### /gm, "**").replace(/^(\*\*.+)$/gm, "$1**")}</ReactMarkdown>
          </div>
        ) : null,
      )}

      {/* Caja para seguir hablando con el agente */}
      <form
        onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
        className="fixed inset-x-0 bottom-0 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-md gap-2 md:max-w-2xl">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={trabajando ? "El agente está trabajando…" : "Pregunta algo más: ¿y algo más barato?"}
            aria-label="Mensaje para el agente"
            className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-3 text-base"
          />
          {trabajando ? (
            <button type="button" onClick={() => stop()} className="rounded-xl border border-line px-4 text-sm">Parar</button>
          ) : (
            <button type="submit" className="rounded-xl bg-brand px-4 font-semibold text-white disabled:opacity-40" disabled={!texto.trim()}>Enviar</button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progreso del agente
// ---------------------------------------------------------------------------

function Progreso({ mensaje, candidatos, trabajando }: { mensaje?: AgenteMessage; candidatos: Map<string, Candidato>; trabajando: boolean }) {
  const pasos = (mensaje?.parts ?? []).flatMap((p) => {
    if (!p.type.startsWith("tool-")) return [];
    const t = p as Extract<Parte, { type: `tool-${string}` }>;
    const hecho = t.state === "output-available";
    const fallo = t.state === "output-error";
    let etiqueta = "";
    switch (t.type) {
      case "tool-buscar_candidatos":
        etiqueta = hecho && t.output.total !== undefined ? `${t.output.total} restaurantes dentro del presupuesto` : "Buscando restaurantes…";
        break;
      case "tool-consultar_experiencia_previa":
        etiqueta = hecho && t.output.resultados
          ? `Memoria colectiva: ${t.output.resultados.length} ${t.output.resultados.length === 1 ? "coincidencia" : "coincidencias"}`
          : "Consultando qué eligieron grupos parecidos…";
        break;
      case "tool-auditar_carta_grupo": {
        const nombre = t.input ? candidatos.get(t.input.restaurante_id ?? "")?.nombre : undefined;
        etiqueta = hecho && t.output.encaje_pct !== undefined
          ? `Carta de ${t.output.restaurante} revisada · encaje ${t.output.encaje_pct}%`
          : `Revisando plato a plato la carta${nombre ? ` de ${nombre}` : ""}…`;
        break;
      }
      case "tool-registrar_feedback_eleccion":
        etiqueta = hecho ? "Elección guardada en la memoria colectiva" : "Guardando vuestra elección…";
        break;
    }
    return [{ id: t.toolCallId, etiqueta, hecho, fallo }];
  });

  if (!trabajando && pasos.length === 0) return null;

  const lista = (
    <ol className="flex flex-col gap-2 text-sm" aria-live="polite">
      {pasos.map((p) => (
        <li key={p.id} className="flex items-start gap-2">
          <span className="w-5 shrink-0 text-center">{p.fallo ? "❌" : p.hecho ? "✅" : <Spinner />}</span>
          <span className={p.hecho ? "" : "text-muted"}>{p.etiqueta}</span>
        </li>
      ))}
      {trabajando && (pasos.length === 0 || pasos.every((p) => p.hecho)) && (
        <li className="flex items-center gap-2 text-muted">
          <span className="w-5 text-center"><Spinner /></span>
          {pasos.length === 0 ? "El agente está pensando…" : "Preparando la recomendación…"}
        </li>
      )}
    </ol>
  );

  if (trabajando) return <div className="rounded-2xl border border-line bg-card p-4">{lista}</div>;

  const cartas = pasos.filter((p) => p.etiqueta.startsWith("Carta de")).length;
  return (
    <details className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
      <summary className="cursor-pointer text-muted">
        ✅ El agente ha revisado {cartas} {cartas === 1 ? "carta" : "cartas"} plato a plato · ver pasos
      </summary>
      <div className="mt-3">{lista}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de restaurante (recogida por defecto)
// ---------------------------------------------------------------------------

function Tarjeta({ auditoria: a, candidato: c, experiencia: e, nota, distanciaKm, destacado, deshabilitado, onVerMapa, onElegir }: {
  auditoria: Auditoria; candidato?: Candidato; experiencia?: Experiencia; nota?: string; distanciaKm?: number;
  destacado: boolean; deshabilitado: boolean; onVerMapa: () => void; onElegir: () => void;
}) {
  const [abierta, setAbierta] = useState(false);
  const [comensal, setComensal] = useState(0);
  const color = a.encaje_pct >= 100 ? "bg-verde" : a.encaje_pct >= 50 ? "bg-amarillo" : "bg-rojo";
  const p = a.comensales[comensal] ?? a.comensales[0];

  return (
    <article id={`r-${a.restaurante_id}`} className={`overflow-hidden rounded-2xl border bg-card transition ${destacado ? "border-brand ring-2 ring-brand/30" : "border-line"}`}>
      <div className="p-4">
        {/* Pulsar la cabecera lleva al mapa con el restaurante centrado */}
        <button onClick={onVerMapa} className="group flex w-full items-start justify-between gap-3 text-left" aria-label={`Ver ${a.restaurante} en el mapa`}>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight group-hover:text-brand">{a.restaurante}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {[c?.cocina, c?.precio, distanciaKm !== undefined ? `${distanciaKm.toFixed(1).replace(".", ",")} km de Sol` : undefined].filter(Boolean).join(" · ")}
            </p>
            {c?.direccion && (
              <p className="mt-1 text-sm font-medium text-brand">📍 {c.direccion.replace(/, Madrid$/, "")} · Ver en el mapa</p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-white ${color}`} title="100 % = todos tienen un principal apto; quien solo puede tomar entrantes o postres cuenta la mitad">
            {a.encaje_pct}%
          </span>
        </button>

        {(e || c?.patrocinado) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {e && (
              <span className="rounded-full bg-brand-soft px-2 py-1 text-brand">
                ⭐ Elegido por {e.veces_elegido} {e.veces_elegido === 1 ? "grupo" : "grupos"} {e.coincidencia === "exacta" ? "como el vuestro" : "parecidos"}
              </span>
            )}
            {c?.patrocinado && <span className="rounded-full bg-line px-2 py-1 text-muted">Patrocinado</span>}
          </div>
        )}

        {nota && <p className="mt-3 text-sm leading-relaxed">{nota}</p>}

        {/* Resumen por comensal (siempre visible, compacto) */}
        <ul className="mt-3 flex flex-col gap-1.5">
          {a.comensales.map((x) => (
            <li key={x.nombre} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{x.nombre}</span>
              <span className="flex shrink-0 gap-1 text-xs font-medium">
                <Contador n={x.aptos.length} clase="bg-green-50 text-verde" titulo="aptos" />
                <Contador n={x.con_modificacion.length} clase="bg-amber-50 text-amarillo" titulo="con cambios" />
                <Contador n={x.no_recomendados.length} clase="bg-red-50 text-rojo" titulo="a evitar" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setAbierta(!abierta)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between border-t border-line px-4 py-3 text-sm font-medium text-brand"
      >
        {abierta ? "Ocultar platos" : "Ver qué puede pedir cada uno"}
        <span className={`transition ${abierta ? "rotate-180" : ""}`} aria-hidden>▾</span>
      </button>

      {abierta && (
        <div className="border-t border-line bg-background px-4 py-4">
          {a.comensales.length > 1 && (
            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
              {a.comensales.map((x, i) => (
                <button key={x.nombre} onClick={() => setComensal(i)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${i === comensal ? "border-foreground bg-foreground text-white" : "border-line bg-card"}`}>
                  {x.nombre}
                </button>
              ))}
            </div>
          )}

          <Grupo titulo="Puede pedir" color="text-verde" vacio="Ningún plato apto tal cual.">
            {p.aptos.map((x) => <li key={x}>{x}</li>)}
          </Grupo>

          <Grupo titulo="Pidiendo cambios" color="text-amarillo" vacio="Ninguno.">
            {p.con_modificacion.map((m) => (
              <li key={m.plato}>
                {m.plato}
                {m.instruccion && <span className="block text-xs text-muted">💬 {m.instruccion}</span>}
              </li>
            ))}
          </Grupo>

          {p.no_recomendados.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-sm font-semibold text-rojo">Mejor evitar ({p.no_recomendados.length})</summary>
              <ul className="mt-2 flex flex-col gap-1.5 pl-1 text-sm">
                {p.no_recomendados.map((r) => (
                  <li key={r.plato}>
                    {r.plato}
                    <span className="block text-xs text-muted">{r.motivo}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <Link href={`/restaurante/${a.restaurante_id}`} className="flex w-full items-center justify-between border-t border-line px-4 py-3 text-sm font-medium">
        🚦 Abrir carta semáforo completa
        <span aria-hidden>→</span>
      </Link>

      <div className="border-t border-line p-3">
        <button onClick={onElegir} disabled={deshabilitado} className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          Elegimos este sitio
        </button>
      </div>
    </article>
  );
}

function Contador({ n, clase, titulo }: { n: number; clase: string; titulo: string }) {
  return <span className={`min-w-8 rounded-full px-2 py-0.5 text-center ${clase}`} title={`${n} ${titulo}`}>{n}</span>;
}

function Grupo({ titulo, color, vacio, children }: { titulo: string; color: string; vacio: string; children: React.ReactNode[] }) {
  return (
    <div className="mb-4">
      <h4 className={`mb-1.5 text-sm font-semibold ${color}`}>{titulo}</h4>
      {children.length ? <ul className="flex flex-col gap-1.5 text-sm">{children}</ul> : <p className="text-sm text-muted">{vacio}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const textoDe = (m?: AgenteMessage) => (m?.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join("\n\n").trim();

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[*_#]/g, "").replace(/^\d+[.)]\s*/, "").trim();

/**
 * Separa la respuesta del agente en: resumen (antes del primer "### "),
 * una nota por restaurante y la línea de aviso (⚠️).
 * Si el agente no sigue el formato, todo va a `resto` y se muestra tal cual.
 */
function parsearRespuesta(texto: string) {
  const notas = new Map<string, string>();
  const orden: string[] = [];
  let aviso = "";
  const lineas = texto.split("\n").filter((l) => {
    if (l.trim().startsWith("⚠️")) { aviso = l.trim(); return false; }
    return true;
  });
  const bloques = lineas.join("\n").split(/^###\s+/m);
  const resumen = bloques.shift()?.trim() ?? "";
  for (const b of bloques) {
    const [titulo, ...cuerpo] = b.split("\n");
    const clave = norm(titulo);
    orden.push(clave);
    notas.set(clave, cuerpo.join(" ").replace(/\s+/g, " ").trim());
  }
  // Sin bloques "###": el agente no siguió el formato → mostrarlo completo
  if (bloques.length === 0 && resumen.length > 300) return { resumen: "", notas, orden, aviso, resto: resumen };
  return { resumen, notas, orden, aviso, resto: "" };
}

const Spinner = () => <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand align-middle" aria-hidden />;

function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
