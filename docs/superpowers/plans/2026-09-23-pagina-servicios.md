# /servicios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la página `/servicios` (spec `docs/superpowers/specs/2026-09-17-pagina-servicios-design.md`): artículo editorial con índice lateral (TOC) con scroll-spy, 6 secciones, FAQ en acordeón y divisores en capas, enlazada desde la navbar, el home y el sitemap.

**Architecture:** El copy vive en datos (`lib/servicios.ts`) y la lógica pura (scroll-spy, tiempo de lectura) en `lib/`, probada con `node:test`. La página es un Server Component (`app/servicios/page.tsx`) que compone tres piezas: `Toc` (client, scroll-spy + colapso en móvil), `Faq` (client, acordeón accesible) y `LayerDivider` (server, SVG decorativo). El scroll-reveal reutiliza `components/home/Reveal.tsx`.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript estricto, CSS Modules, `node:test` (Node con type-stripping, imports `./x.ts`), Playwright (Python) + axe-core para verificar.

---

## Adaptaciones del spec al sitio actual (decididas, no reabrir)

El spec se escribió pensando en el rediseño grande (sidebar fijo + navy), que **no existe todavía**. El sitio real tiene navbar superior fija y tokens oscuros actuales. Por eso:

1. **La navbar superior se mantiene** en `/servicios` (es la navegación global; no hay sidebar que reemplazar). El TOC ocupa la columna izquierda *del artículo*, sticky bajo la navbar. Sigue siendo TOC puro: sin mark ni "volver".
2. **Sin Framer Motion**: el scroll-reveal usa el `Reveal` existente (IntersectionObserver + transición CSS), que ya respeta `prefers-reduced-motion` y el interruptor del AccessibilityWidget vía CSS global. El acordeón es CSS (`grid-template-rows 0fr→1fr`). Cero dependencias nuevas.
3. **Divisores en capas** con tonos derivados de `--accent` sobre `--bg` (`color-mix`), para que funcionen en tema oscuro y claro, en lugar de los navy fijos `#0f1830/#0b1220`.
4. **Cierre**: el footer actual (Cordilleras) no tiene CTA a `/contacto`, así que el artículo termina con un bloque CTA "Hablemos →" antes del footer (mismo patrón que `/sobre-mi`).
5. **Copy tuteado** ("¿Trabajas…?", "¿Qué necesitas…?") como el resto del sitio, no voseo.
6. **Sin montos, sin plazos inventados**: la sección Precios y el FAQ no publican cifras (el test lo verifica). Los plazos se describen como "van en la propuesta".
7. **Navbar con 4 links** (Proyectos, Servicios, Sobre mí, Contacto): medido en producción, a 360px desborda ~10px → se ajustan gap y tamaño bajo 420px y 370px.

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `lib/servicios.ts` (crear) | Todo el copy de la página como datos + `pageText()` y `readingMinutes()` |
| `lib/servicios.test.ts` (crear) | Orden de secciones/FAQ, sin montos, tiempo de lectura |
| `lib/scrollSpy.ts` (crear) | `pickActive()`: qué sección está activa según posiciones |
| `lib/scrollSpy.test.ts` (crear) | Casos de `pickActive()` |
| `components/servicios/Servicios.module.css` (crear) | Estilos de layout, TOC, secciones, filas, FAQ, divisores |
| `components/servicios/LayerDivider.tsx` (crear) | SVG de 2 capas, decorativo |
| `components/servicios/Faq.tsx` (crear) | Acordeón accesible |
| `components/servicios/Toc.tsx` (crear) | TOC con scroll-spy y colapso móvil |
| `app/servicios/page.tsx` (crear) | Metadata + composición del artículo |
| `components/Navbar.tsx` (modificar) | Link "Servicios" |
| `app/globals.css` (modificar) | Navbar sin desborde a 360px |
| `components/home/Sections.tsx` (modificar) | "Ver servicios y cómo trabajo →" a `/servicios` |
| `app/sitemap.ts` (modificar) | Entrada `/servicios` |
| `.superpowers/verify-servicios.py` (crear, ignorado por git) | Verificación Playwright + axe |

Rama: `feat/servicios` (ya creada desde `main`).

---

### Task 1: Datos y copy de la página

**Files:**
- Create: `lib/servicios.ts`
- Test: `lib/servicios.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/servicios.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr el test y ver que falla**

Run: `node --test lib/servicios.test.ts`
Expected: FAIL con `Cannot find module ... servicios.ts`.

- [ ] **Step 3: Implementar `lib/servicios.ts`**

```ts
/**
 * Copy de /servicios como datos (spec 2026-09-17-pagina-servicios-design.md).
 * Regla: sin montos ni plazos cerrados publicados; el precio se cotiza tras /contacto.
 */

export interface Section {
  id: string;
  num: string;
  title: string;
}

