"use client";

import { useEffect, useRef, useState } from "react";
import { MIST, RIDGES, buildStars, buildVillage, ridgePath } from "@/lib/footerScene";
import styles from "./Footer.module.css";

// Todo esto es determinista (mismo cálculo en servidor y cliente): se computa una
// sola vez al cargar el módulo, no hay desajuste de hidratación posible.
const RIDGE_PATHS = RIDGES.map((spec) => ridgePath(spec));
const STARS = buildStars();
const { windows: WINDOWS, fireflies: FIREFLIES } = buildVillage();

// Profundidad de cada grupo, en el mismo orden en que se dibujan (de atrás hacia
// adelante): cielo, cresta 1, cresta 2, la palabra "MISAEL.", cresta 3, 4 y 5.
const DEPTHS = [0.08, 0.2, 0.32, 0.38, 0.5, 0.7, 0.95] as const;

const WIDE_VIEWBOX = "0 0 1440 700";
const NARROW_VIEWBOX = "220 -600 1000 1300";

function motionReduced(): boolean {
  return (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-a11y-motion") === "reduced"
  );
}

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

/** Una cresta: su relleno y, si aplica, el halftone que se desvanece cerca de la cima. */
function Ridge({ index }: { index: number }) {
  const spec = RIDGES[index];
  const { d, minY } = RIDGE_PATHS[index];
  if (spec.dots === null) return <path d={d} fill={spec.color} />;
  const gradId = `footer-ridge-${index}-grad`;
  const maskId = `footer-ridge-${index}-mask`;
  return (
    <>
      <path d={d} fill={spec.color} />
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1={minY} x2="0" y2={minY + 95}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-60" y="0" width="1560" height="720">
          <rect x="-60" y="0" width="1560" height="720" fill={`url(#${gradId})`} />
        </mask>
      </defs>
      <path d={d} fill="url(#footer-dots)" mask={`url(#${maskId})`} opacity={spec.dots} />
    </>
  );
}

/**
 * Footer "Cordilleras": una noche en los Andes en capas, con la palabra "MISAEL."
 * sentada entre las crestas. Aparece en todas las páginas (montado desde el layout).
 *
 * Es puramente decorativo y utilitario: el SVG es `aria-hidden`, y lo único real
 * encima es la barra inferior (copyright, GitHub, correo) — ningún CTA ni encabezado
 * compite con el contenido de la página. El parallax de scroll y el brillo que sigue
 * al cursor solo corren con `(hover: hover) and (pointer: fine)` y respetan tanto
 * `prefers-reduced-motion` del sistema como el interruptor de movimiento del propio
 * widget de accesibilidad del sitio (`data-a11y-motion`).
 */
