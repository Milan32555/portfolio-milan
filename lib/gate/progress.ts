/** Porcentaje de la barra al terminar cada etapa real de carga. */
export const GATE_STAGES = { fonts: 25, three: 55, scene: 82, ready: 100 } as const;
export type GateStage = keyof typeof GATE_STAGES;

export interface StageEvent {
  stage: GateStage;
  label: string;
}

/** La barra nunca se completa antes de esto: el log tiene que alcanzar a leerse. */
export const GATE_MIN_MS = 1700;

/**
 * Un cuadro de la barra: se acerca suave a lo realmente cargado, sin superar
 * nunca lo cargado ni el tope de tiempo mínimo. Con movimiento reducido, salta.
 */
export function stepProgress(displayed: number, target: number, elapsedMs: number, reduced: boolean): number {
  const cap = reduced ? 100 : Math.min(100, (elapsedMs / GATE_MIN_MS) * 100);
  const goal = Math.min(target, cap);
  if (reduced) return goal;
  if (cap >= target && target - displayed < 0.4) return target;
  return displayed + (goal - displayed) * 0.12;
}

/** Opacidad de un glifo del muro: base tenue, más si ya "cargó", más si el cursor está cerca. */
export function wallAlpha(lit: boolean, near: number, light: boolean): number {
  const base = light ? 0.1 : 0.07;
  const litBoost = lit ? (light ? 0.16 : 0.13) : 0;
  return Math.min(0.85, base + litBoost + near * 0.55);
}