export interface DevLine {
  title: string;
  description: string;
  stack: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const SECTIONS: readonly Section[] = [
  { id: "intro", num: "01", title: "Intro" },
  { id: "desarrollo", num: "02", title: "Desarrollo" },
  { id: "auditoria", num: "03", title: "Auditoría de código" },
  { id: "como-trabajo", num: "04", title: "Cómo trabajo" },
  { id: "precios", num: "05", title: "Precios" },
  { id: "preguntas", num: "06", title: "Preguntas frecuentes" },
];

export const INTRO: readonly string[] = [
  "No soy una fábrica de sitios ni tengo un paquete cerrado que sirva para todo. Antes de proponerte algo quiero entender el problema: qué necesita tu negocio, quién lo va a usar y qué pasa si algo sale mal.",
  "Hago dos cosas: construyo software y reviso el de otros. Las dos salen de la misma costumbre, que aprendí estudiando seguridad: buscar qué se rompe antes de que lo haga otro.",
];

export const DEV_INTRO =
  "Cuatro líneas de trabajo. En todas entrego código que puedes mantener, con avances visibles desde el principio.";

export const DEV_LINES: readonly DevLine[] = [
  {
    title: "Sitios y landing pages",
    description: "Presencia rápida y bien hecha: carga veloz, accesible y fácil de actualizar.",
    stack: "Next.js · React",
  },
  {
    title: "Apps web full-stack",
    description: "Paneles, portales y herramientas internas con usuarios, datos y lógica de negocio.",
    stack: "Next.js · Node.js · Python",
  },
  {
    title: "Apps móviles",
    description: "Android e iOS desde un mismo código, lista para publicarse en las tiendas.",
    stack: "Flutter",
  },
  {
    title: "Sistemas empresariales",
    description: "Inventarios, kardex y procesos internos hechos a la medida de cómo trabaja tu empresa.",
    stack: "Vue.js · Node.js",
  },
];

export const AUDIT: readonly string[] = [
  "Reviso el código fuente de tu aplicación buscando vulnerabilidades y malas prácticas: inyecciones (SQL, XSS), secretos expuestos, autenticación y permisos débiles, dependencias con fallas conocidas.",
  "Te entrego un informe con cada hallazgo priorizado, qué es crítico y qué puede esperar, y cómo corregirlo.",
];

export const AUDIT_FIT: readonly string[] = [
  "Vas a lanzar y quieres una revisión antes de salir a producción.",
  "Heredaste código que no escribiste y no sabes qué hay adentro.",
  "Tu app maneja datos de usuarios o pagos.",
];

export const AUDIT_NOTE =
  "Por ahora no ofrezco pentesting (pruebas de ataque sobre sistemas en funcionamiento): la revisión es sobre el código.";

export const DEV_STEPS: readonly Step[] = [
  { title: "Contacto y diagnóstico", text: "Una charla corta o un intercambio escrito para entender el problema real, no solo lo que se pidió al inicio." },
  { title: "Propuesta y cotización", text: "Alcance por escrito, precio cerrado (sitios) o cotización a medida, y tiempos estimados." },
  { title: "Anticipo y arranque", text: "Un adelanto reserva el cupo y arrancamos." },
  { title: "Desarrollo con checkpoints", text: "Avances visibles en un entorno de prueba, no una entrega a ciegas. Incluye una ronda de ajustes." },
  { title: "Entrega y capacitación", text: "Te dejo una guía corta para usar y actualizar lo que construimos." },
  { title: "Soporte posterior", text: "Una ventana corta después de la entrega para corregir errores. El mantenimiento continuo es un servicio aparte." },
];

export const AUDIT_STEPS: readonly Step[] = [
  { title: "Acceso y alcance", text: "Acceso de lectura al repositorio y qué partes revisar." },
  { title: "Revisión", text: "Análisis del código buscando vulnerabilidades y malas prácticas." },
  { title: "Informe", text: "Hallazgos priorizados: crítico frente a lo que puede esperar, con cómo corregir cada uno." },
  { title: "Sesión de resultados", text: "Repasamos juntos el informe y resolvemos dudas." },
];

export const PRICING: readonly string[] = [
  "No hay tabla de precios ni montos publicados, y eso aplica a todo lo que hago. No es por esconder nada: el precio sale de entender tu necesidad real, no de elegir un paquete de una lista.",
  "Me escribes contando qué necesitas, conversamos lo necesario y te envío una cotización por escrito con alcance, tiempos y forma de pago. Para sitios y landing pages suele ser un precio cerrado; para apps, sistemas y auditorías, una cotización a medida.",
];

export const FAQ: readonly FaqItem[] = [
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del alcance. Cuéntame qué necesitas en la página de contacto y te respondo con una cotización por escrito. La conversación inicial no tiene costo.",
  },
  {
    q: "¿Cuánto tarda un proyecto típico?",
    a: "Depende de qué se construye: una landing page toma bastante menos que una app con usuarios y datos. El plazo estimado va por escrito en la propuesta, junto con los checkpoints.",
  },
  {
    q: "¿Trabajas solo o con un equipo?",
    a: "Trabajo solo: hablas directamente con quien escribe el código. Si tu proyecto necesita algo fuera de lo que hago, te lo digo desde el principio.",
  },
  {
    q: "¿Haces mantenimiento después de la entrega?",
    a: "Después de la entrega hay una ventana corta de soporte para corregir errores. El mantenimiento continuo (actualizaciones, cambios nuevos) se acuerda aparte.",
  },
  {
    q: "¿Qué necesitas de mí para arrancar?",
    a: "Una descripción del problema o del objetivo, ejemplos de lo que te gusta si los tienes, y el contenido (textos, imágenes, accesos) cuando toque. Para una auditoría: acceso de lectura al repositorio y el alcance.",
  },
];

