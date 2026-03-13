"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RushAction } from "@/lib/rush-responses";

type CharacterState =
  | "idle"
  | "walk"
  | "jump"
  | "armsCrossed"
  | "excited"
  | "talk";

interface RushCharacterProps {
  message: string | null;
  state: CharacterState;
  onAskAI?: () => void;
  isLoadingAI?: boolean;
}

export default function RushCharacter({
  message,
  state,
  onAskAI,
  isLoadingAI = false,
}: RushCharacterProps) {
  return (
    <div className="fixed bottom-6 right-6 flex items-end gap-2 z-50">
      {/* 말풍선 */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="max-w-[220px] px-4 py-3 rounded-2xl rounded-br-md bg-moti-surface border border-moti-border shadow-xl"
          >
            <p className="text-sm text-moti-text leading-relaxed">{message}</p>
            {onAskAI && (
              <button
                onClick={onAskAI}
                disabled={isLoadingAI}
                className="mt-2 text-xs text-moti-accent hover:underline disabled:opacity-50"
              >
                {isLoadingAI ? "생각 중..." : "RUSH에게 한마디 더 듣기"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 캐릭터 */}
      <motion.div
        className="relative"
        animate={
          state === "jump"
            ? { y: [0, -25, 0], transition: { duration: 0.5 } }
            : state === "excited"
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.4 },
                }
              : state === "walk"
                ? { x: [0, 8, -8, 0], transition: { duration: 1.5, repeat: 0 } }
                : state === "armsCrossed"
                  ? {}
                  : state === "talk"
                    ? {
                        y: [0, -3, 0],
                        transition: { duration: 0.3, repeat: 2 },
                      }
                    : {
                        y: [0, -2, 0],
                        transition: { duration: 2, repeat: Infinity },
                      }
        }
      >
        <CharacterSVG state={state} />
      </motion.div>
    </div>
  );
}

function CharacterSVG({ state }: { state: CharacterState }) {
  const isArmsCrossed = state === "armsCrossed";

  return (
    <svg
      width="64"
      height="80"
      viewBox="0 0 64 80"
      fill="none"
      className="drop-shadow-lg"
    >
      {/* 몸통 */}
      <motion.ellipse
        cx="32"
        cy="52"
        rx="16"
        ry="14"
        fill="#6366f1"
        animate={
          state === "idle"
            ? { scaleY: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } }
            : {}
        }
      />

      {/* 머리 */}
      <motion.circle
        cx="32"
        cy="28"
        r="14"
        fill="#818cf8"
        animate={
          state === "idle"
            ? { y: [0, -1, 0], transition: { duration: 2, repeat: Infinity } }
            : {}
        }
      />

      {/* 눈 */}
      <ellipse cx="27" cy="26" rx="2.5" ry="3" fill="#0a0a0f" />
      <ellipse cx="37" cy="26" rx="2.5" ry="3" fill="#0a0a0f" />

      {/* 입 - 웃는 모양 */}
      <motion.path
        d="M 26 34 Q 32 38 38 34"
        stroke="#0a0a0f"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        animate={
          state === "excited" || state === "talk"
            ? { d: ["M 26 34 Q 32 38 38 34", "M 26 35 Q 32 40 38 35"] }
            : {}
        }
      />

      {/* 팔 */}
      {isArmsCrossed ? (
        <g>
          <path
            d="M 16 48 L 28 44 L 36 48"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 48 48 L 36 44 L 28 48"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          <motion.path
            d="M 16 46 L 12 58"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <motion.path
            d="M 48 46 L 52 58"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* 다리 */}
      <path
        d="M 24 64 L 24 74 M 40 64 L 40 74"
        stroke="#4f46e5"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
