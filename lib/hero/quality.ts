export const QUALITY_KEY = "heroQuality";
export const MIN_FPS = 45;

export type Quality = "normal" | "low";

export interface QualitySettings {
  /** Multiplica la separación entre glifos del nombre (más separación = menos glifos). */
  spacingScale: number;
  pixelRatioCap: number;
  /** Glifos de "polvo" en profundidad. */
  dust: number;
}

export function decideQuality(fps: number): Quality {
  return fps < MIN_FPS ? "low" : "normal";
}

export function parseCachedQuality(value: string | null): Quality | null {
  return value === "normal" || value === "low" ? value : null;
}

export function qualitySettings(quality: Quality, width: number): QualitySettings {
  const narrow = width < 600;
  if (quality === "low") return { spacingScale: narrow ? 1.08 : 1.25, pixelRatioCap: 1, dust: narrow ? 60 : 160 };
  return { spacingScale: 1, pixelRatioCap: 1.5, dust: narrow ? 180 : 420 };
}
