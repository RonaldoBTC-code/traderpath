"use client";

import { useState, useEffect } from "react";
import type { QuizQuestion } from "@/lib/content/level1";
import { shuffleArray } from "@/lib/utils/shuffle";

interface QuizEngineProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  minPassPercent?: number;
}

export default function QuizEngine({ questions, onComplete, minPassPercent }: QuizEngineProps) {
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Randomize questions and options on mount (avoids hydration mismatch)
  useEffect(() => {
    const shuffled = shuffleArray(questions).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setRandomizedQuestions(shuffled);
  }, [questions]);

  // Show loading until randomization is ready
  if (randomizedQuestions.length === 0) {
    return <div className="text-center py-4 text-tp-text-muted">Preparando preguntas...</div>;
  }

  const current = randomizedQuestions[currentIndex];
  const selectedOption = current?.options.find((o) => o.id === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    setShowHint(false);
    if (current.options.find((o) => o.id === optionId)?.isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < randomizedQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setFinished(true);
      // The selected answer was already counted in handleSelect.
      // Adding isCorrect here counted the last correct answer twice.
      const finalScore = correctCount;
      onComplete(finalScore, randomizedQuestions.length);
    }
  };

  const retry = () => {
    const shuffled = shuffleArray(questions).map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }));
    setRandomizedQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setFinished(false);
    setShowHint(false);
  };

  if (finished) {
    const finalScore = correctCount;
    const percent = Math.round((finalScore / randomizedQuestions.length) * 100);
    const passed = !minPassPercent || percent >= minPassPercent;

    return (
      <div className="text-center space-y-4">
        <div className={`font-display text-4xl font-bold ${passed ? "text-tp-demand" : "text-tp-supply"}`}>
          {percent}%
        </div>
        <p className="text-tp-text-muted">
          {finalScore} de {randomizedQuestions.length} correctas
        </p>
        {passed ? (
          <p className="text-tp-demand font-medium">¡Aprobado! 🎉</p>
        ) : (
          <>
            <p className="text-tp-supply font-medium">
              Aún no apruebas. Necesitas {minPassPercent}%.
            </p>
            <p className="text-xs leading-relaxed text-tp-text-muted">
              La misión no se marcará como completada ni entregará recompensas hasta superar la evaluación.
            </p>
            <button
              type="button"
              onClick={retry}
              className="rounded-xl bg-tp-gold px-5 py-2.5 font-display text-sm font-bold text-tp-base transition hover:brightness-110"
            >
              Repasar e intentar de nuevo
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Pregunta {currentIndex + 1} de {randomizedQuestions.length}</span>
        <span>{correctCount} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-demand transition-all" style={{ width: `${((currentIndex + 1) / randomizedQuestions.length) * 100}%` }} />
      </div>

      {/* Difficulty + concept */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          current.difficulty === "basico" ? "bg-tp-demand/15 text-tp-demand" :
          current.difficulty === "intermedio" ? "bg-tp-gold/15 text-tp-gold" :
          "bg-tp-supply/15 text-tp-supply"
        }`}>
          {current.difficulty}
        </span>
        <span className="text-[10px] text-tp-text-muted">{current.conceptEvaluated}</span>
      </div>

      {/* Question */}
      <h3 className="text-sm font-semibold leading-relaxed">{current.question}</h3>

      {/* Hint button */}
      {!showFeedback && !showHint && (
        <button onClick={() => setShowHint(true)} className="text-[10px] text-tp-info hover:underline">
          💡 ¿Necesitas una pista?
        </button>
      )}
      {showHint && !showFeedback && (
        <div className="bg-tp-info/5 border border-tp-info/20 rounded-sm p-3">
          <p className="text-xs text-tp-info">💡 Piensa en el concepto: {current.conceptEvaluated}. Lee cada opción con cuidado.</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((opt) => {
          let borderColor = "border-tp-border";
          let bgColor = "bg-tp-base";

          if (showFeedback) {
            if (opt.isCorrect) { borderColor = "border-tp-demand"; bgColor = "bg-tp-demand/10"; }
            else if (opt.id === selectedAnswer) { borderColor = "border-tp-supply"; bgColor = "bg-tp-supply/10"; }
          } else if (opt.id === selectedAnswer) {
            borderColor = "border-tp-info";
          }

          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={showFeedback}
              className={`w-full text-left px-4 py-3 rounded-sm border ${borderColor} ${bgColor} transition hover:border-tp-gold/50 disabled:cursor-default`}>
              <span className="font-data text-tp-gold mr-2 text-xs">{opt.id.toUpperCase()})</span>
              <span className="text-sm">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="space-y-3">
          <div className={`px-4 py-3 rounded-sm text-sm ${isCorrect ? "bg-tp-demand/10 border border-tp-demand/30" : "bg-tp-supply/10 border border-tp-supply/30"}`}>
            <p className={`font-medium mb-1 ${isCorrect ? "text-tp-demand" : "text-tp-supply"}`}>
              {isCorrect ? "✅ ¡Correcto!" : "❌ No exactamente."}
            </p>
            <p className="text-tp-text-muted text-xs">{selectedOption?.feedback}</p>
          </div>
          <div className="px-4 py-3 rounded-sm bg-tp-surface-alt border border-tp-border">
            <p className="text-[10px] text-tp-gold uppercase tracking-widest mb-1">Explicación</p>
            <p className="text-xs text-tp-text-muted leading-relaxed">{current.explanation}</p>
          </div>
          <button onClick={handleNext}
            className="w-full px-5 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            {currentIndex < randomizedQuestions.length - 1 ? "Siguiente pregunta →" : "Ver resultado →"}
          </button>
        </div>
      )}
    </div>
  );
}
