import type { TypedPart } from "../typing.ts";

export const EYEBROW_FULL: readonly TypedPart[] = [
  { text: "// dev " },
  { text: "freelance", strong: true },
  { text: " · auditor de código" },
];

/** En pantallas angostas el eyebrow se corta para no partirse en dos líneas. */
export const EYEBROW_SHORT: readonly TypedPart[] = EYEBROW_FULL.slice(0, 2);

export const EYEBROW_LABEL = "Desarrollador freelance y auditor de código";

export const HERO_SUBTITLE =
  "Construyo interfaces con React y Next.js, y audito código ajeno con la misma cabeza con la que aprendí seguridad: buscando qué se rompe antes de que lo haga otro.";
