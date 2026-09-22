import { AdditiveBlending, NormalBlending, type Blending } from "three";
import type { ThemeName } from "@/lib/a11y";

type Rgb = [number, number, number];

export interface Palette {
  base: Rgb;
  accent: Rgb;
  amber: Rgb;
  red: Rgb;
  green: Rgb;
  /** Color de la línea del escáner. */
  scan: number;
  /** Aditivo brilla sobre fondo oscuro; sobre fondo claro se lavaría, así que es normal. */
  blending: Blending;
  /** En tema claro los glifos se dibujan con trazo extra para que tengan "tinta". */
  ink: boolean;
  /** Opacidad del polvo de fondo: en claro, al 30 % para que no parezcan manchas. */
  dustAlpha: number;
}

export const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    base: [0.74, 0.81, 0.94],
    accent: [0.49, 0.7, 1.0],
    amber: [0.98, 0.72, 0.33],
    red: [1.0, 0.42, 0.42],
    green: [0.44, 0.83, 0.64],
    scan: 0xf8b653,
    blending: AdditiveBlending,
    ink: false,
    dustAlpha: 1,
  },
  light: {
    base: [0.05, 0.08, 0.17],
    accent: [0.1, 0.36, 0.96],
    amber: [0.72, 0.42, 0.0],
    red: [0.77, 0.14, 0.17],
    green: [0.08, 0.47, 0.29],
    scan: 0xb86a00,
    blending: NormalBlending,
    ink: true,
    dustAlpha: 0.3,
  },
};
