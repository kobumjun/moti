/**
 * robotActions - event reactions
 */

import type { BaseAction, RobotMood, MotionVariation } from "./robotState";
import { pickVariation } from "./robotMotion";
import type { ZoneKey } from "./robotRoaming";

export type RobotEventType =
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
  mood: RobotMood;
  zone: ZoneKey;
  speak: boolean;
  walkFirst: boolean;
  duration: number;
  variation: MotionVariation;
}

const gv = (a: BaseAction) => pickVariation(a);

export function getEventReaction(event: RobotEventType): ActionResult {
  switch (event) {
    case "save_click":
      return { action: "celebrate", mood: "proud", zone: "saveArea", speak: true, walkFirst: false, duration: 1600, variation: gv("celebrate") };
    case "page_create":
      return { action: "heroPose", mood: "focused", zone: "pageList", speak: true, walkFirst: true, duration: 2000, variation: gv("heroPose") };
    case "page_delete":
      return { action: "recoverNeutral", mood: "playful", zone: "pageList", speak: true, walkFirst: false, duration: 1400, variation: gv("recoverNeutral") };
    case "button_hover":
      return { action: "point", mood: "focused", zone: "saveArea", speak: true, walkFirst: true, duration: 1800, variation: gv("point") };
    case "idle":
      return { action: "inspect", mood: "playful", zone: "logoutArea", speak: true, walkFirst: true, duration: 2600, variation: gv("inspect") };
    case "page_selected":
      return { action: "nod", mood: "focused", zone: "pageList", speak: true, walkFirst: false, duration: 1400, variation: gv("nod") };
    case "lang_changed":
      return { action: "wave", mood: "playful", zone: "center", speak: true, walkFirst: false, duration: 1500, variation: gv("wave") };
    case "text_change":
      return { action: "clap", mood: "reacting", zone: "editorCenter", speak: false, walkFirst: false, duration: 1100, variation: gv("clap") };
    case "typing_started":
      return { action: "inspect", mood: "focused", zone: "editorCenter", speak: false, walkFirst: false, duration: 1400, variation: gv("inspect") };
    case "typing_stopped":
      return { action: "recoverNeutral", mood: "idle", zone: "editorCenter", speak: false, walkFirst: false, duration: 900, variation: gv("recoverNeutral") };
    default:
      return { action: "idlePulse", mood: "idle", zone: "center", speak: false, walkFirst: false, duration: 2200, variation: gv("idlePulse") };
  }
}
