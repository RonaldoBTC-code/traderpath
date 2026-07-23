"use client";

import { useState } from "react";

export interface SectorScenario {
  ticker: string;
  sector: string;
  marketCapB: number;
  answer: string;
}

interface Props {
  scenarios: SectorScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "large_cap_indice", label: "Large cap — probablemente en índices grandes" },
  { id: "mid_cap", label: "Mid cap — fuera de los índices de mayor capitalización" },
  { id: "small_cap_volatil", label: "Small cap — mayor volatilidad y menor liquidez" },
];

const EXPLANATIONS: Record<string, string> = {
  large_cap_indice: "Con capitalización sobre $10,000 millones, suele tener alta liquidez y formar parte de los principales índices bursátiles.",
  mid_cap: "Entre $2,000 y $10,000 millones: menor cobertura mediática y liquidez que una large cap, pero más estable que una small cap.",
  small_cap_volatil: "Con menos de $2,000 millones, suele tener mayor volatilidad porcentual y menor liquidez — spreads más anchos y movimientos más bruscos.",
};

function formatCapB(value: number): string {
  return value >= 1000 ? `$${(value / 1000).toFixed(1)}T` : `$${value.toLocaleString("en-US")}B`;
}

export default function SectorMap({ scenarios, requiredCorrect, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finishedScore, setFinishedScore] = useState<number | null>(null);

  const current = scenarios[currentIndex];
  const isCorrect = selected === current.answer;

  const choose = (decision: string) => {
    if (selected) return;
    setSelected(decision);
    if (decision === current.answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((value) => value + 1);
      setSelected(null);
      return;
    }

    const percent = Math.round((score / scenarios.length) * 100);
    if (score >= requiredCorrect) onComplete(percent);
    else setFinishedScore(percent);
  };

  const reset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinishedScore(null);
  };

  if (finishedScore !== null) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display font-bold text-tp-warning">Resultado: {finishedScore}%</p>
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Recuerda los umbrales aproximados: large cap desde $10,000M, mid cap entre $2,000M y $10,000M, small cap por debajo de $2,000M.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Empresa {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Ticker</p>
            <p className="font-data text-2xl font-bold text-tp-gold">{current.ticker}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Sector</p>
            <p className="text-sm font-semibold text-tp-text">{current.sector}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Capitalización</p>
            <p className="font-data text-lg font-bold text-tp-demand">{formatCapB(current.marketCapB)}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cómo clasificarías esta empresa?</p>
      <div className="grid gap-2">
        {DECISIONS.map((decision) => {
          const correct = selected && decision.id === current.answer;
          const wrong = selected === decision.id && !isCorrect;
          return (
            <button
              key={decision.id}
              disabled={!!selected}
              onClick={() => choose(decision.id)}
              className={`rounded-sm border px-3 py-2 text-left text-sm transition ${
                correct ? "border-tp-demand bg-tp-demand/10 text-tp-demand" :
                wrong ? "border-tp-supply bg-tp-supply/10 text-tp-supply" :
                "border-tp-border bg-tp-base text-tp-text hover:border-tp-gold/60"
              }`}
            >
              {decision.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={`rounded-sm border p-3 ${isCorrect ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`text-sm font-semibold ${isCorrect ? "text-tp-demand" : "text-tp-supply"}`}>
            {isCorrect ? "Clasificación correcta" : `Clasificación correcta: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente empresa"}
          </button>
        </div>
      )}
    </div>
  );
}
