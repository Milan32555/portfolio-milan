type SchedulerLike = { yield?: () => Promise<void> };

/**
 * Cede el hilo principal para que el navegador pinte y atienda la entrada entre dos
 * pasos de trabajo largo. `scheduler.yield()` retoma con prioridad (Chrome 129+); si no
 * existe, un `setTimeout(0)` abre una tarea nueva.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (typeof scheduler?.yield === "function") return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
