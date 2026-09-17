"use client";

import { useState } from "react";

export interface SessionScenario {
  utcHour: number;
  pair: string;
  answer: string;
}

interface Props {
  scenarios: SessionScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

interface SessionWindow {
  id: string;
  label: string;
  start: number;
  end: number;
}

const SESSIONS: SessionWindow[] = [
  { id: "sydney", label: "Sídney", start: 22, end: 7 },
  { id: "tokyo", label: "Tokio", start: 0, end: 9 },
  { id: "london", label: "Londres", start: 8, end: 17 },
  { id: "newyork", label: "Nueva York", start: 13, end: 22 },
];

function isActive(session: SessionWindow, hour: number): boolean {
  if (session.start < session.end) return hour >= session.start && hour < session.end;
  return hour >= session.start || hour < session.end;
}

const DECISIONS = [
  { id: "maxima_liquidez", label: "Máxima liquidez — operar con confianza" },
  { id: "liquidez_normal", label: "Liquidez normal — una sesión activa" },
  { id: "liquidez_baja", label: "Liquidez baja — mejor esperar" },
  { id: "cuidado_rollover", label: "Cuidado — hora de rollover" },
];

const EXPLANATIONS: Record<string, string> = {
  maxima_liquidez: "Dos sesiones grandes coinciden (típicamente Londres-Nueva York): mayor volumen y spreads más ajustados.",
  liquidez_normal: "Solo una sesión importante está activa. La liquidez es razonable, pero menor que en un overlap.",
  liquidez_baja: "Ninguna sesión grande está en pleno funcionamiento — spreads más anchos y movimientos menos confiables.",
  cuidado_rollover: "Cerca del horario de rollover diario, el spread suele ensancharse temporalmente por el ajuste de posiciones overnight.",
};

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00 UTC`;
}

export default function SessionClock({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">
          Necesitas {requiredCorrect} respuestas correctas. Revisa qué sesiones están activas en cada hora antes de decidir.
        </p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Momento {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctos</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Hora</p>
            <p className="font-data text-3xl font-bold text-tp-gold">{formatHour(current.utcHour)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Par</p>
            <p className="text-sm font-semibold text-tp-text">{current.pair}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SESSIONS.map((session) => {
            const active = isActive(session, current.utcHour);
            return (
              <div
                key={session.id}
                className={`rounded-sm border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "border-tp-demand bg-tp-demand/10 text-tp-demand" : "border-tp-border bg-tp-surface text-tp-text-muted"
                }`}
              >
                {session.label}
                <span className="mt-1 block text-[9px] normal-case tracking-normal">{active ? "Activa" : "Cerrada"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cuál es la decisión más prudente en este momento?</p>
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
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente momento"}
          </button>
        </div>
      )}
    </div>
  );
}
