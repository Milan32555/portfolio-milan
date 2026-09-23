import type { StageEvent } from "../gate/progress.ts";

export type GateState = "unknown" | "active" | "open";
type StartFn = (fromDoor: boolean) => void;

/**
 * Coordina el loader y el hero sin acoplarlos:
 * - el hero reporta etapas reales de carga (report) y el loader las muestra (subscribe);
 * - el hero pide arrancar su intro (requestStart) y el loader decide cuándo (openGate).
 * Vive como módulo: su estado sobrevive a la navegación del lado del cliente, así que
 * volver al home desde otra página no vuelve a mostrar el muro.
 */
export function createIntroBus() {
  let gate: GateState = "unknown";
  let stages: StageEvent[] = [];
  const listeners = new Set<(e: StageEvent) => void>();
  let pending: StartFn | null = null;

  return {
    report(e: StageEvent) {
      stages.push(e);
      listeners.forEach((l) => l(e));
    },
    subscribe(listener: (e: StageEvent) => void): () => void {
      stages.forEach(listener);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    gateState: (): GateState => gate,
    activateGate() {
      gate = "active";
    },
    openGate(fromDoor: boolean) {
      gate = "open";
      // Las etapas solo le sirven al muro mientras carga: abierto, ya nadie las necesita.
      stages = [];
      const fn = pending;
      pending = null;
      fn?.(fromDoor);
    },
    /**
     * Un solo consumidor (el hero): un segundo pedido reemplaza al anterior. Es lo que
     * se quiere cuando React monta el efecto dos veces: el primer montaje ya está muerto.
     */
    requestStart(fn: StartFn) {
      if (gate === "open") fn(false);
      else pending = fn;
    },
    reset() {
      gate = "unknown";
      stages = [];
      pending = null;
      listeners.clear();
    },
  };
}

export type IntroBus = ReturnType<typeof createIntroBus>;

export const introBus: IntroBus = createIntroBus();
