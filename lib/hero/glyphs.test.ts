import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ATLAS, BUG_GLYPH, EGG_TEXT, EGG_WORD, GLYPHS, GLYPH_COUNT, NAME_BASE, NAME_TEXT, atlasCell } from "./glyphs.ts";

describe("GLYPHS", () => {
  it("tiene exactamente una celda del atlas por glifo, sin repetidos", () => {
    assert.equal(GLYPH_COUNT, ATLAS.cols * ATLAS.rows);
    assert.equal([...GLYPHS].length, GLYPH_COUNT);
    assert.equal(new Set(GLYPHS).size, GLYPH_COUNT);
  });

  it("el glifo de un hallazgo es el signo de exclamación", () => {
    assert.equal(GLYPHS[BUG_GLYPH], "!");
  });
});

describe("atlasCell", () => {
  it("recorre el atlas por filas", () => {
    assert.deepEqual(atlasCell(0), { col: 0, row: 0 });
    assert.deepEqual(atlasCell(9), { col: 1, row: 1 });
    assert.deepEqual(atlasCell(31), { col: 7, row: 3 });
  });

  it("da la vuelta con índices fuera de rango", () => {
    assert.deepEqual(atlasCell(32), { col: 0, row: 0 });
    assert.deepEqual(atlasCell(-1), { col: 7, row: 3 });
  });
});

describe("textos", () => {
  it("el nombre lleva punto final y el easter egg apunta a /sobre-mi", () => {
    assert.equal(NAME_TEXT, NAME_BASE + ".");
    assert.ok(EGG_TEXT.startsWith("/sobre-mi"));
    assert.equal(EGG_WORD, "whoami");
  });
});
