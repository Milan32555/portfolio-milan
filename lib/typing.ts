export interface TypedPart {
  text: string;
  strong?: boolean;
}

export function totalLength(parts: readonly TypedPart[]): number {
  return parts.reduce((n, p) => n + p.text.length, 0);
}

/** Las partes visibles tras escribir `n` caracteres (para el tipeo letra por letra). */
export function sliceParts(parts: readonly TypedPart[], n: number): TypedPart[] {
  const out: TypedPart[] = [];
  let left = n;
  for (const p of parts) {
    if (left <= 0) break;
    const text = p.text.slice(0, left);
    left -= p.text.length;
    out.push(p.strong ? { text, strong: true } : { text });
  }
  return out;
}
