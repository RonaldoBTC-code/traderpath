"use client";

import { useEffect, useRef, useState } from "react";
import {
  Minus,
  TrendingUp,
  MousePointer2,
  Pencil,
  Undo2,
  BoxSelect,
  Tag,
  Trash2,
  RotateCcw,
} from "lucide-react";
import type {
  CandlestickData,
  Coordinate,
  IChartApi,
  ISeriesApi,
  Logical,
  Time,
} from "lightweight-charts";
import type { MarketCandle } from "@/types/simulator";

export interface ChartPriceLevel {
  price: number;
  title: string;
  color: string;
}

export interface ChartZone {
  from: number;
  to: number;
  label: string;
  color: "demand" | "supply";
}

export interface ChartStructureLabel {
  candleIndex: number;
  price: number;
  text: string;
  tone?: "demand" | "supply" | "info" | "gold";
  offsetX?: number;
  offsetY?: number;
}

export interface ChartGuideLine {
  startIndex: number;
  startPrice: number;
  endIndex: number;
  endPrice: number;
  label: string;
  tone?: "demand" | "supply" | "info" | "gold";
}

export interface ChartVisibleRange {
  from: number;
  to: number;
}

interface Props {
  candles: MarketCandle[];
  height?: number;
  ariaLabel?: string;
  drawingEnabled?: boolean;
  priceLevels?: ChartPriceLevel[];
  zones?: ChartZone[];
  structureLabels?: ChartStructureLabel[];
  guideLines?: ChartGuideLine[];
  visibleRange?: ChartVisibleRange;
}

type ChartPoint = { logical: number; price: number };
type DrawingTool = "cursor" | "pencil" | "trendline" | "horizontal" | "zone" | "label";
type Drawing =
  | { id: number; type: "pencil"; points: ChartPoint[] }
  | { id: number; type: "trendline"; start: ChartPoint; end: ChartPoint }
  | { id: number; type: "horizontal"; start: ChartPoint; end: ChartPoint }
  | { id: number; type: "zone"; start: ChartPoint; end: ChartPoint }
  | { id: number; type: "label"; start: ChartPoint; text: string };

const LABEL_OPTIONS = ["Soporte", "Resistencia", "BOS", "CHoCH", "Swing High", "Swing Low"];

