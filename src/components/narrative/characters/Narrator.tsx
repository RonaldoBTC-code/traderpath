"use client";

export default function Narrator({ size = 48 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#A0B0C0" strokeWidth="1.5" />
      {/* Book */}
      <rect x="28" y="35" width="44" height="35" rx="3" fill="#0D1B2A" stroke="#A0B0C0" strokeWidth="1.5" />
      {/* Book spine */}
      <line x1="50" y1="35" x2="50" y2="70" stroke="#A0B0C0" strokeWidth="1" opacity="0.5" />
      {/* Pages - left */}
      <line x1="33" y1="42" x2="47" y2="42" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="33" y1="47" x2="47" y2="47" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="33" y1="52" x2="47" y2="52" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="33" y1="57" x2="45" y2="57" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      {/* Pages - right */}
      <line x1="53" y1="42" x2="67" y2="42" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="53" y1="47" x2="67" y2="47" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="53" y1="52" x2="67" y2="52" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      <line x1="53" y1="57" x2="65" y2="57" stroke="#A0B0C0" strokeWidth="0.8" opacity="0.4" />
      {/* Glow from book */}
      <ellipse cx="50" cy="32" rx="12" ry="5" fill="#A0B0C0" opacity="0.1" />
      {/* Sparkle particles */}
      <circle cx="38" cy="28" r="1.5" fill="#A0B0C0" opacity="0.4" />
      <circle cx="62" cy="26" r="1" fill="#A0B0C0" opacity="0.3" />
      <circle cx="50" cy="22" r="1.2" fill="#A0B0C0" opacity="0.5" />
      <circle cx="44" cy="80" r="1" fill="#A0B0C0" opacity="0.3" />
      <circle cx="58" cy="78" r="0.8" fill="#A0B0C0" opacity="0.2" />
    </svg>
  );
}
