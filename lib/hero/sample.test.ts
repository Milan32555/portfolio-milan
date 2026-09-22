import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../cover.ts";
import { pickFindings, sampleMask, shuffle } from "./sample.ts";

/** RGBA de w×h con alfa 255 donde `on(x, y)` es verdadero. */
function mask(w: number, h: number, on: (x: number, y: number) => boolean): Uint8ClampedArray {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y)) d[(y * w + x) * 4 + 3] = 255;
  return d;
}

describe("sampleMask", () => {
  it("devuelve solo los píxeles opacos, recorriendo con el paso dado", () => {
    const d = mask(4, 4, (x) => x < 2);
    assert.deepEqual(sampleMask(d, 4, 4, 2), [[0, 0], [0, 2]]);
    assert.equal(sampleMask(d, 4, 4, 1).length, 8);
  });

  it("respeta el umbral de alfa", () => {
    const d = new Uint8ClampedArray(4);
    d[3] = 100;
    assert.equal(sampleMask(d, 1, 1, 1).length, 0);
    assert.equal(sampleMask(d, 1, 1, 1, 50).length, 1);
  });
});

describe("pickFindings", () => {
  const xs = Array.from({ length: 100 }, (_, i) => i);
  const excluded = xs.map((x) => x >= 95); // el "punto" del nombre

  it("elige n índices distintos, ninguno excluido, repartidos a lo ancho", () => {
    const picks = pickFindings(xs, excluded, 4, mulberry32(7));
    assert.equal(picks.length, 4);
    assert.equal(new Set(picks).size, 4);
    picks.forEach((i) => assert.equal(excluded[i], false));
    const sorted = [...picks].sort((a, b) => a - b);
    assert.deepEqual(picks, sorted);
    assert.ok(picks[0] < 25 && picks[3] >= 70);
  });

  it("si hay menos candidatos que n, devuelve los que hay", () => {
    assert.deepEqual(pickFindings([3, 1], [false, false], 4, mulberry32(1)), [1, 0]);
  });
});

describe("shuffle", () => {
  it("devuelve una permutación sin tocar el arreglo original", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const out = shuffle(items, mulberry32(3));
    assert.deepEqual([...out].sort(), items);
    assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
  });
});
