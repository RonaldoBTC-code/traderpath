"use client";

import { useState } from "react";

export interface SectorBetaScenario {
  sector: string;
  beta: number;
  marketTrend: string;
  answer: string;
}

interface Props {
  scenarios: SectorBetaScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "sobreponderar", label: "Sobreponderar" },
  { id: "subponderar", label: "Subponderar" },
  { id: "neutral_seleccionar", label: "Exposición neutral" },
  { id: "defensivo_preferido", label: "Preferir defensivos" },
];

const TREND_LABELS: Record<string, string> = {
  expansion: "Expansión económica",
  contraccion: "Contracción económica",
  incertidumbre: "Contexto incierto",
};

const EXPLANATIONS: Record<string, string> = {
  sobreponderar: "En expansión, los sectores cíclicos de mayor beta suelen liderar el desempeño relativo del mercado.",
  subponderar: "Un sector cíclico de alto beta suele sufrir más que el promedio del mercado durante una contracción.",
  neutral_seleccionar: "Sin una señal clara de ciclo, o con un beta moderado, la prudencia sugiere exposición neutral y selección cuidadosa.",
  defensivo_preferido: "En contracción, los sectores defensivos de bajo beta suelen ofrecer mayor estabilidad relativa que el resto del mercado.",
};

export default function SectorBetaGauge({ scenarios, requiredCorrect, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finishedScore, setFinishedScore] = useState<number | null>(null);

  const current = scenarios[currentIndex];
  const isCorrect = selected === current.answer;
  const betaPercent = Math.min(100, (current.beta / 2) * 100);

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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Combina el beta del sector con la fase del ciclo económico antes de decidir la exposición.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Sector {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Sector</p>
            <p className="text-sm font-semibold text-tp-text">{current.sector}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Contexto</p>
            <p className="text-sm font-semibold text-tp-text">{TREND_LABELS[current.marketTrend] ?? current.marketTrend}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Beta</p>
          <p className="font-data text-2xl font-bold text-tp-gold">{current.beta.toFixed(1)}</p>
          <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-tp-surface-alt">
            <div className="h-full bg-gradient-to-r from-tp-info to-tp-warning" style={{ width: `${betaPercent}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-tp-text-muted"><span>0.0 defensivo</span><span>1.0 mercado</span><span>2.0+ muy cíclico</span></div>
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Qué exposición tiene mejor relación entre contexto y beta?</p>
      <div className="grid gap-2 sm:grid-cols-2">
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
            {isCorrect ? "Lectura correcta" : `Mejor decisión: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente sector"}
          </button>
        </div>
      )}
    </div>
  );
}
