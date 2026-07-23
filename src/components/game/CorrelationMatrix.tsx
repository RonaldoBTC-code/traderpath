"use client";

import { useState } from "react";

export interface CorrelationScenario {
  pairA: string;
  pairB: string;
  coefficient: number;
  answer: string;
}

interface Props {
  scenarios: CorrelationScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "misma_direccion_fuerte", label: "Misma dirección — fuerte" },
  { id: "opuesta_fuerte", label: "Dirección opuesta — fuerte" },
  { id: "moderada", label: "Relación moderada" },
  { id: "independiente", label: "Prácticamente independientes" },
];

const EXPLANATIONS: Record<string, string> = {
  misma_direccion_fuerte: "Correlación fuerte y positiva: abrir ambos pares en la misma dirección duplica una sola apuesta direccional, no diversifica.",
  opuesta_fuerte: "Correlación fuerte y negativa: los pares se mueven en direcciones contrarias — combinarlos en la misma dirección de riesgo puede anular una posición con la otra.",
  moderada: "La relación existe pero no es determinante — puede romperse ante un evento específico de una sola divisa. Trátala como una pista, no como una certeza.",
  independiente: "Correlación débil: los pares se mueven por drivers distintos y pueden combinarse sin duplicar el mismo riesgo direccional.",
};

export default function CorrelationMatrix({ scenarios, requiredCorrect, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finishedScore, setFinishedScore] = useState<number | null>(null);

  const current = scenarios[currentIndex];
  const isCorrect = selected === current.answer;
  const gaugePercent = ((current.coefficient + 1) / 2) * 100;

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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Recuerda: cerca de +1 es misma dirección, cerca de -1 es dirección opuesta, cerca de 0 es independiente.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Par {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Par A</p>
            <p className="font-data text-lg font-bold text-tp-text">{current.pairA}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Par B</p>
            <p className="font-data text-lg font-bold text-tp-text">{current.pairB}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Coeficiente</p>
            <p className={`font-data text-2xl font-bold ${current.coefficient >= 0 ? "text-tp-demand" : "text-tp-supply"}`}>
              {current.coefficient > 0 ? "+" : ""}{current.coefficient.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-gradient-to-r from-tp-supply via-tp-surface-alt to-tp-demand">
          <div
            className="absolute top-0 h-3 w-1 rounded-full bg-tp-text"
            style={{ left: `${gaugePercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-tp-text-muted"><span>-1 opuesta</span><span>0 independiente</span><span>+1 misma dirección</span></div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cómo clasificarías esta relación?</p>
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
            {isCorrect ? "Lectura correcta" : `Mejor clasificación: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente par"}
          </button>
        </div>
      )}
    </div>
  );
}
