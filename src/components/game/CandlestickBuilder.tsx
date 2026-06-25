"use client";

import { useState } from "react";

interface CandleScenario {
  open: number;
  high: number;
  low: number;
  close: number;
  expectedColor: "green" | "red";
  note?: string;
}

interface Props {
  scenarios: CandleScenario[];
  onComplete: (score: number) => void;
}

export default function CandlestickBuilder({ scenarios, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userOpen, setUserOpen] = useState("");
  const [userClose, setUserClose] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const current = scenarios[currentIndex];
  if (!current) return null;

  const handleSubmit = () => {
    if (!userOpen || !userClose || feedback) return;
    const o = parseFloat(userOpen);
    const c = parseFloat(userClose);

    // Check if user correctly identifies open and close
    const isCorrectColor = c > o ? "green" : "red";
    const isCorrect = isCorrectColor === current.expectedColor &&
      Math.abs(o - current.open) < 2 &&
      Math.abs(c - current.close) < 2;

    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setUserOpen("");
      setUserClose("");
      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onComplete(Math.round(((score + (isCorrect ? 1 : 0)) / scenarios.length) * 100));
      }
    }, 2000);
  };

  // Visual candle preview based on user inputs
  const previewOpen = parseFloat(userOpen) || 0;
  const previewClose = parseFloat(userClose) || 0;
  const previewColor = previewClose > previewOpen ? "#22C55E" : previewClose < previewOpen ? "#EF4444" : "#8894A8";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Vela {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      {/* Given data */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-4">
        <p className="text-xs text-tp-text-muted mb-2 uppercase tracking-widest">Datos de la vela:</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div><p className="text-[10px] text-tp-text-muted">High</p><p className="font-data text-tp-demand">{current.high}</p></div>
          <div><p className="text-[10px] text-tp-text-muted">Low</p><p className="font-data text-tp-supply">{current.low}</p></div>
          <div><p className="text-[10px] text-tp-text-muted">Open</p><p className="font-data">?</p></div>
          <div><p className="text-[10px] text-tp-text-muted">Close</p><p className="font-data">?</p></div>
        </div>
        <p className="text-xs text-tp-text-muted text-center mt-2">
          La vela debe ser <span className={current.expectedColor === "green" ? "text-tp-demand font-bold" : "text-tp-supply font-bold"}>
            {current.expectedColor === "green" ? "ALCISTA (verde)" : "BAJISTA (roja)"}
          </span>
        </p>
        {current.note && <p className="text-xs text-tp-gold text-center mt-1">💡 {current.note}</p>}
      </div>

      {/* Candle preview */}
      {(previewOpen > 0 || previewClose > 0) && (
        <div className="flex justify-center">
          <div className="w-16 h-32 relative flex items-center justify-center">
            {/* Wick */}
            <div className="absolute w-0.5 bg-tp-text-muted/30" style={{ top: "10%", bottom: "10%" }} />
            {/* Body */}
            <div className="w-8 rounded-sm" style={{
              backgroundColor: previewColor,
              height: `${Math.max(8, Math.abs(previewClose - previewOpen) * 0.8)}%`,
              opacity: 0.8,
            }} />
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-tp-text-muted uppercase">Open (Apertura)</label>
          <input type="number" value={userOpen} onChange={(e) => setUserOpen(e.target.value)} disabled={!!feedback}
            className="w-full px-3 py-2 bg-tp-base border border-tp-border rounded-sm font-data text-tp-text focus:border-tp-gold transition" />
        </div>
        <div>
          <label className="text-[10px] text-tp-text-muted uppercase">Close (Cierre)</label>
          <input type="number" value={userClose} onChange={(e) => setUserClose(e.target.value)} disabled={!!feedback}
            className="w-full px-3 py-2 bg-tp-base border border-tp-border rounded-sm font-data text-tp-text focus:border-tp-gold transition" />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={!userOpen || !userClose || !!feedback}
        className="w-full px-4 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition disabled:opacity-50">
        Verificar vela
      </button>

      {feedback && (
        <div className={`rounded-sm p-3 text-sm ${feedback === "correct" ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
          {feedback === "correct" ? "✅ ¡Vela correcta!" : `❌ Respuesta: Open=${current.open}, Close=${current.close}`}
        </div>
      )}
    </div>
  );
}
