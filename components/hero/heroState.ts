/**
 * heroState - state machine, moods, base actions, body transforms
 * 40 base actions × variation system → 300+ effective motion variations
 */

export type HeroMood =
  | "idle"
  | "walking"
  | "stopping"
  | "proud"
  | "thinking"
  | "focused"
  | "playful"
  | "bored"
  | "tired"
  | "athletic"
  | "reacting"
  | "seated"
  | "airborne"
  | "landing"
  | "recovery";

export type BaseAction =
  | "idleBreathing"
  | "blink"
  | "lookLeft"
  | "lookRight"
  | "lookUp"
  | "lookDown"
  | "nod"
  | "shakeHead"
  | "weightShift"
  | "chestStretch"
  | "shoulderRoll"
  | "crossArms"
  | "handsOnWaist"
  | "point"
  | "clap"
  | "wave"
  | "inspect"
  | "think"
  | "chinTouch"
  | "scratchHead"
  | "suspiciousLook"
  | "proudStance"
  | "boredStance"
  | "tiredStance"
  | "readyStance"
  | "slightCrouch"
  | "sit"
  | "seatedIdle"
  | "standUp"
  | "jump"
  | "land"
  | "farJumpPrep"
  | "farJumpTakeoff"
  | "farJumpLand"
  | "recovery"
  | "leanLeft"
  | "leanRight"
  | "capeAdjust"
  | "warmUp"
  | "celebrate"
  | "heroPose"
  | "frontDoubleBiceps"
  | "chestFlex"
  | "strongmanPose"
  | "postureReset"
  | "walk"
  | "yawn"
  | "stretch"
  | "recoverNeutral"
  | "talk";

export interface MotionVariation {
  speed: number;
  duration: number;
  breathingStrength: number;
  headTilt: number;
  armEmphasis: number;
  pauseTiming: number;
  mirrored: boolean;
  torsoSway: number;
  shoulderLift: number;
  stepAmplitude: number;
  weightShift: number;
}

export interface PoseValues {
  headRot: number;
  neckRot: number;
  chestScale: number;
  chestY: number;
  abdomenRot: number;
  pelvisRot: number;
  leftArmRot: number;
  rightArmRot: number;
  leftForearmRot: number;
  rightForearmRot: number;
  leftThighRot: number;
  rightThighRot: number;
  leftShinRot: number;
  rightShinRot: number;
  leftFootRot: number;
  rightFootRot: number;
  weightShiftX: number;
  torsoRot: number;
  capeRot: number;
}
