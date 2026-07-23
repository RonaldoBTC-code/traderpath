"use client";

import { useState } from "react";

export interface CorporateActionScenario {
  situation: string;
  answer: string;
}

interface Props {
  scenarios: CorporateActionScenario[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

const DECISIONS = [
  { id: "efecto_neutral", label: "Ajuste técnico neutral — el valor total no cambia" },
  { id: "comprar_antes_ex_div", label: "Debes comprar antes de la fecha ex-dividendo" },
  { id: "ya_no_calificas", label: "Ya no calificas — la fecha ex-dividendo ya pasó" },
  { id: "positivo_sin_garantia", label: "Señal moderadamente positiva, sin garantía" },
  { id: "no_es_descuento", label: "El precio más bajo no significa que esté 'más barata'" },
];

const EXPLANATIONS: Record<string, string> = {
  efecto_neutral: "Es un ajuste técnico esperado: el valor total de la posición no cambia, solo su forma (precio en efectivo recibido, o precio nominal ajustado).",
  comprar_antes_ex_div: "Solo los accionistas que poseen la acción antes de la fecha ex-dividendo tienen derecho al próximo pago.",
  ya_no_calificas: "Si compras en o después de la fecha ex-dividendo, el vendedor —no tú— recibe el dividendo de ese ciclo.",
  positivo_sin_garantia: "Reducir las acciones en circulación puede reflejar confianza de la administración, pero no garantiza una subida de precio.",
  no_es_descuento: "Un split cambia el número de acciones y el precio nominal, pero no crea valor nuevo — la empresa no se volvió 'más barata' en términos reales.",
};

export default function CorporateActionPlanner({ scenarios, requiredCorrect, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finishedScore, setFinishedScore] = useState<number | null>(null);

  const current = scenarios[currentIndex];
  const isCorrect = selected === current.answer;

  const choose = (decision: string) => {
    if (selected) return;
    setSelected(decision);
    if (decision === current.answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((value) => value + 1);
      setSelected(null);
      return;
    }

    const percent = Math.round((score / scenarios.length) * 100);
    if (score >= requiredCorrect) onComplete(percent);
    else setFinishedScore(percent);
  };

  const reset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinishedScore(null);
  };

  if (finishedScore !== null) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display font-bold text-tp-warning">Resultado: {finishedScore}%</p>
        <p className="text-sm text-tp-text-muted">Necesitas {requiredCorrect} respuestas correctas. Distingue un ajuste técnico de una señal real, y recuerda quién tiene derecho a un dividendo según la fecha ex-dividendo.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-display font-bold text-tp-text">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-tp-text-muted">
        <span>Situación {currentIndex + 1} de {scenarios.length}</span>
        <span>{score} correctas</span>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <p className="text-sm text-tp-text">{current.situation}</p>
      </div>

      <p className="text-sm text-tp-text-muted">¿Cuál es la interpretación correcta?</p>
      <div className="grid gap-2">
        {DECISIONS.map((decision) => {
          const correct = selected && decision.id === current.answer;
          const wrong = selected === decision.id && !isCorrect;
          return (
            <button
              key={decision.id}
              disabled={!!selected}
              onClick={() => choose(decision.id)}
              className={`rounded-sm border px-3 py-2 text-left text-sm transition ${
                correct ? "border-tp-demand bg-tp-demand/10 text-tp-demand" :
                wrong ? "border-tp-supply bg-tp-supply/10 text-tp-supply" :
                "border-tp-border bg-tp-base text-tp-text hover:border-tp-gold/60"
              }`}
            >
              {decision.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={`rounded-sm border p-3 ${isCorrect ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`text-sm font-semibold ${isCorrect ? "text-tp-demand" : "text-tp-supply"}`}>
            {isCorrect ? "Interpretación correcta" : `Interpretación correcta: ${DECISIONS.find((item) => item.id === current.answer)?.label}`}
          </p>
          <p className="mt-1 text-xs text-tp-text-muted">{EXPLANATIONS[current.answer]}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-text">
            {currentIndex === scenarios.length - 1 ? "Ver resultado" : "Siguiente situación"}
          </button>
        </div>
      )}
    </div>
  );
}
