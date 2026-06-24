"use client";

import { useState, useEffect, useCallback } from "react";

interface MatchPair {
  term: string;
  definition: string;
}

interface Props {
  pairs: MatchPair[];
  timeLimit: number;
  passingScore: number;
  onComplete: (score: number, total: number) => void;
}

export default function MatchTermMinigame({
  pairs,
  timeLimit,
  passingScore,
  onComplete,
}: Props) {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([]);

  // Shuffle definitions on mount
  useEffect(() => {
    const defs = pairs.map((p) => p.definition);
    setShuffledDefs(defs.sort(() => Math.random() - 0.5));
  }, [pairs]);

  // Timer countdown
  useEffect(() => {
    if (finished || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finished, timeLeft]);

  // Check if all matched
  useEffect(() => {
    if (Object.keys(matches).length === pairs.length && !finished) {
      setFinished(true);
    }
  }, [matches, pairs.length, finished]);

  // Report score when finished
  useEffect(() => {
    if (finished) {
      const correct = Object.entries(matches).filter(([term, def]) => {
        const pair = pairs.find((p) => p.term === term);
        return pair?.definition === def;
      }).length;
      onComplete(correct, pairs.length);
    }
  }, [finished, matches, pairs, onComplete]);

  const handleTermClick = (term: string) => {
    if (finished || matches[term]) return;
    setSelectedTerm(term === selectedTerm ? null : term);
    setWrongPair(null);
  };

  const handleDefClick = (def: string) => {
    if (finished || !selectedTerm) return;
    // Check if this def is already matched
    if (Object.values(matches).includes(def)) return;

    const pair = pairs.find((p) => p.term === selectedTerm);
    if (pair?.definition === def) {
      // Correct match
      setMatches((m) => ({ ...m, [selectedTerm]: def }));
      setSelectedTerm(null);
      setWrongPair(null);
    } else {
      // Wrong match — flash red
      setWrongPair(def);
      setTimeout(() => setWrongPair(null), 600);
    }
  };

  const correctCount = Object.entries(matches).filter(([term, def]) => {
    const pair = pairs.find((p) => p.term === term);
    return pair?.definition === def;
  }).length;

  const percent = Math.round((correctCount / pairs.length) * 100);
  const passed = percent >= passingScore;

  if (finished) {
    return (
      <div className="text-center space-y-4 py-4">
        <div
          className={`text-5xl font-bold ${
            passed ? "text-tp-accent-green" : "text-tp-accent-red"
          }`}
        >
          {percent}%
        </div>
        <p className="text-tp-text-secondary">
          {correctCount} de {pairs.length} correctas
        </p>
        {timeLeft === 0 && !passed && (
          <p className="text-tp-accent-red text-sm">⏱️ Se acabó el tiempo</p>
        )}
        {passed ? (
          <p className="text-tp-accent-green font-medium text-lg">¡Mini-juego completado! 🎉</p>
        ) : (
          <p className="text-tp-accent-red font-medium">
            Necesitas {passingScore}% para aprobar
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-tp-text-secondary">
          Conecta cada término con su definición
        </p>
        <div
          className={`font-mono text-sm px-3 py-1 rounded-full ${
            timeLeft <= 10
              ? "bg-tp-accent-red/20 text-tp-accent-red"
              : "bg-tp-bg-primary text-tp-text-secondary"
          }`}
        >
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-tp-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-tp-accent-green transition-all duration-300"
          style={{ width: `${(correctCount / pairs.length) * 100}%` }}
        />
      </div>

      {/* Game board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Terms column */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-tp-text-secondary mb-2">
            Términos
          </p>
          {pairs.map((pair) => {
            const isMatched = !!matches[pair.term];
            const isSelected = selectedTerm === pair.term;

            return (
              <button
                key={pair.term}
                onClick={() => handleTermClick(pair.term)}
                disabled={isMatched}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isMatched
                    ? "border-tp-accent-green/50 bg-tp-accent-green/10 text-tp-accent-green opacity-60"
                    : isSelected
                    ? "border-tp-accent-blue bg-tp-accent-blue/10 text-tp-text-primary scale-[1.02] shadow-lg shadow-tp-accent-blue/10"
                    : "border-tp-border bg-tp-bg-secondary text-tp-text-primary hover:border-tp-accent-blue/50"
                }`}
              >
                {isMatched && <span className="mr-2">✓</span>}
                {pair.term}
              </button>
            );
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-tp-text-secondary mb-2">
            Definiciones
          </p>
          {shuffledDefs.map((def) => {
            const isMatched = Object.values(matches).includes(def);
            const isWrong = wrongPair === def;

            return (
              <button
                key={def}
                onClick={() => handleDefClick(def)}
                disabled={isMatched || !selectedTerm}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  isMatched
                    ? "border-tp-accent-green/50 bg-tp-accent-green/10 text-tp-accent-green opacity-60"
                    : isWrong
                    ? "border-tp-accent-red bg-tp-accent-red/10 text-tp-accent-red animate-pulse"
                    : selectedTerm
                    ? "border-tp-border bg-tp-bg-secondary text-tp-text-secondary hover:border-tp-accent-green/50 hover:bg-tp-accent-green/5 cursor-pointer"
                    : "border-tp-border bg-tp-bg-secondary text-tp-text-secondary opacity-50 cursor-not-allowed"
                }`}
              >
                {isMatched && <span className="mr-2">✓</span>}
                {def}
              </button>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      {!selectedTerm && correctCount === 0 && (
        <p className="text-center text-tp-text-secondary/50 text-xs">
          👆 Selecciona un término de la izquierda, luego su definición de la derecha
        </p>
      )}
    </div>
  );
}
