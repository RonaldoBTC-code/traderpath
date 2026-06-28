"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export interface CycleEvent {
  date: string;
  price: number;
  answer: string;
}

interface Props {
  events: CycleEvent[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const PHASES = [
  { id: "acumulacion", label: "Acumulación", color: "border-tp-info" },
  { id: "impulso", label: "Impulso", color: "border-tp-demand" },
  { id: "distribucion", label: "Distribución", color: "border-tp-gold" },
  { id: "capitulacion", label: "Capitulación", color: "border-tp-supply" },
];

const PHASE_EXPLANATIONS: Record<string, string> = {
  acumulacion: "El precio forma una base y el capital informado entra antes del impulso visible.",
  impulso: "La demanda domina y el precio expande con máximos y mínimos crecientes.",
  distribucion: "Tras una subida extensa, la euforia permite que grandes participantes realicen beneficios.",
  capitulacion: "El miedo fuerza ventas aceleradas y suele marcar el agotamiento de la caída.",
};

function normalizePhase(answer: string) {
  if (answer.startsWith("acumulacion")) return "acumulacion";
  if (answer.startsWith("distribucion")) return "distribucion";
  return answer;
}

export default function CycleMapper({ events, requiredCorrect, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  const current = events[currentIndex];
  const answer = normalizePhase(current.answer);
  const isCorrect = selected === answer;

  const choose = (phase: string) => {
    if (selected) return;
    setSelected(phase);
    if (phase === answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    const percent = Math.round((score / events.length) * 100);
    if (score >= requiredCorrect) onComplete(percent);
    else setFailed(true);
  };

  const reset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFailed(false);
  };

  if (failed) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display font-bold text-tp-warning">El ciclo todavía no está claro</p>
        <p className="text-sm text-tp-text-muted">Acertaste {score} de {events.length}; necesitas {requiredCorrect}. Usa precio, fecha y posición dentro del ciclo, no solo si el precio parece alto o bajo.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-bold text-tp-base">Reintentar mapa</button>
      </div>
    );
  }

  const points = events.map((event, index) => {
    const x = events.length === 1 ? 50 : 5 + (index / (events.length - 1)) * 90;
    const logPrice = Math.log10(event.price);
    const logs = events.map((item) => Math.log10(item.price));
    const min = Math.min(...logs);
    const max = Math.max(...logs);
    const y = 82 - ((logPrice - min) / (max - min || 1)) * 64;
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Evento {currentIndex + 1} de {events.length}</span>
        <span>{score} correctos</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-3">
        <svg viewBox="0 0 100 92" role="img" aria-label="Evolución histórica simplificada del precio de Bitcoin" className="h-36 w-full">
          <path d={path} fill="none" stroke="#60A5FA" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => (
            <circle
              key={events[index].date}
              cx={point.x}
              cy={point.y}
              r={index === currentIndex ? 3.2 : 1.6}
              fill={index === currentIndex ? "#F0C040" : index < currentIndex ? "#22C55E" : "#8894A8"}
            />
          ))}
        </svg>
        <div className="flex items-end justify-between border-t border-tp-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Fecha</p>
            <p className="font-data text-tp-text">{current.date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Precio BTC</p>
            <p className="font-data text-lg text-tp-gold">{formatCurrency(current.price)}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">Clasifica este punto del ciclo:</p>
      <div className="grid grid-cols-2 gap-2">
        {PHASES.map((phase) => {
          const correct = selected && phase.id === answer;
          const wrong = selected === phase.id && !isCorrect;
          return (
            <button
              key={phase.id}
              onClick={() => choose(phase.id)}
              disabled={!!selected}
              className={`rounded-sm border bg-tp-base px-3 py-3 text-sm transition ${
                correct ? "border-tp-demand bg-tp-demand/10 text-tp-demand" :
                wrong ? "border-tp-supply bg-tp-supply/10 text-tp-supply" :
                `${phase.color}/40 text-tp-text hover:bg-tp-surface-alt`
              }`}
            >
              {phase.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={`rounded-sm border p-3 ${isCorrect ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`text-sm font-semibold ${isCorrect ? "text-tp-demand" : "text-tp-supply"}`}>
            {isCorrect ? "Fase correcta" : `Era ${PHASES.find((phase) => phase.id === answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{PHASE_EXPLANATIONS[answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-base">
            {currentIndex === events.length - 1 ? "Ver resultado" : "Siguiente evento"}
          </button>
        </div>
      )}
    </div>
  );
}
