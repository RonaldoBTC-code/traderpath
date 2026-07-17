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
      <circle cx="50" cy="50" r="48" fill="#F1F8FF" stroke="#5D6E8C" strokeWidth="3" />
      {/* Open book */}
      <path d="M50 38 Q38 32 28 36 L28 66 Q38 62 50 68 Q62 62 72 66 L72 36 Q62 32 50 38Z" fill="#FFFFFF" stroke="#1E2A44" strokeWidth="2.5" />
      <path d="M50 38 L50 68" stroke="#1E2A44" strokeWidth="2" />
      {/* Page lines */}
      <path d="M34 42 L45 40 M34 48 L45 46 M34 54 L45 52 M34 60 L43 58" stroke="#93A6C4" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M55 40 L66 42 M55 46 L66 48 M55 52 L66 54 M57 58 L66 60" stroke="#93A6C4" strokeWidth="1.8" strokeLinecap="round" />
      {/* Magic sparkles rising from the book */}
      <path d="M42 26 l1.8 3.6 3.6 1.8 -3.6 1.8 -1.8 3.6 -1.8 -3.6 -3.6 -1.8 3.6 -1.8Z" fill="#E5960A" />
      <path d="M60 20 l1.4 2.8 2.8 1.4 -2.8 1.4 -1.4 2.8 -1.4 -2.8 -2.8 -1.4 2.8 -1.4Z" fill="#60A5FA" />
      <circle cx="52" cy="28" r="1.8" fill="#E5960A" opacity="0.7" />
      <circle cx="68" cy="30" r="1.4" fill="#60A5FA" opacity="0.7" />
      {/* Bookmark ribbon */}
      <path d="M63 66 L63 78 L60 74 L57 78 L57 65" fill="#DC2626" stroke="#1E2A44" strokeWidth="1.8" />
    </svg>
  );
}
