import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RIDGES, MIST, buildStars, buildVillage, ridgePath, ridgeY } from "./footerScene.ts";

describe("RIDGES", () => {
  it("son 5 crestas, de atrás hacia adelante cada vez más oscuras", () => {
    assert.equal(RIDGES.length, 5);
    // los colores van de más claro/azulado a casi negro (comparamos por longitud del canal, aproximación simple)
    const darkness = RIDGES.map((r) => parseInt(r.color.slice(1), 16));
    for (let i = 1; i < darkness.length; i++) assert.ok(darkness[i] < darkness[i - 1], `capa ${i} no es más oscura que la anterior`);
  });

  it("solo las primeras 4 llevan halftone; la última no", () => {
    assert.deepEqual(
      RIDGES.map((r) => r.dots !== null),
      [true, true, true, true, false],
    );
  });
});

describe("ridgeY / ridgePath", () => {
  it("es determinista: misma cresta, mismo resultado", () => {
    const a = ridgePath(RIDGES[0]);
    const b = ridgePath(RIDGES[0]);
    assert.deepEqual(a, b);
  });

  it("cada cresta es distinta de las demás", () => {
    const paths = RIDGES.map((r) => ridgePath(r).d);
    assert.equal(new Set(paths).size, paths.length);
  });

  it("genera un path SVG cerrado, con números finitos", () => {
    for (const spec of RIDGES) {
      const { d } = ridgePath(spec);
      assert.ok(d.startsWith("M-60 720"));
      assert.ok(d.endsWith(" L1500 720 Z"));
      const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      assert.ok(nums.length > 200);
      assert.ok(nums.every(Number.isFinite));
    }
  });

  it("minY cae dentro del alto de la escena (0..700)", () => {
    for (const spec of RIDGES) {
      const { minY } = ridgePath(spec);
      assert.ok(minY > 0 && minY < 700, `minY=${minY} fuera de rango para seed=${spec.seed}`);
    }
  });
});

describe("buildStars", () => {
  it("devuelve 120 estrellas por defecto, deterministas", () => {
    const a = buildStars();
    const b = buildStars();
    assert.equal(a.length, 120);
    assert.deepEqual(a, b);
  });

  it("el radio y el retraso de animación caen en rangos sensatos", () => {
    for (const s of buildStars()) {
      assert.ok(s.r >= 0.6 && s.r <= 1.9);
      assert.ok(s.delay >= 0 && s.delay <= 4);
    }
  });
});

describe("buildVillage", () => {
  it("devuelve 22 ventanas y 14 luciérnagas, deterministas", () => {
    const a = buildVillage();
    const b = buildVillage();
    assert.equal(a.windows.length, 22);
    assert.equal(a.fireflies.length, 14);
    assert.deepEqual(a, b);
  });

  it("las ventanas quedan sobre la cresta de la capa 3 (con el margen de 8-18px)", () => {
    const { windows } = buildVillage();
    for (const w of windows) {
      const y3 = ridgeY(RIDGES[2], w.x);
      assert.ok(w.y >= y3 + 8 && w.y <= y3 + 18, `ventana en x=${w.x}: y=${w.y}, cresta=${y3}`);
    }
  });

  it("las luciérnagas tienen duración y retraso positivos", () => {
    for (const f of buildVillage().fireflies) {
      assert.ok(f.duration >= 8 && f.duration <= 14);
      assert.ok(f.delay >= 0 && f.delay <= 8);
    }
  });
});

describe("MIST", () => {
  it("son 3 bandas, una por cada capa media (L2, L3, L4)", () => {
    assert.equal(MIST.length, 3);
    for (const m of MIST) assert.ok(m.duration > 0 && m.opacity > 0 && m.opacity < 1);
  });
});
