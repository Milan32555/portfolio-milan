import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { ATLAS, BUG_GLYPH, EGG_TEXT, EGG_WORD, GLYPHS, GLYPH_COUNT, NAME_BASE, NAME_TEXT } from "@/lib/hero/glyphs";
import { pickFindings, sampleMask, shuffle } from "@/lib/hero/sample";
import { FINDINGS, auditView, findingState, scanPhase, scanY, type AuditView, type ScanPhase } from "@/lib/hero/scan";
import { decideQuality, qualitySettings, type Quality } from "@/lib/hero/quality";
import type { ThemeName } from "@/lib/a11y";
import { FRAG, VERT } from "./shaders";
import { PALETTES } from "./palettes";

export interface HeroSceneOptions {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Caja que reserva el alto del nombre en el layout. */
  slot: HTMLElement;
  /** El <h1> de texto: su tamaño se ajusta al del nombre de glifos. */
  nameEl: HTMLElement;
  /** Una etiqueta por hallazgo, en el orden de FINDINGS. */
  findingEls: HTMLElement[];
  fonts: { serif: string; mono: string };
  theme: ThemeName;
  reduced: boolean;
  onAudit: (view: AuditView) => void;
  onEgg: (active: boolean) => void;
  onEggNavigate: () => void;
}

const CAMERA_Z = 10;
const INTRO_MS = 2600;
const PROGRESS_DONE = 1.2;
const EGG_MS = 7000;
const MORPH_SECONDS = 1.3;
const BENCH_MS = 400;
const FS = 300;

interface Attrs {
  aTarget: number[];
  aStart: number[];
  aDoor: number[];
  aTarget2: number[];
  aGlyph: number[];
  aSeed: number[];
  aDot: number[];
  aBug: number[];
}
const VEC3_ATTRS: ReadonlyArray<keyof Attrs> = ["aTarget", "aStart", "aDoor", "aTarget2"];

function emptyAttrs(): Attrs {
  return { aTarget: [], aStart: [], aDoor: [], aTarget2: [], aGlyph: [], aSeed: [], aDot: [], aBug: [] };
}

function geometryFrom(a: Attrs): BufferGeometry {
  const g = new BufferGeometry();
  const aTargetAttr = new Float32BufferAttribute(a.aTarget, 3);
  g.setAttribute("position", aTargetAttr);
  for (const key of Object.keys(a) as Array<keyof Attrs>) {
    g.setAttribute(key, key === "aTarget" ? aTargetAttr : new Float32BufferAttribute(a[key], VEC3_ATTRS.includes(key) ? 3 : 1));
  }
  return g;
}

function createUniforms(pixelRatio: number, reduced: boolean, atlas: CanvasTexture) {
  return {
    uTime: { value: 0 },
    uProgress: { value: reduced ? PROGRESS_DONE : 0 },
    uScan: { value: -100 },
    uScanOn: { value: 0 },
    uPR: { value: pixelRatio },
    uSize: { value: 10 },
    uMouse: { value: new Vector2(99, 99) },
    uMouseStr: { value: 0 },
    uClick: { value: new Vector2(99, 99) },
    uClickT: { value: -100 },
    uScroll: { value: 0 },
    uN: { value: GLYPH_COUNT },
    uMorph: { value: 0 },
    uDoor: { value: 0 },
    uDrift: { value: reduced ? 0 : 1 },
    uBugGlyph: { value: BUG_GLYPH },
    uAtlas: { value: atlas },
    uGrid: { value: new Vector2(ATLAS.cols, ATLAS.rows) },
    uBase: { value: new Vector3() },
    uAccent: { value: new Vector3() },
    uAmber: { value: new Vector3() },
    uRed: { value: new Vector3() },
    uGreen: { value: new Vector3() },
    uAlphaMul: { value: 1 },
  };
}
type Uniforms = ReturnType<typeof createUniforms>;

export class HeroScene {
  /** Glifos que forman el nombre (se muestra en el log del loader). */
  count = 0;
  /** fps medidos; null si se reutilizó la calidad guardada. */
  fps: number | null = null;

