import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sliceParts, totalLength } from "./typing.ts";

const parts = [{ text: "// dev " }, { text: "freelance", strong: true }, { text: " · auditor" }];

describe("sliceParts", () => {
  it("corta respetando qué parte va en negrita", () => {
    assert.deepEqual(sliceParts(parts, 0), []);
    assert.deepEqual(sliceParts(parts, 3), [{ text: "// " }]);
    assert.deepEqual(sliceParts(parts, 9), [{ text: "// dev " }, { text: "fr", strong: true }]);
  });

  it("con n mayor o igual al total devuelve todo", () => {
    assert.deepEqual(sliceParts(parts, totalLength(parts)), parts);
    assert.deepEqual(sliceParts(parts, Infinity), parts);
  });
});
