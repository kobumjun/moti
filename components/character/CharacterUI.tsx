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
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="hero-body-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="hero-cape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id="hero-mask" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="hero-belt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Cape - behind body */}
      <path
        d="M 18 38 Q 8 55 12 90 L 28 88 L 26 50 Z M 54 38 Q 64 55 60 90 L 44 88 L 46 50 Z"
        fill="url(#hero-cape)"
        stroke="#4c1d95"
        strokeWidth="1.5"
      />

      {/* Body - slim superhero torso */}
      <path
        d="M 28 32 L 44 32 L 48 75 L 40 78 L 32 78 L 24 75 Z"
        fill="url(#hero-body)"
        stroke="#1e40af"
        strokeWidth="1.5"
      />
      <path
        d="M 30 35 L 42 35 L 45 72 L 36 75 L 27 72 Z"
        fill="url(#hero-body-shadow)"
      />

      {/* Belt */}
      <rect x="26" y="70" width="20" height="6" rx="2" fill="url(#hero-belt)" stroke="#d97706" strokeWidth="1" />
      <circle cx="36" cy="73" r="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" />

      {/* Head - with mask */}
      <ellipse cx="36" cy="22" rx="14" ry="16" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="1" />
      <path
        d="M 22 18 Q 36 12 50 18 L 50 26 Q 36 30 22 26 Z"
        fill="url(#hero-mask)"
        stroke="#0f172a"
        strokeWidth="1"
      />
      <ellipse cx="30" cy="22" rx="3" ry="3.5" fill="white" opacity="0.9" />
      <ellipse cx="42" cy="22" rx="3" ry="3.5" fill="white" opacity="0.9" />
      <circle cx="30.5" cy="22" r="1.2" fill="#0f172a" />
      <circle cx="42.5" cy="22" r="1.2" fill="#0f172a" />

      {/* Arms */}
      {isPoint ? (
        <g>
          <path d="M 24 48 L 10 32" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M 48 48 L 56 58" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : isShrug ? (
        <g>
          <path d="M 22 46 Q 28 38 36 46" stroke="#2563eb" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 50 46 Q 44 38 36 46" stroke="#2563eb" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ) : isPeek ? (
        <g>
          <path d="M 22 48 L 18 60" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M 50 48 L 52 62" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : isTalk ? (
        <g>
          <path d="M 24 48 L 20 62" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M 48 48 L 52 58" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : isWalk ? (
        <g>
          {frame === 0 && (
            <>
              <path d="M 24 50 L 18 66" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
              <path d="M 48 50 L 54 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 1 && (
            <>
              <path d="M 24 50 L 26 66" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
              <path d="M 48 50 L 50 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 2 && (
            <>
              <path d="M 24 50 L 30 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
              <path d="M 48 50 L 42 66" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 3 && (
            <>
              <path d="M 24 50 L 26 66" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
              <path d="M 48 50 L 50 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
        </g>
      ) : (
        <g>
          <path d="M 24 48 L 22 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M 48 48 L 50 64" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {/* Legs - walk cycle sprite */}
      {isWalk ? (
        <g>
          {frame === 0 && (
            <>
              <path d="M 30 82 L 26 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
              <path d="M 42 82 L 46 106" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 1 && (
            <>
              <path d="M 30 82 L 32 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
              <path d="M 42 82 L 42 106" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 2 && (
            <>
              <path d="M 30 82 L 34 106" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
              <path d="M 42 82 L 38 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {frame === 3 && (
            <>
              <path d="M 30 82 L 32 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
              <path d="M 42 82 L 42 106" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
        </g>
      ) : isPeek ? (
        <g>
          <path d="M 30 82 L 28 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
          <path d="M 42 82 L 44 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M 30 82 L 30 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
          <path d="M 42 82 L 42 108" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
