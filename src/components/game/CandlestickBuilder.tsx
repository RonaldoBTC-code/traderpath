"use client";

import { useState } from "react";

interface CandleScenario {
  open: number;
  high: number;
  low: number;
  close: number;
  expectedColor: "green" | "red";
  note?: string;
}

interface Props {
  scenarios: CandleScenario[];
  onComplete: (score: number) => void;
}

type Direction = "green" | "red";

interface Calculation {
  direction: Direction;
  body: number;
  upperWick: number;
  lowerWick: number;
}

function calculateCandle({ open, high, low, close }: CandleScenario): Calculation {
  return {
    direction: close > open ? "green" : "red",
    body: Math.abs(close - open),
    upperWick: high - Math.max(open, close),
    lowerWick: Math.min(open, close) - low,
  };
}

function AnnotatedCandle({ scenario }: { scenario: CandleScenario }) {
  const { open, high, low, close } = scenario;
  const range = Math.max(1, high - low);
  const normalize = (value: number) => ((high - value) / range) * 124 + 26;
  const isGreen = close > open;
  const color = isGreen ? "#22C55E" : "#EF4444";
  const bodyTop = normalize(Math.max(open, close));
  const bodyBottom = normalize(Math.min(open, close));
  const levels = [
    { label: "H · máximo", value: high, y: normalize(high) },
    { label: isGreen ? "C · cierre" : "O · apertura", value: Math.max(open, close), y: bodyTop },
    { label: isGreen ? "O · apertura" : "C · cierre", value: Math.min(open, close), y: bodyBottom },
    { label: "L · mínimo", value: low, y: normalize(low) },
  ];

  return (
    <svg viewBox="0 0 260 180" className="h-48 w-full max-w-sm" role="img" aria-label="Vela japonesa identificada con precios OHLC">
      {levels.map((level) => (
        <g key={level.label}>
          <line x1="72" x2="238" y1={level.y} y2={level.y} stroke="#334155" strokeDasharray="4 4" />
          <text x="4" y={level.y + 4} fill="#94A3B8" fontSize="9">{level.label}</text>
          <text x="242" y={level.y + 4} fill="#CBD5E1" fontSize="9">{level.value}</text>
        </g>
      ))}
      <line x1="155" x2="155" y1={normalize(high)} y2={normalize(low)} stroke={color} strokeWidth="3" />
      <rect
        x="127"
        y={bodyTop}
        width="56"
        height={Math.max(6, bodyBottom - bodyTop)}
        rx="3"
        fill={color}
      />
    </svg>
  );
}

