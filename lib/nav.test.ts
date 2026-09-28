import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NAV_LINKS, isActive, isHome, terminalPath } from "./nav.ts";

describe("NAV_LINKS", () => {
  it("tiene las 4 páginas en el orden de la barra", () => {
    assert.deepEqual(
      NAV_LINKS.map((l) => l.href),
      ["/proyectos", "/servicios", "/sobre-mi", "/contacto"],
    );
  });
});

describe("isHome", () => {
  it("solo la raíz es el home", () => {
    assert.equal(isHome("/"), true);
    assert.equal(isHome("/proyectos"), false);
  });
});

describe("isActive", () => {
  it("activo en su ruta y en sus subrutas", () => {
    assert.equal(isActive("/proyectos", "/proyectos"), true);
    assert.equal(isActive("/proyectos/medi-ia", "/proyectos"), true);
  });

  it("no se confunde con rutas que solo comparten el prefijo", () => {
    assert.equal(isActive("/proyectos-viejos", "/proyectos"), false);
    assert.equal(isActive("/", "/proyectos"), false);
  });
});

describe("terminalPath", () => {
  it("el home es ~", () => {
    assert.deepEqual(terminalPath("/"), { base: "~", last: "" });
  });

  it("una página: ~/ y el nombre resaltado", () => {
    assert.deepEqual(terminalPath("/servicios"), { base: "~/", last: "servicios" });
  });

  it("una subpágina: se resalta el último segmento", () => {
    assert.deepEqual(terminalPath("/proyectos/medi-ia"), { base: "~/proyectos/", last: "medi-ia" });
  });

  it("ignora la barra final, la query y el hash", () => {
    assert.deepEqual(terminalPath("/servicios/"), { base: "~/", last: "servicios" });
    assert.deepEqual(terminalPath("/servicios?x=1#precios"), { base: "~/", last: "servicios" });
  });
});
