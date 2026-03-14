/**
 * mascotState - state machine, moods, action types
 */

export type MascotMood =
  | "idle"
  | "walking"
  | "watching"
  | "excited"
  | "bored"
  | "proud"
  | "thinking"
  | "reacting"
  | "tired"
  | "playful";

export type BaseAction =
  | "idleBreathing"
  | "blink"
  | "lookLeft"
  | "lookRight"
  | "lookUp"
  | "nod"
  | "shakeHead"
  | "walk"
  | "stretch"
  | "yawn"
  | "crossArms"
  | "heroPose"
  | "point"
  | "clap"
  | "wave"
  | "scratchHead"
  | "think"
  | "lean"
  | "inspect"
  | "celebrate"
  | "proudStance"
  | "tiredStance"
  | "shrug"
  | "facepalm"
  | "smallJump"
  | "crouch"
  | "peekFromEdge"
  | "lookAroundSuspicious"
  | "handsOnWaist"
  | "warmUp";

export interface MotionVariation {
  speed: number;      // 0.7 - 1.3
  duration: number;   // 0.8 - 1.5x base
  breathingStrength: number;  // 0.5 - 1.2
  headTilt: number;   // -8 to 8 deg
  armEmphasis: number;  // 0.5 - 1.2
  pauseTiming: number;  // 0.8 - 1.2x
  mirrored: boolean;   // left/right
}

export interface MascotPoseState {
  mood: MascotMood;
  action: BaseAction;
  variation: MotionVariation;
  walkFrame: number;
  facing: "left" | "right";
  /** Transform values for body parts */
  transforms: BodyTransforms;
}

export interface BodyTransforms {
  head: { x: number; y: number; rotate: number; scale: number };
  torso: { x: number; y: number; rotate: number };
  leftArm: { x: number; y: number; rotate: number };
  rightArm: { x: number; y: number; rotate: number };
  leftLeg: { x: number; y: number; rotate: number };
  rightLeg: { x: number; y: number; rotate: number };
  cape: { x: number; y: number; rotate: number };
}

export const DEFAULT_TRANSFORMS: BodyTransforms = {
  head: { x: 0, y: 0, rotate: 0, scale: 1 },
  torso: { x: 0, y: 0, rotate: 0 },
  leftArm: { x: 0, y: 0, rotate: 0 },
  rightArm: { x: 0, y: 0, rotate: 0 },
  leftLeg: { x: 0, y: 0, rotate: 0 },
  rightLeg: { x: 0, y: 0, rotate: 0 },
  cape: { x: 0, y: 0, rotate: 0 },
};
