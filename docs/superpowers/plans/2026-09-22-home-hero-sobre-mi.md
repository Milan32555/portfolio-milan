# Home con hero de código + loader "muro de código" + `/sobre-mi` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el home actual (video + loader de tipeo + secciones largas) por el loader "muro de código", el hero con "Misael." hecho de código en Three.js y el home resumido, y crear `/sobre-mi` (consola Kali) y `/contacto` (el formulario que hoy vive en el home).

**Architecture:** Toda la lógica pura (muestreo de glifos, calendario del escaneo, calidad, progreso del loader, tokenizado de comandos, script previo al primer paint) vive en `lib/` y se prueba con `node --test`. La escena 3D es una clase imperativa (`components/hero/HeroScene.ts`) que se carga con `import()` dinámico desde un client component delgado (`Hero.tsx`). Loader y hero se coordinan con un bus mínimo (`lib/intro/bus.ts`): el hero reporta etapas reales de carga y el loader decide cuándo arranca la intro. Las secciones del home y `/sobre-mi` son server components con islas cliente pequeñas (aparición al hacer scroll, mini terminal, consola).

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript estricto, CSS Modules, `three` 0.186, `node:test`, Playwright (Python) + axe-core + Lighthouse para verificar.

**Specs:** `docs/superpowers/specs/2026-09-22-home-y-hero-design.md` y `docs/superpowers/specs/2026-09-22-pagina-sobre-mi-design.md`.
**Mockups de referencia (ábrelos en el navegador mientras trabajas):** `docs/superpowers/mockups/2026-09-22-home-hero-codigo.html` (loader + hero + home, con panel "solo mockup" para probar tema y accesibilidad) y `docs/superpowers/mockups/2026-09-22-sobre-mi-consola.html`.

## Reglas del repo que debes respetar

- **Sin trailer de Claude/IA en commits ni PRs** (regla del usuario para sus repos personales). Mensajes en español, estilo `feat: …` / `fix: …` / `docs: …`.
- El repo es `Milan32555/portfolio-milan` (cuenta personal). Nunca uses la cuenta `clickwebcol` de `gh`.
- El sitio sigue en el **diseño viejo** (navbar superior, tokens `--bg: #0c0c0e`, tema claro/oscuro, cursor propio con `cursor: none !important`). Igual que `/proyectos` y el footer, esto se construye **sobre los tokens actuales** (`--bg`, `--text`, `--soft`, `--muted`, `--accent`, `--accent2`, `--line`, `--live`), no sobre la paleta navy del rediseño grande. Los mockups usan navy `#0B1220`: donde el mockup diga `#0B1220`, usa `var(--bg)`.
- CSS global: `a { color: inherit; text-decoration: none !important }`. En CSS Modules declara el color de los enlaces con selector compuesto (`.row a`, `.more`), y los subrayados con `text-decoration` no funcionan: usa `border-bottom` si hace falta.
- Clases globales reutilizables: `.section`, `.section-label`, `.section-title`, `.btn-primary`, `.btn-ghost`, `.fade-in-section` + `.visible`, `.sr-only` (Tailwind).
- Serif: `var(--font-dm-serif)`. Sans: `var(--font-dm-sans)`. Mono nueva de este plan: `var(--font-mono)` (JetBrains Mono vía `next/font`). Ojo: `next/font` define estas variables en el `<body>` (clase en `body`), no en `<html>`: léelas con `getComputedStyle(document.body)`.
- Tests: `npm test` corre `node --test "lib/**/*.test.ts"` con TypeScript nativo de Node. Por eso **dentro de `lib/` los imports relativos llevan extensión `.ts`** (`import { x } from "./sample.ts"`) y no se usa el alias `@/`. Nada de `enum` ni parámetros-propiedad (`constructor(private x)`) en `lib/`.
- Ciclo de verificación probado en este repo: `npx tsc --noEmit` → `npm run lint` → `npm test` → `npm run build` → `npx next start -p 3100` (antes mata cualquier proceso escuchando en 3100 con PowerShell: `Get-NetTCPConnection -LocalPort 3100 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`) → script Playwright → detener el servidor. Si `npm run build` falla una vez por "next/font/google queries have exactly one entry", es un fallo transitorio de Google Fonts: reintenta una vez.
- Los selectores de Playwright contra CSS Modules usan `[class*='__nombre']` (en producción las clases salen como `Hero-module__AbC12__name`). Los componentes de este plan además exponen clases globales estables (`hero-name`, `code-gate`) y `data-*` para no depender de eso.

## Decisiones de implementación (no están en el spec; tómalas como cerradas)

1. **El muro de código solo aparece cuando la visita *llega* al home** (carga completa de `/`), una vez por sesión. Si alguien entra por `/proyectos/medi-ia` y luego navega al home con un enlace, no ve el muro: ya está dentro del sitio. Lo resuelve el script previo al primer paint (`data-landing="home"`, que solo existe si el HTML del home se cargó completo) y el estado del bus (`gate: "open"` sobrevive a la navegación del lado del cliente).
2. **Alto contraste y dislexia nunca están activos al cargar**: `AccessibilityWidget` no persiste su estado (arranca siempre en `DEFAULTS`). Por eso el hero siempre carga Three.js y esos modos se manejan en vivo: CSS oculta el canvas y muestra el `<h1>`, y la escena se pausa (`setStatic`). El loader no necesita la etapa "modo texto (accesibilidad)" del mockup.
3. **`/servicios` todavía no existe**, así que el enlace de la sección "qué hago" apunta a `/contacto` con el texto "Cuéntame tu proyecto →". Cuando exista `/servicios`, se cambia por "Ver servicios y cómo trabajo →".
4. **`/contacto` se crea en este plan** moviendo el formulario actual del home **sin rediseñarlo** (el formulario mad-libs del spec maestro es otro trabajo).
5. Se eliminan `components/Loader.tsx`, `components/LoaderContext.tsx`, `components/HeroVideo.tsx` y `public/video/` (el video de fondo deja de usarse).
6. La navbar pasa de anclas del home (`/#projects`, `/#about`, `/#contact`) a rutas reales (`/proyectos`, `/sobre-mi`, `/contacto`), con el enlace activo según la ruta.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `package.json` (modificar) | Dependencias `three` y `@types/three` |
| `app/layout.tsx` (modificar) | JetBrains Mono (`--font-mono`), `suppressHydrationWarning` en `<html>`, quitar Loader/LoaderProvider |
| `app/globals.css` (modificar) | Reglas globales: ocultar `.hero-name` mientras se espera el 3D, ocultar `.code-gate` en visitas repetidas |
| `lib/hero/glyphs.ts` + test | Juego de 32 glifos, atlas, textos del nombre y del easter egg |
| `lib/hero/sample.ts` + test | Muestreo de un canvas en puntos, elección de los 4 hallazgos, `shuffle` |
| `lib/hero/scan.ts` + test | Calendario del escaneo, estado de cada hallazgo, texto de la esquina `$ audit` |
| `lib/hero/quality.ts` + test | Umbral de fps, ajustes de calidad, lectura de la calidad guardada |
| `lib/hero/copy.ts` | Textos del hero (eyebrow, subtítulo) |
| `lib/typing.ts` + test | Cortar texto con partes en negrita para el tipeo |
| `lib/terminal.ts` + test | Tokenizar comandos (`stack --list` → comando + flag) |
| `lib/a11y.ts` + test | Movimiento reducido, modo estático, tema, "¿se permite 3D?" |
| `lib/prePaint.ts` + test | Script inline que corre antes del primer paint del home |
| `lib/gate/progress.ts` + test | Etapas y avance de la barra del loader, brillo de los glifos del muro |
| `lib/intro/bus.ts` + test | Coordinación loader ↔ hero |
| `lib/sobreMi.ts` + test | Datos de la consola de `/sobre-mi` |
| `components/hero/shaders.ts` | GLSL de los glifos |
| `components/hero/palettes.ts` | Colores por tema para la escena |
| `components/hero/HeroScene.ts` | Clase imperativa de Three.js (build, intro, escaneo, mouse, easter egg, a11y) |
| `components/hero/Hero.tsx` + `.module.css` | El hero: `<h1>` real, eyebrow tipeado, esquina `$ audit`, etiquetas, carga de la escena |
| `components/gate/wall.ts` | Muro de glifos en dos canvas 2D |
| `components/gate/CodeGate.tsx` + `.module.css` | El loader "muro de código" |
| `components/home/PrePaintScript.tsx` | Inserta `PRE_PAINT_SCRIPT` en el HTML del home |
| `components/home/Reveal.tsx` | Aparición al entrar en pantalla (usa `.fade-in-section`) |
| `components/home/MiniTerminal.tsx` | Avance de la consola: escribe `whoami` una vez |
| `components/home/Sections.tsx` + `Home.module.css` | Las 4 secciones resumidas del home |
| `app/page.tsx` (reescribir) | Home: script previo, loader, hero, secciones |
| `components/ContactForm.tsx` | Formulario de contacto (movido desde `app/page.tsx`) |
| `app/contacto/page.tsx` + `page.module.css` | Página `/contacto` |
| `components/sobre-mi/KaliConsole.tsx` + `.module.css` | Consola estilo Kali |
| `app/sobre-mi/page.tsx` + `page.module.css` | Página `/sobre-mi` |
| `components/Navbar.tsx` (modificar) | Enlaces a rutas reales, activo por ruta |
| `app/proyectos/[slug]/page.tsx` (modificar) | "Hablemos" apunta a `/contacto` |
| `app/sitemap.ts` (modificar) | Agregar `/sobre-mi` y `/contacto` |
| `.superpowers/verify-home.py` | Verificación con Playwright + axe (no se commitea: `.superpowers/` está en `.gitignore`) |

---

### Task 0: Rama de trabajo

**Files:** ninguno (solo git).

- [ ] **Step 1: Partir de la rama de documentación (ya incluye specs, mockups y este plan)**

```bash
git checkout docs/specs-sobre-mi-home
git pull
git checkout -b feat/home-hero-sobre-mi
git status --short
```
Expected: rama `feat/home-hero-sobre-mi`, árbol limpio.

- [ ] **Step 2: Confirmar que la línea base pasa**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores; los tests existentes (`cover`, `footerScene`, `hoverIntent`, `projects`) en verde.

---

### Task 1: Dependencias, fuente mono y ajustes del layout

**Files:**
- Modify: `package.json` (vía npm)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Instalar Three.js**

Run: `npm install three@0.186.0 && npm install -D @types/three@0.186.0`
Expected: `package.json` con `"three": "^0.186.0"` en `dependencies` y `"@types/three"` en `devDependencies`.

- [ ] **Step 2: Agregar JetBrains Mono y `suppressHydrationWarning`**

En `app/layout.tsx`, cambia el import de fuentes y agrega la nueva fuente debajo de `dmSerifDisplay`:

```tsx
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
```

```tsx
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-mono",
});
```

Reemplaza la apertura de `<html>` y `<body>` por:

```tsx
    // suppressHydrationWarning: el script previo al primer paint del home escribe
    // data-landing / data-gate / data-hero3d en <html> antes de hidratar.
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className={`${dmSans.className} ${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} antialiased h-full`}>
```

(No quites todavía `Loader`/`LoaderProvider`: se eliminan en la Task 14, cuando el home deje de usarlos.)

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: compila (reintenta una vez si falla por Google Fonts).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app/layout.tsx
git commit -m "chore: three.js y JetBrains Mono para el hero y las consolas"
```

---

### Task 2: Glifos (`lib/hero/glyphs.ts`)

**Files:**
- Create: `lib/hero/glyphs.ts`
- Test: `lib/hero/glyphs.test.ts`

- [ ] **Step 1: Escribir el test**

```ts
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
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --test lib/hero/glyphs.test.ts`
Expected: FAIL (`Cannot find module './glyphs.ts'`).

- [ ] **Step 3: Implementar**

```ts
/** Los 32 caracteres de código con los que se dibujan el nombre, el polvo y el muro. */
export const GLYPHS = "{}<>/;=()[]$#*&|!?01:+-_%@~^.,'`";

/** Atlas: una textura de 8×4 celdas de 64 px, una por glifo. */
export const ATLAS = { cols: 8, rows: 4, cell: 64 } as const;
export const GLYPH_COUNT = ATLAS.cols * ATLAS.rows;

/** Índice del glifo que muestra un hallazgo mientras el escáner lo marca. */
export const BUG_GLYPH = GLYPHS.indexOf("!");

export const NAME_BASE = "Misael";
export const NAME_TEXT = `${NAME_BASE}.`;

/** El easter egg: escribir `whoami` reordena el código en este texto. */
export const EGG_WORD = "whoami";
export const EGG_TEXT = "/sobre-mi →";

