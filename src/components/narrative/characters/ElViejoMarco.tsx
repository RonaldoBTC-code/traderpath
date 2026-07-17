"use client";

export default function ElViejoMarco({ size = 48 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="48" fill="#FEF3C7" stroke="#E5960A" strokeWidth="3" />
      {/* Face */}
      <circle cx="50" cy="52" r="25" fill="#FBD7B0" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Captain's cap */}
      <path d="M27 41 Q50 20 73 41 L73 45 Q50 37 27 45 Z" fill="#1E3A5F" stroke="#1E2A44" strokeWidth="2.5" />
      <rect x="25" y="42" width="50" height="8" rx="4" fill="#2B517F" stroke="#1E2A44" strokeWidth="2.5" />
      <circle cx="50" cy="33" r="4" fill="#E5960A" stroke="#1E2A44" strokeWidth="1.5" />
      {/* Eyes - kind, smiling closed */}
      <path d="M36 55 Q40 51 44 55" stroke="#1E2A44" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M56 55 Q60 51 64 55" stroke="#1E2A44" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Bushy white eyebrows */}
      <path d="M34 49 Q40 45 45 48" stroke="#F4F0E6" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M55 48 Q60 45 66 49" stroke="#F4F0E6" strokeWidth="4.5" strokeLinecap="round" />
      {/* Rosy cheeks */}
      <ellipse cx="32" cy="60" rx="4.5" ry="3" fill="#F5A97F" opacity="0.75" />
      <ellipse cx="68" cy="60" rx="4.5" ry="3" fill="#F5A97F" opacity="0.75" />
      {/* Nose */}
      <circle cx="50" cy="59" r="4.5" fill="#F5B98A" stroke="#1E2A44" strokeWidth="2" />
      {/* Big white beard */}
      <path d="M31 62 Q33 83 50 85 Q67 83 69 62 Q60 71 50 70 Q40 71 31 62Z" fill="#F4F0E6" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Mustache */}
      <path d="M39 64 Q50 71 61 64 Q56 61 50 62.5 Q44 61 39 64Z" fill="#F4F0E6" stroke="#1E2A44" strokeWidth="2" />
      {/* Little compass charm */}
      <circle cx="76" cy="76" r="7" fill="#FFFFFF" stroke="#E5960A" strokeWidth="2" />
      <path d="M76 72 L78 76 L76 80 L74 76 Z" fill="#E5960A" />
    </svg>
  );
}
