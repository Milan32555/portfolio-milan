"use client";

import { useEffect, useRef } from "react";
import { motionReduced } from "@/lib/a11y";
import { INTERACTIVE_SELECTOR, approach, followFactor, glowScale } from "@/lib/cursor";

/**
 * Cursor propio: un punto pegado al mouse y un resplandor que lo sigue (lerp 0.22) y crece
 * sobre lo interactivo. Solo con mouse fino. Los interactivos se detectan por delegación en
 * cada movimiento, así funciona en cualquier página después de navegar.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;

    let mx = 0;
    let my = 0;
    let gx = 0;
    let gy = 0;
    let scale = 1;
    let hovering = false;
    let seen = false;
    let raf = 0;

    const tick = () => {
      const factor = followFactor(motionReduced(root, matchMedia));
      gx = approach(gx, mx, factor);
      gy = approach(gy, my, factor);
      scale = approach(scale, glowScale(hovering), factor === 1 ? 1 : 0.2);
      glow.style.transform = `translate(${gx}px, ${gy}px) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        // Primer movimiento: el resplandor arranca donde está el mouse, no en (0,0).
        seen = true;
        gx = mx;
        gy = my;
      }
      root.setAttribute("data-pointer", "in");
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      hovering = e.target instanceof Element && e.target.closest(INTERACTIVE_SELECTOR) !== null;
    };
    const onLeave = () => root.setAttribute("data-pointer", "out");

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
