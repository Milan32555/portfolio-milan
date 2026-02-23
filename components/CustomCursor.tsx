"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    };

    // Ring lerps behind — gives the "trailing" feel
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Grow ring on hoverable elements
    const onEnter = () => ring.classList.add("cursor-hover");
    const onLeave = () => ring.classList.remove("cursor-hover");

    const addHover = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    addHover();

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Small sharp dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "5px", height: "5px",
          borderRadius: "50%",
          background: "#4f8ef7",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          transition: "opacity 0.2s ease",
          mixBlendMode: "normal",
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "32px", height: "32px",
          borderRadius: "50%",
          border: "1px solid rgba(79,142,247,0.5)",
          pointerEvents: "none",
          zIndex: 99998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s ease, height 0.3s ease, border-color 0.3s ease",
        }}
        className="cursor-ring"
      />

      <style>{`
        .cursor-ring.cursor-hover {
          width: 48px !important;
          height: 48px !important;
          border-color: rgba(79,142,247,0.8) !important;
          background: rgba(79,142,247,0.06);
        }
      `}</style>
    </>
  );
}