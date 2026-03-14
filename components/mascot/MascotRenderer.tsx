"use client";

/**
 * MascotRenderer - Uses FULL ORIGINAL file-2.svg as the only mascot visual.
 * Motion engine drives wrapper transforms (breathing, facing, head tilt, walk rhythm).
 * NO reconstructed character. NO fallback. ONLY file-2.svg.
 */

import { useEffect, useState } from "react";
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
      className="relative w-full h-full flex items-end justify-center"
      style={{
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
      }}
    >
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          transform: [
            `scaleX(${facing === "left" ? -1 : 1})`,
            `translateY(${pose.torsoY}px)`,
            `rotate(${pose.headRot}deg)`,
            `rotate(${pose.capeRot}deg)`,
            `scale(${pose.breathScale})`,
          ].join(" "),
          transformOrigin: "center bottom",
        }}
      >
        <img
          src="/mascot/file-2.svg"
          alt=""
          className="w-full h-full object-contain"
          style={{ objectPosition: "center bottom" }}
        />
      </div>
    </div>
  );
}