  private opts: HeroSceneOptions;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private group = new Group();
  private atlasCanvas = document.createElement("canvas");
  private atlas: CanvasTexture;
  private uniforms: Uniforms;
  private dustAlpha = { value: 1 };
  private material: ShaderMaterial;
  private dustMaterial: ShaderMaterial;
  private scanLine: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private points: Points | null = null;
  private dust: Points | null = null;
  private view = { w: 1, h: 1, worldW: 1, worldH: 1 };
  private bugPos: Array<[number, number, number]> = [];
  private nameTop = 1;
  private nameBottom = -1;
  private quality: Quality = "normal";
  private pixelRatio: number;
  private reduced: boolean;
  private staticMode = false;
  private inkAtlas: boolean | null = null;
  private running = false;
  private visible = true;
  private dirty = true;
  private introStart: number | null = null;
  private disposed = false;
  private t0 = performance.now();
  private last = performance.now();
  private raf = 0;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0, wx: 99, wy: 99, twx: 99, twy: 99, str: 0, tstr: 0 };
  private morphTarget = 0;
  private eggTimer = 0;
  private keyBuffer = "";
  private lastAudit = "";
  private v = new Vector3();
  private cleanups: Array<() => void> = [];

  constructor(opts: HeroSceneOptions) {
    this.opts = opts;
    this.reduced = opts.reduced;
    // Lanza si no hay contexto WebGL: Hero.tsx lo atrapa y cae al hero de texto.
    this.renderer = new WebGLRenderer({ canvas: opts.canvas, antialias: false, alpha: true });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, qualitySettings("normal", opts.host.clientWidth).pixelRatioCap);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.camera.position.z = CAMERA_Z;
    this.scene.add(this.group);

    this.atlasCanvas.width = ATLAS.cols * ATLAS.cell;
    this.atlasCanvas.height = ATLAS.rows * ATLAS.cell;
    this.atlas = new CanvasTexture(this.atlasCanvas);
    this.uniforms = createUniforms(this.pixelRatio, this.reduced, this.atlas);

    const shared = { vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false };
    this.material = new ShaderMaterial({ uniforms: this.uniforms, ...shared });
    this.dustMaterial = new ShaderMaterial({ uniforms: { ...this.uniforms, uAlphaMul: this.dustAlpha }, ...shared });
    this.scanLine = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    this.group.add(this.scanLine);

    this.setTheme(opts.theme);
    this.build();
    this.bindEvents();
  }

  // ─── API pública ────────────────────────────────────────────────────────────

  /** Decide la calidad: reutiliza la guardada o mide ~0.4 s con las partículas aún invisibles. */
  async prepare(cached: Quality | null): Promise<Quality> {
    if (cached) {
      this.applyQuality(cached);
      return cached;
    }
    if (this.reduced) return this.quality;
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
    const start = performance.now();
    let frames = 0;
    let hidden = false;
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        if (this.disposed) {
          resolve();
          return;
        }
        if (document.hidden) {
          hidden = true;
          resolve();
          return;
        }
        this.renderer.render(this.scene, this.camera);
        frames++;
        if (now - start < BENCH_MS) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    if (hidden) {
      this.fps = null;
      return this.quality;
    }
    const fps = frames / ((performance.now() - start) / 1000);
    this.fps = Math.round(fps);
    const q = decideQuality(fps);
    this.applyQuality(q);
    return q;
  }

  /** Arranca la intro. Con `fromDoor`, los glifos salen de la rendija del loader. */
  startIntro(fromDoor: boolean) {
    this.uniforms.uDoor.value = fromDoor ? 1 : 0;
    this.t0 = performance.now();
    this.introStart = this.t0;
    if (this.reduced) this.uniforms.uProgress.value = PROGRESS_DONE;
    this.resume();
  }

  setTheme(name: ThemeName) {
    const p = PALETTES[name];
    const u = this.uniforms;
    u.uBase.value.fromArray(p.base);
    u.uAccent.value.fromArray(p.accent);
    u.uAmber.value.fromArray(p.amber);
    u.uRed.value.fromArray(p.red);
    u.uGreen.value.fromArray(p.green);
    for (const m of [this.material, this.dustMaterial]) {
      m.blending = p.blending;
      m.needsUpdate = true;
    }
    this.scanLine.material.color.setHex(p.scan);
    this.scanLine.material.blending = p.blending;
    this.scanLine.material.needsUpdate = true;
    this.dustAlpha.value = p.dustAlpha;
    if (this.inkAtlas !== p.ink) {
      this.inkAtlas = p.ink;
      this.drawAtlas(p.ink);
    }
    this.dirty = true;
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    const u = this.uniforms;
    u.uDrift.value = reduced ? 0 : 1;
    if (reduced) {
      u.uProgress.value = PROGRESS_DONE;
      u.uScanOn.value = 0;
      u.uScan.value = -100;
      u.uClickT.value = -100;
      u.uMorph.value = this.morphTarget;
      this.scanLine.material.opacity = 0;
      Object.assign(this.mouse, { tstr: 0, str: 0, tx: 0, ty: 0, x: 0, y: 0 });
      this.hideFindings();
    }
    this.dirty = true;
  }

  /** Alto contraste / dislexia: CSS oculta el canvas; aquí solo se deja de dibujar. */
  setStatic(on: boolean) {
    this.staticMode = on;
    if (on) {
      this.hideFindings();
      this.pause();
    } else {
      this.resume();
    }
  }

  dispose() {
    this.disposed = true;
    this.pause();
    window.clearTimeout(this.eggTimer);
    this.cleanups.forEach((fn) => fn());
    this.points?.geometry.dispose();
    this.dust?.geometry.dispose();
    this.material.dispose();
    this.dustMaterial.dispose();
    this.scanLine.geometry.dispose();
    this.scanLine.material.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ─── Construcción ───────────────────────────────────────────────────────────

  private drawAtlas(ink: boolean) {
    const a = this.atlasCanvas.getContext("2d");
    if (!a) return;
    a.clearRect(0, 0, this.atlasCanvas.width, this.atlasCanvas.height);
    a.fillStyle = "#fff";
    a.strokeStyle = "#fff";
    a.lineWidth = 5;
    a.lineJoin = "round";
    a.textAlign = "center";
    a.textBaseline = "middle";
    a.font = `500 46px ${this.opts.fonts.mono}`;
    for (let i = 0; i < GLYPH_COUNT; i++) {
      const x = (i % ATLAS.cols) * ATLAS.cell + ATLAS.cell / 2;
      const y = Math.floor(i / ATLAS.cols) * ATLAS.cell + ATLAS.cell / 2 + 2;
      if (ink) a.strokeText(GLYPHS[i], x, y);
      a.fillText(GLYPHS[i], x, y);
    }
    this.atlas.needsUpdate = true;
  }

  private applyQuality(q: Quality) {
    if (q === this.quality) return;
    this.quality = q;
    const s = qualitySettings(q, this.opts.host.clientWidth);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, s.pixelRatioCap);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.uniforms.uPR.value = this.pixelRatio;
    this.build();
  }

  private build() {
    const { host, slot, nameEl, fonts } = this.opts;
    const W = host.clientWidth;
    const H = host.clientHeight;
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    const worldH = 2 * CAMERA_Z * Math.tan(MathUtils.degToRad(this.camera.fov / 2));
    const worldW = worldH * this.camera.aspect;
    this.view = { w: W, h: H, worldW, worldH };
    const pxToWorld = worldH / H;
    const settings = qualitySettings(this.quality, W);

    // 1. "Misael." en un canvas 2D con la serif real, a la escala en pantalla.
    const targetPxW = Math.min(W * 0.9, 1000);
    const c = document.createElement("canvas");
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return;
    const serif = `${FS}px ${fonts.serif}`;
    x.font = serif;
    const wName = x.measureText(NAME_BASE).width;
    const wAll = x.measureText(NAME_TEXT).width;
    const toScreen = targetPxW / wAll;
    slot.style.height = `${Math.round(toScreen * FS * 0.95)}px`;
    nameEl.style.fontSize = `${(toScreen * FS).toFixed(1)}px`;
    c.width = Math.ceil(wAll) + 20;
    c.height = Math.ceil(FS * 1.15);
    x.font = serif;
    x.fillStyle = "#fff";
    x.textBaseline = "middle";
    x.fillText(NAME_TEXT, 10, c.height / 2);

    const screenGap = (W < 600 ? 3.6 : 5.6) * settings.spacingScale;
    const gap = Math.max(2, Math.round(screenGap / toScreen));
    this.uniforms.uSize.value = screenGap * (W < 600 ? 1.7 : 1.55);
    const slotRect = slot.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const centerY = (H / 2 - (slotRect.top + slotRect.height / 2 - hostRect.top)) * pxToWorld;
    const pts = sampleMask(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height, gap);

    // 2. Un glifo por punto: destino, origen disperso, origen en la rendija, glifo, semilla.
    const A = emptyAttrs();
    const xs: number[] = [];
    for (const [px, py] of pts) {
      const sx = (px - 10 - wAll / 2) * toScreen * pxToWorld;
      const sy = -(py - c.height / 2) * toScreen * pxToWorld + centerY;
      A.aTarget.push(sx, sy, (Math.random() - 0.5) * 0.08);
      const r = 6 + Math.random() * 8;
      const th = Math.random() * Math.PI * 2;
      A.aStart.push(Math.cos(th) * r, Math.sin(th) * r * 0.6, -8 + Math.random() * 14);
      A.aDoor.push((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * worldH * 0.95, -1.5 + Math.random() * 2.5);
      A.aGlyph.push(Math.floor(Math.random() * GLYPH_COUNT));
      A.aSeed.push(Math.random());
      A.aDot.push(px - 10 > wName + 4 ? 1 : 0);
      A.aBug.push(0);
      xs.push(sx);
    }
    const n = pts.length;
    this.count = n;

    // 3. Los 4 hallazgos, repartidos a lo ancho del nombre (nunca en el punto).
    this.bugPos = pickFindings(xs, A.aDot.map((d) => d === 1), FINDINGS.length, Math.random).map((i) => {
      A.aBug[i] = 1;
      return [A.aTarget[i * 3], A.aTarget[i * 3 + 1], A.aTarget[i * 3 + 2]] as [number, number, number];
    });
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 1; i < A.aTarget.length; i += 3) {
      minY = Math.min(minY, A.aTarget[i]);
      maxY = Math.max(maxY, A.aTarget[i]);
    }
    this.nameTop = maxY + 0.35;
    this.nameBottom = minY - 0.35;

    // 4. Destino del easter egg: "/sobre-mi →" en la mono, misma escala.
    const c2 = document.createElement("canvas");
    const x2 = c2.getContext("2d", { willReadFrequently: true });
    if (!x2) return;
    const mono = `500 ${FS}px ${fonts.mono}`;
    x2.font = mono;
    const w2 = x2.measureText(EGG_TEXT).width;
    c2.width = Math.ceil(w2) + 20;
    c2.height = Math.ceil(FS * 1.15);
    x2.font = mono;
    x2.fillStyle = "#fff";
    x2.textBaseline = "middle";
    x2.fillText(EGG_TEXT, 10, c2.height / 2);
    const sc2 = Math.min(targetPxW * 0.8, W * 0.92) / w2;
    const gap2 = Math.max(2, Math.round((screenGap * 0.8) / sc2));
    const eggPts = shuffle(sampleMask(x2.getImageData(0, 0, c2.width, c2.height).data, c2.width, c2.height, gap2), Math.random);
    for (let i = 0; i < n; i++) {
      const [ex, ey] = eggPts[i % eggPts.length];
      const jitter = i >= eggPts.length ? (Math.random() - 0.5) * 0.03 : 0;
      A.aTarget2.push((ex - 10 - w2 / 2) * sc2 * pxToWorld + jitter, -(ey - c2.height / 2) * sc2 * pxToWorld + centerY, (Math.random() - 0.5) * 0.08);
    }
    this.points = this.replace(this.points, geometryFrom(A), this.material);

    // 5. Polvo de glifos en profundidad.
    const D = emptyAttrs();
    for (let i = 0; i < settings.dust; i++) {
      const z = -3 - Math.random() * 9;
      const k = (CAMERA_Z - z) / CAMERA_Z;
      const p = [(Math.random() - 0.5) * worldW * k * 1.1, (Math.random() - 0.5) * worldH * k * 1.1, z];
      D.aTarget.push(...p);
      D.aStart.push(...p);
      D.aDoor.push(...p);
      D.aTarget2.push(...p);
      D.aGlyph.push(Math.floor(Math.random() * GLYPH_COUNT));
      D.aSeed.push(0.2 + Math.random() * 0.3);
      D.aDot.push(0);
      D.aBug.push(0);
    }
    this.dust = this.replace(this.dust, geometryFrom(D), this.dustMaterial);
    this.dust.renderOrder = -1;

    this.scanLine.scale.set(worldW * 1.2, 0.006, 1);
    this.dirty = true;
  }

  private replace(old: Points | null, geometry: BufferGeometry, material: ShaderMaterial): Points {
    if (old) {
      this.group.remove(old);
      old.geometry.dispose();
    }
    const p = new Points(geometry, material);
    p.frustumCulled = false;
    this.group.add(p);
    return p;
  }

  // ─── Eventos ────────────────────────────────────────────────────────────────

  private listen(target: EventTarget, type: string, fn: EventListener, options?: AddEventListenerOptions) {
    target.addEventListener(type, fn, options);
    this.cleanups.push(() => target.removeEventListener(type, fn, options));
  }

  private bindEvents() {
    const { host } = this.opts;
    const toNdc = (e: PointerEvent): [number, number] => {
      const r = host.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
    };

    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      this.listen(host, "pointermove", (ev) => {
        if (this.reduced || this.staticMode) return;
        const [nx, ny] = toNdc(ev as PointerEvent);
        Object.assign(this.mouse, { tx: nx, ty: ny, twx: (nx * this.view.worldW) / 2, twy: (ny * this.view.worldH) / 2, tstr: 1 });
      });
      this.listen(host, "pointerleave", () => Object.assign(this.mouse, { tstr: 0, tx: 0, ty: 0 }));
    }

    this.listen(host, "pointerdown", (ev) => {
      const e = ev as PointerEvent;
      if (this.reduced || this.staticMode || (e.target as Element).closest("a,button")) return;
      const [nx, ny] = toNdc(e);
      this.uniforms.uClick.value.set((nx * this.view.worldW) / 2, (ny * this.view.worldH) / 2);
      this.uniforms.uClickT.value = this.uniforms.uTime.value;
    });

    this.listen(host, "click", (ev) => {
      if (this.morphTarget === 1 && !(ev.target as Element).closest("a,button")) this.opts.onEggNavigate();
    });

    this.listen(window, "keydown", (ev) => this.onKey(ev as KeyboardEvent));

    this.listen(
      window,
      "scroll",
      () => {
        this.uniforms.uScroll.value = Math.min(1, Math.max(0, window.scrollY / (host.clientHeight * 0.75)));
        this.dirty = true;
      },
      { passive: true },
    );

    let resizeTimer = 0;
    this.listen(window, "resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (host.clientWidth === this.view.w && host.clientHeight === this.view.h) return;
        this.build();
      }, 150);
    });
    this.cleanups.push(() => window.clearTimeout(resizeTimer));

    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      this.visible = entry.isIntersecting;
      if (this.visible) this.resume();
      else this.pause();
    });
    io.observe(host);
    this.cleanups.push(() => io.disconnect());

    this.listen(document, "visibilitychange", () => (document.hidden ? this.pause() : this.resume()));
  }

  private onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === "Enter" && this.morphTarget === 1) {
      if (t?.closest('a,button,summary,[role="button"],[role="link"]')) return;
      e.preventDefault();
      this.opts.onEggNavigate();
      return;
    }
    if (e.key.length !== 1) return;
    this.keyBuffer = (this.keyBuffer + e.key.toLowerCase()).slice(-EGG_WORD.length);
    if (
      this.keyBuffer === EGG_WORD &&
      this.introStart !== null &&
      !this.staticMode &&
      window.scrollY < this.opts.host.clientHeight * 0.5
    )
      this.triggerEgg();
  }

  private triggerEgg() {
    this.morphTarget = 1;
    this.opts.onEgg(true);
    if (this.reduced) {
      this.uniforms.uMorph.value = 1;
      this.dirty = true;
    }
    window.clearTimeout(this.eggTimer);
    this.eggTimer = window.setTimeout(() => {
      this.morphTarget = 0;
      this.opts.onEgg(false);
      if (this.reduced) {
        this.uniforms.uMorph.value = 0;
        this.dirty = true;
      }
    }, EGG_MS);
  }

  // ─── Bucle ──────────────────────────────────────────────────────────────────

  private pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private resume() {
    if (this.running || this.staticMode || !this.visible || document.hidden || this.introStart === null) return;
    this.running = true;
    this.dirty = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private hideFindings() {
    this.opts.findingEls.forEach((el) => (el.dataset.state = "off"));
  }

  private emitAudit(view: AuditView) {
    const key = JSON.stringify(view);
    if (key === this.lastAudit) return;
    this.lastAudit = key;
    this.opts.onAudit(view);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    // Con movimiento reducido solo se dibuja cuando algo cambió (no gasta batería).
    if (this.reduced && !this.dirty) return;
    this.dirty = false;

    const u = this.uniforms;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const t = (now - this.t0) / 1000;
    u.uTime.value = t;
    if (!this.reduced && this.introStart !== null) {
      u.uProgress.value = Math.min(PROGRESS_DONE, ((now - this.introStart) / INTRO_MS) * PROGRESS_DONE);
    }

    const m = this.mouse;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    m.wx += (m.twx - m.wx) * 0.12;
    m.wy += (m.twy - m.wy) * 0.12;
    m.str += (m.tstr - m.str) * 0.06;
    u.uMouse.value.set(m.wx, m.wy);
    u.uMouseStr.value = m.str;
    this.group.rotation.y = m.x * 0.09;
    this.group.rotation.x = -m.y * 0.05;

    if (!this.reduced) {
      const step = dt / MORPH_SECONDS;
      u.uMorph.value = this.morphTarget ? Math.min(1, u.uMorph.value + step) : Math.max(0, u.uMorph.value - step);
    }
    const egging = u.uMorph.value > 0.001;

    const introDone = u.uProgress.value >= PROGRESS_DONE;
    const phase: ScanPhase = !this.reduced && !egging && introDone ? scanPhase(t) : { kind: "idle" };
    let y = -100;
    let on = 0;
    if (phase.kind === "scanning") {
      y = scanY(phase.k, this.nameTop, this.nameBottom);
      on = 1;
      this.scanLine.position.y = y;
      this.scanLine.material.opacity = 0.6 * Math.min(1, Math.sin(Math.PI * phase.k) * 2.5);
    } else {
      this.scanLine.material.opacity = 0;
      if (phase.kind === "fading") {
        y = this.nameBottom;
        on = phase.strength;
      }
    }
    u.uScan.value = y;
    u.uScanOn.value = on;
    this.emitAudit(auditView(phase, this.bugPos.map((b) => b[1]), y, egging));

    // Etiquetas de hallazgos proyectadas desde la posición 3D de cada glifo.
    this.group.updateMatrixWorld();
    const active = (phase.kind === "scanning" || (phase.kind === "fading" && phase.strength > 0.25)) && u.uScroll.value < 0.05;
    this.opts.findingEls.forEach((el, i) => {
      const b = this.bugPos[i];
      if (!b) return;
      const state = findingState(b[1], y, active);
      if (state !== "off") {
        this.v.set(b[0], b[1], b[2]).applyMatrix4(this.group.matrixWorld).project(this.camera);
        const left = ((this.v.x + 1) / 2) * this.view.w + 10;
        const top = ((1 - this.v.y) / 2) * this.view.h - 26;
        el.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
      }
      if (el.dataset.state !== state) el.dataset.state = state;
    });

    this.renderer.render(this.scene, this.camera);
  };
}