export default function TradingChart({
  candles,
  height = 390,
  ariaLabel = "Gráfico de velas del simulador",
  drawingEnabled = true,
  priceLevels = [],
  zones = [],
  structureLabels = [],
  guideLines = [],
  visibleRange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const initialCandlesRef = useRef(candles);
  const initialHeightRef = useRef(height);
  const initialPriceLevelsRef = useRef(priceLevels);
  const initialVisibleRangeRef = useRef(visibleRange);
  const pointerStartRef = useRef<ChartPoint | null>(null);
  const drawingIdRef = useRef(1);
  const renderFrameRef = useRef<number | null>(null);
  const [tool, setTool] = useState<DrawingTool>("cursor");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [draft, setDraft] = useState<Drawing | null>(null);
  const [labelText, setLabelText] = useState(LABEL_OPTIONS[0]);
  const [overlaySize, setOverlaySize] = useState({ width: 1, height });
  const [, setOverlayRevision] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let observer: ResizeObserver | null = null;

    const initialize = async () => {
      const { createChart, ColorType, CrosshairMode, LineStyle } = await import("lightweight-charts");
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
        rightPriceScale: { borderColor: "#1E2D45", scaleMargins: { top: 0.12, bottom: 0.12 } },
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
      initialPriceLevelsRef.current.forEach((level) => {
        series.createPriceLine({
          price: level.price,
          color: level.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: level.title,
        });
      });
      if (initialVisibleRangeRef.current) {
        chart.timeScale().setVisibleLogicalRange(initialVisibleRangeRef.current);
      } else {
        chart.timeScale().fitContent();
      }

      const refreshOverlay = () => setOverlayRevision((revision) => revision + 1);
      chart.timeScale().subscribeVisibleLogicalRangeChange(refreshOverlay);
      chart.timeScale().subscribeSizeChange(refreshOverlay);

      observer = new ResizeObserver(([entry]) => {
        chart.applyOptions({ width: entry.contentRect.width });
        setOverlaySize({ width: entry.contentRect.width, height: initialHeightRef.current });
        refreshOverlay();
      });
      observer.observe(containerRef.current);
      setOverlaySize({ width: containerRef.current.clientWidth, height: initialHeightRef.current });
      refreshOverlay();

      return () => {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(refreshOverlay);
        chart.timeScale().unsubscribeSizeChange(refreshOverlay);
      };
    };

    let unsubscribeChartEvents: (() => void) | undefined;
    void initialize().then((unsubscribe) => {
      unsubscribeChartEvents = unsubscribe;
    });
    return () => {
      disposed = true;
      unsubscribeChartEvents?.();
      observer?.disconnect();
      if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    seriesRef.current.setData(toChartData(candles));
  }, [candles]);

  function scheduleOverlayRender() {
    if (renderFrameRef.current !== null) return;
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      setOverlayRevision((revision) => revision + 1);
    });
  }

  function pointFromEvent(event: React.PointerEvent<SVGSVGElement>): ChartPoint | null {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const logical = chart.timeScale().coordinateToLogical(x as Coordinate);
    const price = series.coordinateToPrice(y as Coordinate);
    if (logical === null || price === null) return null;
    return { logical, price };
  }

  function beginDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (tool === "cursor") return;
    const start = pointFromEvent(event);
    if (!start) return;
    const id = drawingIdRef.current++;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStartRef.current = start;

    if (tool === "label") {
      setDrawings((current) => [...current, { id, type: "label", start, text: labelText }]);
      pointerStartRef.current = null;
      return;
    }
    if (tool === "pencil") setDraft({ id, type: "pencil", points: [start] });
    if (tool === "trendline") setDraft({ id, type: "trendline", start, end: start });
    if (tool === "horizontal") setDraft({ id, type: "horizontal", start, end: start });
    if (tool === "zone") setDraft({ id, type: "zone", start, end: start });
  }

  function continueDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (!pointerStartRef.current || !draft) return;
    const point = pointFromEvent(event);
    if (!point) return;
    setDraft((current) => {
      if (!current) return null;
      if (current.type === "pencil") return { ...current, points: [...current.points, point] };
      if (current.type === "horizontal") return { ...current, end: { logical: point.logical, price: current.start.price } };
      return { ...current, end: point };
    });
  }

  function finishDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (!pointerStartRef.current || !draft) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrawings((current) => [...current, draft]);
    setDraft(null);
    pointerStartRef.current = null;
  }

  const allDrawings = draft ? [...drawings, draft] : drawings;
  const chartToPixel = (point: ChartPoint) => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return null;
    const x = chart.timeScale().logicalToCoordinate(point.logical as Logical);
    const y = series.priceToCoordinate(point.price);
    if (x === null || y === null) return null;
    return { x, y };
  };
  const priceToPixel = (price: number) => {
    const coordinate = seriesRef.current?.priceToCoordinate(price);
    return coordinate === null || coordinate === undefined ? null : coordinate;
  };
  const logicalToPixel = (logical: number) => {
    const coordinate = chartRef.current?.timeScale().logicalToCoordinate(logical as Logical);
    return coordinate === null || coordinate === undefined ? null : coordinate;
  };

  const resetView = () => {
    if (!chartRef.current) return;
    if (visibleRange) chartRef.current.timeScale().setVisibleLogicalRange(visibleRange);
    else chartRef.current.timeScale().fitContent();
    chartRef.current.priceScale("right").applyOptions({ autoScale: true });
    scheduleOverlayRender();
  };

  return (
    <div className="border-y border-tp-border/70 bg-tp-base">
      {drawingEnabled && (
        <div className="flex flex-wrap items-center gap-1 border-b border-tp-border bg-[#0d1220] px-2 py-2" aria-label="Herramientas de dibujo">
          <ToolButton active={tool === "cursor"} label="Navegar" onClick={() => setTool("cursor")}><MousePointer2 size={15} /></ToolButton>
          <ToolButton active={tool === "pencil"} label="Dibujo libre" onClick={() => setTool("pencil")}><Pencil size={15} /></ToolButton>
          <ToolButton active={tool === "trendline"} label="Línea de tendencia" onClick={() => setTool("trendline")}><TrendingUp size={15} /></ToolButton>
          <ToolButton active={tool === "horizontal"} label="Nivel horizontal" onClick={() => setTool("horizontal")}><Minus size={16} /></ToolButton>
          <ToolButton active={tool === "zone"} label="Zona" onClick={() => setTool("zone")}><BoxSelect size={15} /></ToolButton>
          <ToolButton active={tool === "label"} label="Etiqueta" onClick={() => setTool("label")}><Tag size={15} /></ToolButton>
          <select
            value={labelText}
            onChange={(event) => setLabelText(event.target.value)}
            aria-label="Texto de la etiqueta"
            className="ml-1 rounded-lg border border-tp-border bg-tp-surface px-2 py-1.5 text-[10px] text-tp-text outline-none focus:border-tp-gold"
          >
            {LABEL_OPTIONS.map((label) => <option key={label}>{label}</option>)}
          </select>
          <span className="mx-1 h-5 w-px bg-tp-border" />
          <ToolButton active={false} disabled={drawings.length === 0} label="Deshacer" onClick={() => setDrawings((current) => current.slice(0, -1))}><Undo2 size={15} /></ToolButton>
          <ToolButton active={false} disabled={drawings.length === 0} label="Limpiar dibujos" onClick={() => setDrawings([])}><Trash2 size={15} /></ToolButton>
          <ToolButton active={false} label="Restablecer vista" onClick={resetView}><RotateCcw size={15} /></ToolButton>
          <span className="ml-auto hidden text-[9px] text-tp-text-muted sm:block">
            {tool === "cursor" ? "Explora el gráfico" : "Dibuja directamente sobre las velas"}
          </span>
        </div>
      )}

      <div
        className="relative overflow-hidden"
        onPointerMoveCapture={scheduleOverlayRender}
        onWheelCapture={scheduleOverlayRender}
      >
        <div ref={containerRef} style={{ height }} className="w-full overflow-hidden" aria-label={ariaLabel} />

        {zones.map((zone) => {
          const top = priceToPixel(zone.to);
          const bottom = priceToPixel(zone.from);
          if (top === null || bottom === null) return null;
          return (
            <div
              key={`${zone.label}-${zone.from}`}
              className={`pointer-events-none absolute left-0 z-10 border ${
                zone.color === "demand"
                  ? "border-tp-demand/70 bg-tp-demand/[0.22] text-tp-demand"
                  : "border-tp-supply/70 bg-tp-supply/[0.22] text-tp-supply"
              }`}
              style={{ top, width: Math.max(0, overlaySize.width - 70), height: Math.max(8, bottom - top) }}
            >
              <span className="absolute left-1 top-1 rounded bg-tp-base/90 px-1.5 py-0.5 font-data text-[8px] uppercase tracking-wider">{zone.label}</span>
            </div>
          );
        })}

        {structureLabels.map((label) => {
          const left = logicalToPixel(label.candleIndex);
          const top = priceToPixel(label.price);
          if (left === null || top === null || left < -120 || left > overlaySize.width + 120) return null;
          return (
            <span
              key={`${label.text}-${label.candleIndex}`}
              className={`pointer-events-none absolute z-10 whitespace-nowrap rounded border bg-tp-base/90 px-1.5 py-0.5 font-data text-[8px] font-semibold ${
                label.tone === "demand" ? "border-tp-demand/40 text-tp-demand"
                  : label.tone === "supply" ? "border-tp-supply/40 text-tp-supply"
                    : label.tone === "gold" ? "border-tp-gold/40 text-tp-gold"
                      : "border-tp-info/40 text-tp-info"
              }`}
              style={{
                left,
                top,
                transform: `translate(${label.offsetX ?? 0}px, calc(-50% + ${label.offsetY ?? 0}px))`,
              }}
            >
              {label.text}
            </span>
          );
        })}

        {guideLines.length > 0 && (
          <svg
            viewBox={`0 0 ${overlaySize.width} ${overlaySize.height}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            aria-hidden="true"
          >
            {guideLines.map((line) => {
              const color = toneColor(line.tone);
              const x1 = logicalToPixel(line.startIndex);
              const y1 = priceToPixel(line.startPrice);
              const x2 = logicalToPixel(line.endIndex);
              const y2 = priceToPixel(line.endPrice);
              if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
              return (
                <g key={`${line.label}-${line.startIndex}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />
                  <circle cx={x1} cy={y1} r={6} fill={color} />
                  <circle cx={x2} cy={y2} r={6} fill={color} />
                </g>
              );
            })}
          </svg>
        )}

        {drawingEnabled && (
          <svg
            viewBox={`0 0 ${overlaySize.width} ${overlaySize.height}`}
            preserveAspectRatio="none"
            className={`absolute inset-0 z-20 h-full w-full touch-none ${tool === "cursor" ? "pointer-events-none" : "cursor-crosshair"}`}
            onPointerDown={beginDrawing}
            onPointerMove={continueDrawing}
            onPointerUp={finishDrawing}
            onPointerCancel={finishDrawing}
            aria-label="Capa de dibujo técnico"
          >
            {allDrawings.map((drawing) => (
              <DrawingShape
                key={drawing.id}
                drawing={drawing}
                width={overlaySize.width}
                chartToPixel={chartToPixel}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

function ToolButton({
  active,
  disabled = false,
  label,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
        active
          ? "border-tp-gold/60 bg-tp-gold/15 text-tp-gold"
          : "border-transparent text-tp-text-muted hover:border-tp-border hover:bg-tp-surface hover:text-tp-text"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function DrawingShape({
  drawing,
  width,
  chartToPixel,
}: {
  drawing: Drawing;
  width: number;
  chartToPixel: (point: ChartPoint) => { x: number; y: number } | null;
}) {
  const common = { stroke: "#F0C040", strokeWidth: 2, vectorEffect: "non-scaling-stroke" as const };
  if (drawing.type === "pencil") {
    const points = drawing.points.map(chartToPixel).filter((point): point is { x: number; y: number } => point !== null);
    if (points.length < 2) return null;
    return <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" strokeLinecap="round" strokeLinejoin="round" {...common} />;
  }
  if (drawing.type === "trendline") {
    const start = chartToPixel(drawing.start);
    const end = chartToPixel(drawing.end);
    if (!start || !end) return null;
    return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeLinecap="round" {...common} />;
  }
  if (drawing.type === "horizontal") {
    const start = chartToPixel(drawing.start);
    if (!start) return null;
    return <line x1={0} y1={start.y} x2={width} y2={start.y} strokeDasharray="8 6" {...common} />;
  }
  if (drawing.type === "zone") {
    const start = chartToPixel(drawing.start);
    const end = chartToPixel(drawing.end);
    if (!start || !end) return null;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    return (
      <rect
        x={x}
        y={y}
        width={Math.abs(end.x - start.x)}
        height={Math.abs(end.y - start.y)}
        fill="rgba(240,192,64,0.12)"
        stroke="#F0C040"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    );
  }
  const start = chartToPixel(drawing.start);
  if (!start) return null;
  const labelWidth = drawing.text.length * 7 + 22;
  return (
    <g>
      <rect x={start.x} y={start.y - 24} width={labelWidth} height={26} rx={6} fill="#131827" stroke="#F0C040" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <text x={start.x + 10} y={start.y - 7} fill="#F0C040" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600}>{drawing.text}</text>
    </g>
  );
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

function toneColor(tone: ChartGuideLine["tone"]) {
  if (tone === "demand") return "#22C55E";
  if (tone === "supply") return "#EF4444";
  if (tone === "gold") return "#F0C040";
  return "#60A5FA";
}
