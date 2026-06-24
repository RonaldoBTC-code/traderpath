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
      onComplete(correctCount, questions.length);
    }
  };

  if (finished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = !minPassPercent || percent >= minPassPercent;

    return (
      <div className="text-center space-y-4">
        <div className={`text-4xl font-bold ${passed ? "text-tp-accent-green" : "text-tp-accent-red"}`}>
          {percent}%
        </div>
        <p className="text-tp-text-secondary">
          {correctCount} de {questions.length} correctas
        </p>
        {passed ? (
          <p className="text-tp-accent-green font-medium">¡Aprobado! 🎉</p>
        ) : (
          <p className="text-tp-accent-red font-medium">
            Necesitas {minPassPercent}% para aprobar. Revisa las lecciones e intenta de nuevo.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-secondary">
        <span>Pregunta {currentIndex + 1} de {questions.length}</span>
        <span>{correctCount} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-tp-accent-green transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Difficulty badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          current.difficulty === "basico" ? "bg-tp-accent-green/20 text-tp-accent-green" :
          current.difficulty === "intermedio" ? "bg-tp-accent-gold/20 text-tp-accent-gold" :
          "bg-tp-accent-red/20 text-tp-accent-red"
        }`}>
          {current.difficulty}
        </span>
        <span className="text-xs text-tp-text-secondary">{current.conceptEvaluated}</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold">{current.question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {current.options.map((opt) => {
          let borderColor = "border-tp-border";
          let bgColor = "bg-tp-bg-primary";

          if (showFeedback) {
            if (opt.isCorrect) {
              borderColor = "border-tp-accent-green";
              bgColor = "bg-tp-accent-green/10";
            } else if (opt.id === selectedAnswer && !isCorrect) {
              borderColor = "border-tp-accent-red";
              bgColor = "bg-tp-accent-red/10";
            }
          } else if (opt.id === selectedAnswer) {
            borderColor = "border-tp-accent-blue";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={showFeedback}
              className={`w-full text-left px-4 py-3 rounded-lg border ${borderColor} ${bgColor} transition hover:border-tp-accent-green/50 disabled:cursor-default`}
            >
              <span className="font-mono text-tp-accent-green mr-2">{opt.id.toUpperCase()})</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {showFeedback && (
        <div className="space-y-3">
          {/* Per-option feedback */}
          <div className={`px-4 py-2 rounded-lg text-sm ${isCorrect ? "bg-tp-accent-green/10 text-tp-accent-green" : "bg-tp-accent-red/10 text-tp-accent-red"}`}>
            {selectedOption?.feedback}
          </div>
          {/* Explanation */}
          <div className="px-4 py-2 rounded-lg bg-tp-bg-secondary border border-tp-border text-sm text-tp-text-secondary">
            💡 {current.explanation}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
          >
            {currentIndex < questions.length - 1 ? "Siguiente →" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  );
}
