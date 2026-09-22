import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CAMPOS_BORRADOR, getAdjacent, getCounts, getProject, isLive, projectNumber, projects } from "./projects.ts";

describe("integridad de los datos", () => {
  it("hay 4 proyectos con slugs únicos en kebab-case", () => {
    assert.equal(projects.length, 4);
    const slugs = projects.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const s of slugs) assert.match(s, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("el orden es el aprobado", () => {
    assert.deepEqual(
      projects.map((p) => p.slug),
      ["medi-ia", "animalvision", "library-system", "safe-transfer-ai"],
    );
  });

  it("todas las URLs son https", () => {
    for (const p of projects) {
      assert.match(p.repo.url, /^https:\/\//, p.slug);
      if (p.demo) assert.match(p.demo.url, /^https:\/\//, p.slug);
    }
  });

  it("cada proyecto tiene exactamente 3 cifras y 3 a 5 partes de arquitectura", () => {
    for (const p of projects) {
      assert.equal(p.stats.length, 3, p.slug);
      for (const s of p.stats) assert.ok(s.value.trim() && s.label.trim(), p.slug);
      assert.ok(p.arquitectura.length >= 3 && p.arquitectura.length <= 5, p.slug);
      for (const a of p.arquitectura) assert.ok(a.nombre.trim() && a.descripcion.trim(), p.slug);
    }
  });

  it("el expediente está completo", () => {
    for (const p of projects) {
      const e = p.expediente;
      assert.ok(e.problema.trim(), p.slug);
      assert.ok(e.rol.trim() && e.resultado.trim(), p.slug);
      for (const list of [e.queHace, e.decisiones, e.noHice, e.evidencia, e.conMasTiempo]) {
        assert.ok(list.length >= 1, `${p.slug}: lista vacía`);
      }
      assert.ok(e.queHace.length >= 3 && e.queHace.length <= 5, `${p.slug}: "qué hace" debe tener 3-5 funciones`);
      assert.ok(p.tags.length >= 1 && p.metric.value.trim() && p.metric.label.trim(), p.slug);
    }
  });

  it("los campos marcados como borrador son nombres válidos", () => {
    for (const p of projects) for (const b of p.borrador) assert.ok((CAMPOS_BORRADOR as readonly string[]).includes(b), `${p.slug}: ${b}`);
  });

  it("las reglas de honestidad del spec se cumplen", () => {
    assert.equal(getProject("medi-ia")?.demo, undefined);
    assert.equal(getProject("safe-transfer-ai")?.demo, undefined);
    assert.ok(getProject("medi-ia")?.aviso);
    assert.match(getProject("animalvision")?.demo?.note ?? "", /1 minuto/);
    assert.equal(getProject("library-system")?.context, "universitario");
  });
});

describe("helpers", () => {
  it("getProject devuelve undefined si no existe", () => {
    assert.equal(getProject("nope"), undefined);
    assert.equal(getProject("medi-ia")?.title, "MEDI-IA");
  });

  it("projectNumber se deriva del orden", () => {
    assert.equal(projectNumber("medi-ia"), "001");
    assert.equal(projectNumber("safe-transfer-ai"), "004");
  });

  it("getAdjacent es circular", () => {
    assert.equal(getAdjacent("medi-ia").prev.slug, "safe-transfer-ai");
    assert.equal(getAdjacent("medi-ia").next.slug, "animalvision");
    assert.equal(getAdjacent("safe-transfer-ai").next.slug, "medi-ia");
  });

  it("getCounts se calcula de los datos", () => {
    assert.deepEqual(getCounts(), { total: 4, live: 2, codeOnly: 2 });
    assert.equal(isLive(getProject("animalvision")!), true);
    assert.equal(isLive(getProject("medi-ia")!), false);
  });
});

describe("puerta de publicación", () => {
  it("con RELEASE=1 no queda contenido sin confirmar por el usuario", { skip: process.env.RELEASE !== "1" }, () => {
    for (const p of projects) assert.deepEqual(p.borrador, [], `${p.slug} aún tiene borradores: ${p.borrador.join(", ")}`);
  });
});
