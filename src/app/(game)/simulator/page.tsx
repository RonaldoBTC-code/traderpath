"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TradingChart from "@/components/simulator/TradingChart";
import OrderPanel from "@/components/simulator/OrderPanel";
import TradingDiaryForm from "@/components/simulator/TradingDiaryForm";
import CharacterDialogue from "@/components/narrative/CharacterDialogue";
import { useGameStore } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency } from "@/lib/utils/format";
import { saveTradingRecord } from "@/lib/supabase/trading";
import type { ClosedOperation, MarketCandle, SimulatorOrder, TradeOutcome } from "@/types/simulator";

const INITIAL_VISIBLE_CANDLES = 100;

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="h-[600px] animate-pulse rounded-md bg-tp-surface" />}>
      <SimulatorContent />
    </Suspense>
  );
}

function SimulatorContent() {
  const hasMounted = useHasMounted();
  const searchParams = useSearchParams();
  const devMode = process.env.NODE_ENV === "development" && searchParams.get("dev") === "true";
  const { virtualCapital, isMissionCompleted, applyCapitalChange } = useGameStore();
  const unlocked = devMode || isMissionCompleted("level_1", "m1_4");

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CANDLES);
  const [loading, setLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [activeOrder, setActiveOrder] = useState<SimulatorOrder | null>(null);
  const [closedOperation, setClosedOperation] = useState<ClosedOperation | null>(null);
  const [completedOperation, setCompletedOperation] = useState<ClosedOperation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showSpeculator, setShowSpeculator] = useState(false);
  const [penaltyApplied, setPenaltyApplied] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    const controller = new AbortController();

    const loadCandles = async () => {
      setLoading(true);
      setMarketError(null);
      setActiveOrder(null);
      setClosedOperation(null);
      setCompletedOperation(null);
      try {
        const response = await fetch(`/api/market/candles?symbol=${symbol}&interval=${interval}`, { signal: controller.signal });
        const result = await response.json() as { candles?: MarketCandle[]; source?: string; error?: string };
        if (!response.ok || !result.candles || result.candles.length <= INITIAL_VISIBLE_CANDLES) {
          throw new Error(result.error ?? "No hay suficientes velas para iniciar el replay.");
        }
        setCandles(result.candles);
        setVisibleCount(INITIAL_VISIBLE_CANDLES);
        setSource(result.source ?? "Proveedor externo");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setMarketError((error as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadCandles();
    return () => controller.abort();
  }, [interval, symbol, unlocked]);

  const visibleCandles = useMemo(() => candles.slice(0, visibleCount), [candles, visibleCount]);
  const currentPrice = visibleCandles.at(-1)?.close ?? 0;
  const remainingCandles = Math.max(0, candles.length - visibleCount);

  if (!hasMounted) return <div className="h-[600px] animate-pulse rounded-md bg-tp-surface" />;

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-xl rounded-md border border-tp-border bg-tp-surface p-8 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 font-display text-2xl font-bold">Simulador bloqueado</h1>
        <p className="mt-2 text-sm text-tp-text-muted">Primero completa “Tu Capital, Tu Responsabilidad”. No puedes operar hasta comprender Stop Loss, R:R y tamaño de posición.</p>
        <Link href="/world" className="mt-5 inline-block rounded-sm bg-tp-gold px-5 py-2 font-bold text-tp-base">Volver al mundo</Link>
      </div>
    );
  }

  const executeOrder = (order: SimulatorOrder) => {
    setActiveOrder({ ...order, entryPrice: currentPrice });
    setCompletedOperation(null);
    setSaveMessage("");
  };

  const closeOperation = (order: SimulatorOrder, outcome: TradeOutcome, exitPrice: number) => {
    const movement = order.direction === "LONG" ? exitPrice - order.entryPrice : order.entryPrice - exitPrice;
    const pnl = Math.round(movement * order.units * 100) / 100;
    const risk = Math.abs(order.entryPrice - order.stopLoss);
    const reward = Math.abs(order.takeProfit - order.entryPrice);
    setClosedOperation({
      ...order,
      exitPrice,
      outcome,
      pnl,
      riskReward: risk > 0 ? reward / risk : 0,
    });
    setActiveOrder(null);
  };

  const advanceMarket = () => {
    if (!activeOrder || visibleCount >= candles.length) return;
    const nextCandle = candles[visibleCount];
    setVisibleCount((count) => count + 1);

    if (activeOrder.direction === "LONG") {
      if (nextCandle.low <= activeOrder.stopLoss) closeOperation(activeOrder, "LOSS", activeOrder.stopLoss);
      else if (nextCandle.high >= activeOrder.takeProfit) closeOperation(activeOrder, "WIN", activeOrder.takeProfit);
    } else {
      if (nextCandle.high >= activeOrder.stopLoss) closeOperation(activeOrder, "LOSS", activeOrder.stopLoss);
      else if (nextCandle.low <= activeOrder.takeProfit) closeOperation(activeOrder, "WIN", activeOrder.takeProfit);
    }
  };

  const closeAtMarket = () => {
    if (!activeOrder) return;
    const outcome: TradeOutcome =
      activeOrder.direction === "LONG"
        ? currentPrice >= activeOrder.entryPrice ? "WIN" : "LOSS"
        : currentPrice <= activeOrder.entryPrice ? "WIN" : "LOSS";
    closeOperation(activeOrder, outcome, currentPrice);
  };

  const unsafeAttempt = () => {
    if (!penaltyApplied) {
      applyCapitalChange(-300);
      setPenaltyApplied(true);
    }
    setShowSpeculator(true);
  };

  const submitDiary = async (reasoning: string, emotion: string, lesson: string) => {
    if (!closedOperation) return;
    setSaving(true);
    try {
      const remoteSaved = await saveTradingRecord(closedOperation, reasoning, emotion, lesson);
      applyCapitalChange(closedOperation.pnl);
      setCompletedOperation(closedOperation);
      setClosedOperation(null);
      setSaveMessage(remoteSaved ? "Operación y diario guardados en tu cuenta." : "Operación guardada en esta sesión local.");
    } catch {
      applyCapitalChange(closedOperation.pnl);
      setCompletedOperation(closedOperation);
      setClosedOperation(null);
      setSaveMessage("El resultado se aplicó localmente. El diario remoto se reintentará en una versión posterior.");
    } finally {
      setSaving(false);
    }
  };

  const resetOperation = () => {
    setCompletedOperation(null);
    setSaveMessage("");
    setPenaltyApplied(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-tp-info">Laboratorio de mercado</p>
          <h1 className="font-display text-3xl font-bold">Simulador de Trading</h1>
          <p className="mt-1 max-w-2xl text-sm text-tp-text-muted">Planifica con datos históricos reales sin conocer las velas ocultas. El resultado importa menos que respetar el proceso.</p>
        </div>
        <div className="rounded-sm border border-tp-border bg-tp-surface px-4 py-2 text-right">
          <p className="text-[9px] uppercase text-tp-text-muted">Capital virtual</p>
          <p className="font-data text-lg text-tp-demand">{formatCurrency(virtualCapital)}</p>
        </div>
      </header>

      {showSpeculator && (
        <div className="space-y-3 rounded-md border border-tp-supply/40 bg-tp-supply/5 p-4">
          <CharacterDialogue dialogue={{
            id: "simulator_unsafe",
            character: "el_especulador",
            type: "enemy_taunt",
            text: "¿Stop Loss? Si tu análisis es bueno, no lo necesitas. Acabas de pagar $300 por comprobar por qué esa idea destruye cuentas.",
          }} />
          <button onClick={() => setShowSpeculator(false)} className="rounded-sm bg-tp-supply px-4 py-2 text-xs font-bold text-tp-base">Volver y proteger la operación</button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-md border border-tp-border bg-tp-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tp-border p-3">
            <div className="flex gap-2">
              <select value={symbol} disabled={!!activeOrder || !!closedOperation} onChange={(event) => setSymbol(event.target.value)} className="rounded-sm border border-tp-border bg-tp-base px-3 py-2 font-data text-xs">
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
              </select>
              <select value={interval} disabled={!!activeOrder || !!closedOperation} onChange={(event) => setInterval(event.target.value)} className="rounded-sm border border-tp-border bg-tp-base px-3 py-2 font-data text-xs">
                <option value="15m">15m</option>
                <option value="1h">1H</option>
                <option value="4h">4H</option>
                <option value="1d">1D</option>
              </select>
            </div>
            <div className="text-right">
              <p className="font-data text-lg text-tp-text">{currentPrice ? formatCurrency(currentPrice) : "—"}</p>
              <p className="text-[9px] text-tp-text-muted">{remainingCandles} velas ocultas</p>
            </div>
          </div>
          {loading ? (
            <div className="flex h-[390px] items-center justify-center text-sm text-tp-text-muted">Cargando mercado...</div>
          ) : marketError ? (
            <div className="flex h-[390px] items-center justify-center p-6 text-center text-sm text-tp-supply">{marketError}</div>
          ) : (
            <TradingChart candles={visibleCandles} />
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-tp-border px-3 py-2 text-[9px] text-tp-text-muted">
            <span>Datos históricos: {source}. Uso exclusivamente educativo.</span>
            <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="text-tp-info hover:underline">Gráficos por TradingView Lightweight Charts</a>
          </div>
          {activeOrder && (
            <div className="border-t border-tp-gold/30 bg-tp-gold/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-tp-gold">Operación abierta · {activeOrder.direction}</p>
                  <p className="mt-1 text-[10px] text-tp-text-muted">Avanza una vela sin conocer el futuro. Si toca SL y TP en la misma vela, se aplica primero el Stop Loss.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={closeAtMarket} className="rounded-sm border border-tp-border px-3 py-2 text-xs text-tp-text-muted">Cerrar al mercado</button>
                  <button onClick={advanceMarket} disabled={remainingCandles === 0} className="rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-base disabled:opacity-40">Avanzar 1 vela</button>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-md border border-tp-border bg-tp-surface p-5">
          <OrderPanel asset={symbol.replace("USDT", "/USDT")} marketPrice={currentPrice} capital={virtualCapital} disabled={loading || !!activeOrder || !!closedOperation} onExecute={executeOrder} onUnsafeAttempt={unsafeAttempt} />
        </aside>
      </div>

      {closedOperation && <TradingDiaryForm operation={closedOperation} saving={saving} onSubmit={submitDiary} />}

      {completedOperation && (
        <div className={`rounded-md border p-5 ${completedOperation.outcome === "WIN" ? "border-tp-demand/40 bg-tp-demand/5" : "border-tp-supply/40 bg-tp-supply/5"}`}>
          <p className="font-display text-lg font-bold">Operación reflexionada</p>
          <p className="mt-1 text-sm text-tp-text-muted">{saveMessage}</p>
          <p className={`mt-3 font-data text-2xl ${completedOperation.pnl >= 0 ? "text-tp-demand" : "text-tp-supply"}`}>{completedOperation.pnl >= 0 ? "+" : ""}{formatCurrency(completedOperation.pnl)}</p>
          <button onClick={resetOperation} className="mt-4 rounded-sm bg-tp-gold px-5 py-2 font-bold text-tp-base">Preparar otra operación</button>
        </div>
      )}
    </div>
  );
}
