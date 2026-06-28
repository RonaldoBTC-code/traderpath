"use client";

import { useEffect, useMemo, useState } from "react";
import { shuffleArray } from "@/lib/utils/shuffle";

type StationId = "genesis" | "blocks" | "custody" | "lightning";

interface Answer {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

interface Station {
  id: StationId;
  place: string;
  eyebrow: string;
  question: string;
  lesson: string;
  accent: string;
  answers: Answer[];
}

const STATIONS: Station[] = [
  {
    id: "genesis",
    place: "Plaza Genesis",
    eyebrow: "El problema original",
    question: "¿Qué aportó Bitcoin al dinero digital?",
    lesson: "Bitcoin coordinó un libro contable público sin una autoridad central mediante firmas, nodos y prueba de trabajo.",
    accent: "#F7931A",
    answers: [
      { id: "a", text: "Un sistema peer-to-peer que evita el doble gasto sin un banco central", correct: true, feedback: "Correcto. Esa es la propuesta central descrita por Satoshi Nakamoto." },
      { id: "b", text: "Una empresa que garantiza el precio de BTC", correct: false, feedback: "Bitcoin no tiene una empresa emisora ni garantiza un precio." },
      { id: "c", text: "Una base de datos privada para bancos", correct: false, feedback: "La red es pública y está diseñada para operar entre pares." },
    ],
  },
  {
    id: "blocks",
    place: "Taller de Bloques",
    eyebrow: "Consenso verificable",
    question: "Un minero propone un bloque que crea bitcoins fuera de las reglas. ¿Qué ocurre?",
    lesson: "Los mineros proponen bloques; los nodos completos verifican las reglas y rechazan los bloques inválidos.",
    accent: "#F0C040",
    answers: [
      { id: "a", text: "Los nodos lo rechazan aunque el minero haya gastado energía", correct: true, feedback: "Correcto. La prueba de trabajo no vuelve válido un bloque que rompe el consenso." },
      { id: "b", text: "El bloque se acepta porque los mineros controlan Bitcoin", correct: false, feedback: "Los mineros no pueden obligar a los nodos a aceptar reglas inválidas." },
      { id: "c", text: "El bloque se acepta si contiene muchas transacciones", correct: false, feedback: "El volumen de transacciones no sustituye la validación." },
    ],
  },
  {
    id: "custody",
    place: "Casa de Custodia",
    eyebrow: "Control y responsabilidad",
    question: "¿Qué guarda realmente una wallet de Bitcoin?",
    lesson: "La red registra UTXO. La wallet administra claves y datos que permiten detectar y autorizar el gasto de esos fondos.",
    accent: "#22C55E",
    answers: [
      { id: "a", text: "Las claves con las que puede autorizar transacciones", correct: true, feedback: "Correcto. Los bitcoins no son archivos almacenados dentro del teléfono." },
      { id: "b", text: "Monedas digitales descargadas de la blockchain", correct: false, feedback: "La blockchain registra transacciones y salidas no gastadas; no descarga monedas a la wallet." },
      { id: "c", text: "Una contraseña que soporte puede recuperar", correct: false, feedback: "Una wallet de autocustodia no tiene un soporte central capaz de reconstruir tus claves." },
    ],
  },
  {
    id: "lightning",
    place: "Puente Lightning",
    eyebrow: "Capas de pago",
    question: "¿Cómo se relaciona Lightning con Bitcoin?",
    lesson: "Lightning usa canales anclados en Bitcoin para pagos rápidos; la capa base conserva la función de liquidación y resolución.",
    accent: "#60A5FA",
    answers: [
      { id: "a", text: "Es una red de canales que se apoya en transacciones de Bitcoin", correct: true, feedback: "Correcto. Lightning complementa la capa base; no la reemplaza." },
      { id: "b", text: "Es una altcoin que compite con BTC", correct: false, feedback: "Lightning no emite una moneda alternativa." },
      { id: "c", text: "Es el nombre comercial de la minería rápida", correct: false, feedback: "Lightning trabaja con canales de pago, no con una modalidad de minería." },
    ],
  },
];

export default function BitcoinOriginGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [failedScore, setFailedScore] = useState<number | null>(null);

  useEffect(() => {
    setStations(
      shuffleArray(STATIONS).map((station) => ({
        ...station,
        answers: shuffleArray(station.answers),
      })),
    );
  }, []);

  const current = stations[index];
  const progress = stations.length ? ((index + (selected ? 1 : 0)) / stations.length) * 100 : 0;
  const correctCount = useMemo(() => score, [score]);

