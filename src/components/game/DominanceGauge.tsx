"use client";

import { useState } from "react";

export interface DominanceScenario {
  btcDominance: number;
  btcTrend: string;
  answer: string;
}

interface Props {
  scenarios: DominanceScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "btc", label: "Priorizar BTC" },
  { id: "btc_primero", label: "BTC primero" },
  { id: "altcoins", label: "Buscar altcoins" },
  { id: "altcoins_con_cuidado", label: "Altcoins con cautela" },
  { id: "esperar", label: "Esperar" },
];

const TREND_LABELS: Record<string, string> = {
  bajista: "Bajista",
  alcista_consolidacion: "Alcista consolidando",
  alcista_fuerte: "Alcista fuerte",
  lateral: "Lateral",
  alcista_post_halving: "Alcista post-halving",
};

const EXPLANATIONS: Record<string, string> = {
  esperar: "La dominancia aislada no compensa una estructura débil o lateral. Preservar capital también es una decisión.",
  altcoins: "BTC estable y una dominancia baja favorecen la rotación de capital hacia altcoins.",
  altcoins_con_cuidado: "La dominancia muy baja favorece altcoins, pero un BTC lateral exige selección y control del riesgo.",
  btc: "En un impulso fuerte con dominancia alta, Bitcoin está absorbiendo la mayor parte del flujo.",
  btc_primero: "Tras el halving, el capital suele entrar primero en BTC y rotar hacia altcoins más adelante.",
};

export default function DominanceGauge({ scenarios, requiredCorrect, onComplete }: Props) {
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
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Relaciona dominancia y tendencia; ninguna funciona por separado.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-base">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Lectura {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">BTC Dominance</p>
            <p className="font-data text-3xl font-bold text-tp-gold">{current.btcDominance}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">Tendencia BTC</p>
            <p className="text-sm font-semibold text-tp-text">{TREND_LABELS[current.btcTrend] ?? current.btcTrend}</p>
          </div>
        </div>
        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-tp-surface">
          <div className="h-full bg-gradient-to-r from-tp-info via-tp-gold to-tp-warning" style={{ width: `${current.btcDominance}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-tp-text-muted"><span>Capital en altcoins</span><span>Capital en BTC</span></div>
      </div>

      <p className="text-sm text-tp-text-muted">¿Qué decisión tiene mejor relación entre contexto y riesgo?</p>
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
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-base">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente lectura"}
          </button>
        </div>
      )}
    </div>
  );
}
