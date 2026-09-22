import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createIntroBus } from "./bus.ts";

describe("createIntroBus", () => {
  it("guarda las etapas y se las repite a quien se suscribe tarde", () => {
    const bus = createIntroBus();
    bus.report({ stage: "fonts", label: "fuentes cargadas" });
    const seen: string[] = [];
    bus.subscribe((e) => seen.push(e.stage));
    bus.report({ stage: "three", label: "three.js listo" });
    assert.deepEqual(seen, ["fonts", "three"]);
  });

  it("dejar de escuchar funciona", () => {
    const bus = createIntroBus();
    const seen: string[] = [];
    const off = bus.subscribe((e) => seen.push(e.stage));
    off();
    bus.report({ stage: "ready", label: "x" });
    assert.deepEqual(seen, []);
  });

  it("si el muro está cerrado, la intro espera y sale desde la rendija al abrir", () => {
    const bus = createIntroBus();
    bus.activateGate();
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.deepEqual(calls, []);
    bus.openGate(true);
    assert.deepEqual(calls, [true]);
    assert.equal(bus.gateState(), "open");
  });

  it("si el muro ya está abierto, arranca de inmediato y sin rendija", () => {
    const bus = createIntroBus();
    bus.openGate(false);
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.deepEqual(calls, [false]);
  });

  it("mientras no se sabe si hay muro, también espera", () => {
    const bus = createIntroBus();
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.equal(bus.gateState(), "unknown");
    assert.deepEqual(calls, []);
  });

  it("un segundo pedido de arranque reemplaza al primero (un solo consumidor)", () => {
    const bus = createIntroBus();
    bus.activateGate();
    const calls: string[] = [];
    bus.requestStart(() => calls.push("viejo"));
    bus.requestStart(() => calls.push("nuevo"));
    bus.openGate(true);
    assert.deepEqual(calls, ["nuevo"]);
  });

  it("reset olvida etapas y estado", () => {
    const bus = createIntroBus();
    bus.report({ stage: "fonts", label: "a" });
    bus.openGate(false);
    bus.reset();
    const seen: string[] = [];
    bus.subscribe((e) => seen.push(e.stage));
    assert.deepEqual(seen, []);
    assert.equal(bus.gateState(), "unknown");
  });
});
