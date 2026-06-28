import Link from "next/link";
import { ArrowRight, Check, Flame, Landmark, Network, Waves } from "lucide-react";
import type { MissionStatus } from "@/store/gameStore";
import { MarketCityScene } from "@/components/game/MarketCityAtlas";

interface Props {
  status: MissionStatus;
}

const DISTRICTS = [
  { name: "Plaza Génesis", detail: "Origen y reglas de Bitcoin", icon: Landmark },
  { name: "Taller de Bloques", detail: "Nodos, mineros y consenso", icon: Network },
  { name: "Paseo de Custodia", detail: "Claves y responsabilidad", icon: Check },
  { name: "Puerto Lightning", detail: "Pagos sobre la capa base", icon: Waves },
];

export default function BitcoinCityMap({ status }: Props) {
  const canEnter = status !== "locked";

  return (
    <section className="overflow-hidden rounded-3xl border border-orange-300/20 bg-[#0b1119] shadow-[0_28px_90px_rgba(247,147,26,0.12)]">
      <div className="grid xl:grid-cols-[1.45fr_0.75fr]">
        <div className="relative p-3 sm:p-4">
          <MarketCityScene marketId="crypto" />
          <div className="pointer-events-none absolute right-8 top-8 hidden rounded-xl border border-orange-200/15 bg-[#120b06]/65 px-3 py-2 backdrop-blur sm:block">
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-orange-200"><Flame size={12} /> Energía volcánica</p>
            <p className="mt-1 text-[9px] text-white/45">Dirección artística inspirada en Conchagua</p>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 bg-[radial-gradient(circle_at_top,rgba(247,147,26,.10),transparent_45%)] p-6 xl:border-l xl:border-t-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tp-crypto">Ciudad obligatoria · ruta cripto</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Comprender Bitcoin antes de operar BTC</h2>
            <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">
              La ciudad circular funciona como tutorial de origen. El volcán, la plaza central y el puerto actúan como hitos visuales; cada distrito enseña una capa del sistema.
            </p>

            <div className="mt-5 space-y-2">
              {DISTRICTS.map(({ name, detail, icon: Icon }, index) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-orange-300/15 bg-orange-400/10 text-orange-300">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-tp-text">{index + 1}. {name}</span>
                    <span className="block truncate text-[9px] text-tp-text-muted">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {canEnter ? (
            <Link href="/mission/m3c_0" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-tp-crypto px-5 py-3 font-display font-bold text-white transition hover:-translate-y-0.5 hover:brightness-110">
              Entrar a Ciudad Bitcoin <ArrowRight size={16} />
            </Link>
          ) : (
            <p className="mt-6 rounded-xl border border-tp-border bg-tp-base px-4 py-3 text-center text-xs text-tp-text-muted">
              Completa el Gran Tour y elige la ruta cripto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
