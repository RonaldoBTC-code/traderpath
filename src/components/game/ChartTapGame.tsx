"use client";

import { useState, useEffect } from "react";

interface ChartScenario {
  id: string;
  type: "bullish" | "bearish" | "sideways";
  hint: string;
}

interface Props {
  charts: ChartScenario[];
  onComplete: (score: number) => void;
}

/** Generates a simple SVG path that looks like a price chart */
function generateChartPath(type: "bullish" | "bearish" | "sideways", seed: number): string {
  const points: number[] = [];
  let y = 50;
  for (let i = 0; i <= 10; i++) {
    const noise = ((seed * (i + 1) * 7) % 20) - 10;
    if (type === "bullish") y = 80 - (i * 5) + noise;
    else if (type === "bearish") y = 20 + (i * 5) + noise;
    else y = 50 + noise;
    points.push(Math.max(10, Math.min(90, y)));
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * 28 + 10} ${p}`).join(" ");
}

export default function ChartTapGame({ charts, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [shuffledCharts, setShuffledCharts] = useState<ChartScenario[]>([]);

  useEffect(() => {
    setShuffledCharts([...charts]);
  }, [charts]);

  if (shuffledCharts.length === 0) return <div className="text-tp-text-muted text-center py-4">Cargando...</div>;

  const current = shuffledCharts[currentIndex];
  if (!current) return null;

  const handleAnswer = (answer: "bullish" | "bearish" | "sideways") => {
    if (feedback) return;
    const isCorrect = answer === current.type;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < shuffledCharts.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / shuffledCharts.length) * 100);
        onComplete(finalScore);
      }
    }, 1200);
  };

  const path = generateChartPath(current.type, currentIndex + 42);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Gráfico {currentIndex + 1} de {shuffledCharts.length}</span>
        <span>{score} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-demand transition-all" style={{ width: `${((currentIndex) / shuffledCharts.length) * 100}%` }} />
      </div>

      {/* Chart SVG */}
      <div className={`bg-tp-base border rounded-sm p-4 ${
        feedback === "correct" ? "border-tp-demand" : feedback === "wrong" ? "border-tp-supply" : "border-tp-border"
      }`}>
        <svg viewBox="0 0 300 100" className="w-full h-40">
          <path d={path} fill="none" stroke={current.type === "bullish" ? "#22C55E" : current.type === "bearish" ? "#EF4444" : "#8894A8"} strokeWidth="2.5" />
        </svg>
        <p className="text-xs text-tp-text-muted text-center mt-2 italic">{current.hint}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center text-sm font-medium ${feedback === "correct" ? "text-tp-demand" : "text-tp-supply"}`}>
          {feedback === "correct" ? "✅ ¡Correcto!" : `❌ Incorrecto — era ${current.type === "bullish" ? "alcista" : current.type === "bearish" ? "bajista" : "lateral"}`}
        </div>
      )}

      {/* Buttons */}
      {!feedback && (
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleAnswer("bullish")} className="px-3 py-2 bg-tp-demand/10 border border-tp-demand/40 rounded-sm text-tp-demand text-sm font-medium hover:bg-tp-demand/20 transition">
            📈 Alcista
          </button>
          <button onClick={() => handleAnswer("sideways")} className="px-3 py-2 bg-tp-text-muted/10 border border-tp-border rounded-sm text-tp-text-muted text-sm font-medium hover:bg-tp-text-muted/20 transition">
            ➡️ Lateral
          </button>
          <button onClick={() => handleAnswer("bearish")} className="px-3 py-2 bg-tp-supply/10 border border-tp-supply/40 rounded-sm text-tp-supply text-sm font-medium hover:bg-tp-supply/20 transition">
            📉 Bajista
          </button>
        </div>
      )}
    </div>
  );
}
