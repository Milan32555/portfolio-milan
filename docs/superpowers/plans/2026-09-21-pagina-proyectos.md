# `/proyectos` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/proyectos` (lista sutil de 4 proyectos) y `/proyectos/[slug]` (detalle con cifras, arquitectura explicada y el componente "Expediente"), tal como está especificado y aprobado.

**Architecture:** Server components de Next.js 16 alimentados por una única fuente de datos tipada (`lib/projects.ts`). La lógica pura (datos, portada generada, intención de hover) vive en `lib/` y se prueba con el runner nativo de Node (`node --test`). El único client component es `Expediente` (acordeón de carpetas con hover por intención). Los estilos son CSS Modules que consumen los tokens existentes del sitio (`--accent`, `--border`, `--surface`…), así siguen el tema claro/oscuro y heredarán la paleta navy cuando llegue el rediseño global.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript estricto, CSS Modules, `node:test`. Sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-09-21-pagina-proyectos-design.md`. **Mockup de referencia visual:** `docs/superpowers/mockups/2026-09-21-proyectos-lista-y-detalle.html` (ábrelo en el navegador mientras trabajas).

**Reglas del repo que debes respetar**
- **Sin trailer de Claude/IA en los commits** (regla del usuario para sus repos personales). Mensajes en español, estilo `feat: …` / `docs: …` como el historial existente.
- El sitio en producción sigue con el **diseño viejo** (navbar superior, tokens `--bg: #0c0c0e`, tema claro/oscuro, cursor propio con `cursor: none !important`). Este plan **no** implementa el rediseño (sidebar, footer Cordilleras): solo agrega las páginas nuevas encima del layout actual.
- Los CSS globales incluyen `a { color: inherit; text-decoration: none !important }`. En CSS Modules, cualquier color de enlace debe declararse con selector compuesto (p. ej. `.title a`) para ganarle a `a:hover`.
- Reutiliza las clases globales existentes: `.section`, `.section-label`, `.section-title`, `.btn-primary`, `.btn-ghost`, `.tag`.
- Fuente serif real del sitio: `var(--font-dm-serif)` (DM Serif Display, peso 400 único). El mockup usaba Fraunces solo como marcador.
- No hay framework de tests ni Playwright en el repo. Los tests de lógica usan `node --test`; la verificación visual usa un script Python con Playwright que vive en `.superpowers/` (carpeta ignorada por git).

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `tsconfig.json` (modificar) | Permitir `import "./x.ts"` para que `node --test` y `tsc` coincidan |
| `package.json` (modificar) | Script `test` |
| `app/globals.css` (modificar) | Tokens nuevos: `--soft`, `--line`, `--line-strong`, `--live`, `--mono` |
| `lib/hoverIntent.ts` + `.test.ts` | Regla pura "¿es un movimiento real de mouse?" y el retraso de intención |
| `lib/cover.ts` + `.test.ts` | Portada generada determinista (ruido sembrado → paths SVG) |
| `lib/projects.ts` + `.test.ts` | Tipos, los 4 proyectos y helpers (`getProject`, `getAdjacent`, `getCounts`, `projectNumber`) |
| `components/proyectos/ProjectCover.tsx` + `.module.css` | Portada: imagen real (`next/image`) o SVG generado |
| `components/proyectos/ProjectActions.tsx` | Botones "Ver demo" / "Ver código" accesibles |
| `components/proyectos/ProjectList.tsx` + `.module.css` | Las 4 filas de la lista (hover discreto solo CSS) |
| `components/proyectos/StatsRow.tsx` + `.module.css` | Tres cifras destacadas |
| `components/proyectos/ArchitectureFlow.tsx` + `.module.css` | "De la pantalla a los datos" |
| `components/proyectos/Expediente.tsx` + `.module.css` | **Único client component**: carpetas + hover por intención |
| `components/proyectos/ProjectMedia.tsx` | Video de recorrido (si existe) o portada + galería |
| `components/proyectos/ProjectPager.tsx` | Anterior / siguiente circular |
| `app/proyectos/page.tsx` + `page.module.css` | Lista |
| `app/proyectos/[slug]/page.tsx` + `page.module.css` | Detalle |
| `app/sitemap.ts`, `components/Navbar.tsx`, `app/page.tsx` (modificar) | Descubrimiento: sitemap, enlaces de la navbar que no se rompan fuera del home, enlace a `/proyectos` |
| `.superpowers/verify-proyectos.py` | Verificación visual/interactiva (no se commitea) |

---

### Task 0: Rama de trabajo y documentación

**Files:** ninguno (solo git).

- [ ] **Step 1: Comprobar el estado**

Run: `git status --short && git branch --show-current`
Expected: modificados `docs/superpowers/research/…investigacion-mejores-portfolios.md` y `docs/superpowers/specs/2026-09-08-portfolio-redesign-design.md`, sin seguimiento `docs/superpowers/mockups/`, `docs/superpowers/specs/2026-09-21-pagina-proyectos-design.md` y `docs/superpowers/plans/`; rama `docs/portfolio-redesign-spec`.

- [ ] **Step 2: Commitear la documentación en la rama actual**

```bash
git add docs/superpowers
git commit -m "docs: spec, mockups y plan de /proyectos; footer Cordilleras; investigacion pasada 8"
```

- [ ] **Step 3: Crear la rama de implementación**

```bash
git switch -c feat/proyectos
```
Expected: `Switched to a new branch 'feat/proyectos'`

---

### Task 1: Runner de tests y tokens de CSS

**Files:**
- Modify: `tsconfig.json`
- Modify: `package.json`
- Modify: `app/globals.css:15-27`

- [ ] **Step 1: Verificar la versión de Node**

Run: `node -v`
Expected: `v22.18.0` o superior (el borrado de tipos de TypeScript viene activado por defecto desde esa versión). Si es menor, añade `--experimental-strip-types` al script de `test` del Step 3.

- [ ] **Step 2: Permitir imports con extensión `.ts`**

En `tsconfig.json`, dentro de `compilerOptions`, después de `"isolatedModules": true,` añade:

```json
    "allowImportingTsExtensions": true,
```

- [ ] **Step 3: Añadir el script `test`**

En `package.json`, dentro de `scripts`, después de `"lint": "eslint"` (añade coma en la línea anterior):

```json
    "lint": "eslint",
    "test": "node --test \"lib/**/*.test.ts\""
```

- [ ] **Step 4: Añadir los tokens**

En `app/globals.css`, dentro de `:root`, reemplaza la línea `  --muted:     #6b6b78;` por:

```css
  --muted:     #6b6b78;
  --soft:      color-mix(in srgb, var(--text) 74%, var(--bg));
  --line:      color-mix(in srgb, var(--accent2) 16%, var(--border));
  --line-strong: color-mix(in srgb, var(--accent2) 30%, var(--border));
  --live:      #5fd18b;
  --mono:      ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

y en el bloque `[data-theme="light"]`, después de `  --muted:     #7a7a88;` añade:

```css
  --live:      #15803d;
```

- [ ] **Step 5: Comprobar que nada se rompió**

Run: `npx tsc --noEmit`
Expected: sin salida (0 errores).

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json package.json app/globals.css
git commit -m "chore: runner de tests nativo de Node y tokens para /proyectos"
```

---

### Task 2: Intención de hover (lógica pura, TDD)

**Files:**
- Create: `lib/hoverIntent.test.ts`
- Create: `lib/hoverIntent.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/hoverIntent.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HOVER_INTENT_MS, isRealMouseMove } from "./hoverIntent.ts";

describe("isRealMouseMove", () => {
  it("acepta un mouse que se movió", () => {
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 3, movementY: 0 }), true);
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 0, movementY: -2 }), true);
  });

  it("rechaza eventos sintéticos sin movimiento (el layout se movió, no el mouse)", () => {
    assert.equal(isRealMouseMove({ pointerType: "mouse", movementX: 0, movementY: 0 }), false);
  });

  it("rechaza touch y lápiz aunque reporten movimiento", () => {
    assert.equal(isRealMouseMove({ pointerType: "touch", movementX: 5, movementY: 5 }), false);
    assert.equal(isRealMouseMove({ pointerType: "pen", movementX: 5, movementY: 5 }), false);
  });
});

describe("HOVER_INTENT_MS", () => {
  it("es un retraso corto pero perceptible", () => {
    assert.ok(HOVER_INTENT_MS >= 100 && HOVER_INTENT_MS <= 250);
  });
});
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Run: `npm test`
Expected: FAIL con `Cannot find module '…/lib/hoverIntent.ts'` (ERR_MODULE_NOT_FOUND).

- [ ] **Step 3: Implementar**

`lib/hoverIntent.ts`:

```ts
/** Milisegundos que el cursor debe permanecer sobre una carpeta antes de abrirla. */
export const HOVER_INTENT_MS = 140;

export interface PointerLike {
  pointerType: string;
  movementX: number;
  movementY: number;
}

/**
 * Un evento cuenta como intención del usuario solo si es un mouse que realmente
 * se movió. Los navegadores disparan eventos sintéticos (movimiento 0) cuando el
 * layout se desplaza bajo un cursor quieto; ignorarlos evita la cascada de aperturas.
 */
export function isRealMouseMove(e: PointerLike): boolean {
  return e.pointerType === "mouse" && (e.movementX !== 0 || e.movementY !== 0);
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Run: `npm test`
Expected: `# pass 4`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/hoverIntent.ts lib/hoverIntent.test.ts
git commit -m "feat: logica pura de intencion de hover para las carpetas"
```

---

### Task 3: Portada generada determinista (TDD)

**Files:**
- Create: `lib/cover.test.ts`
- Create: `lib/cover.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/cover.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { coverLayers, hueFor } from "./cover.ts";

