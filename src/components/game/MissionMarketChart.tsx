"use client";

import { useMemo } from "react";
import TradingChart from "@/components/simulator/TradingChart";
import { generateEducationalCandles, MISSION_CHARTS } from "@/lib/game/missionCharts";

export default function MissionMarketChart({ missionId }: { missionId: string }) {
  const config = MISSION_CHARTS[missionId];
  const candles = useMemo(
    () => config ? generateEducationalCandles(config.pattern, missionId.length + missionId.charCodeAt(missionId.length - 1)) : [],
    [config, missionId]
  );

  if (!config) return null;

  return (
    <section className="overflow-hidden rounded-md border border-tp-info/25 bg-tp-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tp-border px-4 py-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Ejemplo visual · escenario educativo</p>
          <h3 className="mt-0.5 font-display text-sm font-bold">{config.title}</h3>
        </div>
        <div className="text-right">
          <p className="font-data text-xs text-tp-text">{config.symbol}</p>
          <p className="font-data text-[9px] text-tp-text-muted">{config.timeframe}</p>
        </div>
      </div>
      <TradingChart candles={candles} height={250} ariaLabel={`Ejemplo gráfico: ${config.title}`} />
      <div className="border-t border-tp-border px-4 py-3">
        <p className="text-xs text-tp-text-muted"><span className="font-semibold text-tp-info">Qué observar:</span> {config.teachingPoint}</p>
      </div>
    </section>
  );
}
