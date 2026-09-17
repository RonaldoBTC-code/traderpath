"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export interface CommodityScenario {
  supplyContext: string;
  dollarContext: string;
  currentHolding: string;
  commodityToTrade: string;
  entryZoneLow: number;
  entryZoneHigh: number;
}

interface Props {
  scenario: CommodityScenario;
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

export default function CommodityTradePlanWizard({
  scenario,
  capital,
  minRR,
  maxRisk,
  passingSteps,
  onComplete,
}: Props) {
  const [supplyRead, setSupplyRead] = useState("");
  const [classificationCheck, setClassificationCheck] = useState("");
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
      numericUnits > 0 &&
      Number.isFinite(roundedPositionRisk) &&
      roundedPositionRisk <= riskBudget &&
      roundedPositionRisk >= riskBudget * 0.7;

    const nextResults: Result[] = [
      {
        correct: supplyRead === "sesgo_alcista_oferta",
        explanation: "Un evento de oferta directo y confirmado (como un recorte de producción) suele tener un peso alto sobre la dirección esperada del precio.",
      },
      {
        correct: classificationCheck === "diversifica_riesgo",
        explanation: `${scenario.currentHolding}. Operar ${scenario.commodityToTrade} (de clasificación distinta) diversifica en vez de concentrar el mismo tipo de riesgo.`,
      },
      {
        correct: focus === "wti",
        explanation: `${scenario.commodityToTrade} tiene el catalizador de oferta más directo y confirmado del escenario.`,
      },
      {
        correct: planValid,
        explanation: `La entrada debe quedar dentro de ${formatPrice(scenario.entryZoneLow)}–${formatPrice(scenario.entryZoneHigh)}, el stop bajo la zona y el objetivo ofrecer al menos 1:${minRR}.`,
      },
      {
        correct: sizeValid,
        explanation: `El riesgo máximo es ${formatCurrency(riskBudget)}. Unidades = riesgo máximo ÷ (entrada − stop), sin redondear hacia arriba.`,
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
  const canSubmit = supplyRead && classificationCheck && focus && entry && stop && target && units;
  const currentRR = Number.isFinite(rr) && rr > 0 ? rr.toFixed(2) : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Oferta" value="OPEC+ recorta producción" />
          <Metric label="Dólar" value="Debilitando" />
          <Metric label="Cartera" value={scenario.currentHolding} />
          <Metric label="Capital" value={formatCurrency(capital)} />
        </div>
      </div>

      <Step number={1} title="Lee el contexto de oferta">
        <Choice value={supplyRead} onChange={(value) => { setSupplyRead(value); resetFeedback(); }} options={[
          { id: "sesgo_alcista_oferta", label: "Recorte confirmado — sesgo alcista" },
          { id: "sesgo_bajista_oferta", label: "Sesgo bajista, sin más análisis" },
          { id: "esperar_mas_datos", label: "Esperar más datos antes de decidir" },
        ]} />
      </Step>

      <Step number={2} title="Evalúa refugio/cíclico y concentración de cartera">
        <Choice value={classificationCheck} onChange={(value) => { setClassificationCheck(value); resetFeedback(); }} options={[
          { id: "diversifica_riesgo", label: "Diversifica — clasificación distinta a lo que ya tienes" },
          { id: "concentra_riesgo", label: "Concentra el mismo tipo de riesgo" },
          { id: "ignorar", label: "Ignorar — no afecta al nuevo trade" },
        ]} />
      </Step>

      <Step number={3} title="Elige la materia prima a operar">
        <Choice value={focus} onChange={(value) => { setFocus(value); resetFeedback(); }} options={[
          { id: "wti", label: `${scenario.commodityToTrade}: catalizador de oferta confirmado` },
          { id: "oro_extra", label: "Duplicar la posición de oro que ya tienes" },
          { id: "activo_sin_catalizador", label: "Un activo sin catalizador definido" },
        ]} />
      </Step>

      <Step number={4} title={`Construye entrada, stop y objetivo · mínimo 1:${minRR}`}>
        <p className="mb-3 text-xs text-tp-text-muted">
          Zona de entrada {scenario.commodityToTrade}: {formatPrice(scenario.entryZoneLow)}–{formatPrice(scenario.entryZoneHigh)}. R:R actual: <span className={rr >= minRR ? "text-tp-demand" : "text-tp-warning"}>1:{currentRR}</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <NumberInput label="Entrada" value={entry} step="0.01" onChange={(value) => { setEntry(value); resetFeedback(); }} />
          <NumberInput label="Stop Loss" value={stop} step="0.01" onChange={(value) => { setStop(value); resetFeedback(); }} />
          <NumberInput label="Take Profit" value={target} step="0.01" onChange={(value) => { setTarget(value); resetFeedback(); }} />
        </div>
      </Step>

      <Step number={5} title={`Dimensiona la posición en unidades · riesgo máximo ${formatCurrency(riskBudget)}`}>
        <NumberInput label="Unidades" value={units} step="1" onChange={(value) => { setUnits(value); resetFeedback(); }} />
        {riskPerUnit > 0 && numericUnits > 0 && (
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
