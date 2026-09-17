"use client";

export default function DonPanico({ size = 48 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="48" fill="#EDE9FE" stroke="#6366F1" strokeWidth="3" />
      {/* Face - slightly pale */}
      <circle cx="50" cy="53" r="25" fill="#F5E3CB" stroke="#1E2A44" strokeWidth="2.5" />
      {/* Messy hair standing up */}
      <path d="M28 46 Q28 28 50 26 Q72 28 72 46 Q64 36 50 36 Q36 36 28 46Z" fill="#4B5563" stroke="#1E2A44" strokeWidth="2.5" />
      <path d="M34 30 L30 21" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44 27 L42 17" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M56 27 L58 17" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M66 30 L70 21" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
      {/* Huge worried eyes */}
      <circle cx="41" cy="52" r="8.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" />
      <circle cx="59" cy="52" r="8.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" />
      <circle cx="41" cy="53" r="2.6" fill="#1E2A44" />
      <circle cx="59" cy="53" r="2.6" fill="#1E2A44" />
      {/* Eyebrows - high and worried */}
      <path d="M33 40 Q41 36 47 40" stroke="#1E2A44" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M53 40 Q59 36 67 40" stroke="#1E2A44" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* Wavy anxious mouth */}
      <path d="M41 67 Q45 63 50 67 Q55 71 59 67" stroke="#1E2A44" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Sweat drops */}
      <path d="M71 42 Q74 46 71 49 Q68 46 71 42Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
      <path d="M28 44 Q31 48 28 51 Q25 48 28 44Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
      {/* Newspaper clutched below */}
      <rect x="34" y="76" width="32" height="14" rx="2.5" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.2" />
      <path d="M38 80 L54 80 M38 84 L50 84" stroke="#9CA3AF" strokeWidth="1.8" />
      <path d="M58 79 L62 87 M62 79 L58 87" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
