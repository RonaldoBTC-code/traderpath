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
      <circle cx="50" cy="50" r="48" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3" />
      {/* Face */}
      <circle cx="50" cy="52" r="25" fill="#FBD7B0" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Slicked-back hair */}
      <path d="M27 48 Q27 24 50 23 Q73 24 73 48 Q68 32 50 31 Q32 32 27 48Z" fill="#3B2F2F" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Cool sunglasses, gold tint */}
      <rect x="32" y="45" width="15" height="11" rx="5" fill="#F5B301" stroke="#1E2A44" strokeWidth="2.5" />
      <rect x="53" y="45" width="15" height="11" rx="5" fill="#F5B301" stroke="#1E2A44" strokeWidth="2.5" />
      <path d="M47 49 L53 49" stroke="#1E2A44" strokeWidth="2.5" />
      <circle cx="37" cy="48.5" r="2" fill="#FFFFFF" opacity="0.85" />
      <circle cx="58" cy="48.5" r="2" fill="#FFFFFF" opacity="0.85" />
      {/* Confident raised eyebrow */}
      <path d="M54 40 Q60 37 66 40" stroke="#3B2F2F" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 41 Q40 39 45 41" stroke="#3B2F2F" strokeWidth="3" strokeLinecap="round" />
      {/* Smirk */}
      <path d="M42 64 Q50 68 60 62" stroke="#1E2A44" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Suit collar + red tie */}
      <path d="M38 74 L50 80 L62 74" stroke="#1E2A44" strokeWidth="2.5" fill="none" />
      <path d="M47 77 L50 84 L53 77 L50 74 Z" fill="#DC2626" stroke="#1E2A44" strokeWidth="1.8" />
      {/* Floating coins */}
      <circle cx="23" cy="34" r="6" fill="#F5B301" stroke="#1E2A44" strokeWidth="1.8" />
      <text x="23" y="37.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1E2A44">$</text>
      <circle cx="78" cy="30" r="4.5" fill="#F5B301" stroke="#1E2A44" strokeWidth="1.5" />
      <text x="78" y="33" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#1E2A44">$</text>
    </svg>
  );
}
