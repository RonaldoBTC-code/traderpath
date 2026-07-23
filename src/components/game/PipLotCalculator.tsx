"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export interface PipLotScenario {
  pair: string;
  stopLossPips: number;
  pipValuePerLot: number;
  correctLots: number;
}

interface Props {
  capital: number;
  riskPct: number;
  scenarios: PipLotScenario[];
  tolerance?: number;
  passingScore?: number;
  onComplete: (score: number) => void;
}

export default function PipLotCalculator({
  capital,
  riskPct,
  scenarios,
  tolerance = 0.08,
  passingScore = 70,
  onComplete,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [failedScore, setFailedScore] = useState<number | null>(null);

  const current = scenarios[currentIndex];
  const maximumRisk = capital * riskPct;

  const reset = () => {
    setCurrentIndex(0);
    setAnswer("");
    setScore(0);
    setFeedback(null);
    setFailedScore(null);
  };

  const checkAnswer = () => {
    const lots = Number(answer.replace(",", "."));
    if (!Number.isFinite(lots) || lots <= 0 || feedback) return;

    const exactLots = maximumRisk / (current.stopLossPips * current.pipValuePerLot);
    const isCorrect = Math.abs(lots - exactLots) / exactLots <= tolerance;
    const nextScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) setScore(nextScore);

    setFeedback({
      correct: isCorrect,
      message: isCorrect
        ? `Correcto: arriesgas aproximadamente $${maximumRisk.toFixed(2)}, el ${(riskPct * 100).toFixed(0)}% del capital.`
        : `${current.stopLossPips} pips × $${current.pipValuePerLot}/pip = $${(current.stopLossPips * current.pipValuePerLot).toFixed(2)} de riesgo por lote. $${maximumRisk.toFixed(2)} ÷ eso = ${current.correctLots.toFixed(2)} lotes.`,
    });
  };

  const next = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((index) => index + 1);
      setAnswer("");
      setFeedback(null);
      return;
    }

    const percent = Math.round((score / scenarios.length) * 100);
    if (percent >= passingScore) onComplete(percent);
    else setFailedScore(percent);
  };

  if (failedScore !== null) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display text-lg font-bold text-tp-warning">Necesitas practicar el cálculo</p>
        <p className="text-sm text-tp-text-muted">
          Obtuviste {failedScore}%. Debes alcanzar {passingScore}%. Recuerda: riesgo máximo ÷ (SL en pips × valor del pip por lote).
        </p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-tp-text-muted">
        <span>Par {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctos</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-tp-base">
        <div className="h-full bg-tp-gold transition-all" style={{ width: `${(currentIndex / scenarios.length) * 100}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Par" value={current.pair} />
        <Metric label="Capital" value={formatCurrency(capital)} />
        <Metric label="SL (pips)" value={`${current.stopLossPips}`} />
        <Metric label="Valor pip/lote" value={`$${current.pipValuePerLot}`} />
      </div>

      <div className="rounded-sm border border-tp-info/30 bg-tp-info/5 p-3 text-xs text-tp-text-muted">
        Riesgo permitido: <span className="font-data text-tp-info">${maximumRisk.toFixed(2)}</span>. Calcula cuántos lotes puedes operar.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="pip-lots">Lotes</label>
        <input
          id="pip-lots"
          type="number"
          min="0"
          step="any"
          value={answer}
          disabled={!!feedback}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && checkAnswer()}
          placeholder="Lotes"
          className="min-w-0 flex-1 rounded-sm border border-tp-border bg-tp-base px-4 py-2 font-data text-tp-text outline-none focus:border-tp-gold"
        />
        <button
          onClick={feedback ? next : checkAnswer}
          disabled={!feedback && !answer}
          className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          {feedback ? (currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente") : "Comprobar"}
        </button>
      </div>

      {feedback && (
        <div className={`rounded-sm border p-3 text-sm ${feedback.correct ? "border-tp-demand/40 bg-tp-demand/10 text-tp-demand" : "border-tp-supply/40 bg-tp-supply/10 text-tp-text"}`}>
          <p className="font-semibold">{feedback.correct ? "Cálculo correcto" : "Revisa la fórmula"}</p>
          <p className="mt-1 text-xs text-tp-text-muted">{feedback.message}</p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-tp-border bg-tp-base p-3">
      <p className="text-[10px] uppercase tracking-wider text-tp-text-muted">{label}</p>
      <p className="mt-1 break-words font-data text-sm text-tp-text">{value}</p>
    </div>
  );
}
