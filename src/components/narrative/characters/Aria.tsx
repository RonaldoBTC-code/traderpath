"use client";

export default function Aria({ size = 48 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#4A90E2" strokeWidth="2" />
      {/* Head - sleek, geometric */}
      <path
        d="M30 55 Q30 30, 50 28 Q70 30, 70 55 Q70 75, 50 78 Q30 75, 30 55Z"
        fill="#2A3F55"
        stroke="#4A90E2"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* Circuit lines on face */}
      <path d="M35 45 L40 45 L42 48" stroke="#4A90E2" strokeWidth="0.8" opacity="0.5" />
      <path d="M65 45 L60 45 L58 48" stroke="#4A90E2" strokeWidth="0.8" opacity="0.5" />
      <path d="M50 70 L50 75" stroke="#4A90E2" strokeWidth="0.8" opacity="0.4" />
      {/* Eyes - digital, glowing */}
      <rect x="38" y="49" width="10" height="6" rx="3" fill="#0D1B2A" stroke="#4A90E2" strokeWidth="1" />
      <rect x="52" y="49" width="10" height="6" rx="3" fill="#0D1B2A" stroke="#4A90E2" strokeWidth="1" />
      {/* Eye glow */}
      <rect x="40" y="50.5" width="6" height="3" rx="1.5" fill="#4A90E2" opacity="0.9" />
      <rect x="54" y="50.5" width="6" height="3" rx="1.5" fill="#4A90E2" opacity="0.9" />
      {/* Antenna / sensor */}
      <circle cx="50" cy="25" r="3" fill="#4A90E2" opacity="0.8" />
      <line x1="50" y1="28" x2="50" y2="32" stroke="#4A90E2" strokeWidth="1.5" />
      {/* Mouth - subtle LED line */}
      <rect x="43" y="63" width="14" height="2" rx="1" fill="#4A90E2" opacity="0.6" />
      {/* Data stream particles */}
      <circle cx="30" cy="40" r="1" fill="#4A90E2" opacity="0.4" />
      <circle cx="72" cy="38" r="1" fill="#4A90E2" opacity="0.3" />
      <circle cx="26" cy="60" r="0.8" fill="#4A90E2" opacity="0.3" />
    </svg>
  );
}
