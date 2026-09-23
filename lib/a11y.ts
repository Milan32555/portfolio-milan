export interface AttrSource {
  getAttribute(name: string): string | null;
}
export type MatchMediaLike = (query: string) => { matches: boolean };

/** Movimiento reducido del sistema O del interruptor del AccessibilityWidget. */
export function motionReduced(root: AttrSource, matchMedia: MatchMediaLike): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-a11y-motion") === "reduced";
}

/** Alto contraste o fuente para dislexia: el nombre se muestra como texto sólido, sin glifos. */
export function heroStaticMode(root: AttrSource): boolean {
  return root.getAttribute("data-a11y-contrast") === "high" || root.getAttribute("data-a11y-dyslexia") === "on";
}

/** ¿Vale la pena cargar la escena 3D? Sin WebGL o con 2 núcleos o menos, hero tipográfico. */
export function hero3dAllowed(hasWebGL: boolean, cores: number | undefined): boolean {
  return hasWebGL && (cores ?? 4) > 2;
}

export type ThemeName = "dark" | "light";

export function themeOf(root: AttrSource): ThemeName {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}
