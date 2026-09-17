"use client";

import { useMemo, useState } from "react";
import {
  ArtSlot,
  ChallengeCard,
  InductionQuestion,
  LAB_POP,
  useImageReady,
  useLabFlow,
  type LabChallenge,
  type LabQuestion,
} from "@/components/game/labKit";

// ── GaugeLab ───────────────────────────────────────────────────────
// Laboratorio de descubrimiento para "una cantidad contra un umbral": dos
// controles (tamaño de posición y distancia del stop) alimentan un riesgo que se
// ve en vivo en un medidor, con la línea del umbral (2%). El jugador induce qué
// hace subir el riesgo. Escena viva + slots de arte (fondo, moneda) con fallback.

export interface GaugeLabConfig {
  capital: number;
  thresholdPct: number;
  maxScalePct: number;
  units: { min: number; max: number; start: number; label: string; accent: string };
  stop: { min: number; max: number; start: number; label: string; accent: string };
  challenges: LabChallenge[];
  question: LabQuestion;
  scene?: {
    alt?: string;
    backdrop?: { image?: string };
    coin?: { image?: string };
  };
}

interface Props {
  config: GaugeLabConfig;
  onComplete: (score: number) => void;
}

function CoinFigure({ url, ready }: { url?: string; ready: boolean }) {
  return (
    <ArtSlot url={url} ready={ready} className="h-5 w-5 shrink-0" style={{ animation: LAB_POP }}>
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <circle cx="12" cy="12" r="10" fill="#e5960a" />
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="#b9760a" strokeWidth="1.5" />
      </svg>
    </ArtSlot>
  );
}

export default function GaugeLab({ config, onComplete }: Props) {
  const [units, setUnits] = useState(config.units.start);
  const [stop, setStop] = useState(config.stop.start);

  const backdropOk = useImageReady(config.scene?.backdrop?.image);
  const coinOk = useImageReady(config.scene?.coin?.image);
  const backdropImg = config.scene?.backdrop?.image;
  const coinImg = config.scene?.coin?.image;

  const risk = useMemo(() => (units * stop * 100) / config.capital, [units, stop, config.capital]);
  const over = risk > config.thresholdPct + 0.001;
  const frac = Math.min(risk / config.maxScalePct, 1);

  const flow = useLabFlow(config.challenges, config.question);
  const lockUnits = flow.phase === "challenge" && flow.challenge?.lock === "units";
  const lockStop = flow.phase === "challenge" && flow.challenge?.lock === "stop";

  const changeUnits = (v: number) => {
    if (lockUnits) return;
    setUnits(v);
    flow.evaluate((v * stop * 100) / config.capital);
  };
  const changeStop = (v: number) => {
    if (lockStop) return;
    setStop(v);
    flow.evaluate((units * v * 100) / config.capital);
  };

  const reset = () => {
    setUnits(config.units.start);
    setStop(config.stop.start);
  };

  return (
    <div className="space-y-5">
      {/* Escena viva: la posición (monedas) y el medidor de riesgo */}
      <div
        role="img"
        aria-label={`${units} unidades de posición, ${risk.toFixed(1)} por ciento del capital en riesgo`}
        className="overflow-hidden rounded-2xl border-2 border-tp-border p-4"
        style={
          backdropOk && backdropImg
            ? { backgroundImage: `url(${backdropImg})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(#eaf4fe, #f1f8ff)" }
        }
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">Tu posición</p>
        <div className="mt-2 flex min-h-[28px] flex-wrap items-end gap-1">
          {Array.from({ length: units }).map((_, i) => (
            <CoinFigure key={i} url={coinImg} ready={coinOk} />
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">Capital en riesgo</p>
          <p className={`font-data text-2xl font-bold tabular-nums transition-colors duration-150 ease-out ${over ? "text-tp-supply" : "text-tp-demand"}`}>
            {risk.toFixed(1)}%
          </p>
        </div>
        {/* Medidor: relleno escalado (transform, no width) + línea del umbral */}
        <div className="relative mt-1 h-5 overflow-hidden rounded-full border-2 border-tp-border bg-tp-surface">
          <div
            className="h-full w-full origin-left"
            style={{ transform: `scaleX(${frac})`, transition: "transform 150ms ease-out", backgroundColor: over ? "#dc2626" : "#16a34a" }}
          />
          <div
            className="absolute bottom-0 top-0 w-[2px] bg-tp-text"
            style={{ left: `${(config.thresholdPct / config.maxScalePct) * 100}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-1 text-right font-data text-[10px] text-tp-text-muted">
          línea = {config.thresholdPct}% (máximo recomendado)
        </p>
      </div>

      {/* Controles */}
      <div className="space-y-4 rounded-2xl border-2 border-tp-border bg-tp-base p-5">
        <div className={lockUnits ? "opacity-45" : ""}>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="g-units" className="text-sm font-semibold text-tp-text">
              {config.units.label} {lockUnits && <span className="text-tp-text-muted">· bloqueado</span>}
            </label>
            <span className="font-data text-sm text-tp-gold">{units}</span>
          </div>
          <input
            id="g-units"
            type="range"
            min={config.units.min}
            max={config.units.max}
            value={units}
            disabled={lockUnits}
            onChange={(e) => changeUnits(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#e5960a] disabled:cursor-not-allowed"
          />
        </div>
        <div className={lockStop ? "opacity-45" : ""}>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="g-stop" className="text-sm font-semibold text-tp-text">
              {config.stop.label} {lockStop && <span className="text-tp-text-muted">· bloqueado</span>}
            </label>
            <span className="font-data text-sm text-tp-supply">${stop}</span>
          </div>
          <input
            id="g-stop"
            type="range"
            min={config.stop.min}
            max={config.stop.max}
            value={stop}
            disabled={lockStop}
            onChange={(e) => changeStop(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#dc2626] disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <ChallengeCard flow={flow} onAdvance={() => flow.advance(reset)} formatValue={(n) => `${n.toFixed(1)}%`} />
      <InductionQuestion flow={flow} onFinish={onComplete} />
    </div>
  );
}
