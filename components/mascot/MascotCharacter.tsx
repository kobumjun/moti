"use client";

/**
 * MascotCharacter - Rigged comic-style superhero for real walk cycle
 * Transparent, no box. Groups: cape, torso, head, arms, legs.
 * Transform-origins at joints for natural motion.
 */

interface MascotCharacterProps {
  /** Leg angles in deg - left, right */
  leftLegRot: number;
  rightLegRot: number;
  /** Arm angles - counter-swing to legs */
  leftArmRot: number;
  rightArmRot: number;
  /** Torso vertical offset (step rhythm, 0–3px) */
  torsoY: number;
  /** Head tilt for stability */
  headRot: number;
  /** Chest scale for breathing (1–1.02) */
  breathScale: number;
  /** Cape subtle rotation */
  capeRot: number;
  facing: "left" | "right";
}

export default function MascotCharacter({
  leftLegRot,
  rightLegRot,
  leftArmRot,
  rightArmRot,
  torsoY,
  headRot,
  breathScale,
  capeRot,
  facing,
}: MascotCharacterProps) {
  const flip = facing === "left" ? -1 : 1;

  return (
    <svg
      viewBox="0 0 72 110"
      fill="none"
      className="w-full h-full"
      preserveAspectRatio="xMidYMax meet"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="cape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      <g transform={`scale(${flip}, 1) translate(${flip > 0 ? 0 : -72}, 0)`}>
        {/* Cape - behind body, subtle motion */}
        <g transform={`rotate(${capeRot * flip})`} style={{ transformOrigin: "36px 48px" }}>
          <path
            d="M 22 42 Q 14 58 18 78 L 26 76 L 26 54 Z M 50 42 Q 58 58 54 78 L 46 76 L 46 54 Z"
            fill="url(#cape-grad)"
            stroke="#5b21b6"
            strokeWidth="0.8"
          />
        </g>

        {/* Torso - vertical step rhythm + chest breathing */}
        <g
          transform={`translate(0, ${torsoY}) scale(1, ${breathScale})`}
          style={{ transformOrigin: "36px 70px" }}
        >
          <path
            d="M 28 32 Q 28 34 30 40 L 32 68 Q 34 76 36 78 Q 38 76 40 68 L 42 40 Q 44 34 44 32 Q 38 28 36 28 Q 34 28 28 32 Z"
            fill="url(#body-grad)"
            stroke="#2563eb"
            strokeWidth="1.2"
          />
          <rect x="26" y="70" width="20" height="6" rx="1" fill="#f59e0b" stroke="#d97706" strokeWidth="0.6" />
        </g>

        {/* Head - slight stabilization tilt */}
        <g transform={`rotate(${headRot * flip})`} style={{ transformOrigin: "36px 22px" }}>
          <ellipse cx="36" cy="22" rx="12" ry="14" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="0.8" />
          <path
            d="M 24 19 Q 36 13 48 19 L 48 25 Q 36 29 24 25 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="0.6"
          />
          <ellipse cx="30" cy="22" rx="2" ry="2.5" fill="white" />
          <ellipse cx="42" cy="22" rx="2" ry="2.5" fill="white" />
          <circle cx="30" cy="22" r="0.8" fill="#0f172a" />
          <circle cx="42" cy="22" r="0.8" fill="#0f172a" />
        </g>

        {/* Left arm */}
        <g transform={`rotate(${leftArmRot * flip})`} style={{ transformOrigin: "26px 54px" }}>
          <path
            d="M 24 46 L 20 62"
            stroke="#2563eb"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="19" cy="63" rx="5" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
        </g>

        {/* Right arm */}
        <g transform={`rotate(${rightArmRot * flip})`} style={{ transformOrigin: "46px 54px" }}>
          <path
            d="M 48 46 L 52 62"
            stroke="#2563eb"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="53" cy="63" rx="5" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
        </g>

        {/* Left leg */}
        <g transform={`rotate(${leftLegRot * flip})`} style={{ transformOrigin: "30px 78px" }}>
          <path
            d="M 30 78 L 28 100 L 32 100 L 34 78 Z"
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth="0.8"
          />
          <path
            d="M 27 98 L 26 108 L 33 108 L 33 98 Z"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="0.6"
          />
        </g>

        {/* Right leg */}
        <g transform={`rotate(${rightLegRot * flip})`} style={{ transformOrigin: "42px 78px" }}>
          <path
            d="M 42 78 L 40 100 L 44 100 L 46 78 Z"
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth="0.8"
          />
          <path
            d="M 39 98 L 39 108 L 46 108 L 45 98 Z"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="0.6"
          />
        </g>
      </g>
    </svg>
  );
}
