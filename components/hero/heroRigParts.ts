/**
 * heroRigParts - 26 animation-ready SVG parts for a premium comic-style superhero.
 * Clean human proportions, NO external assets. Dark navy + red palette.
 * Each part preserves a coherent human silhouette when assembled.
 */

export const VIEW_WIDTH = 200;
export const VIEW_HEIGHT = 400;

export type PartId =
  | "cape_upper"
  | "cape_left"
  | "cape_right"
  | "pelvis"
  | "abdomen"
  | "lower_chest"
  | "upper_chest"
  | "neck"
  | "head"
  | "mask"
  | "hair"
  | "left_shoulder"
  | "right_shoulder"
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
  "cape_upper",
  "cape_left",
  "cape_right",
  "left_thigh",
  "right_thigh",
  "left_shin",
  "right_shin",
  "left_foot",
  "right_foot",
  "pelvis",
  "abdomen",
  "lower_chest",
  "upper_chest",
  "left_shoulder",
  "right_shoulder",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "neck",
  "head",
  "mask",
  "hair",
];

export interface PartDef {
  id: PartId;
  path: string;
  pivotX: number;
  pivotY: number;
  fill: string;
}

const NAVY = "#0d47a1";
const NAVY_DARK = "#1a237e";
const RED = "#b71c1c";
const RED_DARK = "#8b0000";
const SKIN = "#e8c9a8";
const BLACK = "#151515";

// Helper: rounded rect (x,y,w,h,r)
function rr(x: number, y: number, w: number, h: number, r: number): string {
  const [a, b, c, d] = [x, y, x + w, y + h];
  return `M ${a + r} ${b} L ${c - r} ${b} Q ${c} ${b} ${c} ${b + r} L ${c} ${d - r} Q ${c} ${d} ${c - r} ${d} L ${a + r} ${d} Q ${a} ${d} ${a} ${d - r} L ${a} ${b + r} Q ${a} ${b} ${a + r} ${b} Z`;
}

// Helper: ellipse centered at cx,cy with rx,ry
function ell(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0 Z`;
}

export const PARTS: Record<PartId, PartDef> = {
  cape_upper: {
    id: "cape_upper",
    path: "M 70 50 Q 100 42 130 50 L 135 95 Q 100 88 65 95 Z",
    pivotX: 100,
    pivotY: 75,
    fill: RED,
  },
  cape_left: {
    id: "cape_left",
    path: "M 65 92 L 55 260 Q 85 250 100 245 L 100 95 Z",
    pivotX: 100,
    pivotY: 180,
    fill: RED_DARK,
  },
  cape_right: {
    id: "cape_right",
    path: "M 100 95 L 100 245 Q 115 250 145 260 L 135 92 Z",
    pivotX: 100,
    pivotY: 180,
    fill: RED_DARK,
  },
  pelvis: {
    id: "pelvis",
    path: rr(72, 218, 56, 32, 6),
    pivotX: 100,
    pivotY: 234,
    fill: NAVY,
  },
  abdomen: {
    id: "abdomen",
    path: rr(76, 168, 48, 50, 6),
    pivotX: 100,
    pivotY: 193,
    fill: NAVY,
  },
  lower_chest: {
    id: "lower_chest",
    path: rr(74, 122, 52, 46, 8),
    pivotX: 100,
    pivotY: 145,
    fill: NAVY_DARK,
  },
  upper_chest: {
    id: "upper_chest",
    path: rr(68, 72, 64, 50, 10),
    pivotX: 100,
    pivotY: 97,
    fill: NAVY_DARK,
  },
  neck: {
    id: "neck",
    path: rr(88, 52, 24, 20, 4),
    pivotX: 100,
    pivotY: 62,
    fill: SKIN,
  },
  head: {
    id: "head",
    path: ell(100, 32, 38, 36),
    pivotX: 100,
    pivotY: 32,
    fill: SKIN,
  },
  mask: {
    id: "mask",
    path: "M 68 22 Q 100 16 132 22 Q 138 42 132 48 Q 100 54 68 48 Q 62 42 68 22 Z",
    pivotX: 100,
    pivotY: 35,
    fill: BLACK,
  },
  hair: {
    id: "hair",
    path: "M 64 8 Q 100 0 136 8 Q 142 28 136 36 Q 100 44 64 36 Q 58 28 64 8 Z",
    pivotX: 100,
    pivotY: 22,
    fill: BLACK,
  },
  left_shoulder: {
    id: "left_shoulder",
    path: rr(38, 88, 32, 28, 10),
    pivotX: 70,
    pivotY: 102,
    fill: NAVY_DARK,
  },
  right_shoulder: {
    id: "right_shoulder",
    path: rr(130, 88, 32, 28, 10),
    pivotX: 130,
    pivotY: 102,
    fill: NAVY_DARK,
  },
  left_upper_arm: {
    id: "left_upper_arm",
    path: rr(48, 114, 22, 70, 8),
    pivotX: 59,
    pivotY: 149,
    fill: NAVY,
  },
  left_forearm: {
    id: "left_forearm",
    path: rr(50, 182, 18, 72, 6),
    pivotX: 59,
    pivotY: 218,
    fill: NAVY,
  },
  left_hand: {
    id: "left_hand",
    path: rr(52, 250, 16, 24, 6),
    pivotX: 60,
    pivotY: 262,
    fill: BLACK,
  },
  right_upper_arm: {
    id: "right_upper_arm",
    path: rr(130, 114, 22, 70, 8),
    pivotX: 141,
    pivotY: 149,
    fill: NAVY,
  },
  right_forearm: {
    id: "right_forearm",
    path: rr(132, 182, 18, 72, 6),
    pivotX: 141,
    pivotY: 218,
    fill: NAVY,
  },
  right_hand: {
    id: "right_hand",
    path: rr(132, 250, 16, 24, 6),
    pivotX: 140,
    pivotY: 262,
    fill: BLACK,
  },
  left_thigh: {
    id: "left_thigh",
    path: rr(78, 248, 20, 72, 8),
    pivotX: 88,
    pivotY: 284,
    fill: NAVY,
  },
  left_shin: {
    id: "left_shin",
    path: rr(80, 318, 16, 56, 6),
    pivotX: 88,
    pivotY: 346,
    fill: NAVY_DARK,
  },
  left_foot: {
    id: "left_foot",
    path: rr(74, 372, 24, 20, 4),
    pivotX: 88,
    pivotY: 384,
    fill: BLACK,
  },
  right_thigh: {
    id: "right_thigh",
    path: rr(102, 248, 20, 72, 8),
    pivotX: 112,
    pivotY: 284,
    fill: NAVY,
  },
  right_shin: {
    id: "right_shin",
    path: rr(104, 318, 16, 56, 6),
    pivotX: 112,
    pivotY: 346,
    fill: NAVY_DARK,
  },
  right_foot: {
    id: "right_foot",
    path: rr(102, 372, 24, 20, 4),
    pivotX: 112,
    pivotY: 384,
    fill: BLACK,
  },
};
