"use client";

import { useState, useEffect } from "react";

interface Pair {
  term: string;
  definition: string;
}

interface Props {
  pairs: Pair[];
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

export default function MatchTermMinigame({ pairs, onComplete }: Props) {
  const [shuffledTerms, setShuffledTerms] = useState<string[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setShuffledTerms(shuffleArray(pairs.map((p) => p.term)));
    setShuffledDefs(shuffleArray(pairs.map((p) => p.definition)));
  }, [pairs]);

  if (shuffledTerms.length === 0) {
    return (
      <div className="text-center py-8 text-tp-text-muted">Cargando mini-juego...</div>
    );
  }

  const handleTermClick = (term: string) => {
    if (matchedPairs.has(term)) return;
    setSelectedTerm(term);
    setWrongPair(null);
  };

  const handleDefClick = (definition: string) => {
    if (!selectedTerm) return;
    const correctPair = pairs.find((p) => p.term === selectedTerm);
    setAttempts((a) => a + 1);

    if (correctPair && correctPair.definition === definition) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(selectedTerm);
      setMatchedPairs(newMatched);
      const newCorrect = correctMatches + 1;
      setCorrectMatches(newCorrect);
      setSelectedTerm(null);
      setWrongPair(null);

      if (newMatched.size === pairs.length) {
        // Score factors in wrong attempts: perfect = 100, each wrong = -10
        const wrongAttempts = (attempts + 1) - newCorrect;
        const finalScore = Math.max(0, Math.round(100 - wrongAttempts * 10));
        onComplete(finalScore);
      }
    } else {
      setWrongPair(definition);
      setTimeout(() => { setWrongPair(null); setSelectedTerm(null); }, 800);
    }
  };

  const progress = Math.round((matchedPairs.size / pairs.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>{matchedPairs.size} de {pairs.length} parejas</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-demand transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-tp-text-muted">Selecciona un término y luego su definición correcta.</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Terms */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest">Términos</p>
          {shuffledTerms.map((term) => {
            const isMatched = matchedPairs.has(term);
            const isSelected = selectedTerm === term;
            return (
              <button key={term} onClick={() => handleTermClick(term)} disabled={isMatched}
                className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition ${
                  isMatched ? "border-tp-demand/50 bg-tp-demand/10 opacity-60" :
                  isSelected ? "border-tp-info bg-tp-info/10" :
                  "border-tp-border bg-tp-base hover:border-tp-demand/50"
                }`}>
                {isMatched && "✓ "}{term}
              </button>
            );
          })}
        </div>
        {/* Definitions */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-tp-text-muted uppercase tracking-widest">Definiciones</p>
          {shuffledDefs.map((def) => {
            const isMatched = pairs.some((p) => p.definition === def && matchedPairs.has(p.term));
            const isWrong = wrongPair === def;
            return (
              <button key={def} onClick={() => handleDefClick(def)} disabled={isMatched || !selectedTerm}
                className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition ${
                  isMatched ? "border-tp-demand/50 bg-tp-demand/10 opacity-60" :
                  isWrong ? "border-tp-supply bg-tp-supply/10" :
                  !selectedTerm ? "border-tp-border bg-tp-base opacity-50 cursor-not-allowed" :
                  "border-tp-border bg-tp-base hover:border-tp-demand/50"
                }`}>
                {isMatched && "✓ "}{def}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
