/**
 * robotRoaming - safe viewport zones for walk-based roaming
 */

export type ZoneKey =
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight"
  | "pageList"
  | "editorCenter"
  | "saveArea"
  | "logoutArea"
  | "center";

export const ROBOT_WIDTH = 120;
export const ROBOT_HEIGHT = 200;
export const SAFE_PADDING = 60;
export const WALK_SPEED = 55;

const ZONES: Record<ZoneKey, { x: number; y: number }> = {
  bottomLeft: { x: 140, y: 600 },
  bottomCenter: { x: 540, y: 600 },
  bottomRight: { x: 900, y: 600 },
  pageList: { x: 150, y: 350 },
  editorCenter: { x: 580, y: 350 },
  saveArea: { x: 780, y: 180 },
  logoutArea: { x: 1080, y: 100 },
  center: { x: 580, y: 380 },
};

export function getZone(zone: ZoneKey, vw: number, vh: number): { x: number; y: number } {
  return { x: (ZONES[zone]!.x / 1280) * vw, y: (ZONES[zone]!.y / 800) * vh };
}

export function clampToSafe(x: number, y: number, vw: number, vh: number): { x: number; y: number } {
  const minX = SAFE_PADDING + ROBOT_WIDTH / 2;
  const maxX = vw - SAFE_PADDING - ROBOT_WIDTH / 2;
  const minY = SAFE_PADDING + ROBOT_HEIGHT;
  const maxY = vh - SAFE_PADDING - 24;
  return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) };
}
