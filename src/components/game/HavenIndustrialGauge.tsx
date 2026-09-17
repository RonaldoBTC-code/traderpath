"use client";

import { useState } from "react";

export interface HavenIndustrialScenario {
  commodity: string;
  marketContext: string;
  answer: string;
}

interface Props {
  scenarios: HavenIndustrialScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "refugio_favorecido", label: "Refugio favorecido" },
  { id: "ciclico_favorecido", label: "Cíclico favorecido" },
  { id: "desfavorecido_por_contexto", label: "Desfavorecido por el contexto" },
  { id: "neutral_datos_mixtos", label: "Señales mixtas" },
];

const CONTEXT_LABELS: Record<string, string> = {
  risk_off: "Aversión al riesgo (risk-off)",
  risk_on: "Apetito por riesgo (risk-on)",
  inflacion_alta: "Inflación alta",
};

const EXPLANATIONS: Record<string, string> = {
  refugio_favorecido: "En este contexto, la demanda de protección de valor favorece a los activos refugio como el oro o la plata.",
  ciclico_favorecido: "En este contexto, el apetito por riesgo y el crecimiento económico favorecen a los activos cíclicos/industriales como el cobre.",
  desfavorecido_por_contexto: "Este tipo de activo (refugio o cíclico) no encaja con la lógica del contexto actual — su demanda tiende a debilitarse, no a fortalecerse.",
  neutral_datos_mixtos: "Sin una señal dominante clara, la exposición neutral es la decisión más prudente.",
};

export default function HavenIndustrialGauge({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Recuerda: oro/plata son refugio, cobre/petróleo son cíclicos — cada uno responde distinto al mismo contexto.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Activo {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Materia prima</p>
            <p className="font-data text-lg font-bold text-tp-gold">{current.commodity}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Contexto</p>
            <p className="text-sm font-semibold text-tp-text">{CONTEXT_LABELS[current.marketContext] ?? current.marketContext}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cómo está posicionado este activo frente al contexto?</p>
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
            {isCorrect ? "Lectura correcta" : `Mejor lectura: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente activo"}
          </button>
        </div>
      )}
    </div>
  );
}
