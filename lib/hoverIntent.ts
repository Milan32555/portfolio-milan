/** Milisegundos que el cursor debe permanecer sobre una carpeta antes de abrirla. */
export const HOVER_INTENT_MS = 140;

export interface PointerLike {
  pointerType: string;
  movementX: number;
  movementY: number;
}

/**
 * Un evento cuenta como intención del usuario solo si es un mouse que realmente
 * se movió. Los navegadores disparan eventos sintéticos (movimiento 0) cuando el
 * layout se desplaza bajo un cursor quieto; ignorarlos evita la cascada de aperturas.
 */
export function isRealMouseMove(e: PointerLike): boolean {
  return e.pointerType === "mouse" && (e.movementX !== 0 || e.movementY !== 0);
}