describe("hueFor", () => {
  it("es estable y cae en el rango azul-verdoso 185..230", () => {
    for (const slug of ["medi-ia", "animalvision", "library-system", "safe-transfer-ai"]) {
      const h = hueFor(slug);
      assert.equal(h, hueFor(slug));
      assert.ok(h >= 185 && h <= 230, `${slug} → ${h}`);
    }
  });
});

describe("coverLayers", () => {
  it("es determinista: misma entrada, mismas capas", () => {
    assert.deepEqual(coverLayers(42, 480, 300, 200), coverLayers(42, 480, 300, 200));
  });

  it("cambia con la semilla", () => {
    assert.notEqual(coverLayers(1, 480, 300, 200)[0].d, coverLayers(2, 480, 300, 200)[0].d);
  });

  it("devuelve 3 capas, las dos primeras con halftone", () => {
    const layers = coverLayers(7, 480, 300, 200);
    assert.equal(layers.length, 3);
    assert.deepEqual(layers.map((l) => l.dots), [true, true, false]);
  });

  it("genera paths SVG cerrados y con números finitos", () => {
    for (const l of coverLayers(9, 840, 360, 210)) {
      assert.ok(l.d.startsWith("M-40 "));
      assert.ok(l.d.endsWith(" Z"));
      const nums = l.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      assert.ok(nums.length > 100);
      assert.ok(nums.every(Number.isFinite));
    }
  });

  it("las capas se oscurecen de fondo a frente", () => {
    const lightness = coverLayers(3, 480, 300, 200).map((l) => Number(l.fill.match(/(\d+)%\)$/)![1]));
    assert.deepEqual(lightness, [...lightness].sort((a, b) => b - a));
  });
});
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Run: `npm test`
Expected: FAIL con `Cannot find module '…/lib/cover.ts'`.

- [ ] **Step 3: Implementar**

`lib/cover.ts`:

```ts
/** PRNG pequeño y determinista (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido de valor 1D suave, sembrado. */
export function valueNoise(seed: number): (x: number) => number {
  const rand = mulberry32(seed);
  const table = Array.from({ length: 256 }, rand);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[i & 255];
    const b = table[(i + 1) & 255];
    const t = f * f * (3 - 2 * f);
    return a + (b - a) * t;
  };
}

/** Tono estable por proyecto, en el rango azul-verdoso 185..230. */
export function hueFor(slug: string): number {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 185 + (h % 46);
}

export interface CoverLayer {
  /** Atributo `d` de un `<path>` cerrado. */
  d: string;
  fill: string;
  /** Si la capa lleva la trama de puntos (halftone) en la cresta. */
  dots: boolean;
}

const SPECS = [
  { base: 0.55, amp: 0.32, light: 30 },
  { base: 0.68, amp: 0.28, light: 21 },
  { base: 0.8, amp: 0.24, light: 13 },
] as const;

/** Tres cordilleras superpuestas (de fondo a frente), deterministas por semilla. */
export function coverLayers(seed: number, width: number, height: number, hue: number): CoverLayer[] {
  const noise = valueNoise(seed);
  return SPECS.map(({ base, amp, light }, li) => {
    let d = `M-40 ${height + 10} L-40 ${(height * base).toFixed(1)}`;
    for (let x = -40; x <= width + 40; x += 6) {
      const y = height * base - (noise(x * 0.006 + li * 13) * 0.7 + noise(x * 0.014 + li * 5) * 0.3) * height * amp;
      d += ` L${x} ${y.toFixed(1)}`;
    }
    d += ` L${width + 40} ${height + 10} Z`;
    return { d, fill: `hsl(${hue} 45% ${light}%)`, dots: li < 2 };
  });
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Run: `npm test`
Expected: `# pass 10`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/cover.ts lib/cover.test.ts
git commit -m "feat: portada generada determinista para proyectos sin captura"
```

---

### Task 4: Datos y helpers de proyectos (TDD)

**Files:**
- Create: `lib/projects.test.ts`
- Create: `lib/projects.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/projects.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAdjacent, getCounts, getProject, isLive, projectNumber, projects } from "./projects.ts";

const FIELDS_BORRADOR = ["periodo", "estado", "rol", "conMasTiempo", "arquitectura", "aviso"];

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
    for (const p of projects) for (const b of p.borrador) assert.ok(FIELDS_BORRADOR.includes(b), `${p.slug}: ${b}`);
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
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Run: `npm test`
Expected: FAIL con `Cannot find module '…/lib/projects.ts'`.

- [ ] **Step 3: Implementar tipos, datos y helpers**

`lib/projects.ts` (sin imports: `node --test` debe poder cargarlo):

