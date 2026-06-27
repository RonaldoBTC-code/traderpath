"use client";

import { useState } from "react";
import type { ClosedOperation } from "@/types/simulator";
import { formatCurrency } from "@/lib/utils/format";

interface Props {
  operation: ClosedOperation;
  saving: boolean;
  onSubmit: (reasoning: string, emotion: string, lesson: string) => void;
}

export default function TradingDiaryForm({ operation, saving, onSubmit }: Props) {
  const [reasoning, setReasoning] = useState("");
  const [emotion, setEmotion] = useState("");
  const [lesson, setLesson] = useState("");
  const complete = reasoning.trim().length >= 20 && emotion && lesson.trim().length >= 15;

  return (
    <div className="rounded-md border border-tp-info/30 bg-tp-surface p-5 shadow-info">
      <p className="text-[10px] uppercase tracking-widest text-tp-info">Diario obligatorio</p>
      <h2 className="mt-1 font-display text-xl font-bold">Convierte la operación en aprendizaje</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Summary label="Activo" value={operation.asset} />
        <Summary label="Dirección" value={operation.direction} />
        <Summary label="Resultado" value={operation.outcome} />
        <Summary label="P&L" value={formatCurrency(operation.pnl)} positive={operation.pnl >= 0} />
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-xs text-tp-text-muted">
          ¿Por qué tomaste esta operación?
          <textarea
            value={reasoning}
            onChange={(event) => setReasoning(event.target.value)}
            placeholder="Describe tendencia, zona, señal y gestión del riesgo..."
            className="mt-1 min-h-24 w-full rounded-sm border border-tp-border bg-tp-base p-3 text-sm text-tp-text outline-none focus:border-tp-info"
          />
        </label>
        <label className="block text-xs text-tp-text-muted">
          Estado emocional
          <select
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            className="mt-1 w-full rounded-sm border border-tp-border bg-tp-base p-3 text-sm text-tp-text outline-none focus:border-tp-info"
          >
            <option value="">Selecciona una emoción</option>
            <option value="calma">Calma y concentración</option>
            <option value="fomo">FOMO o urgencia</option>
            <option value="miedo">Miedo a perder</option>
            <option value="confianza">Confianza elevada</option>
            <option value="duda">Duda o indecisión</option>
          </select>
        </label>
        <label className="block text-xs text-tp-text-muted">
          ¿Qué mantendrías o cambiarías?
          <textarea
            value={lesson}
            onChange={(event) => setLesson(event.target.value)}
            placeholder="Escribe una regla concreta para tu próxima operación..."
            className="mt-1 min-h-20 w-full rounded-sm border border-tp-border bg-tp-base p-3 text-sm text-tp-text outline-none focus:border-tp-info"
          />
        </label>
      </div>

      <button
        disabled={!complete || saving}
        onClick={() => onSubmit(reasoning.trim(), emotion, lesson.trim())}
        className="mt-5 w-full rounded-sm bg-tp-info px-4 py-3 font-display font-bold text-tp-base disabled:cursor-not-allowed disabled:opacity-35"
      >
        {saving ? "Guardando reflexión..." : "Guardar y cerrar operación"}
      </button>
      {!complete && <p className="mt-2 text-center text-[10px] text-tp-text-muted">La operación no termina hasta completar la reflexión.</p>}
    </div>
  );
}

function Summary({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-sm border border-tp-border bg-tp-base p-2">
      <p className="text-[9px] uppercase text-tp-text-muted">{label}</p>
      <p className={`mt-1 font-data text-xs ${positive === undefined ? "text-tp-text" : positive ? "text-tp-demand" : "text-tp-supply"}`}>{value}</p>
    </div>
  );
}
