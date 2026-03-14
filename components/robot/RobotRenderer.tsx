"use client";

/**
 * RobotRenderer - Renders RobotRig with pose and phase.
 */

import { useEffect, useState } from "react";
import { getWalkPose, getPoseForAction } from "./robotMotion";
import type { MotionVariation } from "./robotState";
import type { BaseAction } from "./robotState";
import RobotRig from "./RobotRig";

interface RobotRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: MotionVariation;
  mood: string;
}

export default function RobotRenderer({
  facing,
  action,
  walkFrame,
  variation,
  mood,
}: RobotRendererProps) {
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
  const moodMod = mood === "proud" || mood === "focused" ? 1.05 : mood === "tired" ? 0.92 : 1;
  const amp = variation.stepAmplitude * moodMod;

  const pose = isWalking
    ? getWalkPose(walkFrame, amp)
    : getPoseForAction(action as BaseAction, phase, { ...variation, pulseStrength: variation.pulseStrength * moodMod });

  return (
    <div className="relative w-full h-full flex items-end justify-center" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }}>
      <div className="relative w-full h-full flex items-end justify-center">
        <RobotRig pose={pose} facing={facing} />
      </div>
    </div>
  );
}
