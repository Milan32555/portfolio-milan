import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AUDIT_STEPS, DEV_LINES, DEV_STEPS, FAQ, SECTIONS, pageText, readingMinutes } from "./servicios.ts";

describe("contenido de /servicios", () => {
  it("las 6 secciones en el orden del spec, numeradas 01–06", () => {
    assert.deepEqual(
      SECTIONS.map((s) => s.id),
      ["intro", "desarrollo", "auditoria", "como-trabajo", "precios", "preguntas"],
    );
    assert.deepEqual(SECTIONS.map((s) => s.num), ["01", "02", "03", "04", "05", "06"]);
  });

  it("4 líneas de desarrollo en el orden del spec", () => {
    assert.deepEqual(DEV_LINES.map((d) => d.title), [
      "Sitios y landing pages",
      "Apps web full-stack",
      "Apps móviles",
      "Sistemas empresariales",
    ]);
  });

  it("los servicios no fijan tecnologías: el stack depende de cada proyecto", () => {
    DEV_LINES.forEach((d) => assert.ok(!("stack" in d), d.title));
  });

  it("proceso: 6 pasos de desarrollo y 4 de auditoría", () => {
    assert.equal(DEV_STEPS.length, 6);
    assert.equal(AUDIT_STEPS.length, 4);
  });

  it("5 preguntas frecuentes en el orden del spec", () => {
    assert.deepEqual(FAQ.map((f) => f.q), [
      "¿Cuánto cuesta?",
      "¿Cuánto tarda un proyecto típico?",
      "¿Trabajas solo o con un equipo?",
      "¿Haces mantenimiento después de la entrega?",
      "¿Qué necesitas de mí para arrancar?",
    ]);
  });

  it("no publica montos ni monedas en ningún texto", () => {
    for (const t of pageText()) {
      assert.doesNotMatch(t, /\$\s?\d|\bCOP\b|\bUSD\b|\d{1,3}(\.\d{3})+/, t);
    }
  });

  it("aclara que no ofrece pentesting", () => {
    assert.ok(pageText().some((t) => /pentesting/i.test(t)));
  });

  it("ningún texto vacío", () => {
    pageText().forEach((t) => assert.ok(t.trim().length > 0));
  });
});

describe("readingMinutes", () => {
  it("200 palabras por minuto, redondeado, mínimo 1", () => {
    assert.equal(readingMinutes([]), 1);
    assert.equal(readingMinutes(["uno dos tres"]), 1);
    assert.equal(readingMinutes([Array(500).fill("p").join(" ")]), 3);
    assert.equal(readingMinutes([Array(200).fill("p").join(" "), Array(200).fill("p").join("  ")]), 2);
  });

  it("la página completa se lee en 2–6 minutos", () => {
    const m = readingMinutes(pageText());
    assert.ok(m >= 2 && m <= 6, `minutos: ${m}`);
  });
});
