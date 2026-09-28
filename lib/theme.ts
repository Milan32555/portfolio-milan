import type { ThemeName } from "./a11y.ts";

/** Clave de localStorage donde se recuerda el tema elegido. */
export const THEME_KEY = "theme";

/** Solo "light" es claro; cualquier otro valor (o ninguno) es el oscuro por defecto. */
export function parseTheme(stored: string | null | undefined): ThemeName {
  return stored === "light" ? "light" : "dark";
}

export function otherTheme(theme: ThemeName): ThemeName {
  return theme === "light" ? "dark" : "light";
}

/**
 * Corre en el <head>, antes del primer pintado (ver app/layout.tsx): aplica el tema guardado
 * sin parpadeo. ES5 plano y a prueba de errores: localStorage puede lanzar en modo privado.
 */
export const THEME_PRE_PAINT_SCRIPT =
  "(function(){var t='dark';" +
  `try{if(localStorage.getItem('${THEME_KEY}')==='light')t='light'}catch(e){}` +
  "try{document.documentElement.setAttribute('data-theme',t)}catch(e){}})();";