export function atlasCell(index: number): { col: number; row: number } {
  const k = ((index % GLYPH_COUNT) + GLYPH_COUNT) % GLYPH_COUNT;
  return { col: k % ATLAS.cols, row: Math.floor(k / ATLAS.cols) };
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test lib/hero/glyphs.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/hero/glyphs.ts lib/hero/glyphs.test.ts
git commit -m "feat: juego de glifos del hero"
```

---

### Task 3: Muestreo de puntos y hallazgos (`lib/hero/sample.ts`)

**Files:**
- Create: `lib/hero/sample.ts`
- Test: `lib/hero/sample.test.ts`

- [ ] **Step 1: Escribir el test**

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../cover.ts";
import { pickFindings, sampleMask, shuffle } from "./sample.ts";

/** RGBA de w×h con alfa 255 donde `on(x, y)` es verdadero. */
function mask(w: number, h: number, on: (x: number, y: number) => boolean): Uint8ClampedArray {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y)) d[(y * w + x) * 4 + 3] = 255;
  return d;
}

describe("sampleMask", () => {
  it("devuelve solo los píxeles opacos, recorriendo con el paso dado", () => {
    const d = mask(4, 4, (x) => x < 2);
    assert.deepEqual(sampleMask(d, 4, 4, 2), [[0, 0], [0, 2]]);
    assert.equal(sampleMask(d, 4, 4, 1).length, 8);
  });

  it("respeta el umbral de alfa", () => {
    const d = new Uint8ClampedArray(4);
    d[3] = 100;
    assert.equal(sampleMask(d, 1, 1, 1).length, 0);
    assert.equal(sampleMask(d, 1, 1, 1, 50).length, 1);
  });
});

describe("pickFindings", () => {
  const xs = Array.from({ length: 100 }, (_, i) => i);
  const excluded = xs.map((x) => x >= 95); // el "punto" del nombre

  it("elige n índices distintos, ninguno excluido, repartidos a lo ancho", () => {
    const picks = pickFindings(xs, excluded, 4, mulberry32(7));
    assert.equal(picks.length, 4);
    assert.equal(new Set(picks).size, 4);
    picks.forEach((i) => assert.equal(excluded[i], false));
    const sorted = [...picks].sort((a, b) => a - b);
    assert.deepEqual(picks, sorted);
    assert.ok(picks[0] < 25 && picks[3] >= 70);
  });

  it("si hay menos candidatos que n, devuelve los que hay", () => {
    assert.deepEqual(pickFindings([3, 1], [false, false], 4, mulberry32(1)), [1, 0]);
  });
});

describe("shuffle", () => {
  it("devuelve una permutación sin tocar el arreglo original", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const out = shuffle(items, mulberry32(3));
    assert.deepEqual([...out].sort(), items);
    assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --test lib/hero/sample.test.ts`
Expected: FAIL (`Cannot find module './sample.ts'`).

- [ ] **Step 3: Implementar**

```ts
export type Rng = () => number;

/**
 * Recorre un buffer RGBA (el de `getImageData`) con un paso fijo y devuelve las
 * coordenadas de los píxeles opacos: son las posiciones de los glifos del nombre.
 */
export function sampleMask(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  gap: number,
  threshold = 128,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const step = Math.max(1, Math.floor(gap));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (rgba[(y * width + x) * 4 + 3] > threshold) out.push([x, y]);
    }
  }
  return out;
}

/**
 * Elige los glifos "hallazgo" del escaneo: uno por franja horizontal del nombre
 * (con un 4 % de margen en cada borde de franja) para que queden repartidos.
 * Devuelve índices ordenados de izquierda a derecha.
 */
export function pickFindings(xs: readonly number[], excluded: readonly boolean[], n: number, rand: Rng): number[] {
  const candidates = xs
    .map((_, i) => i)
    .filter((i) => !excluded[i])
    .sort((a, b) => xs[a] - xs[b]);
  if (candidates.length <= n) return candidates;
  const picks: number[] = [];
  for (let q = 0; q < n; q++) {
    const lo = Math.floor(candidates.length * (q / n + 0.04));
    const hi = Math.max(lo + 1, Math.floor(candidates.length * ((q + 1) / n - 0.04)));
    picks.push(candidates[Math.min(candidates.length - 1, lo + Math.floor(rand() * (hi - lo)))]);
  }
  return picks;
}

/** Fisher–Yates sobre una copia. */
export function shuffle<T>(items: readonly T[], rand: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test lib/hero/sample.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/hero/sample.ts lib/hero/sample.test.ts
git commit -m "feat: muestreo de glifos y reparto de los hallazgos del escaneo"
```

---

### Task 4: Calendario del escaneo y texto `$ audit` (`lib/hero/scan.ts`)

**Files:**
- Create: `lib/hero/scan.ts`
- Test: `lib/hero/scan.test.ts`

- [ ] **Step 1: Escribir el test**

```ts
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
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --test lib/hero/scan.test.ts`
Expected: FAIL (`Cannot find module './scan.ts'`).

- [ ] **Step 3: Implementar**

```ts
/**
 * Calendario del escaneo de "auditoría" (segundos desde que arranca la intro):
 * primer escaneo a los 3.2 s; luego cada 9.1 s: 2.4 s bajando por el nombre,
 * 1.6 s de desvanecido, 2.5 s mostrando "corregidos" y el resto en reposo.
 */
export const SCAN = { first: 3.2, duration: 2.4, fade: 1.6, settle: 2.5, period: 9.1 } as const;

/** Distancia (unidades de mundo) a la que un hallazgo pasa de rojo a verde. */
export const FIX_DISTANCE = 0.85;

export const FINDINGS = ["xss", "sqli", "secret expuesto", "csrf"] as const;

export type ScanPhase =
  | { kind: "idle" }
  | { kind: "scanning"; k: number }
  | { kind: "fading"; strength: number }
  | { kind: "settled" };

export function scanPhase(t: number): ScanPhase {
  if (t < SCAN.first) return { kind: "idle" };
  const local = (t - SCAN.first) % SCAN.period;
  if (local < SCAN.duration) return { kind: "scanning", k: local / SCAN.duration };
  if (local < SCAN.duration + SCAN.fade) return { kind: "fading", strength: 1 - (local - SCAN.duration) / SCAN.fade };
  if (local < SCAN.duration + SCAN.fade + SCAN.settle) return { kind: "settled" };
  return { kind: "idle" };
}

export function scanY(k: number, top: number, bottom: number): number {
  return top + (bottom - top) * k;
}

/** Hallazgos por encima de la línea: ya fueron escaneados. */
export function countFound(bugYs: readonly number[], y: number): number {
  return bugYs.filter((b) => b > y).length;
}

export type FindingState = "off" | "found" | "fixed";

export function findingState(bugY: number, y: number, active: boolean): FindingState {
  if (!active) return "off";
  const dy = bugY - y;
  if (dy <= 0) return "off";
  return dy > FIX_DISTANCE ? "fixed" : "found";
}

export type AuditView =
  | { kind: "idle" }
  | { kind: "scanning"; pct: number; found: number }
  | { kind: "fixed"; total: number }
  | { kind: "egg" };

export function auditView(phase: ScanPhase, bugYs: readonly number[], y: number, egg: boolean): AuditView {
  if (egg) return { kind: "egg" };
  if (phase.kind === "scanning") return { kind: "scanning", pct: Math.round(phase.k * 100), found: countFound(bugYs, y) };
  if (phase.kind === "fading" || phase.kind === "settled") return { kind: "fixed", total: bugYs.length };
  return { kind: "idle" };
}

export type Tone = "ok" | "warn" | "bug";
export interface AuditLine {
  command: string;
  parts: Array<{ text: string; tone: Tone }>;
}

/** Lo que dice la esquina inferior derecha del hero. */
export function auditLine(view: AuditView): AuditLine {
  switch (view.kind) {
    case "egg":
      return { command: "$ whoami", parts: [{ text: "→ /sobre-mi", tone: "ok" }] };
    case "scanning": {
      const parts: AuditLine["parts"] = [{ text: `escaneando ${view.pct}%`, tone: "warn" }];
      if (view.found > 0) parts.push({ text: ` · ${view.found} hallazgo${view.found > 1 ? "s" : ""}`, tone: "bug" });
      return { command: "$ audit ./misael", parts };
    }
    case "fixed":
      return { command: "$ audit ./misael", parts: [{ text: `✓ ${view.total} hallazgos corregidos`, tone: "ok" }] };
    default:
      return { command: "$ audit ./misael", parts: [{ text: "✓ limpio", tone: "ok" }] };
  }
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test lib/hero/scan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/hero/scan.ts lib/hero/scan.test.ts
git commit -m "feat: calendario del escaneo de auditoria y texto de la esquina"
```

---

### Task 5: Calidad adaptativa (`lib/hero/quality.ts`)

**Files:**
- Create: `lib/hero/quality.ts`
- Test: `lib/hero/quality.test.ts`

- [ ] **Step 1: Escribir el test**

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MIN_FPS, QUALITY_KEY, decideQuality, parseCachedQuality, qualitySettings } from "./quality.ts";

describe("decideQuality", () => {
  it("baja la calidad por debajo de 45 fps", () => {
    assert.equal(MIN_FPS, 45);
    assert.equal(decideQuality(44.9), "low");
    assert.equal(decideQuality(45), "normal");
    assert.equal(decideQuality(60), "normal");
  });
});

describe("parseCachedQuality", () => {
  it("solo acepta valores conocidos", () => {
    assert.equal(parseCachedQuality("low"), "low");
    assert.equal(parseCachedQuality("normal"), "normal");
    assert.equal(parseCachedQuality(null), null);
    assert.equal(parseCachedQuality("ultra"), null);
    assert.equal(QUALITY_KEY, "heroQuality");
  });
});

describe("qualitySettings", () => {
  it("normal: glifos a la separación base, pixelRatio hasta 1.5, polvo completo", () => {
    assert.deepEqual(qualitySettings("normal", 1440), { spacingScale: 1, pixelRatioCap: 1.5, dust: 420 });
    assert.deepEqual(qualitySettings("normal", 400), { spacingScale: 1, pixelRatioCap: 1.5, dust: 180 });
  });

  it("baja: casi los mismos glifos (el nombre se sigue leyendo), pixelRatio 1, menos polvo", () => {
    assert.deepEqual(qualitySettings("low", 1440), { spacingScale: 1.25, pixelRatioCap: 1, dust: 160 });
    assert.deepEqual(qualitySettings("low", 400), { spacingScale: 1.08, pixelRatioCap: 1, dust: 60 });
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --test lib/hero/quality.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```ts
export const QUALITY_KEY = "heroQuality";
export const MIN_FPS = 45;

export type Quality = "normal" | "low";

export interface QualitySettings {
  /** Multiplica la separación entre glifos del nombre (más separación = menos glifos). */
  spacingScale: number;
  pixelRatioCap: number;
  /** Glifos de "polvo" en profundidad. */
  dust: number;
}

export function decideQuality(fps: number): Quality {
  return fps < MIN_FPS ? "low" : "normal";
}

export function parseCachedQuality(value: string | null): Quality | null {
  return value === "normal" || value === "low" ? value : null;
}

export function qualitySettings(quality: Quality, width: number): QualitySettings {
  const narrow = width < 600;
  if (quality === "low") return { spacingScale: narrow ? 1.08 : 1.25, pixelRatioCap: 1, dust: narrow ? 60 : 160 };
  return { spacingScale: 1, pixelRatioCap: 1.5, dust: narrow ? 180 : 420 };
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test lib/hero/quality.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/hero/quality.ts lib/hero/quality.test.ts
git commit -m "feat: calidad adaptativa del hero"
```

---

### Task 6: Tipeo y tokens de terminal (`lib/typing.ts`, `lib/terminal.ts`, `lib/hero/copy.ts`)

**Files:**
- Create: `lib/typing.ts`, `lib/terminal.ts`, `lib/hero/copy.ts`
- Test: `lib/typing.test.ts`, `lib/terminal.test.ts`

- [ ] **Step 1: Escribir los tests**

`lib/typing.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sliceParts, totalLength } from "./typing.ts";

const parts = [{ text: "// dev " }, { text: "freelance", strong: true }, { text: " · auditor" }];

describe("sliceParts", () => {
  it("corta respetando qué parte va en negrita", () => {
    assert.deepEqual(sliceParts(parts, 0), []);
    assert.deepEqual(sliceParts(parts, 3), [{ text: "// " }]);
    assert.deepEqual(sliceParts(parts, 9), [{ text: "// dev " }, { text: "fr", strong: true }]);
  });

  it("con n mayor o igual al total devuelve todo", () => {
    assert.deepEqual(sliceParts(parts, totalLength(parts)), parts);
    assert.deepEqual(sliceParts(parts, Infinity), parts);
  });
});
```

`lib/terminal.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --test lib/typing.test.ts lib/terminal.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`lib/typing.ts`:

```ts
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
```

`lib/terminal.ts`:

```ts
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
```

`lib/hero/copy.ts`:

```ts
import type { TypedPart } from "../typing.ts";

export const EYEBROW_FULL: readonly TypedPart[] = [
  { text: "// dev " },
  { text: "freelance", strong: true },
  { text: " · auditor de código" },
];

/** En pantallas angostas el eyebrow se corta para no partirse en dos líneas. */
export const EYEBROW_SHORT: readonly TypedPart[] = EYEBROW_FULL.slice(0, 2);

export const EYEBROW_LABEL = "Desarrollador freelance y auditor de código";

export const HERO_SUBTITLE =
  "Construyo interfaces con React y Next.js, y audito código ajeno con la misma cabeza con la que aprendí seguridad: buscando qué se rompe antes de que lo haga otro.";
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --test lib/typing.test.ts lib/terminal.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/typing.ts lib/typing.test.ts lib/terminal.ts lib/terminal.test.ts lib/hero/copy.ts
git commit -m "feat: utilidades de tipeo y tokens de comandos"
```

---

### Task 7: Preferencias y script previo al primer paint (`lib/a11y.ts`, `lib/prePaint.ts`)

**Files:**
- Create: `lib/a11y.ts`, `lib/prePaint.ts`
- Test: `lib/a11y.test.ts`, `lib/prePaint.test.ts`

- [ ] **Step 1: Escribir los tests**

`lib/a11y.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hero3dAllowed, heroStaticMode, motionReduced, themeOf } from "./a11y.ts";

const root = (attrs: Record<string, string>) => ({ getAttribute: (n: string) => attrs[n] ?? null });
const mm = (reduce: boolean) => (q: string) => ({ matches: reduce && q.includes("reduce") });

describe("motionReduced", () => {
  it("respeta el sistema y el widget del sitio", () => {
    assert.equal(motionReduced(root({}), mm(false)), false);
    assert.equal(motionReduced(root({}), mm(true)), true);
    assert.equal(motionReduced(root({ "data-a11y-motion": "reduced" }), mm(false)), true);
    assert.equal(motionReduced(root({ "data-a11y-motion": "off" }), mm(false)), false);
  });
});

describe("heroStaticMode", () => {
  it("alto contraste o dislexia muestran el nombre como texto", () => {
    assert.equal(heroStaticMode(root({})), false);
    assert.equal(heroStaticMode(root({ "data-a11y-contrast": "high" })), true);
    assert.equal(heroStaticMode(root({ "data-a11y-dyslexia": "on" })), true);
    assert.equal(heroStaticMode(root({ "data-a11y-contrast": "off", "data-a11y-dyslexia": "off" })), false);
  });
});

describe("hero3dAllowed", () => {
  it("necesita WebGL y más de 2 núcleos (4 si el navegador no lo dice)", () => {
    assert.equal(hero3dAllowed(true, 8), true);
    assert.equal(hero3dAllowed(true, undefined), true);
    assert.equal(hero3dAllowed(true, 2), false);
    assert.equal(hero3dAllowed(false, 8), false);
  });
});

describe("themeOf", () => {
  it("solo 'light' es claro", () => {
    assert.equal(themeOf(root({ "data-theme": "light" })), "light");
    assert.equal(themeOf(root({ "data-theme": "dark" })), "dark");
    assert.equal(themeOf(root({})), "dark");
  });
});
```

`lib/prePaint.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hero3dAllowed } from "./a11y.ts";
import { GATE_SEEN_KEY, PRE_PAINT_SCRIPT } from "./prePaint.ts";

function run(opts: { seen?: boolean; webgl?: boolean; cores?: number; storageThrows?: boolean }) {
  const attrs: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; } } };
  const sessionStorage = {
    getItem: (k: string) => {
      if (opts.storageThrows) throw new Error("bloqueado");
      return k === GATE_SEEN_KEY && opts.seen ? "1" : null;
    },
  };
  const navigator = { hardwareConcurrency: opts.cores };
  const window = opts.webgl === false ? {} : { WebGLRenderingContext: function () {} };
  new Function("document", "sessionStorage", "navigator", "window", PRE_PAINT_SCRIPT)(document, sessionStorage, navigator, window);
  return attrs;
}

