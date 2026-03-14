"use client";

/**
 * MascotRenderer - Leg-driven character with rigged MascotCharacter
 * Real walk cycle: contact, passing, push, settle. No body-bobbing.
 * Visual: rigged character for leg/arm animation. Uses file-2.svg styling via MascotCharacter.
 */

import { useEffect, useState } from "react";
import MascotCharacter from "./MascotCharacter";
import { getWalkPose, getPoseForAction } from "./mascotPoses";
import type { MotionVariation } from "./mascotState";
import type { BaseAction } from "./mascotState";

interface MascotRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: MotionVariation;
  mood: string;
}

export default function MascotRenderer({
  facing,
  action,
  walkFrame,
  variation,
  mood,
}: MascotRendererProps) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setPhase((p) => p + 0.016 * 0.8);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isWalking = action === "walk";
  const moodMod = mood === "excited" ? 1.15 : mood === "tired" ? 0.85 : 1;
  const amp = variation.stepAmplitude * moodMod;

  let pose: { leftLegRot: number; rightLegRot: number; leftArmRot: number; rightArmRot: number; torsoY: number; headRot: number; breathScale: number; capeRot: number };

  if (isWalking) {
    pose = getWalkPose(walkFrame, amp);
  } else {
    pose = getPoseForAction(action as BaseAction, phase, {
      headTilt: variation.headTilt,
      breathingStrength: variation.breathingStrength * moodMod,
      torsoSway: variation.torsoSway,
      armEmphasis: variation.armEmphasis,
      mirrored: variation.mirrored,
    });
  }

  return (
    <div
      className="relative w-full h-full"
      style={{
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
      }}
    >
      <MascotCharacter
        leftLegRot={pose.leftLegRot}
        rightLegRot={pose.rightLegRot}
        leftArmRot={pose.leftArmRot}
        rightArmRot={pose.rightArmRot}
        torsoY={pose.torsoY}
        headRot={pose.headRot}
        breathScale={pose.breathScale}
        capeRot={pose.capeRot}
        facing={facing}
      />
    </div>
  );
}
