import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { THEME_KEY, THEME_PRE_PAINT_SCRIPT, otherTheme, parseTheme } from "./theme.ts";

function run(stored: string | null, opts: { throws?: boolean } = {}) {
  const attrs: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; } } };
  const localStorage = {
    getItem: (k: string) => {
      if (opts.throws) throw new Error("bloqueado");
      return k === THEME_KEY ? stored : null;
    },
  };
  new Function("document", "localStorage", THEME_PRE_PAINT_SCRIPT)(document, localStorage);
  return attrs["data-theme"];
}

describe("parseTheme", () => {
  it("solo 'light' es claro; lo demás es el oscuro por defecto", () => {
    assert.equal(parseTheme("light"), "light");
    assert.equal(parseTheme("dark"), "dark");
    assert.equal(parseTheme(null), "dark");
    assert.equal(parseTheme("sepia"), "dark");
  });
});

describe("otherTheme", () => {
  it("alterna entre los dos", () => {
    assert.equal(otherTheme("dark"), "light");
    assert.equal(otherTheme("light"), "dark");
  });
});

describe("THEME_PRE_PAINT_SCRIPT", () => {
  it("aplica el tema guardado", () => {
    assert.equal(run("light"), "light");
    assert.equal(run("dark"), "dark");
  });

  it("sin valor o con un valor raro, oscuro", () => {
    assert.equal(run(null), "dark");
    assert.equal(run("sepia"), "dark");
  });

  it("si localStorage lanza (modo privado), oscuro y sin romper", () => {
    assert.equal(run("light", { throws: true }), "dark");
  });
});
