"use client";

import { useState } from "react";

interface Zone {
  type: "demand" | "supply";
  low: number;
  high: number;
}

interface Props {
  correctZones: Zone[];
  requiredCorrect: number;
  onComplete: (score: number) => void;
}

export default function ZonePainter({ correctZones, requiredCorrect, onComplete }: Props) {
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [mode, setMode] = useState<"demand" | "supply">("demand");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Simplified: show price levels as buttons and let user classify them
  const priceLevels = correctZones.map((z) => ({
    label: `$${z.low.toLocaleString("en-US")} - $${z.high.toLocaleString("en-US")}`,
    ...z,
  }));

  const handleClassify = (zone: Zone, userType: "demand" | "supply") => {
    if (selectedZones.some((s) => s.low === zone.low)) return; // Already classified

    const isCorrect = zone.type === userType;
    const newZone = { ...zone, type: userType };
    const updated = [...selectedZones, newZone];
    setSelectedZones(updated);

    if (updated.length === correctZones.length) {
      // Calculate score — compare each selected zone to the original by matching low values
      const correct = updated.filter((s) => {
        const original = correctZones.find((cz) => cz.low === s.low);
        return original && original.type === s.type;
      }).length;
      const finalScore = Math.round((correct / correctZones.length) * 100);
      setTimeout(() => onComplete(finalScore), 1000);
    }
  };

  const getZoneStatus = (zone: Zone) => {
    const selected = selectedZones.find((s) => s.low === zone.low);
    if (!selected) return "pending";
    return selected.type === zone.type ? "correct" : "wrong";
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-tp-text-muted">
        <span>{selectedZones.length} de {correctZones.length} zonas clasificadas</span>
        <span>Necesitas {requiredCorrect} correctas</span>
      </div>
      <div className="w-full h-2 bg-tp-base rounded-full overflow-hidden">
        <div className="h-full bg-tp-demand transition-all" style={{ width: `${(selectedZones.length / correctZones.length) * 100}%` }} />
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button onClick={() => setMode("demand")}
          className={`flex-1 px-3 py-2 rounded-sm text-sm font-medium border transition ${mode === "demand" ? "bg-tp-demand/20 border-tp-demand text-tp-demand" : "bg-tp-base border-tp-border text-tp-text-muted"}`}>
          🟢 Demanda
        </button>
        <button onClick={() => setMode("supply")}
          className={`flex-1 px-3 py-2 rounded-sm text-sm font-medium border transition ${mode === "supply" ? "bg-tp-supply/20 border-tp-supply text-tp-supply" : "bg-tp-base border-tp-border text-tp-text-muted"}`}>
          🔴 Oferta
        </button>
      </div>

      <p className="text-xs text-tp-text-muted">Selecciona &quot;{mode === "demand" ? "Demanda" : "Oferta"}&quot; y haz clic en cada zona para clasificarla.</p>

      {/* Zones as buttons */}
      <div className="space-y-2">
        {priceLevels.map((zone, i) => {
          const status = getZoneStatus(zone);
          const isClassified = status !== "pending";
          return (
            <button
              key={i}
              onClick={() => !isClassified && handleClassify(zone, mode)}
              disabled={isClassified}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm border text-sm transition ${
                status === "correct" ? "border-tp-demand bg-tp-demand/10" :
                status === "wrong" ? "border-tp-supply bg-tp-supply/10" :
                "border-tp-border bg-tp-base hover:border-tp-gold/50"
              } disabled:cursor-default`}
            >
              <span className="font-data">{zone.label}</span>
              {status === "correct" && <span className="text-tp-demand text-xs">✓ Correcto</span>}
              {status === "wrong" && <span className="text-tp-supply text-xs">✗ Incorrecto</span>}
              {status === "pending" && <span className="text-tp-text-muted text-xs">Clic para clasificar como {mode}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
