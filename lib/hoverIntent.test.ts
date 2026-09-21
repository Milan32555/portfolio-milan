import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HOVER_INTENT_MS, isRealMouseMove } from "./hoverIntent.ts";

describe("isRealMouseMove", () => {
  it("acepta un mouse que se movió", () => {
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 3, movementY: 0 }), true);
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 0, movementY: -2 }), true);
  });

  it("rechaza eventos sintéticos sin movimiento (el layout se movió, no el mouse)", () => {
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 0, movementY: 0 }), false);
  });

  it("rechaza touch y lápiz aunque reporten movimiento", () => {
    assert.equal(isRealMouseMove({ pointerType: "touch", movementX: 5, movementY: 5 }), false);
    assert.equal(isRealMouseMove({ pointerType: "pen", movementX: 5, movementY: 5 }), false);
  });
});

describe("HOVER_INTENT_MS", () => {
  it("es un retraso corto pero perceptible", () => {
    assert.ok(HOVER_INTENT_MS >= 100 && HOVER_INTENT_MS <= 250);
  });
});
