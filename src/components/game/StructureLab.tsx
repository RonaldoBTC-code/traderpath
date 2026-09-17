"use client";

import { useMemo, useState } from "react";
import {
  ChallengeCard,
  InductionQuestion,
  useImageReady,
  useLabFlow,
  type LabChallenge,
  type LabQuestion,
} from "@/components/game/labKit";

// ── StructureLab ───────────────────────────────────────────────────
// Descubrimiento de la tendencia: un control inclina cada máximo y mínimo
// sucesivo. El jugador ve el gráfico subir/bajar y la etiqueta (Alcista / Bajista
// / Lateral) EMERGE de la estructura — nadie enuncia "HH y HL". El reto le pide
// fabricar una tendencia; al lograrlo induce qué la define.

export interface StructureLabConfig {
  slope: { min: number; max: number; start: number };
  points: number;
  /** Umbral de |trendScore| para etiquetar alcista/bajista. */
  trendThreshold: number;
  challenges: LabChallenge[];
  question: LabQuestion;
  scene?: { alt?: string; backdrop?: { image?: string } };
}

interface Props {
  config: StructureLabConfig;
  onComplete: (score: number) => void;
}

export default function StructureLab({ config, onComplete }: Props) {
  const [slope, setSlope] = useState(config.slope.start);

  const backdropOk = useImageReady(config.scene?.backdrop?.image);
  const backdropImg = config.scene?.backdrop?.image;

  // Precios: zigzag (pico/valle) alrededor de una línea base inclinada por `slope`.
  const prices = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < config.points; i += 1) {
      arr.push(50 + slope * i + (i % 2 === 0 ? 5 : -5));
    }
    return arr;
  }, [slope, config.points]);

  const trendScore = prices[prices.length - 1] - prices[0];
  const flow = useLabFlow(config.challenges, config.question);

  const evalNow = (s: number) => {
    const first = 50 + 0 + 5;
    const last = 50 + s * (config.points - 1) + ((config.points - 1) % 2 === 0 ? 5 : -5);
    flow.evaluate(last - first);
  };

  const change = (v: number) => {
    setSlope(v);
    evalNow(v);
  };
  const reset = () => setSlope(config.slope.start);

  const label =
    trendScore > config.trendThreshold ? "Alcista" : trendScore < -config.trendThreshold ? "Bajista" : "Lateral";
  const labelColor = label === "Alcista" ? "text-tp-demand" : label === "Bajista" ? "text-tp-supply" : "text-tp-text";
  const lineColor = label === "Alcista" ? "#16a34a" : label === "Bajista" ? "#dc2626" : "#5d6e8c";

  // Dibujo del gráfico
  const W = 300;
  const H = 180;
  const pad = 18;
  const y = (price: number) => pad + (1 - (price - 5) / 90) * (H - 2 * pad);
  const x = (i: number) => pad + (i / (config.points - 1)) * (W - 2 * pad);
  const path = prices.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");

  return (
    <div className="space-y-5">
      {/* Escena: el gráfico y la etiqueta que emerge */}
      <div
        role="img"
        aria-label={`Gráfico de tendencia ${label}`}
        className="overflow-hidden rounded-2xl border-2 border-tp-border p-4"
        style={
          backdropOk && backdropImg
            ? { backgroundImage: `url(${backdropImg})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(#eaf4fe, #f1f8ff)" }
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">Estructura del precio</p>
          <p className={`font-display text-lg font-bold transition-colors duration-150 ease-out ${labelColor}`}>{label}</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="presentation">
          <path d={path} fill="none" stroke={lineColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {prices.map((p, i) => (
            <circle key={i} cx={x(i)} cy={y(p)} r="3.5" fill={lineColor} />
          ))}
        </svg>
      </div>

      {/* Control */}
      <div className="rounded-2xl border-2 border-tp-border bg-tp-base p-5">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="s-slope" className="text-sm font-semibold text-tp-text">
            ¿Cada máximo y mínimo, más alto o más bajo que el anterior?
          </label>
          <span className="font-data text-sm text-tp-info">{slope > 0 ? `+${slope}` : slope}</span>
        </div>
        <input
          id="s-slope"
          type="range"
          min={config.slope.min}
          max={config.slope.max}
          value={slope}
          onChange={(e) => change(Number(e.target.value))}
          className="w-full cursor-pointer accent-[#2563eb]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-tp-text-muted">
          <span>más bajos</span>
          <span>igual</span>
          <span>más altos</span>
        </div>
      </div>

      <ChallengeCard flow={flow} onAdvance={() => flow.advance(reset)} formatValue={(n) => `${n > 0 ? "+" : ""}${n}`} />
      <InductionQuestion flow={flow} onFinish={onComplete} />
    </div>
  );
}
