"use client";

/**
 * MascotRenderer - Uses HeroRig (908 SVG parts from /mascot/hero-parts/) as the only mascot visual.
 * Motion engine drives per-region transforms. Leg-driven locomotion. NO file-2.svg, NO fallback.
 */

import { useEffect, useState } from "react";
import { getWalkPose, getPoseForAction } from "./mascotPoses";
import type { MotionVariation } from "./mascotState";
import type { BaseAction } from "./mascotState";
import HeroRig from "./HeroRig";

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

  const pose = isWalking
    ? getWalkPose(walkFrame, amp)
    : getPoseForAction(action as BaseAction, phase, {
        headTilt: variation.headTilt,
        breathingStrength: variation.breathingStrength * moodMod,
        torsoSway: variation.torsoSway,
        armEmphasis: variation.armEmphasis,
        mirrored: variation.mirrored,
      });

  return (
    <div
      className="relative w-full h-full flex items-end justify-center"
      style={{
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
      }}
    >
      <div className="relative w-full h-full flex items-end justify-center">
        <HeroRig pose={pose} facing={facing} />
      </div>
    </div>
  );
}
