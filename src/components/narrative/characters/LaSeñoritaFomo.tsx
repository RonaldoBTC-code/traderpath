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
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#FB923C" strokeWidth="2" />
      {/* Face */}
      <ellipse cx="50" cy="54" rx="22" ry="24" fill="#2A3F55" />
      {/* Hair - wild, energetic */}
      <path
        d="M28 45 Q30 20, 50 18 Q70 20, 72 45"
        fill="#0D1B2A"
        stroke="#FB923C"
        strokeWidth="1"
      />
      <path d="M30 35 Q28 25, 33 22" stroke="#FB923C" strokeWidth="1.5" opacity="0.6" />
      <path d="M70 35 Q72 25, 67 22" stroke="#FB923C" strokeWidth="1.5" opacity="0.6" />
      <path d="M40 20 Q42 14, 48 16" stroke="#FB923C" strokeWidth="1" opacity="0.5" />
      <path d="M55 18 Q58 13, 62 16" stroke="#FB923C" strokeWidth="1" opacity="0.5" />
      {/* Eyes - wide open, anxious */}
      <ellipse cx="42" cy="50" rx="6" ry="7" fill="#0D1B2A" stroke="#FB923C" strokeWidth="0.8" />
      <ellipse cx="58" cy="50" rx="6" ry="7" fill="#0D1B2A" stroke="#FB923C" strokeWidth="0.8" />
      {/* Pupils - dilated, looking up */}
      <circle cx="42" cy="48" r="3" fill="#FB923C" opacity="0.9" />
      <circle cx="58" cy="48" r="3" fill="#FB923C" opacity="0.9" />
      <circle cx="43" cy="47" r="1" fill="white" opacity="0.6" />
      <circle cx="59" cy="47" r="1" fill="white" opacity="0.6" />
      {/* Eyebrows - raised, worried */}
      <path d="M36 40 Q42 36, 48 40" stroke="#FB923C" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M52 40 Q58 36, 64 40" stroke="#FB923C" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* Mouth - open, gasping */}
      <ellipse cx="50" cy="65" rx="6" ry="4" fill="#0D1B2A" stroke="#FB923C" strokeWidth="0.8" />
      {/* Sweat drops */}
      <path d="M72 44 Q73 48, 72 50" stroke="#FB923C" strokeWidth="1" opacity="0.5" />
      <circle cx="72" cy="51" r="1.5" fill="#FB923C" opacity="0.4" />
      {/* Phone in hand hint */}
      <rect x="70" y="68" width="8" height="14" rx="2" fill="#0D1B2A" stroke="#FB923C" strokeWidth="0.8" opacity="0.5" />
      <rect x="71" y="70" width="6" height="8" rx="1" fill="#FB923C" opacity="0.2" />
    </svg>
  );
}
