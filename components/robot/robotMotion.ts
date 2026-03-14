/**
 * robotMotion - pose calculation and 300+ variation system
 */

import type { BaseAction, MotionVariation } from "./robotState";
import type { PoseValues } from "./robotState";

const SPEED_OPTIONS = [0.72, 0.9, 1.05, 1.2];
const DURATION_OPTIONS = [0.8, 1, 1.15, 1.28];
const PULSE_OPTIONS = [0.5, 0.8, 1, 1.2];
const HEAD_TILT_OPTIONS = [-8, -4, 0, 4, 8];
const ARM_EMPHASIS_OPTIONS = [0.8, 1, 1.2];
const TORSO_SWAY_OPTIONS = [0.5, 1, 1.2];
const STEP_AMPLITUDE_OPTIONS = [0.85, 1, 1.15];

let variationIndex = 0;

function getSeed(action: BaseAction): number {
  let h = 0;
  for (let i = 0; i < action.length; i++) h = (h << 5) - h + action.charCodeAt(i);
  return Math.abs(h) >>> 0;
}

export function pickVariation(action: BaseAction): MotionVariation {
  const seed = getSeed(action);
  const idx = (variationIndex + seed) % 300;
  variationIndex++;
  return {
    speed: SPEED_OPTIONS[idx % SPEED_OPTIONS.length]!,
    duration: DURATION_OPTIONS[Math.floor(idx / 4) % DURATION_OPTIONS.length]!,
    pulseStrength: PULSE_OPTIONS[Math.floor(idx / 16) % PULSE_OPTIONS.length]!,
    headTilt: HEAD_TILT_OPTIONS[Math.floor(idx / 64) % HEAD_TILT_OPTIONS.length]!,
    armEmphasis: ARM_EMPHASIS_OPTIONS[idx % ARM_EMPHASIS_OPTIONS.length]!,
    pauseTiming: 1,
    mirrored: (idx + seed) % 2 === 0,
    torsoSway: TORSO_SWAY_OPTIONS[(idx + 1) % TORSO_SWAY_OPTIONS.length]!,
    stepAmplitude: STEP_AMPLITUDE_OPTIONS[(idx + 2) % STEP_AMPLITUDE_OPTIONS.length]!,
    weightShift: 1,
  };
}

export function getWalkPose(frame: number, amp: number): PoseValues {
  const f = frame % 8;
  const step = 10 * amp;
  const armSwing = 16 * amp;
  const wx = 1.2 * amp;
  const cycle: Partial<PoseValues>[] = [
    { leftThighRot: step, rightThighRot: -step, leftArmRot: -armSwing, rightArmRot: armSwing, weightShiftX: -wx, headRot: -0.2, backPanelRot: -0.8 },
    { leftThighRot: step * 0.6, rightThighRot: -step, leftArmRot: -armSwing * 0.6, rightArmRot: armSwing, weightShiftX: 0, headRot: 0, backPanelRot: 0 },
    { leftThighRot: -step * 0.3, rightThighRot: -step * 0.5, leftArmRot: armSwing * 0.3, rightArmRot: armSwing * 0.5, weightShiftX: wx, headRot: 0.15, backPanelRot: 0.6 },
    { leftThighRot: -step, rightThighRot: step * 0.3, leftArmRot: armSwing, rightArmRot: -armSwing * 0.3, weightShiftX: 0, headRot: 0, backPanelRot: 0 },
    { leftThighRot: -step, rightThighRot: step, leftArmRot: armSwing, rightArmRot: -armSwing, weightShiftX: wx, headRot: 0.2, backPanelRot: 0.8 },
    { leftThighRot: -step * 0.6, rightThighRot: step, leftArmRot: armSwing * 0.6, rightArmRot: -armSwing, weightShiftX: 0, headRot: 0, backPanelRot: 0 },
    { leftThighRot: step * 0.3, rightThighRot: step * 0.5, leftArmRot: -armSwing * 0.3, rightArmRot: -armSwing * 0.5, weightShiftX: -wx, headRot: -0.15, backPanelRot: -0.6 },
    { leftThighRot: step, rightThighRot: -step * 0.3, leftArmRot: -armSwing, rightArmRot: armSwing * 0.3, weightShiftX: 0, headRot: 0, backPanelRot: 0 },
  ];
  const p = cycle[f]!;
  return {
    headRot: p.headRot ?? 0,
    neckRot: 0,
    torsoScale: 1,
    torsoY: 0,
    pelvisRot: (p.weightShiftX ?? 0) * 0.25,
    leftArmRot: p.leftArmRot ?? 0,
    rightArmRot: p.rightArmRot ?? 0,
    leftForearmRot: 0,
    rightForearmRot: 0,
    leftThighRot: p.leftThighRot ?? 0,
    rightThighRot: p.rightThighRot ?? 0,
    leftShinRot: (p.leftThighRot ?? 0) * 0.35,
    rightShinRot: (p.rightThighRot ?? 0) * 0.35,
    leftFootRot: (p.leftThighRot ?? 0) * 0.15,
    rightFootRot: (p.rightThighRot ?? 0) * 0.15,
    weightShiftX: p.weightShiftX ?? 0,
    torsoRot: (p.weightShiftX ?? 0) * -0.15,
    backPanelRot: p.backPanelRot ?? 0,
    visorOpacity: 1,
  };
}

