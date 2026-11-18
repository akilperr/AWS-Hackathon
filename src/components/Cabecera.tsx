import Link from "next/link";

/**
 * Cabecera común de las páginas interiores: mantiene la identidad del inicio
 * (barra con degradado y marca) para que el cambio de página no sea brusco.
 */
export function Cabecera({ titulo, onAtras, hrefAtras = "/" }: { titulo: string; onAtras?: () => void; hrefAtras?: string }) {
  const flecha = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg text-white transition hover:bg-white/30";
  return (
    <header className="-mx-4 -mt-6 mb-2 bg-gradient-to-r from-orange-500 via-orange-600 to-rose-600 px-4 pb-5 pt-5 text-white md:mx-0 md:mt-0 md:rounded-3xl md:px-6">
      <div className="flex items-center gap-3">
        {onAtras ? (
          <button onClick={onAtras} className={flecha} aria-label="Atrás">←</button>
        ) : (
          <Link href={hrefAtras} className={flecha} aria-label="Atrás">←</Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{titulo}</h1>
        <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-widest text-orange-100 md:inline">Agent Locally</span>
        <Link href="/" className={flecha} aria-label="Ir a la página de inicio" title="Inicio">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
