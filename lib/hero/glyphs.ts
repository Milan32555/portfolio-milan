/** Los 32 caracteres de código con los que se dibujan el nombre, el polvo y el muro. */
export const GLYPHS = "{}<>/;=()[]$#*&|!?01:+-_%@~^.,'`";

/** Atlas: una textura de 8×4 celdas de 64 px, una por glifo. */
export const ATLAS = { cols: 8, rows: 4, cell: 64 } as const;
export const GLYPH_COUNT = ATLAS.cols * ATLAS.rows;

/** Índice del glifo que muestra un hallazgo mientras el escáner lo marca. */
export const BUG_GLYPH = GLYPHS.indexOf("!");

export const NAME_BASE = "Misael";
export const NAME_TEXT = `${NAME_BASE}.`;

/** El easter egg: escribir `whoami` reordena el código en este texto. */
export const EGG_WORD = "whoami";
export const EGG_TEXT = "/sobre-mi →";

export function atlasCell(index: number): { col: number; row: number } {
  const k = ((index % GLYPH_COUNT) + GLYPH_COUNT) % GLYPH_COUNT;
  return { col: k % ATLAS.cols, row: Math.floor(k / ATLAS.cols) };
}
