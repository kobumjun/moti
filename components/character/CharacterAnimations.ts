/**
 * CharacterAnimations - 자연스러운 이동 및 포즈 정의
 * px 기반 고정 위치, 수평 이동만 허용
 */

export type MascotState =
  | "hidden"
  | "entering"
  | "idle"
  | "peeking"
  | "pointing"
  | "speaking"
  | "moving"
  | "exiting"
  | "shrug"
  | "lookAround";

// 화면 하단을 기준으로 한 고정 위치 (left px)
// 사이드바(~256px) + 패딩 고려, 메인 콘텐츠 영역 내
export const ZONES = {
  left: 280,
  center: 480,
  right: 680,
} as const;

export type Zone = keyof typeof ZONES;

// 입장/퇴장 시 화면 밖 오프셋
export const OFFSCREEN_LEFT = -120;
export const OFFSCREEN_RIGHT = 900;

// 자연스러운 이동 속도 (ms per 100px)
export const WALK_SPEED = 120;
export const ENTER_EXIT_DURATION = 1400;