const ZERO: PoseValues = {
  headRot: 0, neckRot: 0, torsoScale: 1, torsoY: 0, pelvisRot: 0,
  leftArmRot: 0, rightArmRot: 0, leftForearmRot: 0, rightForearmRot: 0,
  leftThighRot: 0, rightThighRot: 0, leftShinRot: 0, rightShinRot: 0,
  leftFootRot: 0, rightFootRot: 0, weightShiftX: 0, torsoRot: 0,
  backPanelRot: 0, visorOpacity: 1,
};

export function getPoseForAction(action: BaseAction, phase: number, v: MotionVariation): PoseValues {
  if (action === "walk") return getWalkPose(0, 1);
  const m = v.mirrored ? -1 : 1;
  const ht = v.headTilt * m * 0.4;
  const pulse = 1 + Math.sin(phase) * 0.015 * v.pulseStrength;
  const panel = Math.sin(phase * 0.5) * 1 * v.torsoSway;
  const weightIdle = Math.sin(phase * 0.35) * 1.2 * v.torsoSway;
  const arm = v.armEmphasis;
  const blink = Math.sin(phase * 0.3) > 0.7 ? 0.4 : 1;

  const poses: Record<string, Partial<PoseValues>> = {
    idlePulse: { weightShiftX: weightIdle, headRot: ht, torsoScale: pulse, backPanelRot: panel, leftArmRot: -5, rightArmRot: 5, visorOpacity: blink },
    blink: { weightShiftX: weightIdle, headRot: ht, torsoScale: pulse, visorOpacity: 0.5 },
    lookLeft: { headRot: -5 + ht, torsoScale: pulse, backPanelRot: panel, leftArmRot: -7, rightArmRot: 7 },
    lookRight: { headRot: 5 + ht, torsoScale: pulse, backPanelRot: panel, leftArmRot: -7, rightArmRot: 7 },
    lookUp: { headRot: -4 + ht, torsoScale: pulse },
    lookDown: { headRot: 4 + ht, torsoScale: pulse },
    nod: { headRot: Math.sin(phase * 2) * 3 + ht, torsoScale: pulse },
    shakeHead: { headRot: Math.sin(phase * 3) * 4 + ht, torsoScale: pulse },
    weightShift: { weightShiftX: weightIdle, headRot: ht, torsoScale: pulse, backPanelRot: panel },
    crossArms: { leftArmRot: 52, rightArmRot: -52, headRot: ht, torsoScale: pulse },
    handsOnWaist: { leftArmRot: 42, rightArmRot: -42, headRot: 2 + ht, torsoScale: pulse },
    point: { leftArmRot: -48, rightArmRot: 52, headRot: 4 + ht, torsoScale: pulse },
    clap: { leftArmRot: -18, rightArmRot: 18, headRot: ht, torsoScale: pulse },
    wave: { leftArmRot: -12, rightArmRot: Math.sin(phase * 5) * 32, headRot: 3 + ht, torsoScale: pulse },
    inspect: { leftArmRot: 18, rightArmRot: -32, headRot: -5 + ht, torsoScale: pulse },
    think: { leftArmRot: 38, rightArmRot: -48, headRot: 2 + ht, torsoScale: pulse },
    chinTouch: { leftArmRot: 48, rightArmRot: -55, headRot: -2 + ht, torsoScale: pulse },
    scratchHead: { leftArmRot: 55, rightArmRot: -12, headRot: 3 + ht, torsoScale: pulse },
    suspiciousLook: { headRot: Math.sin(phase * 0.7) * 6 + ht, torsoScale: pulse },
    proudStance: { leftThighRot: -6, rightThighRot: 6, leftArmRot: -38, rightArmRot: 38, torsoScale: pulse * 1.01, headRot: 4 + ht, backPanelRot: panel + 1 },
    boredStance: { leftArmRot: 12, rightArmRot: 12, headRot: -2 + ht, torsoScale: pulse * 0.99 },
    tiredStance: { leftThighRot: 2, rightThighRot: 2, leftArmRot: 18, rightArmRot: 18, torsoScale: pulse * 0.98, headRot: -3 + ht },
    readyStance: { leftThighRot: -4, rightThighRot: 4, leftArmRot: -32, rightArmRot: 32, headRot: 2 + ht, torsoScale: pulse },
    slightCrouch: { leftThighRot: 12, rightThighRot: 12, leftArmRot: -18, rightArmRot: 18, headRot: 1 + ht, torsoScale: pulse },
    sit: { leftThighRot: 42, rightThighRot: 42, leftArmRot: -8, rightArmRot: 8, headRot: ht, torsoScale: pulse },
    seatedIdle: { leftThighRot: 44, rightThighRot: 44, leftArmRot: -6, rightArmRot: 6, headRot: Math.sin(phase * 0.5) * 1.5 + ht, torsoScale: pulse },
    standUp: { leftThighRot: 18, rightThighRot: 18, leftArmRot: -12, rightArmRot: 12, headRot: ht, torsoScale: pulse },
    jump: { leftThighRot: -22, rightThighRot: -22, leftArmRot: -45, rightArmRot: 45, headRot: 3 + ht, backPanelRot: panel + 3 },
    land: { leftThighRot: 8, rightThighRot: 8, leftArmRot: -28, rightArmRot: 28, headRot: -1 + ht },
    farJumpPrep: { leftThighRot: 22, rightThighRot: 22, leftArmRot: -18, rightArmRot: 18, headRot: ht },
    farJumpTakeoff: { leftThighRot: -28, rightThighRot: -28, leftArmRot: -50, rightArmRot: 50, headRot: 4 + ht, backPanelRot: panel + 4 },
    farJumpLand: { leftThighRot: 12, rightThighRot: 12, leftArmRot: -22, rightArmRot: 22, headRot: -2 + ht },
    recovery: { weightShiftX: weightIdle, headRot: ht, torsoScale: pulse },
    leanLeft: { leftThighRot: 4, rightThighRot: -4, leftArmRot: -8, rightArmRot: 12, headRot: -3 + ht, torsoScale: pulse },
    leanRight: { leftThighRot: -4, rightThighRot: 4, leftArmRot: -12, rightArmRot: 8, headRot: 3 + ht, torsoScale: pulse },
    warmUp: { leftArmRot: Math.sin(phase) * 24 * arm, rightArmRot: Math.sin(phase + 0.5) * 24 * arm, headRot: ht, torsoScale: pulse },
    celebrate: { leftThighRot: -4, rightThighRot: 4, leftArmRot: -50, rightArmRot: 50, torsoScale: pulse * 1.02, headRot: 4 + ht },
    heroPose: { leftThighRot: -5, rightThighRot: 5, leftArmRot: -50 * arm, rightArmRot: 50 * arm, torsoScale: pulse * 1.01, headRot: 3 + ht, backPanelRot: panel + 2 },
    postureReset: { weightShiftX: 0, headRot: ht, torsoScale: pulse },
    recoverNeutral: { weightShiftX: weightIdle, headRot: ht, torsoScale: pulse, backPanelRot: panel },
    talk: { leftArmRot: Math.sin(phase * 4) * 12, rightArmRot: Math.sin(phase * 4 + 0.3) * 12, headRot: ht, torsoScale: pulse },
  };

  const base = poses[action] ?? poses.idlePulse ?? {};
  const out: PoseValues = { ...ZERO, ...base };
  if (base.weightShiftX === undefined) out.weightShiftX = weightIdle;
  if (base.headRot === undefined) out.headRot = ht;
  if (base.visorOpacity === undefined) out.visorOpacity = blink;
  return out;
}
