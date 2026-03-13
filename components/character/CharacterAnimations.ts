/**
 * CharacterAnimations - zones, flows, pose states for superhero
 */

export type PoseState = "idle" | "walk" | "point" | "shrug" | "peek" | "talk";

export const MASCOT_WIDTH = 72;
export const MASCOT_HEIGHT = 110;
export const SAFE_PADDING = 60;
/** Pixels per second - slow, natural walking speed */
export const WALK_SPEED = 55;

const ZONES_1280: Record<string, { x: number; y: number }> = {
  bottomLeft: { x: 140, y: 600 },
  bottomCenter: { x: 540, y: 600 },
  bottomRight: { x: 900, y: 600 },
  pageList: { x: 150, y: 350 },
  editorCenter: { x: 580, y: 350 },
  saveArea: { x: 780, y: 180 },
  logoutArea: { x: 1080, y: 100 },
  center: { x: 580, y: 380 },
};

export type ZoneKey = keyof typeof ZONES_1280;

export interface FlowStep {
  zone: ZoneKey;
  pose: PoseState;
  speechKey?: string;
  duration: number;
}

export const FLOW_A: FlowStep[] = [
  { zone: "bottomLeft", pose: "idle", speechKey: "intro", duration: 2500 },
  { zone: "bottomCenter", pose: "walk", duration: 0 },
  { zone: "pageList", pose: "walk", duration: 0 },
  { zone: "pageList", pose: "point", speechKey: "pageList", duration: 2200 },
  { zone: "editorCenter", pose: "walk", speechKey: "nextZone", duration: 0 },
  { zone: "editorCenter", pose: "idle", speechKey: "editor", duration: 2800 },
  { zone: "saveArea", pose: "walk", speechKey: "toSave", duration: 0 },
  { zone: "saveArea", pose: "point", speechKey: "pointSave", duration: 2200 },
  { zone: "bottomRight", pose: "walk", duration: 0 },
  { zone: "bottomRight", pose: "idle", duration: 3000 },
];

export const FLOW_B: FlowStep[] = [
  { zone: "bottomCenter", pose: "peek", speechKey: "peek", duration: 2000 },
  { zone: "pageList", pose: "walk", duration: 0 },
  { zone: "pageList", pose: "shrug", speechKey: "shrug", duration: 2200 },
  { zone: "logoutArea", pose: "walk", duration: 0 },
  { zone: "logoutArea", pose: "talk", speechKey: "nearLogout", duration: 3200 },
  { zone: "bottomCenter", pose: "walk", duration: 0 },
  { zone: "bottomCenter", pose: "idle", duration: 4000 },
];

export const FLOW_C: FlowStep[] = [
  { zone: "center", pose: "idle", speechKey: "flow", duration: 2500 },
  { zone: "editorCenter", pose: "walk", duration: 0 },
  { zone: "editorCenter", pose: "point", speechKey: "editor", duration: 2400 },
  { zone: "saveArea", pose: "walk", duration: 0 },
  { zone: "saveArea", pose: "talk", speechKey: "keepGoing", duration: 2600 },
  { zone: "center", pose: "idle", duration: 3500 },
];

export const FLOWS = [FLOW_A, FLOW_B, FLOW_C];

export function getZone(zone: ZoneKey, vw = 1280, vh = 800): { x: number; y: number } {
  const base = ZONES_1280[zone] ?? ZONES_1280.center;
  return {
    x: (base!.x / 1280) * vw,
    y: (base!.y / 800) * vh,
  };
}

export function clampToSafe(x: number, y: number, vw: number, vh: number): { x: number; y: number } {
  const minX = SAFE_PADDING + MASCOT_WIDTH / 2;
  const maxX = vw - SAFE_PADDING - MASCOT_WIDTH / 2;
  const minY = SAFE_PADDING + MASCOT_HEIGHT;
  const maxY = vh - SAFE_PADDING - 24;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}
