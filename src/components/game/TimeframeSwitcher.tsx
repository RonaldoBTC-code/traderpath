"use client";

import { useState } from "react";

interface Props {
  asset: string;
  timeframes: string[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

interface AnalysisQuestion {
  timeframe: string;
  title: string;
  observation: string;
  path: string;
  question: string;
  options: { id: string; label: string }[];
  answer: string;
  explanation: string;
}

const QUESTIONS: AnalysisQuestion[] = [
  {
    timeframe: "1W",
    title: "Estructura macro",
    observation: "El precio conserva máximos y mínimos crecientes sobre el antiguo ATH.",
    path: "M2 70 L16 62 L28 66 L42 48 L54 54 L68 34 L80 40 L98 20",
    question: "¿Cuál es el sesgo que debe gobernar el análisis?",
    options: [{ id: "alcista", label: "Alcista mientras conserve el último mínimo relevante" }, { id: "bajista", label: "Bajista por cada vela roja semanal" }, { id: "neutral", label: "Neutral: el semanal no aporta contexto" }],
    answer: "alcista",
    explanation: "El 1W define el régimen. Una corrección menor no invalida una secuencia macro de máximos y mínimos crecientes.",
  },
  {
    timeframe: "1W",
    title: "Volatilidad estructural",
    observation: "ATR semanal alto y expansión posterior al halving.",
    path: "M2 64 L14 61 L26 65 L38 50 L50 57 L62 39 L74 46 L86 28 L98 34",
    question: "¿Cómo debe afectar el ATR alto a la posición?",
    options: [{ id: "mas", label: "Aumentar unidades para compensar" }, { id: "menos", label: "Usar un stop estructural más amplio y menos unidades" }, { id: "ignorar", label: "Ignorarlo porque el timeframe es lento" }],
    answer: "menos",
    explanation: "Un stop más amplio aumenta el riesgo por unidad; para conservar el mismo riesgo monetario hay que reducir el tamaño.",
  },
  {
    timeframe: "4H",
    title: "Contexto operativo",
    observation: "Retroceso ordenado hacia una zona de demanda con volumen decreciente.",
    path: "M2 22 L14 30 L26 20 L38 35 L50 29 L62 45 L74 42 L86 55 L98 51",
    question: "¿Qué describe mejor este movimiento dentro del sesgo semanal?",
    options: [{ id: "correccion", label: "Corrección potencialmente operable si confirma" }, { id: "reversion", label: "Reversión bajista confirmada" }, { id: "entrada", label: "Compra inmediata sin esperar señal" }],
    answer: "correccion",
    explanation: "El volumen decreciente y la llegada a demanda sugieren corrección, pero la zona necesita confirmación antes de entrar.",
  },
  {
    timeframe: "4H",
    title: "Nivel de invalidación",
    observation: "Zona de demanda entre $87K y $89K; el último mínimo estructural está en $86K.",
    path: "M2 28 L16 36 L30 27 L44 44 L58 39 L72 56 L86 50 L98 58",
    question: "¿Dónde tiene sentido ubicar la invalidación de una tesis long?",
    options: [{ id: "dentro", label: "Dentro de la zona, en $88K" }, { id: "debajo", label: "Debajo del mínimo estructural de $86K" }, { id: "porcentaje", label: "Siempre exactamente 1% bajo entrada" }],
    answer: "debajo",
    explanation: "El stop debe quedar donde la estructura invalida la idea, no dentro del ruido normal de la zona.",
  },
  {
    timeframe: "1H",
    title: "Gatillo de entrada",
    observation: "En demanda aparece barrido de mínimos, recuperación y cierre sobre el máximo previo.",
    path: "M2 26 L16 39 L28 32 L40 52 L52 65 L64 42 L76 45 L88 28 L98 31",
    question: "¿Qué aporta el 1H al plan ya definido en 1W y 4H?",
    options: [{ id: "contexto", label: "Reemplaza por completo al contexto superior" }, { id: "gatillo", label: "Afina el gatillo y reduce la distancia de entrada" }, { id: "direccion", label: "Decide por sí solo la dirección macro" }],
    answer: "gatillo",
    explanation: "El 1H sirve para ejecutar. No debe contradecir ni reemplazar el contexto definido en timeframes superiores.",
  },
  {
    timeframe: "1H",
    title: "Derivados y confirmación",
    observation: "El precio recupera, pero open interest salta y funding llega a +0.08%.",
    path: "M2 58 L14 52 L26 56 L38 44 L50 48 L62 33 L74 38 L86 22 L98 18",
    question: "¿Qué ajuste exige este dato?",
    options: [{ id: "perseguir", label: "Perseguir el precio con una posición mayor" }, { id: "cautela", label: "Evitar perseguir; hay riesgo de long squeeze" }, { id: "short", label: "Abrir short automáticamente" }],
    answer: "cautela",
    explanation: "Funding extremo y open interest creciente indican exceso de apalancamiento long. Es advertencia, no una orden automática de venta.",
  },
];

export default function TimeframeSwitcher({ asset, timeframes, requiredCorrect, onComplete }: Props) {
  const questions = QUESTIONS.filter((question) => timeframes.includes(question.timeframe));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selected === current.answer;

  const choose = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    if (answer === current.answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    const percent = Math.round((score / questions.length) * 100);
    if (score >= requiredCorrect) onComplete(percent);
    else setFailed(true);
  };

  const reset = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFailed(false);
  };

  if (failed) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display font-bold text-tp-warning">La tesis perdió coherencia entre capas</p>
        <p className="text-sm text-tp-text-muted">Acertaste {score} de {questions.length}; necesitas {requiredCorrect}. Orden correcto: macro → contexto → ejecución.</p>
        <button onClick={reset} className="rounded-sm bg-tp-gold px-5 py-2 font-bold text-tp-base">Repetir análisis</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-data text-sm text-tp-gold">{asset}</span>
        <div className="flex gap-1">
          {timeframes.map((timeframe) => (
            <span
              key={timeframe}
              className={`rounded-sm border px-3 py-1 font-data text-xs ${
                timeframe === current.timeframe ? "border-tp-gold bg-tp-gold/10 text-tp-gold" :
                questions.findIndex((question) => question.timeframe === timeframe) < currentIndex ? "border-tp-demand/30 text-tp-demand" :
                "border-tp-border text-tp-text-muted"
              }`}
            >
              {timeframe}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-tp-border bg-tp-base p-4">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">{current.timeframe} · {current.title}</p>
            <p className="mt-1 text-xs text-tp-text-muted">{current.observation}</p>
          </div>
          <span className="shrink-0 text-xs text-tp-text-muted">{currentIndex + 1}/{questions.length}</span>
        </div>
        <svg viewBox="0 0 100 72" role="img" aria-label={`Gráfico simplificado de ${asset} en ${current.timeframe}`} className="mt-3 h-32 w-full">
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#60A5FA" stopOpacity=".35" />
              <stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${current.path} L98 72 L2 72 Z`} fill="url(#chart-fill)" />
          <path d={current.path} fill="none" stroke="#60A5FA" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-tp-text">{current.question}</p>
        <div className="space-y-2">
          {current.options.map((option) => {
            const correct = selected && option.id === current.answer;
            const wrong = selected === option.id && !isCorrect;
            return (
              <button
                key={option.id}
                disabled={!!selected}
                onClick={() => choose(option.id)}
                className={`w-full rounded-sm border px-4 py-3 text-left text-sm ${
                  correct ? "border-tp-demand bg-tp-demand/10 text-tp-demand" :
                  wrong ? "border-tp-supply bg-tp-supply/10 text-tp-supply" :
                  "border-tp-border bg-tp-base text-tp-text hover:border-tp-gold/60"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className={`rounded-sm border p-3 ${isCorrect ? "border-tp-demand/40 bg-tp-demand/10" : "border-tp-supply/40 bg-tp-supply/10"}`}>
          <p className={`text-sm font-semibold ${isCorrect ? "text-tp-demand" : "text-tp-supply"}`}>{isCorrect ? "Lectura correcta" : "Lectura incompleta"}</p>
          <p className="mt-1 text-xs text-tp-text-muted">{current.explanation}</p>
          <button onClick={next} className="mt-3 rounded-sm bg-tp-gold px-4 py-2 text-xs font-bold text-tp-base">
            {currentIndex === questions.length - 1 ? "Cerrar tesis" : "Siguiente capa"}
          </button>
        </div>
      )}
    </div>
  );
}
