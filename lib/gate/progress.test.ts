import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GATE_MIN_MS, GATE_STAGES, stepProgress, wallAlpha } from "./progress.ts";

describe("GATE_STAGES", () => {
  it("son crecientes y terminan en 100", () => {
    const v = [GATE_STAGES.fonts, GATE_STAGES.three, GATE_STAGES.scene, GATE_STAGES.ready];
    assert.deepEqual(v, [...v].sort((a, b) => a - b));
    assert.equal(GATE_STAGES.ready, 100);
  });
});

describe("stepProgress", () => {
  it("nunca pasa de lo que de verdad cargó", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 55, GATE_MIN_MS * 2, false);
    assert.ok(d <= 55);
    assert.equal(d, 55);
  });

  it("nunca va más rápido que el mínimo de tiempo", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 100, GATE_MIN_MS / 2, false);
    assert.ok(d <= 50 + 1e-9);
  });

  it("con todo cargado y el tiempo cumplido, llega a 100", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 100, GATE_MIN_MS, false);
    assert.equal(d, 100);
  });

  it("con movimiento reducido salta directo a lo cargado", () => {
    assert.equal(stepProgress(0, 82, 0, true), 82);
  });
});

describe("wallAlpha", () => {
  it("los glifos encendidos y los cercanos al cursor brillan más, con tope", () => {
    assert.ok(wallAlpha(true, 0, false) > wallAlpha(false, 0, false));
    assert.ok(wallAlpha(false, 1, false) > wallAlpha(true, 0, false));
    assert.ok(wallAlpha(true, 1, true) <= 0.85);
  });
});
