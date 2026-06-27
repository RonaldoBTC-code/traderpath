import Link from "next/link";

interface Props {
  levelTitle: string;
  tagline: string;
  currentMissionId?: string;
  completed: number;
  total: number;
}

export default function WorldHero({ levelTitle, tagline, currentMissionId, completed, total }: Props) {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="relative min-h-[310px] overflow-hidden rounded-lg border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div
        className="absolute inset-0 bg-cover bg-[62%_center] transition-transform duration-700 hover:scale-[1.015]"
        style={{ backgroundImage: "url('/assets/traderpath-world-hero.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07101d] via-[#07101d]/88 to-[#07101d]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07101d]/80 via-transparent to-transparent" />

      <div className="relative flex min-h-[310px] max-w-xl flex-col justify-between p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-tp-demand shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">Mundo financiero en exploración</span>
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{levelTitle}</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/72">{tagline}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <div className="min-w-[210px] flex-1 rounded-md border border-white/12 bg-black/35 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
              <span>Ruta completada</span>
              <span className="font-data text-tp-gold">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-tp-crypto to-tp-gold" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/60">{completed} de {total} misiones superadas</p>
          </div>
          {currentMissionId && (
            <Link
              href={`/mission/${currentMissionId}`}
              className="rounded-sm bg-tp-gold px-5 py-3 font-display text-sm font-bold text-tp-base shadow-[0_10px_30px_rgba(240,192,64,0.24)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Continuar aventura →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