export default function Footer() {
  const [viewBox, setViewBox] = useState(WIDE_VIEWBOX);
  const footerRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Array<SVGGElement | null>>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // Encuadre adaptable: ancho recorta los lados; angosto muestra un recuadro más
  // alto para que "MISAEL." quepa entera.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const fit = () => {
      const wide = footer.clientWidth / Math.max(1, footer.clientHeight) >= 1.6;
      setViewBox(wide ? WIDE_VIEWBOX : NARROW_VIEWBOX);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Parallax por scroll: cada capa se desplaza a distinta velocidad según su
  // profundidad, como una cortina que revela el footer.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const update = () => {
      if (motionReduced()) return;
      const r = footer.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
      layerRefs.current.forEach((g, i) => {
        if (g) g.style.transform = `translateY(${((1 - p) * DEPTHS[i] * 130).toFixed(1)}px)`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Resplandor que sigue al cursor, y las ventanas/luciérnagas cercanas se avivan.
  // Solo mouse: en touch no hay hover, y con reduced-motion no se monta nada de esto.
  useEffect(() => {
    const footer = footerRef.current;
    const glow = glowRef.current;
    const l3 = layerRefs.current[4];
    const l4 = layerRefs.current[5];
    if (!footer || !glow) return;

    const near = (cx: number, cy: number, rect: DOMRect, radius: number) => {
      const dx = rect.left + rect.width / 2 - cx;
      const dy = rect.top + rect.height / 2 - cy;
      return Math.max(0, 1 - Math.hypot(dx, dy) / radius);
    };

    let pending: PointerEvent | null = null;
    const apply = () => {
      rafId.current = null;
      const e = pending;
      if (!e) return;
      const b = footer.getBoundingClientRect();
      glow.style.opacity = "1";
      glow.style.left = `${e.clientX - b.left}px`;
      glow.style.top = `${e.clientY - b.top}px`;
      l3?.querySelectorAll<SVGCircleElement>(`.${styles.win}`).forEach((w) => {
        const k = near(e.clientX, e.clientY, w.getBoundingClientRect(), 220);
        w.setAttribute("opacity", (0.6 + k * 0.4).toFixed(2));
        w.setAttribute("r", (1.8 + k * 1.6).toFixed(2));
      });
      l4?.querySelectorAll<SVGCircleElement>(`.${styles.ff}`).forEach((f) => {
        const k = near(e.clientX, e.clientY, f.getBoundingClientRect(), 260);
        f.setAttribute("opacity", (0.25 + k * 0.75).toFixed(2));
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || motionReduced()) return;
      pending = e;
      if (rafId.current === null) rafId.current = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      glow.style.opacity = "0";
    };

    footer.addEventListener("pointermove", onMove);
    footer.addEventListener("pointerleave", onLeave);
    return () => {
      footer.removeEventListener("pointermove", onMove);
      footer.removeEventListener("pointerleave", onLeave);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const setLayerRef = (i: number) => (el: SVGGElement | null) => {
    layerRefs.current[i] = el;
  };

  return (
    <footer ref={footerRef} className={styles.footer} aria-label="Pie de página">
      <div className={styles.glow} ref={glowRef} aria-hidden="true" />

      <svg
        className={styles.scene}
        viewBox={viewBox}
        preserveAspectRatio={viewBox === WIDE_VIEWBOX ? "xMidYMax slice" : "xMidYMax meet"}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="footer-horizon" cx="50%" cy="62%" r="55%">
            <stop offset="0" stopColor="#4f8ef7" stopOpacity=".38" />
            <stop offset="1" stopColor="#4f8ef7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="footer-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#cfe1ff" stopOpacity=".95" />
            <stop offset=".25" stopColor="#7eb3ff" stopOpacity=".35" />
            <stop offset="1" stopColor="#7eb3ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="footer-word" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9cc2ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#4f8ef7" stopOpacity=".12" />
          </linearGradient>
          <pattern id="footer-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.15" fill="#7eb3ff" opacity=".55" />
          </pattern>
          <filter id="footer-blur30" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          <filter id="footer-soft" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Cielo: horizonte, luna, estrellas */}
        <g ref={setLayerRef(0)} className={styles.layer}>
          <rect y="-800" width="1440" height="1500" fill="url(#footer-horizon)" />
          <circle cx="1130" cy="150" r="90" fill="url(#footer-moon)" />
          {STARS.map((s, i) => (
            <circle
              key={i}
              className={styles.star}
              style={{ animationDelay: `-${s.delay.toFixed(2)}s` }}
              cx={s.x.toFixed(0)}
              cy={s.y.toFixed(0)}
              r={s.r.toFixed(2)}
              fill="#dbe8ff"
            />
          ))}
        </g>

        {/* Cresta 1 (la más lejana) */}
        <g ref={setLayerRef(1)} className={styles.layer}>
          <Ridge index={0} />
        </g>

        {/* Cresta 2 + niebla */}
        <g ref={setLayerRef(2)} className={styles.layer}>
          <Ridge index={1} />
          <ellipse
            className={styles.mist}
            style={{ animationDuration: `${MIST[0].duration}s`, animationDelay: `${MIST[0].delay}s` }}
            cx={MIST[0].cx}
            cy={MIST[0].cy}
            rx="620"
            ry="30"
            fill="#9cc2ff"
            opacity={MIST[0].opacity}
            filter="url(#footer-blur30)"
          />
        </g>

        {/* La palabra, sentada entre las crestas */}
        <g ref={setLayerRef(3)} className={styles.layer}>
          <text
            x="720"
            y="535"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            fontSize="235"
            fill="url(#footer-word)"
            letterSpacing="-3"
          >
            MISAEL.
          </text>
        </g>

        {/* Cresta 3 + niebla + pueblo */}
        <g ref={setLayerRef(4)} className={styles.layer}>
          <Ridge index={2} />
          <ellipse
            className={styles.mist}
            style={{ animationDuration: `${MIST[1].duration}s`, animationDelay: `${MIST[1].delay}s` }}
            cx={MIST[1].cx}
            cy={MIST[1].cy}
            rx="620"
            ry="30"
            fill="#9cc2ff"
            opacity={MIST[1].opacity}
            filter="url(#footer-blur30)"
          />
          {WINDOWS.map((w, i) => (
            <circle key={i} className={styles.win} cx={w.x.toFixed(0)} cy={w.y.toFixed(0)} r="1.8" fill="#ffd28a" opacity=".75" />
          ))}
        </g>

        {/* Cresta 4 + niebla + luciérnagas */}
        <g ref={setLayerRef(5)} className={styles.layer}>
          <Ridge index={3} />
          <ellipse
            className={styles.mist}
            style={{ animationDuration: `${MIST[2].duration}s`, animationDelay: `${MIST[2].delay}s` }}
            cx={MIST[2].cx}
            cy={MIST[2].cy}
            rx="620"
            ry="30"
            fill="#9cc2ff"
            opacity={MIST[2].opacity}
            filter="url(#footer-blur30)"
          />
          {FIREFLIES.map((f, i) => (
            <g key={i} className={styles.fly} style={{ animationDuration: `${f.duration.toFixed(1)}s`, animationDelay: `-${f.delay.toFixed(1)}s` }}>
              <circle className={styles.ff} cx={f.x.toFixed(0)} cy={f.y.toFixed(0)} r="5" fill="#9cf0c6" opacity=".25" filter="url(#footer-soft)" />
              <circle cx={f.x.toFixed(0)} cy={f.y.toFixed(0)} r="1.6" fill="#d6ffe8" />
            </g>
          ))}
        </g>

        {/* Cresta 5, la más cercana */}
        <g ref={setLayerRef(6)} className={styles.layer}>
          <Ridge index={4} />
        </g>
      </svg>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Misael</span>
        <a href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Misael (se abre en una pestaña nueva)">
          <GitHubIcon />
          GitHub
        </a>
      </div>
    </footer>
  );
}
