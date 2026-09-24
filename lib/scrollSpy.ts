export interface SectionTop {
  id: string;
  /** Borde superior de la sección respecto al viewport (getBoundingClientRect().top). */
  top: number;
}

/**
 * Sección activa del TOC: la última cuyo borde superior ya cruzó la línea de lectura
 * (`offset` px desde arriba). Antes de la primera, la primera; al fondo de la página, la
 * última (las secciones cortas del final nunca llegarían a cruzar la línea).
 */
export function pickActive(tops: readonly SectionTop[], offset: number, atBottom = false): string {
  if (tops.length === 0) return "";
  if (atBottom) return tops[tops.length - 1].id;
  let current = tops[0].id;
  for (const t of tops) {
    if (t.top <= offset) current = t.id;
    else break;
  }
  return current;
}
