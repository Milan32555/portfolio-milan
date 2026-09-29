import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { approach, followFactor, glowScale } from "./cursor.ts";

describe("cursor", () => {
  it("el resplandor sigue al mouse con el factor J3 (0.22)", () => {
    assert.equal(followFactor(false), 0.22);
  });

  it("con movimiento reducido llega al instante", () => {
    assert.equal(followFactor(true), 1);
    assert.equal(approach(10, 300, followFactor(true)), 300);
  });

  it("approach avanza la fracción indicada", () => {
    assert.equal(approach(0, 100, 0.22), 22);
    assert.equal(approach(50, 50, 0.22), 50);
  });

  it("crece 1.4x sobre lo interactivo", () => {
    assert.equal(glowScale(true), 1.4);
    assert.equal(glowScale(false), 1);
  });
});
