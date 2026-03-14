"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
  type MascotState,
} from "./CharacterEngine";

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 110;

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    state: "idle",
    x: 120,
    y: 600,
    facing: "right",
    speech: null,
    visible: false,
    walkFrame: 0,
  });
  const engineRef = useRef(new CharacterEngine());

  useEffect(() => {
    const unsub = engineRef.current.subscribe(setState);
    engineRef.current.start();
    return () => {
      unsub();
      engineRef.current.stop();
    };
  }, []);

  if (!state.visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-visible"
      aria-hidden
    >
      {/* Position updates every frame via engine - NO transition, NO teleport */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: state.x,
          top: state.y,
          width: CHAR_WIDTH,
          height: CHAR_HEIGHT,
          transform: `translate(-50%, -100%)`,
          willChange: state.state === "walk" ? "transform" : "auto",
        }}
      >
        {/* Comic-style speech bubble - always follows character, above */}
        <AnimatePresence>
          {state.speech && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1"
              style={{ minWidth: 140, maxWidth: 220 }}
            >
              <div
                className={`
                  relative px-4 py-2.5 rounded-xl
                  bg-white border-2 border-slate-800
                  shadow-[4px_4px_0_0_rgba(15,23,42,0.4)]
                  ${state.facing === "right" ? "rounded-bl-md" : "rounded-br-md"}
                `}
              >
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {state.speech}
                </p>
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-0 h-0"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "10px solid white",
                    filter: "drop-shadow(0 2px 0 rgb(30 41 59))",
                  }}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <div
          className="relative w-full h-full"
          style={{
            transform: state.facing === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <SuperheroMascot state={state.state} walkFrame={state.walkFrame} />
        </div>
      </div>
    </div>
  );
}

function SuperheroMascot({ state, walkFrame }: { state: MascotState; walkFrame: number }) {
  const isWalk = state === "walk";
  const isPoint = state === "point";
  const isShrug = state === "shrug";
  const isPeek = state === "peek";
  const isTalk = state === "talk";

  const frame = walkFrame % 4;

  return (
    <svg
      viewBox="0 0 72 110"
      fill="none"
      className="w-full h-full drop-shadow-xl"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="hero-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="hero-body-shade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.25" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="hero-cape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="hero-mask" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="hero-belt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="hero-glove" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="hero-boot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Short cape - behind body */}
      <path
        d="M 20 40 Q 12 58 16 78 L 24 76 L 24 52 Z M 52 40 Q 60 58 56 78 L 48 76 L 48 52 Z"
        fill="url(#hero-cape)"
        stroke="#5b21b6"
        strokeWidth="1"
      />

      {/* Torso - athletic with muscle curve */}
      <path
        d="M 26 30 Q 26 32 28 38 L 30 68 Q 32 76 36 78 Q 40 76 42 68 L 44 38 Q 46 32 46 30 Q 40 26 36 26 Q 32 26 26 30 Z"
        fill="url(#hero-body)"
        stroke="#2563eb"
        strokeWidth="1.5"
      />
      <path
        d="M 30 35 Q 34 50 36 70 L 36 74 Q 34 72 32 68 L 30 45 Z"
        fill="url(#hero-body-shade)"
      />

      {/* Belt */}
      <path d="M 26 72 L 46 72 L 46 76 L 26 76 Z" fill="url(#hero-belt)" stroke="#d97706" strokeWidth="1" />
      <circle cx="36" cy="74" r="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" />

      {/* Head + mask */}
      <ellipse cx="36" cy="20" rx="13" ry="15" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="1" />
      <path
        d="M 23 17 Q 36 11 49 17 L 49 24 Q 36 28 23 24 Z"
        fill="url(#hero-mask)"
        stroke="#0f172a"
        strokeWidth="1"
      />
      <ellipse cx="30" cy="20" rx="2.5" ry="3" fill="white" />
      <ellipse cx="42" cy="20" rx="2.5" ry="3" fill="white" />
      <circle cx="30.5" cy="20" r="1" fill="#0f172a" />
      <circle cx="42.5" cy="20" r="1" fill="#0f172a" />

      {/* Arms - proper shape with gloves */}
      {isPoint ? (
        <g>
          <path d="M 24 46 Q 18 40 12 34" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="11" cy="33" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 48 46 L 54 54" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="55" cy="55" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      ) : isShrug ? (
        <g>
          <path d="M 22 45 Q 28 38 36 45" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="20" cy="48" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 50 45 Q 44 38 36 45" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="52" cy="48" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      ) : isPeek ? (
        <g>
          <path d="M 22 46 L 18 58" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="17" cy="59" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 50 46 L 52 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="53" cy="61" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      ) : isTalk ? (
        <g>
          <path d="M 24 46 L 20 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="19" cy="61" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 48 46 L 52 58" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="53" cy="59" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      ) : isWalk ? (
        <g>
          {frame === 0 && (
            <>
              <path d="M 22 46 L 16 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="15" cy="63" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
              <path d="M 50 46 L 56 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="57" cy="61" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
            </>
          )}
          {frame === 1 && (
            <>
              <path d="M 22 46 L 24 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="23" cy="63" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
              <path d="M 50 46 L 50 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="51" cy="61" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
            </>
          )}
          {frame === 2 && (
            <>
              <path d="M 22 46 L 28 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="29" cy="61" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
              <path d="M 50 46 L 44 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="43" cy="63" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
            </>
          )}
          {frame === 3 && (
            <>
              <path d="M 22 46 L 24 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="23" cy="63" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
              <path d="M 50 46 L 50 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="51" cy="61" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
            </>
          )}
        </g>
      ) : (
        <g>
          <path d="M 24 46 L 22 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="21" cy="63" rx="5" ry="6" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 48 46 L 50 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <ellipse cx="51" cy="63" rx="4" ry="5" fill="url(#hero-glove)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {/* Legs - thighs + boots */}
      {isWalk ? (
        <g>
          {frame === 0 && (
            <>
              <path d="M 28 78 L 26 100 L 30 100 L 32 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 26 98 L 24 108 L 32 108 L 32 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
              <path d="M 44 78 L 44 100 L 48 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
            </>
          )}
          {frame === 1 && (
            <>
              <path d="M 30 78 L 30 100 L 34 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 28 98 L 28 108 L 36 108 L 36 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
              <path d="M 42 78 L 42 100 L 46 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
            </>
          )}
          {frame === 2 && (
            <>
              <path d="M 32 78 L 34 100 L 38 100 L 36 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 32 98 L 32 108 L 40 108 L 40 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
              <path d="M 40 78 L 38 100 L 42 100 L 42 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 36 98 L 36 108 L 44 108 L 42 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
            </>
          )}
          {frame === 3 && (
            <>
              <path d="M 30 78 L 30 100 L 34 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 28 98 L 28 108 L 36 108 L 36 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
              <path d="M 42 78 L 42 100 L 46 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
            </>
          )}
        </g>
      ) : isPeek ? (
        <g>
          <path d="M 28 78 L 26 100 L 30 100 L 32 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <path d="M 26 98 L 24 108 L 32 108 L 32 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 44 78 L 44 100 L 48 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
        </g>
      ) : (
        <g>
          <path d="M 28 78 L 28 100 L 32 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <path d="M 26 98 L 26 108 L 34 108 L 34 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 40 78 L 40 100 L 44 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <path d="M 38 98 L 38 108 L 46 108 L 46 98 Z" fill="url(#hero-boot)" stroke="#0f172a" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}
