/**
 * mascotState - state machine, moods, action types, body transforms
 * 35+ base actions × variation system → 300+ effective motion variations
 */

export type MascotMood =
  | "idle"
  | "walking"
  | "proud"
  | "bored"
  | "excited"
  | "thinking"
  | "tired"
  | "playful"
  | "focused"
  | "watching"
  | "reacting";

export type BaseAction =
  | "idleBreathing"
  | "blink"
  | "lookLeft"
  | "lookRight"
  | "lookUp"
  | "lookDown"
  | "nod"
  | "shakeHead"
  | "walk"
  | "stretch"
  | "shoulderRoll"
  | "yawn"
  | "crossArms"
  | "handsOnWaist"
  | "heroPose"
  | "inspect"
  | "think"
  | "chinTouch"
  | "scratchHead"
  | "point"
  | "clap"
  | "wave"
  | "smallJump"
  | "stepBack"
  | "stepForward"
  | "leanLeft"
  | "leanRight"
  | "proudStance"
  | "tiredStance"
  | "shrug"
  | "peekFromEdge"
  | "lookAroundSuspicious"
  | "readyStance"
  | "warmUp"
  | "neckLoosen"
  | "glanceAround"
  | "subtleReaction"
  | "slightCrouch"
  | "recoverNeutral"
  | "capeAdjust"
  | "talk"
  | "facepalm"
  | "celebrate"
  | "frontDoubleBiceps"
  | "latsSpread"
  | "armShakeOut"
  | "chestFlex"
  | "sit"
  | "seatedIdle"
  | "standUp"
  | "jump"
  | "land"
  | "farJumpPrep"
  | "farJumpTakeoff"
  | "farJumpLand"
  | "recoverLanding";

export interface MotionVariation {
  speed: number;           // 0.7 - 1.3
  duration: number;        // 0.85 - 1.25x base
  breathingStrength: number;  // 0.5 - 1.2
  headTilt: number;        // -10 to 10 deg
  armEmphasis: number;     // 0.5 - 1.2
  pauseTiming: number;     // 0.8 - 1.2x
  mirrored: boolean;       // left/right
  torsoSway: number;       // 0.5 - 1.2
  shoulderLift: number;    // 0.5 - 1.1
  stepAmplitude: number;   // 0.8 - 1.2 for walk bounce
  weightShift: number;     // 0.6 - 1.0
}

export interface MascotPoseState {
  mood: MascotMood;
  action: BaseAction;
  variation: MotionVariation;
  walkFrame: number;
  facing: "left" | "right";
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
