"use client";

import { useState } from "react";

export interface DollarCorrelationScenario {
  commodity: string;
  dollarMove: "fortalece" | "debilita";
  detail?: string;
  answer: string;
}

interface Props {
  scenarios: DollarCorrelationScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "presion_alcista_commodity", label: "Presión alcista sobre la materia prima" },
  { id: "presion_bajista_commodity", label: "Presión bajista sobre la materia prima" },
  { id: "relacion_no_absoluta", label: "Relación no absoluta — otro factor domina" },
];

const EXPLANATIONS: Record<string, string> = {
  presion_alcista_commodity: "Un dólar más débil suele traducirse en precios más altos de materias primas expresados en esa misma moneda.",
  presion_bajista_commodity: "Un dólar más fuerte suele traducirse en precios más bajos de materias primas expresadas en esa misma moneda.",
  relacion_no_absoluta: "La relación con el dólar es contexto, no una ley absoluta — un evento de oferta/demanda propio y significativo puede dominar sobre el efecto general del dólar.",
};

export default function DollarCommodityCorrelation({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Dólar débil → presión alcista en commodities. Dólar fuerte → presión bajista. Salvo que un evento propio del activo domine.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Escenario {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-data text-lg font-bold text-tp-gold">{current.commodity}</span>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            current.dollarMove === "fortalece" ? "border-tp-demand/40 bg-tp-demand/10 text-tp-demand" : "border-tp-supply/40 bg-tp-supply/10 text-tp-supply"
          }`}>
            Dólar {current.dollarMove === "fortalece" ? "se fortalece" : "se debilita"}
          </span>
        </div>
        {current.detail && <p className="text-xs text-tp-text-muted">{current.detail}</p>}
      </div>

      <p className="text-sm text-tp-text-muted">¿Qué presión resulta más probable?</p>
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
            {isCorrect ? "Lectura correcta" : `Mejor lectura: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente escenario"}
          </button>
        </div>
      )}
    </div>
  );
}
