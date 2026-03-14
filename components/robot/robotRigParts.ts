/**
 * robotRigParts - 20 clean parts for a simple premium humanoid robot mascot.
 * Normal humanoid silhouette: 1 head, 2 arms, 2 legs, 1 torso.
 * Dark navy / blue / purple palette. Animation-friendly.
 */

export const VIEW_WIDTH = 160;
export const VIEW_HEIGHT = 360;

export type PartId =
  | "back_panel"
  | "pelvis"
  | "lower_torso"
  | "upper_torso"
  | "neck"
  | "head"
  | "visor"
  | "left_upper_arm"
  | "left_forearm"
  | "left_hand"
  | "right_upper_arm"
  | "right_forearm"
  | "right_hand"
  | "left_thigh"
  | "left_shin"
  | "left_foot"
  | "right_thigh"
  | "right_shin"
  | "right_foot";

export const PARTS_DRAW_ORDER: PartId[] = [
  "back_panel",
  "left_thigh",
  "right_thigh",
  "left_shin",
  "right_shin",
  "left_foot",
  "right_foot",
  "pelvis",
  "lower_torso",
  "upper_torso",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "neck",
  "head",
  "visor",
];

export interface PartDef {
  id: PartId;
  path: string;
  pivotX: number;
  pivotY: number;
  fill: string;
}

const NAVY = "#1e3a5f";
const NAVY_DARK = "#0f2744";
const BLUE = "#2d4a6f";
const PURPLE = "#5c6bc0";
const PURPLE_LIGHT = "#7e57c2";

function rr(x: number, y: number, w: number, h: number, r: number): string {
  const [a, b, c, d] = [x, y, x + w, y + h];
  return `M ${a + r} ${b} L ${c - r} ${b} Q ${c} ${b} ${c} ${b + r} L ${c} ${d - r} Q ${c} ${d} ${c - r} ${d} L ${a + r} ${d} Q ${a} ${d} ${a} ${d - r} L ${a} ${b + r} Q ${a} ${b} ${a + r} ${b} Z`;
}

function ell(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0 Z`;
}

export const PARTS: Record<PartId, PartDef> = {
  back_panel: {
    id: "back_panel",
    path: rr(52, 60, 56, 110, 6),
    pivotX: 80,
    pivotY: 115,
    fill: NAVY_DARK,
  },
  pelvis: {
    id: "pelvis",
    path: rr(60, 200, 40, 28, 4),
    pivotX: 80,
    pivotY: 214,
    fill: NAVY,
  },
  lower_torso: {
    id: "lower_torso",
    path: rr(62, 158, 36, 42, 6),
    pivotX: 80,
    pivotY: 179,
    fill: BLUE,
  },
  upper_torso: {
    id: "upper_torso",
    path: rr(58, 98, 44, 60, 8),
    pivotX: 80,
    pivotY: 128,
    fill: NAVY,
  },
  neck: {
    id: "neck",
    path: rr(72, 72, 16, 26, 4),
    pivotX: 80,
    pivotY: 85,
    fill: NAVY_DARK,
  },
  head: {
    id: "head",
    path: ell(80, 42, 32, 36),
    pivotX: 80,
    pivotY: 42,
    fill: NAVY,
  },
  visor: {
    id: "visor",
    path: rr(56, 32, 48, 14, 4),
    pivotX: 80,
    pivotY: 39,
    fill: PURPLE,
  },
  left_upper_arm: {
    id: "left_upper_arm",
    path: rr(36, 108, 14, 52, 6),
    pivotX: 43,
    pivotY: 134,
    fill: BLUE,
  },
  left_forearm: {
    id: "left_forearm",
    path: rr(38, 158, 12, 48, 4),
    pivotX: 44,
    pivotY: 182,
    fill: NAVY,
  },
  left_hand: {
    id: "left_hand",
    path: rr(36, 204, 16, 18, 4),
    pivotX: 44,
    pivotY: 213,
    fill: PURPLE_LIGHT,
  },
  right_upper_arm: {
    id: "right_upper_arm",
    path: rr(110, 108, 14, 52, 6),
    pivotX: 117,
    pivotY: 134,
    fill: BLUE,
  },
  right_forearm: {
    id: "right_forearm",
    path: rr(110, 158, 12, 48, 4),
    pivotX: 116,
    pivotY: 182,
    fill: NAVY,
  },
  right_hand: {
    id: "right_hand",
    path: rr(108, 204, 16, 18, 4),
    pivotX: 116,
    pivotY: 213,
    fill: PURPLE_LIGHT,
  },
  left_thigh: {
    id: "left_thigh",
    path: rr(66, 226, 12, 52, 6),
    pivotX: 72,
    pivotY: 252,
    fill: BLUE,
  },
  left_shin: {
    id: "left_shin",
    path: rr(68, 276, 10, 48, 4),
    pivotX: 72,
    pivotY: 302,
    fill: NAVY,
  },
  left_foot: {
    id: "left_foot",
    path: rr(62, 322, 20, 14, 3),
    pivotX: 72,
    pivotY: 332,
    fill: PURPLE_LIGHT,
  },
  right_thigh: {
    id: "right_thigh",
    path: rr(82, 226, 12, 52, 6),
    pivotX: 88,
    pivotY: 252,
    fill: BLUE,
  },
  right_shin: {
    id: "right_shin",
    path: rr(82, 276, 10, 48, 4),
    pivotX: 88,
    pivotY: 302,
    fill: NAVY,
  },
  right_foot: {
    id: "right_foot",
    path: rr(78, 322, 20, 14, 3),
    pivotX: 88,
    pivotY: 332,
    fill: PURPLE_LIGHT,
  },
};
