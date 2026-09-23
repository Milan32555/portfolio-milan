import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FINDINGS, FIX_DISTANCE, SCAN, auditLine, auditView, countFound, findingState, scanPhase, scanY } from "./scan.ts";

describe("scanPhase", () => {
  it("no escanea antes del primer escaneo", () => {
    assert.deepEqual(scanPhase(0), { kind: "idle" });
    assert.deepEqual(scanPhase(SCAN.first - 0.01), { kind: "idle" });
  });

  it("recorre escaneo → desvanecido → asentado → reposo, y se repite con el período", () => {
    const mid = scanPhase(SCAN.first + SCAN.duration / 2);
    assert.equal(mid.kind, "scanning");
    if (mid.kind === "scanning") assert.ok(Math.abs(mid.k - 0.5) < 1e-9);

    const fade = scanPhase(SCAN.first + SCAN.duration + SCAN.fade / 4);
    assert.equal(fade.kind, "fading");
    if (fade.kind === "fading") assert.ok(Math.abs(fade.strength - 0.75) < 1e-9);

    assert.equal(scanPhase(SCAN.first + SCAN.duration + SCAN.fade + 0.1).kind, "settled");
    assert.equal(scanPhase(SCAN.first + SCAN.period - 0.1).kind, "idle");
    assert.equal(scanPhase(SCAN.first + SCAN.period + 0.1).kind, "scanning");
  });

  it("el período cubre las cuatro fases", () => {
    assert.ok(SCAN.period > SCAN.duration + SCAN.fade + SCAN.settle);
  });
});

describe("scanY y countFound", () => {
  it("baja de arriba a abajo", () => {
    assert.equal(scanY(0, 2, -2), 2);
    assert.equal(scanY(1, 2, -2), -2);
  });

  it("cuenta los hallazgos que la línea ya dejó atrás (quedan por encima)", () => {
    assert.equal(countFound([1.5, 0.2, -1], 0.5), 1);
    assert.equal(countFound([1.5, 0.2, -1], -2), 3);
  });
});

describe("findingState", () => {
  it("apagado si el escaneo no está activo o la línea no llegó", () => {
    assert.equal(findingState(1, 0, false), "off");
    assert.equal(findingState(-1, 0, true), "off");
  });

  it("encontrado recién pasa la línea, corregido cuando se aleja", () => {
    assert.equal(findingState(0.2, 0, true), "found");
    assert.equal(findingState(FIX_DISTANCE + 0.1, 0, true), "fixed");
  });
});

describe("auditView + auditLine", () => {
  const bugs = [1, 0.5, 0, -0.5];

  it("reposo → limpio", () => {
    const line = auditLine(auditView({ kind: "idle" }, bugs, -100, false));
    assert.equal(line.command, "$ audit ./misael");
    assert.deepEqual(line.parts, [{ text: "✓ limpio", tone: "ok" }]);
  });

  it("escaneando muestra porcentaje y hallazgos en singular/plural", () => {
    const one = auditLine(auditView({ kind: "scanning", k: 0.25 }, bugs, 0.7, false));
    assert.deepEqual(one.parts, [
      { text: "escaneando 25%", tone: "warn" },
      { text: " · 1 hallazgo", tone: "bug" },
    ]);
    const three = auditLine(auditView({ kind: "scanning", k: 0.6 }, bugs, -0.2, false));
    assert.equal(three.parts[1].text, " · 3 hallazgos");
    const none = auditLine(auditView({ kind: "scanning", k: 0.01 }, bugs, 2, false));
    assert.equal(none.parts.length, 1);
  });

  it("desvanecido y asentado → corregidos; easter egg → whoami", () => {
    assert.equal(auditLine(auditView({ kind: "fading", strength: 0.5 }, bugs, -2, false)).parts[0].text, "✓ 4 hallazgos corregidos");
    assert.equal(auditLine(auditView({ kind: "settled" }, bugs, -2, false)).parts[0].text, "✓ 4 hallazgos corregidos");
    assert.deepEqual(auditLine(auditView({ kind: "idle" }, bugs, 0, true)), {
      command: "$ whoami",
      parts: [{ text: "→ /sobre-mi", tone: "ok" }],
    });
  });

  it("hay una etiqueta por hallazgo", () => {
    assert.deepEqual([...FINDINGS], ["xss", "sqli", "secret expuesto", "csrf"]);
  });
});
