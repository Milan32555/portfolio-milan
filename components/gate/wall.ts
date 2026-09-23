import { GLYPHS } from "@/lib/hero/glyphs";
import { wallAlpha } from "@/lib/gate/progress";
import { motionReduced } from "@/lib/a11y";

const CW = 17;
const CH = 21;
const LIGHT_RADIUS = 140;
const RESIZE_DEBOUNCE_MS = 150;
const FONT = "500 12px monospace";
/** Presupuesto por cuadro del primer pintado cuando se pinta en el hilo principal. */
const PAINT_BUDGET_MS = 6;

type Surface = HTMLCanvasElement | OffscreenCanvas;
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type AlphaFn = (lit: boolean, near: number, light: boolean) => number;

interface WallLayout {
  W: number;
  H: number;
  dpr: number;
  cols: number;
  rows: number;
  /** Glifo (índice en GLYPHS) y umbral de cada celda; solo si la grilla cambió. */
  glyphs?: Uint8Array;
  ts?: Float64Array;
}

type WallMsg =
  | { k: "layout"; layout: WallLayout; chunked: boolean }
  | { k: "theme"; color: string; light: boolean }
  | { k: "shown"; f: number }
  | { k: "pointer"; x: number; y: number }
  | { k: "reduced"; on: boolean };

interface Painter {
  apply(m: WallMsg): void;
  /** Un cuadro: primer pintado pendiente, código vivo, avance y cursor. */
  frame(): void;
  /** Termina de golpe el primer pintado si quedó a medias. */
  finish(): void;
}

/**
 * El pintor del muro. Solo pinta lo que cambia: cada celda recuerda la opacidad con
 * la que está pintada y se repinta (borrar su caja + un `fillText`) solo si la que le
 * toca ahora es distinta. El contexto se configura una vez (y otra tras cada resize,
 * que lo reinicia), no en cada llamada.
 *
 * IMPORTANTE: esta función se serializa con `toString()` para correr en un worker, así
 * que no puede usar nada de fuera de ella: todo entra por parámetros.
 */