/** Todos los textos visibles del artículo (para el tiempo de lectura y los tests). */
export function pageText(): string[] {
  return [
    ...INTRO,
    DEV_INTRO,
    ...DEV_LINES.flatMap((d) => [d.title, d.description, d.stack]),
    ...AUDIT,
    ...AUDIT_FIT,
    AUDIT_NOTE,
    ...[...DEV_STEPS, ...AUDIT_STEPS].flatMap((s) => [s.title, s.text]),
    ...PRICING,
    ...FAQ.flatMap((f) => [f.q, f.a]),
  ];
}

/** Minutos de lectura a 200 palabras por minuto, redondeado, mínimo 1. */
export function readingMinutes(texts: readonly string[], wpm = 200): number {
  const words = texts.reduce((n, t) => n + t.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / wpm));
}
```

- [ ] **Step 4: Correr el test y ver que pasa**

Run: `node --test lib/servicios.test.ts`
Expected: PASS (9 tests). Si falla "2–6 minutos", no ajustar el copy para pasar: revisar que `pageText()` incluya todo; con el copy de arriba son ~3.

- [ ] **Step 5: Commit**

```bash
git add lib/servicios.ts lib/servicios.test.ts
git commit -m "feat(servicios): copy de la pagina como datos, sin montos publicados"
```

---

### Task 2: Scroll-spy puro

**Files:**
- Create: `lib/scrollSpy.ts`
- Test: `lib/scrollSpy.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/scrollSpy.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickActive } from "./scrollSpy.ts";

const tops = (...values: number[]) => values.map((top, i) => ({ id: `s${i}`, top }));

describe("pickActive", () => {
  it("sin secciones devuelve cadena vacía", () => {
    assert.equal(pickActive([], 140), "");
  });

  it("antes de la primera sección, la primera está activa", () => {
    assert.equal(pickActive(tops(400, 900, 1400), 140), "s0");
  });

  it("la última sección cuyo borde superior pasó la línea de lectura", () => {
    assert.equal(pickActive(tops(-600, -50, 500), 140), "s1");
    assert.equal(pickActive(tops(-600, 140, 500), 140), "s1");
    assert.equal(pickActive(tops(-900, -500, 100), 140), "s2");
  });

  it("al fondo de la página, la última aunque no haya llegado a la línea", () => {
    assert.equal(pickActive(tops(-900, -500, 300), 140, true), "s2");
  });
});
```

- [ ] **Step 2: Correr el test y ver que falla**

Run: `node --test lib/scrollSpy.test.ts`
Expected: FAIL con `Cannot find module ... scrollSpy.ts`.

- [ ] **Step 3: Implementar `lib/scrollSpy.ts`**

```ts
export interface SectionTop {
  id: string;
  /** Borde superior de la sección respecto al viewport (getBoundingClientRect().top). */
  top: number;
}

/**
 * Sección activa del TOC: la última cuyo borde superior ya cruzó la línea de lectura
 * (`offset` px desde arriba). Antes de la primera, la primera; al fondo de la página, la
 * última (las secciones cortas del final nunca llegarían a cruzar la línea).
 */
export function pickActive(tops: readonly SectionTop[], offset: number, atBottom = false): string {
  if (tops.length === 0) return "";
  if (atBottom) return tops[tops.length - 1].id;
  let current = tops[0].id;
  for (const t of tops) {
    if (t.top <= offset) current = t.id;
    else break;
  }
  return current;
}
```

- [ ] **Step 4: Correr el test y ver que pasa**

Run: `node --test lib/scrollSpy.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/scrollSpy.ts lib/scrollSpy.test.ts
git commit -m "feat(servicios): scroll-spy puro para el indice"
```

---

### Task 3: Estilos y divisor en capas

**Files:**
- Create: `components/servicios/Servicios.module.css`
- Create: `components/servicios/LayerDivider.tsx`

- [ ] **Step 1: Crear `components/servicios/Servicios.module.css`**

```css
/* /servicios — artículo editorial con índice lateral (spec 2026-09-17). */

.layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 4rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 9rem 2rem 6rem;
}
.article { min-width: 0; max-width: 720px; }

