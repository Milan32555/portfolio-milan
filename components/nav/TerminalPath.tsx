"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motionReduced } from "@/lib/a11y";
import { isHome, terminalPath } from "@/lib/nav";
import { sliceParts, totalLength, type TypedPart } from "@/lib/typing";
import styles from "./TerminalPath.module.css";

const CHAR_MS = 45;

/** "~/proyectos/medi-ia" junto a la marca. Decorativa: la ubicación la anuncia el enlace activo. */
export default function TerminalPath() {
  const pathname = usePathname();
  if (isHome(pathname)) return null;
  const { base, last } = terminalPath(pathname);
  // key: al cambiar de página se remonta y se vuelve a escribir desde cero.
  return <TypedPath key={pathname} parts={[{ text: base }, { text: last, strong: true }]} />;
}

function TypedPath({ parts }: { parts: TypedPart[] }) {
  const total = totalLength(parts);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Con movimiento reducido se escribe completa en el primer tic, sin letra por letra.
    const reduced = motionReduced(document.documentElement, matchMedia);
    let n = 0;
    const id = window.setInterval(
      () => {
        n = reduced ? total : n + 1;
        setShown(n);
        if (n >= total) window.clearInterval(id);
      },
      reduced ? 0 : CHAR_MS,
    );
    return () => window.clearInterval(id);
  }, [total]);

  return (
    <span className={styles.path} data-terminal-path="" aria-hidden="true">
      {sliceParts(parts, shown).map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
      <i className={styles.caret} />
    </span>
  );
}
