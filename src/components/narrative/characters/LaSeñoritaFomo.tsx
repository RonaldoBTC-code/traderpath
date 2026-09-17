"use client";

export default function LaSeñoritaFomo({ size = 48 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="48" fill="#FCE7F3" stroke="#EC4899" strokeWidth="3" />
      {/* Flying ponytail */}
      <path d="M68 34 Q84 26 88 40 Q80 38 72 44 Z" fill="#7C3AED" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Face */}
      <circle cx="48" cy="52" r="25" fill="#FBD7B0" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Hair with bangs */}
      <path d="M25 50 Q23 26 48 24 Q73 26 71 50 Q68 34 58 34 Q52 30 44 33 Q30 34 25 50Z" fill="#7C3AED" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Eyes - wide and sparkly, looking sideways */}
      <circle cx="40" cy="51" r="7.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" />
      <circle cx="58" cy="51" r="7.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" />
      <circle cx="42.5" cy="51" r="3.6" fill="#1E2A44" />
      <circle cx="60.5" cy="51" r="3.6" fill="#1E2A44" />
      <circle cx="43.5" cy="49.5" r="1.4" fill="#FFFFFF" />
      <circle cx="61.5" cy="49.5" r="1.4" fill="#FFFFFF" />
      {/* Worried raised eyebrows */}
      <path d="M34 41 Q40 38 46 41" stroke="#1E2A44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M52 41 Q58 38 64 41" stroke="#1E2A44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="32" cy="59" rx="4" ry="2.5" fill="#F9A8D4" opacity="0.9" />
      <ellipse cx="64" cy="59" rx="4" ry="2.5" fill="#F9A8D4" opacity="0.9" />
      {/* Excited open mouth */}
      <ellipse cx="49" cy="65" rx="5.5" ry="4" fill="#1E2A44" />
      <ellipse cx="49" cy="66.5" rx="3" ry="1.8" fill="#F87171" />
      {/* Phone in hand */}
      <rect x="70" y="60" width="13" height="21" rx="3.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" transform="rotate(12 76 70)" />
      <path d="M73 66 L79 66 M73 70 L79 70" stroke="#EC4899" strokeWidth="1.8" transform="rotate(12 76 70)" />
      {/* Notification ping */}
      <circle cx="83" cy="56" r="4" fill="#DC2626" stroke="#1E2A44" strokeWidth="1.5" />
      <text x="83" y="58.5" textAnchor="middle" fontSize="6" fontWeight="800" fill="#FFFFFF">!</text>
      {/* Motion lines */}
      <path d="M16 46 L24 46 M13 53 L21 53 M16 60 L23 60" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
