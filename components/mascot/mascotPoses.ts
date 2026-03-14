/**
 * mascotPoses - body transform values for each action
 * Drives the rigged MascotCharacter for leg/arm/torso/head
 */

import type { BaseAction } from "./mascotState";

export interface PoseValues {
  leftLegRot: number;
  rightLegRot: number;
  leftArmRot: number;
  rightArmRot: number;
  torsoY: number;
  headRot: number;
  breathScale: number;
  capeRot: number;
}

/** 8-phase walk cycle: contact, passing, push, settle (x2 for both legs) */
export function getWalkPose(frame: number, amp: number): PoseValues {
  const f = frame % 8;
  const step = 14 * amp;
  const armSwing = 20 * amp;
  const cycle = [
    { leftLeg: step, rightLeg: -step, leftArm: -armSwing, rightArm: armSwing, torsoY: 0, head: -0.3, cape: -1.5 },
    { leftLeg: step * 0.5, rightLeg: -step, leftArm: -armSwing * 0.5, rightArm: armSwing, torsoY: 1, head: 0, cape: 0 },
    { leftLeg: -step * 0.3, rightLeg: -step * 0.5, leftArm: armSwing * 0.3, rightArm: armSwing * 0.5, torsoY: 1.5, head: 0.2, cape: 1 },
    { leftLeg: -step, rightLeg: step * 0.3, leftArm: armSwing, rightArm: -armSwing * 0.3, torsoY: 0.5, head: 0, cape: 0 },
    { leftLeg: -step, rightLeg: step, leftArm: armSwing, rightArm: -armSwing, torsoY: 0, head: 0.3, cape: 1.5 },
    { leftLeg: -step * 0.5, rightLeg: step, leftArm: armSwing * 0.5, rightArm: -armSwing, torsoY: 1, head: 0, cape: 0 },
    { leftLeg: step * 0.3, rightLeg: step * 0.5, leftArm: -armSwing * 0.3, rightArm: -armSwing * 0.5, torsoY: 1.5, head: -0.2, cape: -1 },
    { leftLeg: step, rightLeg: -step * 0.3, leftArm: -armSwing, rightArm: armSwing * 0.3, torsoY: 0.5, head: 0, cape: 0 },
  ];
  const p = cycle[f]!;
  return {
    leftLegRot: p.leftLeg,
    rightLegRot: p.rightLeg,
    leftArmRot: p.leftArm,
    rightArmRot: p.rightArm,
    torsoY: p.torsoY,
    headRot: p.head,
    breathScale: 1,
    capeRot: p.cape,
  };
}

