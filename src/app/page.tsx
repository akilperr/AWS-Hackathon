import Link from "next/link";
import { MapaInicio } from "@/components/MapaInicio";
import { MesaReciente } from "@/components/MesaReciente";
import { ComoFuncionaBoton, Pasos } from "@/components/ComoFunciona";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-4 md:max-w-6xl md:gap-6 md:py-7">
      {/* Cabecera */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-5 py-6 text-white shadow-lg md:px-10 md:py-7">
        <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 select-none text-[9rem] leading-none opacity-15 md:text-[10rem]">🍽️</div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">Agent Locally</p>
        <h1 className="mt-1.5 max-w-xl text-[1.7rem] font-bold leading-tight md:mt-1 md:max-w-none md:text-[2.6rem]">¿Qué puede comer cada uno de vosotros?</h1>
        <p className="mt-2 max-w-lg text-[15px] text-orange-50 md:max-w-none md:text-lg">
          Tu asistente para comer fuera con alergias, dietas o embarazo, solo o en grupo. Plato a plato.
        </p>
        <div className="mt-4 flex flex-nowrap gap-1.5 whitespace-nowrap text-xs md:gap-2 md:text-base">
          <span className="rounded-full bg-white/95 px-2.5 py-1 font-medium text-green-700 md:px-3">🟢 Apto</span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 font-medium text-amber-700 md:px-3">
            🟡 <span className="md:hidden">Con cambios</span><span className="hidden md:inline">Pidiendo cambios</span>
          </span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 font-medium text-red-700 md:px-3">
            🔴 <span className="md:hidden">Evitar</span><span className="hidden md:inline">Mejor evitar</span>
          </span>
        </div>
        <div className="md:hidden">
          <ComoFuncionaBoton />
        </div>
      </section>

      {/* grid-cols-1 = minmax(0,1fr): en móvil la columna no se estira con el carrusel */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-7">
        {/* Modos */}
        <div className="flex min-w-0 flex-col gap-3 md:gap-3.5">
          <Link href="/buscar" className="group flex items-center gap-4 rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md p-4 md:px-5 md:py-[18px]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-2xl md:h-14 md:w-14 md:text-3xl" aria-hidden>🔎</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold md:text-lg">Buscar restaurante</span>
              <span className="block text-sm text-muted md:text-[15px]">Antes de ir: el agente encuentra dónde podéis comer todos.</span>
            </span>
            <span className="text-xl text-brand transition group-hover:translate-x-1" aria-hidden>→</span>
          </Link>

          <Link href="/en-mesa" className="group flex items-center gap-4 rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md p-4 md:px-5 md:py-[18px]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl md:h-14 md:w-14 md:text-3xl" aria-hidden>🍽️</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold md:text-lg">Estoy en el restaurante</span>
              <span className="block text-sm text-muted md:text-[15px]">Busca el local o haz una foto a la carta y filtradla al momento.</span>
            </span>
            <span className="text-xl text-brand transition group-hover:translate-x-1" aria-hidden>→</span>
          </Link>

          <MesaReciente />

          {/* Cómo funciona (en ordenador va en esta columna) */}
          <section className="hidden rounded-2xl border border-line bg-card p-5 md:block">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Cómo funciona</h2>
            <Pasos compacto />
          </section>
        </div>

        {/* Mapa */}
        <MapaInicio />
      </div>


      <footer className="pb-4 text-center text-xs text-muted md:pb-0">
        Demo · Seminario &amp; Hackathon de Agentes de IA en AWS · UC3M
      </footer>
    </main>
  );
}