/* ─── Índice (TOC) ─────────────────────────────────────── */
.toc { position: sticky; top: 7rem; align-self: start; }
.reading {
  margin: 0 0 1rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: var(--soft);
}
.tocToggle { display: none; }
.tocList { margin: 0; padding: 0; list-style: none; border-left: 1px solid var(--border); }
.tocList a {
  display: flex;
  gap: 0.6rem;
  margin-left: -1px;
  padding: 0.35rem 0 0.35rem 1rem;
  border-left: 1px solid transparent;
  font-size: 0.85rem;
  color: var(--soft);
  transition: color var(--transition), border-color var(--transition);
}
.tocList a:hover { color: var(--text); }
.tocList a[aria-current="location"] { color: var(--text); border-left-color: var(--accent); }
.tocNum { font-family: var(--font-mono), monospace; font-size: 0.72rem; color: var(--accent2); }

/* ─── Encabezado ───────────────────────────────────────── */
.title {
  max-width: 22ch;
  margin: 0 0 3rem;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--text);
  text-wrap: balance;
}
.title em { font-style: normal; color: var(--accent2); }

/* ─── Secciones ────────────────────────────────────────── */
.sec { scroll-margin-top: 6.5rem; }
.h2 {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  margin: 0 0 1.4rem;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  font-size: clamp(1.6rem, 3.6vw, 2.1rem);
  line-height: 1.15;
  color: var(--text);
}
.num { font-family: var(--font-dm-serif), serif; font-size: 1.35em; line-height: 1; color: var(--accent2); }
.sec p { max-width: 62ch; margin: 0 0 1.1rem; color: var(--soft); line-height: 1.75; }
.sec .h3 { margin: 2rem 0 1rem; font-family: var(--font-mono), monospace; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.04em; color: var(--accent2); }

/* Filas de servicio: lift + fondo + flecha. En táctil la flecha siempre se ve. */
.rows { margin: 1.6rem 0 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.rows li { border-bottom: 1px solid var(--border); }
.rows a {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.35rem 1.2rem;
  padding: 1.2rem 0.8rem;
  border-radius: 8px;
  transition: transform var(--transition), background-color var(--transition);
}
.rows h3 { margin: 0; font-family: var(--font-dm-serif), serif; font-weight: 400; font-size: 1.3rem; color: var(--text); }
.rows p { grid-column: 1; margin: 0; font-size: 0.93rem; line-height: 1.6; }
.stack { grid-column: 1; font-family: var(--font-mono), monospace; font-size: 0.72rem; color: var(--accent2); }
.arrow {
  grid-column: 2;
  grid-row: 1 / span 3;
  align-self: center;
  color: var(--accent2);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--transition), transform var(--transition);
}
.rows a:focus-visible { background: rgba(79, 142, 247, 0.07); }
.rows a:focus-visible .arrow { opacity: 1; transform: none; }
@media (hover: hover) and (pointer: fine) {
  .rows a:hover { transform: translateX(2px); background: rgba(79, 142, 247, 0.07); }
  .rows a:hover .arrow { opacity: 1; transform: none; }
}
@media not ((hover: hover) and (pointer: fine)) {
  .arrow { opacity: 1; transform: none; }
  .rows a:active { background: rgba(79, 142, 247, 0.07); }
}

/* Auditoría */
.fit { margin: 0 0 1.4rem; padding-left: 1.2rem; color: var(--soft); line-height: 1.75; }
.fit li::marker { color: var(--accent2); }
.sec .note {
  margin: 1.4rem 0 0;
  padding: 0.8rem 1rem;
  border-left: 2px solid var(--accent);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  font-size: 0.9rem;
  color: var(--soft);
}

/* Cómo trabajo: pasos numerados */
.steps { margin: 0 0 1rem; padding: 0; list-style: none; counter-reset: step; }
.steps li {
  position: relative;
  padding: 0 0 1.1rem 2.6rem;
  counter-increment: step;
  color: var(--soft);
  line-height: 1.65;
}
.steps li::before {
  content: counter(step, decimal-leading-zero);
  position: absolute;
  top: 0.1rem;
  left: 0;
  font-family: var(--font-mono), monospace;
  font-size: 0.75rem;
  color: var(--accent2);
}
.steps strong { display: block; font-weight: 500; color: var(--text); }

/* FAQ: acordeón con grid-template-rows (sin medir alturas en JS). */
.faq { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.faq li { border-bottom: 1px solid var(--border); }
.faq h3 { margin: 0; font-size: 1rem; font-weight: 400; }
.q {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0.2rem;
  border: 0;
  background: none;
  font: inherit;
  font-size: 1rem;
  text-align: left;
  color: var(--text);
}
.icon { flex: none; font-size: 1.4rem; line-height: 1; color: var(--accent2); transition: transform var(--transition); }
.q[aria-expanded="true"] .icon { transform: rotate(45deg); }
.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--transition); }
.panel[data-open] { grid-template-rows: 1fr; }
.panelInner { overflow: hidden; }
.sec .panelInner p { margin: 0 0 1.2rem; padding: 0 0.2rem; }

/* Divisor en capas: mismo lenguaje del footer, en miniatura. */
.divider { height: 46px; margin: 3.5rem 0; }
.divider svg { display: block; width: 100%; height: 100%; }
.layerBack { fill: color-mix(in srgb, var(--accent) 12%, var(--bg)); }
.layerFront { fill: color-mix(in srgb, var(--accent) 6%, var(--bg)); }

