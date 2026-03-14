"use client";

/**
 * HeroRig - Assembles the 908 SVG parts from /mascot/hero-parts/ into a rigged character.
 * Parts are grouped into: head, torso, leftArm, rightArm, leftLeg, rightLeg, cape.
 * Pose values drive per-region transforms for leg-driven locomotion and life motion.
 */

import { useMemo } from "react";
import { getPartsByRegion, REGION_ORDER, type RegionKey } from "./heroPartsConfig";
import type { PoseValues } from "./mascotPoses";

const BASE_PATH = "/mascot/hero-parts";
const VIEW_WIDTH = 418;
const VIEW_HEIGHT = 500;

interface HeroRigProps {
  pose: PoseValues;
  facing: "left" | "right";
}

export default function HeroRig({ pose, facing }: HeroRigProps) {
  const partsByRegion = useMemo(() => getPartsByRegion(), []);

  const scaleX = facing === "left" ? -1 : 1;

  const getGroupTransform = (region: RegionKey): string => {
    const flip = facing === "left" ? -1 : 1;
    const cx = VIEW_WIDTH / 2;
    const cy = VIEW_HEIGHT * 0.85;

    switch (region) {
      case "head":
        return `translate(${cx},${cy - 120}) rotate(${pose.headRot * flip}deg) translate(${-cx},${-(cy - 120)})`;
      case "torso":
        return `translate(${pose.weightShiftX * flip},${pose.torsoY}) scale(${pose.breathScale})`;
      case "leftArm":
        return `translate(${cx},${cy - 180}) rotate(${pose.leftArmRot * flip}deg) translate(${-cx},${-(cy - 180)})`;
      case "rightArm":
        return `translate(${cx},${cy - 180}) rotate(${pose.rightArmRot * flip}deg) translate(${-cx},${-(cy - 180)})`;
      case "leftLeg":
        return `translate(${cx},${cy - 50}) rotate(${pose.leftLegRot * flip}deg) translate(${-cx},${-(cy - 50)})`;
      case "rightLeg":
        return `translate(${cx},${cy - 50}) rotate(${pose.rightLegRot * flip}deg) translate(${-cx},${-(cy - 50)})`;
      case "cape":
        return `translate(${cx},${cy - 100}) rotate(${pose.capeRot * flip}deg) translate(${-cx},${-(cy - 100)})`;
      default:
        return "";
    }
  };

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMax meet"
      className="w-full h-full object-contain"
      style={{
        transform: `scaleX(${scaleX})`,
        transformOrigin: "center bottom",
      }}
    >
      {REGION_ORDER.map((region) => (
        <g key={region} transform={getGroupTransform(region)}>
          {partsByRegion.get(region)!.map((idx) => (
            <image
              key={idx}
              href={`${BASE_PATH}/Vector-${idx}.svg`}
              x={0}
              y={0}
              width={VIEW_WIDTH}
              height={VIEW_HEIGHT}
              preserveAspectRatio="xMidYMid slice"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
