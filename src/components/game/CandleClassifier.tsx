"use client";

import { useState } from "react";

interface Props {
  onComplete: (score: number) => void;
}

interface Step {
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

const CHART_STEPS: Step[] = [
  {
    question: "Observa el gráfico. ¿Cuál es la tendencia dominante?",
    options: [
      { id: "a", text: "Alcista (HH y HL visibles)", isCorrect: false },
      { id: "b", text: "Bajista (LH y LL visibles)", isCorrect: false },
      { id: "c", text: "Rango lateral entre $80,600 y $98,000", isCorrect: true },
      { id: "d", text: "Sin tendencia clara — movimiento aleatorio", isCorrect: false },
    ],
    explanation: "El precio rebota entre un soporte ($80,600-$84,000) y una resistencia ($94,000-$98,000) sin romper ninguno. Eso es un rango lateral.",
  },
  {
    question: "¿Cuál es la vela más significativa en la zona de resistencia?",
    options: [
      { id: "a", text: "Una vela verde grande (engulfing alcista)", isCorrect: false },
      { id: "b", text: "Un Doji o Shooting Star en la resistencia — señal de rechazo", isCorrect: true },
      { id: "c", text: "Una vela roja pequeña sin mecha", isCorrect: false },
      { id: "d", text: "No hay velas significativas", isCorrect: false },
    ],
    explanation: "En la resistencia, una Shooting Star o Doji con mecha superior larga indica que los vendedores rechazaron los precios altos. Es la señal de mayor calidad en este contexto.",
  },
  {
    question: "Si decides vender en la resistencia, ¿dónde colocarías el Stop Loss?",
    options: [
      { id: "a", text: "Exactamente en $98,000 (el nivel de resistencia)", isCorrect: false },
      { id: "b", text: "Por encima de la resistencia, en ~$99,000-$100,000 — donde el escenario se invalida", isCorrect: true },
      { id: "c", text: "En $90,000 (a medio camino del rango)", isCorrect: false },
      { id: "d", text: "No necesito Stop Loss si el análisis es correcto", isCorrect: false },
    ],
    explanation: "El SL va donde la lógica se invalida. Si vendes en resistencia esperando un rechazo, el escenario falla si el precio supera esa resistencia. SL ligeramente por encima.",
  },
  {
    question: "Con capital de $1,000, SL de $2,000 de distancia y regla del 2% de riesgo: ¿entras o esperas?",
    options: [
      { id: "a", text: "Entro con todo el capital disponible", isCorrect: false },
      { id: "b", text: "Entro con tamaño de posición calculado: $20 de riesgo máximo = posición muy pequeña pero disciplinada", isCorrect: true },
      { id: "c", text: "Espero a que el precio rompa la resistencia para entrar largo", isCorrect: false },
      { id: "d", text: "El rango es demasiado grande, no opero", isCorrect: false },
    ],
    explanation: "2% de $1,000 = $20 máximo de riesgo. Con SL de $2,000 de distancia, la posición sería muy pequeña (~0.01 BTC). Es disciplina pura. La alternativa válida es esperar una zona más ceñida.",
  },
];

// Simple SVG chart showing a range-bound market
function RangeChart() {
  const points = [
    85, 88, 92, 96, 94, 90, 83, 86, 91, 95, 97, 93, 87, 82, 84, 89, 94, 96, 92, 88
  ];
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * 15 + 10} ${100 - p}`).join(" ");

  return (
    <svg viewBox="0 0 300 110" className="w-full h-44">
      {/* Resistance zone */}
      <rect x="0" y="3" width="300" height="8" fill="#EF4444" opacity="0.15" />
      <text x="5" y="9" fill="#EF4444" fontSize="5" opacity="0.7">Resistencia $94K-$98K</text>
      {/* Support zone */}
      <rect x="0" y="97" width="300" height="8" fill="#22C55E" opacity="0.15" />
      <text x="5" y="103" fill="#22C55E" fontSize="5" opacity="0.7">Soporte $80K-$84K</text>
      {/* Price line */}
      <path d={path} fill="none" stroke="#F0C040" strokeWidth="2" />
      {/* Current price dot */}
      <circle cx="295" cy={100 - points[points.length - 1]} r="3" fill="#F0C040" />
    </svg>
  );
}

export default function CandleClassifier({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = CHART_STEPS[currentStep];
  if (!step) return null;

  const selectedOption = step.options.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (id: string) => {
    if (showFeedback) return;
    setSelectedAnswer(id);
    setShowFeedback(true);
    if (step.options.find((o) => o.id === id)?.isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < CHART_STEPS.length - 1) {
      setCurrentStep((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
      const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / CHART_STEPS.length) * 100);
      onComplete(finalScore);
    }
  };

  if (finished) {
    const percent = Math.round((score / CHART_STEPS.length) * 100);
    return (
      <div className="text-center space-y-3">
        <div className={`font-display text-3xl font-bold ${percent >= 75 ? "text-tp-demand" : "text-tp-supply"}`}>{percent}%</div>
        <p className="text-tp-text-muted">{score} de {CHART_STEPS.length} pasos correctos</p>
        {percent >= 75 ? (
          <p className="text-tp-demand">✅ El Viejo Marco aprueba tu análisis.</p>
        ) : (
          <p className="text-tp-supply">❌ Necesitas 75% para aprobar el desafío.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Paso {currentStep + 1} de {CHART_STEPS.length}</span>
        <span>{score} correctos</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-gold transition-all" style={{ width: `${((currentStep) / CHART_STEPS.length) * 100}%` }} />
      </div>

      {/* Chart */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-3">
        <RangeChart />
        <p className="text-[10px] text-tp-text-muted text-center mt-1">BTC/USDT 4H — Escenario histórico real</p>
      </div>

      {/* Question */}
      <h4 className="font-body text-sm font-semibold">{step.question}</h4>

      {/* Options */}
      <div className="space-y-2">
        {step.options.map((opt) => {
          let classes = "border-tp-border bg-tp-base";
          if (showFeedback) {
            if (opt.isCorrect) classes = "border-tp-demand bg-tp-demand/10";
            else if (opt.id === selectedAnswer) classes = "border-tp-supply bg-tp-supply/10";
          } else if (opt.id === selectedAnswer) {
            classes = "border-tp-info bg-tp-info/10";
          }
          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={showFeedback}
              className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition ${classes} hover:border-tp-gold/50 disabled:cursor-default`}>
              <span className="font-data text-tp-gold mr-1">{opt.id.toUpperCase()})</span> {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="space-y-2">
          <div className={`px-3 py-2 rounded-sm text-sm ${isCorrect ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
            {isCorrect ? "✅ Correcto" : "❌ Incorrecto"}
          </div>
          <div className="px-3 py-2 rounded-sm bg-tp-surface border border-tp-border text-xs text-tp-text-muted">
            💡 {step.explanation}
          </div>
          <button onClick={handleNext} className="px-5 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            {currentStep < CHART_STEPS.length - 1 ? "Siguiente paso →" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  );
}
