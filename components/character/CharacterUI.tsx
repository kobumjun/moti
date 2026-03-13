"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharacterEngine,
  type CharacterState,
  type MascotState,
} from "./CharacterEngine";

const CHAR_WIDTH = 100;
const CHAR_HEIGHT = 130;
const CHAR_ANCHOR = { x: 0.5, y: 1 };

export default function CharacterUI() {
  const [state, setState] = useState<CharacterState>({
    state: "entering",
    x: -120,
    y: 480,
    facing: "right",
    speech: null,
    visible: false,
    showFlame: false,
    moveDurationMs: 1300,
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

  const durationSec = (state.moveDurationMs ?? 1000) / 1000;

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
          duration: durationSec,
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
                className={`min-w-[130px] max-w-[200px] px-3.5 py-2.5 rounded-xl rounded-b-md bg-[#0a0a0e] border-2 border-[#252530] shadow-xl ${
                  state.facing === "right" ? "rounded-bl-sm" : "rounded-br-sm"
                }`}
              >
                <p className="text-sm font-medium text-[#e8e8ec] leading-snug">
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
  const isPointing = ["pointingUp", "pointingLeft", "pointingRight", "pointingAtButton", "lookHere"].includes(state);
  const isShrug = state === "shrug";
  const isArmsHips = state === "handsOnHips";
  const isKeepGoing = state === "keepGoing";
  const isProud = state === "proudPose";
  const isPeek = ["peekSneaky", "cornerPeek"].includes(state);
  const isLift = state === "engineLift";
  const isWalking = ["walkCycle", "stepCycle", "exitWalk", "entering"].includes(state);
  const isIdle = ["idleBreathing", "confidentIdle", "lookAround", "inspecting", "pauseWatch"].includes(state);
  const isReacting = ["reactingTyping", "reactingIdle", "reactingLogout", "reactingSave"].includes(state);
  const isArriving = state === "arrivingStop";
  const isNodding = state === "nodding";
  const isAnticipation = state === "anticipation";

  const breathing = isIdle && (state === "idleBreathing" || state === "lookAround");

  return (
    <svg viewBox="0 0 80 120" fill="none" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="rocket-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="rocket-cone" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="fin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>

      {/* Fins - clear rocket shape */}
      <path d="M 22 75 L 15 105 L 28 98 Z" fill="url(#fin-grad)" stroke="#0c4a6e" strokeWidth="1" />
      <path d="M 58 75 L 65 105 L 52 98 Z" fill="url(#fin-grad)" stroke="#0c4a6e" strokeWidth="1" />
      <path d="M 32 102 L 40 115 L 48 102 Z" fill="url(#fin-grad)" stroke="#0c4a6e" strokeWidth="1" />

      {/* Rocket body - cylindrical, not cone */}
      <rect x="26" y="30" width="28" height="72" rx="4" fill="url(#rocket-body)" stroke="#0369a1" strokeWidth="1.5" />

      {/* Nose cone - sleek */}
      <path d="M 40 8 L 52 30 L 40 32 L 28 30 Z" fill="url(#rocket-cone)" stroke="#0ea5e9" strokeWidth="1" />

      {/* Window / face area */}
      <motion.ellipse
        cx="40"
        cy="48"
        rx="10"
        ry="11"
        fill="#0f172a"
        stroke="#1e3a5f"
        strokeWidth="1"
        animate={
          breathing
            ? { scale: [1, 1.03, 1] }
            : state === "lookAround"
              ? { x: [0, 2, -2, 0] }
              : {}
        }
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
        style={{ transformOrigin: "40px 48px" }}
      />
      <ellipse cx="37" cy="46" rx="2" ry="2.5" fill="white" />
      <ellipse cx="43" cy="46" rx="2" ry="2.5" fill="white" />
      <circle cx="37.2" cy="46" r="0.8" fill="#0f172a" />
      <circle cx="43.2" cy="46" r="0.8" fill="#0f172a" />
      <motion.path
        d={isProud || isKeepGoing ? "M 35 52 Q 40 56 45 52" : isShrug ? "M 35 51 Q 40 50 45 51" : "M 35 51 Q 40 54 45 51"}
        stroke="#64748b"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Flame - UP motion only */}
      <AnimatePresence>
        {showFlame && (
          <motion.g
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            style={{ transformOrigin: "40px 102px" }}
          >
            <path d="M 34 100 Q 40 132 46 100" fill="#f59e0b" opacity={0.95} />
            <path d="M 36 102 Q 40 126 44 102" fill="#fbbf24" opacity={0.9} />
            <path d="M 38 104 Q 40 118 42 104" fill="#fde68a" opacity={0.85} />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Arms - many poses */}
      {isPointing ? (
        <g>
          <path d="M 26 58 L 14 42" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M 54 58 L 66 52" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : isShrug ? (
        <g>
          <path d="M 24 54 Q 32 46 40 54" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 56 54 Q 48 46 40 54" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      ) : isArmsHips ? (
        <g>
          <path d="M 22 56 L 26 68 L 32 64" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 58 56 L 54 68 L 48 64" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : isKeepGoing ? (
        <g>
          <path d="M 26 56 L 22 70" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M 54 56 L 64 44" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : isPeek ? (
        <g>
          <path d="M 24 56 L 18 64" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M 56 56 L 58 68" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : isWalking ? (
        <g>
          <motion.path
            d="M 26 58 L 22 74"
            stroke="#0284c7"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ["M 26 58 L 22 74", "M 26 58 L 26 72", "M 26 58 L 22 74"] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.path
            d="M 54 58 L 58 74"
            stroke="#0284c7"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ["M 54 58 L 58 74", "M 54 58 L 54 72", "M 54 58 L 58 74"] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
          />
        </g>
      ) : isArriving || isAnticipation ? (
        <g>
          <path d="M 26 56 L 24 70" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M 54 56 L 56 70" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M 26 56 L 24 72" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M 54 56 L 56 72" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* Legs - step cycle when walking */}
      {isWalking ? (
        <g>
          <motion.path
            d="M 32 98 L 30 114"
            stroke="#0369a1"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ["M 32 98 L 30 114", "M 32 98 L 34 112", "M 32 98 L 30 114"] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.path
            d="M 48 98 L 50 114"
            stroke="#0369a1"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ["M 48 98 L 50 114", "M 48 98 L 46 112", "M 48 98 L 50 114"] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
          />
        </g>
      ) : (
        <g>
          <path d="M 32 98 L 32 114" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <path d="M 48 98 L 48 114" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
