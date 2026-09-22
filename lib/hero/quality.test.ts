import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MIN_FPS, QUALITY_KEY, decideQuality, parseCachedQuality, qualitySettings } from "./quality.ts";

describe("decideQuality", () => {
  it("baja la calidad por debajo de 45 fps", () => {
    assert.equal(MIN_FPS, 45);
    assert.equal(decideQuality(44.9), "low");
    assert.equal(decideQuality(45), "normal");
    assert.equal(decideQuality(60), "normal");
  });
});

describe("parseCachedQuality", () => {
  it("solo acepta valores conocidos", () => {
    assert.equal(parseCachedQuality("low"), "low");
    assert.equal(parseCachedQuality("normal"), "normal");
    assert.equal(parseCachedQuality(null), null);
    assert.equal(parseCachedQuality("ultra"), null);
    assert.equal(QUALITY_KEY, "heroQuality");
  });
});

describe("qualitySettings", () => {
  it("normal: glifos a la separación base, pixelRatio hasta 1.5, polvo completo", () => {
    assert.deepEqual(qualitySettings("normal", 1440), { spacingScale: 1, pixelRatioCap: 1.5, dust: 420 });
    assert.deepEqual(qualitySettings("normal", 400), { spacingScale: 1, pixelRatioCap: 1.5, dust: 180 });
  });

  it("baja: casi los mismos glifos (el nombre se sigue leyendo), pixelRatio 1, menos polvo", () => {
    assert.deepEqual(qualitySettings("low", 1440), { spacingScale: 1.25, pixelRatioCap: 1, dust: 160 });
    assert.deepEqual(qualitySettings("low", 400), { spacingScale: 1.08, pixelRatioCap: 1, dust: 60 });
  });
});
