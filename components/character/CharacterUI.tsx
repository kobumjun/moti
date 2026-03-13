"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
  type MascotState,
} from "./CharacterEngine";

// 크게 - 화면에서 잘 보이도록
const CHAR_WIDTH = 140;
const CHAR_HEIGHT = 180;
const BOTTOM_OFFSET = 20;

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    state: "hidden",
    x: -140,
    facing: "right",
    speech: null,
    visible: false,
  });
  const engineRef = useState(() => new CharacterEngine())[0];

  useEffect(() => {
    const unsub = engineRef.subscribe(setState);
    engineRef.start();
    return () => {
      unsub();
      engineRef.stop();
    };
  }, [engineRef]);

  if (!state.visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-visible"
      aria-hidden
    >
      <motion.div
        className="absolute flex flex-col items-center"
        style={{
          bottom: BOTTOM_OFFSET,
          left: state.x,
          width: CHAR_WIDTH,
          transform: "translateX(-50%)",
        }}
        animate={{ left: state.x }}
        transition={{
          type: "tween",
          ease: [0.22, 0.61, 0.36, 1],
          duration: state.state === "entering" ? 1.4 : state.state === "walking" ? 1.1 : 0.35,
        }}
      >
        {/* Speech bubble - 머리 위, facing 방향으로 tail */}
        <AnimatePresence>
          {state.speech && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 3, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 origin-bottom"
              style={{ marginBottom: 8 }}
            >
              <div
                className={`min-w-[140px] max-w-[220px] px-4 py-3 rounded-2xl rounded-b-md bg-[#0f0f14] border-2 border-[#2d2d3a] shadow-xl ${
                  state.facing === "right" ? "rounded-bl-sm" : "rounded-br-sm"
                }`}
              >
                <p className="text-sm font-medium text-[#e4e4e7] leading-snug">
                  {state.speech}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative"
          style={{
            width: CHAR_WIDTH,
            height: CHAR_HEIGHT,
            transform: state.facing === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <MascotSprite state={state.state} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function MascotSprite({ state }: { state: MascotState }) {
  const isPointing = state === "pointing";
  const isShrug = state === "shrug";
  const isArmsCrossed = state === "armsCrossed";
  const isLetsGo = state === "letsGo";
  const isThinking = state === "thinking";
  const isPeeking = state === "peeking";
  const isWalking = state === "walking";

  return (
    <svg
      viewBox="0 0 80 110"
      fill="none"
      className="w-full h-full drop-shadow-2xl"
    >
      {/* Back / cape - athletic silhouette */}
      <motion.path
        d="M 20 45 Q 12 55 18 75 L 28 75 Q 22 55 30 45 Z"
        fill="#1e293b"
        opacity={0.7}
        animate={
          state === "idle" || state === "lookAround"
            ? { opacity: [0.6, 0.75, 0.6] }
            : {}
        }
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.path
        d="M 60 45 Q 68 55 62 75 L 52 75 Q 58 55 50 45 Z"
        fill="#1e293b"
        opacity={0.7}
        animate={
          state === "idle" || state === "lookAround"
            ? { opacity: [0.6, 0.75, 0.6] }
            : {}
        }
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Torso - sleek athletic */}
      <motion.rect
        x="28"
        y="42"
        width="24"
        height="32"
        rx="6"
        fill="#4f46e5"
        stroke="#6366f1"
        strokeWidth="1"
        animate={
          state === "idle" || state === "lookAround"
            ? { scaleY: [1, 1.02, 1] }
            : isWalking
              ? { y: [42, 40, 42] }
              : {}
        }
        transition={
          isWalking
            ? { duration: 0.35, repeat: Infinity }
            : { duration: 2.2, repeat: Infinity }
        }
        style={{ transformOrigin: "40px 58px" }}
      />

      {/* Collar / neck */}
      <path
        d="M 32 42 L 40 46 L 48 42"
        stroke="#6366f1"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Head */}
      <motion.ellipse
        cx="40"
        cy="26"
        rx="14"
        ry="16"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="0.5"
        animate={
          state === "idle"
            ? { y: [0, -1, 0] }
            : state === "lookAround"
              ? { x: [0, 2, -2, 0] }
              : isPeeking
                ? { y: [0, -5] }
                : {}
        }
        transition={{
          duration: state === "peeking" ? 0.25 : 2,
          repeat: state === "peeking" ? 0 : Infinity,
        }}
        style={{ transformOrigin: "40px 26px" }}
      />

      {/* Mask / eye band - distinctive, not Spider-Man */}
      <ellipse cx="40" cy="24" rx="10" ry="5" fill="#0f172a" />
      <ellipse cx="36" cy="23" rx="2" ry="2.5" fill="white" />
      <ellipse cx="44" cy="23" rx="2" ry="2.5" fill="white" />
      <circle cx="36.5" cy="23" r="0.8" fill="#0f172a" />
      <circle cx="44.5" cy="23" r="0.8" fill="#0f172a" />

      {/* Mouth - confident */}
      <path
        d="M 34 30 Q 40 34 46 30"
        stroke="#92400e"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms */}
      {isPointing ? (
        <g>
          <path
            d="M 22 50 L 8 35"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 58 50 L 72 50"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ) : isShrug ? (
        <g>
          <path
            d="M 22 48 Q 30 40 38 48"
            stroke="#6366f1"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 58 48 Q 50 40 42 48"
            stroke="#6366f1"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : isArmsCrossed ? (
        <g>
          <path
            d="M 18 52 L 32 46 L 42 52"
            stroke="#6366f1"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 62 52 L 48 46 L 38 52"
            stroke="#6366f1"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : isLetsGo ? (
        <g>
          <path
            d="M 22 48 L 18 60"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 58 48 L 68 38"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ) : isThinking ? (
        <g>
          <path
            d="M 22 48 L 26 58"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 58 48 L 56 60"
            stroke="#6366f1"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          <path d="M 22 50 L 18 66" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
          <path d="M 58 50 L 62 66" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {/* Legs */}
      <path
        d="M 32 72 L 32 88 M 48 72 L 48 88"
        stroke="#4338ca"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
