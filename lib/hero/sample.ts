export type Rng = () => number;

/**
 * Recorre un buffer RGBA (el de `getImageData`) con un paso fijo y devuelve las
 * coordenadas de los píxeles opacos: son las posiciones de los glifos del nombre.
 */
export function sampleMask(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  gap: number,
  threshold = 128,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const step = Math.max(1, Math.floor(gap));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (rgba[(y * width + x) * 4 + 3] > threshold) out.push([x, y]);
    }
  }
  return out;
}

/**
 * Elige los glifos "hallazgo" del escaneo: uno por franja horizontal del nombre
 * (con un 4 % de margen en cada borde de franja) para que queden repartidos.
 * Devuelve índices ordenados de izquierda a derecha.
 */
export function pickFindings(xs: readonly number[], excluded: readonly boolean[], n: number, rand: Rng): number[] {
  const candidates = xs
    .map((_, i) => i)
    .filter((i) => !excluded[i])
    .sort((a, b) => xs[a] - xs[b]);
  if (candidates.length <= n) return candidates;
  const picks: number[] = [];
  for (let q = 0; q < n; q++) {
    const lo = Math.floor(candidates.length * (q / n + 0.04));
    const hi = Math.max(lo + 1, Math.floor(candidates.length * ((q + 1) / n - 0.04)));
    picks.push(candidates[Math.min(candidates.length - 1, lo + Math.floor(rand() * (hi - lo)))]);
  }
  return picks;
}

/** Fisher–Yates sobre una copia. */
export function shuffle<T>(items: readonly T[], rand: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
