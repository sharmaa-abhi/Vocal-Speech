"use client";

export default function CalloutLines({ variant = "default" }: { variant?: "default" | "reverse" }) {
  return (
    <svg className={`laser-callout laser-callout--${variant}`} viewBox="0 0 760 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`laser-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#00FF88" />
        </linearGradient>
      </defs>
      <path className="laser-line laser-line--slow" d="M 20 90 L 170 90 L 205 130 L 350 130 L 395 190 L 545 190 L 610 245 L 735 245" stroke={`url(#laser-${variant})`} />
      <path className="laser-line laser-line--fast" d="M 30 335 L 125 335 L 185 285 L 300 285 L 350 250 L 465 250 L 525 170 L 680 170" stroke="#00FF88" />
      <circle className="laser-node" cx="735" cy="245" r="4" />
      <circle className="laser-node laser-node--alt" cx="680" cy="170" r="3" />
    </svg>
  );
}
