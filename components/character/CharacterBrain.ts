/**
 * CharacterBrain - 행동 컨트롤러
 * 지속적 움직임, 자주 전환
 */

import { ZONES, type Zone } from "./CharacterAnimations";
import type { SpeechContext } from "./CharacterSpeech";

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

export interface BehaviorAction {
  state: MascotState;
  speechContext?: SpeechContext;
  targetZone?: Zone;
  duration: number;
}

// 포즈 행동 (이동 없음)
const POSE_BEHAVIORS: Omit<BehaviorAction, "targetZone">[] = [
  { state: "shrug", speechContext: "thinking", duration: 2000 },
  { state: "armsCrossed", speechContext: "arms_crossed", duration: 2200 },
  { state: "letsGo", speechContext: "lets_go", duration: 1800 },
  { state: "thinking", speechContext: "thinking", duration: 1600 },
  { state: "lookAround", duration: 2000 },
  { state: "peeking", speechContext: "peek", duration: 1500 },
];

// 랜덤 간격: 8~15초 (자주 전환)
const INTERVAL_MIN = 8000;
const INTERVAL_MAX = 15000;

export function getNextPoseBehavior(): Omit<BehaviorAction, "targetZone"> {
  return { ...POSE_BEHAVIORS[Math.floor(Math.random() * POSE_BEHAVIORS.length)]! };
}

export function getRandomInterval(): number {
  return INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN);
}

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
        targetZone: "center",
        duration: 1600,
      };
    case "page_create":
      return { state: "pointing", speechContext: "lets_go", duration: 1400 };
    case "page_delete":
      return { state: "shrug", speechContext: "thinking", duration: 1600 };
    case "save_click":
      return { state: "pointing", speechContext: "save_click", duration: 1200 };
    case "button_hover":
      return { state: "pointing", speechContext: "button_hover", duration: 1800 };
    case "idle":
      return { state: "peeking", speechContext: "idle", duration: 2200 };
    case "scroll":
      return { state: "lookAround", speechContext: "scroll", duration: 1500 };
    default:
      return { state: "idle", duration: 1500 };
  }
}
