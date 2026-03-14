/**
 * heroMotion - pose calculation and 300+ variation system
 * Base actions × timing/amplitude/mood → effective motion library
 */

import type { BaseAction, MotionVariation } from "./heroState";
import type { PoseValues } from "./heroState";

const SPEED_OPTIONS = [0.72, 0.9, 1.05, 1.2];
const DURATION_OPTIONS = [0.8, 1, 1.15, 1.28];
const BREATHING_OPTIONS = [0.5, 0.78, 1, 1.18];
const HEAD_TILT_OPTIONS = [-9, -4, 0, 4, 9];
const ARM_EMPHASIS_OPTIONS = [0.78, 1, 1.22];
const TORSO_SWAY_OPTIONS = [0.55, 1, 1.2];
const STEP_AMPLITUDE_OPTIONS = [0.82, 1, 1.18];
const WEIGHT_SHIFT_OPTIONS = [0.65, 0.9, 1];

let variationIndex = 0;

function getVariationSeed(action: BaseAction): number {
  let h = 0;
  for (let i = 0; i < action.length; i++) h = (h << 5) - h + action.charCodeAt(i);
  return Math.abs(h) >>> 0;
}

export function pickVariation(action: BaseAction): MotionVariation {
  const seed = getVariationSeed(action);
  const idx = (variationIndex + seed) % 324;
  variationIndex++;
  return {
    speed: SPEED_OPTIONS[idx % SPEED_OPTIONS.length]!,
    duration: DURATION_OPTIONS[Math.floor(idx / 4) % DURATION_OPTIONS.length]!,
    breathingStrength: BREATHING_OPTIONS[Math.floor(idx / 16) % BREATHING_OPTIONS.length]!,
    headTilt: HEAD_TILT_OPTIONS[Math.floor(idx / 64) % HEAD_TILT_OPTIONS.length]!,
    armEmphasis: ARM_EMPHASIS_OPTIONS[idx % ARM_EMPHASIS_OPTIONS.length]!,
    pauseTiming: 1,
    mirrored: (idx + seed) % 2 === 0,
    torsoSway: TORSO_SWAY_OPTIONS[(idx + 1) % TORSO_SWAY_OPTIONS.length]!,
    shoulderLift: 1,
    stepAmplitude: STEP_AMPLITUDE_OPTIONS[(idx + 2) % STEP_AMPLITUDE_OPTIONS.length]!,
    weightShift: WEIGHT_SHIFT_OPTIONS[(idx + 3) % WEIGHT_SHIFT_OPTIONS.length]!,
  };
}

/** 8-phase walk cycle - leg-driven, alternating legs, arm swing opposite, hip shift, grounded */
export function getWalkPose(frame: number, amp: number): PoseValues {
  const f = frame % 8;
  const step = 12 * amp;
  const armSwing = 18 * amp;
  const wx = 1.5 * amp;
  const cycle: Partial<PoseValues>[] = [
    { leftThighRot: step, rightThighRot: -step, leftArmRot: -armSwing, rightArmRot: armSwing, weightShiftX: -wx, headRot: -0.3, capeRot: -1.5 },
    { leftThighRot: step * 0.6, rightThighRot: -step, leftArmRot: -armSwing * 0.6, rightArmRot: armSwing, weightShiftX: 0, headRot: 0, capeRot: 0 },
    { leftThighRot: -step * 0.3, rightThighRot: -step * 0.5, leftArmRot: armSwing * 0.3, rightArmRot: armSwing * 0.5, weightShiftX: wx, headRot: 0.2, capeRot: 1 },
    { leftThighRot: -step, rightThighRot: step * 0.3, leftArmRot: armSwing, rightArmRot: -armSwing * 0.3, weightShiftX: 0, headRot: 0, capeRot: 0 },
    { leftThighRot: -step, rightThighRot: step, leftArmRot: armSwing, rightArmRot: -armSwing, weightShiftX: wx, headRot: 0.3, capeRot: 1.5 },
    { leftThighRot: -step * 0.6, rightThighRot: step, leftArmRot: armSwing * 0.6, rightArmRot: -armSwing, weightShiftX: 0, headRot: 0, capeRot: 0 },
    { leftThighRot: step * 0.3, rightThighRot: step * 0.5, leftArmRot: -armSwing * 0.3, rightArmRot: -armSwing * 0.5, weightShiftX: -wx, headRot: -0.2, capeRot: -1 },
    { leftThighRot: step, rightThighRot: -step * 0.3, leftArmRot: -armSwing, rightArmRot: armSwing * 0.3, weightShiftX: 0, headRot: 0, capeRot: 0 },
  ];
  const p = cycle[f]!;
  const breath = 1 + Math.sin(f * 0.8) * 0.008;
  return {
    headRot: p.headRot ?? 0,
    neckRot: 0,
    chestScale: breath,
    chestY: 0,
    abdomenRot: 0,
    pelvisRot: (p.weightShiftX ?? 0) * 0.3,
    leftArmRot: p.leftArmRot ?? 0,
    rightArmRot: p.rightArmRot ?? 0,
    leftForearmRot: 0,
    rightForearmRot: 0,
    leftThighRot: p.leftThighRot ?? 0,
    rightThighRot: p.rightThighRot ?? 0,
    leftShinRot: (p.leftThighRot ?? 0) * 0.4,
    rightShinRot: (p.rightThighRot ?? 0) * 0.4,
    leftFootRot: (p.leftThighRot ?? 0) * 0.2,
    rightFootRot: (p.rightThighRot ?? 0) * 0.2,
    weightShiftX: p.weightShiftX ?? 0,
    torsoRot: (p.weightShiftX ?? 0) * -0.2,
    capeRot: p.capeRot ?? 0,
  };
}

