"use client";

/**
 * RobotRig - Skeletal hierarchy: root > torso > (head | left_arm | right_arm | left_leg | right_leg)
 * Each limb: upper segments parent to lower (e.g. upper_arm > forearm > hand).
 * Pivots at joints: shoulder, elbow, wrist, hip, knee, ankle.
 */

import { PARTS, VIEW_WIDTH, VIEW_HEIGHT, JOINTS } from "./robotRigParts";
import type { PoseValues } from "./robotState";

interface RobotRigProps {
  pose: PoseValues;
  facing: "left" | "right";
}

const flip = (v: number, f: boolean) => (f ? -v : v);

function rotAt(cx: number, cy: number, deg: number, flipX: boolean): string {
  const d = flip(deg, flipX);
  return `translate(${cx},${cy}) rotate(${d}) translate(${-cx},${-cy})`;
}
function scaleAt(cx: number, cy: number, s: number): string {
  return `translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})`;
}

export default function RobotRig({ pose, facing }: RobotRigProps) {
  const f = facing === "left";
  const { torso, head } = JOINTS;
  const { leftShoulder, leftElbow, leftWrist, rightShoulder, rightElbow, rightWrist } = JOINTS;
  const { leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle } = JOINTS;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMax meet"
      className="w-full h-full"
      style={{
        transform: `scaleX(${f ? -1 : 1})`,
        transformOrigin: "center bottom",
      }}
    >
      {/* root: weight shift */}
      <g transform={`translate(${pose.weightShiftX},${pose.torsoY})`}>
        {/* torso: scale + rotate around hip */}
        <g transform={`${scaleAt(torso.x, torso.y, pose.torsoScale)} ${rotAt(torso.x, torso.y, pose.torsoRot, f)}`}>
          {/* legs first (behind torso) */}
          <g transform={rotAt(leftHip.x, leftHip.y, pose.leftThighRot, f)}>
            <path d={PARTS.left_thigh.path} fill={PARTS.left_thigh.fill} />
            <g transform={rotAt(leftKnee.x, leftKnee.y, pose.leftShinRot, f)}>
              <path d={PARTS.left_shin.path} fill={PARTS.left_shin.fill} />
              <g transform={rotAt(leftAnkle.x, leftAnkle.y, pose.leftFootRot, f)}>
                <path d={PARTS.left_foot.path} fill={PARTS.left_foot.fill} />
              </g>
            </g>
          </g>
          <g transform={rotAt(rightHip.x, rightHip.y, pose.rightThighRot, f)}>
            <path d={PARTS.right_thigh.path} fill={PARTS.right_thigh.fill} />
            <g transform={rotAt(rightKnee.x, rightKnee.y, pose.rightShinRot, f)}>
              <path d={PARTS.right_shin.path} fill={PARTS.right_shin.fill} />
              <g transform={rotAt(rightAnkle.x, rightAnkle.y, pose.rightFootRot, f)}>
                <path d={PARTS.right_foot.path} fill={PARTS.right_foot.fill} />
              </g>
            </g>
          </g>
          {/* torso mesh */}
          <g transform={rotAt(torso.x, torso.y, pose.pelvisRot, f)}>
            <path d={PARTS.pelvis.path} fill={PARTS.pelvis.fill} />
          </g>
          <path d={PARTS.lower_torso.path} fill={PARTS.lower_torso.fill} />
          <path d={PARTS.upper_torso.path} fill={PARTS.upper_torso.fill} />
          <path d={PARTS.neck.path} fill={PARTS.neck.fill} />

          {/* head (pivot at neck) */}
          <g transform={rotAt(head.x, head.y, pose.headRot, f)}>
            <path d={PARTS.head.path} fill={PARTS.head.fill} />
            <path d={PARTS.visor.path} fill={PARTS.visor.fill} opacity={pose.visorOpacity} />
          </g>

          {/* left arm: shoulder > elbow > wrist */}
          <g transform={rotAt(leftShoulder.x, leftShoulder.y, pose.leftArmRot, f)}>
            <path d={PARTS.left_upper_arm.path} fill={PARTS.left_upper_arm.fill} />
            <g transform={rotAt(leftElbow.x, leftElbow.y, pose.leftForearmRot, f)}>
              <path d={PARTS.left_forearm.path} fill={PARTS.left_forearm.fill} />
              <g transform={rotAt(leftWrist.x, leftWrist.y, 0, false)}>
                <path d={PARTS.left_hand.path} fill={PARTS.left_hand.fill} />
              </g>
            </g>
          </g>

          {/* right arm */}
          <g transform={rotAt(rightShoulder.x, rightShoulder.y, pose.rightArmRot, f)}>
            <path d={PARTS.right_upper_arm.path} fill={PARTS.right_upper_arm.fill} />
            <g transform={rotAt(rightElbow.x, rightElbow.y, pose.rightForearmRot, f)}>
              <path d={PARTS.right_forearm.path} fill={PARTS.right_forearm.fill} />
              <g transform={rotAt(rightWrist.x, rightWrist.y, 0, false)}>
                <path d={PARTS.right_hand.path} fill={PARTS.right_hand.fill} />
              </g>
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
}
