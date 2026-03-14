"use client";

/**
 * MascotRenderer - Layered living mascot with breathing, sway, walk bounce
 * No box, no thumbnail feel. Mascot exists directly on the page.
 * Uses file-2.svg as the only visual asset.
 */

import "./mascotAnimations.css";
import type { MotionVariation } from "./mascotState";

interface MascotRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: MotionVariation;
  mood: string;
}

/** Walk bounce: frames 0,2 = contact (low), 1,3 = pass (high) - syncs with step cycle */
function getWalkBounceY(frame: number, amplitude: number): number {
  const isUp = frame === 1 || frame === 3;
  return isUp ? -8 * amplitude : 0;
}

export default function MascotRenderer({
  facing,
  action,
  walkFrame,
  variation,
  mood,
}: MascotRendererProps) {
  const isWalking = action === "walk";
  const bounceY = isWalking ? getWalkBounceY(walkFrame, variation.stepAmplitude) : 0;
  const headTilt = variation.headTilt * (variation.mirrored ? -1 : 1);

  const moodMod = mood === "excited" ? 1.2 : mood === "tired" ? 0.7 : mood === "playful" ? 1.1 : 1;

  return (
    <div
      className="relative w-full h-full overflow-visible"
      style={
        {
          "--breath": variation.breathingStrength * moodMod,
          "--breath-duration": 1 / variation.speed,
          "--sway": variation.torsoSway * moodMod,
          "--sway-duration": variation.pauseTiming,
          "--weight": variation.weightShift * moodMod,
          "--weight-duration": variation.pauseTiming,
        } as React.CSSProperties
      }
    >
      {/* Layer 1: Weight shift - subtle horizontal drift when idle */}
      <div
        className={`absolute inset-0 w-full h-full flex items-end justify-center ${!isWalking ? "mascot-weight-shift" : ""}`}
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Layer 2: Sway - torso micro-movement */}
        <div
          className={`absolute inset-0 w-full h-full flex items-end justify-center ${!isWalking ? "mascot-sway" : ""}`}
          style={{ transformOrigin: "center bottom" }}
        >
          {/* Layer 3: Breathing - chest expansion/contraction */}
          <div
            className="absolute inset-0 w-full h-full flex items-end justify-center mascot-breathe"
            style={{ transformOrigin: "center bottom" }}
          >
            {/* Layer 4: Walk bounce - vertical bob synced with step */}
            <div
              className="absolute inset-0 w-full h-full flex items-end justify-center transition-transform duration-75 ease-out"
              style={{
                transform: `translateY(${bounceY}px)`,
                transformOrigin: "center bottom",
              }}
            >
              {/* Layer 5: Head tilt - from variation */}
              <div
                className="absolute inset-0 w-full h-full flex items-end justify-center transition-transform duration-200"
                style={{
                  transform: `rotate(${headTilt}deg)`,
                  transformOrigin: "center 85%",
                }}
              >
                {/* Layer 6: Facing direction */}
                <div
                  className="relative w-full h-full"
                  style={{
                    transform: facing === "left" ? "scaleX(-1)" : "scaleX(1)",
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src="/mascot/file-2.svg"
                    alt=""
                    className="w-full h-full object-contain"
                    style={{
                      objectPosition: "center bottom",
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
