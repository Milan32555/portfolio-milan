import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tokenize, typedTokens } from "./terminal.ts";

describe("tokenize", () => {
  it("separa el comando de sus flags --", () => {
    assert.deepEqual(tokenize("stack --list"), [
      { text: "stack ", kind: "cmd" },
      { text: "--list", kind: "flag" },
    ]);
    assert.deepEqual(tokenize("whoami"), [{ text: "whoami", kind: "cmd" }]);
    assert.deepEqual(tokenize("fuera-de-codigo"), [{ text: "fuera-de-codigo", kind: "cmd" }]);
  });
});

describe("typedTokens", () => {
  it("corta por caracteres manteniendo el tipo de cada token", () => {
    const t = tokenize("status --current");
    assert.deepEqual(typedTokens(t, 3), [{ text: "sta", kind: "cmd" }]);
    assert.deepEqual(typedTokens(t, 9), [
      { text: "status ", kind: "cmd" },
      { text: "--", kind: "flag" },
    ]);
    assert.deepEqual(typedTokens(t, 99), t);
  });
});
