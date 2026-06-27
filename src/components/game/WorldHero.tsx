import Link from "next/link";
import { ArrowRight, Compass, Flag, MapPin } from "lucide-react";

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
    <section className="group relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:min-h-[420px]">
      <div
        className="absolute inset-0 bg-cover bg-[66%_center] transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
        style={{ backgroundImage: "url('/assets/traderpath-world-hero.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07101d] via-[#07101d]/80 to-[#07101d]/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07101d]/90 via-transparent to-[#07101d]/10" />
      <div className="absolute right-5 top-5 hidden items-center gap-2 rounded-full border border-white/15 bg-[#07101d]/45 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md sm:flex">
        <Compass size={14} className="text-tp-gold" />
        7 distritos por descubrir
      </div>

      <div className="relative flex min-h-[380px] max-w-2xl flex-col justify-between p-6 sm:min-h-[420px] sm:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">
            <MapPin size={13} className="text-tp-demand" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">Mundo financiero en exploración</span>
          </div>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-white sm:text-5xl">{levelTitle}</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">{tagline}</p>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[220px] flex-1 rounded-2xl border border-white/12 bg-[#07101d]/55 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
              <span className="flex items-center gap-2"><Flag size={12} /> Ruta completada</span>
              <span className="font-data text-tp-gold">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-tp-crypto via-tp-gold to-[#ffe38a] shadow-[0_0_18px_rgba(240,192,64,.45)] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/60">{completed} de {total} misiones superadas</p>
          </div>
          {currentMissionId && (
            <Link
              href={`/mission/${currentMissionId}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-tp-gold px-5 py-4 font-display text-sm font-bold text-tp-base shadow-[0_12px_34px_rgba(240,192,64,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Continuar aventura <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
