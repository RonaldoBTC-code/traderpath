"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export interface CryptoScenario {
  btcDominance: number;
  fearGreed: number;
  btcStructure: string;
  demandZone: { low: number; high: number };
  postHalvingWeek: number;
}

interface Props {
  scenario: CryptoScenario;
  capital: number;
  minRR: number;
  maxRisk: number;
  passingSteps: number;
  onComplete: (score: number) => void;
}

interface Result {
  correct: boolean;
  explanation: string;
}

export default function CryptoIntegratedAnalysis({
  scenario,
  capital,
  minRR,
  maxRisk,
  passingSteps,
  onComplete,
}: Props) {
  const [sentiment, setSentiment] = useState("");
  const [cycle, setCycle] = useState("");
  const [focus, setFocus] = useState("");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [units, setUnits] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [passingPercent, setPassingPercent] = useState<number | null>(null);

  const riskBudget = capital * maxRisk;
  const numericEntry = Number(entry);
  const numericStop = Number(stop);
  const numericTarget = Number(target);
  const numericUnits = Number(units);
  const riskPerUnit = numericEntry - numericStop;
  const rewardPerUnit = numericTarget - numericEntry;
  const rr = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;
  const positionRisk = riskPerUnit > 0 ? riskPerUnit * numericUnits : Number.POSITIVE_INFINITY;

  const evaluate = () => {
    const planValid =
      numericEntry >= scenario.demandZone.low &&
      numericEntry <= scenario.demandZone.high &&
      numericStop > 0 &&
      numericStop < scenario.demandZone.low &&
      numericTarget > numericEntry &&
      rr >= minRR;
    const sizeValid =
      numericUnits > 0 &&
      Number.isFinite(positionRisk) &&
      positionRisk <= riskBudget &&
      positionRisk >= riskBudget * 0.8;

    const nextResults: Result[] = [
      {
        correct: sentiment === "cautela",
        explanation: "76 indica codicia elevada: el sesgo puede seguir alcista, pero no justifica perseguir precio ni aumentar riesgo.",
      },
      {
        correct: cycle === "impulso",
        explanation: `La semana ${scenario.postHalvingWeek} post-halving con estructura alcista encaja mejor con una fase de impulso temprana, no con distribución confirmada.`,
      },
      {
        correct: focus === "btc",
        explanation: "La dominancia cae y anticipa rotación, pero el setup disponible y cuantificable está en BTC. Las altcoins quedan en vigilancia hasta tener una entrada propia.",
      },
      {
        correct: planValid,
        explanation: `La entrada debe quedar dentro de ${formatCurrency(scenario.demandZone.low)}–${formatCurrency(scenario.demandZone.high)}, el stop bajo la zona y el objetivo ofrecer al menos 1:${minRR}.`,
      },
      {
        correct: sizeValid,
        explanation: `El riesgo máximo es $${riskBudget.toFixed(2)}. Unidades = riesgo máximo ÷ (entrada − stop), sin redondear hacia arriba.`,
      },
    ];

    setResults(nextResults);
    const correctSteps = nextResults.filter((result) => result.correct).length;
    setPassingPercent(correctSteps >= passingSteps ? Math.round((correctSteps / nextResults.length) * 100) : null);
  };

  const resetFeedback = () => {
    setResults(null);
    setPassingPercent(null);
  };
  const canSubmit = sentiment && cycle && focus && entry && stop && target && units;
  const currentRR = Number.isFinite(rr) && rr > 0 ? rr.toFixed(2) : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="BTC.D" value={`${scenario.btcDominance}% ↓`} />
          <Metric label="Fear & Greed" value={`${scenario.fearGreed} · Codicia`} />
          <Metric label="Post-halving" value={`Semana ${scenario.postHalvingWeek}`} />
          <Metric label="Capital" value={formatCurrency(capital)} />
        </div>
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-tp-supply via-tp-warning to-tp-demand">
            <div className="h-full w-0" />
          </div>
          <div className="relative h-2" style={{ marginLeft: `${scenario.fearGreed}%` }}>
            <span className="absolute -top-4 h-5 w-1 rounded-full bg-tp-text" />
          </div>
          <div className="flex justify-between text-[9px] text-tp-text-muted"><span>Miedo</span><span>Neutral</span><span>Codicia</span></div>
        </div>
      </div>

      <Step number={1} title="Lee el sentimiento">
        <Choice value={sentiment} onChange={(value) => { setSentiment(value); resetFeedback(); }} options={[
          { id: "comprar", label: "Comprar agresivamente" },
          { id: "cautela", label: "Sesgo alcista con cautela" },
          { id: "vender", label: "Vender todo por codicia extrema" },
        ]} />
      </Step>

      <Step number={2} title="Ubica la fase del ciclo">
        <Choice value={cycle} onChange={(value) => { setCycle(value); resetFeedback(); }} options={[
          { id: "acumulacion", label: "Acumulación" },
          { id: "impulso", label: "Impulso post-halving" },
          { id: "distribucion", label: "Distribución confirmada" },
        ]} />
      </Step>

      <Step number={3} title="Elige el foco operativo">
        <Choice value={focus} onChange={(value) => { setFocus(value); resetFeedback(); }} options={[
          { id: "btc", label: "BTC: tiene setup definido" },
          { id: "alts", label: "Cualquier altcoin por BTC.D bajando" },
          { id: "apalancar", label: "BTC apalancado por F&G alto" },
        ]} />
      </Step>

      <Step number={4} title={`Construye entrada, stop y objetivo · mínimo 1:${minRR}`}>
        <p className="mb-3 text-xs text-tp-text-muted">
          BTC corrige a demanda {formatCurrency(scenario.demandZone.low)}–{formatCurrency(scenario.demandZone.high)}. R:R actual: <span className={rr >= minRR ? "text-tp-demand" : "text-tp-warning"}>1:{currentRR}</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <NumberInput label="Entrada" value={entry} onChange={(value) => { setEntry(value); resetFeedback(); }} />
          <NumberInput label="Stop Loss" value={stop} onChange={(value) => { setStop(value); resetFeedback(); }} />
          <NumberInput label="Take Profit" value={target} onChange={(value) => { setTarget(value); resetFeedback(); }} />
        </div>
      </Step>

      <Step number={5} title={`Dimensiona la posición · riesgo máximo $${riskBudget.toFixed(0)}`}>
        <NumberInput label="Unidades BTC" value={units} step="0.001" onChange={(value) => { setUnits(value); resetFeedback(); }} />
        {riskPerUnit > 0 && numericUnits > 0 && (
          <p className={`mt-2 text-xs ${positionRisk <= riskBudget ? "text-tp-demand" : "text-tp-supply"}`}>
            Riesgo monetario del plan: ${positionRisk.toFixed(2)}
          </p>
        )}
      </Step>

      {results && (
        <div className="space-y-2 rounded-md border border-tp-border bg-tp-base p-4">
          {results.map((result, index) => (
            <div key={index} className="flex gap-2 text-xs">
              <span className={result.correct ? "text-tp-demand" : "text-tp-supply"}>{result.correct ? "✓" : "✕"}</span>
              <p className="text-tp-text-muted"><span className="font-semibold text-tp-text">Paso {index + 1}.</span> {result.explanation}</p>
            </div>
          ))}
          <p className="pt-2 text-sm font-semibold text-tp-warning">
            {results.filter((result) => result.correct).length} de 5 pasos correctos. Necesitas {passingSteps}.
          </p>
        </div>
      )}

      <button
        onClick={passingPercent !== null ? () => onComplete(passingPercent) : evaluate}
        disabled={passingPercent === null && !canSubmit}
        className="w-full rounded-sm bg-tp-gold px-5 py-3 font-display font-bold text-tp-base disabled:cursor-not-allowed disabled:opacity-40"
      >
        {passingPercent !== null ? "Continuar al quiz" : "Validar plan de trading"}
      </button>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-tp-border bg-tp-surface p-4">
      <h4 className="mb-3 font-display text-sm font-bold text-tp-text">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tp-gold text-xs text-tp-base">{number}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function Choice({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { id: string; label: string }[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-sm border px-3 py-2 text-left text-xs transition ${
            value === option.id ? "border-tp-gold bg-tp-gold/10 text-tp-gold" : "border-tp-border bg-tp-base text-tp-text-muted hover:border-tp-gold/50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({ label, value, step = "1", onChange }: { label: string; value: string; step?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-tp-text-muted">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-sm border border-tp-border bg-tp-base px-3 py-2 font-data text-sm text-tp-text outline-none focus:border-tp-gold"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-tp-text-muted">{label}</p>
      <p className="font-data text-xs text-tp-text">{value}</p>
    </div>
  );
}
