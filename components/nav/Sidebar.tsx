"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive } from "@/lib/nav";
import { GitHubIcon } from "./icons";
import iconStyles from "./IconButton.module.css";
import MarkTransition from "./MarkTransition";
import SidebarIndex from "./SidebarIndex";
import SiteMark from "./SiteMark";
import ThemeToggle from "./ThemeToggle";
import styles from "./Sidebar.module.css";

/** Columna fija de las páginas internas (desde 1024px). En /servicios despliega el índice bajo "Servicios". */
export default function Sidebar() {
  const pathname = usePathname();
  const onServicios = pathname === "/servicios";

  return (
    <div className={styles.sidebar} data-sidebar="">
      <div>
        <MarkTransition>
          <SiteMark size="lg" />
        </MarkTransition>
        <p className={styles.role}>{"// dev freelance · auditor de código"}</p>
        {!onServicios && (
          <p className={styles.tagline}>Construyo interfaces y reviso código ajeno buscando qué se rompe antes de que lo haga otro.</p>
        )}
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined}>
                  {label}
                </Link>
                {href === "/servicios" && onServicios && <SidebarIndex />}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.foot}>
        <a className={iconStyles.btn} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Misael (se abre en una pestaña nueva)">
          <GitHubIcon />
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
