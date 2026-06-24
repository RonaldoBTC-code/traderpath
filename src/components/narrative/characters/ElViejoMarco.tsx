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
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#FFD700" strokeWidth="2" />
      {/* Face */}
      <ellipse cx="50" cy="55" rx="22" ry="25" fill="#2A3F55" />
      {/* Hat - fedora style */}
      <ellipse cx="50" cy="32" rx="28" ry="6" fill="#FFD700" opacity="0.9" />
      <path d="M30 32 C30 20, 70 20, 70 32" fill="#1A2B3C" stroke="#FFD700" strokeWidth="1.5" />
      <rect x="35" y="22" width="30" height="10" rx="5" fill="#2A3F55" stroke="#FFD700" strokeWidth="1" />
      {/* Eyes - wise, slightly narrow */}
      <ellipse cx="42" cy="52" rx="4" ry="3" fill="#0D1B2A" />
      <ellipse cx="58" cy="52" rx="4" ry="3" fill="#0D1B2A" />
      <circle cx="43" cy="51" r="1.5" fill="#FFD700" opacity="0.8" />
      <circle cx="59" cy="51" r="1.5" fill="#FFD700" opacity="0.8" />
      {/* Eyebrows - thick, experienced */}
      <path d="M37 47 Q42 44, 47 47" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M53 47 Q58 44, 63 47" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* Mustache */}
      <path d="M40 62 Q50 67, 60 62" stroke="#A0B0C0" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Beard hint */}
      <path d="M38 65 Q50 78, 62 65" stroke="#A0B0C0" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Scar or wrinkle */}
      <path d="M35 55 L33 60" stroke="#FFD700" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}
