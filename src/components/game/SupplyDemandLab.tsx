"use client";

import { useEffect, useMemo, useState } from "react";

// ── Laboratorio de Oferta y Demanda ────────────────────────────────
// Minijuego de DESCUBRIMIENTO: el jugador mueve dos controles —clientes
// (demanda) y manzanas (oferta)— y el precio emerge en vivo de ambos. La regla
// nunca se enuncia en pantalla; se induce jugando. Dos retos guían la
// manipulación (subir sin tocar la oferta; bajar sin tocar la demanda) y una
// pregunta final pide nombrar lo observado.

export interface SupplyDemandChallenge {
  id: string;
  prompt: string;
  /** Control que queda bloqueado durante el reto. */
  lock: "apples" | "clients";
  compare: "gte" | "lte";
  target: number;
  successNote: string;
}

export interface SupplyDemandQuestionOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

export interface SupplyDemandLabConfig {
  /** Precio = basePrice × clientes / manzanas. */
  basePrice: number;
  clients: { min: number; max: number; start: number };
  apples: { min: number; max: number; start: number };
  challenges: SupplyDemandChallenge[];
  question: { prompt: string; options: SupplyDemandQuestionOption[] };
  /**
   * Arte de escena, opcional. Ronaldo dibuja el puesto en Blender y lo exporta
   * a la ruta indicada; si el archivo no existe, el laboratorio cae con gracia a
   * su versión abstracta (los puntos) y la misión sigue jugable. El arte es
   * puramente decorativo: la mecánica (precio, deslizadores) vive aparte.
   */
  scene?: { image?: string; alt?: string };
}

interface Props {
  config: SupplyDemandLabConfig;
  onComplete: (score: number) => void;
}

