import Link from "next/link";
import { MapaInicio } from "@/components/MapaInicio";
import { MesaReciente } from "@/components/MesaReciente";

const PASOS = [
  { n: "1", titulo: "Dinos quién come", texto: "Un perfil por comensal: celiaquía, embarazo, veganos, alergias…" },
  { n: "2", titulo: "Revisamos la carta", texto: "Plato a plato e ingrediente a ingrediente, también los ocultos." },
  { n: "3", titulo: "Pedid sin miedo", texto: "Qué puede pedir cada uno y qué decir al camarero: «sin chorizo»." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-6 md:max-w-5xl md:py-10">
      {/* Cabecera */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-6 py-8 text-white shadow-lg md:px-10 md:py-12">
        <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 select-none text-[9rem] leading-none opacity-15 md:text-[13rem]">🍽️</div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">Agent Locally</p>
        <h1 className="mt-2 max-w-xl text-3xl font-bold leading-tight md:text-5xl">¿Qué puede comer cada uno de vosotros?</h1>
        <p className="mt-3 max-w-lg text-orange-50 md:text-lg">
          Tu asistente para comer fuera con alergias, dietas o embarazo, solo o en grupo. Plato a plato.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/95 px-3 py-1 font-medium text-green-700">🟢 Apto</span>
          <span className="rounded-full bg-white/95 px-3 py-1 font-medium text-amber-700">🟡 Pidiendo cambios</span>
          <span className="rounded-full bg-white/95 px-3 py-1 font-medium text-red-700">🔴 Mejor evitar</span>
        </div>
      </section>

      {/* grid-cols-1 = minmax(0,1fr): en móvil la columna no se estira con el carrusel */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Modos */}
        <div className="flex min-w-0 flex-col gap-4">
          <Link href="/buscar" className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-3xl" aria-hidden>🔎</span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold">Buscar restaurante</span>
              <span className="block text-sm text-muted">Antes de ir: el agente encuentra dónde podéis comer todos.</span>
            </span>
            <span className="text-xl text-brand transition group-hover:translate-x-1" aria-hidden>→</span>
          </Link>

          <Link href="/en-mesa" className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl" aria-hidden>🍽️</span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold">Estoy en el restaurante</span>
              <span className="block text-sm text-muted">Busca el local o haz una foto a la carta y filtradla al momento.</span>
            </span>
            <span className="text-xl text-brand transition group-hover:translate-x-1" aria-hidden>→</span>
          </Link>

          <MesaReciente />

          {/* Cómo funciona (en ordenador va en esta columna) */}
          <section className="hidden rounded-2xl border border-line bg-card p-5 md:block">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Cómo funciona</h2>
            <Pasos />
          </section>
        </div>

        {/* Mapa */}
        <MapaInicio />
      </div>

      {/* Cómo funciona (en móvil va al final) */}
      <section className="md:hidden">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Cómo funciona</h2>
        <Pasos />
      </section>

      <footer className="pb-4 text-center text-xs text-muted">
        Demo · Seminario &amp; Hackathon de Agentes de IA en AWS · UC3M
      </footer>
    </main>
  );
}

function Pasos() {
  return (
    <ol className="flex flex-col gap-4">
      {PASOS.map((p) => (
        <li key={p.n} className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white">{p.n}</span>
          <span>
            <span className="block font-semibold">{p.titulo}</span>
            <span className="block text-sm text-muted">{p.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
