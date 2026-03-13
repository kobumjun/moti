/**
 * CharacterAnimations - 캐릭터 애니메이션 정의
 * CSS / framer-motion 호환 설정
 */

export type AnimationType =
  | "idle"
  | "walk"
  | "jump"
  | "slide"
  | "peek"
  | "point"
  | "armsCrossed"
  | "fall"
  | "disappear"
  | "followMouse"
  | "bounce"
  | "wobble";

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  keyframes?: Record<string, object>;
  from?: { x?: number; y?: number; scale?: number; opacity?: number };
  to?: { x?: number; y?: number; scale?: number; opacity?: number };
}

// 이동 경로 (화면 내 위치)
export const POSITIONS = {
  topLeft: { x: 10, y: 10 },
  topRight: { x: 90, y: 10 },
  bottomLeft: { x: 10, y: 85 },
  bottomRight: { x: 90, y: 85 },
  center: { x: 50, y: 50 },
  midLeft: { x: 15, y: 50 },
  midRight: { x: 85, y: 50 },
} as const;

export const ANIMATION_DURATIONS: Record<AnimationType, number> = {
  idle: 2000,
  walk: 1500,
  jump: 600,
  slide: 1000,
  peek: 1200,
  point: 800,
  armsCrossed: 3000,
  fall: 800,
  disappear: 1500,
  followMouse: 500,
  bounce: 400,
  wobble: 600,
};
