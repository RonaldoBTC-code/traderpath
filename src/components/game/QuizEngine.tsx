"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/content/level1";

interface QuizEngineProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  minPassPercent?: number;
}

export default function QuizEngine({ questions, onComplete, minPassPercent }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const selectedOption = current?.options.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    const opt = current.options.find((o) => o.id === optionId);
    if (opt?.isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
      // FIX: Calculate final score including the current answer
      const finalScore = correctCount + (isCorrect ? 1 : 0);
      onComplete(finalScore, questions.length);
    }
  };

  if (finished) {
    const finalScore = correctCount;
    const percent = Math.round((finalScore / questions.length) * 100);
    const passed = !minPassPercent || percent >= minPassPercent;

    return (
      <div className="text-center space-y-4">
        <div className={`font-display text-4xl font-bold ${passed ? "text-tp-demand" : "text-tp-supply"}`}>
          {percent}%
        </div>
        <p className="text-tp-text-muted">
          {finalScore} de {questions.length} correctas
        </p>
        {passed ? (
          <p className="text-tp-demand font-medium">¡Aprobado! 🎉</p>
        ) : (
          <p className="text-tp-supply font-medium">
            Necesitas {minPassPercent}% para aprobar. Revisa las lecciones e intenta de nuevo.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Pregunta {currentIndex + 1} de {questions.length}</span>
        <span>{correctCount} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div
          className="h-full bg-tp-demand transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Difficulty badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          current.difficulty === "basico" ? "bg-tp-demand/20 text-tp-demand" :
          current.difficulty === "intermedio" ? "bg-tp-gold/20 text-tp-gold" :
          "bg-tp-supply/20 text-tp-supply"
        }`}>
          {current.difficulty}
        </span>
        <span className="text-xs text-tp-text-muted">{current.conceptEvaluated}</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold">{current.question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {current.options.map((opt) => {
          let borderColor = "border-tp-border";
          let bgColor = "bg-tp-base";

          if (showFeedback) {
            if (opt.isCorrect) {
              borderColor = "border-tp-demand";
              bgColor = "bg-tp-demand/10";
            } else if (opt.id === selectedAnswer && !isCorrect) {
              borderColor = "border-tp-supply";
              bgColor = "bg-tp-supply/10";
            }
          } else if (opt.id === selectedAnswer) {
            borderColor = "border-tp-info";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={showFeedback}
              className={`w-full text-left px-4 py-3 rounded-sm border ${borderColor} ${bgColor} transition hover:border-tp-demand/50 disabled:cursor-default`}
            >
              <span className="font-data text-tp-demand mr-2">{opt.id.toUpperCase()})</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {showFeedback && (
        <div className="space-y-3">
          <div className={`px-4 py-2 rounded-sm text-sm ${isCorrect ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
            {selectedOption?.feedback}
          </div>
          <div className="px-4 py-2 rounded-sm bg-tp-surface border border-tp-border text-sm text-tp-text-muted">
            💡 {current.explanation}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition"
          >
            {currentIndex < questions.length - 1 ? "Siguiente →" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  );
}