function makePainter(
  left: Surface,
  right: Surface,
  glyphSet: string,
  alphaOf: AlphaFn,
  cw: number,
  ch: number,
  radius: number,
  budget: number,
  font: string,
): Painter {
  const lctx = (left as HTMLCanvasElement).getContext("2d") as Ctx | null;
  const rctx = (right as HTMLCanvasElement).getContext("2d") as Ctx | null;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let n = 0;
  let g: Uint8Array = new Uint8Array(0);
  let t: Float64Array = new Float64Array(0);
  /** Opacidad pintada de cada celda; -1 = sin pintar. */
  let a = new Float64Array(0);
  /** x del centro dentro de su canvas y en qué mitad cae (1 = derecha). */
  let lx = new Float64Array(0);
  let side = new Uint8Array(0);
  /** Celdas ordenadas por umbral y cuántas están encendidas (t < shown). */
  let byT = new Uint32Array(0);
  let lit = 0;
  let shown = 0;
  let step = -1;
  let mx = -999;
  let my = -999;
  let pmx = -999;
  let pmy = -999;
  let painted = 0;
  let color = "#7eb3ff";
  let light = false;
  let reduced = false;
  let lA = -1;
  let rA = -1;

  const applyState = () => {
    for (const x of [lctx, rctx]) {
      if (!x) continue;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.font = font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = color;
      x.globalAlpha = 1;
    }
    lA = rA = 1;
  };

  const alphaFor = (i: number) => {
    const dx = (i % cols) * cw + cw / 2 - mx;
    const dy = Math.floor(i / cols) * ch + ch / 2 - my;
    const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / radius);
    return alphaOf(t[i] < shown, near, light);
  };

  const paint = (i: number, alpha: number, clear: boolean) => {
    const onRight = side[i] === 1;
    const x = onRight ? rctx : lctx;
    if (!x) return;
    const cx = lx[i];
    const cy = Math.floor(i / cols) * ch + ch / 2;
    if (clear) x.clearRect(cx - cw / 2, cy - ch / 2, cw, ch);
    if (onRight) {
      if (rA !== alpha) x.globalAlpha = rA = alpha;
    } else if (lA !== alpha) x.globalAlpha = lA = alpha;
    x.fillText(glyphSet[g[i]], cx, cy);
    a[i] = alpha;
  };

  const refresh = (i: number) => {
    if (a[i] < 0) return;
    const alpha = alphaFor(i);
    if (alpha !== a[i]) paint(i, alpha, true);
  };

  const paintRows = (limit: number, deadline: number) => {
    while (painted < limit) {
      const start = painted * cols;
      for (let i = start; i < start + cols; i++) paint(i, alphaFor(i), false);
      painted++;
      if (performance.now() > deadline) break;
    }
  };

  const paintAll = () => {
    lctx?.clearRect(0, 0, W / 2, H);
    rctx?.clearRect(0, 0, W / 2, H);
    a.fill(-1);
    painted = 0;
    paintRows(rows, Infinity);
  };

  const syncLit = () => {
    while (lit < n && t[byT[lit]] < shown) refresh(byT[lit++]);
    while (lit > 0 && t[byT[lit - 1]] >= shown) refresh(byT[--lit]);
  };

  const refreshAround = (x: number, y: number) => {
    const c0 = Math.max(0, Math.floor((x - radius) / cw) - 1);
    const c1 = Math.min(cols - 1, Math.ceil((x + radius) / cw) + 1);
    const r0 = Math.max(0, Math.floor((y - radius) / ch) - 1);
    const r1 = Math.min(rows - 1, Math.ceil((y + radius) / ch) + 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) refresh(r * cols + c);
  };

  const layout = (L: WallLayout, chunked: boolean) => {
    W = L.W;
    H = L.H;
    dpr = L.dpr;
    if (L.glyphs && L.ts) {
      cols = L.cols;
      rows = L.rows;
      n = cols * rows;
      g = L.glyphs;
      t = L.ts;
      a = new Float64Array(n);
      lx = new Float64Array(n);
      side = new Uint8Array(n);
      const order = Array.from({ length: n }, (_, i) => i);
      const ts = t;
      order.sort((p, q) => ts[p] - ts[q]);
      byT = Uint32Array.from(order);
      lit = 0;
    }
    // El ancho de cada mitad cambia con cualquier resize: se recalcula siempre.
    const half = W / 2;
    for (let i = 0; i < n; i++) {
      const px = (i % cols) * cw + cw / 2;
      side[i] = px < half ? 0 : 1;
      lx[i] = px < half ? px : px - half;
    }
    for (const cv of [left, right]) {
      cv.width = Math.ceil(half * dpr);
      cv.height = Math.ceil(H * dpr);
    }
    // Cambiar el tamaño deja el canvas en blanco y con el estado por defecto.
    applyState();
    a.fill(-1);
    painted = 0;
    pmx = mx;
    pmy = my;
    step = Math.floor(shown * 50);
    if (!chunked) paintRows(rows, Infinity);
  };

  return {
    apply(m) {
      switch (m.k) {
        case "layout":
          layout(m.layout, m.chunked);
          break;
        case "theme":
          // Cambio de tema o de contraste: repintado completo (poco frecuente).
          color = m.color;
          light = m.light;
          applyState();
          paintAll();
          break;
        case "shown":
          shown = m.f;
          break;
        case "pointer":
          mx = m.x;
          my = m.y;
          break;
        case "reduced":
          reduced = m.on;
          break;
      }
    },
    frame() {
      if (painted < rows) paintRows(rows, performance.now() + budget);
      // Código vivo: de vez en cuando un glifo cambia (no con movimiento reducido).
      if (!reduced && n && Math.random() < 0.5) {
        const i = Math.floor(Math.random() * n);
        g[i] = Math.floor(Math.random() * glyphSet.length);
        if (a[i] >= 0) paint(i, alphaFor(i), true);
      }
      // El avance se refleja en 50 pasos, como siempre; el cursor, en cada cuadro.
      const s = Math.floor(shown * 50);
      const moved = mx !== pmx || my !== pmy;
      if (s !== step || moved) {
        step = s;
        syncLit();
      }
      if (moved) {
        refreshAround(pmx, pmy);
        refreshAround(mx, my);
        pmx = mx;
        pmy = my;
      }
    },
    finish() {
      if (painted < rows) paintRows(rows, Infinity);
    },
  };
}

type WorkerMsg =
  | { k: "init"; left?: OffscreenCanvas; right?: OffscreenCanvas; glyphs: string; cfg: [number, number, number, number, string] }
  | { k: "freeze" }
  | WallMsg;

