"use client";

import { useMemo } from "react";
import { BookOpenCheck, MousePointerClick } from "lucide-react";
import TradingChart, {
  type ChartGuideLine,
  type ChartPriceLevel,
  type ChartStructureLabel,
  type ChartZone,
} from "@/components/simulator/TradingChart";
import {
  generateEducationalCandles,
  MISSION_CHARTS,
  type ChartAnalysisPreset,
} from "@/lib/game/missionCharts";
import type { MarketCandle } from "@/types/simulator";

interface ChartIdentification {
  levels: ChartPriceLevel[];
  zones: ChartZone[];
  labels: ChartStructureLabel[];
  guideLines: ChartGuideLine[];
  evidence: string;
}

export default function MissionMarketChart({ missionId }: { missionId: string }) {
  const config = MISSION_CHARTS[missionId];
  const candles = useMemo(
    () => config ? generateEducationalCandles(config.pattern, missionId.length + missionId.charCodeAt(missionId.length - 1)) : [],
    [config, missionId]
  );
  const identification = useMemo(
    () => config ? createChartIdentification(candles, config.analysis) : emptyIdentification(),
    [candles, config]
  );

  if (!config || config.hidden) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-tp-info/25 bg-tp-surface shadow-[0_18px_50px_rgba(0,0,0,.2)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tp-border px-4 py-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Escenario técnico explicado</p>
          <h3 className="mt-0.5 font-display text-sm font-bold">{config.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-tp-gold/20 bg-tp-gold/5 px-2.5 py-1 text-[9px] text-tp-gold sm:flex">
            <MousePointerClick size={12} /> Dibujo activado
          </span>
          <div className="text-right">
            <p className="font-data text-xs text-tp-text">{config.symbol}</p>
            <p className="font-data text-[9px] text-tp-text-muted">{config.timeframe}</p>
          </div>
        </div>
      </div>

      <TradingChart
        key={missionId}
        candles={candles}
        height={320}
        ariaLabel={`Ejemplo técnico identificado: ${config.title}`}
        priceLevels={identification.levels}
        zones={identification.zones}
        structureLabels={identification.labels}
        guideLines={identification.guideLines}
      />

      <div className="space-y-2 border-t border-tp-border px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-xs leading-relaxed text-tp-text-muted">
            <span className="font-semibold text-tp-info">Qué observar:</span> {config.teachingPoint}
          </p>
          <p className="flex items-center gap-1.5 text-[10px] text-tp-text-muted">
            <BookOpenCheck size={13} className="text-tp-gold" />
            Marca tu análisis antes de responder
          </p>
        </div>
        <p className="rounded-lg border border-white/[0.06] bg-tp-base/50 px-3 py-2 text-[10px] leading-relaxed text-tp-text-muted">
          <span className="font-semibold text-tp-gold">Evidencia del gráfico:</span> {identification.evidence}
        </p>
      </div>
    </section>
  );
}

function createChartIdentification(candles: MarketCandle[], preset: ChartAnalysisPreset): ChartIdentification {
  if (candles.length === 0) return emptyIdentification();

  const stats = getStats(candles);
  const range = stats.maximum - stats.minimum;
  const anchor = (position: number) => Math.round((position / 17) * (candles.length - 1));
  const candle = (position: number) => candles[anchor(position)];
  const zone = (price: number, width = 0.045) => ({
    from: price - range * width,
    to: price + range * width,
  });
  const extremes = (): ChartPriceLevel[] => [
    { price: stats.maximum, title: "Máximo observado", color: "#60A5FA" },
    { price: stats.minimum, title: "Mínimo observado", color: "#60A5FA" },
  ];

  if (preset === "ohlc") {
    const index = largestBodyIndex(candles);
    const selected = candles[index];
    return {
      levels: [
        { price: selected.high, title: "Máximo (H)", color: "#60A5FA" },
        { price: selected.open, title: "Apertura (O)", color: "#F0C040" },
        { price: selected.close, title: "Cierre (C)", color: "#22C55E" },
        { price: selected.low, title: "Mínimo (L)", color: "#60A5FA" },
      ],
      zones: [],
      labels: [{ candleIndex: index, price: selected.high, text: "Vela seleccionada", tone: "gold" }],
      guideLines: [],
      evidence: "Los cuatro precios pertenecen a la misma vela. Las mechas alcanzan H y L; el cuerpo une O con C.",
    };
  }

  if (preset === "trend") {
    const resistanceTouches = [candle(13), candle(15), candle(17)];
    const resistanceBase = Math.min(...resistanceTouches.map((item) => item.close)) - range * 0.018;
    const resistanceTop = Math.max(...resistanceTouches.map((item) => item.high)) + range * 0.01;
    const currentSupport = zone(candle(16).low + range * 0.018, 0.035);
    return {
      levels: extremes(),
      zones: [
        { from: resistanceBase, to: resistanceTop, label: "Resistencia: 3 rechazos", color: "supply" },
        { ...currentSupport, label: "Soporte estructural (HL)", color: "demand" },
      ],
      labels: [
        { candleIndex: anchor(5), price: candle(5).high, text: "HH 1", tone: "info" },
        { candleIndex: anchor(6), price: candle(6).low, text: "HL 1", tone: "demand" },
        { candleIndex: anchor(9), price: candle(9).high, text: "HH 2", tone: "info" },
        { candleIndex: anchor(10), price: candle(10).low, text: "HL 2", tone: "demand" },
        { candleIndex: anchor(13), price: candle(13).high, text: "1.er rechazo", tone: "supply" },
        { candleIndex: anchor(15), price: candle(15).high, text: "2.º rechazo", tone: "supply" },
      ],
      guideLines: [{
        startIndex: anchor(4),
        startPrice: candle(4).low,
        endIndex: anchor(16),
        endPrice: candle(16).low,
        label: "Directriz alcista",
        tone: "demand",
      }],
      evidence: "Los mínimos HL 1 y HL 2 suben y sostienen la directriz. La franja roja sí es resistencia porque el precio la rechazó tres veces sin cerrar por encima.",
    };
  }

  if (preset === "range" || preset === "orders") {
    const support = percentile(candles.map((item) => item.low), 0.18);
    const resistance = percentile(candles.map((item) => item.high), 0.82);
    const equilibrium = (support + resistance) / 2;
    return {
      levels: [
        { price: equilibrium, title: "Equilibrio 50%", color: "#F0C040" },
        ...extremes(),
      ],
      zones: [
        { ...zone(support, 0.045), label: preset === "orders" ? "Buy Limit / soporte" : "Soporte: varios rebotes", color: "demand" },
        { ...zone(resistance, 0.045), label: preset === "orders" ? "Sell Limit / resistencia" : "Resistencia: varios rechazos", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(5), price: candle(5).high, text: "Rechazo", tone: "supply" },
        { candleIndex: anchor(10), price: candle(10).low, text: "Rebote", tone: "demand" },
        { candleIndex: anchor(16), price: candle(16).close, text: preset === "orders" ? "Precio actual" : "Sin ventaja", tone: "gold" },
      ],
      guideLines: [],
      evidence: preset === "orders"
        ? "Las órdenes pendientes se asocian con zonas defendidas; ejecutar en el centro del rango ofrece peor relación riesgo/beneficio."
        : "Soporte y resistencia se justifican por repeticiones, no por una sola vela. El centro del rango es equilibrio, no una señal.",
    };
  }

  if (preset === "breakout-retest" || preset === "integrated") {
    const brokenResistance = (candle(9).high + candle(11).high) / 2;
    const retest = zone(brokenResistance, 0.035);
    const invalidation = retest.from - range * 0.07;
    return {
      levels: [
        { price: brokenResistance, title: "Nivel roto", color: "#F0C040" },
        ...(preset === "integrated" ? [{ price: invalidation, title: "Invalidación", color: "#EF4444" }] : []),
        ...extremes(),
      ],
      zones: [{ ...retest, label: "Resistencia → soporte", color: "demand" }],
      labels: [
        { candleIndex: anchor(11), price: candle(11).high, text: "Resistencia", tone: "supply" },
        { candleIndex: anchor(12), price: candle(12).high, text: "BOS", tone: "info" },
        { candleIndex: anchor(14), price: candle(14).low, text: "Retesteo", tone: "demand" },
        { candleIndex: anchor(17), price: candle(17).high, text: "Continuación", tone: "gold" },
      ],
      guideLines: [],
      evidence: "El nivel primero detuvo avances, luego fue superado con cierre y finalmente defendido desde arriba. Esa secuencia valida el cambio de función.",
    };
  }

  if (preset === "risk" || preset === "multi-timeframe") {
    const demandPrice = candle(11).low + range * 0.035;
    const demand = zone(demandPrice, 0.04);
    const entry = candle(14).high;
    const invalidation = demand.from - range * 0.045;
    return {
      levels: [
        { price: entry, title: preset === "risk" ? "Entrada tras confirmación" : "Confirmación 1H", color: "#F0C040" },
        { price: invalidation, title: "Invalidación / Stop", color: "#EF4444" },
        { price: stats.maximum, title: "Objetivo estructural", color: "#22C55E" },
      ],
      zones: [{ ...demand, label: preset === "risk" ? "Demanda defendida" : "Zona mayor 4H", color: "demand" }],
      labels: [
        { candleIndex: anchor(11), price: candle(11).low, text: "Barrido", tone: "supply" },
        { candleIndex: anchor(13), price: candle(13).low, text: "HL", tone: "demand" },
        { candleIndex: anchor(14), price: candle(14).high, text: "CHoCH", tone: "info" },
      ],
      guideLines: [],
      evidence: "La entrada llega después del cambio de estructura. El stop queda detrás de la demanda; si se pierde, la hipótesis deja de ser válida.",
    };
  }

  if (preset === "institutional-zones" || preset === "candle-context") {
    const demand = zone(candle(11).low + range * 0.025, 0.045);
    const supply = zone(candle(2).high - range * 0.02, 0.04);
    return {
      levels: extremes(),
      zones: [
        { ...demand, label: preset === "candle-context" ? "Soporte previo" : "Origen del impulso", color: "demand" },
        { ...supply, label: "Oferta pendiente", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(11), price: candle(11).low, text: preset === "candle-context" ? "Mecha de rechazo" : "Base", tone: "gold" },
        { candleIndex: anchor(14), price: candle(14).high, text: "Salida impulsiva", tone: "info" },
      ],
      guideLines: [],
      evidence: preset === "candle-context"
        ? "La vela de rechazo importa porque su mecha atraviesa soporte y el cierre recupera la zona; aislada no sería una señal suficiente."
        : "La zona se dibuja sobre la base previa al desplazamiento. El movimiento impulsivo posterior aporta la evidencia del desequilibrio.",
    };
  }

  if (preset === "supply-demand") {
    const lower = zone(percentile(candles.map((item) => item.low), 0.2), 0.05);
    const upper = zone(percentile(candles.map((item) => item.high), 0.83), 0.05);
    return {
      levels: extremes(),
      zones: [
        { ...lower, label: "Demanda: compradores", color: "demand" },
        { ...upper, label: "Oferta: vendedores", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(6), price: candle(6).low, text: "Escasez / rebote", tone: "demand" },
        { candleIndex: anchor(13), price: candle(13).high, text: "Más oferta", tone: "supply" },
      ],
      guideLines: [],
      evidence: "Las zonas aparecen donde el precio reaccionó más de una vez. La demanda frena caídas y la oferta frena avances.",
    };
  }

  if (preset === "market-cycle") {
    return {
      levels: extremes(),
      zones: [
        { ...zone(candle(3).close, 0.055), label: "Acumulación", color: "demand" },
        { ...zone(candle(13).close, 0.055), label: "Distribución", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(3), price: candle(3).low, text: "Acumulación", tone: "demand" },
        { candleIndex: anchor(9), price: candle(9).high, text: "Expansión", tone: "info" },
        { candleIndex: anchor(13), price: candle(13).high, text: "Distribución", tone: "supply" },
        { candleIndex: anchor(17), price: candle(17).low, text: "Capitulación", tone: "gold" },
      ],
      guideLines: [],
      evidence: "Las fases se reconocen por comportamiento: compresión, expansión, pérdida de continuidad y caída acelerada.",
    };
  }

  if (preset === "dominance") {
    const resistance = zone(percentile(candles.map((item) => item.high), 0.88), 0.04);
    return {
      levels: extremes(),
      zones: [{ ...resistance, label: "Techo de dominancia", color: "supply" }],
      labels: [
        { candleIndex: anchor(6), price: candle(6).low, text: "BTC gana cuota", tone: "demand" },
        { candleIndex: anchor(13), price: candle(13).high, text: "Riesgo de rotación", tone: "supply" },
      ],
      guideLines: [{
        startIndex: anchor(4),
        startPrice: candle(4).low,
        endIndex: anchor(16),
        endPrice: candle(16).low,
        label: "Estructura BTC.D",
        tone: "demand",
      }],
      evidence: "La dominancia conserva mínimos ascendentes, pero llega a un techo probado. Una ruptura o un rechazo producen lecturas distintas.",
    };
  }

  // Volatility and 24/7 presets intentionally focus on amplitude rather than directional labels.
  return {
    levels: extremes(),
    zones: [],
    labels: [
      { candleIndex: anchor(3), price: candle(3).high, text: "Expansión", tone: "supply" },
      { candleIndex: anchor(7), price: candle(7).close, text: "Compresión", tone: "info" },
      { candleIndex: anchor(13), price: candle(13).high, text: preset === "always-open" ? "Impulso 24/7" : "Alta volatilidad", tone: "gold" },
    ],
    guideLines: [],
    evidence: "La distancia entre máximo y mínimo cambia de forma irregular. A mayor amplitud, el mismo stop monetario exige menor tamaño de posición.",
  };
}

function getStats(candles: MarketCandle[]) {
  let minimum = candles[0].low;
  let maximum = candles[0].high;
  for (const candle of candles) {
    minimum = Math.min(minimum, candle.low);
    maximum = Math.max(maximum, candle.high);
  }
  return { minimum, maximum };
}

function percentile(values: number[], value: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.round((sorted.length - 1) * value)];
}

function largestBodyIndex(candles: MarketCandle[]) {
  let result = 0;
  let largest = 0;
  for (let index = 0; index < candles.length; index += 1) {
    const size = Math.abs(candles[index].close - candles[index].open);
    if (size > largest) {
      result = index;
      largest = size;
    }
  }
  return result;
}

function emptyIdentification(): ChartIdentification {
  return { levels: [], zones: [], labels: [], guideLines: [], evidence: "" };
}
