"use client";

import { useMemo, useState } from "react";
import styles from "./Servicios.module.css";
import { useScrollSpy } from "./useScrollSpy";
import type { Section } from "@/lib/servicios";

export default function Toc({ sections, minutes }: { sections: readonly Section[]; minutes: number }) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useScrollSpy(ids);
  const [open, setOpen] = useState(false);

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
