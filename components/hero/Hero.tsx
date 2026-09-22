"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import type { HeroScene } from "./HeroScene";
import { introBus } from "@/lib/intro/bus";
import { EYEBROW_FULL, EYEBROW_LABEL, EYEBROW_SHORT, HERO_SUBTITLE } from "@/lib/hero/copy";
import { sliceParts, totalLength, type TypedPart } from "@/lib/typing";
import { FINDINGS, auditLine, type AuditView } from "@/lib/hero/scan";
import { hero3dAllowed, heroStaticMode, motionReduced, themeOf } from "@/lib/a11y";
import { QUALITY_KEY, parseCachedQuality } from "@/lib/hero/quality";

const TYPE_MS = 48;
const TYPE_DELAY_MS = 500;
const CARET_OFF_MS = 2600;
const CONTENT_DELAY_MS = 1400;
/** Si la escena no está lista a tiempo, el hero se muestra igual (como texto). */
const SAFETY_MS = 3200;

const A11Y_ATTRS = ["data-theme", "data-a11y-motion", "data-a11y-contrast", "data-a11y-dyslexia"];

export default function Hero() {
  const router = useRouter();
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const findingRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [eyebrow, setEyebrow] = useState<readonly TypedPart[]>(EYEBROW_FULL);
  const [typed, setTyped] = useState(0);
  const [caretOff, setCaretOff] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [audit, setAudit] = useState<AuditView>({ kind: "idle" });
  const [egg, setEgg] = useState(false);

  // Navegación del lado del cliente hacia el home: el script previo al paint no corrió,
  // así que se decide aquí, antes de pintar, si el <h1> de texto debe esperar al 3D.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-hero3d")) {
      root.setAttribute("data-hero3d", hero3dAllowed("WebGLRenderingContext" in window, navigator.hardwareConcurrency) ? "on" : "off");
    }
    if (window.innerWidth < 600) setEyebrow(EYEBROW_SHORT);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let scene: HeroScene | null = null;
    let disposed = false;

    const showEverything = () => {
      setIntroStarted(true);
      setTyped(Infinity);
      setCaretOff(true);
      setContentReady(true);
    };
    let gaveUp = false;
    const fallBackToText = (label: string) => {
      gaveUp = true;
      root.setAttribute("data-hero3d", "off");
      showEverything();
      introBus.report({ stage: "ready", label });
    };

    // Si la escena no existe a los 3.2 s (red lenta, CDN caído), el hero queda de texto
    // para esta visita y el muro termina igual.
    const safety = window.setTimeout(() => {
      if (!scene && !disposed) fallBackToText("modo texto (carga lenta)");
    }, SAFETY_MS);

    if (root.getAttribute("data-hero3d") !== "on") {
      fallBackToText("modo texto (sin WebGL)");
      return () => {
        disposed = true;
        window.clearTimeout(safety);
      };
    }

    (async () => {
      try {
        const { HeroScene } = await import("./HeroScene");
        if (disposed || gaveUp) return;
        introBus.report({ stage: "three", label: "three.js listo" });
        const body = getComputedStyle(document.body);
        const fonts = {
          serif: body.getPropertyValue("--font-dm-serif").trim() || "serif",
          mono: body.getPropertyValue("--font-mono").trim() || "monospace",
        };
        await Promise.all([document.fonts.load(`300px ${fonts.serif}`), document.fonts.load(`500 46px ${fonts.mono}`)]);
        if (disposed || gaveUp || !hostRef.current || !canvasRef.current || !slotRef.current || !nameRef.current) return;

        scene = new HeroScene({
          host: hostRef.current,
          canvas: canvasRef.current,
          slot: slotRef.current,
          nameEl: nameRef.current,
          findingEls: findingRefs.current.filter((el): el is HTMLSpanElement => el !== null),
          fonts,
          theme: themeOf(root),
          reduced: motionReduced(root, matchMedia),
          onAudit: setAudit,
          onEgg: setEgg,
          onEggNavigate: () => router.push("/sobre-mi"),
        });
        introBus.report({ stage: "scene", label: `escena: ${scene.count.toLocaleString("es-CO")} glifos` });

        let cached = null;
        try {
          cached = parseCachedQuality(sessionStorage.getItem(QUALITY_KEY));
        } catch {}
        const quality = await scene.prepare(cached);
        try {
          if (cached !== null || scene.fps !== null) sessionStorage.setItem(QUALITY_KEY, quality);
        } catch {}
        if (disposed) return;
        const detail = scene.fps !== null ? ` · ${scene.fps} fps` : cached !== null ? " · guardada" : " · sin medir";
        introBus.report({ stage: "ready", label: `calidad: ${quality === "low" ? "ligera" : "completa"}${detail}` });

        scene.setStatic(heroStaticMode(root));
        introBus.requestStart((fromDoor) => {
          if (disposed || !scene) return;
          scene.startIntro(fromDoor);
          setIntroStarted(true);
        });
      } catch {
        if (!disposed && !gaveUp) fallBackToText("modo texto (sin WebGL)");
      }
    })();

    const observer = new MutationObserver(() => {
      if (!scene) return;
      scene.setTheme(themeOf(root));
      scene.setReduced(motionReduced(root, matchMedia));
      scene.setStatic(heroStaticMode(root));
    });
    observer.observe(root, { attributes: true, attributeFilter: A11Y_ATTRS });

    return () => {
      disposed = true;
      window.clearTimeout(safety);
      observer.disconnect();
      scene?.dispose();
    };
  }, [router]);

  // Eyebrow letra por letra; subtítulo y botones después.
  useEffect(() => {
    if (!introStarted) return;
    const total = totalLength(eyebrow);
    if (typed >= total || motionReduced(document.documentElement, matchMedia)) {
      setTyped(Infinity);
      setCaretOff(true);
      setContentReady(true);
      return;
    }
    let n = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        n++;
        setTyped(n);
        if (n >= total) {
          window.clearInterval(interval);
          window.setTimeout(() => setCaretOff(true), CARET_OFF_MS);
        }
      }, TYPE_MS);
    }, TYPE_DELAY_MS);
    const ready = window.setTimeout(() => setContentReady(true), CONTENT_DELAY_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.clearTimeout(ready);
    };
    // `typed` se lee solo para saber si ya se mostró todo; no debe reiniciar el tipeo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introStarted, eyebrow]);

  const line = auditLine(audit);

  return (
    <section ref={hostRef} className={styles.hero} data-egg={egg ? "" : undefined} aria-labelledby="hero-name">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <div className={styles.content} data-ready={contentReady ? "" : undefined}>
        <p className={styles.eyebrow}>
          <span className="sr-only">{EYEBROW_LABEL}</span>
          <span aria-hidden="true">
            {sliceParts(eyebrow, typed).map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
          </span>
          <span className={styles.caret} data-off={caretOff ? "" : undefined} aria-hidden="true" />
        </p>

        <div ref={slotRef} className={styles.slot}>
          <h1 ref={nameRef} id="hero-name" className={`${styles.name} hero-name`}>
            Misael<em>.</em>
          </h1>
        </div>

        <p className={styles.sub}>{HERO_SUBTITLE}</p>
        <div className={styles.actions}>
          <Link href="/proyectos" className="btn-primary">
            Ver proyectos <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contacto" className="btn-ghost">
            Contacto
          </Link>
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        scroll ↓
      </div>

      <p className={styles.audit} data-on={introStarted ? "" : undefined} aria-hidden="true">
        {line.command}{" "}
        {line.parts.map((p, i) => (
          <span key={i} className={styles[p.tone]}>
            {p.text}
          </span>
        ))}
      </p>

      <div aria-hidden="true">
        {FINDINGS.map((f, i) => (
          <span
            key={f}
            ref={(el) => {
              findingRefs.current[i] = el;
            }}
            className={styles.finding}
            data-state="off"
          >
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}
