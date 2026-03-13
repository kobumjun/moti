/**
 * CharacterBrain - 행동 선택 및 랜덤 동작 로직
 * idle 애니메이션, 랜덤 행동, 이벤트 반응, 이동 패턴
 */

import type { AnimationType } from "./CharacterAnimations";
import type { SpeechContext } from "./CharacterSpeech";

export type BehaviorType =
  | "walk"
  | "peek"
  | "point"
  | "armsCrossed"
  | "jump"
  | "slide"
  | "fall"
  | "disappear"
  | "followMouse"
  | "idle"
  | "idleBounce"
  | "idleWobble";

export interface Behavior {
  type: BehaviorType;
  animation: AnimationType;
  speechContext: SpeechContext;
  duration: number;
  targetX?: number;
  targetY?: number;
}

const RANDOM_BEHAVIORS: Omit<Behavior, "targetX" | "targetY">[] = [
  { type: "walk", animation: "walk", speechContext: "random_walk", duration: 1500 },
  { type: "peek", animation: "peek", speechContext: "peek", duration: 1200 },
  { type: "point", animation: "point", speechContext: "point", duration: 800 },
  { type: "armsCrossed", animation: "armsCrossed", speechContext: "arms_crossed", duration: 3000 },
  { type: "jump", animation: "jump", speechContext: "jump", duration: 600 },
  { type: "slide", animation: "slide", speechContext: "random_walk", duration: 1000 },
  { type: "fall", animation: "fall", speechContext: "fall", duration: 800 },
  { type: "disappear", animation: "disappear", speechContext: "disappear", duration: 1500 },
  { type: "idleBounce", animation: "bounce", speechContext: "idle", duration: 2000 },
  { type: "idleWobble", animation: "wobble", speechContext: "idle", duration: 1500 },
];

const POSITION_POOL = [
  { x: 10, y: 15 },
  { x: 85, y: 15 },
  { x: 15, y: 80 },
  { x: 85, y: 80 },
  { x: 50, y: 50 },
  { x: 20, y: 40 },
  { x: 80, y: 40 },
];

const MIN_INTERVAL = 8000;
const MAX_INTERVAL = 18000;

export function getRandomBehavior(): Behavior {
  const base = RANDOM_BEHAVIORS[Math.floor(Math.random() * RANDOM_BEHAVIORS.length)]!;
  const pos = POSITION_POOL[Math.floor(Math.random() * POSITION_POOL.length)]!;
  return {
    ...base,
    targetX: pos.x,
    targetY: pos.y,
  };
}

export function getNextRandomInterval(): number {
  return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
}

export function getEventReaction(
  eventType: "page_load" | "page_create" | "page_delete" | "save_click" | "button_hover" | "idle" | "scroll"
): Behavior {
  const reactions: Record<typeof eventType, Behavior> = {
    page_load: {
      type: "walk",
      animation: "walk",
      speechContext: "page_load",
      duration: 2000,
      targetX: 85,
      targetY: 85,
    },
    page_create: {
      type: "jump",
      animation: "jump",
      speechContext: "page_load",
      duration: 800,
    },
    page_delete: {
      type: "slide",
      animation: "slide",
      speechContext: "idle",
      duration: 1000,
    },
    save_click: {
      type: "jump",
      animation: "jump",
      speechContext: "save_click",
      duration: 800,
    },
    button_hover: {
      type: "point",
      animation: "point",
      speechContext: "button_hover",
      duration: 1000,
    },
    idle: {
      type: "peek",
      animation: "peek",
      speechContext: "idle",
      duration: 1500,
    },
    scroll: {
      type: "slide",
      animation: "slide",
      speechContext: "scroll",
      duration: 800,
    },
  };
  return reactions[eventType];
}