export default function CandlestickBuilder({ scenarios, onComplete }: Props) {
  const [phase, setPhase] = useState<"tutorial" | "game">("tutorial");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [body, setBody] = useState("");
  const [upperWick, setUpperWick] = useState("");
  const [lowerWick, setLowerWick] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const tutorialSteps = [
    {
      title: "1. Ordena los cuatro precios",
      content: "High es el precio mayor y Low el menor. Open y Close siempre quedan entre ambos. No tienes que adivinar ningún valor: la misión te entrega O, H, L y C.",
    },
    {
      title: "2. Decide la dirección",
      content: "Compara cierre con apertura. Si C > O, la vela es alcista (verde). Si C < O, es bajista (roja).",
    },
    {
      title: "3. Calcula cuerpo y mechas",
      content: "Cuerpo = |C − O|. Mecha superior = H − mayor(O,C). Mecha inferior = menor(O,C) − L.",
    },
  ];

  if (phase === "tutorial") {
    const step = tutorialSteps[tutorialStep];
    const example: CandleScenario = { open: 100, high: 120, low: 85, close: 115, expectedColor: "green" };
    return (
      <div className="space-y-5">
        <div className="flex gap-1.5" aria-label={`Paso ${tutorialStep + 1} de ${tutorialSteps.length}`}>
          {tutorialSteps.map((_, index) => (
            <div key={index} className={`h-1.5 rounded-full transition-all ${index === tutorialStep ? "w-8 bg-tp-gold" : index < tutorialStep ? "w-4 bg-tp-demand" : "w-4 bg-tp-border"}`} />
          ))}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tp-info">Qué debes calcular</p>
          <h4 className="mt-1 font-display text-base font-bold text-tp-gold">{step.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-tp-text">{step.content}</p>
        </div>

        <div className="rounded-xl border border-tp-border bg-tp-base p-3">
          <AnnotatedCandle scenario={example} />
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <Formula label="Cuerpo" formula="|115 − 100|" result="15" />
            <Formula label="Mecha ↑" formula="120 − 115" result="5" />
            <Formula label="Mecha ↓" formula="100 − 85" result="15" />
          </div>
        </div>

        <div className="flex gap-2">
          {tutorialStep > 0 && (
            <button type="button" onClick={() => setTutorialStep((stepIndex) => stepIndex - 1)} className="rounded-xl border border-tp-border px-4 py-2 text-sm text-tp-text-muted">
              ← Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => tutorialStep < tutorialSteps.length - 1 ? setTutorialStep((stepIndex) => stepIndex + 1) : setPhase("game")}
            className="flex-1 rounded-xl bg-tp-gold px-5 py-2.5 font-display text-sm font-bold text-tp-base transition hover:brightness-110"
          >
            {tutorialStep < tutorialSteps.length - 1 ? "Siguiente paso →" : "Practicar con la fórmula →"}
          </button>
        </div>
      </div>
    );
  }

  const current = scenarios[currentIndex];
  if (!current) return null;
  const expected = calculateCandle(current);
  const allFieldsReady = direction && body !== "" && upperWick !== "" && lowerWick !== "";

  const resetInputs = () => {
    setDirection(null);
    setBody("");
    setUpperWick("");
    setLowerWick("");
    setFeedback(null);
    setAttempts(0);
  };

  const advance = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((index) => index + 1);
      resetInputs();
      return;
    }
    onComplete(Math.round((score / scenarios.length) * 100));
  };

  const checkAnswer = () => {
    if (!allFieldsReady || feedback) return;
    const values = {
      body: Number(body),
      upperWick: Number(upperWick),
      lowerWick: Number(lowerWick),
    };
    const numericValuesAreValid = Object.values(values).every((value) => Number.isFinite(value) && value >= 0);
    const correct = numericValuesAreValid
      && direction === expected.direction
      && values.body === expected.body
      && values.upperWick === expected.upperWick
      && values.lowerWick === expected.lowerWick;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (correct) {
      setScore((currentScore) => currentScore + 1);
      setFeedback({
        correct: true,
        message: `Correcto: cuerpo ${expected.body}, mecha superior ${expected.upperWick} y mecha inferior ${expected.lowerWick}.`,
      });
      return;
    }

    setFeedback({
      correct: false,
      message: `Revisa la fórmula: |${current.close} − ${current.open}| = ${expected.body}; ${current.high} − ${Math.max(current.open, current.close)} = ${expected.upperWick}; ${Math.min(current.open, current.close)} − ${current.low} = ${expected.lowerWick}.`,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-tp-text-muted">
        <span>Vela {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas · intento {Math.min(attempts + 1, 3)}/3</span>
      </div>

      <div className="rounded-xl border border-tp-info/25 bg-[linear-gradient(135deg,rgba(96,165,250,.08),rgba(10,14,26,.9))] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tp-info">Datos entregados — no hay que adivinarlos</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            ["O", "Apertura", current.open],
            ["H", "Máximo", current.high],
            ["L", "Mínimo", current.low],
            ["C", "Cierre", current.close],
          ].map(([key, label, value]) => (
            <div key={key} className="rounded-lg border border-white/[0.06] bg-tp-base/80 p-2">
              <p className="font-data text-sm font-bold text-tp-gold">{key} {value}</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-wider text-tp-text-muted">{label}</p>
            </div>
          ))}
        </div>
        {current.note && <p className="mt-3 text-center text-[10px] text-tp-gold">Pista visual: {current.note}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-xl border border-tp-border bg-tp-base p-3">
          <AnnotatedCandle scenario={current} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-tp-text-muted">1 · Dirección: compara C con O</p>
            <div className="grid grid-cols-2 gap-2">
              <DirectionButton active={direction === "green"} color="green" onClick={() => !feedback && setDirection("green")}>
                Alcista · C &gt; O
              </DirectionButton>
              <DirectionButton active={direction === "red"} color="red" onClick={() => !feedback && setDirection("red")}>
                Bajista · C &lt; O
              </DirectionButton>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="2 · Cuerpo" hint="|C − O|" value={body} onChange={setBody} disabled={!!feedback} />
            <NumberField label="3 · Mecha ↑" hint="H − mayor" value={upperWick} onChange={setUpperWick} disabled={!!feedback} />
            <NumberField label="4 · Mecha ↓" hint="menor − L" value={lowerWick} onChange={setLowerWick} disabled={!!feedback} />
          </div>
        </div>
      </div>

      {!feedback ? (
        <button
          type="button"
          onClick={checkAnswer}
          disabled={!allFieldsReady}
          className="w-full rounded-xl bg-tp-gold px-4 py-3 font-display font-bold text-tp-base transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comprobar mis cálculos
        </button>
      ) : (
        <div className={`rounded-xl border p-4 ${feedback.correct ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`font-display text-sm font-bold ${feedback.correct ? "text-tp-demand" : "text-tp-supply"}`}>
            {feedback.correct ? "Lectura correcta" : attempts >= 3 ? "Resultado incorrecto" : "Todavía no"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-tp-text-muted">{feedback.message}</p>
          <button
            type="button"
            onClick={() => {
              if (feedback.correct || attempts >= 3) advance();
              else setFeedback(null);
            }}
            className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-base"
          >
            {feedback.correct
              ? currentIndex < scenarios.length - 1 ? "Siguiente vela →" : "Ver resultado →"
              : attempts >= 3 ? "Continuar con resultado incorrecto →" : "Corregir este cálculo"}
          </button>
        </div>
      )}
    </div>
  );
}

function Formula({ label, formula, result }: { label: string; formula: string; result: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-tp-surface p-2">
      <p className="font-semibold text-tp-text">{label}</p>
      <p className="mt-1 font-data text-tp-text-muted">{formula}</p>
      <p className="font-data text-tp-gold">= {result}</p>
    </div>
  );
}

function DirectionButton({ active, color, onClick, children }: { active: boolean; color: Direction; onClick: () => void; children: React.ReactNode }) {
  const activeClass = color === "green"
    ? "border-tp-demand bg-tp-demand/10 text-tp-demand"
    : "border-tp-supply bg-tp-supply/10 text-tp-supply";
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${active ? activeClass : "border-tp-border bg-tp-base text-tp-text-muted hover:border-tp-gold/40"}`}>
      {children}
    </button>
  );
}

function NumberField({ label, hint, value, onChange, disabled }: { label: string; hint: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider text-tp-text-muted">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={hint}
        className="mt-1 w-full rounded-lg border border-tp-border bg-tp-base px-2 py-2 font-data text-sm text-tp-text outline-none transition placeholder:text-[9px] placeholder:text-tp-text-muted/50 focus:border-tp-gold"
      />
    </label>
  );
}
