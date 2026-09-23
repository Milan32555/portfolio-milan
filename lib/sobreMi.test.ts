import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BASE_ENTRIES, BONUS_ENTRIES, plainText } from "./sobreMi.ts";

describe("consola de /sobre-mi", () => {
  it("los 4 comandos base, en el orden aprobado", () => {
    assert.deepEqual(BASE_ENTRIES.map((e) => e.command), ["whoami", "stack --list", "status --current", "fuera-de-codigo"]);
  });

  it("los comandos bonus son neofetch y history", () => {
    assert.deepEqual(BONUS_ENTRIES.map((e) => e.command), ["neofetch", "history"]);
  });

  it("whoami enlaza a los dos canales reales por https", () => {
    const links = BASE_ENTRIES[0].output.flat().filter((s) => s.href);
    assert.deepEqual(links.map((l) => l.text), ["El Pingüino de Mario", "S4vitar"]);
    links.forEach((l) => assert.match(l.href ?? "", /^https:\/\/www\.youtube\.com\//));
  });

  it("el stack incluye Flutter en móvil", () => {
    const lines = BASE_ENTRIES[1].output.map(plainText);
    assert.ok(lines.includes("móvil → Flutter"));
  });

  it("ninguna salida está vacía e ids únicos", () => {
    const all = [...BASE_ENTRIES, ...BONUS_ENTRIES];
    all.forEach((e) => assert.ok(e.output.length > 0 && e.output.every((l) => plainText(l).length > 0)));
    assert.equal(new Set(all.map((e) => e.id)).size, all.length);
  });
});
