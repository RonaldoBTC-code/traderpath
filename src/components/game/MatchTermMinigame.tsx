"use client";

import { useState, useEffect } from "react";

interface Pair {
  term: string;
  definition: string;
}

interface Props {
  pairs: Pair[];
  timeLimit?: number;
  onComplete: (score: number) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchTermMinigame({ pairs, timeLimit, onComplete }: Props) {
  const [shuffledTerms, setShuffledTerms] = useState<string[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Shuffle only on mount to avoid hydration issues
  useEffect(() => {
    setShuffledTerms(shuffleArray(pairs.map((p) => p.term)));
    setShuffledDefs(shuffleArray(pairs.map((p) => p.definition)));
  }, [pairs]);

  // Don't render until shuffled (avoids hydration mismatch)
  if (shuffledTerms.length === 0) {
    return (
      <div className="text-center py-8 text-tp-text-secondary">
        Cargando mini-juego...
      </div>
    );
  }

  const handleTermClick = (term: string) => {
    if (matchedPairs.has(term)) return;
    setSelectedTerm(term);
    setWrongPair(null);
  };

  const handleDefClick = (definition: string) => {
    if (!selectedTerm) return;

    // Find the correct pair
    const correctPair = pairs.find((p) => p.term === selectedTerm);
    setAttempts((a) => a + 1);

    if (correctPair && correctPair.definition === definition) {
      // Correct match
      const newMatched = new Set(matchedPairs);
      newMatched.add(selectedTerm);
      setMatchedPairs(newMatched);
      setScore((s) => s + 1);
      setSelectedTerm(null);
      setWrongPair(null);

      // Check if all pairs matched
      if (newMatched.size === pairs.length) {
        const finalScore = Math.round(((score + 1) / pairs.length) * 100);
        onComplete(finalScore);
      }
    } else {
      // Wrong match
      setWrongPair(definition);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 800);
    }
  };

  const progress = Math.round((matchedPairs.size / pairs.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-secondary">
        <span>{matchedPairs.size} de {pairs.length} parejas</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-tp-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-tp-accent-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Instructions */}
      <p className="text-xs text-tp-text-secondary">
        Selecciona un término (izquierda) y luego su definición correcta (derecha).
      </p>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Terms column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-tp-text-secondary uppercase">Términos</p>
          {shuffledTerms.map((term) => {
            const isMatched = matchedPairs.has(term);
            const isSelected = selectedTerm === term;
            return (
              <button
                key={term}
                onClick={() => handleTermClick(term)}
                disabled={isMatched}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                  isMatched
                    ? "border-tp-accent-green/50 bg-tp-accent-green/10 opacity-60"
                    : isSelected
                    ? "border-tp-accent-blue bg-tp-accent-blue/10"
                    : "border-tp-border bg-tp-bg-primary hover:border-tp-accent-green/50"
                }`}
              >
                {isMatched && "✓ "}{term}
              </button>
            );
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-tp-text-secondary uppercase">Definiciones</p>
          {shuffledDefs.map((def) => {
            // Check if this definition is already matched
            const isMatched = pairs.some(
              (p) => p.definition === def && matchedPairs.has(p.term)
            );
            const isWrong = wrongPair === def;
            return (
              <button
                key={def}
                onClick={() => handleDefClick(def)}
                disabled={isMatched || !selectedTerm}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                  isMatched
                    ? "border-tp-accent-green/50 bg-tp-accent-green/10 opacity-60"
                    : isWrong
                    ? "border-tp-accent-red bg-tp-accent-red/10"
                    : !selectedTerm
                    ? "border-tp-border bg-tp-bg-primary opacity-50 cursor-not-allowed"
                    : "border-tp-border bg-tp-bg-primary hover:border-tp-accent-green/50"
                }`}
              >
                {isMatched && "✓ "}{def}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
