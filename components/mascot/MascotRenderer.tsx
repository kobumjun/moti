"use client";

/**
 * MascotRenderer - Transparent character with real walk cycle
 * NO bouncing, NO floating, NO box. Uses rigged MascotCharacter for
 * leg alternation, arm swing, torso rhythm during walk.
 */

import { useEffect, useState } from "react";
import MascotCharacter from "./MascotCharacter";
import type { MotionVariation } from "./mascotState";

interface MascotRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: MotionVariation;
  mood: string;
}

/** Walk cycle: legs alternate, arms counter-swing. Frame 0–3. */
function getWalkPose(frame: number, amp: number) {
  const f = frame % 4;
  const step = 12 * amp;
  const armSwing = 18 * amp;
  return {
    leftLegRot: f === 0 ? step : f === 1 ? -step : f === 2 ? -step : step,
    rightLegRot: f === 0 ? -step : f === 1 ? step : f === 2 ? step : -step,
    leftArmRot: f === 0 ? -armSwing : f === 1 ? armSwing : f === 2 ? armSwing : -armSwing,
    rightArmRot: f === 0 ? armSwing : f === 1 ? -armSwing : f === 2 ? -armSwing : armSwing,
    torsoY: f === 1 || f === 3 ? 1.5 : 0,
    headRot: (f === 0 || f === 2 ? -1 : 1) * 0.5,
    capeRot: (f === 1 || f === 3 ? 1 : -1) * 2,
  };
}

/** Idle breathing - chest scale only, very subtle */
function getIdleBreath(phase: number, strength: number): number {
  return 1 + Math.sin(phase) * 0.012 * strength;
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

  let leftLegRot = 0;
  let rightLegRot = 0;
  let leftArmRot = 0;
  let rightArmRot = 0;
  let torsoY = 0;
  let headRot = variation.headTilt * (variation.mirrored ? -1 : 1) * 0.5;
  let breathScale = 1;
  let capeRot = 0;

  if (isWalking) {
    const p = getWalkPose(walkFrame, amp);
    leftLegRot = p.leftLegRot;
    rightLegRot = p.rightLegRot;
    leftArmRot = p.leftArmRot;
    rightArmRot = p.rightArmRot;
    torsoY = p.torsoY;
    headRot += p.headRot;
    capeRot = p.capeRot;
  } else {
    breathScale = getIdleBreath(phase, variation.breathingStrength * moodMod);
    capeRot = Math.sin(phase * 0.5) * 1.5 * variation.torsoSway;
  }

  return (
    <div
      className="relative w-full h-full"
      style={{
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
      }}
    >
      <MascotCharacter
        leftLegRot={leftLegRot}
        rightLegRot={rightLegRot}
        leftArmRot={leftArmRot}
        rightArmRot={rightArmRot}
        torsoY={torsoY}
        headRot={headRot}
        breathScale={breathScale}
        capeRot={capeRot}
        facing={facing}
      />
    </div>
  );
}
