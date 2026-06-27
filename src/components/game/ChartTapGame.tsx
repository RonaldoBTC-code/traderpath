"use client";

import { useState, useEffect, useMemo } from "react";
import TradingChart from "@/components/simulator/TradingChart";
import { generateEducationalCandles } from "@/lib/game/missionCharts";
import { shuffleArray } from "@/lib/utils/shuffle";

interface ChartScenario {
  id: string;
  type: "bullish" | "bearish" | "sideways";
  hint: string;
}

interface Props {
  charts: ChartScenario[];
  passingScore?: number;
  onComplete: (score: number) => void;
}

const EXPLANATIONS = {
  bullish: "La secuencia forma máximos más altos (HH) y mínimos más altos (HL). Los retrocesos existen, pero terminan por encima del mínimo anterior.",
  bearish: "Los rebotes producen máximos más bajos (LH) y las caídas marcan mínimos más bajos (LL). Los vendedores conservan el control.",
  sideways: "El precio oscila entre soporte y resistencia sin construir una secuencia direccional. Ningún lado domina todavía.",
};

export default function ChartTapGame({ charts, passingScore = 70, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [shuffledCharts, setShuffledCharts] = useState<ChartScenario[]>([]);
  const [failedScore, setFailedScore] = useState<number | null>(null);

  useEffect(() => {
    setShuffledCharts(shuffleArray(charts));
  }, [charts]);

  const current = shuffledCharts[currentIndex];
  const candles = useMemo(
    () => generateEducationalCandles(current?.type ?? "sideways", currentIndex + 42, 42),
    [current?.type, currentIndex]
  );

  if (shuffledCharts.length === 0) return <div className="text-tp-text-muted text-center py-4">Cargando...</div>;

  if (!current) return null;

  const handleAnswer = (answer: "bullish" | "bearish" | "sideways") => {
    if (feedback) return;
    const isCorrect = answer === current.type;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    if (currentIndex < shuffledCharts.length - 1) {
      setFeedback(null);
      setCurrentIndex((i) => i + 1);
    } else {
      const percent = Math.round((score / shuffledCharts.length) * 100);
      if (percent >= passingScore) onComplete(percent);
      else setFailedScore(percent);
    }
  };

  const retry = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setFailedScore(null);
    setShuffledCharts(shuffleArray(charts));
  };

  if (failedScore !== null) {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="font-display text-lg font-bold text-tp-warning">Necesitas reforzar la estructura</p>
        <p className="text-sm text-tp-text-muted">Obtuviste {failedScore}%. Debes alcanzar {passingScore}% antes de continuar.</p>
        <button onClick={retry} className="rounded-sm bg-tp-gold px-5 py-2 font-bold text-tp-base">Reintentar con nuevos gráficos</button>
      </div>
    );
  }

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

      {/* TradingView Lightweight Chart */}
      <div className={`bg-tp-base border rounded-sm p-4 ${
        feedback === "correct" ? "border-tp-demand" : feedback === "wrong" ? "border-tp-supply" : "border-tp-border"
      }`}>
        <TradingChart candles={candles} height={260} ariaLabel="Gráfico de clasificación de tendencia" />
        <p className="text-xs text-tp-text-muted text-center mt-2 italic">{current.hint}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-sm border p-3 text-sm ${feedback === "correct" ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`font-semibold ${feedback === "correct" ? "text-tp-demand" : "text-tp-supply"}`}>
            {feedback === "correct" ? "Lectura correcta" : `Era ${current.type === "bullish" ? "alcista" : current.type === "bearish" ? "bajista" : "lateral"}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.type]}</p>
          <button onClick={handleNext} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-base">
            {currentIndex === shuffledCharts.length - 1 ? "Continuar al quiz" : "Siguiente gráfico"}
          </button>
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