const ZERO_POSE: PoseValues = {
  headRot: 0,
  neckRot: 0,
  chestScale: 1,
  chestY: 0,
  abdomenRot: 0,
  pelvisRot: 0,
  leftArmRot: 0,
  rightArmRot: 0,
  leftForearmRot: 0,
  rightForearmRot: 0,
  leftThighRot: 0,
  rightThighRot: 0,
  leftShinRot: 0,
  rightShinRot: 0,
  leftFootRot: 0,
  rightFootRot: 0,
  weightShiftX: 0,
  torsoRot: 0,
  capeRot: 0,
};

export function getPoseForAction(
  action: BaseAction,
  phase: number,
  variation: MotionVariation
): PoseValues {
  if (action === "walk") return getWalkPose(0, 1);
  const m = variation.mirrored ? -1 : 1;
  const ht = variation.headTilt * m * 0.5;
  const breath = 1 + Math.sin(phase) * 0.02 * variation.breathingStrength;
  const cape = Math.sin(phase * 0.5) * 1.5 * variation.torsoSway;
  const weightIdle = Math.sin(phase * 0.35) * 1.5 * variation.torsoSway;
  const arm = variation.armEmphasis;

  const poses: Record<string, Partial<PoseValues>> = {
    idleBreathing: { weightShiftX: weightIdle, headRot: ht, chestScale: breath, capeRot: cape, leftArmRot: -6, rightArmRot: 6 },
    blink: { weightShiftX: weightIdle, headRot: ht, chestScale: breath, capeRot: cape },
    lookLeft: { headRot: -6 + ht, chestScale: breath, capeRot: cape, leftArmRot: -8, rightArmRot: 8 },
    lookRight: { headRot: 6 + ht, chestScale: breath, capeRot: cape, leftArmRot: -8, rightArmRot: 8 },
    lookUp: { headRot: -4 + ht, chestScale: breath, capeRot: cape },
    lookDown: { headRot: 4 + ht, chestScale: breath, capeRot: cape },
    nod: { headRot: Math.sin(phase * 2) * 4 + ht, chestScale: breath, capeRot: cape },
    shakeHead: { headRot: Math.sin(phase * 3) * 5 + ht, chestScale: breath, capeRot: cape },
    weightShift: { weightShiftX: weightIdle, headRot: ht, chestScale: breath, capeRot: cape },
    chestStretch: { chestScale: breath * 1.03, leftArmRot: -30, rightArmRot: 30, headRot: 2 + ht, capeRot: cape },
    shoulderRoll: { leftArmRot: Math.sin(phase * 1.5) * 22 * arm, rightArmRot: Math.sin(phase * 1.5 + 1) * 22 * arm, headRot: ht, chestScale: breath, capeRot: cape },
    crossArms: { leftArmRot: 55, rightArmRot: -55, headRot: ht, chestScale: breath, capeRot: cape },
    handsOnWaist: { leftArmRot: 45, rightArmRot: -45, headRot: 2 + ht, chestScale: breath, capeRot: cape },
    point: { leftArmRot: -50, rightArmRot: 55, headRot: 4 + ht, chestScale: breath, capeRot: cape },
    clap: { leftArmRot: -20, rightArmRot: 20, headRot: ht, chestScale: breath, capeRot: Math.sin(phase * 4) * 3 },
    wave: { leftArmRot: -15, rightArmRot: Math.sin(phase * 5) * 35, headRot: 3 + ht, chestScale: breath, capeRot: cape },
    inspect: { leftArmRot: 20, rightArmRot: -35, headRot: -5 + ht, chestScale: breath, capeRot: cape },
    think: { leftArmRot: 40, rightArmRot: -50, headRot: 2 + ht, chestScale: breath, capeRot: cape },
    chinTouch: { leftArmRot: 50, rightArmRot: -60, headRot: -2 + ht, chestScale: breath, capeRot: cape },
    scratchHead: { leftArmRot: 60, rightArmRot: -15, headRot: 3 + ht, chestScale: breath, capeRot: cape },
    suspiciousLook: { headRot: Math.sin(phase * 0.8) * 8 + ht, chestScale: breath, capeRot: cape },
    proudStance: { leftThighRot: -8, rightThighRot: 8, leftArmRot: -40, rightArmRot: 40, chestScale: breath * 1.02, headRot: 5 + ht, capeRot: cape + 2 },
    boredStance: { leftArmRot: 15, rightArmRot: 15, headRot: -2 + ht, chestScale: breath * 0.98, capeRot: cape },
    tiredStance: { leftThighRot: 3, rightThighRot: 3, leftArmRot: 20, rightArmRot: 20, chestScale: breath * 0.98, headRot: -3 + ht, capeRot: cape },
    readyStance: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -35, rightArmRot: 35, chestScale: breath, headRot: 2 + ht, capeRot: cape },
    slightCrouch: { leftThighRot: 15, rightThighRot: 15, leftArmRot: -20, rightArmRot: 20, chestScale: breath, headRot: 1 + ht, capeRot: cape },
    sit: { leftThighRot: 45, rightThighRot: 45, leftArmRot: -10, rightArmRot: 10, chestScale: breath, headRot: ht, capeRot: cape },
    seatedIdle: { leftThighRot: 48, rightThighRot: 48, leftArmRot: -8, rightArmRot: 8, headRot: Math.sin(phase * 0.5) * 2 + ht, chestScale: breath, capeRot: cape },
    standUp: { leftThighRot: 20, rightThighRot: 20, leftArmRot: -15, rightArmRot: 15, headRot: ht, chestScale: breath, capeRot: cape },
    jump: { leftThighRot: -25, rightThighRot: -25, leftArmRot: -50, rightArmRot: 50, chestScale: breath, headRot: 3 + ht, capeRot: cape + 4 },
    smallJump: { leftThighRot: -15, rightThighRot: -15, leftArmRot: -40, rightArmRot: 40, chestScale: breath, headRot: 2 + ht, capeRot: cape + 2 },
    land: { leftThighRot: 10, rightThighRot: 10, leftArmRot: -30, rightArmRot: 30, chestScale: breath, headRot: -1 + ht, capeRot: cape },
    farJumpPrep: { leftThighRot: 25, rightThighRot: 25, leftArmRot: -20, rightArmRot: 20, headRot: ht, chestScale: breath, capeRot: cape },
    farJumpTakeoff: { leftThighRot: -30, rightThighRot: -30, leftArmRot: -55, rightArmRot: 55, chestScale: breath, headRot: 4 + ht, capeRot: cape + 5 },
    farJumpLand: { leftThighRot: 15, rightThighRot: 15, leftArmRot: -25, rightArmRot: 25, headRot: -2 + ht, chestScale: breath, capeRot: cape },
    recovery: { weightShiftX: weightIdle, headRot: ht, chestScale: breath, capeRot: cape },
    leanLeft: { leftThighRot: 5, rightThighRot: -5, leftArmRot: -10, rightArmRot: 15, headRot: -4 + ht, chestScale: breath, capeRot: cape },
    leanRight: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -15, rightArmRot: 10, headRot: 4 + ht, chestScale: breath, capeRot: cape },
    capeAdjust: { leftArmRot: 25, rightArmRot: -30, headRot: -2 + ht, chestScale: breath, capeRot: Math.sin(phase) * 4 },
    warmUp: { leftArmRot: Math.sin(phase) * 28 * arm, rightArmRot: Math.sin(phase + 0.5) * 28 * arm, headRot: ht, chestScale: breath, capeRot: cape },
    celebrate: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -55, rightArmRot: 55, chestScale: breath * 1.03, headRot: 5 + ht, capeRot: cape + Math.sin(phase * 3) * 2 },
    heroPose: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -55 * arm, rightArmRot: 55 * arm, chestScale: breath * 1.02, headRot: 3 + ht, capeRot: cape + 3 },
    frontDoubleBiceps: { leftThighRot: -10, rightThighRot: 10, leftArmRot: -70, rightArmRot: 70, chestScale: breath * 1.02, headRot: 4 + ht, capeRot: cape + 2 },
    chestFlex: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -35, rightArmRot: -35, chestScale: breath * 1.03, headRot: 3 + ht, capeRot: cape },
    strongmanPose: { leftThighRot: -8, rightThighRot: 8, leftArmRot: -50, rightArmRot: -50, chestScale: breath * 1.01, headRot: 3 + ht, capeRot: cape },
    postureReset: { weightShiftX: 0, headRot: ht, chestScale: breath, capeRot: cape },
    yawn: { leftArmRot: -35, rightArmRot: 35, chestScale: breath * 1.04, headRot: -3 + ht, capeRot: cape },
    stretch: { leftArmRot: -45 * arm, rightArmRot: 45 * arm, chestScale: breath * 1.02, headRot: 2 + ht, capeRot: cape },
    recoverNeutral: { weightShiftX: weightIdle, headRot: ht, chestScale: breath, capeRot: cape },
    talk: { leftArmRot: Math.sin(phase * 4) * 15, rightArmRot: Math.sin(phase * 4 + 0.3) * 15, headRot: ht, chestScale: breath, capeRot: cape },
  };

  const base = poses[action] ?? poses.idleBreathing ?? {};
  const out: PoseValues = { ...ZERO_POSE, ...base };
  if (base.weightShiftX === undefined) out.weightShiftX = weightIdle;
  if (base.headRot === undefined) out.headRot = ht;
  return out;
}
