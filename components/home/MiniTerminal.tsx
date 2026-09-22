"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import { motionReduced } from "@/lib/a11y";

const WORD = "whoami";

/** Avance de la consola de /sobre-mi: escribe `whoami` una vez al entrar en pantalla, sin respuesta. */
export default function MiniTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (motionReduced(document.documentElement, matchMedia)) {
          setN(WORD.length);
          return;
        }
        let i = 0;
        const tick = () => {
          i++;
          setN(i);
          if (i < WORD.length) timer = window.setTimeout(tick, 110);
        };
        timer = window.setTimeout(tick, 450);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className={styles.term} aria-hidden="true">
      <div className={styles.termBar}>
        <i />
        <i />
        <i />
      </div>
      <pre className={styles.termBody}>
        <span className={styles.termDim}>┌──(</span>
        <span className={styles.termUser}>misael㉿portfolio</span>
        <span className={styles.termDim}>)-[~]</span>
        {"\n"}
        <span className={styles.termDim}>└─$</span> <span className={styles.termCmd}>{WORD.slice(0, n)}</span>
        <span className={styles.termCaret} />
      </pre>
    </div>
  );
}
