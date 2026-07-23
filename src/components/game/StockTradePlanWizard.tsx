"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export interface StockScenario {
  sectorContext: string;
  earningsRisk: string;
  currentHolding: string;
  stockToTrade: string;
  entryZoneLow: number;
  entryZoneHigh: number;
}

interface Props {
  scenario: StockScenario;
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

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function StockTradePlanWizard({
  scenario,
  capital,
  minRR,
  maxRisk,
  passingSteps,
  onComplete,
}: Props) {
  const [sectorRead, setSectorRead] = useState("");
  const [riskCheck, setRiskCheck] = useState("");
  const [focus, setFocus] = useState("");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [shares, setShares] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [passingPercent, setPassingPercent] = useState<number | null>(null);

  const riskBudget = capital * maxRisk;
  const numericEntry = Number(entry);
  const numericStop = Number(stop);
  const numericTarget = Number(target);
  const numericShares = Number(shares);
  const riskPerShare = numericEntry - numericStop;
  const rewardPerShare = numericTarget - numericEntry;
  const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
  const positionRisk = riskPerShare > 0 ? riskPerShare * numericShares : Number.POSITIVE_INFINITY;
  const roundedPositionRisk = Math.round(positionRisk * 100) / 100;

  const evaluate = () => {
    const planValid =
      numericEntry >= scenario.entryZoneLow &&
      numericEntry <= scenario.entryZoneHigh &&
      numericStop > 0 &&
      numericStop < scenario.entryZoneLow &&
      numericTarget > numericEntry &&
      rr >= minRR;
    const sizeValid =
      numericShares > 0 &&
      Number.isFinite(roundedPositionRisk) &&
      roundedPositionRisk <= riskBudget &&
      roundedPositionRisk >= riskBudget * 0.7;

    const nextResults: Result[] = [
      {
        correct: sectorRead === "sobreponderar_sector",
        explanation: "El contexto de expansión con el sector liderando favorece mantener exposición, siempre que el resto del plan lo respalde.",
      },
      {
        correct: riskCheck === "reducir_riesgo",
        explanation: `${scenario.currentHolding} y ${scenario.earningsRisk.toLowerCase()}: la combinación de concentración sectorial y earnings de un peer pide reducir el riesgo total, no ampliarlo.`,
      },
      {
        correct: focus === "stock_sin_earnings",
        explanation: `${scenario.stockToTrade} tiene un setup definido y no añade el riesgo de gap de un reporte de earnings inminente, a diferencia de otra opción del mismo sector con reporte próximo.`,
      },
      {
        correct: planValid,
        explanation: `La entrada debe quedar dentro de ${formatPrice(scenario.entryZoneLow)}–${formatPrice(scenario.entryZoneHigh)}, el stop bajo la zona y el objetivo ofrecer al menos 1:${minRR}.`,
      },
      {
        correct: sizeValid,
        explanation: `El riesgo máximo es ${formatCurrency(riskBudget)}. Acciones = riesgo máximo ÷ (entrada − stop), sin redondear hacia arriba.`,
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
  const canSubmit = sectorRead && riskCheck && focus && entry && stop && target && shares;
  const currentRR = Number.isFinite(rr) && rr > 0 ? rr.toFixed(2) : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Sector" value={scenario.currentHolding} />
          <Metric label="Earnings" value={scenario.earningsRisk} />
          <Metric label="Candidato" value={scenario.stockToTrade} />
          <Metric label="Capital" value={formatCurrency(capital)} />
        </div>
      </div>

      <Step number={1} title="Lee el contexto sectorial">
        <Choice value={sectorRead} onChange={(value) => { setSectorRead(value); resetFeedback(); }} options={[
          { id: "sobreponderar_sector", label: "El sector lidera en expansión — mantener exposición" },
          { id: "evitar_sector", label: "Evitar el sector — contexto desfavorable" },
          { id: "esperar_confirmacion", label: "Esperar confirmación del ciclo" },
        ]} />
      </Step>

      <Step number={2} title="Evalúa el riesgo de concentración y earnings">
        <Choice value={riskCheck} onChange={(value) => { setRiskCheck(value); resetFeedback(); }} options={[
          { id: "reducir_riesgo", label: "Reducir el riesgo total antes de sumar exposición" },
          { id: "duplicar", label: "Duplicar la posición — más convicción" },
          { id: "ignorar", label: "Ignorar — no afecta al nuevo trade" },
        ]} />
      </Step>

      <Step number={3} title="Elige la acción a operar">
        <Choice value={focus} onChange={(value) => { setFocus(value); resetFeedback(); }} options={[
          { id: "stock_sin_earnings", label: `${scenario.stockToTrade}: setup definido, sin earnings inminentes` },
          { id: "stock_con_earnings", label: "La opción del mismo sector con earnings en 3 días" },
          { id: "stock_ya_en_cartera", label: "Duplicar la posición que ya tienes" },
        ]} />
      </Step>

      <Step number={4} title={`Construye entrada, stop y objetivo · mínimo 1:${minRR}`}>
        <p className="mb-3 text-xs text-tp-text-muted">
          Zona de entrada {scenario.stockToTrade}: {formatPrice(scenario.entryZoneLow)}–{formatPrice(scenario.entryZoneHigh)}. R:R actual: <span className={rr >= minRR ? "text-tp-demand" : "text-tp-warning"}>1:{currentRR}</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <NumberInput label="Entrada" value={entry} step="0.01" onChange={(value) => { setEntry(value); resetFeedback(); }} />
          <NumberInput label="Stop Loss" value={stop} step="0.01" onChange={(value) => { setStop(value); resetFeedback(); }} />
          <NumberInput label="Take Profit" value={target} step="0.01" onChange={(value) => { setTarget(value); resetFeedback(); }} />
        </div>
      </Step>

      <Step number={5} title={`Dimensiona la posición en acciones · riesgo máximo ${formatCurrency(riskBudget)}`}>
        <NumberInput label="Acciones" value={shares} step="1" onChange={(value) => { setShares(value); resetFeedback(); }} />
        {riskPerShare > 0 && numericShares > 0 && (
          <p className={`mt-2 text-xs ${roundedPositionRisk <= riskBudget ? "text-tp-demand" : "text-tp-supply"}`}>
            Riesgo monetario del plan: {formatCurrency(roundedPositionRisk)}
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
        className="w-full rounded-sm bg-tp-gold px-5 py-3 font-display font-bold text-tp-text disabled:cursor-not-allowed disabled:opacity-40"
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
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tp-gold text-xs text-tp-text">{number}</span>
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
