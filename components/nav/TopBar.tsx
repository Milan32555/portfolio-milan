"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive, isHome } from "@/lib/nav";
import MarkTransition from "./MarkTransition";
import MobileMenu from "./MobileMenu";
import SiteMark from "./SiteMark";
import TerminalPath from "./TerminalPath";
import ThemeToggle from "./ThemeToggle";
import styles from "./TopBar.module.css";

const MENU_ID = "menu-movil";

/**
 * Barra superior. En el home, siempre; en las páginas internas, solo bajo 1024px (arriba manda
 * el sidebar). Bajo 768px los enlaces pasan al menú a pantalla completa.
 */
export default function TopBar() {
  const pathname = usePathname();
  const home = isHome(pathname);
  const [scrolled, setScrolled] = useState(false);
  // El menú queda abierto solo para la ruta en la que se abrió: al navegar se cierra solo.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuFor(null);
    menuBtnRef.current?.focus();
  }, []);
  const leaveMenu = useCallback(() => setMenuFor(null), []);

  return (
    <>
      <header className={styles.bar} data-topbar="" data-scrolled={scrolled ? "" : undefined} data-inner={home ? undefined : ""}>
        {home ? (
          <MarkTransition>
            <SiteMark />
          </MarkTransition>
        ) : (
          <SiteMark />
        )}
        <TerminalPath />
        <nav className={styles.links} aria-label="Principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
        <button
          ref={menuBtnRef}
          type="button"
          className={styles.menuBtn}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => setMenuFor(pathname)}
        >
          <span className={styles.bars} aria-hidden="true" />
          menú
        </button>
      </header>
      {/* Fuera del <header>: su backdrop-filter atraparía a un hijo position: fixed. */}
      <MobileMenu id={MENU_ID} open={menuOpen} onClose={closeMenu} onNavigate={leaveMenu} />
    </>
  );
}
