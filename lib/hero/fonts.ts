/**
 * Primera familia de una pila CSS. next/font agrega un respaldo con `local("Arial")` o
 * `local("Times New Roman")`, que Android no trae: `document.fonts.load` con la pila
 * completa rechaza apenas falla ese respaldo, antes de que termine de bajar la fuente real.
 */
export function primaryFamily(stack: string, generic = "serif"): string {
  const first = stack.split(",")[0].trim();
  return first || generic;
}
