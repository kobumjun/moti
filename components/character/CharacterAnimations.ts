/**
 * CharacterAnimations - 전체 페이지 로밍 영역
 * 사이드바, 에디터, 상단, 로그아웃, 페이지 리스트 등
 */

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
  | "really"
  | "cheering"
  | "crouching"
  | "dash"
  | "walking"
  | "running"
  | "peekSide"
  | "peekBottom";

export interface Zone {
  x: number;
  y: number;
  label: string;
  area: "sidebar" | "editor" | "top" | "bottom" | "center" | "logout";
}

// 전체 페이지 로밍 영역 (px)
export const ZONES: Record<string, Zone> = {
  sidebarTop: { x: 90, y: 120, label: "sidebarTop", area: "sidebar" },
  sidebarMid: { x: 90, y: 280, label: "sidebarMid", area: "sidebar" },
  sidebarBottom: { x: 90, y: 450, label: "sidebarBottom", area: "sidebar" },
  pageList: { x: 140, y: 220, label: "pageList", area: "sidebar" },
  editorTop: { x: 420, y: 160, label: "editorTop", area: "editor" },
  editorCenter: { x: 520, y: 320, label: "editorCenter", area: "editor" },
  saveArea: { x: 680, y: 140, label: "saveArea", area: "editor" },
  topRight: { x: 1100, y: 60, label: "topRight", area: "top" },
  logoutArea: { x: 1050, y: 80, label: "logoutArea", area: "logout" },
  bottomLeft: { x: 350, y: 480, label: "bottomLeft", area: "bottom" },
  bottomCenter: { x: 550, y: 480, label: "bottomCenter", area: "bottom" },
  bottomRight: { x: 750, y: 480, label: "bottomRight", area: "bottom" },
  center: { x: 550, y: 300, label: "center", area: "center" },
};

export type ZoneKey = "sidebarTop" | "sidebarMid" | "sidebarBottom" | "pageList" | "editorTop" | "editorCenter" | "saveArea" | "topRight" | "logoutArea" | "bottomLeft" | "bottomCenter" | "bottomRight" | "center";

export const OFFSCREEN_LEFT = -160;
export const OFFSCREEN_RIGHT = 1200;
export const OFFSCREEN_TOP = -120;
export const OFFSCREEN_BOTTOM = 700;

export const WALK_SPEED = 80;
export const LIFT_DURATION = 1200;
export const JUMP_DURATION = 800;