```ts
export type Context = "personal" | "universitario";
export type Estado = "activo" | "archivado";
export type CampoBorrador = "periodo" | "estado" | "rol" | "conMasTiempo" | "arquitectura" | "aviso";

export interface Stat {
  value: string;
  label: string;
}
export interface ArchPart {
  nombre: string;
  descripcion: string;
}
export interface Decision {
  titulo: string;
  texto: string;
}
export interface ExpedienteData {
  problema: string;
  queHace: string[];
  rol: string;
  decisiones: Decision[];
  noHice: string[];
  evidencia: string[];
  resultado: string;
  conMasTiempo: string[];
}
export interface Media {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Project {
  slug: string;
  title: string;
  summary: string;
  context: Context;
  subtitulo?: string;
  periodo: string;
  estado: Estado;
  tags: string[];
  metric: Stat;
  repo: { url: string };
  demo?: { url: string; note?: string };
  cover?: Media;
  video?: { src: string; poster: string; label: string };
  galeria?: Media[];
  aviso?: string;
  stats: [Stat, Stat, Stat];
  arquitectura: ArchPart[];
  expediente: ExpedienteData;
  /** Campos cuyo texto es un borrador que el usuario aún debe confirmar. Debe quedar vacío para publicar. */
  borrador: CampoBorrador[];
}

export const projects: Project[] = [
  {
    slug: "medi-ia",
    title: "MEDI-IA",
    summary:
      "Asistente de diagnóstico diferencial que responde a partir de 14 libros médicos reales, con recuperación híbrida y un agente ReAct.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["Python", "Flask", "RAG", "FAISS", "BM25", "ReAct"],
    metric: { value: "97.1%", label: "Recall@1 · 40 consultas" },
    repo: { url: "https://github.com/Milan32555/medi-ia-medical-agent" },
    aviso:
      "No hay demo pública: depende de un corpus de 14 libros y de un token de HuggingFace. Proyecto educativo, no sustituye el criterio médico.",
    stats: [
      { value: "97.1%", label: "Recall@1 en 40 consultas anotadas" },
      { value: "185", label: "funciones de test" },
      { value: "14", label: "libros indexados (~136 000 fragmentos)" },
    ],
    arquitectura: [
      { nombre: "Guardrails", descripcion: "Filtra con reglas las consultas que no son médicas, antes de llegar al modelo." },
      { nombre: "BM25 + FAISS", descripcion: "Busca en los 14 libros por palabras y por significado, y fusiona los resultados (RRF)." },
      { nombre: "Reranker", descripcion: "Reordena los fragmentos con un cross-encoder multilingüe para quedarse con los más relevantes." },
      { nombre: "Agente ReAct", descripcion: "Un modelo (Qwen2.5-7B) razona con 4 herramientas y arma la respuesta." },
    ],
    expediente: {
      problema:
        "Un modelo de lenguaje solo, respondiendo preguntas clínicas, puede inventar. El reto era que cada respuesta parta de fuentes médicas reales y que se pueda medir qué tan bien se recupera la información.",
      queHace: [
        "Responde consultas clínicas apoyándose en 14 libros médicos, con el razonamiento en streaming.",
        "Un agente con 4 herramientas: síntomas, urgencia, fármacos y secciones del libro.",
        "Mapa corporal de 24 zonas, perfil clínico, voz y exportación a PDF.",
        "Panel de métricas y de evaluación (Recall@k, MRR).",
      ],
      rol: "Diseño y desarrollo completo: ingesta de los libros, recuperación, agente, API y frontend.",
      decisiones: [
        { titulo: "Recuperación híbrida", texto: "BM25 + FAISS fusionados con Reciprocal Rank Fusion, más un reranker cross-encoder multilingüe." },
        { titulo: "Un cambio con dato", texto: "pasar de MiniLM a multilingual-e5-base subió Recall@1 de 74.3% a 91.4%; ampliar de 4 a 14 libros lo llevó a 97.1%." },
        { titulo: "Guardrails antes del LLM", texto: "un filtro por regex separa las consultas médicas de las que no lo son." },
      ],
      noHice: ["No publiqué una demo: exige el corpus de libros y un token de HuggingFace."],
      evidencia: [
        "185 funciones de test (guardrails, herramientas, memoria, API, métricas, feedback, evaluación, pipeline).",
        "CI en GitHub Actions (Python 3.13) y despliegue con Docker + nginx.",
        "Evaluación con 40 consultas anotadas: Recall@3 100%, MRR 0.9857. Es un dataset pequeño: hay que leerlo con cautela.",
      ],
      resultado: "Un agente con respuestas en streaming, voz, mapa corporal de 24 zonas y panel de métricas.",
      conMasTiempo: ["Ampliar el dataset de evaluación y validarlo con criterio clínico externo."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura", "aviso"],
  },
  {
    slug: "animalvision",
    title: "AnimalVision",
    summary: "Clasificador web de imágenes de animales con transfer learning sobre MobileNetV2, desplegado en producción.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["MobileNetV2", "Flask", "Gunicorn", "Render"],
    metric: { value: "93.4%", label: "accuracy · 5 clases" },
    repo: { url: "https://github.com/Milan32555/AnimalVision-AI-Image-Classification-System" },
    demo: {
      url: "https://animal-cnn-classifier.onrender.com",
      note: "Plan gratuito de Render: la primera carga puede tardar cerca de 1 minuto mientras el servicio despierta.",
    },
    stats: [
      { value: "93.4%", label: "accuracy en test (5 clases)" },
      { value: "98.7%", label: "top-3 accuracy" },
      { value: "~0.8 s", label: "por imagen, latencia media" },
    ],
    arquitectura: [
      { nombre: "Interfaz Flask", descripcion: "La página donde subes la imagen y ves el resultado." },
      { nombre: "Inferencia", descripcion: "Carga el modelo entrenado y prepara la imagen para analizarla." },
      { nombre: "MobileNetV2", descripcion: "Red pre-entrenada con ImageNet, ajustada (transfer learning) a 5 animales." },
      { nombre: "Top-5", descripcion: "Devuelve las 5 predicciones más probables con su porcentaje." },
    ],
    expediente: {
      problema: "Llevar un modelo entrenado en un notebook a una aplicación que cualquiera pueda usar desde el navegador, con respuesta en tiempo real.",
      queHace: [
        "Sube una imagen y clasifica el animal (5 clases).",
        "Muestra las 5 predicciones más probables con su porcentaje.",
        "Responde en menos de un segundo por imagen (~0.8 s según el README).",
      ],
      rol: "Entrenamiento del modelo, API de inferencia, interfaz web y despliegue.",
      decisiones: [
        { titulo: "Transfer learning", texto: "sobre MobileNetV2 (ImageNet) en lugar de entrenar desde cero." },
        { titulo: "Arquitectura modular", texto: "Factory Pattern y separación de responsabilidades entre rutas, inferencia y configuración." },
        { titulo: "Gunicorn en Render", texto: "para servir en producción." },
      ],
      noHice: ["Solo reconoce 5 clases de animales: no es un clasificador general."],
      evidencia: [
        "Accuracy en test 93.4%, top-3 98.7%, latencia media ~0.8 s por imagen (cifras del README).",
        "Pipeline completo y reproducible: dataset → entrenamiento → API → UI.",
      ],
      resultado: "Demo en producción con las 5 predicciones más probables y sus porcentajes.",
      conMasTiempo: ["Ampliar las clases y publicar el análisis de errores por clase."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
  {
    slug: "library-system",
    title: "Sistema de librería",
    summary: "Gestión de catálogo con Clean Architecture: CRUD, búsqueda, filtro por género y panel de administración.",
    context: "universitario",
    periodo: "2026",
    estado: "activo",
    tags: ["Vue 3", "Node.js", "Express", "Neon", "Vercel"],
    metric: { value: "1 archivo", label: "reescrito al cambiar de base de datos" },
    repo: { url: "https://github.com/Milan32555/Full-stack-library-management-system-with-Vue.js-frontend-and-Node.js-backend" },
    demo: { url: "https://full-stack-library-management-syste-eight.vercel.app" },
    stats: [
      { value: "1", label: "archivo reescrito al cambiar de base de datos" },
      { value: "2 en 1", label: "frontend y backend en un solo despliegue" },
      { value: "4", label: "capas: pantalla, lógica, repositorio y datos" },
    ],
    arquitectura: [
      { nombre: "Vue 3", descripcion: "Las pantallas: catálogo, búsqueda, filtro por género y panel de administración." },
      { nombre: "Casos de uso", descripcion: "Las reglas de la aplicación (crear, buscar, actualizar libros) sin saber qué base de datos hay detrás." },
      { nombre: "Repositorio", descripcion: "Traduce esas operaciones a consultas SQL. Es la pieza que se cambió al migrar de Supabase a Neon." },
      { nombre: "Neon", descripcion: "La base de datos Postgres en la nube donde quedan guardados los libros." },
    ],
    expediente: {
      problema:
        "Un CRUD de tutorial se rompe cuando cambian la base de datos o el hosting. El objetivo fue separar dominio, casos de uso e infraestructura para que esos cambios no toquen la lógica.",
      queHace: ["Catálogo con alta, edición y baja de libros.", "Búsqueda y filtro por género.", "Panel de administración con estadísticas."],
      rol: "Diseño de la arquitectura, backend, frontend y despliegue. Empezó como trabajo universitario; las mejoras posteriores son propias.",
      decisiones: [
        { titulo: "Repositorio intercambiable", texto: "los casos de uso dependen de una interfaz, no de la base de datos." },
        { titulo: "Supabase → Neon", texto: "el plan gratuito limita a 2 proyectos activos; migrar reescribió un solo archivo." },
        { titulo: "Railway → Vercel Services", texto: "venció la prueba gratuita; frontend y backend ahora viven en un mismo dominio y despliegue." },
      ],
      noHice: ["No usé un ORM: consulto Neon con su driver serverless directamente."],
      evidencia: [
        "La migración de base de datos no tocó casos de uso ni frontend.",
        "Producción verificada: /api/books devuelve el catálogo y /health responde.",
      ],
      resultado: "Una demo en vivo con catálogo, búsqueda, filtro por género y panel de administración.",
      conMasTiempo: ["Añadir tests de los casos de uso y autenticación para el panel."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
  {
    slug: "safe-transfer-ai",
    title: "SafeTransfer AI",
    summary: "Simulador de riesgo de fraude en transferencias: un motor de reglas que explica por qué llegó a cada resultado.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["Kotlin", "Jetpack Compose", "JUnit"],
    metric: { value: "8 tests", label: "unitarios del motor de riesgo" },
    repo: { url: "https://github.com/Milan32555/safe-transfer-ai" },
    aviso: "App Android nativa: no hay demo web. Pese al nombre, es un motor de reglas determinístico, no machine learning.",
    stats: [
      { value: "8", label: "tests unitarios del motor" },
      { value: "7", label: "señales de riesgo ponderadas" },
      { value: "0–100", label: "puntaje con razones legibles" },
    ],
    arquitectura: [
      { nombre: "Pantalla Compose", descripcion: "El formulario de la transferencia y las señales de alerta que marcas." },
      { nombre: "FraudEngine", descripcion: "Aplica reglas ponderadas. Es lógica pura, separada de la interfaz y probada con 8 tests." },
      { nombre: "Puntaje 0–100", descripcion: "Un nivel Bajo, Medio o Alto, con las razones y recomendaciones que lo produjeron." },
    ],
    expediente: {
      problema: "Muchos sistemas antifraude son cajas negras. Quise un motor cuyo puntaje se pueda explicar regla por regla.",
      queHace: [
        "Formulario con monto, país destino y canal, más las señales de alerta.",
        "Calcula un puntaje de riesgo de 0 a 100 (Bajo, Medio o Alto).",
        "Explica qué reglas sumaron y qué recomendaciones aplicar.",
      ],
      rol: "Diseño del motor de reglas, la interfaz en Compose y los tests.",
      decisiones: [
        { titulo: "Reglas ponderadas y determinísticas", texto: "score de 0 a 100 con niveles Bajo (<40), Medio (40–69) y Alto (≥70)." },
        { titulo: "Lógica pura separada de la UI", texto: "FraudEngine no depende de Compose, así se prueba sin emulador." },
        { titulo: "Explicación incluida", texto: "cada resultado devuelve las razones y las recomendaciones que lo produjeron." },
      ],
      noHice: ["No es un modelo de machine learning, aunque el nombre lo sugiera. Prefiero un proyecto bien descrito."],
      evidencia: ["8 tests unitarios de FraudEngine (JUnit)."],
      resultado: "Una app Android nativa que evalúa una transferencia y justifica el riesgo.",
      conMasTiempo: ["Calibrar los pesos con datos reales y añadir reglas por historial del usuario."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Número de expediente derivado del orden: "001", "002"… */
export function projectNumber(slug: string): string {
  const i = projects.findIndex((p) => p.slug === slug);
  return String(i + 1).padStart(3, "0");
}

export function isLive(p: Project): boolean {
  return p.demo !== undefined;
}

/** Anterior y siguiente, circulares (el siguiente del último es el primero). */
export function getAdjacent(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export function getCounts(): { total: number; live: number; codeOnly: number } {
  const live = projects.filter(isLive).length;
  return { total: projects.length, live, codeOnly: projects.length - live };
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Run: `npm test`
Expected: `# pass 21`, `# fail 0`, `# skipped 1` y `# tests 22` (los `describe` cuentan como suites, no como tests; la puerta `RELEASE` se salta sin la variable).

- [ ] **Step 5: Comprobar tipos**

Run: `npx tsc --noEmit`
Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add lib/projects.ts lib/projects.test.ts
git commit -m "feat: datos tipados de los 4 proyectos con helpers y puerta de publicacion"
```

---

### Task 5: Portada y botones de acción

**Files:**
- Create: `components/proyectos/ProjectCover.module.css`
- Create: `components/proyectos/ProjectCover.tsx`
- Create: `components/proyectos/ProjectActions.tsx`

- [ ] **Step 1: Estilos de la portada**

`components/proyectos/ProjectCover.module.css`:

```css
.frame {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.3s;
}
.row { aspect-ratio: 16 / 10; }
.hero { aspect-ratio: 21 / 9; border-radius: 16px; }

.frame svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Las capas se separan apenas en el hover de la fila (ver ProjectList.module.css) */
.layer {
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .layer, .frame { transition: none; }
}
```

- [ ] **Step 2: Componente de portada**

`components/proyectos/ProjectCover.tsx`:

```tsx
import Image from "next/image";
import { coverLayers, hueFor } from "@/lib/cover";
import type { Project } from "@/lib/projects";
import styles from "./ProjectCover.module.css";

interface Props {
  project: Project;
  variant?: "row" | "hero";
}

const SIZES = { row: { w: 480, h: 300 }, hero: { w: 840, h: 360 } } as const;

