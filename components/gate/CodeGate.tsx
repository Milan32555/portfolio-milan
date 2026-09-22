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

function reduced() {
  return motionReduced(document.documentElement, matchMedia);
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
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<CodeWall | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inertRef = useRef<HTMLElement[]>([]);

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const releasePage = useCallback(() => {
    inertRef.current.forEach((el) => (el.inert = false));
    inertRef.current = [];
  }, []);

  // Antes de pintar: ¿corresponde mostrar el muro?
  useLayoutEffect(() => {
    const root = document.documentElement;
    const landedHere = root.getAttribute("data-landing") === "home";
    const seen = root.getAttribute("data-gate") === "skip";
    if (!landedHere || seen || introBus.gateState() === "open") {
      // Tiene que decidirse antes de pintar y depende de atributos que el script previo
      // escribió en <html> (no existen durante el render en el servidor).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      go("gone");
      introBus.openGate(false);
      return;
    }
    introBus.activateGate();
    inertRef.current = Array.from(document.querySelectorAll<HTMLElement>("main, nav, footer"));
    inertRef.current.forEach((el) => (el.inert = true));
    return releasePage;
  }, [go, releasePage]);

  const alive = phase !== "gone";
  useEffect(() => {
    if (!alive || !leftRef.current || !rightRef.current) return;
    const wall = new CodeWall(leftRef.current, rightRef.current);
    wallRef.current = wall;
    return () => wall.dispose();
  }, [alive]);

  // Barra de progreso: avanza con las etapas reales que reporta el hero.
  useEffect(() => {
    if (phase !== "loading") return;
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
      barRef.current?.setAttribute("aria-valuenow", String(pct));
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
    if (phase === "ready") btnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const open = useCallback(() => {
    const current = phaseRef.current;
    if (current === "open" || current === "gone") return;
    const fromDoor = current === "ready" && !reduced();
    try {
      sessionStorage.setItem(GATE_SEEN_KEY, "1");
    } catch {}
    releasePage();
    go("open");
    introBus.openGate(fromDoor);
    window.setTimeout(() => go("gone"), reduced() ? 0 : OPEN_MS);
  }, [go, releasePage]);

  useEffect(() => {
    if (!alive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open();
      else if (e.key === "Enter" && phaseRef.current === "ready" && e.target !== btnRef.current) open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alive, open]);

  if (phase === "gone") return null;

  return (
    <div
      className={`${styles.gate} code-gate`}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
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
        <h2 id="gate-title" className="sr-only">
          Cargando el portfolio de Misael
        </h2>
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
