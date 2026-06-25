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

/** Visual candle SVG component */
function CandleSVG({ open, high, low, close, size = 120 }: { open: number; high: number; low: number; close: number; size?: number }) {
  const range = high - low;
  if (range === 0) return null;

  const normalize = (v: number) => ((high - v) / range) * (size - 20) + 10;
  const isGreen = close >= open;
  const color = isGreen ? "#22C55E" : "#EF4444";
  const bodyTop = normalize(Math.max(open, close));
  const bodyBottom = normalize(Math.min(open, close));
  const bodyHeight = Math.max(4, bodyBottom - bodyTop);

  return (
    <svg viewBox={`0 0 60 ${size}`} className="h-32 w-12">
      {/* Wick */}
      <line x1="30" y1={normalize(high)} x2="30" y2={normalize(low)} stroke={color} strokeWidth="2" />
      {/* Body */}
      <rect x="18" y={bodyTop} width="24" height={bodyHeight} fill={color} rx="2" />
    </svg>
  );
}

export default function CandlestickBuilder({ scenarios, onComplete }: Props) {
  const [phase, setPhase] = useState<"tutorial" | "game">("tutorial");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userOpen, setUserOpen] = useState("");
  const [userClose, setUserClose] = useState("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // ─── TUTORIAL PHASE ───
  const tutorialSteps = [
    {
      title: "¿Qué es una vela japonesa?",
      content: "Una vela japonesa muestra el movimiento del precio en un período de tiempo. Tiene 4 datos: Open (apertura), High (máximo), Low (mínimo) y Close (cierre).",
      visual: { open: 100, high: 120, low: 85, close: 115 },
    },
    {
      title: "Los 4 precios",
      content: "Open = precio al inicio del período. Close = precio al final. High = precio más alto alcanzado. Low = precio más bajo alcanzado. El High SIEMPRE es el valor mayor. El Low SIEMPRE es el menor.",
      visual: { open: 100, high: 120, low: 85, close: 115 },
    },
    {
      title: "¿Alcista o Bajista?",
      content: "Si Close > Open → la vela es ALCISTA (verde). Los compradores ganaron. Si Close < Open → la vela es BAJISTA (roja). Los vendedores ganaron. El cuerpo es la distancia entre Open y Close. Las mechas son los extremos (High y Low).",
      visual: { open: 100, high: 120, low: 85, close: 115 },
    },
  ];

  if (phase === "tutorial") {
    const step = tutorialSteps[tutorialStep];
    return (
      <div className="space-y-4">
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {tutorialSteps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === tutorialStep ? "w-6 bg-tp-gold" : i < tutorialStep ? "w-3 bg-tp-demand" : "w-3 bg-tp-border"}`} />
          ))}
        </div>

        <h4 className="font-display font-bold text-sm text-tp-gold">{step.title}</h4>
        <p className="text-sm text-tp-text leading-relaxed">{step.content}</p>

        {/* Visual example */}
        <div className="flex items-center justify-center gap-6 bg-tp-base border border-tp-border rounded-sm p-4">
          <CandleSVG {...step.visual} />
          <div className="text-xs space-y-1 font-data">
            <p><span className="text-tp-text-muted">Open:</span> <span className="text-tp-text">${step.visual.open}</span></p>
            <p><span className="text-tp-text-muted">High:</span> <span className="text-tp-demand">${step.visual.high}</span></p>
            <p><span className="text-tp-text-muted">Low:</span> <span className="text-tp-supply">${step.visual.low}</span></p>
            <p><span className="text-tp-text-muted">Close:</span> <span className="text-tp-text">${step.visual.close}</span></p>
            <p className="pt-1 text-tp-demand font-medium">→ Alcista (Close &gt; Open)</p>
          </div>
        </div>

        <div className="flex gap-2">
          {tutorialStep > 0 && (
            <button onClick={() => setTutorialStep((s) => s - 1)} className="px-4 py-2 border border-tp-border rounded-sm text-sm text-tp-text-muted">← Atrás</button>
          )}
          <button onClick={() => {
            if (tutorialStep < tutorialSteps.length - 1) setTutorialStep((s) => s + 1);
            else setPhase("game");
          }} className="flex-1 px-5 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            {tutorialStep < tutorialSteps.length - 1 ? "Siguiente →" : "¡Entendido! Vamos a practicar →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── GAME PHASE ───
  const current = scenarios[currentIndex];
  if (!current) return null;

  const handleSubmit = () => {
    if (!userOpen || !userClose || feedback) return;
    const o = parseFloat(userOpen);
    const c = parseFloat(userClose);

    // Validate
    let errorMsg = "";
    if (o > current.high) errorMsg = `Open (${o}) no puede ser mayor que High (${current.high}). High es siempre el precio más alto del período.`;
    else if (o < current.low) errorMsg = `Open (${o}) no puede ser menor que Low (${current.low}). Low es siempre el precio más bajo del período.`;
    else if (c > current.high) errorMsg = `Close (${c}) no puede ser mayor que High (${current.high}). Ningún precio supera al High.`;
    else if (c < current.low) errorMsg = `Close (${c}) no puede ser menor que Low (${current.low}). Ningún precio está debajo del Low.`;
    else {
      const expectedIsGreen = current.expectedColor === "green";
      const userIsGreen = c > o;

      if (expectedIsGreen !== userIsGreen) {
        errorMsg = expectedIsGreen
          ? `La vela debe ser alcista (verde). Para eso, Close debe ser MAYOR que Open. Tú pusiste Open=${o}, Close=${c} — eso genera una vela bajista.`
          : `La vela debe ser bajista (roja). Para eso, Close debe ser MENOR que Open. Tú pusiste Open=${o}, Close=${c} — eso genera una vela alcista.`;
      } else if (Math.abs(o - current.open) > 3 || Math.abs(c - current.close) > 3) {
        errorMsg = `Los valores están cerca pero no son exactos. Open correcto: ${current.open}, Close correcto: ${current.close}. Revisa los datos dados.`;
      }
    }

    if (errorMsg) {
      setFeedback({ type: "wrong", message: errorMsg });
    } else {
      setScore((s) => s + 1);
      setFeedback({
        type: "correct",
        message: `¡Correcto! La vela es ${current.expectedColor === "green" ? "alcista" : "bajista"} porque Close (${current.close}) ${current.expectedColor === "green" ? ">" : "<"} Open (${current.open}). La mecha superior llega al High (${current.high}) y la inferior al Low (${current.low}).`
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setUserOpen("");
      setUserClose("");
      setShowHint(false);
      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const isLastCorrect = !errorMsg;
        onComplete(Math.round(((score + (isLastCorrect ? 1 : 0)) / scenarios.length) * 100));
      }
    }, 3500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Vela {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      {/* Given data */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-4">
        <p className="text-[10px] text-tp-text-muted uppercase tracking-widest mb-2">Datos de la vela:</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-tp-surface rounded-sm p-2">
            <p className="text-[9px] text-tp-text-muted">HIGH (máximo)</p>
            <p className="font-data text-tp-demand text-lg">${current.high}</p>
          </div>
          <div className="bg-tp-surface rounded-sm p-2">
            <p className="text-[9px] text-tp-text-muted">LOW (mínimo)</p>
            <p className="font-data text-tp-supply text-lg">${current.low}</p>
          </div>
        </div>
        <p className="text-xs text-tp-text-muted text-center mt-3">
          Construye una vela <span className={current.expectedColor === "green" ? "text-tp-demand font-bold" : "text-tp-supply font-bold"}>
            {current.expectedColor === "green" ? "ALCISTA (verde)" : "BAJISTA (roja)"}
          </span>
        </p>
        {current.note && <p className="text-[10px] text-tp-gold text-center mt-1">💡 {current.note}</p>}
      </div>

      {/* Preview */}
      {(userOpen || userClose) && (
        <div className="flex justify-center">
          <CandleSVG open={parseFloat(userOpen) || current.open} high={current.high} low={current.low} close={parseFloat(userClose) || current.close} />
        </div>
      )}

      {/* Hint */}
      {!feedback && (
        <button onClick={() => setShowHint(!showHint)} className="text-[10px] text-tp-info hover:underline">
          💡 {showHint ? "Ocultar pista" : "¿Necesitas una pista?"}
        </button>
      )}
      {showHint && !feedback && (
        <div className="bg-tp-info/5 border border-tp-info/20 rounded-sm p-3 text-xs text-tp-info">
          Recuerda: si la vela es alcista, Close debe ser mayor que Open. Si es bajista, Close debe ser menor que Open. Ambos valores deben estar entre Low y High.
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-tp-text-muted uppercase tracking-widest">Open (Apertura)</label>
          <input type="number" value={userOpen} onChange={(e) => setUserOpen(e.target.value)} disabled={!!feedback} placeholder={`Entre ${current.low} y ${current.high}`}
            className="w-full px-3 py-2 bg-tp-base border border-tp-border rounded-sm font-data text-tp-text placeholder:text-tp-text-muted/40 focus:border-tp-gold transition" />
        </div>
        <div>
          <label className="text-[10px] text-tp-text-muted uppercase tracking-widest">Close (Cierre)</label>
          <input type="number" value={userClose} onChange={(e) => setUserClose(e.target.value)} disabled={!!feedback} placeholder={`Entre ${current.low} y ${current.high}`}
            className="w-full px-3 py-2 bg-tp-base border border-tp-border rounded-sm font-data text-tp-text placeholder:text-tp-text-muted/40 focus:border-tp-gold transition" />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={!userOpen || !userClose || !!feedback}
        className="w-full px-4 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition disabled:opacity-50">
        Verificar vela
      </button>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-sm p-3 text-sm border ${feedback.type === "correct" ? "bg-tp-demand/10 border-tp-demand/30 text-tp-demand" : "bg-tp-supply/10 border-tp-supply/30 text-tp-supply"}`}>
          <p className="font-medium mb-1">{feedback.type === "correct" ? "✅ ¡Correcto!" : "❌ No exactamente."}</p>
          <p className="text-xs text-tp-text-muted">{feedback.message}</p>
        </div>
      )}
    </div>
  );
}
