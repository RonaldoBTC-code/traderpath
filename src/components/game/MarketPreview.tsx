"use client";

import { useState } from "react";
import { marketOptions } from "@/lib/content/level2";
import { useGameStore } from "@/store/gameStore";

interface Props {
  onComplete: (score: number) => void;
}

export default function MarketPreview({ onComplete }: Props) {
  const [visitedMarkets, setVisitedMarkets] = useState<Set<string>>(new Set());
  const [currentMarket, setCurrentMarket] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { setMarketSpecialization } = useGameStore();

  const allVisited = visitedMarkets.size === marketOptions.length;

  const handleVisit = (marketId: string) => {
    setCurrentMarket(marketId);
    const updated = new Set(visitedMarkets);
    updated.add(marketId);
    setVisitedMarkets(updated);
  };

  const handleConfirm = () => {
    if (!selectedSpecialization) return;
    setMarketSpecialization(selectedSpecialization);
    setConfirmed(true);
    onComplete(100);
  };

  const market = currentMarket ? marketOptions.find((m) => m.id === currentMarket) : null;

  if (confirmed) {
    return (
      <div className="text-center space-y-3">
        <div className="text-3xl">🌍</div>
        <p className="font-display font-bold text-tp-gold">Especialización elegida</p>
        <p className="text-tp-text-muted text-sm">Tu ruta ahora es: <span className="text-tp-text font-semibold">{marketOptions.find((m) => m.id === selectedSpecialization)?.name}</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>{visitedMarkets.size} de {marketOptions.length} mercados visitados</span>
        {allVisited && <span className="text-tp-demand text-xs">✓ Todos visitados</span>}
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-gold transition-all" style={{ width: `${(visitedMarkets.size / marketOptions.length) * 100}%` }} />
      </div>

      {/* Market grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {marketOptions.map((m) => {
          const visited = visitedMarkets.has(m.id);
          const isActive = currentMarket === m.id;
          return (
            <button key={m.id} onClick={() => handleVisit(m.id)}
              className={`px-3 py-3 rounded-sm border text-center transition ${
                isActive ? "border-tp-gold bg-tp-gold/10" :
                visited ? "border-tp-demand/30 bg-tp-demand/5" :
                "border-tp-border bg-tp-base hover:border-tp-gold/50"
              }`}>
              <span className="text-lg">{m.icon}</span>
              <p className="text-[10px] font-medium mt-1 truncate">{m.name}</p>
              {visited && <span className="text-[8px] text-tp-demand">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Market detail */}
      {market && (
        <div className="bg-tp-base border border-tp-border rounded-sm p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{market.icon}</span>
            <div>
              <p className="font-display font-bold text-sm">{market.name}</p>
              <p className="text-[10px] text-tp-text-muted italic">{market.tagline}</p>
            </div>
          </div>
          <p className="text-xs text-tp-text-muted">{market.description}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div><p className="text-tp-text-muted">Volatilidad</p><p className="text-tp-text font-medium">{market.volatility}</p></div>
            <div><p className="text-tp-text-muted">Liquidez</p><p className="text-tp-text font-medium">{market.liquidez}</p></div>
            <div><p className="text-tp-text-muted">Dificultad</p><p className="text-tp-text font-medium">{market.curvaAprendizaje}</p></div>
          </div>
          <p className="text-[10px] text-tp-text-muted">Horario: {market.horario}</p>
          <p className="text-[10px] text-tp-gold">{market.rasgoDistintivo}</p>
        </div>
      )}

      {/* Selection (only after all visited) */}
      {allVisited && !confirmed && (
        <div className="bg-tp-surface border border-tp-gold/30 rounded-sm p-4 space-y-3">
          <p className="font-display font-bold text-sm text-tp-gold">🎯 Elige tu Especialización</p>
          <p className="text-xs text-tp-text-muted">Esta decisión define tu ruta. Podrás cambiarla una sola vez.</p>
          <div className="grid grid-cols-2 gap-2">
            {marketOptions.map((m) => (
              <button key={m.id} onClick={() => setSelectedSpecialization(m.id)}
                className={`px-2 py-2 rounded-sm border text-xs transition ${
                  selectedSpecialization === m.id ? "border-tp-gold bg-tp-gold/10 text-tp-gold" : "border-tp-border bg-tp-base text-tp-text-muted hover:border-tp-gold/50"
                }`}>
                {m.icon} {m.name}
              </button>
            ))}
          </div>
          {selectedSpecialization && (
            <button onClick={handleConfirm}
              className="w-full px-4 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
              Confirmar: {marketOptions.find((m) => m.id === selectedSpecialization)?.name}
            </button>
          )}
        </div>
      )}

      {!allVisited && (
        <p className="text-xs text-tp-warning text-center">⚠️ Visita los {marketOptions.length - visitedMarkets.size} mercados restantes para poder elegir.</p>
      )}
    </div>
  );
}