/** Captura real si existe; si no, una portada generada determinista (nunca una imagen rota). */
export default function ProjectCover({ project, variant = "row" }: Props) {
  const frame = `${styles.frame} ${styles[variant]}`;

  if (project.cover) {
    return (
      <div className={frame}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={variant === "row" ? "(max-width: 700px) 100vw, 230px" : "(max-width: 1100px) 100vw, 1000px"}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  const { w, h } = SIZES[variant];
  const hue = hueFor(project.slug);
  const layers = coverLayers(hue * 7, w, h, hue);
  const gradId = `pc-g-${project.slug}-${variant}`;
  const dotsId = `pc-d-${project.slug}-${variant}`;

  return (
    <div className={frame}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Portada de ${project.title}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`hsl(${hue} 55% 14%)`} />
            <stop offset="1" stopColor={`hsl(${hue} 60% 30%)`} />
          </linearGradient>
          <pattern id={dotsId} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1" fill={`hsl(${hue} 90% 75%)`} opacity="0.5" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${gradId})`} />
        {layers.map((l, i) => (
          <g key={i} className={`${styles.layer} pj-l${i}`}>
            <path d={l.d} fill={l.fill} />
            {l.dots && <path d={l.d} fill={`url(#${dotsId})`} opacity="0.28" />}
          </g>
        ))}
        <text
          x={variant === "hero" ? 36 : 22}
          y={variant === "hero" ? 60 : 44}
          fill="#f0f0f2"
          opacity="0.92"
          fontSize={variant === "hero" ? 34 : 24}
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          {project.title}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Botones de acción**

`components/proyectos/ProjectActions.tsx`:

```tsx
import type { Project } from "@/lib/projects";

interface Props {
  project: Project;
  variant?: "row" | "detail";
  className?: string;
}

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

/**
 * "Ver demo" solo existe si el proyecto tiene demo (un botón que no aplica se omite, no se deshabilita).
 * La acción primaria es la demo; si no hay, es el código.
 */
export default function ProjectActions({ project, variant = "row", className }: Props) {
  const demoLabel = variant === "detail" ? "Ver demo en vivo" : "Ver demo";
  const newTab = "(se abre en una pestaña nueva)";

  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
      {project.demo && (
        <a
          className="btn-primary"
          href={project.demo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${demoLabel} de ${project.title} ${newTab}`}
        >
          {demoLabel} <ExternalIcon />
        </a>
      )}
      <a
        className={project.demo ? "btn-ghost" : "btn-primary"}
        href={project.repo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver código de ${project.title} en GitHub ${newTab}`}
      >
        <GitHubIcon /> Ver código
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Comprobar tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores (avisos preexistentes de otros archivos son aceptables; ninguno debe apuntar a `components/proyectos/`).

- [ ] **Step 5: Commit**

```bash
git add components/proyectos/ProjectCover.tsx components/proyectos/ProjectCover.module.css components/proyectos/ProjectActions.tsx
git commit -m "feat: portada generada y botones de accion de proyectos"
```

---

### Task 6: Lista y página `/proyectos`

**Files:**
- Create: `components/proyectos/ProjectList.module.css`
- Create: `components/proyectos/ProjectList.tsx`
- Create: `app/proyectos/page.module.css`
- Create: `app/proyectos/page.tsx`

- [ ] **Step 1: Estilos de la lista (hover discreto solo CSS)**

`components/proyectos/ProjectList.module.css`:

```css
.rows { margin-top: 3.5rem; list-style: none; padding: 0; }

.row {
  position: relative;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 0 30px;
  padding: 34px 12px;
  border-top: 1px solid var(--line);
}
.row:last-child { border-bottom: 1px solid var(--line); }

/* Pestaña de carpeta apoyada sobre la línea divisoria (decorativa) */
.tab {
  position: absolute;
  left: 274px;
  top: -25px;
  height: 25px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--accent2);
  background: var(--bg);
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 9px 9px 0 0;
}
.tab i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

/* Línea de acento que aparece en el hover */
.row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 34px;
  bottom: 34px;
  width: 2px;
  border-radius: 2px;
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.body { min-width: 0; }

.title {
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(1.4rem, 2.6vw, 1.85rem);
  line-height: 1.2;
  margin: 0 0 6px;
}
/* Enlace estirado: toda la fila navega al detalle */
.title a::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}
.title a:focus-visible { outline: none; }
.title a:focus-visible::after {
  outline: 2px solid var(--accent2);
  outline-offset: -2px;
  border-radius: 12px;
}
.arrow {
  display: inline-block;
  margin-left: 8px;
  color: var(--accent2);
  transition: transform 0.25s;
}

.summary { color: var(--soft); max-width: 60ch; font-size: 0.95rem; line-height: 1.6; }

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin: 12px 0 4px;
  font-size: 0.84rem;
  color: var(--muted);
}
.metric { display: inline-flex; align-items: baseline; gap: 8px; color: var(--text); }
.metric b { font-family: var(--mono); font-weight: 500; font-size: 1.05rem; color: var(--live); }
.metric span { color: var(--muted); font-size: 0.82rem; }

.status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.status i { width: 7px; height: 7px; border-radius: 50%; }
.live { color: var(--live); }
.live i { background: var(--live); }
.code { color: var(--muted); }
.code i { border: 1.5px solid currentColor; }

.ctx {
  border: 1px solid var(--line-strong);
  border-radius: 99px;
  padding: 2px 10px;
  font-size: 0.76rem;
  color: var(--soft);
}

.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

/* Los botones quedan por encima del enlace estirado */
.actions { position: relative; z-index: 2; margin-top: 18px; }

/* Hover discreto: solo en dispositivos con mouse. Sin JS. */
@media (hover: hover) and (pointer: fine) {
  .row { transition: opacity 0.35s; }
  .rows:has(.row:hover) .row:not(:hover) { opacity: 0.6; }
  .row:hover::before { transform: scaleY(1); }
  .row:hover .arrow { transform: translateX(5px); }
  .row:hover .cover > div { border-color: var(--line-strong); }
  .row:hover .cover :global(.pj-l0) { transform: translateX(-5px); }
  .row:hover .cover :global(.pj-l1) { transform: translateX(-12px); }
  .row:hover .cover :global(.pj-l2) { transform: translateX(-20px); }
}

@media (prefers-reduced-motion: reduce) {
  .row, .row::before, .arrow { transition: none; }
}

@media (max-width: 700px) {
  .row { grid-template-columns: 1fr; gap: 16px; padding: 30px 0 28px; }
  .tab { left: 0; }
}
```

- [ ] **Step 2: Componente de la lista**

`components/proyectos/ProjectList.tsx`:

```tsx
import Link from "next/link";
import { isLive, projectNumber, projects } from "@/lib/projects";
import ProjectActions from "./ProjectActions";
import ProjectCover from "./ProjectCover";
import styles from "./ProjectList.module.css";

