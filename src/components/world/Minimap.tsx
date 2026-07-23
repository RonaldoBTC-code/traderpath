"use client";

import { useEffect, useRef } from "react";
import { Check, LockKeyhole, X } from "lucide-react";
import type { AcademyTarget } from "@/game/phaser/worldEvents";

/** Estado vivo de la cámara que el minimapa lee cada frame desde un ref. */
export type MinimapCameraState = {
  playerX: number;
  playerY: number;
  viewX: number;
  viewY: number;
  viewWidth: number;
  viewHeight: number;
  zoom: number;
};

/** Un destino ya resuelto: posición de mundo + estado de misión + estética. */
export type MinimapDestinationView = {
  id: AcademyTarget;
  x: number;
  y: number;
  label: string;
  status: "locked" | "available" | "completed";
  accent: string;
  /** Sólo el objetivo actual late; el resto queda quieto para no señalar todo. */
  isObjective: boolean;
};

const MINIMAP_WIDTH = 264;

interface MinimapProps {
  worldWidth: number;
  worldHeight: number;
  image: string;
  destinations: MinimapDestinationView[];
  cameraRef: React.MutableRefObject<MinimapCameraState | null>;
  onFocus: (id: AcademyTarget) => void;
  onTravel: (worldX: number, worldY: number) => void;
  onClose: () => void;
}

/**
 * Minimapa de la isla. Orientación en un mundo que excede el lienzo: dónde está
 * el jugador, qué ve la cámara y a dónde puede ir.
 *
 * El punto del jugador y el marco de la cámara se actualizan en un bucle de
 * animación propio leyendo `cameraRef`, sin re-renderizar este árbol ni el
 * padre: son datos, van 1:1 y sin transición. Sólo se re-renderiza cuando
 * cambia el estado de misión de un destino.
 */
export default function Minimap({
  worldWidth,
  worldHeight,
  image,
  destinations,
  cameraRef,
  onFocus,
  onTravel,
  onClose,
}: MinimapProps) {
  const height = Math.round((MINIMAP_WIDTH * worldHeight) / worldWidth);
  const playerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const sx = MINIMAP_WIDTH / worldWidth;
    const sy = height / worldHeight;
    const tick = () => {
      const cam = cameraRef.current;
      const dot = playerRef.current;
      const frame = viewRef.current;
      if (cam && dot) {
        // translate directo, sin transición: refleja la posición real al instante.
        dot.style.transform = `translate(${cam.playerX * sx}px, ${cam.playerY * sy}px)`;
      }
      if (cam && frame) {
        frame.style.left = `${cam.viewX * sx}px`;
        frame.style.top = `${cam.viewY * sy}px`;
        frame.style.width = `${cam.viewWidth * sx}px`;
        frame.style.height = `${cam.viewHeight * sy}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraRef, worldWidth, worldHeight, height]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const worldX = ((event.clientX - rect.left) / rect.width) * worldWidth;
    const worldY = ((event.clientY - rect.top) / rect.height) * worldHeight;
    onTravel(worldX, worldY);
  };

  return (
    <div
      className="minimap-panel origin-bottom-left rounded-3xl border-2 border-tp-border bg-[rgba(255,255,255,.82)] p-3 shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-label="Minimapa de Academia Ágora"
    >
      <div className="mb-2 flex items-center justify-between gap-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Minimapa</p>
          <p className="font-display text-sm font-bold text-tp-text">Isla de Academia Ágora</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar minimapa"
          className="grid h-7 w-7 place-items-center rounded-full border border-tp-border text-tp-text-muted transition hover:border-tp-gold/50 hover:text-tp-gold active:scale-95"
        >
          <X size={13} />
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border-2 border-tp-border bg-tp-base"
        style={{
          width: MINIMAP_WIDTH,
          height,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "crosshair",
        }}
        onClick={handleMapClick}
      >
        {/* Marco de lo que ve la cámara ahora mismo. */}
        <div
          ref={viewRef}
          className="pointer-events-none absolute rounded-[3px] border-2 border-white/90"
          style={{ boxShadow: "0 0 0 1px rgba(30,42,68,.35)" }}
        />

        {/* Destinos, con su estado de misión. */}
        {destinations.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFocus(d.id);
            }}
            aria-label={`Viajar a ${d.label}${d.status === "locked" ? " (bloqueado)" : ""}`}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90"
            style={{
              left: (d.x / worldWidth) * MINIMAP_WIDTH,
              top: (d.y / worldHeight) * height,
            }}
          >
            {d.isObjective && (
              <span
                className="absolute inset-0 -m-1 animate-ping rounded-full motion-reduce:animate-none"
                style={{ backgroundColor: d.accent, opacity: 0.4 }}
              />
            )}
            <span
              className="relative grid h-4 w-4 place-items-center rounded-full border-2 text-white shadow"
              style={{
                backgroundColor: d.status === "locked" ? "#9aa8bd" : d.accent,
                borderColor: "rgba(255,255,255,.9)",
              }}
            >
              {d.status === "completed" && <Check size={9} strokeWidth={3.5} />}
              {d.status === "locked" && <LockKeyhole size={8} strokeWidth={2.5} />}
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-tp-text/90 px-1.5 py-0.5 text-[8px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
              {d.label}
            </span>
          </button>
        ))}

        {/* Punto del jugador: por encima de todo, sin transición (1:1). */}
        <div
          ref={playerRef}
          className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
        >
          <span
            className="block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tp-gold"
            style={{ boxShadow: "0 0 0 2px rgba(229,150,10,.4)" }}
          />
        </div>
      </div>

      <p className="mt-2 text-center text-[8px] leading-tight text-tp-text-muted">
        Toca un punto para viajar · toca un destino para ir a su misión
      </p>
    </div>
  );
}