/** Idle/pose transforms - headRot/breathScale get multiplied by variation */
export function getPoseForAction(
  action: BaseAction,
  phase: number,
  variation: { headTilt: number; breathingStrength: number; torsoSway: number; armEmphasis: number; mirrored: boolean }
): PoseValues {
  const m = variation.mirrored ? -1 : 1;
  const ht = variation.headTilt * m * 0.5;
  const breath = 1 + Math.sin(phase) * 0.015 * variation.breathingStrength;
  const cape = Math.sin(phase * 0.5) * 1.5 * variation.torsoSway;
  const arm = variation.armEmphasis;

  const poses: Record<BaseAction, Partial<PoseValues>> = {
    idleBreathing: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    blink: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    lookLeft: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -8, rightArmRot: 8, torsoY: 0, headRot: -6 + ht, breathScale: breath, capeRot: cape },
    lookRight: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -8, rightArmRot: 8, torsoY: 0, headRot: 6 + ht, breathScale: breath, capeRot: cape },
    lookUp: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: -4 + ht, breathScale: breath, capeRot: cape },
    lookDown: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: 4 + ht, breathScale: breath, capeRot: cape },
    nod: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: Math.sin(phase * 2) * 4 + ht, breathScale: breath, capeRot: cape },
    shakeHead: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: Math.sin(phase * 3) * 5 + ht, breathScale: breath, capeRot: cape },
    walk: { breathScale: 1 },
    stretch: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -45 * arm, rightArmRot: 45 * arm, torsoY: -2, headRot: 2 + ht, breathScale: breath * 1.02, capeRot: cape },
    shoulderRoll: { leftLegRot: 0, rightLegRot: 0, leftArmRot: Math.sin(phase * 1.5) * 25 * arm, rightArmRot: Math.sin(phase * 1.5 + 1) * 25 * arm, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    yawn: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -35, rightArmRot: 35, torsoY: -1, headRot: -3 + ht, breathScale: breath * 1.03, capeRot: cape },
    crossArms: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 55, rightArmRot: -55, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    handsOnWaist: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 45, rightArmRot: -45, torsoY: 0, headRot: 2 + ht, breathScale: breath, capeRot: cape },
    heroPose: { leftLegRot: -5, rightLegRot: 5, leftArmRot: -55 * arm, rightArmRot: 55 * arm, torsoY: -1, headRot: 3 + ht, breathScale: breath * 1.02, capeRot: cape + 3 },
    inspect: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 20, rightArmRot: -35, torsoY: 0, headRot: -5 + ht, breathScale: breath, capeRot: cape },
    think: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 40, rightArmRot: -50, torsoY: 0, headRot: 2 + ht, breathScale: breath, capeRot: cape },
    chinTouch: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 50, rightArmRot: -60, torsoY: 0, headRot: -2 + ht, breathScale: breath, capeRot: cape },
    scratchHead: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 60, rightArmRot: -15, torsoY: 0, headRot: 3 + ht, breathScale: breath, capeRot: cape },
    point: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -50, rightArmRot: 55, torsoY: 0, headRot: 4 + ht, breathScale: breath, capeRot: cape },
    clap: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -20, rightArmRot: 20, torsoY: 0, headRot: ht, breathScale: breath, capeRot: Math.sin(phase * 4) * 3 },
    wave: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -15, rightArmRot: Math.sin(phase * 5) * 35, torsoY: 0, headRot: 3 + ht, breathScale: breath, capeRot: cape },
    smallJump: { leftLegRot: -15, rightLegRot: -15, leftArmRot: -40, rightArmRot: 40, torsoY: -4, headRot: 2 + ht, breathScale: breath, capeRot: cape + 2 },
    stepBack: { leftLegRot: -20, rightLegRot: 10, leftArmRot: -25, rightArmRot: 25, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    stepForward: { leftLegRot: 15, rightLegRot: -15, leftArmRot: -20, rightArmRot: 20, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    leanLeft: { leftLegRot: 5, rightLegRot: -5, leftArmRot: -10, rightArmRot: 15, torsoY: 0, headRot: -4 + ht, breathScale: breath, capeRot: cape },
    leanRight: { leftLegRot: -5, rightLegRot: 5, leftArmRot: -15, rightArmRot: 10, torsoY: 0, headRot: 4 + ht, breathScale: breath, capeRot: cape },
    proudStance: { leftLegRot: -8, rightLegRot: 8, leftArmRot: -40, rightArmRot: 40, torsoY: -1, headRot: 5 + ht, breathScale: breath * 1.02, capeRot: cape + 2 },
    tiredStance: { leftLegRot: 3, rightLegRot: 3, leftArmRot: 20, rightArmRot: 20, torsoY: 1, headRot: -3 + ht, breathScale: breath * 0.98, capeRot: cape },
    shrug: { leftLegRot: 0, rightLegRot: 0, leftArmRot: Math.sin(phase * 2) * 30, rightArmRot: Math.sin(phase * 2) * 30, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    peekFromEdge: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 15, rightArmRot: -25, torsoY: -2, headRot: -8 + ht, breathScale: breath, capeRot: cape },
    lookAroundSuspicious: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -10, rightArmRot: 10, torsoY: 0, headRot: Math.sin(phase * 0.8) * 8 + ht, breathScale: breath, capeRot: cape },
    readyStance: { leftLegRot: -5, rightLegRot: 5, leftArmRot: -35, rightArmRot: 35, torsoY: -0.5, headRot: 2 + ht, breathScale: breath, capeRot: cape },
    warmUp: { leftLegRot: 0, rightLegRot: 0, leftArmRot: Math.sin(phase) * 30 * arm, rightArmRot: Math.sin(phase + 0.5) * 30 * arm, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    neckLoosen: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: Math.sin(phase * 1.2) * 6 + ht, breathScale: breath, capeRot: cape },
    glanceAround: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -8, rightArmRot: 8, torsoY: 0, headRot: Math.sin(phase * 0.6) * 5 + ht, breathScale: breath, capeRot: cape },
    subtleReaction: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -15, rightArmRot: 15, torsoY: 0, headRot: 2 + ht, breathScale: breath, capeRot: cape },
    slightCrouch: { leftLegRot: 15, rightLegRot: 15, leftArmRot: -20, rightArmRot: 20, torsoY: 3, headRot: 1 + ht, breathScale: breath, capeRot: cape },
    recoverNeutral: { leftLegRot: 0, rightLegRot: 0, leftArmRot: -5, rightArmRot: 5, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    capeAdjust: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 25, rightArmRot: -30, torsoY: 0, headRot: -2 + ht, breathScale: breath, capeRot: Math.sin(phase) * 4 },
    talk: { leftLegRot: 0, rightLegRot: 0, leftArmRot: Math.sin(phase * 4) * 15, rightArmRot: Math.sin(phase * 4 + 0.3) * 15, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    facepalm: { leftLegRot: 0, rightLegRot: 0, leftArmRot: 55, rightArmRot: -20, torsoY: 0, headRot: -2 + ht, breathScale: breath, capeRot: cape },
    celebrate: { leftLegRot: -5, rightLegRot: 5, leftArmRot: -55, rightArmRot: 55, torsoY: -2, headRot: 5 + ht, breathScale: breath * 1.03, capeRot: cape + Math.sin(phase * 3) * 2 },
    frontDoubleBiceps: { leftLegRot: -10, rightLegRot: 10, leftArmRot: -70, rightArmRot: 70, torsoY: -2, headRot: 4 + ht, breathScale: breath * 1.02, capeRot: cape + 2 },
    latsSpread: { leftLegRot: -8, rightLegRot: 8, leftArmRot: -50, rightArmRot: -50, torsoY: -1, headRot: 3 + ht, breathScale: breath * 1.01, capeRot: cape },
    armShakeOut: { leftLegRot: 0, rightLegRot: 0, leftArmRot: Math.sin(phase * 6) * 25, rightArmRot: Math.sin(phase * 6 + 1) * 25, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
    chestFlex: { leftLegRot: -5, rightLegRot: 5, leftArmRot: -35, rightArmRot: -35, torsoY: -1, headRot: 3 + ht, breathScale: breath * 1.03, capeRot: cape },
    sit: { leftLegRot: 45, rightLegRot: 45, leftArmRot: -10, rightArmRot: 10, torsoY: 8, headRot: ht, breathScale: breath, capeRot: cape },
    seatedIdle: { leftLegRot: 48, rightLegRot: 48, leftArmRot: -8, rightArmRot: 8, torsoY: 8, headRot: Math.sin(phase * 0.5) * 2 + ht, breathScale: breath, capeRot: cape },
    standUp: { leftLegRot: 20, rightLegRot: 20, leftArmRot: -15, rightArmRot: 15, torsoY: 3, headRot: ht, breathScale: breath, capeRot: cape },
    jump: { leftLegRot: -25, rightLegRot: -25, leftArmRot: -50, rightArmRot: 50, torsoY: -8, headRot: 3 + ht, breathScale: breath, capeRot: cape + 4 },
    land: { leftLegRot: 10, rightLegRot: 10, leftArmRot: -30, rightArmRot: 30, torsoY: 2, headRot: -1 + ht, breathScale: breath, capeRot: cape },
    farJumpPrep: { leftLegRot: 25, rightLegRot: 25, leftArmRot: -20, rightArmRot: 20, torsoY: 4, headRot: ht, breathScale: breath, capeRot: cape },
    farJumpTakeoff: { leftLegRot: -30, rightLegRot: -30, leftArmRot: -55, rightArmRot: 55, torsoY: -10, headRot: 4 + ht, breathScale: breath, capeRot: cape + 5 },
    farJumpLand: { leftLegRot: 15, rightLegRot: 15, leftArmRot: -25, rightArmRot: 25, torsoY: 3, headRot: -2 + ht, breathScale: breath, capeRot: cape },
    recoverLanding: { leftLegRot: 5, rightLegRot: 5, leftArmRot: -15, rightArmRot: 15, torsoY: 0, headRot: ht, breathScale: breath, capeRot: cape },
  };

  const base = poses[action] ?? poses.idleBreathing!;
  return {
    leftLegRot: base.leftLegRot ?? 0,
    rightLegRot: base.rightLegRot ?? 0,
    leftArmRot: base.leftArmRot ?? -5,
    rightArmRot: base.rightArmRot ?? 5,
    torsoY: base.torsoY ?? 0,
    headRot: base.headRot ?? ht,
    breathScale: base.breathScale ?? breath,
    capeRot: base.capeRot ?? cape,
  };
}