/** Cuerpo del worker (también serializado con `toString()`: nada de fuera). */
function workerMain(make: typeof makePainter, alphaOf: AlphaFn) {
  const scope = globalThis as unknown as {
    onmessage: ((e: MessageEvent<WorkerMsg>) => void) | null;
    requestAnimationFrame?: (cb: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
  };
  const hasRaf = typeof scope.requestAnimationFrame === "function";
  const schedule = (cb: () => void) => (hasRaf ? scope.requestAnimationFrame!(cb) : (setTimeout(cb, 16) as unknown as number));
  const cancel = (id: number) => (hasRaf ? scope.cancelAnimationFrame!(id) : clearTimeout(id));
  let painter: Painter | null = null;
  let running = false;
  let raf = 0;
  const loop = () => {
    if (!running || !painter) return;
    painter.frame();
    raf = schedule(loop);
  };
  scope.onmessage = (e) => {
    const m = e.data;
    if (m.k === "init") {
      if (m.left && m.right) painter = make(m.left, m.right, m.glyphs, alphaOf, ...m.cfg);
      painter?.apply({ k: "shown", f: 0 });
      painter?.apply({ k: "pointer", x: -999, y: -999 });
      if (!running) {
        running = true;
        raf = schedule(loop);
      }
    } else if (m.k === "freeze") {
      running = false;
      cancel(raf);
      painter?.finish();
    } else painter?.apply(m);
  };
}

let workerUrl: string | null = null;
/** Worker por canvas: en desarrollo (StrictMode) el efecto se monta dos veces sobre el
 *  mismo canvas, y el control de un canvas solo se puede transferir una vez. */
const workers = new WeakMap<HTMLCanvasElement, Worker>();

function canTransfer(cv: HTMLCanvasElement) {
  try {
    return (
      typeof Worker !== "undefined" &&
      typeof OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in cv &&
      new OffscreenCanvas(1, 1).getContext("2d") !== null
    );
  } catch {
    return false;
  }
}

function spawnWorker(): Worker | null {
  try {
    if (!workerUrl) {
      const src = `"use strict";(${workerMain.toString()})(${makePainter.toString()},${wallAlpha.toString()});`;
      workerUrl = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    }
    return new Worker(workerUrl);
  } catch {
    return null;
  }
}

/**
 * El muro: una grilla de glifos dibujada en dos canvas (mitad izquierda y derecha)
 * que al abrir el loader se deslizan hacia los lados como una puerta.
 *
 * Donde se puede, el pintado corre en un worker sobre un OffscreenCanvas: tocar un
 * canvas 2D en un cuadro tiene un costo fijo alto en el hilo principal (aunque sea un
 * solo glifo), y así la carga del home no lo paga. Si no hay soporte, el mismo pintor
 * corre en el hilo principal con el primer pintado repartido entre cuadros.
 */
export class CodeWall {
  private worker: Worker | null = null;
  private painter: Painter | null = null;
  private cols = 0;
  private rows = 0;
  private lastShown = -1;
  private frozen = false;
  private raf = 0;
  private observer: MutationObserver;
  private resizeTimer = 0;
  /** Movimiento reducido: MediaQueryList creado una sola vez, valor cacheado en `reducedMotion`. */
  private motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  private reducedMotion = false;
  /** Color y tema cacheados: se releen solo cuando cambian los atributos observados. */
  private color = "#7eb3ff";
  private light = false;
  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    // Un resize ya no es la carga: se repinta entero de una vez, como siempre.
    this.resizeTimer = window.setTimeout(() => this.send({ k: "layout", layout: this.measure(), chunked: false }), RESIZE_DEBOUNCE_MS);
  };
  private onMotionChange = () => {
    this.updateMotion();
  };

  constructor(
    private left: HTMLCanvasElement,
    private right: HTMLCanvasElement,
  ) {
    this.readTheme();
    this.reducedMotion = motionReduced(document.documentElement, () => this.motionQuery);
    const layout = this.measure();
    const reused = workers.get(left);
    if (reused) {
      this.worker = reused;
      reused.postMessage({ k: "init", glyphs: GLYPHS, cfg: [CW, CH, LIGHT_RADIUS, PAINT_BUDGET_MS, FONT] } satisfies WorkerMsg);
    } else if (canTransfer(left)) {
      const w = spawnWorker();
      if (w) {
        const ol = left.transferControlToOffscreen();
        const or = right.transferControlToOffscreen();
        const init: WorkerMsg = { k: "init", left: ol, right: or, glyphs: GLYPHS, cfg: [CW, CH, LIGHT_RADIUS, PAINT_BUDGET_MS, FONT] };
        w.postMessage(init, [ol, or]);
        workers.set(left, w);
        this.worker = w;
      }
    }
    if (!this.worker) {
      this.painter = makePainter(left, right, GLYPHS, wallAlpha, CW, CH, LIGHT_RADIUS, PAINT_BUDGET_MS, FONT);
      this.raf = requestAnimationFrame(this.loop);
    }
    this.send({ k: "theme", color: this.color, light: this.light });
    this.send({ k: "reduced", on: this.reducedMotion });
    // En el hilo principal el primer pintado se reparte entre cuadros; en el worker no hace falta.
    this.send({ k: "layout", layout, chunked: !this.worker });

    window.addEventListener("resize", this.onResize);
    this.motionQuery.addEventListener("change", this.onMotionChange);
    this.observer = new MutationObserver(() => {
      const { color, light } = this;
      this.readTheme();
      this.updateMotion();
      if (color !== this.color || light !== this.light) this.send({ k: "theme", color: this.color, light: this.light });
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-a11y-contrast", "data-a11y-motion"],
    });
  }

  setShown(fraction: number) {
    if (fraction === this.lastShown) return;
    this.lastShown = fraction;
    this.send({ k: "shown", f: fraction });
  }

  setPointer(x: number, y: number) {
    this.send({ k: "pointer", x, y });
  }

  /**
   * Detiene el bucle sin borrar los canvas (para no competir con el arranque del hero)
   * y también el resize: un resize durante la apertura de las puertas no debe volver
   * a hacer `layout()` y borrar el estado ya congelado.
   */
  freeze() {
    if (this.frozen) return;
    window.removeEventListener("resize", this.onResize);
    window.clearTimeout(this.resizeTimer);
    cancelAnimationFrame(this.raf);
    // Si alguien salta la intro antes de terminar el primer pintado, las puertas
    // se abren con el muro completo.
    if (this.worker) this.worker.postMessage({ k: "freeze" } satisfies WorkerMsg);
    else this.painter?.finish();
    this.frozen = true;
  }

  dispose() {
    this.freeze();
    this.motionQuery.removeEventListener("change", this.onMotionChange);
    this.observer.disconnect();
    const w = this.worker;
    const cv = this.left;
    if (w) {
      // Si el canvas sigue en la página (doble montaje de StrictMode), el worker se
      // conserva para el próximo muro; si ya salió, se termina.
      window.setTimeout(() => {
        if (!cv.isConnected && workers.get(cv) === w) {
          w.terminate();
          workers.delete(cv);
        }
      }, 0);
    }
  }

  private send(m: WallMsg) {
    if (this.frozen) return;
    if (this.worker) this.worker.postMessage(m);
    else this.painter?.apply(m);
  }

  private readTheme() {
    const root = document.documentElement;
    this.color = getComputedStyle(root).getPropertyValue("--accent2").trim() || "#7eb3ff";
    this.light = root.getAttribute("data-theme") === "light";
  }

  private updateMotion() {
    const on = motionReduced(document.documentElement, () => this.motionQuery);
    if (on !== this.reducedMotion) {
      this.reducedMotion = on;
      this.send({ k: "reduced", on });
    }
  }

  /** Medidas actuales; si cambió la grilla, glifos y umbrales nuevos (mismo orden de sorteo). */
  private measure(): WallLayout {
    const root = document.documentElement;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cols = Math.ceil(W / CW);
    const rows = Math.ceil(H / CH);
    const layout: WallLayout = { W, H, dpr, cols, rows };
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      const n = cols * rows;
      const glyphs = new Uint8Array(n);
      const ts = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        glyphs[i] = Math.floor(Math.random() * GLYPHS.length);
        ts[i] = Math.random();
      }
      layout.glyphs = glyphs;
      layout.ts = ts;
    }
    return layout;
  }

  private loop = () => {
    this.painter?.frame();
    this.raf = requestAnimationFrame(this.loop);
  };
}