describe("PRE_PAINT_SCRIPT", () => {
  it("marca que se llegó al home", () => {
    assert.equal(run({})["data-landing"], "home");
  });

  it("oculta el muro solo si ya se vio en esta sesión", () => {
    assert.equal(run({ seen: true })["data-gate"], "skip");
    assert.equal(run({ seen: false })["data-gate"], undefined);
    assert.equal(run({ storageThrows: true })["data-gate"], undefined);
  });

  it("decide el 3D igual que hero3dAllowed", () => {
    for (const webgl of [true, false]) {
      for (const cores of [undefined, 1, 2, 4, 8]) {
        const expected = hero3dAllowed(webgl, cores) ? "on" : "off";
        assert.equal(run({ webgl, cores })["data-hero3d"], expected, `webgl=${webgl} cores=${cores}`);
      }
    }
  });
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --test lib/a11y.test.ts lib/prePaint.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`lib/a11y.ts`:

```ts
export interface AttrSource {
  getAttribute(name: string): string | null;
}
export type MatchMediaLike = (query: string) => { matches: boolean };

/** Movimiento reducido del sistema O del interruptor del AccessibilityWidget. */
export function motionReduced(root: AttrSource, matchMedia: MatchMediaLike): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-a11y-motion") === "reduced";
}

/** Alto contraste o fuente para dislexia: el nombre se muestra como texto sólido, sin glifos. */
export function heroStaticMode(root: AttrSource): boolean {
  return root.getAttribute("data-a11y-contrast") === "high" || root.getAttribute("data-a11y-dyslexia") === "on";
}

/** ¿Vale la pena cargar la escena 3D? Sin WebGL o con 2 núcleos o menos, hero tipográfico. */
export function hero3dAllowed(hasWebGL: boolean, cores: number | undefined): boolean {
  return hasWebGL && (cores ?? 4) > 2;
}

export type ThemeName = "dark" | "light";

export function themeOf(root: AttrSource): ThemeName {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}
```

`lib/prePaint.ts`:

```ts
export const GATE_SEEN_KEY = "gateSeen";

/**
 * Corre dentro del HTML del home, antes del primer paint (ver PrePaintScript.tsx):
 * - data-landing="home": la visita llegó al home con una carga completa (el muro puede mostrarse).
 * - data-gate="skip": el muro ya se vio en esta sesión → CSS lo oculta sin parpadeo.
 * - data-hero3d="on" | "off": si se espera la escena 3D, CSS oculta el <h1> de texto para
 *   que no aparezca "Misael." en blanco y luego el código (misma regla que hero3dAllowed).
 * Debe ser ES5 plano y a prueba de errores: nunca puede romper la carga de la página.
 */
export const PRE_PAINT_SCRIPT =
  "(function(){try{var h=document.documentElement;h.setAttribute('data-landing','home');" +
  `var seen=false;try{seen=sessionStorage.getItem('${GATE_SEEN_KEY}')==='1'}catch(e){}` +
  "if(seen)h.setAttribute('data-gate','skip');" +
  "var gl=!!window.WebGLRenderingContext;var cores=navigator.hardwareConcurrency||4;" +
  "h.setAttribute('data-hero3d',gl&&cores>2?'on':'off')}catch(e){}})();";
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --test lib/a11y.test.ts lib/prePaint.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/a11y.ts lib/a11y.test.ts lib/prePaint.ts lib/prePaint.test.ts
git commit -m "feat: preferencias de accesibilidad y script previo al primer paint del home"
```

---

### Task 8: Progreso del loader y bus de la intro (`lib/gate/progress.ts`, `lib/intro/bus.ts`)

**Files:**
- Create: `lib/gate/progress.ts`, `lib/intro/bus.ts`
- Test: `lib/gate/progress.test.ts`, `lib/intro/bus.test.ts`

- [ ] **Step 1: Escribir los tests**

`lib/gate/progress.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GATE_MIN_MS, GATE_STAGES, stepProgress, wallAlpha } from "./progress.ts";

describe("GATE_STAGES", () => {
  it("son crecientes y terminan en 100", () => {
    const v = [GATE_STAGES.fonts, GATE_STAGES.three, GATE_STAGES.scene, GATE_STAGES.ready];
    assert.deepEqual(v, [...v].sort((a, b) => a - b));
    assert.equal(GATE_STAGES.ready, 100);
  });
});

describe("stepProgress", () => {
  it("nunca pasa de lo que de verdad cargó", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 55, GATE_MIN_MS * 2, false);
    assert.ok(d <= 55);
    assert.equal(d, 55);
  });

  it("nunca va más rápido que el mínimo de tiempo", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 100, GATE_MIN_MS / 2, false);
    assert.ok(d <= 50 + 1e-9);
  });

  it("con todo cargado y el tiempo cumplido, llega a 100", () => {
    let d = 0;
    for (let i = 0; i < 500; i++) d = stepProgress(d, 100, GATE_MIN_MS, false);
    assert.equal(d, 100);
  });

  it("con movimiento reducido salta directo a lo cargado", () => {
    assert.equal(stepProgress(0, 82, 0, true), 82);
  });
});

describe("wallAlpha", () => {
  it("los glifos encendidos y los cercanos al cursor brillan más, con tope", () => {
    assert.ok(wallAlpha(true, 0, false) > wallAlpha(false, 0, false));
    assert.ok(wallAlpha(false, 1, false) > wallAlpha(true, 0, false));
    assert.ok(wallAlpha(true, 1, true) <= 0.85);
  });
});
```

`lib/intro/bus.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createIntroBus } from "./bus.ts";

describe("createIntroBus", () => {
  it("guarda las etapas y se las repite a quien se suscribe tarde", () => {
    const bus = createIntroBus();
    bus.report({ stage: "fonts", label: "fuentes cargadas" });
    const seen: string[] = [];
    bus.subscribe((e) => seen.push(e.stage));
    bus.report({ stage: "three", label: "three.js listo" });
    assert.deepEqual(seen, ["fonts", "three"]);
  });

  it("dejar de escuchar funciona", () => {
    const bus = createIntroBus();
    const seen: string[] = [];
    const off = bus.subscribe((e) => seen.push(e.stage));
    off();
    bus.report({ stage: "ready", label: "x" });
    assert.deepEqual(seen, []);
  });

  it("si el muro está cerrado, la intro espera y sale desde la rendija al abrir", () => {
    const bus = createIntroBus();
    bus.activateGate();
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.deepEqual(calls, []);
    bus.openGate(true);
    assert.deepEqual(calls, [true]);
    assert.equal(bus.gateState(), "open");
  });

  it("si el muro ya está abierto, arranca de inmediato y sin rendija", () => {
    const bus = createIntroBus();
    bus.openGate(false);
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.deepEqual(calls, [false]);
  });

  it("mientras no se sabe si hay muro, también espera", () => {
    const bus = createIntroBus();
    const calls: boolean[] = [];
    bus.requestStart((fromDoor) => calls.push(fromDoor));
    assert.equal(bus.gateState(), "unknown");
    assert.deepEqual(calls, []);
  });

  it("reset olvida etapas y estado", () => {
    const bus = createIntroBus();
    bus.report({ stage: "fonts", label: "a" });
    bus.openGate(false);
    bus.reset();
    const seen: string[] = [];
    bus.subscribe((e) => seen.push(e.stage));
    assert.deepEqual(seen, []);
    assert.equal(bus.gateState(), "unknown");
  });
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --test lib/gate/progress.test.ts lib/intro/bus.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`lib/gate/progress.ts`:

```ts
/** Porcentaje de la barra al terminar cada etapa real de carga. */
export const GATE_STAGES = { fonts: 25, three: 55, scene: 82, ready: 100 } as const;
export type GateStage = keyof typeof GATE_STAGES;

export interface StageEvent {
  stage: GateStage;
  label: string;
}

/** La barra nunca se completa antes de esto: el log tiene que alcanzar a leerse. */
export const GATE_MIN_MS = 1700;

/**
 * Un cuadro de la barra: se acerca suave a lo realmente cargado, sin superar
 * nunca lo cargado ni el tope de tiempo mínimo. Con movimiento reducido, salta.
 */
export function stepProgress(displayed: number, target: number, elapsedMs: number, reduced: boolean): number {
  const cap = reduced ? 100 : Math.min(100, (elapsedMs / GATE_MIN_MS) * 100);
  const goal = Math.min(target, cap);
  if (reduced) return goal;
  if (cap >= target && target - displayed < 0.4) return target;
  return displayed + (goal - displayed) * 0.12;
}

/** Opacidad de un glifo del muro: base tenue, más si ya "cargó", más si el cursor está cerca. */
export function wallAlpha(lit: boolean, near: number, light: boolean): number {
  const base = light ? 0.1 : 0.07;
  const litBoost = lit ? (light ? 0.16 : 0.13) : 0;
  return Math.min(0.85, base + litBoost + near * 0.55);
}
```

`lib/intro/bus.ts`:

```ts
import type { StageEvent } from "../gate/progress.ts";

export type GateState = "unknown" | "active" | "open";
type StartFn = (fromDoor: boolean) => void;

/**
 * Coordina el loader y el hero sin acoplarlos:
 * - el hero reporta etapas reales de carga (report) y el loader las muestra (subscribe);
 * - el hero pide arrancar su intro (requestStart) y el loader decide cuándo (openGate).
 * Vive como módulo: su estado sobrevive a la navegación del lado del cliente, así que
 * volver al home desde otra página no vuelve a mostrar el muro.
 */
export function createIntroBus() {
  let gate: GateState = "unknown";
  let stages: StageEvent[] = [];
  const listeners = new Set<(e: StageEvent) => void>();
  let pending: StartFn | null = null;

  return {
    report(e: StageEvent) {
      stages.push(e);
      listeners.forEach((l) => l(e));
    },
    subscribe(listener: (e: StageEvent) => void): () => void {
      stages.forEach(listener);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    gateState: (): GateState => gate,
    activateGate() {
      gate = "active";
    },
    openGate(fromDoor: boolean) {
      gate = "open";
      const fn = pending;
      pending = null;
      fn?.(fromDoor);
    },
    requestStart(fn: StartFn) {
      if (gate === "open") fn(false);
      else pending = fn;
    },
    reset() {
      gate = "unknown";
      stages = [];
      pending = null;
      listeners.clear();
    },
  };
}

export type IntroBus = ReturnType<typeof createIntroBus>;

export const introBus: IntroBus = createIntroBus();
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --test lib/gate/progress.test.ts lib/intro/bus.test.ts && npm test`
Expected: PASS, y el `npm test` completo también (verifica que el glob `lib/**/*.test.ts` encuentra los tests en subcarpetas).

- [ ] **Step 5: Commit**

```bash
git add lib/gate lib/intro
git commit -m "feat: progreso del loader y bus que coordina loader y hero"
```

---

### Task 9: Shaders y paletas de la escena

**Files:**
- Create: `components/hero/shaders.ts`, `components/hero/palettes.ts`

- [ ] **Step 1: Crear `components/hero/shaders.ts`**

```ts
/**
 * Cada punto es un glifo leído del atlas. El vertex shader calcula dónde está
 * (intro, rendija del loader, easter egg, scroll, deriva, mouse, onda de clic)
 * y de qué color (escaneo ámbar, hallazgo rojo → verde). Es GLSL "estilo 1":
 * ShaderMaterial de three agrega los #define de compatibilidad para WebGL2.
 */
export const VERT = /* glsl */ `
attribute vec3 aTarget;
attribute vec3 aStart;
attribute vec3 aDoor;
attribute vec3 aTarget2;
attribute float aGlyph;
attribute float aSeed;
attribute float aDot;
attribute float aBug;

uniform float uTime, uProgress, uScan, uScanOn, uPR, uSize, uMouseStr, uDrift;
uniform float uClickT, uScroll, uN, uMorph, uDoor, uAlphaMul, uBugGlyph;
uniform vec2 uMouse, uClick;
uniform vec3 uBase, uAccent, uAmber, uRed, uGreen;

varying float vGlyph;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float p = clamp((uProgress - aSeed * 0.45) / 0.55, 0.0, 1.0);
  p = 1.0 - pow(1.0 - p, 3.0);
  vec3 pos = mix(mix(aStart, aDoor, uDoor), aTarget, p);

  float mm = clamp((uMorph - aSeed * 0.35) / 0.65, 0.0, 1.0);
  mm = mm * mm * (3.0 - 2.0 * mm);
  pos = mix(pos, aTarget2, mm);
  pos.z += sin(mm * 3.14159) * (aSeed - 0.5) * 3.0;

  pos += (aStart - aTarget) * 0.28 * uScroll * uScroll + vec3(0.0, uScroll * (0.6 + aSeed * 1.6), 0.0);
  pos.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.012 * uDrift;
  pos.y += cos(uTime * 0.5 + aSeed * 30.0) * 0.012 * uDrift;

  vec2 d = pos.xy - uMouse;
  float f = smoothstep(1.15, 0.0, length(d)) * uMouseStr;
  pos.xy += normalize(d + 0.0001) * f * 0.42;
  pos.z += f * 1.6;

  float age = uTime - uClickT;
  vec2 cd = pos.xy - uClick;
  float ring = exp(-pow((length(cd) - age * 4.5) * 2.6, 2.0)) * exp(-age * 1.4) * step(0.0, age);
  pos.xy += normalize(cd + 0.0001) * ring * 0.22;
  pos.z += ring * 0.9;

  float s = exp(-pow((pos.y - uScan) * 5.0, 2.0));
  vec3 col = mix(uBase, uAccent, step(0.86, fract(aSeed * 7.13)));
  col = mix(col, uAccent * 1.15, aDot);
  col = mix(col, uAmber, s * 0.95);

  float behind = uScanOn * step(uScan, pos.y);
  float trail = behind * exp(-(pos.y - uScan) * 0.9);
  float isBug = aBug * behind * smoothstep(0.3, 0.6, trail);
  float fixd = aBug * behind * (1.0 - smoothstep(0.3, 0.6, trail));
  col = mix(col, uRed, isBug);
  col = mix(col, uGreen, fixd);
  col += ring * uAccent * 0.7;
  col = mix(col, uAccent * 1.15, mm * 0.55);
  col += f * 0.35 * uAccent;

  float rate = 0.1 + s * 14.0 + ring * 10.0;
  float tick = floor(uTime * rate * uDrift + aSeed * 17.0);
  float h = fract(sin(tick * 12.9898 + aSeed * 78.233) * 43758.5453);
  vColor = col;
  vGlyph = mix(mod(aGlyph + floor(h * uN), uN), uBugGlyph, aBug * behind);
  vAlpha = p * (0.9 + 0.3 * s + 0.2 * aDot + 0.8 * (isBug + fixd)) * (1.0 - 0.85 * uScroll) * uAlphaMul;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (1.0 + s * 0.45 + f * 0.7 + ring * 0.6 + isBug * 1.6 + fixd * 0.9) * (10.0 / -mv.z);
}
`;

export const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec2 uGrid;

varying float vGlyph;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 pc = gl_PointCoord;
  float cx = mod(vGlyph, uGrid.x);
  float cy = floor(vGlyph / uGrid.x);
  vec2 uv = vec2((cx + pc.x) / uGrid.x, 1.0 - (cy + pc.y) / uGrid.y);
  float a = texture2D(uAtlas, uv).a;
  if (a < 0.08) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;
```

- [ ] **Step 2: Crear `components/hero/palettes.ts`**

```ts
import { AdditiveBlending, NormalBlending, type Blending } from "three";
import type { ThemeName } from "@/lib/a11y";

type Rgb = [number, number, number];

export interface Palette {
  base: Rgb;
  accent: Rgb;
  amber: Rgb;
  red: Rgb;
  green: Rgb;
  /** Color de la línea del escáner. */
  scan: number;
  /** Aditivo brilla sobre fondo oscuro; sobre fondo claro se lavaría, así que es normal. */
  blending: Blending;
  /** En tema claro los glifos se dibujan con trazo extra para que tengan "tinta". */
  ink: boolean;
  /** Opacidad del polvo de fondo: en claro, al 30 % para que no parezcan manchas. */
  dustAlpha: number;
}

export const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    base: [0.74, 0.81, 0.94],
    accent: [0.49, 0.7, 1.0],
    amber: [0.98, 0.72, 0.33],
    red: [1.0, 0.42, 0.42],
    green: [0.44, 0.83, 0.64],
    scan: 0xf8b653,
    blending: AdditiveBlending,
    ink: false,
    dustAlpha: 1,
  },
  light: {
    base: [0.05, 0.08, 0.17],
    accent: [0.1, 0.36, 0.96],
    amber: [0.72, 0.42, 0.0],
    red: [0.77, 0.14, 0.17],
    green: [0.08, 0.47, 0.29],
    scan: 0xb86a00,
    blending: NormalBlending,
    ink: true,
    dustAlpha: 0.3,
  },
};
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add components/hero/shaders.ts components/hero/palettes.ts
git commit -m "feat: shaders y paletas de la escena del hero"
```

---

### Task 10: La escena (`components/hero/HeroScene.ts`)

**Files:**
- Create: `components/hero/HeroScene.ts`

Esta clase es imperativa a propósito (Three.js + 60 fps no pasan por el render de React). La lógica decidible ya está probada en `lib/`; aquí se cablea. Compárala con el mockup (`docs/superpowers/mockups/2026-09-22-home-hero-codigo.html`, funciones `build`, `frame`, `setReduce`, `setStatic`, `applyTheme`, `triggerEgg`): es la misma lógica, tipada.

- [ ] **Step 1: Crear el archivo**

```ts
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { ATLAS, BUG_GLYPH, EGG_TEXT, EGG_WORD, GLYPHS, GLYPH_COUNT, NAME_BASE, NAME_TEXT } from "@/lib/hero/glyphs";
import { pickFindings, sampleMask, shuffle } from "@/lib/hero/sample";
import { FINDINGS, auditView, findingState, scanPhase, scanY, type AuditView, type ScanPhase } from "@/lib/hero/scan";
import { decideQuality, qualitySettings, type Quality } from "@/lib/hero/quality";
import type { ThemeName } from "@/lib/a11y";
import { FRAG, VERT } from "./shaders";
import { PALETTES } from "./palettes";

export interface HeroSceneOptions {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Caja que reserva el alto del nombre en el layout. */
  slot: HTMLElement;
  /** El <h1> de texto: su tamaño se ajusta al del nombre de glifos. */
  nameEl: HTMLElement;
  /** Una etiqueta por hallazgo, en el orden de FINDINGS. */
  findingEls: HTMLElement[];
  fonts: { serif: string; mono: string };
  theme: ThemeName;
  reduced: boolean;
  onAudit: (view: AuditView) => void;
  onEgg: (active: boolean) => void;
  onEggNavigate: () => void;
}

const CAMERA_Z = 10;
const INTRO_MS = 2600;
const PROGRESS_DONE = 1.2;
const EGG_MS = 7000;
const MORPH_SECONDS = 1.3;
const BENCH_MS = 400;
const FS = 300;

interface Attrs {
  aTarget: number[];
  aStart: number[];
  aDoor: number[];
  aTarget2: number[];
  aGlyph: number[];
  aSeed: number[];
  aDot: number[];
  aBug: number[];
}
const VEC3_ATTRS: ReadonlyArray<keyof Attrs> = ["aTarget", "aStart", "aDoor", "aTarget2"];

function emptyAttrs(): Attrs {
  return { aTarget: [], aStart: [], aDoor: [], aTarget2: [], aGlyph: [], aSeed: [], aDot: [], aBug: [] };
}

function geometryFrom(a: Attrs): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(a.aTarget, 3));
  for (const key of Object.keys(a) as Array<keyof Attrs>) {
    g.setAttribute(key, new Float32BufferAttribute(a[key], VEC3_ATTRS.includes(key) ? 3 : 1));
  }
  return g;
}

function createUniforms(pixelRatio: number, reduced: boolean, atlas: CanvasTexture) {
  return {
    uTime: { value: 0 },
    uProgress: { value: reduced ? PROGRESS_DONE : 0 },
    uScan: { value: -100 },
    uScanOn: { value: 0 },
    uPR: { value: pixelRatio },
    uSize: { value: 10 },
    uMouse: { value: new Vector2(99, 99) },
    uMouseStr: { value: 0 },
    uClick: { value: new Vector2(99, 99) },
    uClickT: { value: -100 },
    uScroll: { value: 0 },
    uN: { value: GLYPH_COUNT },
    uMorph: { value: 0 },
    uDoor: { value: 0 },
    uDrift: { value: reduced ? 0 : 1 },
    uBugGlyph: { value: BUG_GLYPH },
    uAtlas: { value: atlas },
    uGrid: { value: new Vector2(ATLAS.cols, ATLAS.rows) },
    uBase: { value: new Vector3() },
    uAccent: { value: new Vector3() },
    uAmber: { value: new Vector3() },
    uRed: { value: new Vector3() },
    uGreen: { value: new Vector3() },
    uAlphaMul: { value: 1 },
  };
}
type Uniforms = ReturnType<typeof createUniforms>;

export class HeroScene {
  /** Glifos que forman el nombre (se muestra en el log del loader). */
  count = 0;
  /** fps medidos; null si se reutilizó la calidad guardada. */
  fps: number | null = null;

