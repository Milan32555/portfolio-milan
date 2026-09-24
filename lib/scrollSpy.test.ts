import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickActive } from "./scrollSpy.ts";

const tops = (...values: number[]) => values.map((top, i) => ({ id: `s${i}`, top }));

describe("pickActive", () => {
  it("sin secciones devuelve cadena vacía", () => {
    assert.equal(pickActive([], 140), "");
  });

  it("antes de la primera sección, la primera está activa", () => {
    assert.equal(pickActive(tops(400, 900, 1400), 140), "s0");
  });

  it("la última sección cuyo borde superior pasó la línea de lectura", () => {
    assert.equal(pickActive(tops(-600, -50, 500), 140), "s1");
    assert.equal(pickActive(tops(-600, 140, 500), 140), "s1");
    assert.equal(pickActive(tops(-900, -500, 100), 140), "s2");
  });

  it("al fondo de la página, la última aunque no haya llegado a la línea", () => {
    assert.equal(pickActive(tops(-900, -500, 300), 140, true), "s2");
  });
});
