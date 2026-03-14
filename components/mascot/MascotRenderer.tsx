"use client";

/**
 * DEPRECATED - Old mascot renderer. Disabled.
 * Use HeroEngine and HeroRenderer from @/components/hero instead.
 */

interface MascotRendererProps {
  facing: "left" | "right";
  action: string;
  walkFrame: number;
  variation: unknown;
  mood: string;
}

export default function MascotRenderer(_props: MascotRendererProps) {
  return null;
}
