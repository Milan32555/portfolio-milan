"use client";

import { useScrollSpy } from "@/components/servicios/useScrollSpy";
import { SECTIONS } from "@/lib/servicios";
import styles from "./Sidebar.module.css";

const IDS = SECTIONS.map((s) => s.id);

/** Índice de /servicios dentro del sidebar: marca la sección en la que va la lectura. */
export default function SidebarIndex() {
  const active = useScrollSpy(IDS);
  return (
    <ol className={styles.index} aria-label="En esta página">
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={styles.indexLink} aria-current={active === s.id ? "location" : undefined}>
            <span className={styles.indexNum} aria-hidden="true">
              {s.num}
            </span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
