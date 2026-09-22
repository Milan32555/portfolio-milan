export interface Seg {
  text: string;
  href?: string;
  strong?: boolean;
  /** Categoría/clave (en acento). */
  cat?: boolean;
  /** Chip con punto pulsante ("en revisión de tiendas"). */
  live?: boolean;
}
export type Line = readonly Seg[];

export interface ConsoleEntry {
  id: string;
  command: string;
  output: readonly Line[];
  kind?: "neofetch" | "history";
}

export const EL_PINGUINO_URL = "https://www.youtube.com/@ElPinguinoDeMario";
export const S4VITAR_URL = "https://www.youtube.com/@s4vitar";

export const BASE_ENTRIES: readonly ConsoleEntry[] = [
  {
    id: "whoami",
    command: "whoami",
    output: [
      [
        { text: "Ingeniería en Sistemas, freelance (desarrollo + auditoría de código). Empecé en seguridad viendo a " },
        { text: "El Pingüino de Mario", href: EL_PINGUINO_URL },
        { text: " y " },
        { text: "S4vitar", href: S4VITAR_URL },
        { text: " en YouTube." },
      ],
    ],
  },
  {
    id: "stack",
    command: "stack --list",
    output: [
      [{ text: "frontend", cat: true }, { text: " → React, Next.js, Vue.js" }],
      [{ text: "móvil", cat: true }, { text: " → Flutter" }],
      [{ text: "backend", cat: true }, { text: " → Node.js, Python" }],
      [{ text: "ia", cat: true }, { text: " → Deep Learning" }],
    ],
  },
  {
    id: "status",
    command: "status --current",
    output: [
      [
        { text: "Base", strong: true },
        { text: " (app móvil, cliente privado) — " },
        { text: "en revisión de tiendas", live: true },
        { text: ". Cliente conforme con el resultado." },
      ],
    ],
  },
  { id: "fuera", command: "fuera-de-codigo", output: [[{ text: "gym · inglés" }]] },
];

export const BONUS_ENTRIES: readonly ConsoleEntry[] = [
  {
    id: "neofetch",
    command: "neofetch",
    kind: "neofetch",
    output: [
      [{ text: "OS", cat: true }, { text: ": Misael OS (navy edition)" }],
      [{ text: "Host", cat: true }, { text: ": portfolio" }],
      [{ text: "Shell", cat: true }, { text: ": zsh" }],
      [{ text: "Rol", cat: true }, { text: ": Frontend dev + auditoría de código" }],
      [{ text: "Uptime", cat: true }, { text: ": estudiante + freelance desde 2025" }],
    ],
  },
  {
    id: "history",
    command: "history",
    kind: "history",
    output: [
      [{ text: "1  youtube.com/watch?v=writeup-ctf-01" }],
      [{ text: "2  apt install curiosidad" }],
      [{ text: "3  git clone primer-proyecto-que-funciono.git" }],
      [{ text: "4  code . # y ya no paré" }],
    ],
  },
];

export const NEOFETCH_LOGO = "   /\\\n  /  \\\n /_/\\_\\\n/ ___  \\\n/_/   \\_\\";

export function plainText(line: Line): string {
  return line.map((s) => s.text).join("");
}
