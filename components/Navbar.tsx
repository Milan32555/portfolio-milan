"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkStyle = (active: boolean) => ({
    color: active ? "var(--text)" : "var(--soft)",
    borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
    paddingBottom: "2px",
    transition: "color 300ms ease, border-color 300ms ease",
    fontSize: "0.85rem",
  });

  return (
    <nav
      className="navbar"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--bg) 80%, transparent)" : "transparent",
        borderBottomColor: scrolled ? "var(--border)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
      }}
    >
      <Link href="/" className="navbar-logo">
        <span className="logo-long">Portfolio </span>Misael
      </Link>

      <div className="navbar-links">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} style={linkStyle(active)} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          );
        })}

        <button className="theme-toggle" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="Cambiar tema">
          {theme === "dark" ? (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
