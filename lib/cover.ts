/** PRNG pequeño y determinista (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido de valor 1D suave, sembrado. */
export function valueNoise(seed: number): (x: number) => number {
  const rand = mulberry32(seed);
  const table = Array.from({ length: 256 }, rand);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[i & 255];
    const b = table[(i + 1) & 255];
    const t = f * f * (3 - 2 * f);
    return a + (b - a) * t;
  };
}

/** Tono estable por proyecto, en el rango azul-verdoso 185..230. */
export function hueFor(slug: string): number {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 185 + (h % 46);
}

export interface CoverLayer {
  /** Atributo `d` de un `<path>` cerrado. */
  d: string;
  fill: string;
  /** Si la capa lleva la trama de puntos (halftone) en la cresta. */
  dots: boolean;
}

const SPECS = [
  { base: 0.55, amp: 0.32, light: 30 },
  { base: 0.68, amp: 0.28, light: 21 },
  { base: 0.8, amp: 0.24, light: 13 },
] as const;

/** Tres cordilleras superpuestas (de fondo a frente), deterministas por semilla. */
export function coverLayers(seed: number, width: number, height: number, hue: number): CoverLayer[] {
  const noise = valueNoise(seed);
  return SPECS.map(({ base, amp, light }, li) => {
    let d = `M-40 ${height + 10} L-40 ${(height * base).toFixed(1)}`;
    for (let x = -40; x <= width + 40; x += 6) {
      const y = height * base - (noise(x * 0.006 + li * 13) * 0.7 + noise(x * 0.014 + li * 5) * 0.3) * height * amp;
      d += ` L${x} ${y.toFixed(1)}`;
    }
    d += ` L${width + 40} ${height + 10} Z`;
    return { d, fill: `hsl(${hue} 45% ${light}%)`, dots: li < 2 };
  });
}
