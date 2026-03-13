/**
 * CharacterBrain - 풍부한 행동 풀
 * 전체 페이지 로밍, 수직 이동 로직
 */

import { ZONES, type Zone, type ZoneKey } from "./CharacterAnimations";
import type { SpeechContext } from "./CharacterSpeech";

export type MascotState =
  | "hidden"
  | "entering"
  | "roaming"
  | "idle"
  | "observing"
  | "speaking"
  | "peeking"
  | "pointing"
  | "engineLift"
  | "jumpingDown"
  | "landing"
  | "inspecting"
  | "reactingToText"
  | "reactingToSave"
  | "reactingToIdle"
  | "exiting"
  | "shrug"
  | "lookAround"
  | "armsCrossed"
  | "letsGo"
  | "thinking"
  | "hype"
  | "frustrated"
  | "cheering"
  | "peekSide"
  | "peekBottom"
  | "walking"
  | "running";

export interface BehaviorAction {
  state: MascotState;
  speechContext?: SpeechContext;
  targetZone?: ZoneKey;
  duration: number;
}

const ZONE_KEYS: ZoneKey[] = [
  "sidebarTop", "sidebarMid", "sidebarBottom",
  "pageList", "editorTop", "editorCenter", "saveArea",
  "topRight", "logoutArea", "bottomLeft", "bottomCenter", "bottomRight",
  "center",
];

// 같은 area 내 이동 = 수평만
// 다른 area = 수직 이동 필요 (engineLift up / jumpDown)
function getZoneArea(zone: ZoneKey): string {
  return ZONES[zone]?.area ?? "center";
}

export function getZone(zone: ZoneKey): { x: number; y: number } {
  const z = ZONES[zone];
  return z ? { x: z.x, y: z.y } : { x: 500, y: 300 };
}

export function getRandomZone(): ZoneKey {
  return ZONE_KEYS[Math.floor(Math.random() * ZONE_KEYS.length)] as ZoneKey;
}

export function getZoneForArea(area: "sidebar" | "editor" | "top" | "logout"): ZoneKey {
  const filtered = ZONE_KEYS.filter((k) => ZONES[k]?.area === area);
  if (!filtered.length) return "center";
  return filtered[Math.floor(Math.random() * filtered.length)] as ZoneKey;
}

export function needsLiftUp(fromY: number, toY: number): boolean {
  return toY < fromY - 30;
}

export function needsJumpDown(fromY: number, toY: number): boolean {
  return toY > fromY + 30;
}

// 풍부한 포즈 행동 (이동 없음)
const POSE_ACTIONS: Omit<BehaviorAction, "targetZone">[] = [
  { state: "shrug", speechContext: "thinking", duration: 1800 },
  { state: "armsCrossed", speechContext: "arms_crossed", duration: 2000 },
  { state: "letsGo", speechContext: "lets_go", duration: 1600 },
  { state: "lookAround", duration: 2200 },
  { state: "peekBottom", speechContext: "peek", duration: 1500 },
  { state: "peekSide", speechContext: "peek", duration: 1400 },
  { state: "hype", speechContext: "hype", duration: 1200 },
  { state: "thinking", speechContext: "thinking", duration: 1700 },
  { state: "cheering", speechContext: "cheering", duration: 1000 },
];

const INTERVAL_MIN = 5000;
const INTERVAL_MAX = 12000;

export function getRandomPose(): Omit<BehaviorAction, "targetZone"> {
  return { ...POSE_ACTIONS[Math.floor(Math.random() * POSE_ACTIONS.length)]! };
}

export function getRandomInterval(): number {
  return INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN);
}

export function getEventReaction(
  event: "page_load" | "page_create" | "page_delete" | "save_click" | "button_hover" | "idle" | "scroll" | "text_change"
): BehaviorAction & { targetZone?: ZoneKey } {
  switch (event) {
    case "page_load":
      return { state: "entering", speechContext: "page_load", targetZone: "center", duration: 1600 };
    case "page_create":
      return { state: "pointing", speechContext: "lets_go", duration: 1400 };
    case "page_delete":
      return { state: "shrug", speechContext: "thinking", duration: 1600 };
    case "save_click":
      return { state: "pointing", speechContext: "save_click", duration: 1200 };
    case "button_hover":
      return { state: "pointing", speechContext: "button_hover", duration: 1800 };
    case "idle":
      return { state: "peekBottom", speechContext: "near_logout", duration: 2500 };
    case "scroll":
      return { state: "lookAround", speechContext: "scroll", duration: 1500 };
    case "text_change":
      return { state: "reactingToText", duration: 2000 };
    default:
      return { state: "idle", duration: 1500 };
  }
}