/* Cierre */
.cta { margin-top: 4rem; }
.cta .h2 { display: block; margin-bottom: 0.8rem; }
.sec.cta p { margin-bottom: 1.6rem; }

:global([data-theme="light"]) .num,
:global([data-theme="light"]) .tocNum,
:global([data-theme="light"]) .stack,
:global([data-theme="light"]) .title em { color: var(--accent); }

/* ─── Móvil: el TOC colapsa a "En esta página ▾" ───────── */
@media (max-width: 767px) {
  .layout { grid-template-columns: 1fr; gap: 0; padding: 5.5rem 1rem 4rem; }
  .toc {
    top: 3.6rem;
    z-index: 50;
    margin: 0 -1rem 2.2rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(14px);
  }
  .tocToggle {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 0.85rem;
    color: var(--text);
  }
  .chev { transition: transform var(--transition); }
  .tocToggle[aria-expanded="true"] .chev { transform: rotate(180deg); }
  .toc:not([data-open]) .reading,
  .toc:not([data-open]) .tocList { display: none; }
  .reading { margin: 0.4rem 0 0.6rem; }
  .tocList { padding-bottom: 0.5rem; }
  .tocList a { padding-top: 0.55rem; padding-bottom: 0.55rem; }
  .divider { margin: 2.5rem 0; }
  /* Navbar + barra del TOC sticky: el título de la sección no debe quedar debajo. */
  .sec { scroll-margin-top: 7.5rem; }
}
```

- [ ] **Step 2: Crear `components/servicios/LayerDivider.tsx`**

```tsx
import styles from "./Servicios.module.css";

/** Dos crestas superpuestas, como el footer Cordilleras en miniatura. Solo decorativo. */
export default function LayerDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <svg viewBox="0 0 720 46" preserveAspectRatio="none" focusable="false">
        <path className={styles.layerBack} d="M0 30 L90 14 L170 24 L260 6 L350 20 L430 10 L520 26 L610 8 L720 22 L720 46 L0 46 Z" />
        <path className={styles.layerFront} d="M0 38 L110 26 L200 34 L300 20 L380 32 L470 22 L560 36 L650 24 L720 32 L720 46 L0 46 Z" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit -p .`
Expected: sin salida (0 errores).

- [ ] **Step 4: Commit**

```bash
git add components/servicios/Servicios.module.css components/servicios/LayerDivider.tsx
git commit -m "feat(servicios): estilos del articulo y divisor en capas"
```

---

### Task 4: FAQ en acordeón

**Files:**
- Create: `components/servicios/Faq.tsx`

- [ ] **Step 1: Crear `components/servicios/Faq.tsx`**

Cada pregunta abre/cierra de forma independiente. El panel cerrado es `inert` (su contenido no recibe foco ni lo leen los lectores de pantalla) y la altura la anima CSS.

```tsx
"use client";

import { useId, useState } from "react";
import styles from "./Servicios.module.css";
import type { FaqItem } from "@/lib/servicios";

