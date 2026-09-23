"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./CodeGate.module.css";
import { CodeWall } from "./wall";
import { introBus } from "@/lib/intro/bus";
import { GATE_STAGES, stepProgress, type StageEvent } from "@/lib/gate/progress";
import { motionReduced } from "@/lib/a11y";
import { GATE_SEEN_KEY } from "@/lib/prePaint";

type Phase = "loading" | "ready" | "open" | "gone";
const OPEN_MS = 1250;

// El `MediaQueryList` se crea una sola vez (no en cada tick) y se reutiliza.
let motionQuery: MediaQueryList | undefined;
function reduced() {
  if (!motionQuery) motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  return motionReduced(document.documentElement, () => motionQuery!);
}

/**
 * Loader "muro de código": solo cuando la visita llega al home, una vez por sesión.
 * Muestra la carga real (etapas que reporta el hero), y al entrar se abre en dos y
 * el hero arranca su intro desde la rendija.
 */
export default function CodeGate() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lines, setLines] = useState<string[]>([]);
  const phaseRef = useRef<Phase>("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<CodeWall | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  /** El efecto de layout decidió que no hay muro: los demás efectos no hacen nada. */
  const gateSkippedRef = useRef(false);
  const inertRef = useRef<HTMLElement[]>([]);
  const prevOverflowRef = useRef("");
  const lockedRef = useRef(false);
  const openTimeoutRef = useRef<number | undefined>(undefined);
  const lastPctRef = useRef(-1);

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const releasePage = useCallback(() => {
    inertRef.current.forEach((el) => (el.inert = false));
    inertRef.current = [];
    // Solo restaura una vez: se llama tanto desde `open()` como desde la limpieza del
    // efecto que aplica el bloqueo, y una segunda restauración pisaría cualquier cambio
    // de `overflow` hecho por otra parte de la página en el medio.
    if (lockedRef.current) {
      document.documentElement.style.overflow = prevOverflowRef.current;
      lockedRef.current = false;
    }
  }, []);

  // Antes de pintar: ¿corresponde mostrar el muro?
  useLayoutEffect(() => {
    const root = document.documentElement;
    const landedHere = root.getAttribute("data-landing") === "home";
    const seen = root.getAttribute("data-gate") === "skip";
    if (!landedHere || seen || introBus.gateState() === "open") {
      // Tiene que decidirse antes de pintar y depende de atributos que el script previo
      // escribió en <html> (no existen durante el render en el servidor).
      gateSkippedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      go("gone");
      introBus.openGate(false);
      return;
    }
    introBus.activateGate();
    inertRef.current = Array.from(document.querySelectorAll<HTMLElement>("main, nav, footer, .skip-link"));
    inertRef.current.forEach((el) => (el.inert = true));
    prevOverflowRef.current = root.style.overflow;
    root.style.overflow = "hidden";
    lockedRef.current = true;
    skipRef.current?.focus({ preventScroll: true });
    return () => {
      releasePage();
      if (openTimeoutRef.current !== undefined) {
        window.clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = undefined;
      }
    };
  }, [go, releasePage]);

  const alive = phase !== "gone";
  useEffect(() => {
    if (gateSkippedRef.current || !alive || !leftRef.current || !rightRef.current) return;
    const wall = new CodeWall(leftRef.current, rightRef.current);
    wallRef.current = wall;
    return () => wall.dispose();
  }, [alive]);

  // Barra de progreso: avanza con las etapas reales que reporta el hero.
  useEffect(() => {
    if (gateSkippedRef.current || phase !== "loading") return;
    let target = 4;
    let shown = 0;
    let raf = 0;
    const pending: StageEvent[] = [];
    const t0 = performance.now();
    const unsubscribe = introBus.subscribe((e) => {
      pending.push(e);
      target = Math.max(target, GATE_STAGES[e.stage]);
    });
    document.fonts.ready.then(() => introBus.report({ stage: "fonts", label: "fuentes cargadas" }));

    const tick = () => {
      shown = stepProgress(shown, target, performance.now() - t0, reduced());
      wallRef.current?.setShown(shown / 100);
      const pct = Math.round(shown);
      if (fillRef.current) fillRef.current.style.width = `${shown.toFixed(1)}%`;
      if (pctRef.current) pctRef.current.textContent = `${pct}%`;
      if (pct !== lastPctRef.current) {
        lastPctRef.current = pct;
        barRef.current?.setAttribute("aria-valuenow", String(pct));
      }
      const due = pending.filter((p) => shown >= GATE_STAGES[p.stage] - 0.5);
      if (due.length) {
        due.forEach((d) => pending.splice(pending.indexOf(d), 1));
        setLines((ls) => [...ls, ...due.sort((a, b) => GATE_STAGES[a.stage] - GATE_STAGES[b.stage]).map((d) => d.label)]);
      }
      if (shown >= 100) {
        go("ready");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [phase, go]);

  useEffect(() => {
    if (phase !== "ready") return;
    const active = document.activeElement;
    if (active === document.body || active === null || rootRef.current?.contains(active)) {
      btnRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  const open = useCallback(() => {
    const current = phaseRef.current;
    if (current === "open" || current === "gone") return;
    const fromDoor = current === "ready" && !reduced();
    // Se decide acá, antes de soltar la página o mover el foco: si al abrir el foco
    // estaba en el muro (o en el body), al terminar se manda al nombre del hero.
    const active = document.activeElement;
    const focusInGate = active === document.body || active === null || rootRef.current?.contains(active) === true;
    try {
      sessionStorage.setItem(GATE_SEEN_KEY, "1");
    } catch {}
    releasePage();
    go("open");
    introBus.openGate(fromDoor);
    wallRef.current?.freeze();
    openTimeoutRef.current = window.setTimeout(() => {
      go("gone");
      if (focusInGate) document.getElementById("hero-name")?.focus({ preventScroll: true });
    }, reduced() ? 0 : OPEN_MS);
  }, [go, releasePage]);

  useEffect(() => {
    if (!alive) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as Node | null;
      if (t && t !== document.body && t !== document.documentElement && !rootRef.current?.contains(t)) return;
      if (e.key === "Escape") open();
      else if (e.key === "Enter" && phaseRef.current === "ready" && e.target !== btnRef.current) open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alive, open]);

  if (phase === "gone") return null;

  return (
    <div
      ref={rootRef}
      className={`${styles.gate} code-gate`}
      data-phase={phase}
      role="dialog"
      aria-labelledby="gate-title"
      onClick={() => {
        if (phaseRef.current === "ready") open();
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !reduced()) wallRef.current?.setPointer(e.clientX, e.clientY);
      }}
      onPointerLeave={() => wallRef.current?.setPointer(-999, -999)}
    >
      <canvas ref={leftRef} className={`${styles.wall} ${styles.left}`} aria-hidden="true" />
      <canvas ref={rightRef} className={`${styles.wall} ${styles.right}`} aria-hidden="true" />
      <div className={styles.seam} aria-hidden="true" />

      <div className={styles.panel}>
        <p id="gate-title" className="sr-only">
          Cargando el portfolio de Misael
        </p>
        <pre className={styles.log} aria-hidden="true">
          <span className={styles.dim}>┌──(</span>
          <span className={styles.user}>misael㉿portfolio</span>
          <span className={styles.dim}>)-[~]</span>
          {"\n"}
          <span className={styles.dim}>└─$</span> ./entrar.sh
          {"\n"}
          {lines.map((l, i) => (
            <span key={i}>
              <span className={styles.ok}>[ ok ]</span> {l}
              {"\n"}
            </span>
          ))}
          {phase !== "loading" && <span className={styles.dim}>acceso listo.</span>}
        </pre>
        <div
          ref={barRef}
          className={styles.bar}
          role="progressbar"
          aria-label="Carga del sitio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span ref={fillRef} />
        </div>
        <div className={styles.row}>
          <span ref={pctRef} className={styles.pct} aria-hidden="true">
            0%
          </span>
          <button
            ref={btnRef}
            type="button"
            className={styles.enter}
            disabled={phase === "loading"}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            Entrar →
          </button>
        </div>
        <p className={styles.hint} aria-hidden="true">
          <span className={styles.hintKeys}>o pulsa Enter</span>
          <span className={styles.hintTouch}>o toca en cualquier parte</span>
        </p>
      </div>

      <button
        ref={skipRef}
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      >
        Saltar intro
      </button>
    </div>
  );
}
