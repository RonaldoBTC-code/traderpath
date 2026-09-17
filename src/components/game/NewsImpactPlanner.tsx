"use client";

import { useState } from "react";

export interface NewsScenario {
  event: string;
  impactLevel: "bajo" | "medio" | "alto";
  minutesToRelease: number;
  answer: string;
}

interface Props {
  scenarios: NewsScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "evitar_entrar", label: "Evitar abrir posiciones nuevas" },
  { id: "esperar_confirmacion", label: "Esperar confirmación tras publicarse" },
  { id: "operar_normal", label: "Operar con normalidad" },
  { id: "proteger_posiciones", label: "Proteger posiciones existentes" },
];

const EXPLANATIONS: Record<string, string> = {
  evitar_entrar: "Antes de un evento de alto impacto, el spread se ensancha y el slippage aumenta — sin una posición que proteger, lo prudente es esperar.",
  esperar_confirmacion: "Justo después de una publicación de alto impacto, el spread aún no ha normalizado y la dirección inicial puede revertirse — conviene esperar confirmación.",
  operar_normal: "Un evento de bajo o medio impacto, lejos de su publicación, no suele justificar cambios al plan habitual.",
  proteger_posiciones: "Con una posición abierta y un Stop Loss ajustado, un evento de alto impacto inminente puede ejecutar el SL por el ensanchamiento del spread, no por un movimiento real — conviene ampliarlo o cerrar antes.",
};

const IMPACT_STYLES: Record<NewsScenario["impactLevel"], string> = {
  alto: "border-tp-supply/40 bg-tp-supply/10 text-tp-supply",
  medio: "border-tp-warning/40 bg-tp-warning/10 text-tp-warning",
  bajo: "border-tp-demand/40 bg-tp-demand/10 text-tp-demand",
};

function formatTiming(minutes: number): string {
  if (minutes < 0) return `Faltan ${Math.abs(minutes)} min`;
  if (minutes === 0) return "Publicándose ahora";
  return `Publicado hace ${minutes} min`;
}

export default function NewsImpactPlanner({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Considera el nivel de impacto, el tiempo hasta/desde la publicación, y si ya tienes una posición abierta.</p>
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

      <div className="rounded-md border border-tp-border bg-tp-base p-4 space-y-3">
        <p className="text-sm font-semibold text-tp-text">{current.event}</p>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${IMPACT_STYLES[current.impactLevel]}`}>
            Impacto {current.impactLevel}
          </span>
          <span className="rounded-full border border-tp-info/40 bg-tp-info/10 px-3 py-1 text-[10px] font-semibold text-tp-info">
            {formatTiming(current.minutesToRelease)}
          </span>
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cuál es la acción más prudente?</p>
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
            {isCorrect ? "Decisión correcta" : `Mejor decisión: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
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
