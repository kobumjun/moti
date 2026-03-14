/**
 * robotState - state machine, moods, base actions, motion variation
 */

export type RobotMood =
  | "idle"
  | "walking"
  | "stopping"
  | "proud"
  | "thinking"
  | "focused"
  | "playful"
  | "bored"
  | "tired"
  | "reacting"
  | "seated"
  | "airborne"
  | "landing"
  | "recovery";

export type BaseAction =
  | "idlePulse"
  | "blink"
  | "lookLeft"
  | "lookRight"
  | "lookUp"
  | "lookDown"
  | "nod"
  | "shakeHead"
  | "weightShift"
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
  | "warmUp"
  | "celebrate"
  | "heroPose"
  | "postureReset"
  | "walk"
  | "recoverNeutral"
  | "talk";

export interface MotionVariation {
  speed: number;
  duration: number;
  pulseStrength: number;
  headTilt: number;
  armEmphasis: number;
  pauseTiming: number;
  mirrored: boolean;
  torsoSway: number;
  stepAmplitude: number;
  weightShift: number;
}

export interface PoseValues {
  headRot: number;
  neckRot: number;
  torsoScale: number;
  torsoY: number;
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
  backPanelRot: number;
  visorOpacity: number;
}