  private opts: HeroSceneOptions;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private group = new Group();
  private atlasCanvas = document.createElement("canvas");
  private atlas: CanvasTexture;
  private uniforms: Uniforms;
  private dustAlpha = { value: 1 };
  private material: ShaderMaterial;
  private dustMaterial: ShaderMaterial;
  private scanLine: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private points: Points | null = null;
  private dust: Points | null = null;
  private view = { w: 1, h: 1, worldW: 1, worldH: 1 };
  private bugPos: Array<[number, number, number]> = [];
  private nameTop = 1;
  private nameBottom = -1;
  private quality: Quality = "normal";
  private pixelRatio: number;
  private reduced: boolean;
  private staticMode = false;
  private inkAtlas: boolean | null = null;
  private running = false;
  private visible = true;
  private dirty = true;
  private introStart: number | null = null;
  private t0 = performance.now();
  private last = performance.now();
  private raf = 0;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0, wx: 99, wy: 99, twx: 99, twy: 99, str: 0, tstr: 0 };
  private morphTarget = 0;
  private eggTimer = 0;
  private keyBuffer = "";
  private lastAudit = "";
  private v = new Vector3();
  private cleanups: Array<() => void> = [];

  constructor(opts: HeroSceneOptions) {
    this.opts = opts;
    this.reduced = opts.reduced;
    // Lanza si no hay contexto WebGL: Hero.tsx lo atrapa y cae al hero de texto.
    this.renderer = new WebGLRenderer({ canvas: opts.canvas, antialias: false, alpha: true });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, qualitySettings("normal", opts.host.clientWidth).pixelRatioCap);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.camera.position.z = CAMERA_Z;
    this.scene.add(this.group);

    this.atlasCanvas.width = ATLAS.cols * ATLAS.cell;
    this.atlasCanvas.height = ATLAS.rows * ATLAS.cell;
    this.atlas = new CanvasTexture(this.atlasCanvas);
    this.uniforms = createUniforms(this.pixelRatio, this.reduced, this.atlas);

    const shared = { vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false };
    this.material = new ShaderMaterial({ uniforms: this.uniforms, ...shared });
    this.dustMaterial = new ShaderMaterial({ uniforms: { ...this.uniforms, uAlphaMul: this.dustAlpha }, ...shared });
    this.scanLine = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    this.group.add(this.scanLine);

    this.setTheme(opts.theme);
    this.build();
    this.bindEvents();
  }

  // ─── API pública ────────────────────────────────────────────────────────────

  /** Decide la calidad: reutiliza la guardada o mide ~0.4 s con las partículas aún invisibles. */
  async prepare(cached: Quality | null): Promise<Quality> {
    if (cached) {
      this.applyQuality(cached);
      return cached;
    }
    if (this.reduced) return this.quality;
    const start = performance.now();
    let frames = 0;
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        this.renderer.render(this.scene, this.camera);
        frames++;
        if (now - start < BENCH_MS) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const fps = frames / ((performance.now() - start) / 1000);
    this.fps = Math.round(fps);
    const q = decideQuality(fps);
    this.applyQuality(q);
    return q;
  }

  /** Arranca la intro. Con `fromDoor`, los glifos salen de la rendija del loader. */
  startIntro(fromDoor: boolean) {
    this.uniforms.uDoor.value = fromDoor ? 1 : 0;
    this.t0 = performance.now();
    this.introStart = this.t0;
    if (this.reduced) this.uniforms.uProgress.value = PROGRESS_DONE;
    this.resume();
  }

  setTheme(name: ThemeName) {
    const p = PALETTES[name];
    const u = this.uniforms;
    u.uBase.value.fromArray(p.base);
    u.uAccent.value.fromArray(p.accent);
    u.uAmber.value.fromArray(p.amber);
    u.uRed.value.fromArray(p.red);
    u.uGreen.value.fromArray(p.green);
    for (const m of [this.material, this.dustMaterial]) {
      m.blending = p.blending;
      m.needsUpdate = true;
    }
    this.scanLine.material.color.setHex(p.scan);
    this.scanLine.material.blending = p.blending;
    this.scanLine.material.needsUpdate = true;
    this.dustAlpha.value = p.dustAlpha;
    if (this.inkAtlas !== p.ink) {
      this.inkAtlas = p.ink;
      this.drawAtlas(p.ink);
    }
    this.dirty = true;
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    const u = this.uniforms;
    u.uDrift.value = reduced ? 0 : 1;
    if (reduced) {
      u.uProgress.value = PROGRESS_DONE;
      u.uScanOn.value = 0;
      u.uScan.value = -100;
      u.uClickT.value = -100;
      u.uMorph.value = this.morphTarget;
      this.scanLine.material.opacity = 0;
      Object.assign(this.mouse, { tstr: 0, str: 0, tx: 0, ty: 0, x: 0, y: 0 });
      this.hideFindings();
    }
    this.dirty = true;
  }

  /** Alto contraste / dislexia: CSS oculta el canvas; aquí solo se deja de dibujar. */
  setStatic(on: boolean) {
    this.staticMode = on;
    if (on) {
      this.hideFindings();
      this.pause();
    } else {
      this.resume();
    }
  }

  dispose() {
    this.pause();
    window.clearTimeout(this.eggTimer);
    this.cleanups.forEach((fn) => fn());
    this.points?.geometry.dispose();
    this.dust?.geometry.dispose();
    this.material.dispose();
    this.dustMaterial.dispose();
    this.scanLine.geometry.dispose();
    this.scanLine.material.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
  }

  // ─── Construcción ───────────────────────────────────────────────────────────

  private drawAtlas(ink: boolean) {
    const a = this.atlasCanvas.getContext("2d");
    if (!a) return;
    a.clearRect(0, 0, this.atlasCanvas.width, this.atlasCanvas.height);
    a.fillStyle = "#fff";
    a.strokeStyle = "#fff";
    a.lineWidth = 5;
    a.lineJoin = "round";
    a.textAlign = "center";
    a.textBaseline = "middle";
    a.font = `500 46px ${this.opts.fonts.mono}`;
    for (let i = 0; i < GLYPH_COUNT; i++) {
      const x = (i % ATLAS.cols) * ATLAS.cell + ATLAS.cell / 2;
      const y = Math.floor(i / ATLAS.cols) * ATLAS.cell + ATLAS.cell / 2 + 2;
      if (ink) a.strokeText(GLYPHS[i], x, y);
      a.fillText(GLYPHS[i], x, y);
    }
    this.atlas.needsUpdate = true;
  }

  private applyQuality(q: Quality) {
    if (q === this.quality) return;
    this.quality = q;
    const s = qualitySettings(q, this.opts.host.clientWidth);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, s.pixelRatioCap);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.uniforms.uPR.value = this.pixelRatio;
    this.build();
  }

  private build() {
    const { host, slot, nameEl, fonts } = this.opts;
    const W = host.clientWidth;
    const H = host.clientHeight;
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    const worldH = 2 * CAMERA_Z * Math.tan(MathUtils.degToRad(this.camera.fov / 2));
    const worldW = worldH * this.camera.aspect;
    this.view = { w: W, h: H, worldW, worldH };
    const pxToWorld = worldH / H;
    const settings = qualitySettings(this.quality, W);

    // 1. "Misael." en un canvas 2D con la serif real, a la escala en pantalla.
    const targetPxW = Math.min(W * 0.9, 1000);
    const c = document.createElement("canvas");
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return;
    const serif = `${FS}px ${fonts.serif}`;
    x.font = serif;
    const wName = x.measureText(NAME_BASE).width;
    const wAll = x.measureText(NAME_TEXT).width;
    const toScreen = targetPxW / wAll;
    slot.style.height = `${Math.round(toScreen * FS * 0.95)}px`;
    nameEl.style.fontSize = `${(toScreen * FS).toFixed(1)}px`;
    c.width = Math.ceil(wAll) + 20;
    c.height = Math.ceil(FS * 1.15);
    x.font = serif;
    x.fillStyle = "#fff";
    x.textBaseline = "middle";
    x.fillText(NAME_TEXT, 10, c.height / 2);

    const screenGap = (W < 600 ? 3.6 : 5.6) * settings.spacingScale;
    const gap = Math.max(2, Math.round(screenGap / toScreen));
    this.uniforms.uSize.value = screenGap * (W < 600 ? 1.7 : 1.55);
    const slotRect = slot.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const centerY = (H / 2 - (slotRect.top + slotRect.height / 2 - hostRect.top)) * pxToWorld;
    const pts = sampleMask(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height, gap);

    // 2. Un glifo por punto: destino, origen disperso, origen en la rendija, glifo, semilla.
    const A = emptyAttrs();
    const xs: number[] = [];
    for (const [px, py] of pts) {
      const sx = (px - 10 - wAll / 2) * toScreen * pxToWorld;
      const sy = -(py - c.height / 2) * toScreen * pxToWorld + centerY;
      A.aTarget.push(sx, sy, (Math.random() - 0.5) * 0.08);
      const r = 6 + Math.random() * 8;
      const th = Math.random() * Math.PI * 2;
      A.aStart.push(Math.cos(th) * r, Math.sin(th) * r * 0.6, -8 + Math.random() * 14);
      A.aDoor.push((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * worldH * 0.95, -1.5 + Math.random() * 2.5);
      A.aGlyph.push(Math.floor(Math.random() * GLYPH_COUNT));
      A.aSeed.push(Math.random());
      A.aDot.push(px - 10 > wName + 4 ? 1 : 0);
      A.aBug.push(0);
      xs.push(sx);
    }
    const n = pts.length;
    this.count = n;

    // 3. Los 4 hallazgos, repartidos a lo ancho del nombre (nunca en el punto).
    this.bugPos = pickFindings(xs, A.aDot.map((d) => d === 1), FINDINGS.length, Math.random).map((i) => {
      A.aBug[i] = 1;
      return [A.aTarget[i * 3], A.aTarget[i * 3 + 1], A.aTarget[i * 3 + 2]] as [number, number, number];
    });
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 1; i < A.aTarget.length; i += 3) {
      minY = Math.min(minY, A.aTarget[i]);
      maxY = Math.max(maxY, A.aTarget[i]);
    }
    this.nameTop = maxY + 0.35;
    this.nameBottom = minY - 0.35;

    // 4. Destino del easter egg: "/sobre-mi →" en la mono, misma escala.
    const c2 = document.createElement("canvas");
    const x2 = c2.getContext("2d", { willReadFrequently: true });
    if (!x2) return;
    const mono = `500 ${FS}px ${fonts.mono}`;
    x2.font = mono;
    const w2 = x2.measureText(EGG_TEXT).width;
    c2.width = Math.ceil(w2) + 20;
    c2.height = Math.ceil(FS * 1.15);
    x2.font = mono;
    x2.fillStyle = "#fff";
    x2.textBaseline = "middle";
    x2.fillText(EGG_TEXT, 10, c2.height / 2);
    const sc2 = Math.min(targetPxW * 0.8, W * 0.92) / w2;
    const gap2 = Math.max(2, Math.round((screenGap * 0.8) / sc2));
    const eggPts = shuffle(sampleMask(x2.getImageData(0, 0, c2.width, c2.height).data, c2.width, c2.height, gap2), Math.random);
    for (let i = 0; i < n; i++) {
      const [ex, ey] = eggPts[i % eggPts.length];
      const jitter = i >= eggPts.length ? (Math.random() - 0.5) * 0.03 : 0;
      A.aTarget2.push((ex - 10 - w2 / 2) * sc2 * pxToWorld + jitter, -(ey - c2.height / 2) * sc2 * pxToWorld + centerY, (Math.random() - 0.5) * 0.08);
    }
    this.points = this.replace(this.points, geometryFrom(A), this.material);

    // 5. Polvo de glifos en profundidad.
    const D = emptyAttrs();
    for (let i = 0; i < settings.dust; i++) {
      const z = -3 - Math.random() * 9;
      const k = (CAMERA_Z - z) / CAMERA_Z;
      const p = [(Math.random() - 0.5) * worldW * k * 1.1, (Math.random() - 0.5) * worldH * k * 1.1, z];
      D.aTarget.push(...p);
      D.aStart.push(...p);
      D.aDoor.push(...p);
      D.aTarget2.push(...p);
      D.aGlyph.push(Math.floor(Math.random() * GLYPH_COUNT));
      D.aSeed.push(0.2 + Math.random() * 0.3);
      D.aDot.push(0);
      D.aBug.push(0);
    }
    this.dust = this.replace(this.dust, geometryFrom(D), this.dustMaterial);
    this.dust.renderOrder = -1;

    this.scanLine.scale.set(worldW * 1.2, 0.006, 1);
    this.dirty = true;
  }

  private replace(old: Points | null, geometry: BufferGeometry, material: ShaderMaterial): Points {
    if (old) {
      this.group.remove(old);
      old.geometry.dispose();
    }
    const p = new Points(geometry, material);
    p.frustumCulled = false;
    this.group.add(p);
    return p;
  }

  // ─── Eventos ────────────────────────────────────────────────────────────────

  private listen(target: EventTarget, type: string, fn: EventListener, options?: AddEventListenerOptions) {
    target.addEventListener(type, fn, options);
    this.cleanups.push(() => target.removeEventListener(type, fn, options));
  }

  private bindEvents() {
    const { host } = this.opts;
    const toNdc = (e: PointerEvent): [number, number] => {
      const r = host.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
    };

    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      this.listen(host, "pointermove", (ev) => {
        if (this.reduced || this.staticMode) return;
        const [nx, ny] = toNdc(ev as PointerEvent);
        Object.assign(this.mouse, { tx: nx, ty: ny, twx: (nx * this.view.worldW) / 2, twy: (ny * this.view.worldH) / 2, tstr: 1 });
      });
      this.listen(host, "pointerleave", () => Object.assign(this.mouse, { tstr: 0, tx: 0, ty: 0 }));
    }

    this.listen(host, "pointerdown", (ev) => {
      const e = ev as PointerEvent;
      if (this.reduced || this.staticMode || (e.target as Element).closest("a,button")) return;
      const [nx, ny] = toNdc(e);
      this.uniforms.uClick.value.set((nx * this.view.worldW) / 2, (ny * this.view.worldH) / 2);
      this.uniforms.uClickT.value = this.uniforms.uTime.value;
    });

    this.listen(host, "click", (ev) => {
      if (this.morphTarget === 1 && !(ev.target as Element).closest("a,button")) this.opts.onEggNavigate();
    });

    this.listen(window, "keydown", (ev) => this.onKey(ev as KeyboardEvent));

    this.listen(
      window,
      "scroll",
      () => {
        this.uniforms.uScroll.value = Math.min(1, Math.max(0, window.scrollY / (host.clientHeight * 0.75)));
        this.dirty = true;
      },
      { passive: true },
    );

    let resizeTimer = 0;
    this.listen(window, "resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => this.build(), 150);
    });

    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.resume();
      else this.pause();
    });
    io.observe(host);
    this.cleanups.push(() => io.disconnect());

    this.listen(document, "visibilitychange", () => (document.hidden ? this.pause() : this.resume()));
  }

  private onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === "Enter" && this.morphTarget === 1) {
      this.opts.onEggNavigate();
      return;
    }
    if (e.key.length !== 1) return;
    this.keyBuffer = (this.keyBuffer + e.key.toLowerCase()).slice(-EGG_WORD.length);
    if (this.keyBuffer === EGG_WORD && !this.staticMode && window.scrollY < this.opts.host.clientHeight * 0.5) this.triggerEgg();
  }

  private triggerEgg() {
    this.morphTarget = 1;
    this.opts.onEgg(true);
    if (this.reduced) {
      this.uniforms.uMorph.value = 1;
      this.dirty = true;
    }
    window.clearTimeout(this.eggTimer);
    this.eggTimer = window.setTimeout(() => {
      this.morphTarget = 0;
      this.opts.onEgg(false);
      if (this.reduced) {
        this.uniforms.uMorph.value = 0;
        this.dirty = true;
      }
    }, EGG_MS);
  }

  // ─── Bucle ──────────────────────────────────────────────────────────────────

  private pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private resume() {
    if (this.running || this.staticMode || !this.visible || document.hidden || this.introStart === null) return;
    this.running = true;
    this.dirty = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private hideFindings() {
    this.opts.findingEls.forEach((el) => (el.dataset.state = "off"));
  }

  private emitAudit(view: AuditView) {
    const key = JSON.stringify(view);
    if (key === this.lastAudit) return;
    this.lastAudit = key;
    this.opts.onAudit(view);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    // Con movimiento reducido solo se dibuja cuando algo cambió (no gasta batería).
    if (this.reduced && !this.dirty) return;
    this.dirty = false;

    const u = this.uniforms;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const t = (now - this.t0) / 1000;
    u.uTime.value = t;
    if (!this.reduced && this.introStart !== null) {
      u.uProgress.value = Math.min(PROGRESS_DONE, ((now - this.introStart) / INTRO_MS) * PROGRESS_DONE);
    }

    const m = this.mouse;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    m.wx += (m.twx - m.wx) * 0.12;
    m.wy += (m.twy - m.wy) * 0.12;
    m.str += (m.tstr - m.str) * 0.06;
    u.uMouse.value.set(m.wx, m.wy);
    u.uMouseStr.value = m.str;
    this.group.rotation.y = m.x * 0.09;
    this.group.rotation.x = -m.y * 0.05;

    if (!this.reduced) {
      const step = dt / MORPH_SECONDS;
      u.uMorph.value = this.morphTarget ? Math.min(1, u.uMorph.value + step) : Math.max(0, u.uMorph.value - step);
    }
    const egging = u.uMorph.value > 0.001;

    const introDone = u.uProgress.value >= PROGRESS_DONE;
    const phase: ScanPhase = !this.reduced && !egging && introDone ? scanPhase(t) : { kind: "idle" };
    let y = -100;
    let on = 0;
    if (phase.kind === "scanning") {
      y = scanY(phase.k, this.nameTop, this.nameBottom);
      on = 1;
      this.scanLine.position.y = y;
      this.scanLine.material.opacity = 0.6 * Math.min(1, Math.sin(Math.PI * phase.k) * 2.5);
    } else {
      this.scanLine.material.opacity = 0;
      if (phase.kind === "fading") {
        y = this.nameBottom;
        on = phase.strength;
      }
    }
    u.uScan.value = y;
    u.uScanOn.value = on;
    this.emitAudit(auditView(phase, this.bugPos.map((b) => b[1]), y, egging));

    // Etiquetas de hallazgos proyectadas desde la posición 3D de cada glifo.
    this.group.updateMatrixWorld();
    const active = (phase.kind === "scanning" || (phase.kind === "fading" && phase.strength > 0.25)) && u.uScroll.value < 0.05;
    this.opts.findingEls.forEach((el, i) => {
      const b = this.bugPos[i];
      if (!b) return;
      const state = findingState(b[1], y, active);
      if (state !== "off") {
        this.v.set(b[0], b[1], b[2]).applyMatrix4(this.group.matrixWorld).project(this.camera);
        const left = ((this.v.x + 1) / 2) * this.view.w + 10;
        const top = ((1 - this.v.y) / 2) * this.view.h - 26;
        el.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
      }
      if (el.dataset.state !== state) el.dataset.state = state;
    });

    this.renderer.render(this.scene, this.camera);
  };
}
```

- [ ] **Step 2: Verificar tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores. Si ESLint marca `react-hooks/*` aquí es un falso positivo imposible (no es un componente); cualquier otro aviso, corrígelo.

- [ ] **Step 3: Commit**

```bash
git add components/hero/HeroScene.ts
git commit -m "feat: escena Three.js del hero (nombre de codigo, escaneo, easter egg)"
```

---

### Task 11: El componente `Hero`

**Files:**
- Create: `components/hero/Hero.tsx`, `components/hero/Hero.module.css`
- Modify: `app/globals.css` (al final del archivo)

- [ ] **Step 1: Reglas globales (el `<h1>` no puede depender de CSS Modules porque el script previo al paint escribe en `<html>`)**

Agrega al final de `app/globals.css`:

```css
/* ─── HERO DE CÓDIGO + MURO (home) ────────────────────────── */
/* Mientras se espera la escena 3D, el nombre de texto no se ve (evita el salto
   "Misael en blanco → Misael de código"). Sigue en el HTML para SEO y lectores. */