export default function Faq({ items }: { items: readonly FaqItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<readonly boolean[]>(() => items.map(() => false));
  const toggle = (i: number) => setOpen((prev) => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <ul className={styles.faq}>
      {items.map((item, i) => {
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        const isOpen = open[i];
        return (
          <li key={item.q}>
            <h3>
              <button id={btnId} type="button" className={styles.q} aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(i)}>
                {item.q}
                <span className={styles.icon} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={styles.panel} data-open={isOpen ? "" : undefined} inert={!isOpen}>
              <div className={styles.panelInner}>
                <p>{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Verificar tipos y lint**

Run: `npx tsc --noEmit -p . && npx eslint components/servicios/Faq.tsx`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add components/servicios/Faq.tsx
git commit -m "feat(servicios): preguntas frecuentes en acordeon accesible"
```

---

### Task 5: Índice (TOC) con scroll-spy y colapso móvil

**Files:**
- Create: `components/servicios/Toc.tsx`

- [ ] **Step 1: Crear `components/servicios/Toc.tsx`**

Notas: la primera medición va en `requestAnimationFrame` (no se llama `setState` sincrónico dentro del efecto, que el lint de React 19 marca). El botón móvil solo se ve bajo 768px (CSS); en escritorio la lista siempre se muestra.

```tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./Servicios.module.css";
import { pickActive } from "@/lib/scrollSpy";
import type { Section } from "@/lib/servicios";

/** Línea de lectura: debajo de la navbar fija (y del TOC sticky en móvil). */
const SPY_OFFSET = 160;

export default function Toc({ sections, minutes }: { sections: readonly Section[]; minutes: number }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const tops = sections.flatMap((s) => {
        const el = document.getElementById(s.id);
        return el ? [{ id: s.id, top: el.getBoundingClientRect().top }] : [];
      });
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      setActive(pickActive(tops, SPY_OFFSET, atBottom));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [sections]);

  return (
    <nav className={styles.toc} aria-label="En esta página" data-open={open ? "" : undefined}>
      <button type="button" className={styles.tocToggle} aria-expanded={open} aria-controls="toc-list" onClick={() => setOpen((o) => !o)}>
        En esta página
        <span className={styles.chev} aria-hidden="true">
          ▾
        </span>
      </button>
      <p className={styles.reading}>{minutes} min de lectura</p>
      <ol id="toc-list" className={styles.tocList}>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined} onClick={() => setOpen(false)}>
              <span className={styles.tocNum} aria-hidden="true">
                {s.num}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Verificar tipos y lint**

Run: `npx tsc --noEmit -p . && npx eslint components/servicios/Toc.tsx`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add components/servicios/Toc.tsx
git commit -m "feat(servicios): indice con scroll-spy y colapso en movil"
```

---

### Task 6: La página `/servicios`

**Files:**
- Create: `app/servicios/page.tsx`

- [ ] **Step 1: Crear `app/servicios/page.tsx`**

```tsx
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import Reveal from "@/components/home/Reveal";
import Toc from "@/components/servicios/Toc";
import Faq from "@/components/servicios/Faq";
import LayerDivider from "@/components/servicios/LayerDivider";
import styles from "@/components/servicios/Servicios.module.css";
import {
  AUDIT,
  AUDIT_FIT,
  AUDIT_NOTE,
  AUDIT_STEPS,
  DEV_INTRO,
  DEV_LINES,
  DEV_STEPS,
  FAQ,
  INTRO,
  PRICING,
  SECTIONS,
  pageText,
  readingMinutes,
  type Section,
} from "@/lib/servicios";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const parentOg = (await parent).openGraph;
  const description =
    "Desarrollo (sitios, apps web, apps móviles y sistemas a medida) y auditoría de código. Cómo trabajo, cómo cotizo y preguntas frecuentes.";
  return {
    title: "Servicios",
    description,
    alternates: { canonical: "/servicios" },
    openGraph: {
      title: "Servicios — Misael",
      description,
      url: "/servicios",
      type: "website",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: "Servicios — Misael", description },
  };
}

const byId = (id: string): Section => {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Sección desconocida: ${id}`);
  return s;
};

function Heading({ id }: { id: string }) {
  const s = byId(id);
  return (
    <h2 id={`t-${s.id}`} className={styles.h2}>
      <span className={styles.num} aria-hidden="true">
        {s.num}
      </span>
      {s.title}
    </h2>
  );
}

export default function ServiciosPage() {
  const minutes = readingMinutes(pageText());
  return (
    <main id="main-content">
      <div className={styles.layout}>
        <Toc sections={SECTIONS} minutes={minutes} />

        <article className={styles.article}>
          <header>
            <p className="section-label">Servicios</p>
            <h1 className={styles.title}>
              Construyo software y reviso el de otros, <em>empezando por entender el problema.</em>
            </h1>
          </header>

          <section id="intro" className={styles.sec} aria-labelledby="t-intro">
            <Reveal>
              <Heading id="intro" />
              {INTRO.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </section>

          <LayerDivider />

          <section id="desarrollo" className={styles.sec} aria-labelledby="t-desarrollo">
            <Reveal>
              <Heading id="desarrollo" />
              <p>{DEV_INTRO}</p>
            </Reveal>
            <Reveal delay={90}>
              <ul className={styles.rows}>
                {DEV_LINES.map((d) => (
                  <li key={d.title}>
                    <Link href="/contacto">
                      <h3>{d.title}</h3>
                      <p>{d.description}</p>
                      <span className={styles.stack}>{d.stack}</span>
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="auditoria" className={styles.sec} aria-labelledby="t-auditoria">
            <Reveal>
              <Heading id="auditoria" />
              {AUDIT.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className={styles.h3}>Tiene sentido si:</p>
              <ul className={styles.fit}>
                {AUDIT_FIT.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className={styles.note}>{AUDIT_NOTE}</p>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="como-trabajo" className={styles.sec} aria-labelledby="t-como-trabajo">
            <Reveal>
              <Heading id="como-trabajo" />
              <h3 className={styles.h3}>Proyectos de desarrollo</h3>
              <ol className={styles.steps}>
                {DEV_STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    {s.text}
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={90}>
              <h3 className={styles.h3}>Auditoría de código</h3>
              <ol className={styles.steps}>
                {AUDIT_STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    {s.text}
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="precios" className={styles.sec} aria-labelledby="t-precios">
            <Reveal>
              <Heading id="precios" />
              {PRICING.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </section>

          <LayerDivider />

          <section id="preguntas" className={styles.sec} aria-labelledby="t-preguntas">
            <Reveal>
              <Heading id="preguntas" />
              <Faq items={FAQ} />
            </Reveal>
          </section>

          <section className={`${styles.sec} ${styles.cta}`} aria-labelledby="t-cta">
            <Reveal>
              <h2 id="t-cta" className={styles.h2}>
                ¿Tienes un proyecto en mente?
              </h2>
              <p>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
              <Link className="btn-primary" href="/contacto">
                Hablemos <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </section>
        </article>
      </div>
    </main>
  );
}
```

Nota: `.sec .h3` / `.sec .note` llevan el prefijo `.sec` a propósito para ganarle en especificidad a `.sec p`. El `<p className={styles.h3}>Tiene sentido si:</p>` usa la clase visual de subtítulo pero es un párrafo a propósito (es la entrada de la lista, no un encabezado de sección).

- [ ] **Step 2: Verificar tipos, lint y build**

Run: `npx tsc --noEmit -p . && npx eslint app/servicios components/servicios && npm run build`
Expected: build OK y `/servicios` aparece como `○ (Static)` en la tabla de rutas.

- [ ] **Step 3: Commit**

```bash
git add app/servicios/page.tsx
git commit -m "feat(servicios): pagina /servicios con indice, secciones, FAQ y cierre"
```

---

### Task 7: Enlazar la página (navbar, home, sitemap)

**Files:**
- Modify: `components/Navbar.tsx:7-11`
- Modify: `app/globals.css` (bloque `/* ─── RESPONSIVE ─── */`, reglas de 420px)
- Modify: `components/home/Sections.tsx:35-38`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Navbar — agregar el link**

En `components/Navbar.tsx`, reemplazar `LINKS` por:

```tsx
const LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
] as const;
```

- [ ] **Step 2: Navbar sin desborde en teléfonos pequeños**

En `app/globals.css`, reemplazar el bloque `@media (max-width: 420px) { ... }` de la sección RESPONSIVE por:

```css
@media (max-width: 420px) {
  .navbar-logo .logo-long { display: none; }
  .navbar { padding: 0.9rem 1rem; }
  .navbar-links { gap: 0.7rem; }
  .navbar-links a { font-size: 0.78rem !important; }
}
@media (max-width: 370px) {
  .navbar { padding: 0.9rem 0.75rem; }
  .navbar-links { gap: 0.5rem; }
}
```

- [ ] **Step 3: Home — "qué hago" lleva a /servicios**

En `components/home/Sections.tsx`, reemplazar:

```tsx
        {/* Cuando exista /servicios: "Ver servicios y cómo trabajo →" con href="/servicios". */}
        <Link className={styles.more} href="/contacto">
          Cuéntame tu proyecto →
        </Link>
```

por:

```tsx
        <Link className={styles.more} href="/servicios">
          Ver servicios y cómo trabajo →
        </Link>
```

- [ ] **Step 4: Sitemap**

En `app/sitemap.ts`, después de la línea de `/proyectos`, agregar:

```ts
    { url: `${siteUrl}/servicios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
```

- [ ] **Step 5: Tests, tipos, lint y build**

Run: `npm test && npx tsc --noEmit -p . && npx eslint && npm run build`
Expected: todos los tests en verde, sin errores, build OK.

- [ ] **Step 6: Commit**

```bash
git add components/Navbar.tsx app/globals.css components/home/Sections.tsx app/sitemap.ts
git commit -m "feat(servicios): enlazar /servicios desde navbar, home y sitemap"
```

---

### Task 8: Verificación de punta a punta

**Files:**
- Create: `.superpowers/verify-servicios.py` (ignorado por git)

- [ ] **Step 1: Levantar el build de producción en segundo plano**

Ya construido en la Task 7. Arrancar en **segundo plano** (nunca en primer plano: bloquea al agente):

```bash
npx next start -p 3100
```
(con `run_in_background: true`). Esperar a que `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/servicios` devuelva `200`.

- [ ] **Step 2: Crear `.superpowers/verify-servicios.py`**

```python
"""Verificación de /servicios contra `next start -p 3100`."""
import re
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
AXE = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
fails = []

def check(cond, msg):
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)

def axe(page, name):
    page.add_script_tag(url=AXE)
    v = page.evaluate("axe.run(document, {runOnly: ['wcag2a','wcag2aa']}).then(r => r.violations.map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes[0].target.join(' ')))")
    check(v == [], f"axe {name}: {v}")

def reveal_all(pg):
    pg.evaluate("document.querySelectorAll('.fade-in-section').forEach(e => e.classList.add('visible'))")

with sync_playwright() as p:
    b = p.chromium.launch()

    # 1. Escritorio: estructura, TOC, scroll-spy
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/servicios")
    toc = pg.get_by_role("navigation", name="En esta página")
    links = toc.get_by_role("link")
    check(links.count() == 6, "el TOC tiene 6 secciones")
    check(re.match(r"^\d+ min de lectura$", toc.locator("p").inner_text()) is not None, "tiempo de lectura dentro del TOC")
    check(pg.locator("[aria-current=location]").inner_text().endswith("Intro"), "al cargar, Intro está activa")
    toc.get_by_role("link", name=re.compile("Precios")).click()
    pg.wait_for_timeout(700)
    check(pg.locator("[aria-current=location]").inner_text().endswith("Precios"), "tras clic, Precios está activa (aria-current=location)")
    check(pg.evaluate("getComputedStyle(document.querySelector('nav[aria-label=\"En esta página\"]')).position") == "sticky", "el TOC es sticky")
    top = pg.evaluate("document.querySelector('nav[aria-label=\"En esta página\"]').getBoundingClientRect().top")
    check(0 < top < 200, f"el TOC sigue visible tras hacer scroll (top={top})")
    main_text = pg.inner_text("main")
    check(re.search(r"\$\s?\d|\bCOP\b|\d{1,3}(\.\d{3})+", main_text) is None, "sin montos publicados")
    check("pentesting" in main_text, "aclara que no hay pentesting")

    # 2. FAQ: acordeón
    q = pg.get_by_role("button", name="¿Cuánto cuesta?")
    q.scroll_into_view_if_needed()
    check(q.get_attribute("aria-expanded") == "false", "FAQ cerrada al inicio")
    panel = pg.locator("#" + q.get_attribute("aria-controls"))
    check(panel.evaluate("e => e.inert") is True, "panel cerrado es inert")
    q.click()
    pg.wait_for_timeout(400)
    check(q.get_attribute("aria-expanded") == "true", "FAQ se abre al clic")
    check(panel.evaluate("e => e.getBoundingClientRect().height") > 20, "el panel abierto tiene alto")
    q.press("Enter")
    pg.wait_for_timeout(400)
    check(q.get_attribute("aria-expanded") == "false", "FAQ se cierra con Enter")
    reveal_all(pg)
    pg.screenshot(path=".superpowers/shots/servicios-desktop.png", full_page=True)
    axe(pg, "servicios escritorio")
    check(errs == [], f"sin errores de JS: {errs}")

    # 3. Home enlaza a /servicios
    pg.goto(BASE + "/")
    check(pg.locator("a[href='/servicios']").count() >= 2, "home: navbar + 'Ver servicios' enlazan a /servicios")
    pg.close()

    # 4. Móvil: TOC colapsado + sin scroll horizontal
    for w in (360, 390):
        m = b.new_page(viewport={"width": w, "height": 800}, has_touch=True, is_mobile=True)
        m.goto(BASE + "/servicios")
        overflow = m.evaluate("document.documentElement.scrollWidth - innerWidth")
        check(overflow <= 0, f"{w}px: sin scroll horizontal ({overflow}px)")
        nav_overflow = m.evaluate("document.querySelector('.navbar').scrollWidth - innerWidth")
        check(nav_overflow <= 0, f"{w}px: la navbar con 4 links cabe ({nav_overflow}px)")
        btn = m.get_by_role("button", name="En esta página")
        check(btn.is_visible(), f"{w}px: botón 'En esta página' visible")
        check(not m.locator("#toc-list").is_visible(), f"{w}px: lista del TOC oculta al inicio")
        btn.tap()
        check(m.locator("#toc-list").is_visible(), f"{w}px: la lista se despliega al tocar")
        m.get_by_role("link", name=re.compile("Cómo trabajo")).tap()
        m.wait_for_timeout(700)
        check(not m.locator("#toc-list").is_visible(), f"{w}px: la lista se cierra al elegir sección")
        reveal_all(m)
        m.screenshot(path=f".superpowers/shots/servicios-{w}.png", full_page=True)
        if w == 390:
            axe(m, "servicios móvil")
        m.close()

    # 5. Tema claro
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(BASE + "/servicios")
    pg.get_by_role("button", name="Cambiar tema").click()
    reveal_all(pg)
    pg.wait_for_timeout(400)
    axe(pg, "servicios tema claro")
    pg.screenshot(path=".superpowers/shots/servicios-light.png", full_page=True)
    pg.close()
    b.close()

print("\nTodo OK" if not fails else f"\n{len(fails)} FALLAS:\n- " + "\n- ".join(fails))
```

- [ ] **Step 3: Correr la verificación**

Run: `mkdir -p .superpowers/shots && python .superpowers/verify-servicios.py`
Expected: última línea `Todo OK`. Si algo falla, corregir en el componente correspondiente, reconstruir (`npm run build`, reiniciar el server en segundo plano) y volver a correr. Revisar las capturas de `.superpowers/shots/servicios-*.png` a ojo (numeración "01–06" en acento, divisores visibles, flechas visibles en móvil).

- [ ] **Step 4: Lighthouse móvil**

Run: `npx lighthouse http://localhost:3100/servicios --form-factor=mobile --only-categories=performance,accessibility --output=json --output-path=.superpowers/lh-servicios.json --chrome-flags="--headless"` con la máquina tranquila (sin builds en paralelo: falsea el puntaje).
Expected: performance ≥ 90, accessibility ≥ 95.

- [ ] **Step 5: Detener el server y abrir el PR**

Detener el `next start` de segundo plano. Luego:

```bash
git push -u origin feat/servicios
gh pr create --title "feat: página /servicios" --body "<resumen de cambios + resultados de verificación>"
```

**Sin trailer de coautoría de IA** en commits ni PR (preferencia de Misael para sus repos personales).