/** Fila de puntos que hace visible cuántos hay de cada lado. */
function DotRow({ count, max, className, label }: { count: number; max: number; className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">{label}</span>
      <div className="flex flex-wrap gap-1" aria-hidden>
        {Array.from({ length: Math.min(count, max) }).map((_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${className}`} />
        ))}
      </div>
      <span className="ml-auto font-data text-xs text-tp-text-muted">{count}</span>
    </div>
  );
}

export default function SupplyDemandLab({ config, onComplete }: Props) {
  const [clients, setClients] = useState(config.clients.start);
  const [apples, setApples] = useState(config.apples.start);
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<"challenge" | "question">("challenge");
  const [solved, setSolved] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  // Precarga del arte de escena: solo se muestra cuando el archivo existe de
  // verdad, así un PNG/WebP faltante nunca deja un icono roto ni rompe la misión.
  const sceneImage = config.scene?.image;
  const [sceneOk, setSceneOk] = useState(false);
  useEffect(() => {
    if (!sceneImage) return;
    const img = new window.Image();
    img.onload = () => setSceneOk(true);
    img.onerror = () => setSceneOk(false);
    img.src = sceneImage;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [sceneImage]);

  const price = useMemo(() => (config.basePrice * clients) / apples, [config.basePrice, clients, apples]);
  const baseline = config.basePrice; // cada reto arranca equilibrado en este precio
  const challenge = config.challenges[stage];

  // Color del precio relativo al equilibrio de partida: verde si lo encareció,
  // rojo si lo abarató. Siempre refleja el estado real — nunca miente.
  const dir = price > baseline + 0.001 ? "up" : price < baseline - 0.001 ? "down" : "flat";
  const priceColor = dir === "up" ? "text-tp-demand" : dir === "down" ? "text-tp-supply" : "text-tp-text";

  const lockedApples = phase === "challenge" && challenge?.lock === "apples";
  const lockedClients = phase === "challenge" && challenge?.lock === "clients";

  const maybeSolve = (c: number, a: number) => {
    if (solved || phase !== "challenge" || !challenge) return;
    const p = (config.basePrice * c) / a;
    const ok = challenge.compare === "gte" ? p >= challenge.target : p <= challenge.target;
    if (ok) setSolved(true);
  };

  const changeClients = (v: number) => {
    if (lockedClients) return;
    setClients(v);
    maybeSolve(v, apples);
  };
  const changeApples = (v: number) => {
    if (lockedApples) return;
    setApples(v);
    maybeSolve(clients, v);
  };

  const advance = () => {
    if (stage < config.challenges.length - 1) {
      setStage((s) => s + 1);
      setClients(config.clients.start); // volver al equilibrio para el siguiente reto
      setApples(config.apples.start);
      setSolved(false);
    } else {
      setPhase("question");
    }
  };

  const pickAnswer = (opt: SupplyDemandQuestionOption) => {
    if (picked && config.question.options.find((o) => o.id === picked)?.correct) return; // ya acertó
    setPicked(opt.id);
    if (!opt.correct) setWrongTries((w) => w + 1);
  };

  const pickedOption = config.question.options.find((o) => o.id === picked) ?? null;
  const answeredCorrectly = pickedOption?.correct ?? false;

  const finish = () => {
    const score = Math.max(40, 100 - wrongTries * 15);
    onComplete(score);
  };

  const targetLabel = challenge
    ? `${challenge.compare === "gte" ? "≥" : "≤"} $${challenge.target.toFixed(2)}`
    : "";

  return (
    <div className="space-y-5">
      {/* El puesto: arte de escena (opcional) + precio (héroe) + cuántos de cada lado */}
      <div className="rounded-2xl border-2 border-tp-border bg-tp-surface p-5">
        {sceneImage && sceneOk && (
          <div
            role="img"
            aria-label={config.scene?.alt ?? "Escena de la misión"}
            className="mb-4 rounded-xl border-2 border-tp-border bg-tp-base bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${sceneImage})`, backgroundSize: "contain", aspectRatio: "16 / 9" }}
          />
        )}
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-text-muted">Precio por manzana</p>
          <p className={`font-data text-5xl font-bold tabular-nums transition-colors duration-150 ease-out ${priceColor}`}>
            ${price.toFixed(2)}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <DotRow count={clients} max={config.clients.max} className="bg-tp-info" label="Clientes" />
          <DotRow count={apples} max={config.apples.max} className="bg-tp-gold" label="Manzanas" />
        </div>
      </div>

      {/* Controles */}
      <div className="space-y-4 rounded-2xl border-2 border-tp-border bg-tp-base p-5">
        <div className={lockedClients ? "opacity-45" : ""}>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="sd-clients" className="text-sm font-semibold text-tp-text">
              Clientes que quieren manzanas {lockedClients && <span className="text-tp-text-muted">· bloqueado</span>}
            </label>
            <span className="font-data text-sm text-tp-info">{clients}</span>
          </div>
          <input
            id="sd-clients"
            type="range"
            min={config.clients.min}
            max={config.clients.max}
            value={clients}
            disabled={lockedClients}
            onChange={(e) => changeClients(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#2563eb] disabled:cursor-not-allowed"
          />
        </div>

        <div className={lockedApples ? "opacity-45" : ""}>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="sd-apples" className="text-sm font-semibold text-tp-text">
              Manzanas en el puesto {lockedApples && <span className="text-tp-text-muted">· bloqueado</span>}
            </label>
            <span className="font-data text-sm text-tp-gold">{apples}</span>
          </div>
          <input
            id="sd-apples"
            type="range"
            min={config.apples.min}
            max={config.apples.max}
            value={apples}
            disabled={lockedApples}
            onChange={(e) => changeApples(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#e5960a] disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Reto en curso */}
      {phase === "challenge" && challenge && (
        <div className="rounded-2xl border-2 border-tp-border bg-tp-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-info">
              Reto {stage + 1} de {config.challenges.length}
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
                onClick={advance}
                className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-text transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                {stage < config.challenges.length - 1 ? "Siguiente reto →" : "Responder →"}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-tp-text-muted">Mueve el control que no está bloqueado y observa el precio.</p>
          )}
        </div>
      )}

      {/* Pregunta final: nombrar lo observado */}
      {phase === "question" && (
        <div className="rounded-2xl border-2 border-tp-border bg-tp-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-gold">Lo que viste</p>
          <p className="mt-1 text-sm font-semibold text-tp-text">{config.question.prompt}</p>
          <div className="mt-3 space-y-2">
            {config.question.options.map((opt) => {
              const isPicked = picked === opt.id;
              const showState = isPicked;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pickAnswer(opt)}
                  disabled={answeredCorrectly}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors duration-150 ease-out active:scale-[0.99] ${
                    showState && opt.correct
                      ? "border-tp-demand bg-tp-demand/10"
                      : showState && !opt.correct
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
              className={`mt-3 rounded-xl border-2 p-4 ${answeredCorrectly ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}
              style={{ animation: "bounce-in 220ms cubic-bezier(0.23,1,0.32,1)" }}
            >
              <p className={`font-display text-sm font-bold ${answeredCorrectly ? "text-tp-demand" : "text-tp-supply"}`}>
                {answeredCorrectly ? "Correcto" : "Todavía no"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-tp-text-muted">{pickedOption.feedback}</p>
              {answeredCorrectly && (
                <button
                  type="button"
                  onClick={finish}
                  className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-text transition-transform duration-150 ease-out active:scale-[0.97]"
                >
                  Terminar →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
