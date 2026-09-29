"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/nav/ThemeToggle";
import { NAV_LINKS, isActive } from "@/lib/nav";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
        {NAV_LINKS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} style={linkStyle(active)} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
