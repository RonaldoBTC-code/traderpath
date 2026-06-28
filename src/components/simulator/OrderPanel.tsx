"use client";

import { useEffect, useMemo, useState } from "react";
import type { SimulatorOrder, TradeDirection } from "@/types/simulator";
import { formatCurrency } from "@/lib/utils/format";

interface Props {
  asset: string;
  marketPrice: number;
  capital: number;
  disabled?: boolean;
  onExecute: (order: SimulatorOrder) => void;
  onUnsafeAttempt: () => void;
}

const CHECKLIST = [
  "Identifiqué la tendencia principal",
  "Marqué soporte y resistencia",
  "Confirmé una señal de entrada",
  "Definí dónde se invalida la idea",
  "Fijé un objetivo razonable",
  "Verifiqué un R:R mínimo de 1:2",
  "Calculé el tamaño de posición",
];

export default function OrderPanel({
  asset,
  marketPrice,
  capital,
  disabled = false,
  onExecute,
  onUnsafeAttempt,
}: Props) {
  const [direction, setDirection] = useState<TradeDirection>("LONG");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [units, setUnits] = useState("");
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));

  useEffect(() => {
    if (!marketPrice || entry) return;
    setEntry(marketPrice.toFixed(2));
  }, [marketPrice, entry]);

  const metrics = useMemo(() => {
    const entryPrice = Number(entry);
    const stop = Number(stopLoss);
    const target = Number(takeProfit);
    const positionUnits = Number(units);
    const structureValid =
      direction === "LONG"
        ? stop > 0 && stop < entryPrice && target > entryPrice
        : target > 0 && target < entryPrice && stop > entryPrice;
    const riskPerUnit = Math.abs(entryPrice - stop);
    const rewardPerUnit = Math.abs(target - entryPrice);
    const rawRiskReward = structureValid && riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;
    const riskReward = Math.round(rawRiskReward * 100) / 100;
    const monetaryRisk = riskPerUnit * positionUnits;
    const maxRisk = capital * 0.02;

    return {
      entryPrice,
      stop,
      target,
      positionUnits,
      structureValid,
      riskReward,
      monetaryRisk,
      maxRisk,
      sizeValid: positionUnits > 0 && monetaryRisk > 0 && monetaryRisk <= maxRisk,
    };
  }, [capital, direction, entry, stopLoss, takeProfit, units]);

  const checklistComplete = checked.every(Boolean);
  const canExecute =
    !disabled &&
    checklistComplete &&
    metrics.structureValid &&
    metrics.riskReward >= 2 &&
    metrics.sizeValid;

  const execute = () => {
    if (!canExecute) return;
    onExecute({
      asset,
      direction,
      entryPrice: metrics.entryPrice,
      stopLoss: metrics.stop,
      takeProfit: metrics.target,
      units: metrics.positionUnits,
      orderType: "MARKET",
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {(["LONG", "SHORT"] as TradeDirection[]).map((option) => (
          <button
            key={option}
            disabled={disabled}
            onClick={() => setDirection(option)}
            className={`rounded-sm border px-3 py-2 font-display text-sm font-bold ${
              direction === option
                ? option === "LONG"
                  ? "border-tp-demand bg-tp-demand/10 text-tp-demand"
                  : "border-tp-supply bg-tp-supply/10 text-tp-supply"
                : "border-tp-border bg-tp-base text-tp-text-muted"
            }`}
          >
            {option === "LONG" ? "Comprar · Long" : "Vender · Short"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Entrada" value={entry} onChange={setEntry} disabled={disabled} />
        <NumberField label="Unidades" value={units} onChange={setUnits} disabled={disabled} step="0.001" />
        <NumberField label="Stop Loss" value={stopLoss} onChange={setStopLoss} disabled={disabled} />
        <NumberField label="Take Profit" value={takeProfit} onChange={setTakeProfit} disabled={disabled} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="R:R" value={metrics.riskReward > 0 ? `1:${metrics.riskReward.toFixed(2)}` : "—"} good={metrics.riskReward >= 2} />
        <Metric label="Riesgo" value={Number.isFinite(metrics.monetaryRisk) ? formatCurrency(metrics.monetaryRisk) : "—"} good={metrics.sizeValid} />
        <Metric label="Máximo 2%" value={formatCurrency(metrics.maxRisk)} good />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold">Checklist pre-operación</h3>
          <span className={`text-xs ${checklistComplete ? "text-tp-demand" : "text-tp-text-muted"}`}>
            {checked.filter(Boolean).length}/7
          </span>
        </div>
        <div className="space-y-2">
          {CHECKLIST.map((item, index) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 rounded-sm border border-tp-border bg-tp-base p-3 text-xs text-tp-text-muted">
              <input
                type="checkbox"
                checked={checked[index]}
                disabled={disabled}
                onChange={() => setChecked((values) => values.map((value, itemIndex) => itemIndex === index ? !value : value))}
                className="mt-0.5 accent-[#F0C040]"
              />
              <span className={checked[index] ? "text-tp-text" : ""}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {!stopLoss && !disabled && (
        <button onClick={onUnsafeAttempt} className="w-full rounded-sm border border-tp-supply/40 bg-tp-supply/5 px-3 py-2 text-xs text-tp-supply">
          Intentar operar sin Stop Loss
        </button>
      )}

      <button
        onClick={execute}
        disabled={!canExecute}
        className="w-full rounded-sm bg-tp-gold px-4 py-3 font-display font-bold text-tp-base disabled:cursor-not-allowed disabled:opacity-35"
      >
        {checklistComplete ? "Ejecutar operación virtual" : "Completa el checklist"}
      </button>

      {!disabled && !canExecute && checklistComplete && (
        <p className="text-center text-xs text-tp-warning">
          Revisa estructura, R:R mínimo 1:2 y riesgo máximo del 2%.
        </p>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, disabled, step = "0.01" }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; step?: string }) {
  return (
    <label className="text-[10px] uppercase tracking-wider text-tp-text-muted">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-sm border border-tp-border bg-tp-base px-3 py-2 font-data text-sm text-tp-text outline-none focus:border-tp-gold disabled:opacity-50"
      />
    </label>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-sm border border-tp-border bg-tp-base p-2">
      <p className="text-[9px] uppercase text-tp-text-muted">{label}</p>
      <p className={`mt-1 font-data text-xs ${good ? "text-tp-demand" : "text-tp-warning"}`}>{value}</p>
    </div>
  );
}
