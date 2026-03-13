"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
  type MascotState,
} from "./CharacterEngine";

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 100;
const BOTTOM_OFFSET = 24;

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    state: "hidden",
    x: -120,
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
      {/* Character container - anchored bottom-left, moves horizontally */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{
          bottom: BOTTOM_OFFSET,
          left: state.x,
          width: CHAR_WIDTH,
          transform: `translateX(${state.facing === "left" ? "-50%" : "-50%"})`,
        }}
        animate={{
          left: state.x,
        }}
        transition={{
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: state.state === "entering" ? 1.2 : state.state === "moving" ? 1 : 0.4,
        }}
      >
        {/* Speech bubble - attached above character head */}
        <AnimatePresence>
          {state.speech && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[120px] max-w-[200px] px-3 py-2.5 rounded-xl rounded-bl-sm bg-[#1a1a24] border border-[#2a2a3a] shadow-lg"
              style={{
                // Tail points down toward character
                marginBottom: 4,
              }}
            >
              <p className="text-xs text-[#e4e4e7] leading-relaxed text-center">
                {state.speech}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character sprite */}
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
  const isPeeking = state === "peeking";

  return (
    <svg
      viewBox="0 0 72 100"
      fill="none"
      className="drop-shadow-lg w-full h-full"
    >
      {/* Agile helper - human-like, comic style */}
      {/* Cape - subtle silhouette */}
      <motion.ellipse
        cx="36"
        cy="52"
        rx="12"
        ry="16"
        fill="#3B4252"
        opacity={0.4}
        animate={
          state === "idle" || state === "lookAround"
            ? { scaleY: [1, 1.02, 1], transition: { duration: 2.5, repeat: Infinity } }
            : {}
        }
        style={{ transformOrigin: "36px 52px" }}
      />

      {/* Torso */}
      <motion.rect
        x="24"
        y="38"
        width="24"
        height="28"
        rx="8"
        fill="#4F46E5"
        animate={
          state === "idle" || state === "lookAround"
            ? { scaleY: [1, 1.03, 1], transition: { duration: 2.2, repeat: Infinity } }
            : state === "moving"
              ? { y: [38, 36, 38], transition: { duration: 0.3, repeat: Infinity } }
              : {}
        }
        style={{ transformOrigin: "36px 52px" }}
      />

      {/* Collar */}
      <path
        d="M 28 38 L 36 42 L 44 38"
        stroke="#6366F1"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Head */}
      <motion.ellipse
        cx="36"
        cy="24"
        rx="14"
        ry="16"
        fill="#FCD34D"
        animate={
          state === "idle"
            ? { y: [0, -1, 0], transition: { duration: 2, repeat: Infinity } }
            : state === "lookAround"
              ? { x: [0, 2, -2, 0], transition: { duration: 2.5, repeat: Infinity } }
              : state === "peeking"
                ? { y: [0, -4], transition: { duration: 0.3 } }
                : {}
        }
        style={{ transformOrigin: "36px 24px" }}
      />

      {/* Eyes - friendly helper look */}
      <motion.g
        animate={
          state === "lookAround"
            ? { x: [0, 1.5, -1.5, 0], transition: { duration: 2.5, repeat: Infinity } }
            : {}
        }
      >
        <ellipse cx="30" cy="22" rx="3" ry="3.5" fill="#1E293B" />
        <ellipse cx="42" cy="22" rx="3" ry="3.5" fill="#1E293B" />
        <circle cx="31" cy="21" r="1" fill="white" opacity={0.8} />
        <circle cx="43" cy="21" r="1" fill="white" opacity={0.8} />
      </motion.g>

      {/* Smile */}
      <path
        d="M 28 28 Q 36 33 44 28"
        stroke="#78350F"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms */}
      {isPointing ? (
        <g>
          <path
            d="M 20 44 L 12 32"
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 52 44 L 62 44"
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : isShrug ? (
        <g>
          <path
            d="M 20 42 Q 28 36 36 42"
            stroke="#6366F1"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 52 42 Q 44 36 36 42"
            stroke="#6366F1"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          <path
            d="M 20 44 L 16 58"
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 52 44 L 56 58"
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Legs */}
      <path
        d="M 28 64 L 28 78 M 44 64 L 44 78"
        stroke="#4338CA"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
