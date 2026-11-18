"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emojiCocina, PRECIO, UBICACION } from "@/lib/mesa";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Restaurante } from "@/lib/supabase/types";
import type { PuntoMapa } from "./Mapa";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-2xl bg-line md:h-[26rem]" />,
});

type Fila = Pick<Restaurante, "id" | "nombre" | "tipo_cocina" | "rango_precio" | "direccion" | "latitud" | "longitud">;

/** Inicio: restaurantes alrededor de Sol en el mapa; cada pin abre su carta semáforo. */
export function MapaInicio() {
  const router = useRouter();
  const [lista, setLista] = useState<(Fila & { km: number })[]>();

  useEffect(() => {
    supabaseBrowser
      .from("restaurantes")
      .select("id, nombre, tipo_cocina, rango_precio, direccion, latitud, longitud")
      .then(({ data }) => {
        const [la, lo] = UBICACION.coords;
        setLista(
          ((data ?? []) as Fila[])
            .map((r) => ({ ...r, km: Math.hypot((r.latitud - la) * 111, (r.longitud - lo) * 85) }))
            .sort((a, b) => a.km - b.km),
        );
      });
  }, []);

  const puntos: PuntoMapa[] = (lista ?? []).map((r) => ({
    id: r.id,
    nombre: r.nombre,
    latitud: r.latitud,
    longitud: r.longitud,
    precio: PRECIO[r.rango_precio],
    etiqueta: `${emojiCocina(r.tipo_cocina)} ${PRECIO[r.rango_precio]}`,
    subtitulo: `${emojiCocina(r.tipo_cocina)} Cocina ${r.tipo_cocina}`,
    direccion: r.direccion.replace(/, Madrid$/, ""),
    distanciaKm: r.km,
  }));

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Restaurantes cerca de {UBICACION.nombre.replace("Puerta del ", "")}</h2>
          <p className="text-sm text-muted">Pulsa un pin para ver su carta completa.</p>
        </div>
        {lista && <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{lista.length} locales</span>}
      </div>

      {lista ? (
        <Mapa
          puntos={puntos}
          yo={UBICACION.coords}
          nombreYo={UBICACION.nombre}
          onSeleccionar={(id) => router.push(`/restaurante/${id}`)}
          textoAccion="📋 Ver su carta →"
          alto="h-80 md:h-[26rem]"
        />
      ) : (
        <div className="h-80 animate-pulse rounded-2xl bg-line md:h-[26rem]" />
      )}

      {/* Los mismos restaurantes en carrusel, por si se prefiere no usar el mapa */}
      {lista && (
        <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {lista.map((r) => (
            <Link key={r.id} href={`/restaurante/${r.id}`}
              className="flex shrink-0 snap-start items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-2 pr-3 text-sm transition hover:border-brand">
              <span aria-hidden>{emojiCocina(r.tipo_cocina)}</span>
              <span className="font-medium">{r.nombre}</span>
              <span className="text-muted">{r.km.toFixed(1).replace(".", ",")} km</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
