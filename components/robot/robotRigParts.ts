/**
 * robotRigParts - Friendly humanoid robot mascot
 *
 * STRICT STRUCTURE (enforced by part list):
 * - 1 head (head + visor as one unit)
 * - 1 neck
 * - 1 torso (upper_torso + lower_torso + pelvis)
 * - 2 arms: left (upper_arm, forearm, hand) + right (upper_arm, forearm, hand)
 * - 2 legs: left (thigh, shin, foot) + right (thigh, shin, foot)
 *
 * TOTAL: 18 parts. NO extra arms. NO extra legs. NO spider/insect structure.
 */

export const VIEW_WIDTH = 140;
export const VIEW_HEIGHT = 340;

// Limb counts - these are the ONLY arm/leg parts. Do not add more.
const LEFT_ARM_PARTS = ["left_upper_arm", "left_forearm", "left_hand"] as const;
const RIGHT_ARM_PARTS = ["right_upper_arm", "right_forearm", "right_hand"] as const;
const LEFT_LEG_PARTS = ["left_thigh", "left_shin", "left_foot"] as const;
const RIGHT_LEG_PARTS = ["right_thigh", "right_shin", "right_foot"] as const;

export const ARM_COUNT = 2;
export const LEG_COUNT = 2;

export type PartId =
  | "head"
  | "visor"
  | "neck"
  | "upper_torso"
  | "lower_torso"
  | "pelvis"
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
  /** Pivot at joint: shoulder/elbow/wrist for arms, hip/knee/ankle for legs, neck for head */
  pivotX: number;
  pivotY: number;
  fill: string;
}

/** Joint positions for hierarchy: child pivot = parent's end joint */
export const JOINTS = {
  torso: { x: 70, y: 182 },
  head: { x: 70, y: 88 },
  leftShoulder: { x: 34, y: 98 },
  leftElbow: { x: 35, y: 142 },
  leftWrist: { x: 35, y: 180 },
  rightShoulder: { x: 106, y: 98 },
  rightElbow: { x: 105, y: 142 },
  rightWrist: { x: 105, y: 180 },
  leftHip: { x: 63, y: 192 },
  leftKnee: { x: 63, y: 238 },
  leftAnkle: { x: 63, y: 280 },
  rightHip: { x: 77, y: 192 },
  rightKnee: { x: 77, y: 238 },
  rightAnkle: { x: 77, y: 280 },
} as const;

const NAVY = "#2a3f5f";
const NAVY_DARK = "#1a2d45";
const BLUE = "#3d5a80";
const PURPLE = "#6b7fd7";
const ACCENT = "#8b9dc3";
const HIGHLIGHT = "#a8c5e8";

function rr(x: number, y: number, w: number, h: number, r: number): string {
  const rad = Math.min(r, w / 2, h / 2);
  const [a, b, c, d] = [x, y, x + w, y + h];
  return `M ${a + rad} ${b} L ${c - rad} ${b} Q ${c} ${b} ${c} ${b + rad} L ${c} ${d - rad} Q ${c} ${d} ${c - rad} ${d} L ${a + rad} ${d} Q ${a} ${d} ${a} ${d - rad} L ${a} ${b + rad} Q ${a} ${b} ${a + rad} ${b} Z`;
}

function ell(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0 Z`;
}

export const PARTS: Record<PartId, PartDef> = {
  head: {
    id: "head",
    path: ell(70, 38, 28, 32),
    pivotX: 70,
    pivotY: 70,
    fill: NAVY,
  },
  visor: {
    id: "visor",
    path: rr(50, 28, 40, 12, 6),
    pivotX: 70,
    pivotY: 70,
    fill: HIGHLIGHT,
  },
  neck: {
    id: "neck",
    path: rr(62, 68, 16, 20, 6),
    pivotX: 70,
    pivotY: 78,
    fill: NAVY_DARK,
  },
  upper_torso: {
    id: "upper_torso",
    path: rr(52, 86, 36, 48, 10),
    pivotX: 70,
    pivotY: 128,
    fill: BLUE,
  },
  lower_torso: {
    id: "lower_torso",
    path: rr(54, 132, 32, 40, 8),
    pivotX: 70,
    pivotY: 152,
    fill: NAVY,
  },
  pelvis: {
    id: "pelvis",
    path: rr(56, 170, 28, 24, 6),
    pivotX: 70,
    pivotY: 182,
    fill: NAVY_DARK,
  },
  left_upper_arm: {
    id: "left_upper_arm",
    path: rr(28, 98, 12, 44, 6),
    pivotX: 34,
    pivotY: 98,
    fill: BLUE,
  },
  left_forearm: {
    id: "left_forearm",
    path: rr(30, 140, 10, 40, 5),
    pivotX: 35,
    pivotY: 140,
    fill: NAVY,
  },
  left_hand: {
    id: "left_hand",
    path: rr(28, 178, 14, 16, 6),
    pivotX: 35,
    pivotY: 178,
    fill: ACCENT,
  },
  right_upper_arm: {
    id: "right_upper_arm",
    path: rr(100, 98, 12, 44, 6),
    pivotX: 106,
    pivotY: 98,
    fill: BLUE,
  },
  right_forearm: {
    id: "right_forearm",
    path: rr(100, 140, 10, 40, 5),
    pivotX: 105,
    pivotY: 140,
    fill: NAVY,
  },
  right_hand: {
    id: "right_hand",
    path: rr(98, 178, 14, 16, 6),
    pivotX: 105,
    pivotY: 178,
    fill: ACCENT,
  },
  left_thigh: {
    id: "left_thigh",
    path: rr(58, 192, 10, 46, 6),
    pivotX: 63,
    pivotY: 192,
    fill: BLUE,
  },
  left_shin: {
    id: "left_shin",
    path: rr(60, 236, 8, 44, 5),
    pivotX: 63,
    pivotY: 236,
    fill: NAVY,
  },
  left_foot: {
    id: "left_foot",
    path: rr(54, 278, 18, 12, 4),
    pivotX: 63,
    pivotY: 278,
    fill: PURPLE,
  },
  right_thigh: {
    id: "right_thigh",
    path: rr(72, 192, 10, 46, 6),
    pivotX: 77,
    pivotY: 192,
    fill: BLUE,
  },
  right_shin: {
    id: "right_shin",
    path: rr(72, 236, 8, 44, 5),
    pivotX: 77,
    pivotY: 236,
    fill: NAVY,
  },
  right_foot: {
    id: "right_foot",
    path: rr(68, 278, 18, 12, 4),
    pivotX: 77,
    pivotY: 278,
    fill: PURPLE,
  },
};
