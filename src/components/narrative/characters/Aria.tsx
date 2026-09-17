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
      <circle cx="50" cy="50" r="48" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
      {/* Antenna */}
      <line x1="50" y1="16" x2="50" y2="26" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="13" r="5" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
      {/* Head - rounded friendly robot */}
      <rect x="26" y="26" width="48" height="44" rx="20" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
      {/* Ears */}
      <rect x="19" y="42" width="8" height="14" rx="4" fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
      <rect x="73" y="42" width="8" height="14" rx="4" fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
      {/* Eyes - big and friendly */}
      <circle cx="40" cy="46" r="7" fill="#1E2A44" />
      <circle cx="60" cy="46" r="7" fill="#1E2A44" />
      <circle cx="42" cy="44" r="2.4" fill="#FFFFFF" />
      <circle cx="62" cy="44" r="2.4" fill="#FFFFFF" />
      {/* Blush */}
      <ellipse cx="33" cy="56" rx="4" ry="2.5" fill="#93C5FD" opacity="0.7" />
      <ellipse cx="67" cy="56" rx="4" ry="2.5" fill="#93C5FD" opacity="0.7" />
      {/* Smile */}
      <path d="M42 58 Q50 64 58 58" stroke="#1E2A44" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Chest light */}
      <circle cx="50" cy="80" r="6" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
      <circle cx="50" cy="80" r="2.5" fill="#FFFFFF" />
      {/* Sparkles */}
      <path d="M22 30 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5Z" fill="#60A5FA" opacity="0.8" />
      <path d="M78 28 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1Z" fill="#60A5FA" opacity="0.6" />
    </svg>
  );
}
