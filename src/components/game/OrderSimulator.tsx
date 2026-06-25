"use client";

import { useState } from "react";

interface Scenario {
  id: string;
  setup: string;
  correctOrderType: string;
}

interface Props {
  scenarios: Scenario[];
  onComplete: (score: number) => void;
}

const ORDER_TYPES = [
  { id: "limit_buy", label: "Limit Buy", description: "Compra cuando baje a mi precio" },
  { id: "limit_sell", label: "Limit Sell", description: "Venta cuando suba a mi precio" },
  { id: "market_buy", label: "Market Buy", description: "Compra inmediata al precio actual" },
  { id: "market_sell", label: "Market Sell", description: "Venta inmediata al precio actual" },
  { id: "trailing_stop", label: "Trailing Stop", description: "Stop que se mueve a mi favor" },
];

export default function OrderSimulator({ scenarios, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const current = scenarios[currentIndex];
  if (!current) return null;

  const handleSelect = (orderId: string) => {
    if (feedback) return;
    setSelectedOrder(orderId);
    const isCorrect = orderId === current.correctOrderType;
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setSelectedOrder(null);
      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onComplete(Math.round(((score + (isCorrect ? 1 : 0)) / scenarios.length) * 100));
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>Escenario {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-gold transition-all" style={{ width: `${(currentIndex / scenarios.length) * 100}%` }} />
      </div>

      {/* Scenario */}
      <div className="bg-tp-base border border-tp-border rounded-sm p-4">
        <p className="text-[10px] text-tp-text-muted uppercase tracking-widest mb-1">Situación:</p>
        <p className="text-sm text-tp-text">{current.setup}</p>
      </div>

      {/* Order type options */}
      <p className="text-xs text-tp-text-muted">¿Qué tipo de orden usarías?</p>
      <div className="space-y-2">
        {ORDER_TYPES.map((order) => {
          let classes = "border-tp-border bg-tp-base";
          if (feedback && order.id === current.correctOrderType) classes = "border-tp-demand bg-tp-demand/10";
          else if (feedback && order.id === selectedOrder) classes = "border-tp-supply bg-tp-supply/10";
          else if (!feedback && order.id === selectedOrder) classes = "border-tp-info bg-tp-info/10";

          return (
            <button key={order.id} onClick={() => handleSelect(order.id)} disabled={!!feedback}
              className={`w-full text-left px-4 py-2 rounded-sm border text-sm transition ${classes} hover:border-tp-gold/50 disabled:cursor-default`}>
              <span className="font-medium">{order.label}</span>
              <span className="text-tp-text-muted ml-2 text-xs">— {order.description}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`rounded-sm p-2 text-sm text-center ${feedback === "correct" ? "bg-tp-demand/10 text-tp-demand" : "bg-tp-supply/10 text-tp-supply"}`}>
          {feedback === "correct" ? "✅ ¡Orden correcta!" : `❌ Debías usar: ${ORDER_TYPES.find((o) => o.id === current.correctOrderType)?.label}`}
        </div>
      )}
    </div>
  );
}
