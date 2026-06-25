"use client";

import { useState } from "react";

interface Scenario {
  capital: number;
  entryPrice: number;
  stopLoss: number;
  correctUnits: number;
  explanation: string;
}

interface Props {
  scenarios: Scenario[];
  riskPercentage: number;
  onComplete: (score: number) => void;
}

export default function RiskCalculator({ scenarios, riskPercentage, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const current = scenarios[currentIndex];
  if (!current) return null;

  const riskPerUnit = current.entryPrice - current.stopLoss;
  const maxRisk = current.capital * riskPercentage;

  const handleSubmit = () => {
    if (!answer || feedback) return;
    const userAnswer = parseFloat(answer);
    const tolerance = current.correctUnits * 0.15; // 15% tolerance
    const isCorrect = Math.abs(userAnswer - current.correctUnits) <= tolerance;

    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / scenarios.length) * 100);
        onComplete(finalScore);
      }
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Escenario {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      {/* Scenario data */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-4 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-tp-text-muted uppercase">Capital</p>
            <p className="font-data text-tp-gold">${current.capital.toLocaleString("en-US")}</p>
          </div>
          <div>
            <p className="text-[10px] text-tp-text-muted uppercase">Entrada</p>
            <p className="font-data text-tp-text">${current.entryPrice}</p>
          </div>
          <div>
            <p className="text-[10px] text-tp-text-muted uppercase">Stop Loss</p>
            <p className="font-data text-tp-supply">${current.stopLoss}</p>
          </div>
        </div>
        <div className="text-center border-t border-tp-border pt-2">
          <p className="text-xs text-tp-text-muted">Riesgo máximo: <span className="text-tp-warning font-data">{riskPercentage * 100}%</span> = <span className="font-data text-tp-warning">${maxRisk}</span></p>
          <p className="text-xs text-tp-text-muted">Riesgo por unidad: <span className="font-data">${riskPerUnit}</span></p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="¿Cuántas unidades?"
          disabled={!!feedback}
          className="flex-1 px-4 py-2 bg-tp-base border border-tp-border rounded-sm text-tp-text font-data placeholder:text-tp-text-muted/50 focus:outline-none focus:border-tp-gold transition"
        />
        <button onClick={handleSubmit} disabled={!answer || !!feedback}
          className="px-4 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition disabled:opacity-50">
          Verificar
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-sm p-3 text-sm ${feedback === "correct" ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
          {feedback === "correct" ? "✅ ¡Correcto!" : `❌ Respuesta correcta: ${current.correctUnits} unidades`}
          <p className="text-tp-text-muted text-xs mt-1">{current.explanation}</p>
        </div>
      )}
    </div>
  );
}
