"use client";

// ── labKit ─────────────────────────────────────────────────────────
// Piezas compartidas por todos los laboratorios de descubrimiento. Cada lab
// concreto (SupplyDemandLab, GaugeLab, CandleLab…) aporta SU escena y SU modelo;
// todo lo demás — carga de arte, formas provisionales, flujo de retos, pregunta
// de inducción, puntaje — vive aquí y se recicla. El patrón: mueve variable →
// observa el efecto en la escena → induce la regla.

import { useEffect, useState } from "react";

// ── Tipos de contenido (los declara cada misión en levelX.ts) ──────
export interface LabChallenge {
  id: string;
  prompt: string;
  /** Clave del control que queda bloqueado durante el reto (opcional). */
  lock?: string;
  compare: "gte" | "lte";
  target: number;
  successNote: string;
}
export interface LabQuestionOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}
export interface LabQuestion {
  prompt: string;
  options: LabQuestionOption[];
}

// ── Carga de arte: true solo cuando el archivo existe y cargó ──────
export function useImageReady(url?: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!url) {
      setOk(false);
      return;
    }
    const img = new window.Image();
    img.onload = () => setOk(true);
    img.onerror = () => setOk(false);
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);
  return ok;
}

/** Pop de entrada reutilizable (una figura por paso del deslizador). */
export const LAB_POP = "bounce-in 200ms cubic-bezier(0.23,1,0.32,1)";

/**
 * Slot de arte: si la imagen existe la pinta; si no, cae a la forma provisional
 * (`children`). Nunca deja un hueco roto.
 */
export function ArtSlot({
  url,
  ready,
  className,
  style,
  size = "contain",
  children,
}: {
  url?: string;
  ready: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: "contain" | "cover";
  children?: React.ReactNode;
}) {
  const art = !!url && ready;
  return (
    <div
      aria-hidden
      className={className}
      style={
        art
          ? { ...style, backgroundImage: `url(${url})`, backgroundSize: size, backgroundRepeat: "no-repeat", backgroundPosition: "center" }
          : style
      }
    >
      {!art && children}
    </div>
  );
}

// ── Flujo del laboratorio: retos → pregunta → puntaje ──────────────
// La detección de "resuelto" se delega al lab, que llama a `evaluate(valor)`
// con su valor calculado (precio, riesgo…) tras cada cambio de control.
export function useLabFlow(challenges: LabChallenge[], question: LabQuestion) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<"challenge" | "question">("challenge");
  const [solved, setSolved] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const challenge = challenges[stage];

  const evaluate = (value: number) => {
    if (solved || phase !== "challenge" || !challenge) return;
    const ok = challenge.compare === "gte" ? value >= challenge.target : value <= challenge.target;
    if (ok) setSolved(true);
  };

  const advance = (onReset?: () => void) => {
    if (stage < challenges.length - 1) {
      setStage((s) => s + 1);
      setSolved(false);
      onReset?.();
    } else {
      setPhase("question");
    }
  };

  const pick = (opt: LabQuestionOption) => {
    if (picked && question.options.find((o) => o.id === picked)?.correct) return;
    setPicked(opt.id);
    if (!opt.correct) setWrongTries((w) => w + 1);
  };

  const pickedOption = question.options.find((o) => o.id === picked) ?? null;
  const answered = pickedOption?.correct ?? false;
  const score = () => Math.max(40, 100 - wrongTries * 15);

  return { stage, phase, challenge, challenges, question, solved, evaluate, advance, picked, pick, pickedOption, answered, score };
}

export type LabFlow = ReturnType<typeof useLabFlow>;

/** Tarjeta del reto en curso (idéntica en todas las labs). */
export function ChallengeCard({
  flow,
  onAdvance,
  formatValue = (n) => `$${n.toFixed(2)}`,
}: {
  flow: LabFlow;
  onAdvance: () => void;
  formatValue?: (n: number) => string;
}) {
  const { challenge, stage, challenges, solved, phase } = flow;
  if (phase !== "challenge" || !challenge) return null;
  const targetLabel = `${challenge.compare === "gte" ? "≥" : "≤"} ${formatValue(challenge.target)}`;
  return (
    <div className="rounded-2xl border-2 border-tp-border bg-tp-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-info">
          Reto {stage + 1} de {challenges.length}
        </p>
        <p className="font-data text-xs text-tp-text-muted">Meta: {targetLabel}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-tp-text">{challenge.prompt}</p>
      {solved ? (
        <div
          className="mt-4 rounded-xl border-2 border-tp-demand/40 bg-tp-demand/10 p-4"
          style={{ animation: "bounce-in 260ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <p className="font-display text-sm font-bold text-tp-demand">¡Lo lograste!</p>
          <p className="mt-1 text-xs leading-relaxed text-tp-text-muted">{challenge.successNote}</p>
          <button
            type="button"
            onClick={onAdvance}
            className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-text transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            {stage < challenges.length - 1 ? "Siguiente reto →" : "Responder →"}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-tp-text-muted">Mueve el control que no está bloqueado y observa la escena.</p>
      )}
    </div>
  );
}

/** Pregunta final de inducción (idéntica en todas las labs). */
export function InductionQuestion({ flow, onFinish }: { flow: LabFlow; onFinish: (score: number) => void }) {
  const { question, picked, pick, pickedOption, answered } = flow;
  if (flow.phase !== "question") return null;
  return (
    <div className="rounded-2xl border-2 border-tp-border bg-tp-surface p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-gold">Lo que viste</p>
      <p className="mt-1 text-sm font-semibold text-tp-text">{question.prompt}</p>
      <div className="mt-3 space-y-2">
        {question.options.map((opt) => {
          const isPicked = picked === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt)}
              disabled={answered}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors duration-150 ease-out active:scale-[0.99] ${
                isPicked && opt.correct
                  ? "border-tp-demand bg-tp-demand/10"
                  : isPicked && !opt.correct
                    ? "border-tp-supply bg-tp-supply/10"
                    : "border-tp-border bg-tp-base hover:border-tp-gold/50"
              }`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {pickedOption && (
        <div
          className={`mt-3 rounded-xl border-2 p-4 ${answered ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}
          style={{ animation: "bounce-in 220ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <p className={`font-display text-sm font-bold ${answered ? "text-tp-demand" : "text-tp-supply"}`}>
            {answered ? "Correcto" : "Todavía no"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-tp-text-muted">{pickedOption.feedback}</p>
          {answered && (
            <button
              type="button"
              onClick={() => onFinish(flow.score())}
              className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-text transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Terminar →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
