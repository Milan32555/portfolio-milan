"use client";

import { useSyncExternalStore } from "react";
import { themeOf, type ThemeName } from "@/lib/a11y";
import { THEME_KEY, otherTheme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";
import styles from "./IconButton.module.css";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getSnapshot = (): ThemeName => themeOf(document.documentElement);
const getServerSnapshot = (): ThemeName => "dark";

/**
 * Botón de tema. La fuente de verdad es data-theme en <html> (lo aplica el script previo al
 * pintado): todas las instancias (barra, sidebar, menú móvil) quedan sincronizadas solas.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next = otherTheme(theme);

  const toggle = () => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Modo privado: el tema cambia igual, solo no se recuerda.
    }
    const live = document.getElementById("a11y-announcer");
    if (live) live.textContent = next === "light" ? "Tema claro activado" : "Tema oscuro activado";
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-label={next === "light" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
