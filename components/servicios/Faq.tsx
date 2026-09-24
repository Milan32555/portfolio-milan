"use client";

import { useId, useState } from "react";
import styles from "./Servicios.module.css";
import type { FaqItem } from "@/lib/servicios";

export default function Faq({ items }: { items: readonly FaqItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<readonly boolean[]>(() => items.map(() => false));
  const toggle = (i: number) => setOpen((prev) => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <ul className={styles.faq}>
      {items.map((item, i) => {
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        const isOpen = open[i];
        return (
          <li key={item.q}>
            <h3>
              <button id={btnId} type="button" className={styles.q} aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(i)}>
                {item.q}
                <span className={styles.icon} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={styles.panel} data-open={isOpen ? "" : undefined} inert={!isOpen}>
              <div className={styles.panelInner}>
                <p>{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
