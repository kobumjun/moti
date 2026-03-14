"use client";

/**
 * HeroRig - Assembles 25 animation-ready SVG parts into a rigged superhero.
 * NO external assets. Leg-driven locomotion, chest breathing, per-limb transforms.
 */

import { PARTS, PARTS_DRAW_ORDER, VIEW_WIDTH, VIEW_HEIGHT } from "./heroRigParts";
import type { PoseValues } from "./heroState";

interface HeroRigProps {
  pose: PoseValues;
  facing: "left" | "right";
}

const flip = (v: number, f: boolean) => (f ? -v : v);

function getPartTransform(
  partId: string,
  pose: PoseValues,
  facing: "left" | "right"
): string {
  const f = facing === "left";
  const p = PARTS[partId as keyof typeof PARTS];
  if (!p) return "";
  const { pivotX, pivotY } = p;
  const t = (x: number, y: number) => `translate(${x},${y})`;
  const r = (deg: number) => `rotate(${flip(deg, f)})`;
  const s = (scale: number) => `scale(${scale})`;

  const piv = t(pivotX, pivotY);
  const unpiv = t(-pivotX, -pivotY);

  switch (partId) {
    case "head":
    case "mask":
    case "hair":
      return `${t(pivotX, pivotY)} ${r(pose.headRot)} ${unpiv}`;
    case "neck":
      return `${t(pivotX, pivotY)} ${r(pose.neckRot)} ${unpiv}`;
    case "upper_chest":
    case "lower_chest":
      return `${t(pose.weightShiftX, pose.chestY)} ${t(pivotX, pivotY)} ${s(pose.chestScale)} ${r(pose.torsoRot)} ${unpiv}`;
    case "abdomen":
      return `${t(pose.weightShiftX, 0)} ${t(pivotX, pivotY)} ${r(pose.abdomenRot)} ${unpiv}`;
    case "pelvis":
      return `${t(pose.weightShiftX, 0)} ${t(pivotX, pivotY)} ${r(pose.pelvisRot)} ${unpiv}`;
    case "cape_upper":
    case "cape_left":
    case "cape_right":
      return `${t(pivotX, pivotY)} ${r(pose.capeRot)} ${unpiv}`;
    case "left_upper_arm":
      return `${t(pivotX, pivotY)} ${r(pose.leftArmRot)} ${unpiv}`;
    case "left_forearm":
      return `${t(pivotX, pivotY)} ${r(pose.leftForearmRot + pose.leftArmRot)} ${unpiv}`;
    case "left_hand":
      return `${t(pivotX, pivotY)} ${r(pose.leftForearmRot + pose.leftArmRot)} ${unpiv}`;
    case "right_upper_arm":
      return `${t(pivotX, pivotY)} ${r(pose.rightArmRot)} ${unpiv}`;
    case "right_forearm":
      return `${t(pivotX, pivotY)} ${r(pose.rightForearmRot + pose.rightArmRot)} ${unpiv}`;
    case "right_hand":
      return `${t(pivotX, pivotY)} ${r(pose.rightForearmRot + pose.rightArmRot)} ${unpiv}`;
    case "left_thigh":
      return `${t(pose.weightShiftX, 0)} ${t(pivotX, pivotY)} ${r(pose.leftThighRot)} ${unpiv}`;
    case "left_shin":
      return `${t(pivotX, pivotY)} ${r(pose.leftShinRot + pose.leftThighRot)} ${unpiv}`;
    case "left_foot":
      return `${t(pivotX, pivotY)} ${r(pose.leftFootRot + pose.leftShinRot + pose.leftThighRot)} ${unpiv}`;
    case "right_thigh":
      return `${t(pose.weightShiftX, 0)} ${t(pivotX, pivotY)} ${r(pose.rightThighRot)} ${unpiv}`;
    case "right_shin":
      return `${t(pivotX, pivotY)} ${r(pose.rightShinRot + pose.rightThighRot)} ${unpiv}`;
    case "right_foot":
      return `${t(pivotX, pivotY)} ${r(pose.rightFootRot + pose.rightShinRot + pose.rightThighRot)} ${unpiv}`;
    case "left_shoulder":
    case "right_shoulder":
      return `${t(pose.weightShiftX, 0)} ${t(pivotX, pivotY)} ${r(pose.torsoRot)} ${unpiv}`;
    default:
      return `${t(pose.weightShiftX, 0)}`;
  }
}

export default function HeroRig({ pose, facing }: HeroRigProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMax meet"
      className="w-full h-full"
      style={{
        transform: `scaleX(${facing === "left" ? -1 : 1})`,
        transformOrigin: "center bottom",
      }}
    >
      {PARTS_DRAW_ORDER.map((id) => {
        const part = PARTS[id];
        if (!part) return null;
        return (
          <g key={id} transform={getPartTransform(id, pose, facing)}>
            <path d={part.path} fill={part.fill} />
          </g>
        );
      })}
    </svg>
  );
}
