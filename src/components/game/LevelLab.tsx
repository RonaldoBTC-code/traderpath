"use client";

import { useState } from "react";
import {
  ChallengeCard,
  InductionQuestion,
  useImageReady,
  useLabFlow,
  type LabChallenge,
  type LabQuestion,
} from "@/components/game/labKit";

// ── LevelLab ───────────────────────────────────────────────────────
// Descubrimiento de "una región del precio y su fuerza": el jugador mueve unos
// controles (toques, impulso de salida, retesteos…) y ve cómo una banda del
// precio se vuelve fuerte o débil, con su etiqueta emergiendo. Cubre soporte/
// resistencia (con role reversal al romperse) y zonas de oferta/demanda (frescas
// vs quemadas), cambiando solo el modelo en el contenido — no el componente.

export interface LevelLabInput {
  key: string;
  label: string;
  min: number;
  max: number;
  start: number;
  accent: string;
}

export interface LevelLabConfig {
  /** "band"/"line" dibujan una región del precio; "meter" un termómetro horizontal. */
  region: "line" | "band" | "meter";
  /** Etiqueta de la cabecera de la escena (default "Región del precio"). */
  regionLabel?: string;
  /** Marca de umbral sobre el medidor, en unidades de fuerza (solo modo "meter"). */
  thresholdAt?: number;
  /** Nombre fijo del rol (zonas). Si hay `reversal`, el rol se alterna. */
  roleName?: string;
  reversal?: { before: string; after: string; toggleLabel: string };
  inputs: LevelLabInput[];
  strength: { base: number; weights: Record<string, number> };
  maxStrength: number;
  /** Descriptor de fuerza por umbral (ordenado ascendente por `min`). */
  strengthWords: { min: number; text: string; tone: "good" | "bad" }[];
  /** Key del input a dibujar como marcas de toque sobre la banda. */
  ticksFrom?: string;
  challenges: LabChallenge[];
  question: LabQuestion;
  scene?: { alt?: string; backdrop?: { image?: string } };
}

interface Props {
  config: LevelLabConfig;
  onComplete: (score: number) => void;
}

