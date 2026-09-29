"use client";

import { useEffect, useState } from "react";
import { pickActive } from "@/lib/scrollSpy";

/** Línea de lectura: debajo de la barra fija (y del TOC sticky en móvil). */
export const SPY_OFFSET = 160;

/**
 * Id de la sección en la que va la lectura (ver pickActive). `ids` debe ser estable
 * (constante de módulo o memorizado): si cambia en cada render, se re-suscribe en cada render.
 */
export function useScrollSpy(ids: readonly string[], offset = SPY_OFFSET): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const tops = ids.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      setActive(pickActive(tops, offset, atBottom));
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
  }, [ids, offset]);

  return active;
}
