"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./KaliConsole.module.css";
import { BASE_ENTRIES, BONUS_ENTRIES, NEOFETCH_LOGO, type ConsoleEntry, type Line } from "@/lib/sobreMi";
import { tokenize, typedTokens } from "@/lib/terminal";
import { motionReduced } from "@/lib/a11y";

const TYPE_MS = 68;
const OUT_DELAY_MS = 120;
const NEXT_DELAY_MS = 180;

interface Shown {
  entry: ConsoleEntry;
  typed: number;
  done: boolean;
}

const allDone = (entries: readonly ConsoleEntry[]): Shown[] => entries.map((entry) => ({ entry, typed: entry.command.length, done: true }));

function Output({ lines }: { lines: readonly Line[] }) {
  return (
    <div className={styles.out}>
      {lines.map((line, i) => (
        <div key={i}>
          {line.map((s, j) => {
            if (s.href)
              return (
                <a key={j} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.text}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              );
            if (s.strong) return <strong key={j}>{s.text}</strong>;
            if (s.cat) return <span key={j} className={styles.cat}>{s.text}</span>;
            if (s.live) return <span key={j} className={styles.live}>{s.text}</span>;
            return <Fragment key={j}>{s.text}</Fragment>;
          })}
        </div>
      ))}
    </div>
  );
}

function Neofetch({ lines }: { lines: readonly Line[] }) {
  return (
    <div className={styles.neofetch}>
      <pre className={styles.logo} aria-hidden="true">
        {NEOFETCH_LOGO}
      </pre>
      <div>
        <Output lines={lines} />
        <div className={styles.swatches} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

/**
 * Consola estilo Kali. Sin JS (o con movimiento reducido) todo el contenido está
 * escrito desde el HTML; con JS se borra antes de pintar y se escribe solo, una vez,
 * al entrar en pantalla. El texto que se va tipeando es aria-hidden y el comando
 * completo va en .sr-only: el lector de pantalla nunca lee letra por letra.
 */
export default function KaliConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Shown[]>(() => allDone(BASE_ENTRIES));
  const [baseDone, setBaseDone] = useState(true);
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const [live, setLive] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (entries: readonly ConsoleEntry[], signal: AbortSignal) => {
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const onAbort = () => {
          window.clearTimeout(id);
          reject(new Error("abort"));
        };
        const id = window.setTimeout(() => {
          signal.removeEventListener("abort", onAbort);
          resolve();
        }, ms);
        signal.addEventListener("abort", onAbort, { once: true });
      });
    for (const entry of entries) {
      setShown((s) => [...s, { entry, typed: 0, done: false }]);
      for (let i = 1; i <= entry.command.length; i++) {
        await sleep(TYPE_MS);
        setShown((s) => s.map((x, k) => (k === s.length - 1 ? { ...x, typed: i } : x)));
      }
      await sleep(OUT_DELAY_MS);
      setShown((s) => s.map((x, k) => (k === s.length - 1 ? { ...x, done: true } : x)));
      await sleep(NEXT_DELAY_MS);
    }
  }, []);

  // Antes de pintar: si hay animación, vaciar la consola y esperar a que entre en pantalla.
  // `live` se marca siempre (incluso con movimiento reducido) para que el CSS que oculta
  // el cuerpo antes de hidratar (data-console-anim, ver KaliConsole.module.css) lo suelte.
  useLayoutEffect(() => {
    if (!motionReduced(document.documentElement, matchMedia)) {
      setShown([]);
      setBaseDone(false);
    }
    setLive(true);
  }, []);

  useEffect(() => {
    // Misma condición que el layout effect de arriba: `baseDone` aquí sería el valor del
    // primer render (true) porque el efecto solo corre al montar, y la consola nunca arrancaría.
    if (motionReduced(document.documentElement, matchMedia)) return;
    const el = rootRef.current;
    if (!el) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run(BASE_ENTRIES, controller.signal)
          .then(() => setBaseDone(true))
          .catch(() => {});
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controller.abort();
    };
    // Solo al montar: baseDone cambia a true al terminar y no debe relanzar nada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll solo cuando cambia la cantidad de líneas mostradas o alguna termina de
  // tipearse (no en cada letra): shownKey solo cambia en esos dos casos.
  const shownKey = shown.length + ":" + shown.filter((s) => s.done).length;
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [shownKey]);

  // Aborta cualquier corrida en curso al desmontar: cubre tanto la corrida base como una bonus.
  useEffect(() => () => abortRef.current?.abort(), []);

  const runBonus = (entry: ConsoleEntry) => {
    if (!baseDone || busy || used.includes(entry.id)) return;
    setUsed((u) => [...u, entry.id]);
    if (motionReduced(document.documentElement, matchMedia)) {
      setShown((s) => [...s, ...allDone([entry])]);
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    run([entry], controller.signal)
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  return (
    <div ref={rootRef} className={styles.console} data-live={live ? "" : undefined}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.title}>misael@portfolio: ~</span>
      </div>

      <div ref={bodyRef} className={styles.body}>
        <div className={styles.motd} aria-hidden="true">
          Last login: hoy — sesión iniciada desde este navegador
        </div>
        {shown.map(({ entry, typed, done }, i) => {
          const isLast = i === shown.length - 1;
          return (
            <div key={`${entry.id}-${i}`}>
              <div className={styles.p1} aria-hidden="true">
                ┌──(<span className={styles.host}>misael㉿portfolio</span>)-[~]
              </div>
              <div className={styles.p2}>
                <span aria-hidden="true">└─$ </span>
                <span aria-hidden="true">
                  {typedTokens(tokenize(entry.command), typed).map((t, k) => (
                    <span key={k} className={t.kind === "flag" ? styles.flag : styles.cmd}>
                      {t.text}
                    </span>
                  ))}
                </span>
                <span className="sr-only">Comando: {entry.command}</span>
                {!done && isLast && <span className={styles.caret} aria-hidden="true" />}
              </div>
              {done && (entry.kind === "neofetch" ? <Neofetch lines={entry.output} /> : <Output lines={entry.output} />)}
            </div>
          );
        })}
      </div>

      <div className={styles.cmdbar} data-on={baseDone ? "" : undefined}>
        {BONUS_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={styles.chip}
            disabled={!baseDone || busy || used.includes(entry.id)}
            onClick={() => runBonus(entry)}
            aria-label={`Ejecutar ${entry.command}`}
          >
            {entry.command}
          </button>
        ))}
      </div>
    </div>
  );
}