html[data-hero3d="on"] .hero-name { opacity: 0; }
/* Alto contraste / dislexia: el nombre es texto sólido aunque haya 3D. */
html[data-a11y-contrast="high"] .hero-name,
html[data-a11y-dyslexia="on"] .hero-name { opacity: 1 !important; }
/* El muro ya se vio en esta sesión: oculto antes del primer paint. */
html[data-gate="skip"] .code-gate { display: none; }
```

- [ ] **Step 2: Crear `components/hero/Hero.module.css`**

```css
.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 70% 55% at 50% 45%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%);
}

.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  transition: opacity 0.5s ease;
}
:global(html[data-hero3d="off"]) .canvas { display: none; }
:global(html[data-a11y-contrast="high"]) .canvas,
:global(html[data-a11y-dyslexia="on"]) .canvas { opacity: 0; }
:global(html[data-a11y-contrast="high"]) .hero::after { display: none; }

.content {
  position: relative;
  z-index: 2;
  width: min(1100px, 100% - 32px);
  padding-top: 4rem;
  text-align: center;
  pointer-events: none;
}

.eyebrow {
  margin: 0;
  min-height: 1.2em;
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--soft);
}
.eyebrow b { color: var(--accent2); font-weight: 500; }
.caret {
  display: inline-block;
  width: 0.55em;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: var(--accent2);
  animation: heroCaret 1s steps(1) infinite;
}
.caret[data-off] { visibility: hidden; animation: none; }
@keyframes heroCaret { 50% { opacity: 0; } }

.slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(120px, 26vw, 300px);
  margin: 0.9rem 0 1.1rem;
}
.name {
  margin: 0;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: min(19vw, 215px);
  line-height: 1;
  color: var(--text);
  white-space: nowrap;
  transition: opacity 0.7s ease;
}
.name em { font-style: normal; color: var(--accent2); }

.sub,
.actions {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.sub {
  max-width: 52ch;
  margin: 0 auto;
  color: var(--soft);
  font-size: clamp(0.95rem, 1.4vw, 1.05rem);
  line-height: 1.65;
  transition-delay: 0.15s;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1.6rem;
  pointer-events: auto;
  transition-delay: 0.3s;
}
.content[data-ready] .sub,
.content[data-ready] .actions { opacity: 1; transform: none; }

.scroll {
  position: absolute;
  bottom: 22px;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--soft);
}

