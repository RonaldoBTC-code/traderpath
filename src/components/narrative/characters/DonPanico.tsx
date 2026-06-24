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
      <circle cx="50" cy="50" r="48" fill="#1A2B3C" stroke="#A855F7" strokeWidth="2" />
      {/* Face - pale, gaunt */}
      <ellipse cx="50" cy="55" rx="20" ry="24" fill="#2A3F55" />
      {/* Messy hair */}
      <path
        d="M30 42 Q33 18, 50 16 Q67 18, 70 42"
        fill="#0D1B2A"
      />
      <path d="M33 30 L28 22" stroke="#A855F7" strokeWidth="1.5" opacity="0.5" />
      <path d="M67 30 L72 22" stroke="#A855F7" strokeWidth="1.5" opacity="0.5" />
      <path d="M45 18 L43 12" stroke="#A855F7" strokeWidth="1" opacity="0.4" />
      <path d="M55 17 L58 11" stroke="#A855F7" strokeWidth="1" opacity="0.4" />
      <path d="M50 16 L50 10" stroke="#A855F7" strokeWidth="1" opacity="0.4" />
      {/* Eyes - wide with terror */}
      <circle cx="42" cy="50" r="8" fill="#0D1B2A" stroke="#A855F7" strokeWidth="1" />
      <circle cx="58" cy="50" r="8" fill="#0D1B2A" stroke="#A855F7" strokeWidth="1" />
      {/* Tiny pupils - fear */}
      <circle cx="42" cy="50" r="2" fill="#A855F7" />
      <circle cx="58" cy="50" r="2" fill="#A855F7" />
      {/* Reflection */}
      <circle cx="44" cy="48" r="1" fill="white" opacity="0.4" />
      <circle cx="60" cy="48" r="1" fill="white" opacity="0.4" />
      {/* Eyebrows - terrified, high */}
      <path d="M34 38 Q42 33, 48 38" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M52 38 Q58 33, 66 38" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.7" />
      {/* Mouth - screaming */}
      <ellipse cx="50" cy="68" rx="8" ry="6" fill="#0D1B2A" stroke="#A855F7" strokeWidth="1" />
      {/* Trembling lines */}
      <path d="M22 55 L18 55" stroke="#A855F7" strokeWidth="1" opacity="0.4" />
      <path d="M22 58 L17 58" stroke="#A855F7" strokeWidth="0.8" opacity="0.3" />
      <path d="M78 55 L82 55" stroke="#A855F7" strokeWidth="1" opacity="0.4" />
      <path d="M78 58 L83 58" stroke="#A855F7" strokeWidth="0.8" opacity="0.3" />
      {/* Down arrow - market crash symbol */}
      <path d="M80 70 L80 82 L76 78 M80 82 L84 78" stroke="#A855F7" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}
