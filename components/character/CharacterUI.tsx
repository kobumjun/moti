"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
} from "./CharacterEngine";

const CHAR_SIZE = 80;

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    x: 85,
    y: 85,
    animation: "idle",
    speech: null,
    visible: true,
    scale: 1,
  });
  const engineRef = useRef<CharacterEngine | null>(null);

  useEffect(() => {
    const engine = new CharacterEngine();
    engineRef.current = engine;
    const unsub = engine.subscribe(setState);
    engine.start();
    return () => {
      unsub();
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  if (!state.visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute w-[80px] h-[100px]"
        style={{ transformOrigin: "center bottom" }}
        animate={{
          left: `calc(${state.x}vw - ${CHAR_SIZE / 2}px)`,
          top: `calc(${state.y}vh - 50px)`,
          ...getAnimationVariant(state.animation),
        }}
        transition={{
          left: { type: "spring", damping: 25, stiffness: 200 },
          top: { type: "spring", damping: 25, stiffness: 200 },
          ...(state.animation === "idle" || state.animation === "walk" || state.animation === "slide"
            ? {}
            : { type: "spring", damping: 20, stiffness: 300 }),
        }}
      >
        <CharacterSprite animation={state.animation} />
      </motion.div>

      <AnimatePresence>
        {state.speech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute max-w-[200px] px-4 py-3 rounded-2xl rounded-br-md bg-[#1a1a24] border border-[#2a2a3a] shadow-xl"
            style={{
              left: `calc(${Math.max(10, state.x - 15)}vw)`,
              top: `calc(${Math.max(5, state.y - 25)}vh)`,
            }}
          >
            <p className="text-sm text-[#e4e4e7] leading-relaxed">
              {state.speech}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getAnimationVariant(animation: string) {
  switch (animation) {
    case "idle":
      return {
        y: [0, -4, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      };
    case "jump":
      return {
        y: [0, -50, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 },
      };
    case "bounce":
      return {
        scale: [1, 1.08, 1],
        transition: { duration: 0.4, repeat: 2 },
      };
    case "wobble":
      return {
        rotate: [0, -8, 8, 0],
        transition: { duration: 0.5, repeat: 2 },
      };
    case "peek":
      return {
        y: [30, 0],
        scale: [0.8, 1],
        transition: { duration: 0.4 },
      };
    case "fall":
      return {
        y: [-60, 0],
        rotate: [0, 15, -5, 0],
        transition: { duration: 0.5 },
      };
    case "disappear":
      return {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3 },
      };
    default:
      return {};
  }
}

function CharacterSprite({ animation }: { animation: string }) {
  const isArmsCrossed = animation === "armsCrossed";
  const isPointing = animation === "point";

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 64 80"
      fill="none"
      className="drop-shadow-xl"
    >
      {/* Body */}
      <motion.ellipse
        cx="32"
        cy="52"
        rx="18"
        ry="15"
        fill="#6366f1"
        animate={
          animation === "idle"
            ? { scaleY: [1, 1.04, 1], transition: { duration: 1.8, repeat: Infinity } }
            : {}
        }
        style={{ transformOrigin: "32px 52px" }}
      />

      {/* Head */}
      <motion.circle
        cx="32"
        cy="26"
        r="16"
        fill="#818cf8"
        animate={
          animation === "idle"
            ? { y: [0, -2, 0], transition: { duration: 2, repeat: Infinity } }
            : {}
        }
      />

      {/* Eyes */}
      <ellipse cx="26" cy="24" rx="3" ry="4" fill="#0a0a0f" />
      <ellipse cx="38" cy="24" rx="3" ry="4" fill="#0a0a0f" />

      {/* Mouth */}
      <path
        d="M 24 34 Q 32 40 38 34"
        stroke="#0a0a0f"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms */}
      {isArmsCrossed ? (
        <g>
          <path
            d="M 14 50 L 30 44 L 38 50"
            stroke="#4f46e5"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 50 50 L 34 44 L 26 50"
            stroke="#4f46e5"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : isPointing ? (
        <g>
          <path
            d="M 14 48 L 8 38"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 50 48 L 58 58"
            stroke="#4f46e5"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          <path
            d="M 14 48 L 10 62"
            stroke="#4f46e5"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 50 48 L 54 62"
            stroke="#4f46e5"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Legs */}
      <path
        d="M 22 64 L 22 76 M 42 64 L 42 76"
        stroke="#4f46e5"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
