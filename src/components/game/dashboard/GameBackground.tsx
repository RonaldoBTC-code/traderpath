"use client";

export default function GameBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep radial gradients */}
      <div className="absolute -top-40 right-1/4 w-[800px] h-[800px] rounded-full bg-tp-accent-green/[0.03] blur-[180px]" />
      <div className="absolute top-1/3 -left-40 w-[700px] h-[700px] rounded-full bg-tp-accent-blue/[0.025] blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/[0.02] blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-cyan-500/[0.015] blur-[200px]" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-tp-accent-gold/[0.01] blur-[140px]" />

      {/* Subtle financial grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,200,150,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.4) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Diagonal light streaks */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-tp-accent-green/20 to-transparent rotate-[35deg]" />
        <div className="absolute top-[30%] -left-10 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent rotate-[25deg]" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[1px] bg-gradient-to-r from-transparent via-tp-accent-blue/10 to-transparent rotate-[-20deg]" />
      </div>

      {/* SVG depth chart lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <path
          d="M0 600 Q200 550 400 580 Q600 610 800 530 Q1000 450 1200 500"
          fill="none"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
        />
        <path
          d="M0 400 Q150 380 300 420 Q500 460 700 390 Q900 320 1200 370"
          fill="none"
          stroke="url(#lineGrad2)"
          strokeWidth="1"
        />
        <path
          d="M0 250 Q250 220 500 270 Q750 320 1000 250 Q1100 220 1200 240"
          fill="none"
          stroke="url(#lineGrad3)"
          strokeWidth="0.8"
        />
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C896" stopOpacity="0" />
            <stop offset="50%" stopColor="#00C896" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0" />
            <stop offset="50%" stopColor="#4A90E2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4A90E2" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
