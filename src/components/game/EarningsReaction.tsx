"use client";

import { useState } from "react";

export interface EarningsScenario {
  ticker: string;
  status: "publicado" | "pendiente";
  epsSurprise?: "beat" | "miss" | "inline";
  guidance?: "raised" | "lowered" | "maintained";
  daysToRelease?: number;
  answer: string;
}

interface Props {
  scenarios: EarningsScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "reaccion_alcista_fuerte", label: "Reacción alcista fuerte esperada" },
  { id: "reaccion_mixta_cautela", label: "Reacción mixta — cautela" },
  { id: "reaccion_bajista", label: "Reacción bajista esperada" },
  { id: "evitar_entrar_pre_earnings", label: "Evitar entrar — reporte pendiente" },
];

const EXPLANATIONS: Record<string, string> = {
  reaccion_alcista_fuerte: "EPS por encima de lo esperado junto con una guía elevada suele generar una reacción alcista fuerte — ambas señales apuntan en la misma dirección.",
  reaccion_mixta_cautela: "Sin una sorpresa clara en la misma dirección (por ejemplo, un beat sin guía elevada, o un resultado en línea), el mercado suele reaccionar con cautela.",
  reaccion_bajista: "Un resultado por debajo de lo esperado suele pesar más que cualquier otro factor — el mercado tiende a reaccionar a la baja.",
  evitar_entrar_pre_earnings: "Con el reporte todavía pendiente, abrir una posición nueva expone a un gap de apertura que ningún Stop Loss puede prevenir.",
};

const EPS_LABELS: Record<string, string> = { beat: "Superó estimados", miss: "No alcanzó estimados", inline: "En línea con estimados" };
const GUIDANCE_LABELS: Record<string, string> = { raised: "Guía elevada", lowered: "Guía reducida", maintained: "Guía sin cambios" };

export default function EarningsReaction({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Si el reporte está pendiente, la prudencia manda. Si ya se publicó, combina EPS y guía antes de decidir.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Reporte {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctos</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-data text-lg font-bold text-tp-gold">{current.ticker}</p>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            current.status === "pendiente" ? "border-tp-warning/40 bg-tp-warning/10 text-tp-warning" : "border-tp-info/40 bg-tp-info/10 text-tp-info"
          }`}>
            {current.status === "pendiente" ? `Reporta en ${current.daysToRelease} días` : "Ya publicado"}
          </span>
        </div>
        {current.status === "publicado" && (
          <div className="flex flex-wrap gap-2">
            {current.epsSurprise && (
              <span className="rounded-full border border-tp-border bg-tp-surface px-3 py-1 text-[10px] font-semibold text-tp-text">
                EPS: {EPS_LABELS[current.epsSurprise]}
              </span>
            )}
            {current.guidance && (
              <span className="rounded-full border border-tp-border bg-tp-surface px-3 py-1 text-[10px] font-semibold text-tp-text">
                {GUIDANCE_LABELS[current.guidance]}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-tp-text-muted">¿Cuál es la reacción esperada más probable?</p>
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
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente reporte"}
          </button>
        </div>
      )}
    </div>
  );
}
