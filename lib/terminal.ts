export type TokenKind = "cmd" | "flag";

export interface Token {
  text: string;
  kind: TokenKind;
}

/** "stack --list" → [{ "stack ", cmd }, { "--list", flag }]: los flags se resaltan en ámbar. */
export function tokenize(command: string): Token[] {
  const out: Token[] = [];
  for (const piece of command.split(/(\s+)/)) {
    if (!piece) continue;
    const kind: TokenKind = piece.startsWith("--") ? "flag" : "cmd";
    const prev = out[out.length - 1];
    if (prev && prev.kind === kind) prev.text += piece;
    else out.push({ text: piece, kind });
  }
  return out;
}

export function typedTokens(tokens: readonly Token[], n: number): Token[] {
  const out: Token[] = [];
  let left = n;
  for (const t of tokens) {
    if (left <= 0) break;
    out.push({ text: t.text.slice(0, left), kind: t.kind });
    left -= t.text.length;
  }
  return out;
}