  if (!current) {
    return <p className="py-8 text-center text-sm text-tp-text-muted">Preparando Ciudad Origen…</p>;
  }

  const chooseAnswer = (answer: Answer) => {
    if (selected) return;
    setSelected(answer);
    if (answer.correct) setScore((value) => value + 1);
  };

  const advance = () => {
    if (!selected) return;
    if (index < stations.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      return;
    }

    const percent = Math.round((correctCount / stations.length) * 100);
    if (percent >= 75) onComplete(percent);
    else setFailedScore(percent);
  };

  const retry = () => {
    setStations(
      shuffleArray(STATIONS).map((station) => ({
        ...station,
        answers: shuffleArray(station.answers),
      })),
    );
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFailedScore(null);
  };

  if (failedScore !== null) {
    return (
      <div className="space-y-4 rounded-md border border-tp-warning/30 bg-tp-warning/5 p-5 text-center">
        <p className="font-display text-lg font-bold">La ciudad aún tiene zonas por explorar</p>
        <p className="text-sm text-tp-text-muted">Resultado: {failedScore}%. Necesitas 75% para abrir el camino hacia el mercado cripto.</p>
        <button onClick={retry} className="rounded-sm bg-tp-gold px-5 py-2.5 font-display font-bold text-tp-base">
          Recorrer de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-md border border-amber-300/20 bg-gradient-to-br from-[#233a3d] via-[#162b32] to-[#101824]">
        <div className="relative h-44">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#ffd59a] to-[#f6b86f]" />
          <div className="absolute inset-x-0 bottom-0 h-28 rounded-t-[50%] bg-[#6f9d57]" />
          <div className="absolute bottom-8 left-[8%] h-14 w-16 rounded-t-xl bg-[#f5e1b9] shadow-lg">
            <div className="mx-auto -mt-6 h-8 w-10 rotate-45 rounded-sm bg-[#d96e4a]" />
          </div>
          <div className="absolute bottom-6 left-[42%] h-20 w-20 rounded-t-2xl bg-[#e8a43d] shadow-lg">
            <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 font-data font-bold text-[#F7931A]">₿</div>
          </div>
          <div className="absolute bottom-7 right-[9%] h-12 w-24 rounded-full bg-[#57a7bd] shadow-lg" />
          <div className="absolute bottom-2 left-1/2 h-24 w-5 -translate-x-1/2 rotate-[62deg] rounded-full bg-[#ead7aa]" />
          <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white">
            Ciudad Origen · estación {index + 1}/{stations.length}
          </div>
          <div className="absolute bottom-4 right-4 rounded-md border border-white/20 bg-black/55 px-3 py-2 text-right backdrop-blur">
            <p className="text-[9px] uppercase tracking-widest text-white/65">{current.eyebrow}</p>
            <p className="font-display text-sm font-bold text-white">{current.place}</p>
          </div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-tp-base">
        <div className="h-full rounded-full bg-tp-crypto transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: current.accent }}>{current.eyebrow}</p>
        <h4 className="mt-1 font-display text-lg font-bold">{current.question}</h4>
      </div>

      <div className="grid gap-2">
        {current.answers.map((answer) => {
          const isSelected = selected?.id === answer.id;
          const revealCorrect = selected && answer.correct;
          return (
            <button
              key={answer.id}
              onClick={() => chooseAnswer(answer)}
              disabled={!!selected}
              className={`rounded-sm border p-3 text-left text-sm transition ${
                revealCorrect
                  ? "border-tp-demand bg-tp-demand/10"
                  : isSelected
                    ? "border-tp-supply bg-tp-supply/10"
                    : "border-tp-border bg-tp-base hover:border-tp-crypto/60"
              }`}
            >
              {answer.text}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={`rounded-sm border p-4 ${selected.correct ? "border-tp-demand/30 bg-tp-demand/5" : "border-tp-warning/30 bg-tp-warning/5"}`}>
          <p className="font-display text-sm font-bold">{selected.correct ? "Lectura correcta" : "Revisa el concepto"}</p>
          <p className="mt-1 text-sm text-tp-text-muted">{selected.feedback}</p>
          <p className="mt-2 text-xs leading-relaxed text-tp-text">{current.lesson}</p>
          <button onClick={advance} className="mt-4 rounded-sm bg-tp-gold px-4 py-2 font-display text-sm font-bold text-tp-base">
            {index < stations.length - 1 ? "Siguiente lugar" : "Completar recorrido"}
          </button>
        </div>
      )}
    </div>
  );
}

