import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hero3dAllowed } from "./a11y.ts";
import { GATE_SEEN_KEY, PRE_PAINT_SCRIPT } from "./prePaint.ts";

function run(opts: { seen?: boolean; webgl?: boolean; cores?: number; storageThrows?: boolean }) {
  const attrs: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; } } };
  const sessionStorage = {
    getItem: (k: string) => {
      if (opts.storageThrows) throw new Error("bloqueado");
      return k === GATE_SEEN_KEY && opts.seen ? "1" : null;
    },
  };
  const navigator = { hardwareConcurrency: opts.cores };
  const window = opts.webgl === false ? {} : { WebGLRenderingContext: function () {} };
  new Function("document", "sessionStorage", "navigator", "window", PRE_PAINT_SCRIPT)(document, sessionStorage, navigator, window);
  return attrs;
}

describe("PRE_PAINT_SCRIPT", () => {
  it("marca que se llegó al home", () => {
    assert.equal(run({})["data-landing"], "home");
  });

  it("oculta el muro solo si ya se vio en esta sesión", () => {
    assert.equal(run({ seen: true })["data-gate"], "skip");
    assert.equal(run({ seen: false })["data-gate"], undefined);
    assert.equal(run({ storageThrows: true })["data-gate"], undefined);
  });

  it("decide el 3D igual que hero3dAllowed", () => {
    for (const webgl of [true, false]) {
      for (const cores of [undefined, 1, 2, 4, 8]) {
        const expected = hero3dAllowed(webgl, cores) ? "on" : "off";
        assert.equal(run({ webgl, cores })["data-hero3d"], expected, `webgl=${webgl} cores=${cores}`);
      }
    }
  });
});
