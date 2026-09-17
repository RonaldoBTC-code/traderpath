"use client";

import { useState } from "react";

export interface SupplyShockScenario {
  event: string;
  commodity: string;
  answer: string;
}

interface Props {
  scenarios: SupplyShockScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "presion_alcista", label: "Presión alcista" },
  { id: "presion_bajista", label: "Presión bajista" },
  { id: "incertidumbre_geopolitica", label: "Incertidumbre — volatilidad en ambas direcciones" },
  { id: "impacto_limitado", label: "Impacto limitado" },
];

const EXPLANATIONS: Record<string, string> = {
  presion_alcista: "Menos oferta disponible (o más demanda) con el resto constante suele presionar el precio al alza.",
  presion_bajista: "Más oferta disponible (o menos demanda) con el resto constante suele presionar el precio a la baja.",
  incertidumbre_geopolitica: "Sin conocer el desenlace real del evento, el mercado puede moverse en cualquier dirección — la prudencia es la respuesta más razonable.",
  impacto_limitado: "Un dato rutinario y sin sorpresas frente a lo esperado no suele generar un movimiento significativo de precio.",
};

export default function SupplyShockPlanner({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Distingue eventos con dirección clara de eventos con alta incertidumbre.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Evento {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctos</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4 space-y-2">
        <span className="rounded-full border border-tp-gold/40 bg-tp-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-tp-gold">
          {current.commodity}
        </span>
        <p className="text-sm text-tp-text">{current.event}</p>
      </div>

      <p className="text-sm text-tp-text-muted">¿Qué presión ejerce este evento sobre el precio?</p>
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
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente evento"}
          </button>
        </div>
      )}
    </div>
  );
}
