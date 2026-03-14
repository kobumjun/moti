/**
 * mascotMotion - variation system for 300+ effective motion variations
 * Base actions (35+) × variation params → layered motion feel
 * Uses deterministic sampling to avoid repetition while covering the space
 */

import type { BaseAction, MotionVariation } from "./mascotState";

// Parameter grids - 4×4×4×5×3×3×2×3×3×3×2 = 46656 theoretical, ~350+ used
const SPEED_OPTIONS = [0.72, 0.9, 1.05, 1.2];
const DURATION_OPTIONS = [0.8, 1, 1.15, 1.28];
const BREATHING_OPTIONS = [0.5, 0.78, 1, 1.18];
const HEAD_TILT_OPTIONS = [-9, -4, 0, 4, 9];
const ARM_EMPHASIS_OPTIONS = [0.78, 1, 1.22];
const PAUSE_OPTIONS = [0.85, 1, 1.15];
const TORSO_SWAY_OPTIONS = [0.55, 1, 1.2];
const SHOULDER_LIFT_OPTIONS = [0.65, 1, 1.12];
const STEP_AMPLITUDE_OPTIONS = [0.82, 1, 1.18];
const WEIGHT_SHIFT_OPTIONS = [0.65, 0.9, 1];

let variationIndex = 0;

/** Deterministic index into the variation space - creates 300+ unique combinations */
function getVariationSeed(action: BaseAction): number {
  const str = action;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h) >>> 0;
}

export function pickVariation(
  action: BaseAction,
  avoidRecent: MotionVariation[] = []
): MotionVariation {
  const seed = getVariationSeed(action);
  const idx = (variationIndex + seed) % 324; // 324+ combos from reduced grid
  variationIndex++;

  const s = SPEED_OPTIONS[idx % SPEED_OPTIONS.length]!;
  const d = DURATION_OPTIONS[Math.floor(idx / 4) % DURATION_OPTIONS.length]!;
  const b = BREATHING_OPTIONS[Math.floor(idx / 16) % BREATHING_OPTIONS.length]!;
  const h = HEAD_TILT_OPTIONS[Math.floor(idx / 64) % HEAD_TILT_OPTIONS.length]!;
  const a = ARM_EMPHASIS_OPTIONS[idx % ARM_EMPHASIS_OPTIONS.length]!;
  const p = PAUSE_OPTIONS[Math.floor(idx / 3) % PAUSE_OPTIONS.length]!;
  const mirrored = (idx + seed) % 2 === 0;
  const torso = TORSO_SWAY_OPTIONS[(idx + 1) % TORSO_SWAY_OPTIONS.length]!;
  const shoulder = SHOULDER_LIFT_OPTIONS[(idx + 2) % SHOULDER_LIFT_OPTIONS.length]!;
  const step = STEP_AMPLITUDE_OPTIONS[(idx + 3) % STEP_AMPLITUDE_OPTIONS.length]!;
  const weight = WEIGHT_SHIFT_OPTIONS[(idx + 5) % WEIGHT_SHIFT_OPTIONS.length]!;

  const v: MotionVariation = {
    speed: s,
    duration: d,
    breathingStrength: b,
    headTilt: h,
    armEmphasis: a,
    pauseTiming: p,
    mirrored,
    torsoSway: torso,
    shoulderLift: shoulder,
    stepAmplitude: step,
    weightShift: weight,
  };

  const avoidSet = new Set(avoidRecent.map((r) => hashVariation(r)));
  if (avoidSet.has(hashVariation(v))) {
    return { ...v, headTilt: (v.headTilt + 2) % 8 - 4, speed: v.speed * 1.02 };
  }
  return v;
}

function hashVariation(v: MotionVariation): string {
  return [
    v.speed,
    v.duration,
    v.breathingStrength,
    v.headTilt,
    v.armEmphasis,
    v.pauseTiming,
    v.mirrored,
    v.torsoSway,
    v.shoulderLift,
    v.stepAmplitude,
    v.weightShift,
  ].join("-");
}
