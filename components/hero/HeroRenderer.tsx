"use client";

/**
 * HeroRenderer - Uses HeroRig (25 inline SVG parts) as the only mascot visual.
 * Leg-driven locomotion, chest breathing, NO external assets.
 */

import { useEffect, useState } from "react";
import { getWalkPose, getPoseForAction } from "./heroMotion";
import type { MotionVariation } from "./heroState";
import type { BaseAction } from "./heroState";
import HeroRig from "./HeroRig";

interface HeroRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: MotionVariation;
  mood: string;
}

export default function HeroRenderer({
  facing,
  action,
  walkFrame,
  variation,
  mood,
}: HeroRendererProps) {
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
  const moodMod = mood === "athletic" || mood === "proud" ? 1.1 : mood === "tired" ? 0.9 : 1;
  const amp = variation.stepAmplitude * moodMod;

  const pose = isWalking
    ? getWalkPose(walkFrame, amp)
    : getPoseForAction(action as BaseAction, phase, {
        ...variation,
        breathingStrength: variation.breathingStrength * moodMod,
      });

  return (
    <div
      className="relative w-full h-full flex items-end justify-center"
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
    >
      <div className="relative w-full h-full flex items-end justify-center">
        <HeroRig pose={pose} facing={facing} />
      </div>
    </div>
  );
}
