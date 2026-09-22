import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { coverLayers, hueFor } from "./cover.ts";

describe("hueFor", () => {
  it("es estable y cae en el rango azul-verdoso 185..230", () => {
    for (const slug of ["medi-ia", "animalvision", "library-system", "safe-transfer-ai"]) {
      const h = hueFor(slug);
      assert.equal(h, hueFor(slug));
      assert.ok(h >= 185 && h <= 230, `${slug} → ${h}`);
    }
  });
});

describe("coverLayers", () => {
  it("es determinista: misma entrada, mismas capas", () => {
    assert.deepEqual(coverLayers(42, 480, 300, 200), coverLayers(42, 480, 300, 200));
  });

  it("cambia con la semilla", () => {
    assert.notEqual(coverLayers(1, 480, 300, 200)[0].d, coverLayers(2, 480, 300, 200)[0].d);
  });

  it("devuelve 3 capas, las dos primeras con halftone", () => {
    const layers = coverLayers(7, 480, 300, 200);
    assert.equal(layers.length, 3);
    assert.deepEqual(layers.map((l) => l.dots), [true, true, false]);
  });

  it("genera paths SVG cerrados y con números finitos", () => {
    for (const l of coverLayers(9, 840, 360, 210)) {
      assert.ok(l.d.startsWith("M-40 "));
      assert.ok(l.d.endsWith(" Z"));
      const nums = l.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      assert.ok(nums.length > 100);
      assert.ok(nums.every(Number.isFinite));
    }
  });

  it("las capas se oscurecen de fondo a frente", () => {
    const lightness = coverLayers(3, 480, 300, 200).map((l) => Number(l.fill.match(/(\d+)%\)$/)![1]));
    assert.deepEqual(lightness, [...lightness].sort((a, b) => b - a));
  });
});
