"use client";

export default function MarketDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating candlesticks */}
      <svg
        className="absolute top-[15%] right-[8%] w-16 h-32 opacity-[0.06] animate-float"
        viewBox="0 0 40 100"
      >
        {/* Green candle */}
        <line x1="12" y1="10" x2="12" y2="90" stroke="#00C896" strokeWidth="1" />
        <rect x="6" y="30" width="12" height="40" fill="#00C896" rx="2" />
      </svg>

      <svg
        className="absolute top-[40%] left-[5%] w-12 h-24 opacity-[0.05]"
        viewBox="0 0 40 100"
        style={{ animationDelay: "1s", animationName: "subtleFloat", animationDuration: "4s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }}
      >
        {/* Red candle */}
        <line x1="20" y1="5" x2="20" y2="95" stroke="#FF4757" strokeWidth="1" />
        <rect x="14" y="25" width="12" height="50" fill="#FF4757" rx="2" />
      </svg>

      <svg
        className="absolute bottom-[25%] right-[15%] w-14 h-28 opacity-[0.04]"
        viewBox="0 0 40 100"
        style={{ animationDelay: "2s", animationName: "subtleFloat", animationDuration: "5s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }}
      >
        {/* Green doji */}
        <line x1="20" y1="5" x2="20" y2="95" stroke="#00C896" strokeWidth="1" />
        <rect x="14" y="44" width="12" height="12" fill="#00C896" rx="1" />
      </svg>

      <svg
        className="absolute top-[60%] left-[12%] w-10 h-20 opacity-[0.04]"
        viewBox="0 0 40 100"
        style={{ animationDelay: "3s", animationName: "subtleFloat", animationDuration: "3.5s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }}
      >
        {/* Green hammer */}
        <line x1="20" y1="10" x2="20" y2="90" stroke="#00C896" strokeWidth="1" />
        <rect x="14" y="10" width="12" height="20" fill="#00C896" rx="2" />
      </svg>

      {/* Connection dots scattered */}
      <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-tp-accent-green/20" />
      <div className="absolute top-[50%] right-[25%] w-2 h-2 rounded-full bg-cyan-400/15" />
      <div className="absolute bottom-[35%] left-[45%] w-1 h-1 rounded-full bg-tp-accent-blue/20" />
      <div className="absolute top-[75%] right-[40%] w-1.5 h-1.5 rounded-full bg-tp-accent-gold/15" />
      <div className="absolute top-[30%] right-[60%] w-1 h-1 rounded-full bg-tp-accent-green/15" />
    </div>
  );
}
