"use client";

import { useEffect, useRef } from "react";
import type { CandlestickData, IChartApi, ISeriesApi, Time } from "lightweight-charts";
import type { MarketCandle } from "@/types/simulator";

interface Props {
  candles: MarketCandle[];
  height?: number;
  ariaLabel?: string;
}

export default function TradingChart({ candles, height = 390, ariaLabel = "Gráfico de velas del simulador" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const initialCandlesRef = useRef(candles);
  const initialHeightRef = useRef(height);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let observer: ResizeObserver | null = null;

    const initialize = async () => {
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: initialHeightRef.current,
        layout: {
          background: { type: ColorType.Solid, color: "#0A0E1A" },
          textColor: "#8894A8",
          fontFamily: "JetBrains Mono, monospace",
        },
        grid: {
          vertLines: { color: "#131827" },
          horzLines: { color: "#1E2D45" },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: "#1E2D45" },
        timeScale: { borderColor: "#1E2D45", timeVisible: true, secondsVisible: false },
      });

      const series = chart.addCandlestickSeries({
        upColor: "#22C55E",
        downColor: "#EF4444",
        borderUpColor: "#22C55E",
        borderDownColor: "#EF4444",
        wickUpColor: "#22C55E",
        wickDownColor: "#EF4444",
      });

      chartRef.current = chart;
      seriesRef.current = series;
      series.setData(toChartData(initialCandlesRef.current));
      chart.timeScale().fitContent();

      observer = new ResizeObserver(([entry]) => {
        chart.applyOptions({ width: entry.contentRect.width });
      });
      observer.observe(containerRef.current);
    };

    void initialize();
    return () => {
      disposed = true;
      observer?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    seriesRef.current.setData(toChartData(candles));
  }, [candles]);

  return <div ref={containerRef} style={{ height }} className="w-full overflow-hidden rounded-sm" aria-label={ariaLabel} />;
}

function toChartData(candles: MarketCandle[]): CandlestickData<Time>[] {
  return candles.map((candle) => ({
    time: candle.time as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));
}