.audit {
  position: absolute;
  right: 22px;
  bottom: 20px;
  z-index: 2;
  margin: 0;
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  color: var(--soft);
  opacity: 0;
  transition: opacity 0.8s ease;
}
.audit[data-on] { opacity: 1; }
.ok { color: var(--live); }
.warn { color: #f8b653; }
.bug { color: #ff7a7a; }
:global([data-theme="light"]) .warn { color: #8a5200; }
:global([data-theme="light"]) .bug { color: #b3261e; }

.finding {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  padding: 1px 6px;
  border: 1px solid rgba(255, 110, 110, 0.45);
  border-radius: 4px;
  background: rgba(40, 12, 18, 0.85);
  color: #ff8f8f;
  font-family: var(--font-mono), monospace;
  font-size: 0.64rem;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease, color 0.3s ease, border-color 0.3s ease;
}
.finding[data-state="found"],
.finding[data-state="fixed"] { opacity: 1; }
.finding[data-state="fixed"] { color: #7fe0b2; background: rgba(10, 34, 26, 0.85); border-color: rgba(111, 211, 164, 0.45); }
.finding[data-state="fixed"]::after { content: " ✓"; }
:global([data-theme="light"]) .finding { color: #b3261e; background: #fdeceb; border-color: rgba(179, 38, 30, 0.45); }
:global([data-theme="light"]) .finding[data-state="fixed"] { color: #146c43; background: #e3f3ea; border-color: rgba(20, 108, 67, 0.45); }

@media (max-width: 600px) {
  .audit { right: auto; left: 50%; bottom: 48px; transform: translateX(-50%); white-space: nowrap; }
}
```

- [ ] **Step 3: Crear `components/hero/Hero.tsx`**

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import type { HeroScene } from "./HeroScene";
import { introBus } from "@/lib/intro/bus";
import { EYEBROW_FULL, EYEBROW_LABEL, EYEBROW_SHORT, HERO_SUBTITLE } from "@/lib/hero/copy";
import { sliceParts, totalLength, type TypedPart } from "@/lib/typing";
import { FINDINGS, auditLine, type AuditView } from "@/lib/hero/scan";
import { hero3dAllowed, heroStaticMode, motionReduced, themeOf } from "@/lib/a11y";
import { QUALITY_KEY, parseCachedQuality } from "@/lib/hero/quality";

const TYPE_MS = 48;
const TYPE_DELAY_MS = 500;
const CARET_OFF_MS = 2600;
const CONTENT_DELAY_MS = 1400;
/** Si la escena no está lista a tiempo, el hero se muestra igual (como texto). */
const SAFETY_MS = 3200;

const A11Y_ATTRS = ["data-theme", "data-a11y-motion", "data-a11y-contrast", "data-a11y-dyslexia"];

export default function Hero() {
  const router = useRouter();
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const findingRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [eyebrow, setEyebrow] = useState<readonly TypedPart[]>(EYEBROW_FULL);
  const [typed, setTyped] = useState(0);
  const [caretOff, setCaretOff] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [audit, setAudit] = useState<AuditView>({ kind: "idle" });
  const [egg, setEgg] = useState(false);

  // Navegación del lado del cliente hacia el home: el script previo al paint no corrió,
  // así que se decide aquí, antes de pintar, si el <h1> de texto debe esperar al 3D.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-hero3d")) {
      root.setAttribute("data-hero3d", hero3dAllowed("WebGLRenderingContext" in window, navigator.hardwareConcurrency) ? "on" : "off");
    }
    if (window.innerWidth < 600) setEyebrow(EYEBROW_SHORT);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let scene: HeroScene | null = null;
    let disposed = false;

    const showEverything = () => {
      setIntroStarted(true);
      setTyped(Infinity);
      setCaretOff(true);
      setContentReady(true);
    };
    let gaveUp = false;
    const fallBackToText = (label: string) => {
      gaveUp = true;
      root.setAttribute("data-hero3d", "off");
      showEverything();
      introBus.report({ stage: "ready", label });
    };

    // Si la escena no existe a los 3.2 s (red lenta, CDN caído), el hero queda de texto
    // para esta visita y el muro termina igual.
    const safety = window.setTimeout(() => {
      if (!scene && !disposed) fallBackToText("modo texto (carga lenta)");
    }, SAFETY_MS);

    if (root.getAttribute("data-hero3d") !== "on") {
      fallBackToText("modo texto (sin WebGL)");
      return () => {
        disposed = true;
        window.clearTimeout(safety);
      };
    }

    (async () => {
      try {
        const { HeroScene } = await import("./HeroScene");
        if (disposed || gaveUp) return;
        introBus.report({ stage: "three", label: "three.js listo" });
        const body = getComputedStyle(document.body);
        const fonts = {
          serif: body.getPropertyValue("--font-dm-serif").trim() || "serif",
          mono: body.getPropertyValue("--font-mono").trim() || "monospace",
        };
        await Promise.all([document.fonts.load(`300px ${fonts.serif}`), document.fonts.load(`500 46px ${fonts.mono}`)]);
        if (disposed || gaveUp || !hostRef.current || !canvasRef.current || !slotRef.current || !nameRef.current) return;

        scene = new HeroScene({
          host: hostRef.current,
          canvas: canvasRef.current,
          slot: slotRef.current,
          nameEl: nameRef.current,
          findingEls: findingRefs.current.filter((el): el is HTMLSpanElement => el !== null),
          fonts,
          theme: themeOf(root),
          reduced: motionReduced(root, matchMedia),
          onAudit: setAudit,
          onEgg: setEgg,
          onEggNavigate: () => router.push("/sobre-mi"),
        });
        introBus.report({ stage: "scene", label: `escena: ${scene.count.toLocaleString("es-CO")} glifos` });

        let cached = null;
        try {
          cached = parseCachedQuality(sessionStorage.getItem(QUALITY_KEY));
        } catch {}
        const quality = await scene.prepare(cached);
        try {
          sessionStorage.setItem(QUALITY_KEY, quality);
        } catch {}
        if (disposed) return;
        const detail = scene.fps !== null ? ` · ${scene.fps} fps` : " · guardada";
        introBus.report({ stage: "ready", label: `calidad: ${quality === "low" ? "ligera" : "completa"}${detail}` });

        scene.setStatic(heroStaticMode(root));
        introBus.requestStart((fromDoor) => {
          if (disposed || !scene) return;
          scene.startIntro(fromDoor);
          setIntroStarted(true);
        });
      } catch {
        if (!disposed && !gaveUp) fallBackToText("modo texto (sin WebGL)");
      }
    })();

    const observer = new MutationObserver(() => {
      if (!scene) return;
      scene.setTheme(themeOf(root));
      scene.setReduced(motionReduced(root, matchMedia));
      scene.setStatic(heroStaticMode(root));
    });
    observer.observe(root, { attributes: true, attributeFilter: A11Y_ATTRS });

    return () => {
      disposed = true;
      window.clearTimeout(safety);
      observer.disconnect();
      scene?.dispose();
    };
  }, [router]);

  // Eyebrow letra por letra; subtítulo y botones después.
  useEffect(() => {
    if (!introStarted) return;
    const total = totalLength(eyebrow);
    if (typed >= total || motionReduced(document.documentElement, matchMedia)) {
      setTyped(Infinity);
      setCaretOff(true);
      setContentReady(true);
      return;
    }
    let n = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        n++;
        setTyped(n);
        if (n >= total) {
          window.clearInterval(interval);
          window.setTimeout(() => setCaretOff(true), CARET_OFF_MS);
        }
      }, TYPE_MS);
    }, TYPE_DELAY_MS);
    const ready = window.setTimeout(() => setContentReady(true), CONTENT_DELAY_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.clearTimeout(ready);
    };
    // `typed` se lee solo para saber si ya se mostró todo; no debe reiniciar el tipeo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introStarted, eyebrow]);

  const line = auditLine(audit);

  return (
    <section ref={hostRef} className={styles.hero} data-egg={egg ? "" : undefined} aria-labelledby="hero-name">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <div className={styles.content} data-ready={contentReady ? "" : undefined}>
        <p className={styles.eyebrow}>
          <span className="sr-only">{EYEBROW_LABEL}</span>
          <span aria-hidden="true">
            {sliceParts(eyebrow, typed).map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
          </span>
          <span className={styles.caret} data-off={caretOff ? "" : undefined} aria-hidden="true" />
        </p>

        <div ref={slotRef} className={styles.slot}>
          <h1 ref={nameRef} id="hero-name" className={`${styles.name} hero-name`}>
            Misael<em>.</em>
          </h1>
        </div>

        <p className={styles.sub}>{HERO_SUBTITLE}</p>
        <div className={styles.actions}>
          <Link href="/proyectos" className="btn-primary">
            Ver proyectos <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contacto" className="btn-ghost">
            Contacto
          </Link>
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        scroll ↓
      </div>

      <p className={styles.audit} data-on={introStarted ? "" : undefined} aria-hidden="true">
        {line.command}{" "}
        {line.parts.map((p, i) => (
          <span key={i} className={styles[p.tone]}>
            {p.text}
          </span>
        ))}
      </p>

      <div aria-hidden="true">
        {FINDINGS.map((f, i) => (
          <span
            key={f}
            ref={(el) => {
              findingRefs.current[i] = el;
            }}
            className={styles.finding}
            data-state="off"
          >
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verificar tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores. (El `Hero` todavía no se usa en ninguna página: se monta en la Task 13.)

- [ ] **Step 5: Commit**

```bash
git add components/hero/Hero.tsx components/hero/Hero.module.css app/globals.css
git commit -m "feat: componente Hero con nombre de codigo, eyebrow tipeado y esquina de auditoria"
```

---

### Task 12: El loader "muro de código"

**Files:**
- Create: `components/gate/wall.ts`, `components/gate/CodeGate.tsx`, `components/gate/CodeGate.module.css`

- [ ] **Step 1: Crear `components/gate/wall.ts`**

```ts
import { GLYPHS } from "@/lib/hero/glyphs";
import { wallAlpha } from "@/lib/gate/progress";
import { motionReduced } from "@/lib/a11y";

interface Cell {
  c: number;
  r: number;
  g: string;
  /** Umbral de progreso en el que el glifo se "enciende". */
  t: number;
}

const CW = 17;
const CH = 21;
const LIGHT_RADIUS = 140;

/**
 * El muro: una grilla de glifos dibujada en dos canvas (mitad izquierda y derecha)
 * que al abrir el loader se deslizan hacia los lados como una puerta.
 */
export class CodeWall {
  private cells: Cell[] = [];
  private W = 0;
  private H = 0;
  private dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  private shown = 0;
  private mouse = { x: -999, y: -999 };
  private dirty = true;
  private raf = 0;
  private observer: MutationObserver;
  private onResize = () => this.layout();

  constructor(
    private left: HTMLCanvasElement,
    private right: HTMLCanvasElement,
  ) {
    this.layout();
    window.addEventListener("resize", this.onResize);
    this.observer = new MutationObserver(() => (this.dirty = true));
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-a11y-contrast"] });
    this.raf = requestAnimationFrame(this.loop);
  }

  setShown(fraction: number) {
    if (fraction !== this.shown) {
      this.shown = fraction;
      this.dirty = true;
    }
  }

  setPointer(x: number, y: number) {
    this.mouse = { x, y };
    this.dirty = true;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.observer.disconnect();
  }

  private layout() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    const cols = Math.ceil(this.W / CW);
    const rows = Math.ceil(this.H / CH);
    this.cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.cells.push({ c, r, g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], t: Math.random() });
      }
    }
    for (const cv of [this.left, this.right]) {
      cv.width = Math.ceil((this.W / 2) * this.dpr);
      cv.height = Math.ceil(this.H * this.dpr);
    }
    this.dirty = true;
  }

  private draw() {
    const root = document.documentElement;
    const color = getComputedStyle(root).getPropertyValue("--accent2").trim() || "#7eb3ff";
    const light = root.getAttribute("data-theme") === "light";
    const half = this.W / 2;
    for (const [cv, ox] of [
      [this.left, 0],
      [this.right, half],
    ] as const) {
      const x = cv.getContext("2d");
      if (!x) continue;
      x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      x.clearRect(0, 0, half, this.H);
      x.font = "500 12px monospace";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = color;
      for (const cell of this.cells) {
        const px = cell.c * CW + CW / 2;
        const py = cell.r * CH + CH / 2;
        if (px < ox - CW || px > ox + half + CW) continue;
        const dx = px - this.mouse.x;
        const dy = py - this.mouse.y;
        const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / LIGHT_RADIUS);
        x.globalAlpha = wallAlpha(cell.t < this.shown, near, light);
        x.fillText(cell.g, px - ox, py);
      }
    }
  }

  private loop = () => {
    // Código vivo: de vez en cuando un glifo cambia (no con movimiento reducido).
    if (!motionReduced(document.documentElement, matchMedia) && Math.random() < 0.5 && this.cells.length) {
      const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
      cell.g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      this.dirty = true;
    }
    if (this.dirty) {
      this.draw();
      this.dirty = false;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
```

(El muro usa `monospace` genérico a 12 px a propósito: a ese tamaño y opacidad no se nota la diferencia con JetBrains Mono, y así no depende de que la fuente haya cargado.)

- [ ] **Step 2: Crear `components/gate/CodeGate.module.css`**

```css
.gate {
  position: fixed;
  inset: 0;
  z-index: 9000; /* debajo del AccessibilityWidget (9989/9990): sigue usable durante el muro */
  overflow: hidden;
  background: var(--bg);
  perspective: 1400px;
}
.gate[data-phase="open"] { background: transparent; pointer-events: none; }

.wall {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  display: block;
  background: var(--bg);
  transition: transform 1.15s cubic-bezier(0.75, 0, 0.2, 1), opacity 1.15s ease;
  will-change: transform;
}
.left { left: 0; transform-origin: left center; }
.right { right: 0; transform-origin: right center; }
.gate[data-phase="open"] .left { transform: translateX(-102%) rotateY(14deg); opacity: 0.2; }
.gate[data-phase="open"] .right { transform: translateX(102%) rotateY(-14deg); opacity: 0.2; }

.seam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 2;
  width: 2px;
  margin-left: -1px;
  background: var(--accent2);
  box-shadow: 0 0 18px 3px color-mix(in srgb, var(--accent2) 55%, transparent);
  transform: scaleY(0);
  transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease;
}
.gate[data-phase="ready"] .seam { transform: scaleY(1); animation: gateSeam 2.2s ease-in-out infinite; }
.gate[data-phase="open"] .seam { transform: scaleY(1); opacity: 0; }
@keyframes gateSeam { 50% { box-shadow: 0 0 30px 6px color-mix(in srgb, var(--accent2) 70%, transparent); } }

.panel {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: min(430px, 100% - 40px);
  padding: 1.1rem 1.2rem 1.2rem;
  transform: translate(-50%, -50%);
  border: 1px solid color-mix(in srgb, var(--accent2) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  color: var(--soft);
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.gate[data-phase="open"] .panel { opacity: 0; transform: translate(-50%, -46%); }

.log { margin: 0 0 0.9rem; min-height: 9.4em; font: inherit; line-height: 1.6; white-space: pre-wrap; }
.dim { color: var(--soft); }
.user,
.ok { color: var(--live); }

.bar { height: 3px; overflow: hidden; border-radius: 2px; background: color-mix(in srgb, var(--accent2) 15%, transparent); }
.bar span { display: block; width: 0; height: 100%; background: var(--accent2); }

.row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.9rem; }
.pct { color: var(--soft); }

.enter {
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: 7px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 0.85rem;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.gate[data-phase="ready"] .enter { opacity: 1; transform: none; }
.enter:focus-visible,
.skip:focus-visible { outline: 2px solid var(--accent2); outline-offset: 3px; }

.hint { margin: 0.6rem 0 0; text-align: right; color: var(--soft); font-size: 0.7rem; opacity: 0; transition: opacity 0.4s ease 0.2s; }
.gate[data-phase="ready"] .hint { opacity: 1; }

.skip {
  position: absolute;
  right: 18px;
  bottom: 16px;
  z-index: 3;
  padding: 0.4rem;
  border: 0;
  border-bottom: 1px solid currentColor;
  background: none;
  color: var(--soft);
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
}
.gate[data-phase="open"] .skip { opacity: 0; }
```

- [ ] **Step 3: Crear `components/gate/CodeGate.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./CodeGate.module.css";
import { CodeWall } from "./wall";
import { introBus } from "@/lib/intro/bus";
import { GATE_STAGES, stepProgress, type StageEvent } from "@/lib/gate/progress";
import { motionReduced } from "@/lib/a11y";
import { GATE_SEEN_KEY } from "@/lib/prePaint";

type Phase = "loading" | "ready" | "open" | "gone";
const OPEN_MS = 1250;

function reduced() {
  return motionReduced(document.documentElement, matchMedia);
}

/**
 * Loader "muro de código": solo cuando la visita llega al home, una vez por sesión.
 * Muestra la carga real (etapas que reporta el hero), y al entrar se abre en dos y
 * el hero arranca su intro desde la rendija.
 */
export default function CodeGate() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lines, setLines] = useState<string[]>([]);
  const [touch, setTouch] = useState(false);
  const phaseRef = useRef<Phase>("loading");
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<CodeWall | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inertRef = useRef<HTMLElement[]>([]);

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const releasePage = useCallback(() => {
    inertRef.current.forEach((el) => (el.inert = false));
    inertRef.current = [];
  }, []);

  // Antes de pintar: ¿corresponde mostrar el muro?
  useLayoutEffect(() => {
    const root = document.documentElement;
    const landedHere = root.getAttribute("data-landing") === "home";
    const seen = root.getAttribute("data-gate") === "skip";
    if (!landedHere || seen || introBus.gateState() === "open") {
      go("gone");
      introBus.openGate(false);
      return;
    }
    introBus.activateGate();
    setTouch(matchMedia("(pointer: coarse)").matches);
    inertRef.current = Array.from(document.querySelectorAll<HTMLElement>("main, nav, footer"));
    inertRef.current.forEach((el) => (el.inert = true));
    return releasePage;
  }, [go, releasePage]);

  const alive = phase !== "gone";
  useEffect(() => {
    if (!alive || !leftRef.current || !rightRef.current) return;
    const wall = new CodeWall(leftRef.current, rightRef.current);
    wallRef.current = wall;
    return () => wall.dispose();
  }, [alive]);

  // Barra de progreso: avanza con las etapas reales que reporta el hero.
  useEffect(() => {
    if (phase !== "loading") return;
    let target = 4;
    let shown = 0;
    let raf = 0;
    const pending: StageEvent[] = [];
    const t0 = performance.now();
    const unsubscribe = introBus.subscribe((e) => {
      pending.push(e);
      target = Math.max(target, GATE_STAGES[e.stage]);
    });
    document.fonts.ready.then(() => introBus.report({ stage: "fonts", label: "fuentes cargadas" }));

    const tick = () => {
      shown = stepProgress(shown, target, performance.now() - t0, reduced());
      wallRef.current?.setShown(shown / 100);
      const pct = Math.round(shown);
      if (fillRef.current) fillRef.current.style.width = `${shown.toFixed(1)}%`;
      if (pctRef.current) pctRef.current.textContent = `${pct}%`;
      barRef.current?.setAttribute("aria-valuenow", String(pct));
      const due = pending.filter((p) => shown >= GATE_STAGES[p.stage] - 0.5);
      if (due.length) {
        due.forEach((d) => pending.splice(pending.indexOf(d), 1));
        setLines((ls) => [...ls, ...due.sort((a, b) => GATE_STAGES[a.stage] - GATE_STAGES[b.stage]).map((d) => d.label)]);
      }
      if (shown >= 100) {
        go("ready");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [phase, go]);

  useEffect(() => {
    if (phase === "ready") btnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const open = useCallback(() => {
    const current = phaseRef.current;
    if (current === "open" || current === "gone") return;
    const fromDoor = current === "ready" && !reduced();
    try {
      sessionStorage.setItem(GATE_SEEN_KEY, "1");
    } catch {}
    releasePage();
    go("open");
    introBus.openGate(fromDoor);
    window.setTimeout(() => go("gone"), reduced() ? 0 : OPEN_MS);
  }, [go, releasePage]);

  useEffect(() => {
    if (!alive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open();
      else if (e.key === "Enter" && phaseRef.current === "ready" && e.target !== btnRef.current) open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alive, open]);

  if (phase === "gone") return null;

  return (
    <div
      className={`${styles.gate} code-gate`}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      onClick={() => {
        if (phaseRef.current === "ready") open();
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !reduced()) wallRef.current?.setPointer(e.clientX, e.clientY);
      }}
      onPointerLeave={() => wallRef.current?.setPointer(-999, -999)}
    >
      <canvas ref={leftRef} className={`${styles.wall} ${styles.left}`} aria-hidden="true" />
      <canvas ref={rightRef} className={`${styles.wall} ${styles.right}`} aria-hidden="true" />
      <div className={styles.seam} aria-hidden="true" />

      <div className={styles.panel}>
        <h2 id="gate-title" className="sr-only">
          Cargando el portfolio de Misael
        </h2>
        <pre className={styles.log} aria-hidden="true">
          <span className={styles.dim}>┌──(</span>
          <span className={styles.user}>misael㉿portfolio</span>
          <span className={styles.dim}>)-[~]</span>
          {"\n"}
          <span className={styles.dim}>└─$</span> ./entrar.sh
          {"\n"}
          {lines.map((l, i) => (
            <span key={i}>
              <span className={styles.ok}>[ ok ]</span> {l}
              {"\n"}
            </span>
          ))}
          {phase !== "loading" && <span className={styles.dim}>acceso listo.</span>}
        </pre>
        <div
          ref={barRef}
          className={styles.bar}
          role="progressbar"
          aria-label="Carga del sitio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span ref={fillRef} />
        </div>
        <div className={styles.row}>
          <span ref={pctRef} className={styles.pct} aria-hidden="true">
            0%
          </span>
          <button
            ref={btnRef}
            type="button"
            className={styles.enter}
            disabled={phase === "loading"}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            Entrar →
          </button>
        </div>
        <p className={styles.hint} aria-hidden="true">
          {touch ? "o toca en cualquier parte" : "o pulsa Enter"}
        </p>
      </div>

      <button
        type="button"
        className={styles.skip}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      >
        Saltar intro
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Verificar tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

Nota: en `npm run dev` React (StrictMode) monta los efectos dos veces, así que el log del muro puede mostrar "fuentes cargadas" repetido. En `next start` (producción) no pasa; verifica siempre contra el build de producción (Task 17).

- [ ] **Step 5: Commit**

```bash
git add components/gate
git commit -m "feat: loader muro de codigo con carga real y apertura desde la rendija"
```

---

### Task 13: Home resumido y montaje del home

**Files:**
- Create: `components/home/PrePaintScript.tsx`, `components/home/Reveal.tsx`, `components/home/MiniTerminal.tsx`, `components/home/Sections.tsx`, `components/home/Home.module.css`
- Rewrite: `app/page.tsx`

- [ ] **Step 1: `components/home/PrePaintScript.tsx`**

```tsx
import { PRE_PAINT_SCRIPT } from "@/lib/prePaint";

/** Script inline que corre durante el parseo del HTML, antes del primer paint (ver lib/prePaint.ts). */
export default function PrePaintScript() {
  return <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />;
}
```

- [ ] **Step 2: `components/home/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Aparece una sola vez al entrar en pantalla (clases globales .fade-in-section/.visible). */
export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-in-section ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: `components/home/MiniTerminal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import { motionReduced } from "@/lib/a11y";

const WORD = "whoami";

/** Avance de la consola de /sobre-mi: escribe `whoami` una vez al entrar en pantalla, sin respuesta. */
export default function MiniTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (motionReduced(document.documentElement, matchMedia)) {
          setN(WORD.length);
          return;
        }
        let i = 0;
        const tick = () => {
          i++;
          setN(i);
          if (i < WORD.length) timer = window.setTimeout(tick, 110);
        };
        timer = window.setTimeout(tick, 450);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className={styles.term} aria-hidden="true">
      <div className={styles.termBar}>
        <i />
        <i />
        <i />
      </div>
      <pre className={styles.termBody}>
        <span className={styles.termDim}>┌──(</span>
        <span className={styles.termUser}>misael㉿portfolio</span>
        <span className={styles.termDim}>)-[~]</span>
        {"\n"}
        <span className={styles.termDim}>└─$</span> <span className={styles.termCmd}>{WORD.slice(0, n)}</span>
        <span className={styles.termCaret} />
      </pre>
    </div>
  );
}
```

- [ ] **Step 4: `components/home/Home.module.css`**

```css
.sec { border-top: 1px solid var(--border); }
.label {
  margin: 0 0 0.9rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--accent2);
}
.title {
  margin: 0 0 2rem;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--text);
  text-wrap: balance;
}
.more {
  display: inline-block;
  margin-top: 1.8rem;
  font-size: 0.92rem;
}
.sec .more { color: var(--accent2); }
.sec .more:hover { border-bottom: 1px solid currentColor; }

/* qué hago */
.svc { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.card { padding: 1.5rem 1.5rem 1.4rem; border: 1px solid var(--border); border-radius: 12px; background: color-mix(in srgb, var(--surface) 60%, transparent); }
.card h3 { margin: 0 0 0.6rem; font-family: var(--font-dm-serif), serif; font-weight: 400; font-size: 1.35rem; color: var(--text); }
.card p { margin: 0; color: var(--soft); font-size: 0.95rem; line-height: 1.65; }
.mini { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-top: 1.1rem; font-family: var(--font-mono), monospace; font-size: 0.72rem; color: var(--soft); }
.chip { padding: 1px 7px; border: 1px solid color-mix(in srgb, var(--live) 50%, transparent); border-radius: 4px; color: var(--live); }

/* proyectos: filas sutiles (mismo patrón aprobado en /proyectos) */
.rows { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.rows li { border-bottom: 1px solid var(--border); }
.rows a {
  position: relative;
  display: grid;
  grid-template-columns: 3.2rem 1fr auto;
  align-items: baseline;
  gap: 1.2rem;
  padding: 1.4rem 0.4rem;
  transition: opacity 0.25s ease;
}
.rows a::before {
  content: "";
  position: absolute;
  top: 1.2rem;
  bottom: 1.2rem;
  left: -0.4rem;
  width: 2px;
  background: var(--accent2);
  transform: scaleY(0);
  transition: transform 0.25s ease;
}
.rows:hover a { opacity: 0.45; }
.rows a:hover,
.rows a:focus-visible { opacity: 1; }
.rows a:hover::before,
.rows a:focus-visible::before { transform: scaleY(1); }
.num { font-family: var(--font-mono), monospace; font-size: 0.75rem; color: var(--soft); }
.rows h3 { margin: 0 0 0.3rem; font-family: var(--font-dm-serif), serif; font-weight: 400; font-size: 1.45rem; color: var(--text); }
.rows p { margin: 0; max-width: 56ch; color: var(--soft); font-size: 0.92rem; line-height: 1.55; }
.metric { text-align: right; white-space: nowrap; font-family: var(--font-mono), monospace; font-size: 0.78rem; color: var(--accent2); }
.metric small { display: block; margin-top: 0.2rem; font-size: 0.68rem; color: var(--soft); }

/* sobre mí */
.about { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: center; gap: 2.5rem; }
.big { margin: 0; font-family: var(--font-dm-serif), serif; font-size: clamp(1.6rem, 3.4vw, 2.3rem); line-height: 1.22; color: var(--text); text-wrap: balance; }
.big em { font-style: normal; color: var(--accent2); }
.term { overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: #070b16; font-family: var(--font-mono), monospace; font-size: 0.8rem; color: #c7cfe0; }
.termBar { display: flex; gap: 6px; padding: 0.55rem 0.7rem; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
.termBar i { width: 9px; height: 9px; border-radius: 50%; background: #2a3348; }
.termBody { margin: 0; padding: 0.9rem 1rem 1.1rem; font: inherit; line-height: 1.6; white-space: pre-wrap; }
.termDim { color: #8b95b0; }
.termUser { color: #6bcf6b; }
.termCmd { color: #7eb3ff; }
.termCaret { display: inline-block; width: 0.55em; height: 1em; vertical-align: -2px; background: #7eb3ff; animation: termBlink 1s steps(1) infinite; }
@keyframes termBlink { 50% { opacity: 0; } }

/* contacto */
.contact { text-align: center; }
.contact .title { margin-bottom: 1rem; }
.lead { max-width: 46ch; margin: 0 auto 1.8rem; color: var(--soft); line-height: 1.65; }

@media (max-width: 800px) {
  .about { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .svc { grid-template-columns: 1fr; }
  .rows a { grid-template-columns: 2.4rem 1fr; }
  .metric { grid-column: 2; text-align: left; }
}
```

- [ ] **Step 5: `components/home/Sections.tsx`**

```tsx
import Link from "next/link";
import styles from "./Home.module.css";
import Reveal from "./Reveal";
import MiniTerminal from "./MiniTerminal";
import { projectNumber, projects } from "@/lib/projects";

export function ServicesPreview() {
  return (
    <section className={styles.sec} aria-labelledby="t-svc">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 01 · qué hago"}</p>
          <h2 id="t-svc" className={styles.title}>
            Construyo software y reviso el de otros.
          </h2>
        </Reveal>
        <div className={styles.svc}>
          <Reveal className={styles.card}>
            <h3>Desarrollo</h3>
            <p>Sitios y landing pages, apps web full-stack, apps móviles y sistemas a medida para negocios.</p>
            <div className={styles.mini}>React · Next.js · Vue · Node.js · Flutter</div>
          </Reveal>
          <Reveal className={styles.card} delay={80}>
            <h3>Auditoría de código</h3>
            <p>
              Reviso tu repositorio y te entrego un informe con hallazgos priorizados: qué es crítico y qué puede esperar. No ofrezco
              pentesting por ahora.
            </p>
            <div className={styles.mini}>
              $ audit ./tu-repo <span className={styles.chip}>xss ✓</span>
              <span className={styles.chip}>secret expuesto ✓</span>
            </div>
          </Reveal>
        </div>
        {/* Cuando exista /servicios: "Ver servicios y cómo trabajo →" con href="/servicios". */}
        <Link className={styles.more} href="/contacto">
          Cuéntame tu proyecto →
        </Link>
      </div>
    </section>
  );
}

export function ProjectsPreview() {
  const featured = projects.slice(0, 3);
  return (
    <section className={styles.sec} aria-labelledby="t-proj">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 02 · proyectos"}</p>
          <h2 id="t-proj" className={styles.title}>
            Lo que he construido
          </h2>
        </Reveal>
        <Reveal>
          <ul className={styles.rows}>
            {featured.map((p) => (
              <li key={p.slug}>
                <Link href={`/proyectos/${p.slug}`}>
                  <span className={styles.num}>{projectNumber(p.slug)}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.summary}</p>
                  </div>
                  <span className={styles.metric}>
                    {p.metric.value}
                    <small>{p.metric.label}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <Link className={styles.more} href="/proyectos">
          Ver los {projects.length} proyectos →
        </Link>
      </div>
    </section>
  );
}

export function AboutPreview() {
  return (
    <section className={styles.sec} aria-labelledby="t-about">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 03 · sobre mí"}</p>
        </Reveal>
        <div className={styles.about}>
          <Reveal>
            <h2 id="t-about" className={styles.big}>
              Construyo con la misma disciplina con la que entreno: <em>poco a poco, sin atajos.</em>
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <MiniTerminal />
          </Reveal>
        </div>
        <Link className={styles.more} href="/sobre-mi">
          Conóceme mejor →
        </Link>
      </div>
    </section>
  );
}

export function ContactCta() {
  return (
    <section className={`${styles.sec} ${styles.contact}`} aria-labelledby="t-contact">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 04 · contacto"}</p>
          <h2 id="t-contact" className={styles.title}>
            ¿Tienes un proyecto en mente?
          </h2>
          <p className={styles.lead}>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
          <Link className="btn-primary" href="/contacto">
            Hablemos <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
```

Verifica antes de seguir que `projects[0..2]` son MEDI-IA, AnimalVision y Sistema de librería en ese orden, y que cada uno tiene `metric` (`grep -n "metric:" lib/projects.ts`). Si `metric` fuera opcional en el tipo, `npx tsc` lo dirá: en ese caso filtra con `p.metric &&`.

- [ ] **Step 6: Reescribir `app/page.tsx`**

Reemplaza el archivo completo (el formulario de contacto se mueve a `components/ContactForm.tsx` en la Task 14; guárdalo antes de sobrescribir):

```bash
cp app/page.tsx .superpowers/page-antiguo.tsx
```

```tsx
import PrePaintScript from "@/components/home/PrePaintScript";
import CodeGate from "@/components/gate/CodeGate";
import Hero from "@/components/hero/Hero";
import { AboutPreview, ContactCta, ProjectsPreview, ServicesPreview } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <PrePaintScript />
      <CodeGate />
      <main id="main-content">
        <Hero />
        <ServicesPreview />
        <ProjectsPreview />
        <AboutPreview />
        <ContactCta />
      </main>
    </>
  );
}
```

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: todo en verde.

- [ ] **Step 8: Commit**

```bash
git add components/home app/page.tsx
git commit -m "feat: home resumido con loader, hero de codigo y 4 secciones"
```

---

### Task 14: `/contacto`, navbar, limpieza del loader viejo

**Files:**
- Create: `components/ContactForm.tsx`, `app/contacto/page.tsx`, `app/contacto/page.module.css`
- Modify: `components/Navbar.tsx`, `app/layout.tsx`, `app/proyectos/[slug]/page.tsx:137`, `app/sitemap.ts`
- Delete: `components/Loader.tsx`, `components/LoaderContext.tsx`, `components/HeroVideo.tsx`, `public/video/`

- [ ] **Step 1: `components/ContactForm.tsx`**

Copia de `.superpowers/page-antiguo.tsx` (el `app/page.tsx` viejo) la función `announce`, el tipo `SubmitStatus`, el ícono `SendIcon` y el cuerpo del formulario de `ContactSection`, sin el `<section>`, sin el título y sin `useFadeIn`. El archivo queda así:

```tsx
"use client";

import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "sending" | "success" | "error";

function announce(message: string) {
  const el = document.getElementById("a11y-announcer");
  if (el) el.textContent = message;
}

function SendIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          // Campo honeypot: invisible para personas, los bots suelen rellenarlo.
          honeypot: data.get("company"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json.error ?? "No se pudo enviar el mensaje. Intenta de nuevo.";
        setErrorMsg(msg);
        setStatus("error");
        announce(msg);
        return;
      }
      setStatus("success");
      announce("Mensaje enviado correctamente. Gracias por escribir.");
      form.reset();
    } catch {
      const msg = "Error de conexión. Revisa tu internet e intenta de nuevo.";
      setErrorMsg(msg);
      setStatus("error");
      announce(msg);
    }
  }

  if (status === "success") {
    return (
      <p role="status" style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
        ¡Gracias! Tu mensaje fue enviado correctamente. Te responderé pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
      {/* Honeypot anti-spam: oculto visualmente, invisible para lectores de pantalla */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />
      <div className="form-group">
        <label className="form-label" htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" className="form-input" placeholder="Tu nombre" required disabled={status === "sending"} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="form-input" placeholder="tu@email.com" required disabled={status === "sending"} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="message">Mensaje</label>
        <textarea id="message" name="message" className="form-textarea" placeholder="Cuéntame sobre tu proyecto..." required disabled={status === "sending"} />
      </div>
      {status === "error" && (
        <p role="alert" style={{ color: "#f37272", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          {errorMsg}
        </p>
      )}
      <div style={{ marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? "Enviando..." : <>Enviar mensaje <SendIcon /></>}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: `app/contacto/page.module.css` y `app/contacto/page.tsx`**

```css
.wrap { padding-top: 9rem; }
.lead { max-width: 52ch; margin: -2.5rem 0 2.5rem; color: var(--soft); line-height: 1.7; }
.form { max-width: 560px; }
```

```tsx
import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbele a Misael para un proyecto de desarrollo web o móvil, o para auditar el código de tu aplicación.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <p className="section-label">Contacto</p>
        <h1 className="section-title">Hablemos</h1>
        <p className={styles.lead}>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
        <div className={styles.form}>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Navbar con rutas reales (`components/Navbar.tsx`)**

Reemplaza la constante `SECTIONS`, el estado `active` y el efecto de scroll-spy. El archivo queda:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkStyle = (active: boolean) => ({
    color: active ? "var(--text)" : "var(--soft)",
    borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
    paddingBottom: "2px",
    transition: "color 300ms ease, border-color 300ms ease",
    fontSize: "0.85rem",
  });

  return (
    <nav
      className="navbar"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--bg) 80%, transparent)" : "transparent",
        borderBottomColor: scrolled ? "var(--border)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
      }}
    >
      <Link href="/" className="navbar-logo">
        Portfolio Misael
      </Link>

      <div className="navbar-links">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} style={linkStyle(active)} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          );
        })}

        <button className="theme-toggle" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="Cambiar tema">
          {theme === "dark" ? (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Quitar el loader viejo del layout y borrar archivos**

En `app/layout.tsx`: borra los imports de `Loader` y `LoaderProvider`, borra `<Loader />` y reemplaza `<LoaderProvider>` … `</LoaderProvider>` por un fragmento `<>` … `</>` (deja todo lo de adentro igual).

```bash
git rm components/Loader.tsx components/LoaderContext.tsx components/HeroVideo.tsx
git rm -r public/video
grep -rn "useLoader\|LoaderContext\|HeroVideo\|/video/" app components lib
```
Expected: el `grep` no devuelve nada.

- [ ] **Step 5: Enlaces y sitemap**

En `app/proyectos/[slug]/page.tsx` (línea ~137) cambia `href="/#contact"` por `href="/contacto"`.

En `app/sitemap.ts`, agrega después de la línea de `/proyectos`:

```ts
    { url: `${siteUrl}/sobre-mi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contacto`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: todo en verde; en la salida del build aparecen `/contacto` y `/` (y `/sobre-mi` todavía no).

- [ ] **Step 7: Commit**

```bash
git add -A components app public
git commit -m "feat: pagina /contacto, navbar con rutas reales y fuera el loader y el video viejos"
```

---

### Task 15: Datos de la consola de `/sobre-mi` (`lib/sobreMi.ts`)

**Files:**
- Create: `lib/sobreMi.ts`
- Test: `lib/sobreMi.test.ts`

- [ ] **Step 1: Verificar las URLs reales de los canales**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -L "https://www.youtube.com/@ElPinguinoDeMario"
curl -s -o /dev/null -w "%{http_code}\n" -L "https://www.youtube.com/@s4vitar"
```
Expected: `200` en ambas. Si alguna da 404, busca el canal en YouTube y usa su URL real en el Step 3 (y en el test).

- [ ] **Step 2: Escribir el test**

```ts
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
```

- [ ] **Step 3: Implementar**

```ts
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
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test lib/sobreMi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/sobreMi.ts lib/sobreMi.test.ts
git commit -m "feat: datos de la consola de /sobre-mi"
```

---

### Task 16: Consola Kali y página `/sobre-mi`

**Files:**
- Create: `components/sobre-mi/KaliConsole.tsx`, `components/sobre-mi/KaliConsole.module.css`, `app/sobre-mi/page.tsx`, `app/sobre-mi/page.module.css`

- [ ] **Step 1: `components/sobre-mi/KaliConsole.module.css`**

```css
.console {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(126, 179, 255, 0.18);
  border-radius: 12px;
  background: #070b16;
  box-shadow: 0 0 40px rgba(79, 142, 247, 0.06), inset 0 0 60px rgba(79, 142, 247, 0.03);
  color: #c7cfe0;
  font-family: var(--font-mono), monospace;
}
.bar { display: flex; align-items: center; gap: 6px; padding: 0.6rem 0.8rem; border-bottom: 1px solid rgba(126, 179, 255, 0.12); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #2a3348; }
.title { margin-left: 0.5rem; color: #8b95b0; font-size: 0.72rem; }

.body {
  max-height: 640px;
  overflow-y: auto;
  padding: 1rem 1.1rem 1.2rem;
  font-size: 0.79rem;
  line-height: 1.75;
  letter-spacing: -0.01em;
  scroll-behavior: smooth;
}
.body::-webkit-scrollbar { width: 6px; }
.body::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(126, 179, 255, 0.2); }

.motd { color: #8b95b0; }
.p1, .p2 { color: #8b95b0; }
.host { color: #6bcf6b; font-weight: 500; }
.cmd { color: #f0f0f2; }
.flag { color: #f8b653; }
.caret { display: inline-block; width: 0.55em; height: 1em; margin-left: 1px; vertical-align: -2px; background: #7eb3ff; animation: kaliCaret 1s steps(1) infinite; }
@keyframes kaliCaret { 50% { opacity: 0; } }

.out { margin: 0.1rem 0 0.7rem; animation: kaliOut 0.3s ease both; }
@keyframes kaliOut { from { opacity: 0; } }
.out a { color: #7eb3ff; border-bottom: 1px solid rgba(126, 179, 255, 0.4); }
.out a:hover { border-bottom-color: #7eb3ff; }
.out strong { color: #f0f0f2; font-weight: 600; }
.cat { color: #7eb3ff; }
.live { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0 0.45rem; border: 1px solid rgba(95, 209, 139, 0.4); border-radius: 99px; color: #5fd18b; }
.live::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #5fd18b; animation: kaliPulse 1.6s ease-in-out infinite; }
@keyframes kaliPulse { 50% { opacity: 0.3; } }

.neofetch { display: flex; gap: 1.2rem; margin: 0.2rem 0 0.8rem; animation: kaliOut 0.3s ease both; }
.logo { margin: 0; color: #7eb3ff; font: inherit; line-height: 1.3; }
.swatches { display: flex; gap: 4px; margin-top: 0.4rem; }
.swatches i { width: 18px; height: 10px; background: #7eb3ff; }
.swatches i:nth-child(2) { background: #6bcf6b; }
.swatches i:nth-child(3) { background: #f8b653; }
.swatches i:nth-child(4) { background: #ff7a7a; }
.swatches i:nth-child(5) { background: rgba(79, 142, 247, 0.25); }

.cmdbar { display: flex; gap: 0.5rem; padding: 0.6rem 0.8rem; border-top: 1px solid rgba(126, 179, 255, 0.12); opacity: 0; transition: opacity 0.4s ease; }
.cmdbar[data-on] { opacity: 1; }
.chip {
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(79, 142, 247, 0.3);
  border-radius: 5px;
  background: transparent;
  color: #7eb3ff;
  font: inherit;
  font-size: 0.74rem;
}
.chip::before { content: "❯ "; }
.chip:hover:not(:disabled) { background: rgba(79, 142, 247, 0.2); }
.chip:disabled { opacity: 0.3; }
.chip:focus-visible { outline: 2px solid #7eb3ff; outline-offset: 2px; }
```

- [ ] **Step 2: `components/sobre-mi/KaliConsole.tsx`**

```tsx
"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./KaliConsole.module.css";
import { BASE_ENTRIES, BONUS_ENTRIES, NEOFETCH_LOGO, type ConsoleEntry, type Line } from "@/lib/sobreMi";
import { tokenize, typedTokens } from "@/lib/terminal";
import { motionReduced } from "@/lib/a11y";

const TYPE_MS = 68;
const OUT_DELAY_MS = 120;
const NEXT_DELAY_MS = 180;

interface Shown {
  entry: ConsoleEntry;
  typed: number;
  done: boolean;
}

const allDone = (entries: readonly ConsoleEntry[]): Shown[] => entries.map((entry) => ({ entry, typed: entry.command.length, done: true }));

function Output({ lines }: { lines: readonly Line[] }) {
  return (
    <div className={styles.out}>
      {lines.map((line, i) => (
        <div key={i}>
          {line.map((s, j) => {
            if (s.href)
              return (
                <a key={j} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.text}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              );
            if (s.strong) return <strong key={j}>{s.text}</strong>;
            if (s.cat) return <span key={j} className={styles.cat}>{s.text}</span>;
            if (s.live) return <span key={j} className={styles.live}>{s.text}</span>;
            return <Fragment key={j}>{s.text}</Fragment>;
          })}
        </div>
      ))}
    </div>
  );
}

function Neofetch({ lines }: { lines: readonly Line[] }) {
  return (
    <div className={styles.neofetch}>
      <pre className={styles.logo} aria-hidden="true">
        {NEOFETCH_LOGO}
      </pre>
      <div>
        <Output lines={lines} />
        <div className={styles.swatches} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

/**
 * Consola estilo Kali. Sin JS (o con movimiento reducido) todo el contenido está
 * escrito desde el HTML; con JS se borra antes de pintar y se escribe solo, una vez,
 * al entrar en pantalla. El texto que se va tipeando es aria-hidden y el comando
 * completo va en .sr-only: el lector de pantalla nunca lee letra por letra.
 */
export default function KaliConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Shown[]>(() => allDone(BASE_ENTRIES));
  const [baseDone, setBaseDone] = useState(true);
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (entries: readonly ConsoleEntry[], signal: AbortSignal) => {
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = window.setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
          window.clearTimeout(id);
          reject(new Error("abort"));
        });
      });
    for (const entry of entries) {
      setShown((s) => [...s, { entry, typed: 0, done: false }]);
      for (let i = 1; i <= entry.command.length; i++) {
        await sleep(TYPE_MS);
        setShown((s) => s.map((x, k) => (k === s.length - 1 ? { ...x, typed: i } : x)));
      }
      await sleep(OUT_DELAY_MS);
      setShown((s) => s.map((x, k) => (k === s.length - 1 ? { ...x, done: true } : x)));
      await sleep(NEXT_DELAY_MS);
    }
  }, []);

  // Antes de pintar: si hay animación, vaciar la consola y esperar a que entre en pantalla.
  useLayoutEffect(() => {
    if (motionReduced(document.documentElement, matchMedia)) return;
    setShown([]);
    setBaseDone(false);
  }, []);

  useEffect(() => {
    if (baseDone) return;
    const el = rootRef.current;
    if (!el) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run(BASE_ENTRIES, controller.signal)
          .then(() => setBaseDone(true))
          .catch(() => {});
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controller.abort();
    };
    // Solo al montar: baseDone cambia a true al terminar y no debe relanzar nada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [shown]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runBonus = (entry: ConsoleEntry) => {
    if (busy || used.includes(entry.id)) return;
    setUsed((u) => [...u, entry.id]);
    if (motionReduced(document.documentElement, matchMedia)) {
      setShown((s) => [...s, ...allDone([entry])]);
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    run([entry], controller.signal)
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  return (
    <div ref={rootRef} className={styles.console}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.title}>misael@portfolio: ~</span>
      </div>

      <div ref={bodyRef} className={styles.body}>
        <div className={styles.motd} aria-hidden="true">
          Last login: hoy — sesión iniciada desde este navegador
        </div>
        {shown.map(({ entry, typed, done }, i) => {
          const isLast = i === shown.length - 1;
          return (
            <div key={`${entry.id}-${i}`}>
              <div className={styles.p1} aria-hidden="true">
                ┌──(<span className={styles.host}>misael㉿portfolio</span>)-[~]
              </div>
              <div className={styles.p2}>
                <span aria-hidden="true">└─$ </span>
                <span aria-hidden="true">
                  {typedTokens(tokenize(entry.command), typed).map((t, k) => (
                    <span key={k} className={t.kind === "flag" ? styles.flag : styles.cmd}>
                      {t.text}
                    </span>
                  ))}
                </span>
                <span className="sr-only">Comando: {entry.command}</span>
                {!done && isLast && <span className={styles.caret} aria-hidden="true" />}
              </div>
              {done && (entry.kind === "neofetch" ? <Neofetch lines={entry.output} /> : <Output lines={entry.output} />)}
            </div>
          );
        })}
      </div>

      <div className={styles.cmdbar} data-on={baseDone ? "" : undefined}>
        {BONUS_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={styles.chip}
            disabled={!baseDone || busy || used.includes(entry.id)}
            onClick={() => runBonus(entry)}
            aria-label={`Ejecutar ${entry.command}`}
          >
            {entry.command}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `app/sobre-mi/page.module.css` y `app/sobre-mi/page.tsx`**

```css
.wrap { max-width: 760px; padding-top: 9rem; }
.big {
  max-width: 34ch;
  margin: 0 0 2.1rem;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(1.6rem, 4.2vw, 2.4rem);
  line-height: 1.22;
  letter-spacing: -0.01em;
  color: var(--text);
  text-wrap: balance;
}
.big em { font-style: normal; color: var(--accent2); }
.cta { margin-top: 2rem; }
```

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import KaliConsole from "@/components/sobre-mi/KaliConsole";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Misael: desarrollador freelance y auditor de código. Empezó en seguridad con El Pingüino de Mario y S4vitar; hoy construye con React, Next.js, Flutter y Python.",
  alternates: { canonical: "/sobre-mi" },
};

export default function SobreMiPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <h1 className="section-label">Sobre mí</h1>
        <p className={styles.big}>
          Construyo con la misma disciplina con la que entreno: <em>poco a poco, sin atajos.</em>
        </p>
        <KaliConsole />
        <div className={styles.cta}>
          <Link className="btn-primary" href="/contacto">
            Hablemos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: todo en verde; el build lista `/sobre-mi`.

- [ ] **Step 5: Commit**

```bash
git add components/sobre-mi app/sobre-mi
git commit -m "feat: pagina /sobre-mi con consola estilo Kali"
```

---

### Task 17: Verificación de punta a punta (Playwright + axe + Lighthouse)

**Files:**
- Create: `.superpowers/verify-home.py` (ignorado por git)

- [ ] **Step 1: Levantar el build de producción**

```bash
npm run build
```
PowerShell (libera el puerto y arranca en segundo plano):
```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force }
Start-Process -NoNewWindow npx -ArgumentList "next","start","-p","3100"
```
Espera a que `http://localhost:3100` responda 200.

- [ ] **Step 2: Crear `.superpowers/verify-home.py`**

```python
"""Verificación del home (muro + hero), /sobre-mi y /contacto contra `next start -p 3100`."""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
AXE = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
GL = ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"]
fails = []

def check(cond, msg):
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)

def axe(page, name):
    page.add_script_tag(url=AXE)
    v = page.evaluate("axe.run(document, {runOnly: ['wcag2a','wcag2aa']}).then(r => r.violations.map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes[0].target.join(' ')))")
    check(v == [], f"axe {name}: {v}")

with sync_playwright() as p:
    b = p.chromium.launch(args=GL)

    # 1. Primera visita: muro con carga real → Entrar → el muro se va y arranca la intro
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE)
    check(pg.locator(".code-gate").is_visible(), "el muro se ve al llegar al home")
    check(pg.evaluate("getComputedStyle(document.querySelector('.hero-name')).opacity") == "0", "el <h1> de texto está oculto mientras carga el 3D")
    pg.wait_for_selector(".code-gate[data-phase='ready']", timeout=15000)
    log = pg.locator(".code-gate pre").inner_text()
    for s in ["fuentes cargadas", "three.js listo", "glifos", "calidad:", "acceso listo."]:
        check(s in log, f"log del muro contiene '{s}'")
    check(pg.evaluate("document.activeElement.textContent.includes('Entrar')"), "el botón Entrar recibe el foco")
    check(pg.evaluate("document.querySelector('main').inert === true"), "la página está inert mientras el muro está cerrado")
    pg.screenshot(path=".superpowers/shots/home-gate-ready.png")
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(1600)
    check(pg.locator(".code-gate").count() == 0, "el muro desaparece tras abrir")
    check(pg.evaluate("sessionStorage.getItem('gateSeen')") == "1", "queda marcado como visto en la sesión")
    pg.wait_for_timeout(2500)
    pg.screenshot(path=".superpowers/shots/home-hero.png")
    check(pg.evaluate("getComputedStyle(document.querySelector('.hero-name')).opacity") == "0", "tras la intro el nombre lo forma el código (h1 oculto)")

    # 2. Escaneo: la esquina narra la auditoría y aparecen las 4 etiquetas
    pg.wait_for_function("document.querySelector('[class*=__audit]').textContent.includes('escaneando')", timeout=12000)
    pg.wait_for_function("document.querySelectorAll('[data-state=found],[data-state=fixed]').length > 0", timeout=5000)
    pg.wait_for_function("document.querySelector('[class*=__audit]').textContent.includes('4 hallazgos corregidos')", timeout=8000)
    check(True, "escaneo con hallazgos y '4 hallazgos corregidos'")
    axe(pg, "home")

    # 3. Recarga en la misma sesión: sin muro y sin "Misael" blanco antes del código
    pg.reload()
    samples = []
    for _ in range(14):
        samples.append(pg.evaluate("getComputedStyle(document.querySelector('.hero-name')).opacity"))
        pg.wait_for_timeout(100)
    check(all(s == "0" for s in samples), f"sin salto de texto al recargar: {samples}")
    check(pg.locator(".code-gate").count() == 0 or not pg.locator(".code-gate").is_visible(), "el muro no se muestra al recargar")

    # 4. Easter egg: whoami → /sobre-mi → Enter navega
    pg.wait_for_timeout(3000)
    pg.mouse.click(720, 120)
    pg.keyboard.type("whoami", delay=60)
    pg.wait_for_function("document.querySelector('[class*=__audit]').textContent.includes('/sobre-mi')", timeout=4000)
    pg.wait_for_timeout(1500)
    pg.screenshot(path=".superpowers/shots/home-egg.png")
    pg.keyboard.press("Enter")
    pg.wait_for_url("**/sobre-mi", timeout=5000)
    check(True, "el easter egg lleva a /sobre-mi")

    # 5. /sobre-mi: la consola escribe sola y el bonus funciona
    pg.wait_for_function("document.body.innerText.includes('gym · inglés')", timeout=15000)
    check("El Pingüino de Mario" in pg.inner_text("main"), "whoami con el origen en seguridad")
    pg.get_by_role("button", name="Ejecutar neofetch").click()
    pg.wait_for_function("document.body.innerText.includes('Misael OS')", timeout=5000)
    check(pg.get_by_role("button", name="Ejecutar neofetch").is_disabled(), "neofetch queda deshabilitado tras usarlo")
    pg.screenshot(path=".superpowers/shots/sobre-mi.png", full_page=True)
    axe(pg, "sobre-mi")

    # 6. /contacto: el formulario vive aquí
    pg.goto(BASE + "/contacto")
    check(pg.locator("form input[name=email]").count() == 1, "formulario en /contacto")
    axe(pg, "contacto")

    # 7. Volver al home navegando (no carga completa): sin muro
    pg.get_by_role("link", name="Portfolio Misael").click()
    pg.wait_for_url(BASE + "/")
    pg.wait_for_timeout(500)
    check(pg.locator(".code-gate").count() == 0, "navegar al home desde otra página no muestra el muro")
    check(errs == [], f"sin errores de JS: {errs}")
    ctx.close()

    # 8. Tema claro, alto contraste y movimiento reducido en vivo
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.goto(BASE); pg.wait_for_selector(".code-gate[data-phase='ready']", timeout=15000); pg.keyboard.press("Enter"); pg.wait_for_timeout(3500)
    pg.click(".theme-toggle"); pg.wait_for_timeout(800)
    pg.screenshot(path=".superpowers/shots/home-light.png")
    axe(pg, "home tema claro")
    pg.evaluate("document.documentElement.setAttribute('data-a11y-contrast','high')"); pg.wait_for_timeout(800)
    check(pg.evaluate("getComputedStyle(document.querySelector('.hero-name')).opacity") == "1", "alto contraste: nombre como texto")
    check(pg.evaluate("getComputedStyle(document.querySelector('[class*=__canvas]')).opacity") == "0", "alto contraste: canvas oculto")
    pg.evaluate("document.documentElement.setAttribute('data-a11y-contrast','off'); document.documentElement.setAttribute('data-a11y-motion','reduced')"); pg.wait_for_timeout(800)
    pg.screenshot(path=".superpowers/shots/home-reduced.png")
    ctx.close()

    # 9. Sin WebGL: hero tipográfico, el muro igual termina
    nb = p.chromium.launch(args=["--disable-webgl", "--disable-3d-apis"])
    pg = nb.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(BASE)
    pg.wait_for_selector(".code-gate[data-phase='ready']", timeout=15000)
    check("modo texto" in pg.locator(".code-gate pre").inner_text(), "sin WebGL el muro termina en 'modo texto'")
    pg.keyboard.press("Enter"); pg.wait_for_timeout(1500)
    check(pg.evaluate("getComputedStyle(document.querySelector('.hero-name')).opacity") == "1", "sin WebGL el nombre es texto")
    pg.screenshot(path=".superpowers/shots/home-nowebgl.png")
    nb.close()

    # 10. Móvil 400 px
    ctx = b.new_context(viewport={"width": 400, "height": 820}, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); pg.goto(BASE)
    pg.wait_for_selector(".code-gate[data-phase='ready']", timeout=20000)
    check("toca" in pg.locator(".code-gate").inner_text(), "en táctil la pista dice 'toca'")
    pg.locator(".code-gate").tap(); pg.wait_for_timeout(4000)
    pg.screenshot(path=".superpowers/shots/home-mobile.png", full_page=True)
    check(pg.evaluate("document.documentElement.scrollWidth <= 400"), "sin scroll horizontal en móvil")
    ctx.close()
    b.close()

print("\nFALLOS:" if fails else "\nTodo OK")
for f in fails:
    print(" -", f)
```

- [ ] **Step 3: Correr**

Run: `mkdir -p .superpowers/shots && PYTHONIOENCODING=utf-8 python .superpowers/verify-home.py`
Expected: `Todo OK`. Revisa las capturas de `.superpowers/shots/` con tus propios ojos (Read de las PNG) y compáralas con el mockup: nombre legible, etiquetas de hallazgos sobre el nombre, muro abierto sin restos, tema claro legible.

Si algo falla, corrige el código de la task correspondiente, vuelve a `npm run build`, reinicia el servidor y repite. No sigas con fallos.

- [ ] **Step 4: Lighthouse en móvil (meta del spec: ≥ 90)**

```bash
CHROME_PATH="$(python -c "from playwright.sync_api import sync_playwright; p=sync_playwright().start(); print(p.chromium.executable_path); p.stop()")" \
npx -y lighthouse http://localhost:3100/ --only-categories=performance,accessibility \
  --form-factor=mobile --output=json --output-path=.superpowers/lh-home.json --quiet --chrome-flags="--headless=new"
node -e "const r=require('./.superpowers/lh-home.json');console.log('perf',r.categories.performance.score*100,'a11y',r.categories.accessibility.score*100,'LCP',r.audits['largest-contentful-paint'].displayValue)"
```
Expected: `perf ≥ 90`, `a11y ≥ 95`.

Si `perf < 90` y el LCP es el culpable, aplica el plan B del spec (mostrar el subtítulo desde el primer paint): en `components/hero/Hero.module.css` quita `.sub` de la regla compartida con `.actions` para que no arranque en `opacity: 0`:

```css
.actions {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.sub {
  max-width: 52ch;
  margin: 0 auto;
  color: var(--soft);
  font-size: clamp(0.95rem, 1.4vw, 1.05rem);
  line-height: 1.65;
}
.content[data-ready] .actions { opacity: 1; transform: none; }
```

(borra la regla combinada `.sub, .actions { … }` y `.content[data-ready] .sub, …` y deja estas tres). Rebuild, repite Lighthouse y anota los números antes/después en la descripción del PR.

- [ ] **Step 5: Detener el servidor**

```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }
```

- [ ] **Step 6: Commit (solo si hubo correcciones)**

```bash
git add -A app components lib
git commit -m "fix: ajustes encontrados en la verificacion del home y /sobre-mi"
```

---

### Task 18: PR

**Files:** ninguno.

- [ ] **Step 1: Confirmar la cuenta de GitHub**

Run: `gh auth status`
Expected: la cuenta activa es `Milan32555`. Si no, `gh auth switch -u Milan32555`.

- [ ] **Step 2: Subir y abrir el PR**

```bash
git push -u origin feat/home-hero-sobre-mi
gh pr create --base main --title "Home con hero de codigo, loader muro de codigo, /sobre-mi y /contacto" --body "$(cat <<'EOF'
## Qué cambia
- **Loader "muro de código"** (solo al llegar al home, una vez por sesión): carga real (fuentes, Three.js, escena, calidad), rendija de luz, Entrar/Enter/toque, Saltar intro/Esc. Reemplaza al loader de tipeo.
- **Hero**: "Misael." hecho de ~2.7k glifos en Three.js (import dinámico). Escaneo de auditoría con 4 hallazgos (xss, sqli, secret expuesto, csrf), esquina `$ audit`, mouse, onda al clic, scroll que deshace el nombre, easter egg `whoami` → `/sobre-mi`.
- **Robustez**: `<h1>` real oculto mientras se espera el 3D (sin salto al recargar), hero de texto sin WebGL, tema claro, AccessibilityWidget en vivo (movimiento reducido, alto contraste, dislexia), calidad adaptativa por fps.
- **Home resumido**: qué hago, 3 proyectos, avance de la consola, CTA.
- **/sobre-mi**: consola estilo Kali (whoami, stack con Flutter, status de Base, gym · inglés) + neofetch/history.
- **/contacto**: el formulario que vivía en el home. Navbar con rutas reales.
- Fuera: `Loader`, `LoaderContext`, `HeroVideo` y `public/video/`.

## Verificación
- `npm test`, `tsc`, `lint`, `build` en verde.
- Playwright (`.superpowers/verify-home.py`): flujo del muro, escaneo, recarga sin salto, easter egg, /sobre-mi, /contacto, tema claro, alto contraste, sin WebGL, móvil 400 px. axe WCAG A/AA sin violaciones en home, /sobre-mi y /contacto.
- Lighthouse móvil: (pegar perf / a11y / LCP).

Specs: `docs/superpowers/specs/2026-09-22-home-y-hero-design.md`, `docs/superpowers/specs/2026-09-22-pagina-sobre-mi-design.md`.
EOF
)"
```

(Sin trailer de IA: regla del repo.)

- [ ] **Step 3: Esperar el preview de Vercel y revisarlo**

Run: `gh pr checks --watch`
Expected: el check de Vercel en `success`. Abre la URL del preview, prueba el muro y el hero en un navegador real (idealmente también en un celular), y deja el PR listo para que Misael lo revise y lo fusione.