export default function ProjectList() {
  return (
    <ol className={styles.rows}>
      {projects.map((p) => {
        const live = isLive(p);
        return (
          <li key={p.slug} className={styles.row}>
            <span className={styles.tab} aria-hidden="true">
              <i />
              EXP-{projectNumber(p.slug)}
            </span>

            <div className={styles.cover}>
              <ProjectCover project={p} variant="row" />
            </div>

            <div className={styles.body}>
              <h2 className={styles.title}>
                <Link href={`/proyectos/${p.slug}`}>
                  {p.title}
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </h2>
              <p className={styles.summary}>{p.summary}</p>

              <div className={styles.meta}>
                <span className={styles.metric}>
                  <b>{p.metric.value}</b>
                  <span>{p.metric.label}</span>
                </span>
                <span className={`${styles.status} ${live ? styles.live : styles.code}`}>
                  <i aria-hidden="true" />
                  {live ? "Demo en vivo" : "Solo código"}
                </span>
                <span className={styles.ctx}>{p.context === "universitario" ? "Proyecto universitario" : "Proyecto personal"}</span>
              </div>

              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

              <ProjectActions project={p} variant="row" className={styles.actions} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Estilos de la página**

`app/proyectos/page.module.css`:

```css
.lead { color: var(--soft); max-width: 56ch; margin-top: 1rem; line-height: 1.7; }

.counts {
  margin-top: 1.1rem;
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.counts b { color: var(--text); font-weight: 500; }
.counts .live { color: var(--live); }

.archive {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 1.75rem;
  min-height: 44px;
  color: var(--soft);
}
.archive:hover { color: var(--text); }

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: La página**

`app/proyectos/page.tsx`:

```tsx
import type { Metadata } from "next";
import ProjectList from "@/components/proyectos/ProjectList";
import { getCounts } from "@/lib/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Cuatro proyectos elegidos por lo que enseñan: MEDI-IA, AnimalVision, un sistema de librería con Clean Architecture y SafeTransfer AI. Cada uno con su problema, decisiones y evidencia.",
  alternates: { canonical: "/proyectos" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProyectosPage() {
  const { total, live, codeOnly } = getCounts();

  return (
    <main id="main-content">
      <div className="section">
        <p className="section-label">Proyectos</p>
        <h1 className="section-title">Lo que he construido</h1>
        <p className={styles.lead}>
          Cuatro proyectos, elegidos por lo que enseñan y no por cantidad. Cada uno tiene su expediente con el problema, mis decisiones y la evidencia.
        </p>
        <p className={styles.counts}>
          <b>{pad(total)}</b> expedientes · <span className={styles.live}><b>{pad(live)}</b> con demo en vivo</span> · <b>{pad(codeOnly)}</b> solo código
        </p>

        <ProjectList />

        <a className={styles.archive} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer">
          Ver todo en GitHub <span aria-hidden="true">↗</span>
          <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Comprobar tipos, lint y build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: sin errores; en la tabla de rutas de `next build` aparece `○ /proyectos` (estática).

- [ ] **Step 6: Commit**

```bash
git add components/proyectos/ProjectList.tsx components/proyectos/ProjectList.module.css app/proyectos/page.tsx app/proyectos/page.module.css
git commit -m "feat: pagina /proyectos con lista sutil y hover discreto"
```

---

### Task 7: Cifras destacadas y arquitectura

**Files:**
- Create: `components/proyectos/StatsRow.module.css`, `components/proyectos/StatsRow.tsx`
- Create: `components/proyectos/ArchitectureFlow.module.css`, `components/proyectos/ArchitectureFlow.tsx`

- [ ] **Step 1: Cifras — estilos**

`components/proyectos/StatsRow.module.css`:

```css
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  margin-top: 2.1rem;
  list-style: none;
  padding: 0;
}
.stat {
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 9%, var(--surface)), var(--surface));
}
.value {
  display: block;
  font-family: var(--font-dm-serif), serif;
  font-size: 2.1rem;
  line-height: 1.05;
  background: linear-gradient(180deg, var(--text), var(--accent2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.label { display: block; margin-top: 8px; color: var(--muted); font-size: 0.85rem; line-height: 1.35; }
```

- [ ] **Step 2: Cifras — componente**

`components/proyectos/StatsRow.tsx`:

```tsx
import type { Stat } from "@/lib/projects";
import styles from "./StatsRow.module.css";

export default function StatsRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <ul className={styles.stats} aria-label="Cifras destacadas">
      {stats.map((s) => (
        <li key={s.label} className={styles.stat}>
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Arquitectura — estilos**

`components/proyectos/ArchitectureFlow.module.css`:

```css
.arch { margin-top: 4rem; }
.eyebrow {
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}
.title {
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(1.5rem, 2.8vw, 2rem);
  margin: 8px 0 6px;
}
.intro { color: var(--soft); max-width: 60ch; margin-bottom: 1.6rem; }

.layers {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: 30px;
  list-style: none;
  padding: 0;
}
.layer {
  position: relative;
  padding: 18px 18px 20px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: var(--surface);
  /* borde apilado: sugiere capas sin animación */
  box-shadow: 6px 6px 0 -1px var(--bg2), 6px 6px 0 0 var(--line);
}
.layer:not(:last-child)::after {
  content: "";
  position: absolute;
  right: -24px;
  top: 34px;
  width: 18px;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), var(--accent2));
}
.layer:not(:last-child)::before {
  content: "";
  position: absolute;
  right: -25px;
  top: 31px;
  border-left: 5px solid var(--accent2);
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
}
.k { font-family: var(--mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.14em; color: var(--accent2); }
.name { font-family: var(--font-dm-serif), serif; font-weight: 400; font-size: 1.2rem; margin: 6px 0; }
.desc { color: var(--soft); font-size: 0.88rem; line-height: 1.5; }

@media (max-width: 900px) {
  .layers { grid-template-columns: 1fr; gap: 26px; }
  .layer:not(:last-child)::after {
    right: auto; left: 30px; top: auto; bottom: -22px; width: 1px; height: 16px;
    background: linear-gradient(180deg, var(--line-strong), var(--accent2));
  }
  .layer:not(:last-child)::before {
    right: auto; left: 27px; top: auto; bottom: -24px;
    border-left: 3px solid transparent; border-right: 3px solid transparent;
    border-top: 5px solid var(--accent2); border-bottom: 0;
  }
}
```

- [ ] **Step 4: Arquitectura — componente**

`components/proyectos/ArchitectureFlow.tsx`:

```tsx
import type { CSSProperties } from "react";
import type { ArchPart } from "@/lib/projects";
import styles from "./ArchitectureFlow.module.css";

export default function ArchitectureFlow({ parts }: { parts: readonly ArchPart[] }) {
  return (
    <section className={styles.arch} aria-labelledby="arquitectura-titulo">
      <p className={styles.eyebrow}>Arquitectura</p>
      <h2 id="arquitectura-titulo" className={styles.title}>De la pantalla a los datos</h2>
      <p className={styles.intro}>Las partes del sistema, en el orden en que viaja la información.</p>
      <ol className={styles.layers} style={{ "--n": parts.length } as CSSProperties}>
        {parts.map((p, i) => (
          <li key={p.nombre} className={styles.layer}>
            <span className={styles.k}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={styles.name}>{p.nombre}</h3>
            <p className={styles.desc}>{p.descripcion}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: Comprobar y commitear**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

```bash
git add components/proyectos/StatsRow.tsx components/proyectos/StatsRow.module.css components/proyectos/ArchitectureFlow.tsx components/proyectos/ArchitectureFlow.module.css
git commit -m "feat: fila de cifras y bloque De la pantalla a los datos"
```

---

### Task 8: Componente Expediente (client)

**Files:**
- Create: `components/proyectos/Expediente.module.css`
- Create: `components/proyectos/Expediente.tsx`

- [ ] **Step 1: Estilos**

`components/proyectos/Expediente.module.css`:

```css
.stack {
  display: flex;
  flex-direction: column;
  margin-top: 4.5rem;
  padding-top: 30px; /* espacio para la pestaña de la primera carpeta */
}

.folder {
  --c: color-mix(in srgb, var(--accent) 14%, var(--surface));
  position: relative;
  z-index: calc(var(--i) + 1);
  margin-top: -14px;
  background: var(--c);
  border-radius: 26px 26px 0 0;
  border-top: 1px solid var(--line-strong);
  box-shadow: 0 -14px 34px rgba(0, 0, 0, 0.32);
}
.folder:first-child { margin-top: 0; }
.folder:nth-child(1) { --c: color-mix(in srgb, var(--accent) 16%, var(--surface)); }
.folder:nth-child(2) { --c: color-mix(in srgb, var(--accent) 12%, var(--surface)); }
.folder:nth-child(3) { --c: color-mix(in srgb, var(--accent) 9%, var(--surface)); }
.folder:nth-child(4) { --c: color-mix(in srgb, var(--accent) 6%, var(--surface)); }
.folder:nth-child(5) { --c: color-mix(in srgb, var(--accent) 3%, var(--surface)); }

.chip {
  position: absolute;
  top: -30px;
  left: calc(24px + var(--i) * 150px);
  height: 46px;
  min-height: 44px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c);
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1px solid var(--line-strong);
  border-bottom: 0;
  border-radius: 16px 16px 0 0;
}
.chip:focus-visible { outline: 2px solid var(--accent2); outline-offset: 2px; }
.folder[data-open="true"] .chip { box-shadow: inset 0 2px 0 var(--accent); }
.num { font-family: var(--mono); font-size: 0.8rem; color: var(--accent2); }

/* Franja: la parte visible de una carpeta cerrada; también dispara el hover por intención */
.strip { height: 58px; }

.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.folder[data-open="true"] .panel { grid-template-rows: 1fr; }
.panel > div { overflow: hidden; }
.inner { padding: 0 28px 46px; max-width: 78ch; }

/* Sin JavaScript: todo el contenido queda abierto y legible */
@media (scripting: none) {
  .panel { grid-template-rows: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; }
}

/* Mobile: las pestañas escalonadas pasan a cabeceras de acordeón a ancho completo */
@media (max-width: 700px) {
  .chip {
    position: static;
    width: 100%;
    height: 60px;
    border: 0;
    background: transparent;
    border-radius: 26px 26px 0 0;
    padding: 0 22px;
  }
  .strip { display: none; }
  .inner { padding: 0 22px 36px; }
  .stack { margin-top: 2.5rem; padding-top: 0; }
}
```

- [ ] **Step 2: Componente**

`components/proyectos/Expediente.tsx`:

```tsx
"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { HOVER_INTENT_MS, isRealMouseMove } from "@/lib/hoverIntent";
import styles from "./Expediente.module.css";

export interface Carpeta {
  id: string;
  titulo: string;
  contenido: ReactNode;
}

const noopSubscribe = () => () => {};

/**
 * Carpetas apiladas que funcionan como acordeón. Siempre hay una abierta.
 * - Clic / toque / Enter / Espacio: abre la carpeta.
 * - Hover (solo mouse en dispositivos con hover): abre con retraso de intención y solo ante
 *   movimiento real, para no provocar una cascada cuando el layout se desplaza.
 * Todo el contenido está siempre en el HTML; las carpetas cerradas se marcan `inert` solo tras hidratar.
 */
export default function Expediente({ carpetas, label }: { carpetas: Carpeta[]; label: string }) {
  const [open, setOpen] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // false en el servidor y en la hidratación; true después. Evita `inert` en el HTML inicial (sin JS todo se lee).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const scheduleOpen = (i: number, e: PointerEvent) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!isRealMouseMove(e.nativeEvent)) return;
    if (open === i || timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      setOpen(i);
    }, HOVER_INTENT_MS);
  };

  return (
    <div className={styles.stack} role="group" aria-label={label}>
      {carpetas.map((c, i) => {
        const isOpen = open === i;
        return (
          <section key={c.id} className={styles.folder} style={{ "--i": i } as CSSProperties} data-open={isOpen}>
            <button
              type="button"
              id={`${c.id}-tab`}
              className={styles.chip}
              aria-expanded={isOpen}
              aria-controls={`${c.id}-panel`}
              onClick={() => {
                cancel();
                setOpen(i);
              }}
              onPointerMove={(e) => scheduleOpen(i, e)}
              onPointerLeave={cancel}
            >
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span>{c.titulo}</span>
            </button>

            <div className={styles.strip} aria-hidden="true" onPointerMove={(e) => scheduleOpen(i, e)} onPointerLeave={cancel} />

            <div id={`${c.id}-panel`} role="region" aria-labelledby={`${c.id}-tab`} className={styles.panel} inert={hydrated && !isOpen}>
              <div>
                <div className={styles.inner}>{c.contenido}</div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Comprobar tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores. (Si el linter marca `react-hooks/refs` sobre `timer.current` dentro de handlers, es un falso positivo: los handlers no son render; no lo silencies con `eslint-disable`, revisa que el acceso a `timer.current` esté solo dentro de funciones de evento.)

- [ ] **Step 4: Commit**

```bash
git add components/proyectos/Expediente.tsx components/proyectos/Expediente.module.css
git commit -m "feat: componente Expediente con hover por intencion y acordeon accesible"
```

---

### Task 9: Medios y paginador

**Files:**
- Create: `components/proyectos/ProjectMedia.module.css`, `components/proyectos/ProjectMedia.tsx`
- Create: `components/proyectos/ProjectPager.module.css`, `components/proyectos/ProjectPager.tsx`

- [ ] **Step 1: Medios — estilos**

`components/proyectos/ProjectMedia.module.css`:

```css
.media { margin: 1.9rem 0 0; }
.video {
  display: block;
  width: 100%;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.caption { margin-top: 0.6rem; color: var(--muted); font-size: 0.8rem; }

.gallery {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.shot { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.shot img { display: block; width: 100%; height: auto; }
```

- [ ] **Step 2: Medios — componente**

`components/proyectos/ProjectMedia.tsx`:

```tsx
import Image from "next/image";
import type { Project } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import styles from "./ProjectMedia.module.css";

/**
 * Video de recorrido si existe (sin autoplay: el usuario decide, así cumple prefers-reduced-motion);
 * si no, la portada. Después, la galería de capturas si hay.
 */
export default function ProjectMedia({ project }: { project: Project }) {
  return (
    <div className={styles.media}>
      {project.video ? (
        <figure style={{ margin: 0 }}>
          <video className={styles.video} controls muted playsInline preload="none" poster={project.video.poster} aria-label={project.video.label}>
            <source src={project.video.src} type="video/mp4" />
            Tu navegador no reproduce este video. <a href={project.video.src}>Descárgalo aquí</a>.
          </video>
          <figcaption className={styles.caption}>{project.video.label}</figcaption>
        </figure>
      ) : (
        <ProjectCover project={project} variant="hero" />
      )}

      {project.galeria && project.galeria.length > 0 && (
        <ul className={styles.gallery} aria-label="Capturas">
          {project.galeria.map((g) => (
            <li key={g.src} className={styles.shot}>
              <Image src={g.src} alt={g.alt} width={g.width} height={g.height} sizes="(max-width: 700px) 100vw, 320px" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Paginador — estilos**

`components/proyectos/ProjectPager.module.css`:

```css
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 3rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--line);
}
.link { display: block; padding: 14px 4px; min-height: 44px; }
.next { text-align: right; }
.hint {
  display: block;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.name { font-family: var(--font-dm-serif), serif; font-size: 1.25rem; transition: color 0.2s; }
.link:hover .name { color: var(--accent2); }
.link:focus-visible { outline: 2px solid var(--accent2); outline-offset: 2px; border-radius: 6px; }
```

- [ ] **Step 4: Paginador — componente**

`components/proyectos/ProjectPager.tsx`:

```tsx
import Link from "next/link";
import { getAdjacent } from "@/lib/projects";
import styles from "./ProjectPager.module.css";

export default function ProjectPager({ slug }: { slug: string }) {
  const { prev, next } = getAdjacent(slug);
  return (
    <nav className={styles.pager} aria-label="Otros proyectos">
      <Link className={styles.link} href={`/proyectos/${prev.slug}`}>
        <span className={styles.hint}><span aria-hidden="true">← </span>Anterior</span>
        <span className={styles.name}>{prev.title}</span>
      </Link>
      <Link className={`${styles.link} ${styles.next}`} href={`/proyectos/${next.slug}`}>
        <span className={styles.hint}>Siguiente<span aria-hidden="true"> →</span></span>
        <span className={styles.name}>{next.title}</span>
      </Link>
    </nav>
  );
}
```

- [ ] **Step 5: Comprobar y commitear**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

```bash
git add components/proyectos/ProjectMedia.tsx components/proyectos/ProjectMedia.module.css components/proyectos/ProjectPager.tsx components/proyectos/ProjectPager.module.css
git commit -m "feat: medios del proyecto (video o portada, galeria) y paginador circular"
```

---

### Task 10: Página de detalle `/proyectos/[slug]`

**Files:**
- Create: `app/proyectos/[slug]/page.module.css`
- Create: `app/proyectos/[slug]/page.tsx`

- [ ] **Step 1: Estilos**

`app/proyectos/[slug]/page.module.css`:

```css
.back { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--soft); font-size: 0.9rem; }
.back:hover { color: var(--text); }

.eyebrow {
  margin-top: 0.4rem;
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent2);
}
.lead { color: var(--soft); max-width: 60ch; margin: 1rem 0 1.4rem; line-height: 1.7; }

.note {
  display: block;
  margin-top: 1rem;
  padding: 12px 16px;
  max-width: 64ch;
  border-radius: 12px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  color: var(--soft);
  font-size: 0.88rem;
  line-height: 1.55;
}
.warn {
  border-color: color-mix(in srgb, #ffd28a 30%, transparent);
  background: color-mix(in srgb, #ffd28a 7%, var(--surface));
}

/* Contenido dentro de las carpetas del Expediente */
.text { color: var(--soft); margin-bottom: 0.75rem; line-height: 1.7; }
.list { color: var(--soft); padding-left: 1.2rem; display: grid; gap: 10px; line-height: 1.6; }
.list b { color: var(--text); font-weight: 600; }
.sub {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--mono);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent2);
}
.draft {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 7px;
  border: 1px dashed var(--muted);
  border-radius: 6px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  vertical-align: 1px;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px 28px;
  margin-top: 2.75rem;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--surface)), var(--surface));
}
.cta h2 { font-family: var(--font-dm-serif), serif; font-weight: 400; font-size: 1.5rem; }
.cta p { color: var(--soft); margin-top: 4px; }

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2: Página**

`app/proyectos/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchitectureFlow from "@/components/proyectos/ArchitectureFlow";
import Expediente, { type Carpeta } from "@/components/proyectos/Expediente";
import ProjectActions from "@/components/proyectos/ProjectActions";
import ProjectMedia from "@/components/proyectos/ProjectMedia";
import ProjectPager from "@/components/proyectos/ProjectPager";
import StatsRow from "@/components/proyectos/StatsRow";
import { getProject, projectNumber, projects, type CampoBorrador } from "@/lib/projects";
import styles from "./page.module.css";

// Un slug que no está en `projects` responde 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: { title: `${p.title} — Misael`, description: p.summary, url: `/proyectos/${p.slug}`, type: "article" },
  };
}

export default async function ProyectoPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const e = p.expediente;
  const draft = (campo: CampoBorrador) => (p.borrador.includes(campo) ? <span className={styles.draft}>borrador</span> : null);

  const carpetas: Carpeta[] = [
    {
      id: "problema",
      titulo: "Problema",
      contenido: (
        <>
          <p className={styles.text}>{e.problema}</p>
          <h3 className={styles.sub}>Qué hace</h3>
          <ul className={styles.list}>{e.queHace.map((x) => <li key={x}>{x}</li>)}</ul>
        </>
      ),
    },
    {
      id: "rol",
      titulo: "Mi rol",
      contenido: <p className={styles.text}>{draft("rol")}{e.rol}</p>,
    },
    {
      id: "decisiones",
      titulo: "Decisiones",
      contenido: (
        <>
          <ul className={styles.list}>
            {e.decisiones.map((d) => (
              <li key={d.titulo}><b>{d.titulo}:</b> {d.texto}</li>
            ))}
          </ul>
          <h3 className={styles.sub}>Lo que decidí no hacer</h3>
          <ul className={styles.list}>{e.noHice.map((x) => <li key={x}>{x}</li>)}</ul>
        </>
      ),
    },
    {
      id: "evidencia",
      titulo: "Evidencia",
      contenido: <ul className={styles.list}>{e.evidencia.map((x) => <li key={x}>{x}</li>)}</ul>,
    },
    {
      id: "resultado",
      titulo: "Resultado",
      contenido: (
        <>
          <p className={styles.text}>{e.resultado}</p>
          <h3 className={styles.sub}>Con más tiempo haría…</h3>
          <ul className={styles.list}>
            {e.conMasTiempo.map((x, i) => (
              <li key={x}>{i === 0 && draft("conMasTiempo")}{x}</li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  return (
    <main id="main-content">
      <div className="section">
        <Link className={styles.back} href="/proyectos">
          <span aria-hidden="true">←</span> Proyectos
        </Link>

        <p className={styles.eyebrow}>
          Expediente {projectNumber(p.slug)} · {p.context === "universitario" ? "Proyecto universitario" : "Proyecto personal"} · {p.periodo} ·{" "}
          {p.estado === "activo" ? "Activo" : "Archivado"}
        </p>
        <h1 className="section-title">{p.title}</h1>
        <p className={styles.lead}>{p.summary}</p>

        <ProjectActions project={p} variant="detail" />

        {p.demo?.note && <p className={`${styles.note} ${styles.warn}`} role="note">{p.demo.note}</p>}
        {p.aviso && <p className={styles.note} role="note">{p.aviso}</p>}

        <ProjectMedia project={p} />
        <StatsRow stats={p.stats} />
        <ArchitectureFlow parts={p.arquitectura} />
        <h2 className={styles.srOnly}>Expediente de {p.title}</h2>
        <Expediente carpetas={carpetas} label={`Expediente de ${p.title}`} />
        <ProjectPager slug={p.slug} />

        <aside className={styles.cta} aria-label="Contacto">
          <div>
            <h2>¿Tienes un problema parecido?</h2>
            <p>Cuéntame qué necesitas y vemos si puedo ayudarte.</p>
          </div>
          <Link className="btn-primary" href="/#contact">Hablemos <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Comprobar tipos, lint y build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: sin errores; la tabla de rutas muestra `● /proyectos/[slug]` con las 4 rutas prerenderizadas (`/proyectos/medi-ia`, `/proyectos/animalvision`, `/proyectos/library-system`, `/proyectos/safe-transfer-ai`).

- [ ] **Step 4: Commit**

```bash
git add "app/proyectos/[slug]/page.tsx" "app/proyectos/[slug]/page.module.css"
git commit -m "feat: pagina de detalle de proyecto con cifras, arquitectura y Expediente"
```

---

### Task 11: Integración con el sitio actual

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `components/Navbar.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Sitemap**

Reemplaza todo `app/sitemap.ts` por:

```ts
import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const siteUrl = "https://portfolio-milan-omega.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/proyectos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${siteUrl}/proyectos/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
```

- [ ] **Step 2: Que los enlaces de la navbar funcionen fuera del home**

En `components/Navbar.tsx`, junto al import de React (línea 3) añade:

```tsx
import Link from "next/link";
```

y reemplaza el bloque de enlaces

```tsx
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} style={linkStyle(id)}>
            {id === "projects" ? "Proyectos" : id === "about" ? "Sobre mí" : "Contacto"}
          </a>
        ))}
```

por

```tsx
        {SECTIONS.map((id) => (
          <Link key={id} href={`/#${id}`} style={linkStyle(id)}>
            {id === "projects" ? "Proyectos" : id === "about" ? "Sobre mí" : "Contacto"}
          </Link>
        ))}
```

(Con `#projects` a secas, desde `/proyectos/…` el enlace no llevaba a ninguna parte. `/#projects` funciona igual en el home y navega al home desde cualquier otra ruta; `Link` evita además la regla de lint `no-html-link-for-pages`.)

- [ ] **Step 3: Enlace a `/proyectos` desde el home**

En `app/page.tsx`, junto a los otros imports (línea 3-5) añade:

```tsx
import Link from "next/link";
```

y en `ProjectsSection`, reemplaza el final del componente:

```tsx
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT
```

por

```tsx
          ))}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/proyectos" className="btn-ghost">
            Ver los proyectos con detalle <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT
```

(El texto completo del comentario `// ─── ABOUT ───…` no cambia; solo ancla el reemplazo.)

- [ ] **Step 4: Comprobar y commitear**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: sin errores.

```bash
git add app/sitemap.ts components/Navbar.tsx app/page.tsx
git commit -m "feat: sitemap, enlaces de navbar fuera del home y acceso a /proyectos"
```

---

### Task 12: Verificación visual e interactiva

**Files:**
- Create: `.superpowers/verify-proyectos.py` (carpeta ignorada por git; no se commitea)

- [ ] **Step 1: Guardar el script**

`.superpowers/verify-proyectos.py`:

```python
"""Verifica /proyectos contra un servidor de producción local (npm start -p 3100)."""
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")  # la consola de Windows (cp1252) no imprime "→"
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
SLUGS = ["medi-ia", "animalvision", "library-system", "safe-transfer-ai"]
TITLES = {"medi-ia": "MEDI-IA", "animalvision": "AnimalVision", "library-system": "Sistema de librería", "safe-transfer-ai": "SafeTransfer AI"}
SHOTS = Path(".superpowers/shots")
SHOTS.mkdir(parents=True, exist_ok=True)
fails: list[str] = []


def check(cond: bool, msg: str) -> None:
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)


def seconds(v: str) -> float:
    """Convierte "0.45s", "0.01ms" o "1e-05s" (así lo serializa Chrome) a segundos."""
    return float(v[:-2]) / 1000 if v.endswith("ms") else float(v[:-1])


def opens(pg) -> str:
    return "".join("1" if v == "true" else "0" for v in pg.eval_on_selector_all("main section[data-open]", "els => els.map(e => e.dataset.open)"))


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    errors: list[str] = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    # ---------- lista ----------
    pg.goto(BASE + "/proyectos")
    pg.wait_for_timeout(7000)  # el Loader del sitio tarda unos segundos en irse
    check(pg.locator("main h1").inner_text().strip() == "Lo que he construido", "lista: h1")
    rows = pg.locator("main ol > li")
    check(rows.count() == 4, "lista: 4 filas")
    check("04" in pg.locator("main").inner_text() and "02 con demo en vivo" in pg.locator("main").inner_text().lower(), "lista: contadores 04 / 02 con demo en vivo")
    check(rows.nth(0).get_by_role("link", name=re.compile("Ver demo")).count() == 0, "lista: MEDI-IA no tiene botón de demo")
    check(rows.nth(1).get_by_role("link", name=re.compile("Ver demo")).count() == 1, "lista: AnimalVision sí tiene demo")
    rows.nth(1).scroll_into_view_if_needed()
    pg.wait_for_timeout(300)
    box = rows.nth(1).bounding_box()
    pg.mouse.move(box["x"] + 300, box["y"] + 60)
    pg.mouse.move(box["x"] + 340, box["y"] + 70, steps=6)
    pg.wait_for_timeout(700)
    ops = pg.eval_on_selector_all("main ol > li", "els => els.map(e => getComputedStyle(e).opacity)")
    check(ops == ["0.6", "1", "0.6", "0.6"], f"lista: hover atenúa las demás filas ({ops})")
    rows.nth(1).locator("h2 a").click()
    pg.wait_for_url(re.compile(r"/proyectos/animalvision$"))
    check(True, "lista: clic en la fila navega al detalle")

    # ---------- detalles ----------
    for slug in SLUGS:
        r = pg.goto(f"{BASE}/proyectos/{slug}")
        pg.wait_for_timeout(7000)
        check(r is not None and r.status == 200, f"{slug}: 200")
        check(pg.locator("main h1").inner_text().strip() == TITLES[slug], f"{slug}: h1")
        check(pg.locator("main section[data-open]").count() == 5, f"{slug}: 5 carpetas")
        check(opens(pg) == "10000", f"{slug}: solo Problema abierta al cargar ({opens(pg)})")
        check(pg.locator("main ol li").count() >= 3, f"{slug}: arquitectura con 3+ partes")

    # ---------- hover del Expediente (MEDI-IA) ----------
    pg.goto(BASE + "/proyectos/medi-ia")
    pg.wait_for_timeout(7000)
    pg.evaluate("document.querySelector('main section[data-open]').parentElement.scrollIntoView({block: 'center'})")
    pg.wait_for_timeout(500)
    chip3 = pg.locator("main section[data-open] > button").nth(2).bounding_box()
    pg.mouse.move(chip3["x"] - 80, chip3["y"] - 30)
    pg.mouse.move(chip3["x"] + 40, chip3["y"] + 20, steps=10)
    pg.wait_for_timeout(900)
    check(opens(pg) == "00100", f"hover: abre la carpeta 03 ({opens(pg)})")
    pg.wait_for_timeout(1800)
    check(opens(pg) == "00100", f"hover: sin cascada tras quedarse quieto ({opens(pg)})")
    pg.locator("main section[data-open] > button").nth(2).click()
    pg.wait_for_timeout(500)
    check(opens(pg) == "00100", "clic sobre la abierta no la cierra")
    pg.locator("main section[data-open] > button").nth(4).focus()
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(600)
    check(opens(pg) == "00001", "teclado: Enter abre la carpeta 05")
    closed_inert = pg.eval_on_selector_all("main section[data-open='false'] [role=region]", "els => els.every(e => e.inert)")
    check(closed_inert, "carpetas cerradas son inert tras hidratar (no tabulables)")
    pg.screenshot(path=str(SHOTS / "detalle-1440.png"), full_page=True)

    # ---------- reduced motion ----------
    rm = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce").new_page()
    rm.goto(BASE + "/proyectos/medi-ia")
    rm.wait_for_timeout(7000)
    dur = rm.eval_on_selector("main [role=region]", "e => getComputedStyle(e).transitionDuration")
    check(seconds(dur) <= 0.001, f"prefers-reduced-motion: sin transición en las carpetas ({dur})")

    # ---------- 404 y tema claro ----------
    n_before = len(errors)
    r404 = pg.goto(BASE + "/proyectos/no-existe")
    check(r404 is not None and r404.status == 404, "slug inexistente → 404")
    pg.wait_for_timeout(500)
    del errors[n_before:]  # el navegador registra el 404 intencional como error de consola
    pg.goto(BASE + "/proyectos")
    pg.wait_for_timeout(7000)
    pg.evaluate("document.documentElement.setAttribute('data-theme','light')")
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(SHOTS / "lista-claro.png"), full_page=True)

    # ---------- capturas responsivas ----------
    for w, h in [(1440, 900), (900, 900), (390, 800)]:
        c = browser.new_context(viewport={"width": w, "height": h})
        q = c.new_page()
        q.goto(BASE + "/proyectos")
        q.wait_for_timeout(7000)
        q.screenshot(path=str(SHOTS / f"lista-{w}.png"), full_page=True)
        q.goto(BASE + "/proyectos/library-system")
        q.wait_for_timeout(7000)
        q.screenshot(path=str(SHOTS / f"detalle-library-{w}.png"), full_page=True)
        overflow = q.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        check(not overflow, f"{w}px: sin scroll horizontal")

    check(not errors, f"sin errores de consola ({errors[:2]})")
    browser.close()

print(f"\n{len(fails)} fallo(s)")
sys.exit(1 if fails else 0)
```

- [ ] **Step 2: Construir y servir**

Run (terminal A): `npm run build && npx next start -p 3100`
Expected: build sin errores y `Ready` en `http://localhost:3100`.

- [ ] **Step 3: Ejecutar la verificación**

Run (terminal B): `python .superpowers/verify-proyectos.py`
Expected: todas las líneas `OK`, `0 fallo(s)`, exit 0. Si algo falla, corrige el componente correspondiente (no el script) y repite.

- [ ] **Step 4: Revisar las capturas a ojo**

Abre `.superpowers/shots/` y compara `lista-1440.png`, `detalle-library-1440.png`, `detalle-library-390.png` y `lista-claro.png` con el mockup `docs/superpowers/mockups/2026-09-21-proyectos-lista-y-detalle.html`. Comprueba: (a) el texto legible sobre el fondo del sitio en tema claro y oscuro; (b) las pestañas `EXP-00N` se distinguen de la línea; (c) en 390 px las carpetas son cabeceras de acordeón. Anota diferencias de tono respecto al mockup: son esperadas hasta que el rediseño cambie los tokens globales; solo corrige si algo es ilegible.

- [ ] **Step 5: Auditoría de teclado y lector de pantalla (manual)**

Con `next start` activo, recorre `/proyectos` y un detalle solo con Tab/Enter/Espacio: el foco debe verse en la fila, en los botones, en cada pestaña del Expediente y no debe entrar en carpetas cerradas. Con `data-a11y-motion="reduced"` (widget de accesibilidad) las transiciones no deben notarse.

- [ ] **Step 6: Commit**

No hay archivos que commitear en este task (el script y las capturas están en `.superpowers/`, ignorada). Verifica: `git status --short` no debe listar nada nuevo.

---

### Task 13: Metadatos de los repos en GitHub (requiere OK del usuario)

> **Confirma con el usuario antes de ejecutar**: estos comandos modifican sus repos públicos.

**Files:** ninguno del portfolio.

- [ ] **Step 1: `library-system`: URL de producción y topics vigentes**

```bash
gh repo edit Milan32555/Full-stack-library-management-system-with-Vue.js-frontend-and-Node.js-backend \
  --homepage "https://full-stack-library-management-syste-eight.vercel.app" \
  --remove-topic netlify-deployment --remove-topic railway \
  --add-topic vercel --add-topic neon --add-topic clean-architecture
```
Expected: sin salida de error. Verifica: `gh repo view Milan32555/Full-stack-library-management-system-with-Vue.js-frontend-and-Node.js-backend --json homepageUrl,repositoryTopics`.

- [ ] **Step 2: MEDI-IA: descripción real**

```bash
gh repo edit Milan32555/medi-ia-medical-agent \
  --description "Agente de diagnóstico diferencial sobre 14 libros médicos: recuperación híbrida BM25+FAISS con RRF, reranker cross-encoder y agente ReAct (Qwen2.5-7B). Flask, Docker, 185 tests."
```

- [ ] **Step 3: MEDI-IA: unificar "185 tests" en el README**

El README de MEDI-IA dice "185 tests" en la tabla de características y "185 aserciones" en la de stack. La copia local está en `C:\Users\misae\Desktop\Agentes Proeycto\files\MEDI-IA_Codigo_App\README.md`. Cambia `pytest 185 aserciones` por `pytest, 185 tests`, luego:

```bash
git add README.md && git commit -m "docs: unificar el conteo de tests (185 tests, no aserciones)" && git push
```
Expected: push a `main` de `Milan32555/medi-ia-medical-agent` sin conflictos.

---

### Task 14: Puerta de publicación (contenido pendiente del usuario)

**Files:**
- Modify: `lib/projects.ts` (texto real y `borrador`)
- Create: `public/proyectos/<slug>/…` (capturas y videos)

Este task se ejecuta cuando el usuario entregue el material; **no bloquea Tasks 0-12**. Hasta entonces, la web se puede construir y revisar, pero **no se despliega a producción**.

- [ ] **Step 1: Recibir del usuario y aplicar**
  - Capturas de cada proyecto (lista, detalle/predicción, vista mobile) → `public/proyectos/<slug>/*.webp`; registrar en `cover` y `galeria` con `width`/`height` reales y `alt` descriptivo.
  - Video de recorrido de 15-30 s, sin audio, ≤ 3 MB (MEDI-IA, safe-transfer-ai, AnimalVision) → `public/proyectos/<slug>/recorrido.mp4` + `poster.webp`; registrar en `video` con `label` que describa lo que muestra.
  - **Periodo y estado reales** de cada proyecto.
  - **Textos confirmados** de `rol`, `conMasTiempo`, las descripciones de `arquitectura` y el `aviso` médico de MEDI-IA.
  Cada campo confirmado se quita de `borrador` del proyecto. Si un proyecto no tiene captura, la portada generada se mantiene.

- [ ] **Step 2: Correr la puerta de publicación**

Run: `RELEASE=1 npm test` (en PowerShell: `$env:RELEASE=1; npm test`)
Expected: `# fail 0` y `# skipped 0`. Mientras algún `borrador` no esté vacío, el test "con RELEASE=1 no queda contenido sin confirmar" falla con el proyecto y los campos pendientes.

- [ ] **Step 3: Repetir Task 12 y commitear**

Run: `npm run build`, `npx next start -p 3100` y `python .superpowers/verify-proyectos.py`; con las capturas nuevas revisa las imágenes a ojo.

```bash
git add lib/projects.ts public/proyectos
git commit -m "feat: contenido real, capturas y videos de los proyectos"
```

- [ ] **Step 4: Publicar**

Abre el PR de `feat/proyectos` hacia la rama principal y despliega por el flujo habitual del portfolio. **Ojo con la cuenta de Vercel:** el portfolio vive en la cuenta personal del usuario ("misaelogallo19-7650's projects"), no en la de Clickweb con la que están logueados el CLI y el MCP de esta máquina. Desplegar solo por push a git, o guiando al usuario en su dashboard.

---

## Autorrevisión del plan contra el spec

**Cobertura de requisitos del spec → tarea**
- Rutas `/proyectos` y `/proyectos/[slug]`, `generateStaticParams`, `generateMetadata`, sitemap, 404 (`dynamicParams = false`) → Tasks 6, 10, 11.
- Datos en `lib/projects.ts` con el tipo completo (`subtitulo?`, `periodo`, `estado`, `metric`, `demo?`, `cover?`, `video?`, `galeria?`, `aviso?`, `stats`, `arquitectura`, `expediente` con `queHace`) → Task 4. *`subtitulo` está en el tipo y sin uso visual todavía: es opcional en el spec y ningún proyecto lo necesita hoy.*
- Orden aprobado, número `EXP-00N` derivado del orden, contadores calculados → Tasks 4, 6.
- Lista sutil: pestaña, cifra pequeña, estado, contexto, tags, botones que se omiten, fila entera enlazada, "Ver todo en GitHub" → Task 6.
- Hover discreto solo CSS (atenúa filas, línea de acento, flecha, capas de la portada), sin JS, con `(hover: hover) and (pointer: fine)` y reduce-motion → Task 6.
- Detalle: cabecera, botones, aviso/nota, medios, cifras, arquitectura, Expediente (5 carpetas, "Qué hace" dentro de Problema), paginador circular, CTA a contacto → Tasks 7-10.
- Expediente: hover con intención (~140 ms), solo movimiento real, siempre una abierta, teclado, `inert` tras hidratar, sin JS todo abierto, `aria-expanded/controls` → Tasks 2, 8.
- Video de recorrido sin autoplay (cumple reduce-motion) y galería → Task 9.
- Portada generada determinista → Tasks 3, 5.
- Honestidad de demos (nota de arranque en frío de AnimalVision, sin demo en MEDI-IA y safe-transfer) → datos de Task 4 con tests.
- Accesibilidad: `aria-label` con "(se abre en una pestaña nueva)", `rel`, foco visible en la fila estirada y en las pestañas, objetivos de 44 px → Tasks 5, 6, 8.
- Pendientes fuera de la página (repos de GitHub) → Task 13. Prerrequisitos de contenido y puerta de publicación → Task 14.
- Verificación (build, tipos, integridad de datos, capturas 1440/900/390, sin cascada, reduce-motion, teclado) → Tasks 1-4 (`npm test`) y 12.

**Brechas conocidas (decididas, no olvidadas)**
- La paleta navy y el sidebar del rediseño **no** se aplican aquí: las páginas usan los tokens actuales y heredarán la nueva paleta al cambiar `--bg`/`--surface` globalmente. La serif del mockup (Fraunces) se sustituye por DM Serif Display, la real del sitio.
- `.btn-primary` global usa texto blanco sobre `--accent` (contraste ~3.4:1, menor que el AA del spec). Es el botón existente de todo el sitio; corregirlo es una tarea global del rediseño, no de esta página.
- El CTA del pie apunta a `/#contact` (la sección de contacto del home actual) hasta que exista `/contacto`.
- `--muted` (`#6b6b78`) sigue sin llegar a AA sobre el fondo actual; el texto secundario nuevo usa `--soft` para lo importante y `--muted` solo para etiquetas de apoyo. La corrección global del token queda en el rediseño.

- `.sr-only` no está definida en `globals.css` (el layout la usa y depende de que Tailwind la genere). Este plan define su propia `.srOnly` en cada módulo para no depender de eso.

**Consistencia de nombres:** `projects`, `getProject`, `getAdjacent`, `getCounts`, `isLive`, `projectNumber`, `Project`, `CampoBorrador` (Task 4) se usan con esos nombres en los Tasks 5-11; `isRealMouseMove`/`HOVER_INTENT_MS` (Task 2) en Task 8; `coverLayers`/`hueFor` (Task 3) en Task 5; clases globales `pj-l0..2` de `ProjectCover` y su selector `:global(.pj-lN)` en `ProjectList.module.css` coinciden.
