"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
  type MascotState,
} from "./CharacterEngine";

const CHAR_WIDTH = 120;
const CHAR_HEIGHT = 160;
const CHAR_ANCHOR = { x: 0.5, y: 1 }; // center-bottom

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    state: "hidden",
    x: -160,
    y: 480,
    facing: "right",
    speech: null,
    visible: false,
    showFlame: false,
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
      <motion.div
        className="absolute flex flex-col items-center"
        style={{
          left: state.x,
          top: state.y,
          width: CHAR_WIDTH,
          height: CHAR_HEIGHT,
          transform: `translate(-50%, -100%)`,
        }}
        animate={{ left: state.x, top: state.y }}
        transition={{
          type: "tween",
          ease: [0.25, 0.5, 0.35, 1],
          duration:
            state.state === "entering" ? 1.3
            : state.state === "engineLift" || state.state === "jumpingDown"
              ? 0.8
              : state.state === "walking"
                ? 0.9
                : 0.35,
        }}
      >
        <AnimatePresence>
          {state.speech && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
            >
              <div
                className={`min-w-[130px] max-w-[200px] px-3.5 py-2.5 rounded-xl rounded-b-md bg-[#0c0c10] border-2 border-[#2d2d3a] shadow-xl ${
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
          className="relative w-full h-full"
          style={{
            transform: state.facing === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <RocketMascot state={state.state} showFlame={state.showFlame} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function RocketMascot({ state, showFlame }: { state: MascotState; showFlame: boolean }) {
  const isPointing = state === "pointing";
  const isShrug = state === "shrug";
  const isArmsCrossed = state === "armsCrossed";
  const isLetsGo = state === "letsGo";
  const isPeek = state === "peekBottom" || state === "peekSide";
  const isLift = state === "engineLift";

  return (
    <svg viewBox="0 0 80 120" fill="none" className="w-full h-full drop-shadow-2xl">
      {/* Rocket body - tapered */}
      <motion.path
        d="M 40 20 L 52 100 L 40 115 L 28 100 Z"
        fill="#6366f1"
        stroke="#818cf8"
        strokeWidth="1.5"
        animate={
          state === "idle" || state === "lookAround"
            ? { scaleY: [1, 1.02, 1] }
            : {}
        }
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{ transformOrigin: "40px 65px" }}
      />
      {/* Nose cone */}
      <ellipse cx="40" cy="18" rx="12" ry="8" fill="#818cf8" />
      {/* Window / face area */}
      <motion.ellipse
        cx="40"
        cy="38"
        rx="10"
        ry="12"
        fill="#1e293b"
        animate={
          state === "lookAround" ? { x: [0, 1.5, -1.5, 0] } : {}
        }
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      {/* Eyes */}
      <ellipse cx="36" cy="36" rx="2.5" ry="3" fill="white" />
      <ellipse cx="44" cy="36" rx="2.5" ry="3" fill="white" />
      <circle cx="36.5" cy="36" r="1" fill="#0f172a" />
      <circle cx="44.5" cy="36" r="1" fill="#0f172a" />
      {/* Mouth */}
      <path
        d="M 34 44 Q 40 48 46 44"
        stroke="#64748b"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Flame / thrust - UP motion only */}
      <AnimatePresence>
        {showFlame && (
          <motion.g
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            style={{ transformOrigin: "40px 105px" }}
          >
            <path
              d="M 36 100 Q 40 130 44 100"
              fill="#f59e0b"
              opacity={0.9}
            />
            <path
              d="M 38 102 Q 40 125 42 102"
              fill="#fbbf24"
              opacity={0.95}
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Arms */}
      {isPointing ? (
        <g>
          <path
            d="M 28 55 L 16 40"
            stroke="#6366f1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 52 55 L 64 55"
            stroke="#6366f1"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : isShrug ? (
        <g>
          <path
            d="M 26 52 Q 34 44 40 52"
            stroke="#6366f1"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 54 52 Q 46 44 40 52"
            stroke="#6366f1"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : isArmsCrossed ? (
        <g>
          <path d="M 22 54 L 34 48 L 42 54" stroke="#6366f1" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 58 54 L 46 48 L 38 54" stroke="#6366f1" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      ) : isLetsGo ? (
        <g>
          <path d="M 26 54 L 22 68" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
          <path d="M 54 54 L 62 42" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M 28 56 L 24 72" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
          <path d="M 52 56 L 56 72" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* Legs */}
      <path
        d="M 34 98 L 34 112 M 46 98 L 46 112"
        stroke="#4338ca"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
