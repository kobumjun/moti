"use client";

/**
 * RobotRig - Assembles 20 parts into a simple premium humanoid robot.
 * Normal silhouette: 1 head, 2 arms, 2 legs, 1 torso.
 */

import { PARTS, PARTS_DRAW_ORDER, VIEW_WIDTH, VIEW_HEIGHT } from "./robotRigParts";
import type { PoseValues } from "./robotState";

interface RobotRigProps {
  pose: PoseValues;
  facing: "left" | "right";
}

const flip = (v: number, f: boolean) => (f ? -v : v);

function getTransform(partId: string, pose: PoseValues, facing: "left" | "right"): string {
  const f = facing === "left";
  const p = PARTS[partId as keyof typeof PARTS];
  if (!p) return "";
  const { pivotX, pivotY } = p;
  const t = (x: number, y: number) => `translate(${x},${y})`;
  const r = (deg: number) => `rotate(${flip(deg, f)})`;
  const s = (n: number) => `scale(${n})`;
  const piv = t(pivotX, pivotY);
  const unpiv = t(-pivotX, -pivotY);

  switch (partId) {
    case "head":
    case "visor":
      return `${piv} ${r(pose.headRot)} ${unpiv}`;
    case "neck":
      return `${piv} ${r(pose.neckRot)} ${unpiv}`;
    case "upper_torso":
    case "lower_torso":
      return `${t(pose.weightShiftX, pose.torsoY)} ${piv} ${s(pose.torsoScale)} ${r(pose.torsoRot)} ${unpiv}`;
    case "pelvis":
      return `${t(pose.weightShiftX, 0)} ${piv} ${r(pose.pelvisRot)} ${unpiv}`;
    case "left_upper_arm":
      return `${piv} ${r(pose.leftArmRot)} ${unpiv}`;
    case "left_forearm":
    case "left_hand":
      return `${piv} ${r(pose.leftForearmRot + pose.leftArmRot)} ${unpiv}`;
    case "right_upper_arm":
      return `${piv} ${r(pose.rightArmRot)} ${unpiv}`;
    case "right_forearm":
    case "right_hand":
      return `${piv} ${r(pose.rightForearmRot + pose.rightArmRot)} ${unpiv}`;
    case "left_thigh":
      return `${t(pose.weightShiftX, 0)} ${piv} ${r(pose.leftThighRot)} ${unpiv}`;
    case "left_shin":
      return `${piv} ${r(pose.leftShinRot + pose.leftThighRot)} ${unpiv}`;
    case "left_foot":
      return `${piv} ${r(pose.leftFootRot + pose.leftShinRot + pose.leftThighRot)} ${unpiv}`;
    case "right_thigh":
      return `${t(pose.weightShiftX, 0)} ${piv} ${r(pose.rightThighRot)} ${unpiv}`;
    case "right_shin":
      return `${piv} ${r(pose.rightShinRot + pose.rightThighRot)} ${unpiv}`;
    case "right_foot":
      return `${piv} ${r(pose.rightFootRot + pose.rightShinRot + pose.rightThighRot)} ${unpiv}`;
    default:
      return t(pose.weightShiftX, 0);
  }
}

export default function RobotRig({ pose, facing }: RobotRigProps) {
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
        const opacity = id === "visor" ? pose.visorOpacity : 1;
        return (
          <g key={id} transform={getTransform(id, pose, facing)}>
            <path d={part.path} fill={part.fill} opacity={opacity} />
          </g>
        );
      })}
    </svg>
  );
}
