/**
 * Calendario del escaneo de "auditoría" (segundos desde que arranca la intro):
 * primer escaneo a los 3.2 s; luego cada 9.1 s: 2.4 s bajando por el nombre,
 * 1.6 s de desvanecido, 2.5 s mostrando "corregidos" y el resto en reposo.
 */
export const SCAN = { first: 3.2, duration: 2.4, fade: 1.6, settle: 2.5, period: 9.1 } as const;

/** Distancia (unidades de mundo) a la que un hallazgo pasa de rojo a verde. */
export const FIX_DISTANCE = 0.85;

export const FINDINGS = ["xss", "sqli", "secret expuesto", "csrf"] as const;

export type ScanPhase =
  | { kind: "idle" }
  | { kind: "scanning"; k: number }
  | { kind: "fading"; strength: number }
  | { kind: "settled" };

export function scanPhase(t: number): ScanPhase {
  if (t < SCAN.first) return { kind: "idle" };
  const local = (t - SCAN.first) % SCAN.period;
  if (local < SCAN.duration) return { kind: "scanning", k: local / SCAN.duration };
  if (local < SCAN.duration + SCAN.fade) return { kind: "fading", strength: 1 - (local - SCAN.duration) / SCAN.fade };
  if (local < SCAN.duration + SCAN.fade + SCAN.settle) return { kind: "settled" };
  return { kind: "idle" };
}

export function scanY(k: number, top: number, bottom: number): number {
  return top + (bottom - top) * k;
}

/** Hallazgos por encima de la línea: ya fueron escaneados. */
export function countFound(bugYs: readonly number[], y: number): number {
  return bugYs.filter((b) => b > y).length;
}

export type FindingState = "off" | "found" | "fixed";

export function findingState(bugY: number, y: number, active: boolean): FindingState {
  if (!active) return "off";
  const dy = bugY - y;
  if (dy <= 0) return "off";
  return dy > FIX_DISTANCE ? "fixed" : "found";
}

export type AuditView =
  | { kind: "idle" }
  | { kind: "scanning"; pct: number; found: number }
  | { kind: "fixed"; total: number }
  | { kind: "egg" };

export function auditView(phase: ScanPhase, bugYs: readonly number[], y: number, egg: boolean): AuditView {
  if (egg) return { kind: "egg" };
  if (phase.kind === "scanning") return { kind: "scanning", pct: Math.round(phase.k * 100), found: countFound(bugYs, y) };
  if (phase.kind === "fading" || phase.kind === "settled") return { kind: "fixed", total: bugYs.length };
  return { kind: "idle" };
}

export type Tone = "ok" | "warn" | "bug";
export interface AuditLine {
  command: string;
  parts: Array<{ text: string; tone: Tone }>;
}

/** Lo que dice la esquina inferior derecha del hero. */
export function auditLine(view: AuditView): AuditLine {
  switch (view.kind) {
    case "egg":
      return { command: "$ whoami", parts: [{ text: "→ /sobre-mi", tone: "ok" }] };
    case "scanning": {
      const parts: AuditLine["parts"] = [{ text: `escaneando ${view.pct}%`, tone: "warn" }];
      if (view.found > 0) parts.push({ text: ` · ${view.found} hallazgo${view.found > 1 ? "s" : ""}`, tone: "bug" });
      return { command: "$ audit ./misael", parts };
    }
    case "fixed":
      return { command: "$ audit ./misael", parts: [{ text: `✓ ${view.total} hallazgos corregidos`, tone: "ok" }] };
    default:
      return { command: "$ audit ./misael", parts: [{ text: "✓ limpio", tone: "ok" }] };
  }
}
