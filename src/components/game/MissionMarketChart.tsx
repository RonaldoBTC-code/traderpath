"use client";

import { useMemo } from "react";
import { BookOpenCheck, MousePointerClick } from "lucide-react";
import TradingChart, {
  type ChartGuideLine,
  type ChartPriceLevel,
  type ChartStructureLabel,
  type ChartVisibleRange,
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
  visibleRange?: ChartVisibleRange;
  evidence: string;
}

export default function MissionMarketChart({ missionId }: { missionId: string }) {
  const config = MISSION_CHARTS[missionId];
  const candles = useMemo(
    () => config
      ? generateMissionCandles(
          config.analysis,
          config.pattern,
          missionId.length + missionId.charCodeAt(missionId.length - 1),
          config.symbol
        )
      : [],
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
        visibleRange={identification.visibleRange}
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
    const bullish = candles[0];
    const bearish = candles[1];
    return {
      levels: [],
      zones: [],
      labels: [
        { candleIndex: 0, price: bullish.high, text: "Máximo (H)", tone: "info", offsetX: -78 },
        { candleIndex: 0, price: bullish.close, text: "Cierre (C)", tone: "demand", offsetX: -72 },
        { candleIndex: 0, price: bullish.open, text: "Apertura (O)", tone: "gold", offsetX: -82 },
        { candleIndex: 0, price: bullish.low, text: "Mínimo (L)", tone: "info", offsetX: -72 },
        { candleIndex: 1, price: bearish.high, text: "Máximo (H)", tone: "info", offsetX: 16 },
        { candleIndex: 1, price: bearish.open, text: "Apertura (O)", tone: "gold", offsetX: 16 },
        { candleIndex: 1, price: bearish.close, text: "Cierre (C)", tone: "supply", offsetX: 16 },
        { candleIndex: 1, price: bearish.low, text: "Mínimo (L)", tone: "info", offsetX: 16 },
      ],
      guideLines: [],
      visibleRange: { from: -0.65, to: 1.65 },
      evidence: "La vela alcista cierra por encima de su apertura; la bajista cierra por debajo. En ambas, las mechas conectan el cuerpo con máximo y mínimo.",
    };
  }

  if (preset === "trend") {
    const resistanceTouches = [candle(13), candle(15), candle(17)];
    const resistanceBase = Math.min(...resistanceTouches.map((item) => item.close)) - range * 0.018;
    const resistanceTop = Math.max(...resistanceTouches.map((item) => item.high)) + range * 0.01;
    const currentSupport = zone(candle(16).low + range * 0.018, 0.035);
    return {
      levels: [
        { price: (resistanceBase + resistanceTop) / 2, title: "Resistencia", color: "#EF4444" },
        { price: (currentSupport.from + currentSupport.to) / 2, title: "Soporte (HL)", color: "#22C55E" },
      ],
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
        { price: resistance, title: "Resistencia", color: "#EF4444" },
        { price: support, title: "Soporte", color: "#22C55E" },
      ],
      zones: [
        { ...zone(support, 0.045), label: preset === "orders" ? "Buy Limit / soporte" : "Soporte: varios rebotes", color: "demand" },
        { ...zone(resistance, 0.045), label: preset === "orders" ? "Sell Limit / resistencia" : "Resistencia: varios rechazos", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(5), price: candle(5).high, text: "Rechazo", tone: "supply" },
        { candleIndex: anchor(10), price: candle(10).low, text: "Rebote", tone: "demand" },
        { candleIndex: anchor(16), price: equilibrium, text: preset === "orders" ? "Precio medio" : "Zona media", tone: "gold" },
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
      levels: [],
      zones: [
        { ...demand, label: preset === "candle-context" ? "Soporte previo" : "Origen del impulso", color: "demand" },
        { ...supply, label: "Oferta pendiente", color: "supply" },
      ],
      labels: [
        { candleIndex: anchor(11), price: candle(11).low, text: preset === "candle-context" ? "Mecha de rechazo" : "Base", tone: "gold" },
        { candleIndex: anchor(14), price: candle(14).high, text: "Salida impulsiva", tone: "info" },
      ],
      guideLines: [],
      visibleRange: preset === "candle-context"
        ? { from: Math.max(0, anchor(8) - 1), to: Math.min(candles.length - 1, anchor(15) + 1) }
        : undefined,
      evidence: preset === "candle-context"
        ? "La vela de rechazo importa porque su mecha atraviesa soporte y el cierre recupera la zona; aislada no sería una señal suficiente."
        : "La zona se dibuja sobre la base previa al desplazamiento. El movimiento impulsivo posterior aporta la evidencia del desequilibrio.",
    };
  }

  if (preset === "supply-demand") {
    const lower = zone(percentile(candles.map((item) => item.low), 0.2), 0.05);
    const upper = zone(percentile(candles.map((item) => item.high), 0.83), 0.05);
    return {
      levels: [],
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
      levels: [],
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
      levels: [],
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

function emptyIdentification(): ChartIdentification {
  return { levels: [], zones: [], labels: [], guideLines: [], evidence: "" };
}

function generateMissionCandles(
  preset: ChartAnalysisPreset,
  pattern: Parameters<typeof generateEducationalCandles>[0],
  seed: number,
  symbol: string
) {
  if (preset === "candle-context") {
    const result = generateEducationalCandles(pattern, seed);
    const pivotIndex = Math.round((11 / 17) * (result.length - 1));
    const previousLow = Math.min(...result.slice(0, pivotIndex).map((candle) => candle.low));
    const low = previousLow - 3.5;
    result[pivotIndex] = {
      ...result[pivotIndex],
      open: roundPrice(low + 7.2),
      high: roundPrice(low + 9.4),
      low: roundPrice(low),
      close: roundPrice(low + 8.5),
      volume: 340,
    };
    if (result[pivotIndex + 1]) {
      result[pivotIndex + 1] = { ...result[pivotIndex + 1], open: result[pivotIndex].close };
    }
    return scaleCandles(result, symbol);
  }

  if (preset !== "ohlc") return scaleCandles(generateEducationalCandles(pattern, seed), symbol);

  const time = 1_700_000_000 + seed * 100_000;
  return scaleCandles([
    { time, open: 92, high: 128, low: 84, close: 118, volume: 240 },
    { time: time + 3_600, open: 120, high: 130, low: 82, close: 94, volume: 260 },
  ], symbol);
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function scaleCandles(candles: MarketCandle[], symbol: string) {
  const factor = symbol === "BTC/USDT" ? 720
    : symbol === "ETH/USDT" ? 28
      : symbol === "SOL/USDT" ? 1.35
        : symbol === "BTC.D" ? 0.48
          : symbol === "MANZANAS/USD" ? 0.018
            : 1;

  if (factor === 1) return candles;
  return candles.map((candle) => ({
    ...candle,
    open: roundPrice(candle.open * factor),
    high: roundPrice(candle.high * factor),
    low: roundPrice(candle.low * factor),
    close: roundPrice(candle.close * factor),
  }));
}
