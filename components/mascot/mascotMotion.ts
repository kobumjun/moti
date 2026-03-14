/**
 * mascotMotion - variation system for 300+ effective motion variations
 * Base actions × variations (speed, duration, breathing, headTilt, armEmphasis, pause, mirrored)
 */

import type { BaseAction, MotionVariation } from "./mascotState";

const SPEED_OPTIONS = [0.8, 1, 1.2];
const DURATION_OPTIONS = [0.85, 1, 1.2];
const BREATHING_OPTIONS = [0.6, 1, 1.15];
const HEAD_TILT_OPTIONS = [-6, 0, 6];
const ARM_EMPHASIS_OPTIONS = [0.85, 1.1];
const PAUSE_OPTIONS = [0.9, 1.1];

let variationIndex = 0;

export function pickVariation(
  action: BaseAction,
  avoidRecent: MotionVariation[] = []
): MotionVariation {
  const candidates: MotionVariation[] = [];
  for (const speed of SPEED_OPTIONS) {
    for (const dur of DURATION_OPTIONS) {
      for (const breath of BREATHING_OPTIONS) {
        for (const tilt of HEAD_TILT_OPTIONS) {
          for (const arm of ARM_EMPHASIS_OPTIONS) {
            for (const pause of PAUSE_OPTIONS) {
              for (const mirrored of [false, true]) {
                candidates.push({
                  speed,
                  duration: dur,
                  breathingStrength: breath,
                  headTilt: tilt,
                  armEmphasis: arm,
                  pauseTiming: pause,
                  mirrored,
                });
              }
            }
          }
        }
      }
    }
  }
  const avoidSet = new Set(avoidRecent.map((v) => hashVariation(v)));
  const filtered = candidates.filter((v) => !avoidSet.has(hashVariation(v)));
  const list = filtered.length > 0 ? filtered : candidates;
  variationIndex = (variationIndex + 1) % list.length;
  return list[variationIndex % list.length]!;
}

function hashVariation(v: MotionVariation): string {
  return `${v.speed}-${v.duration}-${v.breathingStrength}-${v.headTilt}-${v.armEmphasis}-${v.pauseTiming}-${v.mirrored}`;
}
