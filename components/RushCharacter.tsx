"use client";

import { motion, AnimatePresence } from "framer-motion";

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

// Character scale: ~2x (64→128, 80→160) for noticeable presence
const CHAR_WIDTH = 128;
const CHAR_HEIGHT = 160;

export default function RushCharacter({
  message,
  state,
  onAskAI,
  isLoadingAI = false,
}: RushCharacterProps) {
  return (
    <div className="fixed bottom-6 right-6 flex items-end gap-3 z-50">
      {/* Speech bubble - fade-in, subtle scale on appear */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 380,
                damping: 26,
              },
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="max-w-[260px] px-4 py-3 rounded-2xl rounded-br-md bg-moti-surface border border-moti-border shadow-xl"
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

      {/* Character container - bounce when message appears */}
      <motion.div
        className="relative flex-shrink-0"
        initial={false}
        animate={
          state === "jump"
            ? {
                y: [0, -40, 0],
                scale: [1, 1.05, 1],
                transition: { duration: 0.5, ease: "easeOut" },
              }
            : state === "excited"
              ? {
                  scale: [1, 1.12, 1],
                  rotate: [0, -6, 6, 0],
                  transition: { duration: 0.4 },
                }
              : state === "walk"
                ? { x: [0, 10, -10, 0], transition: { duration: 1.5 } }
                : state === "armsCrossed"
                  ? {
                      scale: [1, 1.06, 1],
                      transition: { duration: 0.3 },
                    }
                  : state === "talk"
                    ? {
                        scale: [1, 1.05, 1],
                        y: [0, -4, 0],
                        transition: { duration: 0.25, repeat: 2 },
                      }
                    : // idle: subtle floating + breathing
                      {
                        y: [0, -4, 0],
                        transition: {
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }
        }
        style={{ width: CHAR_WIDTH, height: CHAR_HEIGHT }}
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
      width="100%"
      height="100%"
      viewBox="0 0 64 80"
      fill="none"
      className="drop-shadow-xl"
    >
      {/* Body - idle breathing (scaleY) */}
      <motion.ellipse
        cx="32"
        cy="52"
        rx="16"
        ry="14"
        fill="#6366f1"
        animate={
          state === "idle"
            ? {
                scaleY: [1, 1.03, 1],
                scaleX: [1, 0.99, 1],
                transition: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {}
        }
        style={{ transformOrigin: "32px 52px" }}
      />

      {/* Head - idle subtle bob */}
      <motion.circle
        cx="32"
        cy="28"
        r="14"
        fill="#818cf8"
        animate={
          state === "idle"
            ? {
                y: [0, -1.5, 0],
                scale: [1, 1.02, 1],
                transition: {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {}
        }
        style={{ transformOrigin: "32px 28px" }}
      />

      {/* Eyes */}
      <ellipse cx="27" cy="26" rx="2.5" ry="3" fill="#0a0a0f" />
      <ellipse cx="37" cy="26" rx="2.5" ry="3" fill="#0a0a0f" />

      {/* Mouth */}
      <path
        d="M 26 34 Q 32 38 38 34"
        stroke="#0a0a0f"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms */}
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
          <path
            d="M 16 46 L 12 58"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 48 46 L 52 58"
            stroke="#4f46e5"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Legs */}
      <path
        d="M 24 64 L 24 74 M 40 64 L 40 74"
        stroke="#4f46e5"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
