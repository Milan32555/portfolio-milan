import { mulberry32, valueNoise } from "./cover.ts";

/**
 * Escena del footer "Cordilleras": 5 crestas superpuestas, generadas con ruido
 * sembrado (deterministas) para que el servidor y el cliente calculen exactamente
 * lo mismo sin desajuste de hidratación. Coordenadas en el sistema de la escena:
 * 1440×700 (ancho suficiente para desbordar los lados al recortar el viewBox).
 */
export interface RidgeSpec {
  seed: number;
  base: number;
  amp: number;
  freq: number;
  jag: number;
  color: string;
  /** Opacidad del halftone cerca de la cresta, o null si esta capa no lleva. */
  dots: number | null;
}

export const RIDGES: readonly RidgeSpec[] = [
  { seed: 11, base: 430, amp: 190, freq: 0.0032, jag: 0.5, color: "#263a68", dots: 0.35 },
  { seed: 23, base: 480, amp: 170, freq: 0.0038, jag: 0.52, color: "#1b2c52", dots: 0.4 },
  { seed: 37, base: 590, amp: 115, freq: 0.0045, jag: 0.55, color: "#131f3c", dots: 0.45 },
  { seed: 53, base: 620, amp: 120, freq: 0.0055, jag: 0.55, color: "#0d1630", dots: 0.4 },
  { seed: 71, base: 690, amp: 90, freq: 0.0065, jag: 0.6, color: "#080d1b", dots: null },
];

/** Ruido fractal de 5 octavas: la altura de una cresta en el punto x. */
function heightAt(noise: (x: number) => number, x: number, spec: RidgeSpec): number {
  let v = 0;
  let a = 1;
  let f = spec.freq;
  let t = 0;
  for (let o = 0; o < 5; o++) {
    v += noise(x * f + o * 17) * a;
    t += a;
    a *= spec.jag;
    f *= 2.1;
  }
  return spec.base - (v / t) * spec.amp;
}

/** Altura de una cresta en un punto x concreto (para colocar elementos sobre ella). */
export function ridgeY(spec: RidgeSpec, x: number): number {
  return heightAt(valueNoise(spec.seed), x, spec);
}

/** El `d` de un `<path>` SVG cerrado para una cresta, y su punto más alto (menor y). */
export function ridgePath(spec: RidgeSpec): { d: string; minY: number } {
  const noise = valueNoise(spec.seed);
  let d = `M-60 720 L-60 ${heightAt(noise, -60, spec).toFixed(1)}`;
  let minY = Infinity;
  for (let x = -60; x <= 1500; x += 6) {
    const y = heightAt(noise, x, spec);
    minY = Math.min(minY, y);
    d += ` L${x} ${y.toFixed(1)}`;
  }
  d += " L1500 720 Z";
  return { d, minY };
}

export interface Star {
  x: number;
  y: number;
  r: number;
  delay: number;
}

export function buildStars(seed = 5, count = 120): Star[] {
  const rand = mulberry32(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: rand() * 1440, y: rand() * 1130 - 800, r: 0.6 + rand() * 1.3, delay: rand() * 4 });
  }
  return stars;
}

export interface Window {
  x: number;
  y: number;
}

export interface Firefly {
  x: number;
  y: number;
  duration: number;
  delay: number;
}

/**
 * Ventanas del pueblo lejano sobre la cresta de la capa 3, y luciérnagas sobre
 * la capa 4. Ambas comparten una sola secuencia de números aleatorios (mismo
 * orden que el mockup) para que el resultado visual coincida.
 */
export function buildVillage(seed = 9): { windows: Window[]; fireflies: Firefly[] } {
  const rand = mulberry32(seed);
  const windows: Window[] = [];
  for (let i = 0; i < 22; i++) {
    const x = i < 16 ? 930 + rand() * 230 : 200 + rand() * 1000;
    const y = ridgeY(RIDGES[2], x) + 8 + rand() * 10;
    windows.push({ x, y });
  }
  const fireflies: Firefly[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 120 + rand() * 1200;
    const y = 520 + rand() * 140;
    const duration = 8 + rand() * 6;
    const delay = rand() * 8;
    fireflies.push({ x, y, duration, delay });
  }
  return { windows, fireflies };
}

export interface MistSpec {
  cx: number;
  cy: number;
  opacity: number;
  duration: number;
  delay: number;
}

/** Una banda de niebla por cada capa media (L2, L3, L4, en ese orden). */
export const MIST: readonly MistSpec[] = [
  { cx: 500, cy: 470, opacity: 0.1, duration: 22, delay: 0 },
  { cx: 800, cy: 545, opacity: 0.12, duration: 29, delay: -6 },
  { cx: 1100, cy: 600, opacity: 0.14, duration: 36, delay: -12 },
];
