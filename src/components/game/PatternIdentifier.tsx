"use client";

import { useState } from "react";

interface Pattern {
  id: string;
  pattern: string;
  signal: "bullish" | "bearish" | "neutral";
}

interface Props {
  patterns: Pattern[];
  onComplete: (score: number) => void;
}

const PATTERN_LABELS: Record<string, string> = {
  doji: "Doji",
  hammer: "Hammer",
  shooting_star: "Shooting Star",
  bullish_engulfing: "Engulfing Alcista",
  bearish_engulfing: "Engulfing Bajista",
  pin_bar_alcista: "Pin Bar Alcista",
  morning_star: "Estrella de la Mañana",
  evening_star: "Estrella de la Tarde",
};

const SIGNAL_LABELS: Record<string, { label: string; color: string }> = {
  bullish: { label: "Alcista", color: "text-tp-demand" },
  bearish: { label: "Bajista", color: "text-tp-supply" },
  neutral: { label: "Neutral", color: "text-tp-text-muted" },
};

export default function PatternIdentifier({ patterns, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const current = patterns[currentIndex];
  if (!current) return null;

  const handleSelect = (signal: string) => {
    if (feedback) return;
    setSelectedSignal(signal);
    const isCorrect = signal === current.signal;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setSelectedSignal(null);
      if (currentIndex < patterns.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / patterns.length) * 100);
        onComplete(finalScore);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Patrón {currentIndex + 1} de {patterns.length}</span>
        <span>{score} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-gold transition-all" style={{ width: `${(currentIndex / patterns.length) * 100}%` }} />
      </div>

      {/* Pattern display */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-6 text-center">
        <p className="text-[10px] text-tp-text-muted uppercase tracking-widest mb-2">Identifica la señal del patrón:</p>
        <p className="font-display text-xl font-bold text-tp-gold">{PATTERN_LABELS[current.pattern] || current.pattern}</p>
      </div>

      {/* Signal options */}
      <p className="text-xs text-tp-text-muted">¿Este patrón da señal alcista, bajista, o neutral?</p>
      <div className="grid grid-cols-3 gap-3">
        {(["bullish", "bearish", "neutral"] as const).map((signal) => {
          const { label, color } = SIGNAL_LABELS[signal];
          let borderClass = "border-tp-border";
          if (feedback && signal === current.signal) borderClass = "border-tp-demand";
          else if (feedback && signal === selectedSignal) borderClass = "border-tp-supply";
          else if (!feedback && signal === selectedSignal) borderClass = "border-tp-info";

          return (
            <button key={signal} onClick={() => handleSelect(signal)} disabled={!!feedback}
              className={`px-3 py-3 rounded-sm border text-sm font-medium transition ${borderClass} ${color} hover:border-tp-gold/50 disabled:cursor-default bg-tp-base`}>
              {signal === "bullish" ? "📈" : signal === "bearish" ? "📉" : "➡️"} {label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`rounded-sm p-2 text-sm text-center ${feedback === "correct" ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
          {feedback === "correct" ? "✅ ¡Correcto!" : `❌ La señal correcta es: ${SIGNAL_LABELS[current.signal].label}`}
        </div>
      )}
    </div>
  );
}
