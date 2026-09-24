"use client";

import { useEffect, useState } from "react";
import styles from "./Servicios.module.css";
import { pickActive } from "@/lib/scrollSpy";
import type { Section } from "@/lib/servicios";

/** Línea de lectura: debajo de la navbar fija (y del TOC sticky en móvil). */
const SPY_OFFSET = 160;

export default function Toc({ sections, minutes }: { sections: readonly Section[]; minutes: number }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const tops = sections.flatMap((s) => {
        const el = document.getElementById(s.id);
        return el ? [{ id: s.id, top: el.getBoundingClientRect().top }] : [];
      });
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      setActive(pickActive(tops, SPY_OFFSET, atBottom));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [sections]);

  return (
    <nav className={styles.toc} aria-label="En esta página" data-open={open ? "" : undefined}>
      <button type="button" className={styles.tocToggle} aria-expanded={open} aria-controls="toc-list" onClick={() => setOpen((o) => !o)}>
        En esta página
        <span className={styles.chev} aria-hidden="true">
          ▾
        </span>
      </button>
      <p className={styles.reading}>{minutes} min de lectura</p>
      <ol id="toc-list" className={styles.tocList}>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined} onClick={() => setOpen(false)}>
              <span className={styles.tocNum} aria-hidden="true">
                {s.num}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