export default function LevelLab({ config, onComplete }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.inputs.map((i) => [i.key, i.start]))
  );
  const [broken, setBroken] = useState(false);

  const backdropOk = useImageReady(config.scene?.backdrop?.image);
  const backdropImg = config.scene?.backdrop?.image;

  const strengthOf = (v: Record<string, number>) =>
    config.strength.base + config.inputs.reduce((acc, i) => acc + (config.strength.weights[i.key] ?? 0) * v[i.key], 0);

  const strength = strengthOf(values);
  const role = config.reversal ? (broken ? config.reversal.after : config.reversal.before) : config.roleName ?? "";
  const roleColor = broken ? "#dc2626" : "#16a34a";
  const word = [...config.strengthWords].reverse().find((w) => strength >= w.min);
  const wordColor = word?.tone === "bad" ? "text-tp-supply" : "text-tp-demand";
  const opacity = 0.18 + 0.62 * Math.min(Math.max(strength / config.maxStrength, 0), 1);
  const fillFrac = Math.min(Math.max(strength / config.maxStrength, 0), 1);
  const meterColor = word ? (word.tone === "bad" ? "#dc2626" : "#16a34a") : roleColor;
  const regionLabel = config.regionLabel ?? "Región del precio";
  const headline = role ? `${role}${word ? ` · ${word.text}` : ""}` : word?.text ?? "";

  const flow = useLabFlow(config.challenges, config.question);

  const evalNow = (v: Record<string, number>, brk: boolean) => {
    const m = flow.challenge?.metric;
    flow.evaluate(m === "broken" ? (brk ? 1 : 0) : strengthOf(v));
  };

  const locked = flow.phase === "challenge" ? flow.challenge?.lock : undefined;

  const changeInput = (key: string, next: number) => {
    if (locked === key) return;
    const v = { ...values, [key]: next };
    setValues(v);
    evalNow(v, broken);
  };

  const toggleBreak = () => {
    const next = !broken;
    setBroken(next);
    evalNow(values, next);
  };

  const reset = () => {
    const v = Object.fromEntries(config.inputs.map((i) => [i.key, i.start]));
    setValues(v);
    setBroken(false);
  };

  const ticks = config.ticksFrom ? values[config.ticksFrom] ?? 0 : 0;

  return (
    <div className="space-y-5">
      {/* Escena: la región del precio y su fuerza */}
      <div
        role="img"
        aria-label={`${regionLabel}: ${headline}`}
        className="overflow-hidden rounded-2xl border-2 border-tp-border p-4"
        style={
          backdropOk && backdropImg
            ? { backgroundImage: `url(${backdropImg})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(#eaf4fe, #f1f8ff)" }
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">{regionLabel}</p>
          <p className={`font-display text-base font-bold transition-colors duration-150 ease-out ${wordColor}`}>{headline}</p>
        </div>
        {config.region === "meter" ? (
          <div>
            <div className="relative h-6 overflow-hidden rounded-full border-2 border-tp-border bg-tp-surface">
              <div
                className="h-full w-full origin-left"
                style={{ transform: `scaleX(${fillFrac})`, transition: "transform 150ms ease-out", backgroundColor: meterColor }}
              />
              {config.thresholdAt != null && (
                <div
                  className="absolute bottom-0 top-0 w-[2px] bg-tp-text"
                  style={{ left: `${Math.min(Math.max(config.thresholdAt / config.maxStrength, 0), 1) * 100}%` }}
                  aria-hidden
                />
              )}
            </div>
            {config.thresholdAt != null && (
              <p className="mt-1 text-right font-data text-[10px] text-tp-text-muted">línea = umbral</p>
            )}
          </div>
        ) : (
          <div className="relative h-28 rounded-xl border border-tp-border bg-white/40">
            {/* la banda / línea */}
            <div
              className="absolute left-0 right-0 transition-[opacity] duration-150 ease-out"
              style={{
                top: config.region === "band" ? "42%" : "49%",
                height: config.region === "band" ? "16%" : "3px",
                backgroundColor: roleColor,
                opacity,
              }}
            />
            {/* marcas de toque */}
            {Array.from({ length: Math.min(ticks, 6) }).map((_, i) => (
              <div
                key={i}
                aria-hidden
                className="absolute w-[3px] rounded"
                style={{ left: `${12 + i * 13}%`, top: "38%", height: "24%", backgroundColor: roleColor, animation: "bounce-in 200ms cubic-bezier(0.23,1,0.32,1)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="space-y-4 rounded-2xl border-2 border-tp-border bg-tp-base p-5">
        {config.inputs.map((inp) => (
          <div key={inp.key} className={locked === inp.key ? "opacity-45" : ""}>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor={`ll-${inp.key}`} className="text-sm font-semibold text-tp-text">
                {inp.label} {locked === inp.key && <span className="text-tp-text-muted">· bloqueado</span>}
              </label>
              <span className="font-data text-sm" style={{ color: inp.accent }}>{values[inp.key]}</span>
            </div>
            <input
              id={`ll-${inp.key}`}
              type="range"
              min={inp.min}
              max={inp.max}
              value={values[inp.key]}
              disabled={locked === inp.key}
              onChange={(e) => changeInput(inp.key, Number(e.target.value))}
              className="w-full cursor-pointer disabled:cursor-not-allowed"
              style={{ accentColor: inp.accent }}
            />
          </div>
        ))}
        {config.reversal && (
          <button
            type="button"
            onClick={toggleBreak}
            className={`w-full rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.98] ${
              broken ? "border-tp-supply bg-tp-supply/10 text-tp-supply" : "border-tp-border bg-tp-surface text-tp-text hover:border-tp-gold/50"
            }`}
          >
            {broken ? "Nivel roto" : config.reversal.toggleLabel}
          </button>
        )}
      </div>

      <ChallengeCard flow={flow} onAdvance={() => flow.advance(reset)} formatValue={(n) => `${n}`} />
      <InductionQuestion flow={flow} onFinish={onComplete} />
    </div>
  );
}
