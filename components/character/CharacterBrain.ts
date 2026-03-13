/**
 * CharacterBrain - 상태 머신 및 행동 컨트롤러
 * 자연스러운 순차 행동만 허용, 텔레포트 금지
 */

import { ZONES, type Zone } from "./CharacterAnimations";
import type { SpeechContext } from "./CharacterSpeech";

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

export interface BehaviorAction {
  state: MascotState;
  speechContext?: SpeechContext;
  targetZone?: Zone;
  duration: number;
}

// 랜덤 행동: 같은 구역 내에서 가벼운 포즈만 (이동 없음)
const IDLE_BEHAVIORS: Omit<BehaviorAction, "targetZone">[] = [
  { state: "lookAround", duration: 2500 },
  { state: "shrug", speechContext: "idle", duration: 2000 },
  { state: "peeking", speechContext: "peek", duration: 1800 },
  { state: "idle", duration: 3000 },
];

// 주기적 랜덤 행동 (더 긴 간격)
const RANDOM_INTERVAL_MIN = 20000;
const RANDOM_INTERVAL_MAX = 40000;

export function getNextIdleBehavior(): Omit<BehaviorAction, "targetZone"> {
  const b = IDLE_BEHAVIORS[Math.floor(Math.random() * IDLE_BEHAVIORS.length)]!;
  return { ...b };
}

export function getRandomInterval(): number {
  return RANDOM_INTERVAL_MIN + Math.random() * (RANDOM_INTERVAL_MAX - RANDOM_INTERVAL_MIN);
}

// 인접 구역으로만 이동 (left -> center -> right)
export function getAdjacentZone(current: Zone): Zone {
  const order: Zone[] = ["left", "center", "right"];
  const i = order.indexOf(current);
  const next = Math.random() > 0.5 ? i + 1 : i - 1;
  const clamped = Math.max(0, Math.min(2, next));
  return order[clamped] as Zone;
}

export function getZonePx(zone: Zone): number {
  return ZONES[zone];
}

export function getEventReaction(
  event: "page_load" | "page_create" | "page_delete" | "save_click" | "button_hover" | "idle" | "scroll"
): BehaviorAction {
  switch (event) {
    case "page_load":
      return {
        state: "entering",
        speechContext: "page_load",
        targetZone: "right",
        duration: 1400,
      };
    case "page_create":
      return { state: "pointing", speechContext: "page_load", duration: 1200 };
    case "page_delete":
      return { state: "shrug", speechContext: "idle", duration: 1500 };
    case "save_click":
      return { state: "pointing", speechContext: "save_click", duration: 1000 };
    case "button_hover":
      return { state: "pointing", speechContext: "button_hover", duration: 1500 };
    case "idle":
      return { state: "peeking", speechContext: "idle", duration: 2000 };
    case "scroll":
      return { state: "lookAround", speechContext: "scroll", duration: 1500 };
    default:
      return { state: "idle", duration: 2000 };
  }
}
