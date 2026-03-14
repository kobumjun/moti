/**
 * mascotActions - base actions, event reactions
 */

import type { BaseAction, MascotMood, MotionVariation } from "./mascotState";
import { pickVariation } from "./mascotMotion";

export type MascotEventType =
  | "page_load"
  | "page_create"
  | "page_delete"
  | "save_click"
  | "button_hover"
  | "idle"
  | "text_change"
  | "page_selected"
  | "lang_changed";

import type { ZoneKey } from "./mascotZones";

export type { ZoneKey };

export interface ActionResult {
  action: BaseAction;
  mood: MascotMood;
  zone: ZoneKey;
  speak: boolean;
  walkFirst: boolean;
  duration: number;
  variation: MotionVariation;
}

const IDLE_ACTIONS: BaseAction[] = [
  "idleBreathing",
  "lookLeft",
  "lookRight",
  "nod",
  "stretch",
  "scratchHead",
  "handsOnWaist",
  "crossArms",
  "lean",
  "think",
  "lookAroundSuspicious",
];

const lastUsedActions: BaseAction[] = [];

function avoidRecentAction(candidates: BaseAction[]): BaseAction {
  const avoid = new Set(lastUsedActions);
  const filtered = candidates.filter((a) => !avoid.has(a));
  const list = filtered.length > 0 ? filtered : candidates;
  const chosen = list[Math.floor(Math.random() * list.length)]!;
  lastUsedActions.unshift(chosen);
  if (lastUsedActions.length > 5) lastUsedActions.pop();
  return chosen;
}

function getVariation(action: BaseAction): MotionVariation {
  return pickVariation(action, []);
}

export function getEventReaction(
  event: MascotEventType,
  recentVariations: MotionVariation[] = []
): ActionResult {
  switch (event) {
    case "save_click":
      return {
        action: "celebrate",
        mood: "excited",
        zone: "saveArea",
        speak: true,
        walkFirst: false,
        duration: 1800,
        variation: getVariation("celebrate"),
      };
    case "page_create":
      return {
        action: "heroPose",
        mood: "excited",
        zone: "pageList",
        speak: true,
        walkFirst: true,
        duration: 2200,
        variation: getVariation("heroPose"),
      };
    case "page_delete":
      return {
        action: "shrug",
        mood: "playful",
        zone: "pageList",
        speak: true,
        walkFirst: false,
        duration: 1600,
        variation: getVariation("shrug"),
      };
    case "button_hover":
      return {
        action: "point",
        mood: "excited",
        zone: "saveArea",
        speak: true,
        walkFirst: true,
        duration: 2000,
        variation: getVariation("point"),
      };
    case "idle":
      return {
        action: "peekFromEdge",
        mood: "playful",
        zone: "logoutArea",
        speak: true,
        walkFirst: true,
        duration: 2800,
        variation: getVariation("peekFromEdge"),
      };
    case "page_selected":
      return {
        action: "nod",
        mood: "watching",
        zone: "pageList",
        speak: true,
        walkFirst: false,
        duration: 1500,
        variation: getVariation("nod"),
      };
    case "lang_changed":
      return {
        action: "wave",
        mood: "playful",
        zone: "center",
        speak: true,
        walkFirst: false,
        duration: 1600,
        variation: getVariation("wave"),
      };
    case "text_change":
      return {
        action: "clap",
        mood: "reacting",
        zone: "editorCenter",
        speak: false,
        walkFirst: false,
        duration: 1200,
        variation: getVariation("clap"),
      };
    default:
      return getIdleAction("center");
  }
}

export function getIdleAction(zone: ZoneKey): ActionResult {
  const action = avoidRecentAction(IDLE_ACTIONS);
  return {
    action,
    mood: "idle",
    zone,
    speak: false,
    walkFirst: false,
    duration: 2000 + Math.random() * 1500,
    variation: getVariation(action),
  };
}
