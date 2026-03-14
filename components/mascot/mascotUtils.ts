/**
 * mascotUtils - transform helpers, body part origins
 * SVG viewBox 0 0 72 110 - center x=36, bottom y=110
 */

export const ORIGINS = {
  head: { x: 36, y: 20 },
  torso: { x: 36, y: 54 },
  leftArm: { x: 24, y: 54 },
  rightArm: { x: 48, y: 54 },
  leftLeg: { x: 30, y: 90 },
  rightLeg: { x: 42, y: 90 },
  cape: { x: 36, y: 48 },
} as const;

export function toCSSTransform(
  x: number,
  y: number,
  rotate: number,
  originX: number,
  originY: number,
  scale = 1
): string {
  return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
}

export function getOriginStyle(part: keyof typeof ORIGINS): React.CSSProperties {
  const o = ORIGINS[part];
  return { transformOrigin: `${o.x}px ${o.y}px` };
}
