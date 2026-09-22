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

/**
 * El muro: una grilla de glifos dibujada en dos canvas (mitad izquierda y derecha)
 * que al abrir el loader se deslizan hacia los lados como una puerta.
 */
export class CodeWall {
  private cells: Cell[] = [];
  private W = 0;
  private H = 0;
  private dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  private shown = 0;
  private mouse = { x: -999, y: -999 };
  private dirty = true;
  private raf = 0;
  private observer: MutationObserver;
  private onResize = () => this.layout();

  constructor(
    private left: HTMLCanvasElement,
    private right: HTMLCanvasElement,
  ) {
    this.layout();
    window.addEventListener("resize", this.onResize);
    this.observer = new MutationObserver(() => (this.dirty = true));
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-a11y-contrast"] });
    this.raf = requestAnimationFrame(this.loop);
  }

  setShown(fraction: number) {
    if (fraction !== this.shown) {
      this.shown = fraction;
      this.dirty = true;
    }
  }

  setPointer(x: number, y: number) {
    this.mouse = { x, y };
    this.dirty = true;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.observer.disconnect();
  }

  private layout() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    const cols = Math.ceil(this.W / CW);
    const rows = Math.ceil(this.H / CH);
    this.cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.cells.push({ c, r, g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], t: Math.random() });
      }
    }
    for (const cv of [this.left, this.right]) {
      cv.width = Math.ceil((this.W / 2) * this.dpr);
      cv.height = Math.ceil(this.H * this.dpr);
    }
    this.dirty = true;
  }

  private draw() {
    const root = document.documentElement;
    const color = getComputedStyle(root).getPropertyValue("--accent2").trim() || "#7eb3ff";
    const light = root.getAttribute("data-theme") === "light";
    const half = this.W / 2;
    for (const [cv, ox] of [
      [this.left, 0],
      [this.right, half],
    ] as const) {
      const x = cv.getContext("2d");
      if (!x) continue;
      x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      x.clearRect(0, 0, half, this.H);
      x.font = "500 12px monospace";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = color;
      for (const cell of this.cells) {
        const px = cell.c * CW + CW / 2;
        const py = cell.r * CH + CH / 2;
        if (px < ox - CW || px > ox + half + CW) continue;
        const dx = px - this.mouse.x;
        const dy = py - this.mouse.y;
        const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / LIGHT_RADIUS);
        x.globalAlpha = wallAlpha(cell.t < this.shown, near, light);
        x.fillText(cell.g, px - ox, py);
      }
    }
  }

  private loop = () => {
    // Código vivo: de vez en cuando un glifo cambia (no con movimiento reducido).
    if (!motionReduced(document.documentElement, matchMedia) && Math.random() < 0.5 && this.cells.length) {
      const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
      cell.g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      this.dirty = true;
    }
    if (this.dirty) {
      this.draw();
      this.dirty = false;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
