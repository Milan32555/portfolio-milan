import { GLYPHS } from "@/lib/hero/glyphs";
import { wallAlpha } from "@/lib/gate/progress";
import { motionReduced } from "@/lib/a11y";

interface Cell {
  c: number;
  r: number;
  g: string;
  /** Umbral de progreso en el que el glifo se "enciende". */
  t: number;
}

const CW = 17;
const CH = 21;
const LIGHT_RADIUS = 140;
const RESIZE_DEBOUNCE_MS = 150;

/**
 * El muro: una grilla de glifos dibujada en dos canvas (mitad izquierda y derecha)
 * que al abrir el loader se deslizan hacia los lados como una puerta.
 */
export class CodeWall {
  private cells: Cell[] = [];
  private leftCells: Cell[] = [];
  private rightCells: Cell[] = [];
  private cols = 0;
  private rows = 0;
  private W = 0;
  private H = 0;
  private dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  private shown = 0;
  private shownStep = -1;
  private mouse = { x: -999, y: -999 };
  private dirty = true;
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
    this.resizeTimer = window.setTimeout(() => this.layout(), RESIZE_DEBOUNCE_MS);
  };

  constructor(
    private left: HTMLCanvasElement,
    private right: HTMLCanvasElement,
  ) {
    this.updateTheme();
    this.updateMotion();
    this.layout();
    window.addEventListener("resize", this.onResize);
    this.observer = new MutationObserver(() => {
      this.updateTheme();
      this.updateMotion();
      this.dirty = true;
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-a11y-contrast", "data-a11y-motion"],
    });
    this.raf = requestAnimationFrame(this.loop);
  }

  setShown(fraction: number) {
    this.shown = fraction;
    const step = Math.floor(fraction * 50);
    if (step !== this.shownStep) {
      this.shownStep = step;
      this.dirty = true;
    }
  }

  setPointer(x: number, y: number) {
    this.mouse = { x, y };
    this.dirty = true;
  }

  /** Detiene el bucle sin borrar los canvas: para no competir con el arranque del hero. */
  freeze() {
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.freeze();
    window.removeEventListener("resize", this.onResize);
    window.clearTimeout(this.resizeTimer);
    this.observer.disconnect();
  }

  private updateTheme() {
    const root = document.documentElement;
    this.color = getComputedStyle(root).getPropertyValue("--accent2").trim() || "#7eb3ff";
    this.light = root.getAttribute("data-theme") === "light";
  }

  private updateMotion() {
    this.reducedMotion = motionReduced(document.documentElement, () => this.motionQuery);
  }

  private reduced() {
    return this.reducedMotion;
  }

  private layout() {
    const root = document.documentElement;
    this.W = root.clientWidth;
    this.H = root.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cols = Math.ceil(this.W / CW);
    const rows = Math.ceil(this.H / CH);
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.cells.push({ c, r, g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], t: Math.random() });
        }
      }
      this.splitCells();
    }
    for (const cv of [this.left, this.right]) {
      cv.width = Math.ceil((this.W / 2) * this.dpr);
      cv.height = Math.ceil(this.H * this.dpr);
    }
    this.dirty = true;
  }

  private splitCells() {
    const half = this.W / 2;
    this.leftCells = [];
    this.rightCells = [];
    for (const cell of this.cells) {
      const px = cell.c * CW + CW / 2;
      if (px < half) this.leftCells.push(cell);
      else this.rightCells.push(cell);
    }
  }

  private draw() {
    const half = this.W / 2;
    this.drawCanvas(this.left, this.leftCells, 0, half);
    this.drawCanvas(this.right, this.rightCells, half, half);
  }

  private drawCanvas(cv: HTMLCanvasElement, cells: Cell[], ox: number, half: number) {
    const x = cv.getContext("2d");
    if (!x) return;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.clearRect(0, 0, half, this.H);
    x.font = "500 12px monospace";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = this.color;
    for (const cell of cells) {
      const px = cell.c * CW + CW / 2;
      const py = cell.r * CH + CH / 2;
      const dx = px - this.mouse.x;
      const dy = py - this.mouse.y;
      const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / LIGHT_RADIUS);
      x.globalAlpha = wallAlpha(cell.t < this.shown, near, this.light);
      x.fillText(cell.g, px - ox, py);
    }
  }

  /** Código vivo: redibuja solo la celda mutada, sin marcar `dirty` ni repasar todo el muro. */
  private redrawCell(cell: Cell) {
    const half = this.W / 2;
    const px = cell.c * CW + CW / 2;
    const py = cell.r * CH + CH / 2;
    const onLeft = px < half;
    const cv = onLeft ? this.left : this.right;
    const ox = onLeft ? 0 : half;
    const x = cv.getContext("2d");
    if (!x) return;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.clearRect(px - ox - CW / 2, py - CH / 2, CW, CH);
    const dx = px - this.mouse.x;
    const dy = py - this.mouse.y;
    const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / LIGHT_RADIUS);
    x.font = "500 12px monospace";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = this.color;
    x.globalAlpha = wallAlpha(cell.t < this.shown, near, this.light);
    x.fillText(cell.g, px - ox, py);
  }

  private loop = () => {
    // Código vivo: de vez en cuando un glifo cambia (no con movimiento reducido).
    if (!this.reduced() && Math.random() < 0.5 && this.cells.length) {
      const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
      cell.g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      this.redrawCell(cell);
    }
    if (this.dirty) {
      this.draw();
      this.dirty = false;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
