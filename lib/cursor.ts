/** Elementos sobre los que el resplandor crece. Se detectan con closest() en cada movimiento (delegación). */
export const INTERACTIVE_SELECTOR =
  "a[href], button, input, select, textarea, summary, label[for], [role='button'], [data-cursor]";

/** Fracción del camino que el resplandor recorre por cuadro: J3 = 0.22; con movimiento reducido, todo. */
export function followFactor(reduced: boolean): number {
  return reduced ? 1 : 0.22;
}

export function glowScale(hovering: boolean): number {
  return hovering ? 1.4 : 1;
}

/** Un paso de interpolación lineal de `current` hacia `target`. */
export function approach(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}
