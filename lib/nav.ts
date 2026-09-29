export interface NavLink {
  href: string;
  label: string;
}

/** Páginas principales, en el orden de la barra, el sidebar y el menú móvil. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export function isHome(pathname: string): boolean {
  return pathname === "/";
}

/** Activo en su ruta y en sus subrutas: /proyectos/medi-ia activa "Proyectos". */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface TerminalPath {
  /** Todo menos el último segmento, con su barra final: "~/proyectos/". En el home, "~". */
  base: string;
  /** El último segmento, que se resalta: "medi-ia". Vacío en el home. */
  last: string;
}

/** Ruta tipo terminal para la barra: "/proyectos/medi-ia" → "~/proyectos/" + "medi-ia". */
export function terminalPath(pathname: string): TerminalPath {
  const segments = pathname.split(/[?#]/)[0].split("/").filter(Boolean);
  if (segments.length === 0) return { base: "~", last: "" };
  const last = segments[segments.length - 1];
  const base = "~/" + segments.slice(0, -1).map((s) => `${s}/`).join("");
  return { base, last };
}
