import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { primaryFamily } from "./fonts.ts";

describe("primaryFamily", () => {
  it("se queda con la fuente real y descarta el respaldo de next/font", () => {
    assert.equal(primaryFamily("'DM Serif Display', 'DM Serif Display Fallback'"), "'DM Serif Display'");
  });

  it("una sola familia queda igual", () => {
    assert.equal(primaryFamily("serif"), "serif");
  });

  it("vacío cae al genérico indicado", () => {
    assert.equal(primaryFamily("  ", "monospace"), "monospace");
  });
});
