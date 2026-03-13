/**
 * CharacterAnimations - 안전 영역 및 시퀀스
 */

export type PoseState =
  | "idleBreathing"
  | "confidentIdle"
  | "lookAround"
  | "inspecting"
  | "nodding"
  | "smallBounce"
  | "anticipation"
  | "pointingUp"
  | "pointingLeft"
  | "pointingRight"
  | "pointingAtButton"
  | "shrug"
  | "keepGoing"
  | "handsOnHips"
  | "proudPose"
  | "lookHere"
  | "peekSneaky"
  | "cornerPeek"
  | "arrivingStop"
  | "stepCycle"
  | "walkCycle"
  | "engineLift"
  | "landing"
  | "exitWalk"
  | "pauseWatch"
  | "reactingTyping"
  | "reactingIdle"
  | "reactingLogout"
  | "reactingSave"
  | "entering";

export const MASCOT_WIDTH = 100;
export const MASCOT_HEIGHT = 130;
export const SAFE_PADDING = 70;

// 안전 영역 - 1280 기준 좌표 (getZone에서 viewport 보간)
const ZONES_1280: Record<string, { x: number; y: number }> = {
  bottomLeft: { x: 140, y: 600 },
  bottomCenter: { x: 540, y: 600 },
  bottomRight: { x: 900, y: 600 },
  sidebarTop: { x: 130, y: 200 },
  pageList: { x: 150, y: 350 },
  sidebarBottom: { x: 130, y: 500 },
  editorTop: { x: 480, y: 200 },
  editorCenter: { x: 580, y: 350 },
  saveArea: { x: 780, y: 180 },
  logoutArea: { x: 1080, y: 100 },
  center: { x: 580, y: 380 },
};

export type ZoneKey = keyof typeof ZONES_1280;

// 시퀀스 스텝
export interface FlowStep {
  zone: ZoneKey;
  pose: PoseState;
  speechKey?: string;
  duration: number;
}

export const FLOW_A: FlowStep[] = [
  { zone: "bottomLeft", pose: "entering", speechKey: "intro", duration: 2000 },
  { zone: "bottomCenter", pose: "walkCycle", duration: 1600 },
  { zone: "pageList", pose: "arrivingStop", duration: 700 },
  { zone: "pageList", pose: "inspecting", speechKey: "pageList", duration: 2400 },
  { zone: "pageList", pose: "pointingAtButton", duration: 1400 },
  { zone: "editorCenter", pose: "walkCycle", speechKey: "nextZone", duration: 2200 },
  { zone: "editorCenter", pose: "arrivingStop", duration: 600 },
  { zone: "editorCenter", pose: "pauseWatch", speechKey: "editor", duration: 2800 },
  { zone: "saveArea", pose: "walkCycle", speechKey: "toSave", duration: 2000 },
  { zone: "saveArea", pose: "pointingAtButton", speechKey: "pointSave", duration: 2200 },
  { zone: "bottomRight", pose: "exitWalk", duration: 1800 },
];

export const FLOW_B: FlowStep[] = [
  { zone: "bottomCenter", pose: "cornerPeek", duration: 900 },
  { zone: "bottomCenter", pose: "peekSneaky", speechKey: "peek", duration: 1400 },
  { zone: "pageList", pose: "walkCycle", duration: 1800 },
  { zone: "pageList", pose: "arrivingStop", duration: 600 },
  { zone: "pageList", pose: "shrug", speechKey: "shrug", duration: 2000 },
  { zone: "logoutArea", pose: "walkCycle", duration: 2500 },
  { zone: "logoutArea", pose: "reactingLogout", speechKey: "nearLogout", duration: 3000 },
  { zone: "bottomCenter", pose: "walkCycle", duration: 2000 },
  { zone: "bottomCenter", pose: "confidentIdle", duration: 3500 },
];

export const FLOW_C: FlowStep[] = [
  { zone: "center", pose: "idleBreathing", speechKey: "flow", duration: 2200 },
  { zone: "editorTop", pose: "walkCycle", duration: 1700 },
  { zone: "editorTop", pose: "lookHere", speechKey: "editor", duration: 2300 },
  { zone: "saveArea", pose: "walkCycle", duration: 1500 },
  { zone: "saveArea", pose: "keepGoing", speechKey: "keepGoing", duration: 2500 },
  { zone: "center", pose: "proudPose", duration: 2800 },
];

export const FLOWS = [FLOW_A, FLOW_B, FLOW_C];

export function getZone(zone: ZoneKey, vw = 1280, vh = 800): { x: number; y: number } {
  const base = ZONES_1280[zone] ?? ZONES_1280.center;
  const x = (base!.x / 1280) * vw;
  const y = (base!.y / 800) * vh;
  return { x, y };
}

export function clampToSafe(x: number, y: number, vw: number, vh: number): { x: number; y: number } {
  const minX = SAFE_PADDING + MASCOT_WIDTH / 2;
  const maxX = vw - SAFE_PADDING - MASCOT_WIDTH / 2;
  const minY = SAFE_PADDING + MASCOT_HEIGHT;
  const maxY = vh - SAFE_PADDING - 30;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}
