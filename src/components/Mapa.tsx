"use client";

import L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type PuntoMapa = {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  precio: string;
  direccion?: string;
  /** undefined = candidato no auditado */
  encaje?: number;
  distanciaKm?: number;
  /** Texto propio del pin (p.ej. "🍝 €€"); si se da, el pin va en color de marca */
  etiqueta?: string;
  /** Línea extra en la ficha (p.ej. tipo de cocina) */
  subtitulo?: string;
};

const colorEncaje = (e: number) => (e >= 100 ? "var(--verde)" : e >= 50 ? "var(--amarillo)" : "var(--rojo)");

function icono(p: PuntoMapa) {
  if (p.etiqueta) return L.divIcon({ className: "", iconSize: [0, 0], html: `<span class="pin pin-marca">${p.etiqueta}</span>` });
  const auditado = p.encaje !== undefined;
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: auditado
      ? `<span class="pin" style="background:${colorEncaje(p.encaje!)}">${p.encaje}% · ${p.precio}</span>`
      : `<span class="pin pin-gris">${p.precio}</span>`,
  });
}

const iconoYo = L.divIcon({ className: "", iconSize: [0, 0], html: `<span class="pin pin-yo" title="Estás aquí"></span>` });

/** Recalcula el tamaño del mapa cuando cambia el de su contenedor. */
function AjusteTamano({ onCambio }: { onCambio: () => void }) {
  const map = useMap();
  useEffect(() => {
    const creado = Date.now();
    const obs = new ResizeObserver(() => {
      map.invalidateSize();
      // En móvil el contenedor puede cambiar de ancho al cargar la página: si
      // ocurre en los primeros segundos, se vuelve a encuadrar (no después,
      // para no mover el mapa mientras alguien lo usa).
      if (Date.now() - creado < 4000) onCambio();
    });
    obs.observe(map.getContainer());
    return () => obs.disconnect();
  }, [map, onCambio]);
  return null;
}

/** Encuadra todos los puntos, o centra uno concreto y abre su ficha. */
function Encuadre({ puntos, yo, enfocar, marcadores, version }: {
  puntos: PuntoMapa[]; yo?: [number, number]; enfocar?: string; marcadores: React.RefObject<Record<string, L.Marker>>;
  /** Cambia cuando hay que volver a encuadrar (p.ej. el contenedor cambió de tamaño) */
  version: number;
}) {
  const map = useMap();
  useEffect(() => {
    // Por si el contenedor cambió de tamaño tras crear el mapa (animaciones, carga diferida)
    map.invalidateSize();
    const p = enfocar && puntos.find((x) => x.id === enfocar);
    if (p) {
      map.setView([p.latitud, p.longitud], 17);
      setTimeout(() => marcadores.current[p.id]?.openPopup(), 100);
      return;
    }
    const coords: [number, number][] = puntos.map((x) => [x.latitud, x.longitud]);
    if (yo) coords.push(yo);
    if (coords.length) map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
  }, [map, puntos, yo, enfocar, marcadores, version]);
  return null;
}

export default function Mapa({ puntos, yo, nombreYo = "Estás aquí", enfocar, onSeleccionar, textoAccion = "Ver su tarjeta →", alto = "h-[60vh] min-h-80" }: {
  puntos: PuntoMapa[]; yo?: [number, number]; nombreYo?: string; enfocar?: string;
  /** Acción del botón de la ficha de cada pin */
  onSeleccionar?: (id: string) => void; textoAccion?: string;
  /** Clases de altura del mapa */
  alto?: string;
}) {
  const marcadores = useRef<Record<string, L.Marker>>({});
  const [version, setVersion] = useState(0);
  const reencuadrar = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <div className={`${alto} overflow-hidden rounded-2xl border border-line`}>
      <MapContainer center={[40.4168, -3.7038]} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Primero los grises, para que los auditados queden encima */}
        {[...puntos].sort((a, b) => Number(a.encaje !== undefined) - Number(b.encaje !== undefined)).map((p) => (
          <Marker
            key={p.id}
            position={[p.latitud, p.longitud]}
            icon={icono(p)}
            zIndexOffset={p.id === enfocar ? 1000 : 0}
            ref={(m) => { if (m) marcadores.current[p.id] = m; }}
          >
            <Popup>
              <strong>{p.nombre}</strong>
              {p.subtitulo && <><br />{p.subtitulo}</>}
              {p.direccion && <><br />{p.direccion}</>}
              <br />
              {p.encaje !== undefined ? `Encaje ${p.encaje}% · ${p.precio}` : p.precio}
              {p.distanciaKm !== undefined && ` · a ${p.distanciaKm.toFixed(1).replace(".", ",")} km`}
              {onSeleccionar && (
                <>
                  <br />
                  <button onClick={() => onSeleccionar(p.id)} style={{ color: "var(--brand)", fontWeight: 600, marginTop: 4 }}>
                    {textoAccion}
                  </button>
                </>
              )}
            </Popup>
          </Marker>
        ))}
        {yo && (
          <Marker position={yo} icon={iconoYo}>
            <Popup>📍 {nombreYo}</Popup>
          </Marker>
        )}
        <AjusteTamano onCambio={reencuadrar} />
        <Encuadre puntos={puntos} yo={yo} enfocar={enfocar} marcadores={marcadores} version={version} />
      </MapContainer>
    </div>
  );
}
