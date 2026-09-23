import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hero3dAllowed, heroStaticMode, motionReduced, themeOf } from "./a11y.ts";

const root = (attrs: Record<string, string>) => ({ getAttribute: (n: string) => attrs[n] ?? null });
const mm = (reduce: boolean) => (q: string) => ({ matches: reduce && q.includes("reduce") });

describe("motionReduced", () => {
  it("respeta el sistema y el widget del sitio", () => {
    assert.equal(motionReduced(root({}), mm(false)), false);
    assert.equal(motionReduced(root({}), mm(true)), true);
    assert.equal(motionReduced(root({ "data-a11y-motion": "reduced" }), mm(false)), true);
    assert.equal(motionReduced(root({ "data-a11y-motion": "off" }), mm(false)), false);
  });
});

describe("heroStaticMode", () => {
  it("alto contraste o dislexia muestran el nombre como texto", () => {
    assert.equal(heroStaticMode(root({})), false);
    assert.equal(heroStaticMode(root({ "data-a11y-contrast": "high" })), true);
    assert.equal(heroStaticMode(root({ "data-a11y-dyslexia": "on" })), true);
    assert.equal(heroStaticMode(root({ "data-a11y-contrast": "off", "data-a11y-dyslexia": "off" })), false);
  });
});

describe("hero3dAllowed", () => {
  it("necesita WebGL y más de 2 núcleos (4 si el navegador no lo dice)", () => {
    assert.equal(hero3dAllowed(true, 8), true);
    assert.equal(hero3dAllowed(true, undefined), true);
    assert.equal(hero3dAllowed(true, 2), false);
    assert.equal(hero3dAllowed(false, 8), false);
  });
});

describe("themeOf", () => {
  it("solo 'light' es claro", () => {
    assert.equal(themeOf(root({ "data-theme": "light" })), "light");
    assert.equal(themeOf(root({ "data-theme": "dark" })), "dark");
    assert.equal(themeOf(root({})), "dark");
  });
});
