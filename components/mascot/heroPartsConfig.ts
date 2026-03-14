/**
 * heroPartsConfig - maps each of the 908 Vector-N.svg parts to animation regions.
 * Edit these ranges to match your character's part layout.
 * Default heuristic: index ranges by typical character stacking order.
 */

export type RegionKey =
  | "cape"
  | "torso"
  | "head"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg";

const REGION_ORDER: RegionKey[] = [
  "cape",
  "leftLeg",
  "rightLeg",
  "torso",
  "leftArm",
  "rightArm",
  "head",
];

export function getRegionForPart(index: number): RegionKey {
  if (index <= 0 || index > 908) return "torso";
  if (index <= 100) return "cape";
  if (index <= 220) return "torso";
  if (index <= 320) return "head";
  if (index <= 420) return "leftArm";
  if (index <= 520) return "rightArm";
  if (index <= 680) return "leftLeg";
  return "rightLeg";
}

export function getPartsByRegion(): Map<RegionKey, number[]> {
  const map = new Map<RegionKey, number[]>();
  for (const r of REGION_ORDER) map.set(r, []);
  for (let i = 1; i <= 908; i++) {
    const r = getRegionForPart(i);
    map.get(r)!.push(i);
  }
  return map;
}

export { REGION_ORDER };
