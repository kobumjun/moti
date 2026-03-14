/**
 * heroActions - event reactions, mood-aware action selection
 */

import type { BaseAction, HeroMood, MotionVariation } from "./heroState";
import { pickVariation } from "./heroMotion";
import type { ZoneKey } from "./heroRoaming";

export type HeroEventType =
  | "page_load"
  | "page_create"
  | "page_delete"
  | "save_click"
  | "button_hover"
  | "idle"
  | "text_change"
  | "typing_started"
  | "typing_stopped"
  | "page_selected"
  | "lang_changed";

export interface ActionResult {
  action: BaseAction;
  mood: HeroMood;
  zone: ZoneKey;
  speak: boolean;
  walkFirst: boolean;
  duration: number;
  variation: MotionVariation;
}

const FLOW_ACTIONS: BaseAction[] = [
  "idleBreathing",
  "lookLeft",
  "lookRight",
  "nod",
  "stretch",
  "shoulderRoll",
  "scratchHead",
  "handsOnWaist",
  "crossArms",
  "leanLeft",
  "leanRight",
  "think",
  "inspect",
  "chinTouch",
  "suspiciousLook",
  "capeAdjust",
  "proudStance",
  "tiredStance",
  "readyStance",
  "warmUp",
  "slightCrouch",
  "recoverNeutral",
  "frontDoubleBiceps",
  "chestFlex",
  "celebrate",
  "heroPose",
];

const lastUsed: BaseAction[] = [];

function avoidRecent(candidates: BaseAction[]): BaseAction {
  const avoid = new Set(lastUsed);
  const list = candidates.filter((a) => !avoid.has(a)).length > 0
    ? candidates.filter((a) => !avoid.has(a))
    : candidates;
  const chosen = list[Math.floor(Math.random() * list.length)]!;
  lastUsed.unshift(chosen);
  if (lastUsed.length > 5) lastUsed.pop();
  return chosen;
}

export function getEventReaction(event: HeroEventType): ActionResult {
  const gv = (a: BaseAction) => pickVariation(a);
  switch (event) {
    case "save_click":
      return { action: "celebrate", mood: "proud", zone: "saveArea", speak: true, walkFirst: false, duration: 1800, variation: gv("celebrate") };
    case "page_create":
      return { action: "heroPose", mood: "athletic", zone: "pageList", speak: true, walkFirst: true, duration: 2200, variation: gv("heroPose") };
    case "page_delete":
      return { action: "capeAdjust", mood: "playful", zone: "pageList", speak: true, walkFirst: false, duration: 1600, variation: gv("capeAdjust") };
    case "button_hover":
      return { action: "point", mood: "athletic", zone: "saveArea", speak: true, walkFirst: true, duration: 2000, variation: gv("point") };
    case "idle":
      return { action: "inspect", mood: "playful", zone: "logoutArea", speak: true, walkFirst: true, duration: 2800, variation: gv("inspect") };
    case "page_selected":
      return { action: "nod", mood: "focused", zone: "pageList", speak: true, walkFirst: false, duration: 1500, variation: gv("nod") };
    case "lang_changed":
      return { action: "wave", mood: "playful", zone: "center", speak: true, walkFirst: false, duration: 1600, variation: gv("wave") };
    case "text_change":
      return { action: "clap", mood: "reacting", zone: "editorCenter", speak: false, walkFirst: false, duration: 1200, variation: gv("clap") };
    case "typing_started":
      return { action: "inspect", mood: "focused", zone: "editorCenter", speak: false, walkFirst: false, duration: 1500, variation: gv("inspect") };
    case "typing_stopped":
      return { action: "recoverNeutral", mood: "idle", zone: "editorCenter", speak: false, walkFirst: false, duration: 1000, variation: gv("recoverNeutral") };
    default:
      return { action: avoidRecent(FLOW_ACTIONS), mood: "idle", zone: "center", speak: false, walkFirst: false, duration: 2500, variation: gv("idleBreathing") };
  }
}
