"use client";

/**
 * MascotRenderer - Transparent character with motion engine.
 * Visual source: file-2.svg ONLY. No fallback.
 * Applies breathing, head tilt, facing, walk rhythm to the character.
 */

import { useEffect, useState } from "react";
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

  let torsoY = 0;
  let headRot = variation.headTilt * (variation.mirrored ? -1 : 1) * 0.5;
  let breathScale = 1;
  let capeRot = 0;

  if (isWalking) {
    const p = getWalkPose(walkFrame, amp);
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
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          transform: [
            `scaleX(${facing === "left" ? -1 : 1})`,
            `translateY(${torsoY}px)`,
            `rotate(${headRot}deg)`,
            `rotate(${capeRot}deg)`,
            `scale(${breathScale})`,
          ].join(" "),
          transformOrigin: "center bottom",
        }}
      >
        <img
          src="/mascot/file-2.svg"
          alt=""
          className="w-full h-full object-contain"
          style={{
            objectPosition: "center bottom",
          }}
        />
      </div>
    </div>
  );
}
