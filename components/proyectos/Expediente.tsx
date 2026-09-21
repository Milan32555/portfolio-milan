"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { HOVER_INTENT_MS, isRealMouseMove } from "@/lib/hoverIntent";
import styles from "./Expediente.module.css";

export interface Carpeta {
  id: string;
  titulo: string;
  contenido: ReactNode;
}

const noopSubscribe = () => () => {};

/**
 * Carpetas apiladas que funcionan como acordeón. Siempre hay una abierta.
 * - Clic / toque / Enter / Espacio: abre la carpeta.
 * - Hover (solo mouse en dispositivos con hover): abre con retraso de intención y solo ante
 *   movimiento real, para no provocar una cascada cuando el layout se desplaza.
 * Todo el contenido está siempre en el HTML; las carpetas cerradas se marcan `inert` solo tras hidratar.
 */
export default function Expediente({ carpetas, label }: { carpetas: Carpeta[]; label: string }) {
  const [open, setOpen] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // false en el servidor y en la hidratación; true después. Evita `inert` en el HTML inicial (sin JS todo se lee).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const scheduleOpen = (i: number, e: PointerEvent) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!isRealMouseMove(e.nativeEvent)) return;
    if (open === i || timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      setOpen(i);
    }, HOVER_INTENT_MS);
  };

  return (
    <div className={styles.stack} role="group" aria-label={label}>
      {carpetas.map((c, i) => {
        const isOpen = open === i;
        return (
          <section key={c.id} className={styles.folder} style={{ "--i": i } as CSSProperties} data-open={isOpen}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={`${c.id}-tab`}
                className={styles.chip}
                aria-expanded={isOpen}
                aria-controls={`${c.id}-panel`}
                onClick={() => {
                  cancel();
                  setOpen(i);
                }}
                onPointerMove={(e) => scheduleOpen(i, e)}
                onPointerLeave={cancel}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span>{c.titulo}</span>
              </button>
            </h3>

            <div className={styles.strip} aria-hidden="true" onPointerMove={(e) => scheduleOpen(i, e)} onPointerLeave={cancel} />

            <div id={`${c.id}-panel`} role="region" aria-labelledby={`${c.id}-tab`} className={styles.panel} inert={hydrated && !isOpen}>
              <div>
                <div className={styles.inner}>{c.contenido}</div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
