"use client";

import { useState } from "react";
import { Check, Compass, Map } from "lucide-react";
import { marketOptions } from "@/lib/content/level2";
import { getMarketCity } from "@/lib/game/marketCities";
import { useGameStore } from "@/store/gameStore";
import MarketCityAtlas from "@/components/game/MarketCityAtlas";

interface Props {
  onComplete: (score: number) => void;
}

export default function MarketPreview({ onComplete }: Props) {
  const [visitedMarkets, setVisitedMarkets] = useState<Set<string>>(new Set());
  const [currentMarket, setCurrentMarket] = useState<string>("crypto");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { setMarketSpecialization } = useGameStore();

  const allVisited = visitedMarkets.size === marketOptions.length;
  const market = marketOptions.find((option) => option.id === currentMarket) ?? marketOptions[0];
  const city = getMarketCity(market.id);

  const handleVisit = (marketId: string) => {
    setCurrentMarket(marketId);
    setVisitedMarkets((current) => new Set(current).add(marketId));
  };

  const handleConfirm = () => {
    if (!selectedSpecialization || !allVisited) return;
    setMarketSpecialization(selectedSpecialization);
    setConfirmed(true);
    onComplete(100);
  };

  if (confirmed) {
    const selected = getMarketCity(selectedSpecialization ?? "crypto");
    return (
      <div className="space-y-4 text-center">
        <MarketCityAtlas activeId={selected.id} compact />
        <div>
          <p className="font-display font-bold text-tp-gold">Ruta elegida: {selected.city}</p>
          <p className="mt-1 text-sm text-tp-text-muted">El portal se incorporó a tu mapa. Ahora podrás comenzar esa especialización.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-tp-info"><Compass size={13} /> Atlas de mercados</p>
          <p className="mt-1 text-sm text-tp-text-muted">Visita cada ciudad y reconoce el activo que representa.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data text-sm text-tp-gold">{visitedMarkets.size}/{marketOptions.length}</p>
          <p className="text-[9px] text-tp-text-muted">ciudades</p>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-tp-base">
        <div className="h-full rounded-full bg-gradient-to-r from-tp-info via-tp-gold to-tp-demand transition-all duration-500" style={{ width: `${(visitedMarkets.size / marketOptions.length) * 100}%` }} />
      </div>

      <MarketCityAtlas activeId={market.id} visited={visitedMarkets} onSelect={handleVisit} />

      <section className="rounded-2xl border border-white/[0.07] bg-tp-base/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-bold text-tp-text">{market.name}</p>
            <p className="mt-0.5 text-[10px] text-tp-text-muted">{city.city} · {market.tagline}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 font-data text-[10px]" style={{ color: market.uiColor }}>
            {market.ejemplosActivos.slice(0, 2).join(" · ")}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-tp-text-muted">{market.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric label="Volatilidad" value={market.volatility} />
          <Metric label="Liquidez" value={market.liquidez.replace("_", " ")} />
          <Metric label="Dificultad" value={market.curvaAprendizaje} />
        </div>
        <div className="mt-3 rounded-lg border border-tp-gold/15 bg-tp-gold/5 px-3 py-2 text-[10px] leading-relaxed text-tp-text-muted">
          <span className="font-semibold text-tp-gold">Qué observar:</span> {market.rasgoDistintivo}
        </div>
      </section>

      {allVisited ? (
        <section className="rounded-2xl border border-tp-gold/30 bg-[linear-gradient(135deg,rgba(240,192,64,.10),rgba(19,24,39,.9))] p-4">
          <p className="flex items-center gap-2 font-display text-sm font-bold text-tp-gold"><Map size={15} /> Elige tu primer destino</p>
          <p className="mt-1 text-xs text-tp-text-muted">Esta elección define la próxima ciudad educativa. Podrás cambiarla una vez.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {marketOptions.map((option) => {
              const optionCity = getMarketCity(option.id);
              const selected = selectedSpecialization === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedSpecialization(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${selected ? "border-tp-gold bg-tp-gold/10" : "border-tp-border bg-tp-base hover:border-tp-gold/35"}`}
                >
                  <span className="font-data text-xs font-bold" style={{ color: option.uiColor }}>{optionCity.symbol}</span>
                  <p className="mt-1 truncate text-[10px] font-semibold">{optionCity.city}</p>
                  <p className="truncate text-[8px] text-tp-text-muted">{option.name}</p>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!selectedSpecialization}
            onClick={handleConfirm}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-tp-gold px-4 py-3 font-display text-sm font-bold text-tp-base disabled:opacity-40"
          >
            <Check size={15} /> Confirmar destino
          </button>
        </section>
      ) : (
        <p className="text-center text-xs text-tp-warning">Visita las {marketOptions.length - visitedMarkets.size} ciudades restantes antes de elegir.</p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-tp-surface p-2">
      <p className="text-[8px] uppercase tracking-wider text-tp-text-muted">{label}</p>
      <p className="mt-1 text-[10px] font-semibold capitalize text-tp-text">{value}</p>
    </div>
  );
}
