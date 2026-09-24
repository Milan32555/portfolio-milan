/**
 * Diagnóstico del hero 3D, solo con `?diag` en la URL: registra cada paso de la carga y
 * los errores (incluidos los de compilación de shaders que three manda a console.error)
 * para mostrarlos en pantalla en teléfonos reales, donde no hay consola a mano.
 */

type Listener = () => void;

const events: string[] = [];
const listeners = new Set<Listener>();
let enabled = false;

function push(line: string) {
  events.push(`${Math.round(performance.now())}ms ${line}`);
  listeners.forEach((l) => l());
}

/** Activa el registro si la URL trae `?diag`. Idempotente. */
export function initHeroDiag(): boolean {
  if (enabled || typeof window === "undefined") return enabled;
  if (!new URLSearchParams(window.location.search).has("diag")) return false;
  enabled = true;
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    push(`console.error: ${args.map(String).join(" ").slice(0, 600)}`);
    original(...args);
  };
  window.addEventListener("error", (e) => push(`window error: ${e.message}`));
  window.addEventListener("unhandledrejection", (e) => push(`promesa rechazada: ${String(e.reason)}`));
  return true;
}

export function diagLog(line: string) {
  if (enabled) push(line);
}

export function diagError(where: string, err: unknown) {
  if (!enabled) return;
  const e = err instanceof Error ? `${err.name}: ${err.message}\n${(err.stack ?? "").split("\n").slice(0, 4).join("\n")}` : String(err);
  push(`ERROR en ${where}: ${e}`);
}

export function diagEvents(): readonly string[] {
  return events;
}

export function subscribeDiag(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

let gpuLines: string[] | null = null;

/** WebGL 2 del dispositivo, medido una sola vez con un canvas aparte (cada contexto nuevo
 * cuenta para el límite de Chrome y podría hacerle perder el suyo a la escena). */
function gpuReport(): string[] {
  if (gpuLines) return gpuLines;
  const lines: string[] = [];
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) {
      lines.push("webgl2: NO disponible");
    } else {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const points = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
      lines.push(`webgl2: sí · gpu: ${renderer}`);
      lines.push(`max textura: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)} · point size: ${points[0]}–${points[1]}`);
      const hp = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
      lines.push(`highp vertex: ${hp ? hp.precision : "?"}`);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch (err) {
    lines.push(`webgl2: error al consultar (${String(err)})`);
  }
  gpuLines = lines;
  return lines;
}

/** Datos del dispositivo, del WebGL 2 y del estado actual del hero. */
export function deviceReport(): string[] {
  const lines = [
    `ua: ${navigator.userAgent}`,
    `núcleos: ${navigator.hardwareConcurrency} · dpr: ${window.devicePixelRatio} · viewport: ${window.innerWidth}x${window.innerHeight}`,
    `reduced-motion: ${matchMedia("(prefers-reduced-motion: reduce)").matches}`,
    ...gpuReport(),
  ];
  const root = document.documentElement;
  lines.push(`data-hero3d: ${root.getAttribute("data-hero3d")} · razón: ${root.getAttribute("data-hero3d-reason") ?? "-"}`);
  return lines;
}
