"use client";

import { useState } from "react";
import {
  ChallengeCard,
  InductionQuestion,
  useImageReady,
  useLabFlow,
  type LabChallenge,
  type LabQuestion,
} from "@/components/game/labKit";

// ── CandleLab ──────────────────────────────────────────────────────
// Descubrimiento de la vela japonesa: el jugador arrastra Apertura, Cierre,
// Máximo y Mínimo, y la vela se dibuja en vivo — el color, el cuerpo y las mechas
// EMERGEN de esos cuatro números. La regla nunca se enuncia. Cada reto evalúa una
// magnitud distinta (dirección, mecha superior…) vía challenge.metric.

export interface CandleLabConfig {
  priceMin: number;
  priceMax: number;
  open: { start: number };
  close: { start: number };
  high: { start: number };
  low: { start: number };
  challenges: LabChallenge[];
  question: LabQuestion;
  scene?: { alt?: string; backdrop?: { image?: string } };
}

interface Props {
  config: CandleLabConfig;
  onComplete: (score: number) => void;
}

export default function CandleLab({ config, onComplete }: Props) {
  const [open, setOpen] = useState(config.open.start);
  const [close, setClose] = useState(config.close.start);
  const [high, setHigh] = useState(config.high.start);
  const [low, setLow] = useState(config.low.start);

  const backdropOk = useImageReady(config.scene?.backdrop?.image);
  const backdropImg = config.scene?.backdrop?.image;

  // La vela siempre es válida: el máximo no puede quedar bajo el cuerpo ni el
  // mínimo por encima. Se corrige al dibujar, sin mentir sobre lo que el jugador
  // puso (los controles muestran su valor real).
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);
  const h = Math.max(high, bodyTop);
  const l = Math.min(low, bodyBottom);

  const direction = close - open; // >0 verde, <0 rojo
  const body = Math.abs(close - open);
  const upperWick = h - bodyTop;
  const lowerWick = bodyBottom - l;

  const flow = useLabFlow(config.challenges, config.question);

  const evalNow = (o: number, c: number, hi: number, lo: number) => {
    const bt = Math.max(o, c);
    const bb = Math.min(o, c);
    const hh = Math.max(hi, bt);
    const ll = Math.min(lo, bb);
    const m = flow.challenge?.metric;
    const v = m === "upperWick" ? hh - bt : m === "lowerWick" ? bb - ll : m === "body" ? Math.abs(c - o) : c - o;
    flow.evaluate(v);
  };

  const change = (setter: (n: number) => void, next: number, which: "o" | "c" | "h" | "l") => {
    setter(next);
    evalNow(which === "o" ? next : open, which === "c" ? next : close, which === "h" ? next : high, which === "l" ? next : low);
  };

  const reset = () => {
    setOpen(config.open.start);
    setClose(config.close.start);
    setHigh(config.high.start);
    setLow(config.low.start);
  };

  // ── Dibujo de la vela ──
  const W = 200;
  const H = 220;
  const pad = 16;
  const span = config.priceMax - config.priceMin || 1;
  const y = (price: number) => pad + (1 - (price - config.priceMin) / span) * (H - 2 * pad);
  const cx = W / 2;
  const color = direction > 0.001 ? "#16a34a" : direction < -0.001 ? "#dc2626" : "#5d6e8c";
  const bodyY = y(bodyTop);
  const bodyH = Math.max(2, y(bodyBottom) - y(bodyTop));

  return (
    <div className="space-y-5">
      {/* Escena: la vela se dibuja en vivo (color y mechas emergen) */}
      <div
        role="img"
        aria-label={`Vela ${direction > 0 ? "alcista verde" : direction < 0 ? "bajista roja" : "neutra"}: apertura ${open}, cierre ${close}, máximo ${h}, mínimo ${l}`}
        className="grid place-items-center overflow-hidden rounded-2xl border-2 border-tp-border p-4"
        style={
          backdropOk && backdropImg
            ? { backgroundImage: `url(${backdropImg})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(#eaf4fe, #f1f8ff)" }
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full max-w-[240px]" role="presentation">
          {/* mecha */}
          <line x1={cx} x2={cx} y1={y(h)} y2={y(l)} stroke={color} strokeWidth="3" />
          {/* cuerpo */}
          <rect x={cx - 26} y={bodyY} width={52} height={bodyH} rx="3" fill={color} />
          {/* guías de apertura/cierre */}
          <line x1={cx - 40} x2={cx - 30} y1={y(open)} y2={y(open)} stroke="#5d6e8c" strokeWidth="1.5" />
          <text x={cx - 44} y={y(open) + 3} textAnchor="end" fontSize="9" fill="#5d6e8c">A</text>
          <line x1={cx + 30} x2={cx + 40} y1={y(close)} y2={y(close)} stroke="#5d6e8c" strokeWidth="1.5" />
          <text x={cx + 44} y={y(close) + 3} textAnchor="start" fontSize="9" fill="#5d6e8c">C</text>
        </svg>
      </div>

      {/* Controles OHLC */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border-2 border-tp-border bg-tp-base p-5">
        {([
          ["Apertura", open, (v: number) => change(setOpen, v, "o"), "#2563eb"],
          ["Cierre", close, (v: number) => change(setClose, v, "c"), "#16a34a"],
          ["Máximo", high, (v: number) => change(setHigh, v, "h"), "#5d6e8c"],
          ["Mínimo", low, (v: number) => change(setLow, v, "l"), "#5d6e8c"],
        ] as const).map(([label, val, onCh, accent]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-tp-text">{label}</label>
              <span className="font-data text-xs" style={{ color: accent }}>{val}</span>
            </div>
            <input
              type="range"
              min={config.priceMin}
              max={config.priceMax}
              value={val}
              onChange={(e) => onCh(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: accent }}
            />
          </div>
        ))}
      </div>

      <ChallengeCard flow={flow} onAdvance={() => flow.advance(reset)} formatValue={(n) => `${n}`} />
      <InductionQuestion flow={flow} onFinish={onComplete} />
    </div>
  );
}
