/**
 * heroRigParts - 25 animation-ready SVG parts for the comic-style superhero mascot.
 * Each part has path data, pivot point, and fill. NO external assets.
 * Color palette: navy #0d47a1, red #b71c1c, dark #1a237e, skin #e8b88c, black #1a1a1a
 */

export const VIEW_WIDTH = 200;
export const VIEW_HEIGHT = 400;

export type PartId =
  | "cape_upper"
  | "cape_lower_left"
  | "cape_lower_right"
  | "pelvis"
  | "abdomen"
  | "chest"
  | "neck"
  | "head"
  | "face"
  | "hair"
  | "shoulder_left"
  | "shoulder_right"
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
  "cape_lower_left",
  "cape_lower_right",
  "left_thigh",
  "right_thigh",
  "left_shin",
  "right_shin",
  "left_foot",
  "right_foot",
  "pelvis",
  "abdomen",
  "chest",
  "shoulder_left",
  "shoulder_right",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "neck",
  "head",
  "face",
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
const RED_ACCENT = "#c62828";
const SKIN = "#e8b88c";
const SKIN_SHADOW = "#d4a574";
const BLACK = "#1a1a1a";

export const PARTS: Record<PartId, PartDef> = {
  cape_upper: {
    id: "cape_upper",
    path: "M100 60 Q60 55 50 90 L45 180 Q70 170 100 165 Q130 170 155 180 L150 90 Q140 55 100 60Z",
    pivotX: 100,
    pivotY: 90,
    fill: RED,
  },
  cape_lower_left: {
    id: "cape_lower_left",
    path: "M55 175 L45 320 Q75 300 100 295 L100 175 Z",
    pivotX: 100,
    pivotY: 200,
    fill: RED_ACCENT,
  },
  cape_lower_right: {
    id: "cape_lower_right",
    path: "M100 175 L100 295 Q125 300 155 320 L145 175 Z",
    pivotX: 100,
    pivotY: 200,
    fill: RED_ACCENT,
  },
  pelvis: {
    id: "pelvis",
    path: "M75 235 Q70 250 75 265 L125 265 Q130 250 125 235 L100 225 Q85 228 75 235Z",
    pivotX: 100,
    pivotY: 250,
    fill: NAVY,
  },
  abdomen: {
    id: "abdomen",
    path: "M80 180 Q75 200 80 220 L120 220 Q125 200 120 180 L100 165 Q90 168 80 180Z",
    pivotX: 100,
    pivotY: 190,
    fill: NAVY,
  },
  chest: {
    id: "chest",
    path: "M85 95 Q80 130 85 165 L115 165 Q120 130 115 95 L100 88 Q92 90 85 95Z",
    pivotX: 100,
    pivotY: 130,
    fill: NAVY_DARK,
  },
  neck: {
    id: "neck",
    path: "M92 75 Q90 88 92 95 L108 95 Q110 88 108 75 L100 72 Z",
    pivotX: 100,
    pivotY: 85,
    fill: SKIN,
  },
  head: {
    id: "head",
    path: "M100 25 Q130 22 145 45 Q155 70 148 95 Q142 105 100 108 Q58 105 52 95 Q45 70 55 45 Q70 22 100 25Z",
    pivotX: 100,
    pivotY: 75,
    fill: SKIN,
  },
  face: {
    id: "face",
    path: "M78 50 Q85 55 100 58 Q115 55 122 50 Q120 70 118 82 Q110 90 100 92 Q90 90 82 82 Q80 70 78 50Z",
    pivotX: 100,
    pivotY: 70,
    fill: SKIN_SHADOW,
  },
  hair: {
    id: "hair",
    path: "M100 28 Q125 25 138 42 Q145 58 135 75 Q120 85 100 88 Q80 85 65 75 Q55 58 62 42 Q75 25 100 28Z",
    pivotX: 100,
    pivotY: 58,
    fill: BLACK,
  },
  shoulder_left: {
    id: "shoulder_left",
    path: "M60 100 Q55 105 58 118 Q62 128 75 125 Q85 118 82 105 Q78 98 60 100Z",
    pivotX: 75,
    pivotY: 112,
    fill: NAVY_DARK,
  },
  shoulder_right: {
    id: "shoulder_right",
    path: "M140 100 Q142 98 118 105 Q115 118 125 125 Q138 128 142 118 Q145 105 140 100Z",
    pivotX: 125,
    pivotY: 112,
    fill: NAVY_DARK,
  },
  left_upper_arm: {
    id: "left_upper_arm",
    path: "M70 120 Q62 150 68 185 Q72 195 80 192 L82 122 Q76 118 70 120Z",
    pivotX: 75,
    pivotY: 155,
    fill: NAVY,
  },
  left_forearm: {
    id: "left_forearm",
    path: "M78 188 Q72 220 78 255 Q82 265 88 262 L90 192 Q84 190 78 188Z",
    pivotX: 82,
    pivotY: 225,
    fill: NAVY,
  },
  left_hand: {
    id: "left_hand",
    path: "M85 258 Q82 272 88 285 Q94 292 100 288 Q106 278 104 262 L90 255 Q86 258 85 258Z",
    pivotX: 94,
    pivotY: 275,
    fill: BLACK,
  },
  right_upper_arm: {
    id: "right_upper_arm",
    path: "M130 120 Q132 118 128 192 L130 192 Q138 195 142 185 Q148 150 140 120 Q134 118 130 120Z",
    pivotX: 125,
    pivotY: 155,
    fill: NAVY,
  },
  right_forearm: {
    id: "right_forearm",
    path: "M122 188 Q124 190 120 262 L112 265 Q110 278 116 288 Q122 292 128 285 Q134 272 130 258 L118 255 Q114 258 122 188Z",
    pivotX: 118,
    pivotY: 225,
    fill: NAVY,
  },
  right_hand: {
    id: "right_hand",
    path: "M116 255 Q114 262 116 278 Q118 288 124 288 Q130 292 136 285 Q142 272 139 258 L125 262 Q120 258 116 255Z",
    pivotX: 106,
    pivotY: 275,
    fill: BLACK,
  },
  left_thigh: {
    id: "left_thigh",
    path: "M82 265 Q75 290 78 330 Q80 345 88 342 L92 268 Q86 265 82 265Z",
    pivotX: 85,
    pivotY: 305,
    fill: NAVY,
  },
  left_shin: {
    id: "left_shin",
    path: "M86 338 Q82 360 86 385 Q90 398 96 395 L98 342 Q92 338 86 338Z",
    pivotX: 90,
    pivotY: 365,
    fill: NAVY_DARK,
  },
  left_foot: {
    id: "left_foot",
    path: "M92 392 Q88 405 94 418 Q100 422 108 418 Q114 405 110 392 L98 388 Z",
    pivotX: 100,
    pivotY: 408,
    fill: BLACK,
  },
  right_thigh: {
    id: "right_thigh",
    path: "M118 265 Q122 265 116 268 L120 342 Q128 345 130 330 Q133 290 126 265 Q122 265 118 265Z",
    pivotX: 115,
    pivotY: 305,
    fill: NAVY,
  },
  right_shin: {
    id: "right_shin",
    path: "M114 338 Q118 342 112 342 L116 395 Q122 398 126 385 Q130 360 126 338 Q122 335 114 338Z",
    pivotX: 110,
    pivotY: 365,
    fill: NAVY_DARK,
  },
  right_foot: {
    id: "right_foot",
    path: "M108 392 Q104 405 108 418 Q114 422 122 418 Q128 405 126 392 L116 388 Q112 390 108 392Z",
    pivotX: 100,
    pivotY: 408,
    fill: BLACK,
  },
};
