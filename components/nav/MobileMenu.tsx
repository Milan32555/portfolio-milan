"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive } from "@/lib/nav";
import SiteMark from "./SiteMark";
import ThemeToggle from "./ThemeToggle";
import styles from "./MobileMenu.module.css";

const FOCUSABLE = "a[href], button:not([disabled])";

interface Props {
  id: string;
  open: boolean;
  /** Cerrar con "cerrar" o Esc: el foco vuelve al botón "menú". */
  onClose: () => void;
  /** Cerrar porque se eligió un enlace: el foco se queda en la página nueva. */
  onNavigate: () => void;
}

/** Menú a pantalla completa (< 768px). Diálogo modal: foco atrapado, Esc cierra, bloquea el scroll. */
export default function MobileMenu({ id, open, onClose, onNavigate }: Props) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.menu}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      data-open={open ? "" : undefined}
      inert={!open}
    >
      <div className={styles.head}>
        <SiteMark onClick={onNavigate} />
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          cerrar ✕
        </button>
      </div>
      <nav className={styles.nav} aria-label="Principal">
        <ol className={styles.list}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <li key={href}>
              <Link href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined} onClick={onNavigate}>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.foot}>
        <a className={styles.gh} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer">
          github.com/Milan32555<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
