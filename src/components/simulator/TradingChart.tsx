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
} from "lucide-react";
import type { CandlestickData, IChartApi, ISeriesApi, Time } from "lightweight-charts";
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
}

export interface ChartGuideLine {
  startIndex: number;
  startPrice: number;
  endIndex: number;
  endPrice: number;
  label: string;
  tone?: "demand" | "supply" | "info" | "gold";
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
}

type Point = { x: number; y: number };
type DrawingTool = "cursor" | "pencil" | "trendline" | "horizontal" | "zone" | "label";
type Drawing =
  | { id: number; type: "pencil"; points: Point[] }
  | { id: number; type: "trendline"; start: Point; end: Point }
  | { id: number; type: "horizontal"; start: Point; end: Point }
  | { id: number; type: "zone"; start: Point; end: Point }
  | { id: number; type: "label"; start: Point; text: string };

const VIEWBOX = 1000;
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
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const initialCandlesRef = useRef(candles);
  const initialHeightRef = useRef(height);
  const initialPriceLevelsRef = useRef(priceLevels);
  const pointerStartRef = useRef<Point | null>(null);
  const drawingIdRef = useRef(1);
  const [tool, setTool] = useState<DrawingTool>("cursor");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [draft, setDraft] = useState<Drawing | null>(null);
  const [labelText, setLabelText] = useState(LABEL_OPTIONS[0]);

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

  const priceRange = getPriceRange(candles);

  function pointFromEvent(event: React.PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * VIEWBOX),
      y: clamp(((event.clientY - rect.top) / rect.height) * VIEWBOX),
    };
  }

  function beginDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (tool === "cursor") return;
    const start = pointFromEvent(event);
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
    if (tool === "horizontal") setDraft({ id, type: "horizontal", start, end: { x: VIEWBOX, y: start.y } });
    if (tool === "zone") setDraft({ id, type: "zone", start, end: start });
  }

  function continueDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (!pointerStartRef.current || !draft) return;
    const point = pointFromEvent(event);
    setDraft((current) => {
      if (!current) return null;
      if (current.type === "pencil") return { ...current, points: [...current.points, point] };
      if (current.type === "horizontal") return { ...current, end: { x: VIEWBOX, y: current.start.y } };
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
          <span className="ml-auto hidden text-[9px] text-tp-text-muted sm:block">
            {tool === "cursor" ? "Explora el gráfico" : "Dibuja directamente sobre las velas"}
          </span>
        </div>
      )}

      <div className="relative">
        <div ref={containerRef} style={{ height }} className="w-full overflow-hidden" aria-label={ariaLabel} />

        {zones.map((zone) => {
          const top = priceToPercent(zone.to, priceRange);
          const bottom = priceToPercent(zone.from, priceRange);
          return (
            <div
              key={`${zone.label}-${zone.from}`}
              className={`pointer-events-none absolute left-[7%] right-[9%] border ${
                zone.color === "demand"
                  ? "border-tp-demand/45 bg-tp-demand/10 text-tp-demand"
                  : "border-tp-supply/45 bg-tp-supply/10 text-tp-supply"
              }`}
              style={{ top: `${top}%`, height: `${Math.max(4, bottom - top)}%` }}
            >
              <span className="absolute right-1 top-1 rounded bg-tp-base/80 px-1.5 py-0.5 font-data text-[8px] uppercase tracking-wider">{zone.label}</span>
            </div>
          );
        })}

        {structureLabels.map((label) => (
          <span
            key={`${label.text}-${label.candleIndex}`}
            className={`pointer-events-none absolute z-10 rounded border bg-tp-base/85 px-1.5 py-0.5 font-data text-[8px] font-semibold ${
              label.tone === "demand" ? "border-tp-demand/40 text-tp-demand"
                : label.tone === "supply" ? "border-tp-supply/40 text-tp-supply"
                  : label.tone === "gold" ? "border-tp-gold/40 text-tp-gold"
                    : "border-tp-info/40 text-tp-info"
            }`}
            style={{
              left: `${candleIndexToPercent(label.candleIndex, candles.length)}%`,
              top: `${priceToPercent(label.price, priceRange)}%`,
            }}
          >
            {label.text}
          </span>
        ))}

        {guideLines.length > 0 && (
          <svg
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            aria-hidden="true"
          >
            {guideLines.map((line) => {
              const color = toneColor(line.tone);
              const x1 = candleIndexToPercent(line.startIndex, candles.length) * 10;
              const y1 = priceToPercent(line.startPrice, priceRange) * 10;
              const x2 = candleIndexToPercent(line.endIndex, candles.length) * 10;
              const y2 = priceToPercent(line.endPrice, priceRange) * 10;
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
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            preserveAspectRatio="none"
            className={`absolute inset-0 z-20 h-full w-full touch-none ${tool === "cursor" ? "pointer-events-none" : "cursor-crosshair"}`}
            onPointerDown={beginDrawing}
            onPointerMove={continueDrawing}
            onPointerUp={finishDrawing}
            onPointerCancel={finishDrawing}
            aria-label="Capa de dibujo técnico"
          >
            {allDrawings.map((drawing) => <DrawingShape key={drawing.id} drawing={drawing} />)}
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

function DrawingShape({ drawing }: { drawing: Drawing }) {
  const common = { stroke: "#F0C040", strokeWidth: 4, vectorEffect: "non-scaling-stroke" as const };
  if (drawing.type === "pencil") {
    return <polyline points={drawing.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" strokeLinecap="round" strokeLinejoin="round" {...common} />;
  }
  if (drawing.type === "trendline") {
    return <line x1={drawing.start.x} y1={drawing.start.y} x2={drawing.end.x} y2={drawing.end.y} strokeLinecap="round" {...common} />;
  }
  if (drawing.type === "horizontal") {
    return <line x1={0} y1={drawing.start.y} x2={VIEWBOX} y2={drawing.start.y} strokeDasharray="8 6" {...common} />;
  }
  if (drawing.type === "zone") {
    const x = Math.min(drawing.start.x, drawing.end.x);
    const y = Math.min(drawing.start.y, drawing.end.y);
    return (
      <rect
        x={x}
        y={y}
        width={Math.abs(drawing.end.x - drawing.start.x)}
        height={Math.abs(drawing.end.y - drawing.start.y)}
        fill="rgba(240,192,64,0.12)"
        stroke="#F0C040"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    );
  }
  return (
    <g>
      <rect x={drawing.start.x} y={drawing.start.y - 34} width={drawing.text.length * 15 + 30} height={38} rx={8} fill="#131827" stroke="#F0C040" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <text x={drawing.start.x + 14} y={drawing.start.y - 9} fill="#F0C040" fontSize={24} fontFamily="JetBrains Mono, monospace" fontWeight={600}>{drawing.text}</text>
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

function getPriceRange(candles: MarketCandle[]) {
  if (candles.length === 0) return { min: 0, max: 1 };
  let min = candles[0].low;
  let max = candles[0].high;
  for (const candle of candles) {
    if (candle.low < min) min = candle.low;
    if (candle.high > max) max = candle.high;
  }
  return { min, max };
}

function priceToPercent(price: number, range: { min: number; max: number }) {
  const value = ((range.max - price) / Math.max(0.0001, range.max - range.min)) * 76 + 12;
  return Math.max(12, Math.min(88, value));
}

function candleIndexToPercent(index: number, count: number) {
  return 2 + (Math.max(0, Math.min(count - 1, index)) / Math.max(1, count - 1)) * 86;
}

function toneColor(tone: ChartGuideLine["tone"]) {
  if (tone === "demand") return "#22C55E";
  if (tone === "supply") return "#EF4444";
  if (tone === "gold") return "#F0C040";
  return "#60A5FA";
}

function clamp(value: number) {
  return Math.max(0, Math.min(VIEWBOX, value));
}
