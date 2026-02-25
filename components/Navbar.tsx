"use client";

import { useEffect, useState } from "react";

const SECTIONS = ["projects", "about", "contact"] as const;

export default function Navbar() {
  const [theme, setTheme]       = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState<string>("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let current = "";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkStyle = (id: string) => ({
    color: active === id ? "var(--text)" : "var(--muted)",
    borderBottom: active === id ? "1px solid var(--accent)" : "1px solid transparent",
    paddingBottom: "2px",
    transition: "color 300ms ease, border-color 300ms ease",
    fontSize: "0.85rem",
  });

  return (
    <nav
      className="navbar"
      style={{
        background: scrolled ? "rgba(12,12,14,0.8)" : "transparent",
        borderBottomColor: scrolled ? "var(--border)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
      }}
    >
      <span className="navbar-logo">Portfolio Misael</span>

      <div className="navbar-links">
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} style={linkStyle(id)}>
            {id === "projects" ? "Proyectos" : id === "about" ? "Sobre mí" : "Contacto"}
          </a>
        ))}

        <button
          className="theme-toggle"
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}