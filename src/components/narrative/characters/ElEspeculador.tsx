"use client";

export default function ElEspeculador({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#FF4757" strokeWidth="2" />
      {/* Face - angular, sharp */}
      <path
        d="M32 50 Q32 30, 50 28 Q68 30, 68 50 Q68 72, 50 75 Q32 72, 32 50Z"
        fill="#2A3F55"
      />
      {/* Slicked back hair */}
      <path
        d="M32 40 Q35 22, 50 20 Q65 22, 68 40 L65 38 Q62 25, 50 24 Q38 25, 35 38Z"
        fill="#0D1B2A"
        stroke="#FF4757"
        strokeWidth="0.5"
        opacity="0.8"
      />
      {/* Eyes - sharp, confident */}
      <path d="M38 49 L46 49 L44 53 L38 53Z" fill="#0D1B2A" />
      <path d="M54 49 L62 49 L62 53 L56 53Z" fill="#0D1B2A" />
      {/* Red eye glow */}
      <circle cx="42" cy="51" r="2" fill="#FF4757" opacity="0.9" />
      <circle cx="58" cy="51" r="2" fill="#FF4757" opacity="0.9" />
      {/* Eyebrows - arrogant, raised */}
      <path d="M37 45 L47 43" stroke="#FF4757" strokeWidth="1.5" opacity="0.7" />
      <path d="M53 43 L63 45" stroke="#FF4757" strokeWidth="1.5" opacity="0.7" />
      {/* Smirk */}
      <path d="M42 63 Q50 60, 60 65" stroke="#FF4757" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Dollar signs floating */}
      <text x="22" y="35" fontSize="8" fill="#FF4757" opacity="0.4">$</text>
      <text x="72" y="40" fontSize="6" fill="#FF4757" opacity="0.3">$</text>
      <text x="18" y="65" fontSize="7" fill="#FF4757" opacity="0.3">$</text>
      {/* Tie / collar hint */}
      <path d="M47 75 L50 82 L53 75" fill="#FF4757" opacity="0.6" />
    </svg>
  );
}
