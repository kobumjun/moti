/**
 * CharacterAnimations - 이동 및 포즈 정의
 */

export type MascotState =
  | "hidden"
  | "entering"
  | "walking"
  | "idle"
  | "pointing"
  | "peeking"
  | "speaking"
  | "posing"
  | "exiting"
  | "shrug"
  | "lookAround"
  | "armsCrossed"
  | "letsGo"
  | "thinking";

// 화면 하단 고정 위치 (px)
export const ZONES = {
  left: 300,
  center: 500,
  right: 700,
} as const;

export type Zone = keyof typeof ZONES;

export const OFFSCREEN_LEFT = -140;
export const OFFSCREEN_RIGHT = 950;
export const WALK_SPEED = 100;
export const ENTER_EXIT_DURATION = 1600;
