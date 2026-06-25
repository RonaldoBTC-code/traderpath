"use client";

import { useState } from "react";

export interface TutorialContent {
  title: string;
  learningObjective: string;
  conceptExplanation: string;
  practicalExample: string;
  stepByStepInstructions: string[];
  commonMistakes?: string[];
  hint?: string;
}

interface Props {
  tutorial: TutorialContent;
  onContinue: () => void;
}

export default function MissionTutorial({ tutorial, onContinue }: Props) {
  const [step, setStep] = useState(0);

  const sections = [
    { label: "Objetivo", content: tutorial.learningObjective, icon: "🎯" },
    { label: "Concepto", content: tutorial.conceptExplanation, icon: "💡" },
    { label: "Ejemplo", content: tutorial.practicalExample, icon: "📖" },
  ];

  const currentSection = sections[step];

  if (step >= sections.length) {
    // Show step-by-step instructions before the minigame
    return (
      <div className="bg-tp-surface border border-tp-border rounded-md p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h4 className="font-display font-bold text-sm text-tp-gold">Instrucciones</h4>
        </div>
        <ol className="space-y-2">
          {tutorial.stepByStepInstructions.map((instruction, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-tp-text">
              <span className="font-data text-tp-gold text-xs mt-0.5">{i + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
        {tutorial.commonMistakes && tutorial.commonMistakes.length > 0 && (
          <div className="bg-tp-supply/5 border border-tp-supply/20 rounded-sm p-3">
            <p className="text-[10px] text-tp-supply uppercase tracking-widest mb-1">Errores comunes</p>
            {tutorial.commonMistakes.map((mistake, i) => (
              <p key={i} className="text-xs text-tp-text-muted">⚠️ {mistake}</p>
            ))}
          </div>
        )}
        <button onClick={onContinue}
          className="w-full px-5 py-2.5 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
          ¡Estoy listo! Comenzar →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-tp-surface border border-tp-border rounded-md p-5 space-y-4">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {sections.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-6 bg-tp-gold" : i < step ? "w-3 bg-tp-demand" : "w-3 bg-tp-border"
          }`} />
        ))}
        <div className={`h-1.5 w-3 rounded-full ${step >= sections.length ? "bg-tp-demand" : "bg-tp-border"}`} />
      </div>

      {/* Current section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentSection.icon}</span>
          <p className="text-[10px] text-tp-gold uppercase tracking-widest font-semibold">{currentSection.label}</p>
        </div>
        <p className="text-sm text-tp-text leading-relaxed">{currentSection.content}</p>
      </div>

      {/* Hint (always visible if exists) */}
      {tutorial.hint && step === 0 && (
        <div className="bg-tp-info/5 border border-tp-info/20 rounded-sm p-3">
          <p className="text-xs text-tp-info">💡 {tutorial.hint}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 border border-tp-border rounded-sm text-sm text-tp-text-muted hover:border-tp-gold/50 transition">
            ← Atrás
          </button>
        )}
        <button onClick={() => setStep((s) => s + 1)}
          className="flex-1 px-5 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
          {step < sections.length - 1 ? "Siguiente →" : "Ver instrucciones →"}
        </button>
      </div>
    </div>
  );
}
