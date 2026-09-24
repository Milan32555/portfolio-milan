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
import { primaryFamily } from "@/lib/hero/fonts";
import HeroDiag from "./HeroDiag";
import { diagError, diagLog, initHeroDiag } from "./diagLog";

const TYPE_MS = 48;
const TYPE_DELAY_MS = 500;
const CARET_OFF_MS = 2600;
const CONTENT_DELAY_MS = 1400;
/** Si la escena no está lista a tiempo, el hero se muestra igual (como texto). */
const SAFETY_MS = 3200;

const A11Y_ATTRS = ["data-theme", "data-a11y-motion", "data-a11y-contrast", "data-a11y-dyslexia"];

export default function Hero() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  });
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
  const [diag, setDiag] = useState(false);

  // Navegación del lado del cliente hacia el home: el script previo al paint no corrió,
  // así que se decide aquí, antes de pintar, si el <h1> de texto debe esperar al 3D.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (initHeroDiag()) {
      setDiag(true);
      diagLog(`pre-paint data-hero3d=${root.getAttribute("data-hero3d")}`);
    }
    // Sin atributo (primera visita a este montaje) o marcado "slow" (una visita anterior
    // en la misma sesión cayó a texto por lentitud, no por falta de WebGL): recalcular.
    if (!root.hasAttribute("data-hero3d") || root.getAttribute("data-hero3d-reason") === "slow") {
      root.setAttribute("data-hero3d", hero3dAllowed("WebGLRenderingContext" in window, navigator.hardwareConcurrency) ? "on" : "off");
      root.removeAttribute("data-hero3d-reason");
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
    const fallBackToText = (label: string, reason?: string) => {
      diagLog(`fallback a texto: ${label}`);
      gaveUp = true;
      root.setAttribute("data-hero3d", "off");
      if (reason) root.setAttribute("data-hero3d-reason", reason);
      showEverything();
      introBus.report({ stage: "ready", label });
    };

    // Si la escena no existe a los 3.2 s (red o teléfono lentos), el hero se muestra como
    // texto mientras tanto, pero la carga sigue: cuando la escena esté lista, el texto se
    // desvanece y entra el código (ver `lateUpgrade` abajo). Solo un error real deja el
    // hero en texto para toda la visita.
    let lateUpgrade = false;
    const safety = window.setTimeout(() => {
      if (scene || disposed || gaveUp) return;
      diagLog("3.2 s sin escena: texto por ahora, la carga sigue");
      lateUpgrade = true;
      root.setAttribute("data-hero3d", "off");
      root.setAttribute("data-hero3d-reason", "slow");
      showEverything();
      introBus.report({ stage: "ready", label: "modo texto por ahora (carga lenta)" });
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
        diagLog("importando three.js");
        const { HeroScene } = await import("./HeroScene");
        diagLog("three.js importado");
        if (disposed || gaveUp) return;
        if (!lateUpgrade) introBus.report({ stage: "three", label: "three.js listo" });
        const body = getComputedStyle(document.body);
        const fonts = {
          serif: body.getPropertyValue("--font-dm-serif").trim() || "serif",
          mono: body.getPropertyValue("--font-mono").trim() || "monospace",
        };
        // Se espera solo a la fuente real (el respaldo local de next/font no existe en
        // Android). Si aun así una falla, la escena sigue con la de respaldo.
        const loads = await Promise.allSettled([
          document.fonts.load(`300px ${primaryFamily(fonts.serif)}`),
          document.fonts.load(`500 46px ${primaryFamily(fonts.mono, "monospace")}`),
        ]);
        loads.forEach((r, i) => {
          if (r.status === "rejected") diagError(`fuente ${i === 0 ? "serif" : "mono"} (sigue con la de respaldo)`, r.reason);
        });
        diagLog("fuentes listas");
        if (disposed || gaveUp || !hostRef.current || !canvasRef.current || !slotRef.current || !nameRef.current) return;

        // La construcción cede el hilo entre pasos; si el hero se desmonta o cae a texto
        // a mitad de camino, `create` libera lo creado y devuelve null.
        const created = await HeroScene.create(
          {
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
            onEggNavigate: () => routerRef.current.push("/sobre-mi"),
            onContextLost: () => {
              diagLog("webglcontextlost");
              if (disposed) return;
              fallBackToText("modo texto (contexto WebGL perdido)");
              scene?.dispose();
              scene = null;
            },
          },
          () => disposed || gaveUp,
        );
        diagLog(created ? `escena creada: ${created.count} glifos` : "creación cancelada");
        if (!created) return;
        if (disposed || gaveUp) {
          created.dispose();
          return;
        }
        scene = created;
        if (!lateUpgrade) introBus.report({ stage: "scene", label: `escena: ${scene.count.toLocaleString("es-CO")} glifos` });

        let cached = null;
        try {
          cached = parseCachedQuality(sessionStorage.getItem(QUALITY_KEY));
        } catch {}
        const quality = await scene.prepare(cached);
        diagLog(`calidad ${quality} · fps ${scene?.fps ?? "-"}`);
        if (disposed || gaveUp || !scene) return;
        try {
          if (cached !== null || scene.fps !== null) sessionStorage.setItem(QUALITY_KEY, quality);
        } catch {}
        const detail = scene.fps !== null ? ` · ${scene.fps} fps` : cached !== null ? " · guardada" : " · sin medir";
        if (!lateUpgrade) introBus.report({ stage: "ready", label: `calidad: ${quality === "low" ? "ligera" : "completa"}${detail}` });

        scene.setStatic(heroStaticMode(root));
        if (lateUpgrade) {
          // Llegó tarde: se vuelve a mostrar el canvas y el <h1> de texto se desvanece
          // (transición de .name) mientras los glifos vuelan a formar el nombre.
          root.setAttribute("data-hero3d", "on");
          root.removeAttribute("data-hero3d-reason");
        }
        introBus.requestStart((fromDoor) => {
          diagLog(`intro arranca (fromDoor=${fromDoor})`);
          if (disposed || !scene) return;
          scene.startIntro(fromDoor);
          setIntroStarted(true);
        });
      } catch (err) {
        console.warn("[hero] la escena 3D falló, queda el hero de texto:", err);
        diagError("escena", err);
        if (!disposed && !gaveUp) {
          scene?.dispose();
          scene = null;
          fallBackToText("modo texto (error en la escena)");
        }
      }
    })();

    const onA11yChange = () => {
      if (!scene) return;
      scene.setTheme(themeOf(root));
      scene.setReduced(motionReduced(root, matchMedia));
      scene.setStatic(heroStaticMode(root));
    };
    const observer = new MutationObserver(onA11yChange);
    observer.observe(root, { attributes: true, attributeFilter: A11Y_ATTRS });
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onA11yChange);

    return () => {
      disposed = true;
      window.clearTimeout(safety);
      observer.disconnect();
      mq.removeEventListener("change", onA11yChange);
      scene?.dispose();
    };
  }, []);

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
    let caretTimer = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        n++;
        setTyped(n);
        if (n >= total) {
          window.clearInterval(interval);
          caretTimer = window.setTimeout(() => setCaretOff(true), CARET_OFF_MS);
        }
      }, TYPE_MS);
    }, TYPE_DELAY_MS);
    const ready = window.setTimeout(() => setContentReady(true), CONTENT_DELAY_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.clearTimeout(ready);
      window.clearTimeout(caretTimer);
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
          <h1 ref={nameRef} id="hero-name" className={`${styles.name} hero-name`} tabIndex={-1}>
            Misael<em>.</em>
          </h1>
        </div>

        <p className={`${styles.sub} hero-noscript-show`}>{HERO_SUBTITLE}</p>
        <div className={`${styles.actions} hero-noscript-show`}>
          <Link href="/proyectos" className="btn-primary">
            Ver proyectos <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contacto" className="btn-ghost">
            Contacto
          </Link>
        </div>
      </div>

      {/* Sin JS, `contentReady` nunca llega: fuerza lo visible/enfocable en .sub y .actions. */}
      <noscript>
        <style>{".hero-noscript-show{opacity:1!important;visibility:visible!important;transform:none!important}"}</style>
      </noscript>

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

      {diag && <HeroDiag />}

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
