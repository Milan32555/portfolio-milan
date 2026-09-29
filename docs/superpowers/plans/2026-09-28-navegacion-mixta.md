# Navegación mixta + sistema visual navy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el spec `docs/superpowers/specs/2026-09-28-navegacion-mixta-y-sistema-visual-design.md`: barra superior en el home, sidebar en las páginas internas desde 1024px, menú móvil a pantalla completa, tokens navy con contraste AA, resplandor + grano, cursor nuevo, foco visible y tema recordado.

**Architecture:** La lógica pura (enlaces, ruta tipo terminal, tema, cursor) vive en `lib/` con pruebas `node --test`. Los componentes de navegación viven en `components/nav/` con un CSS Module cada uno. Las páginas internas se mueven a un grupo de rutas `app/(internas)/` cuyo layout agrega la rejilla con el sidebar; la barra superior vive en el layout raíz y se oculta sola desde 1024px fuera del home.

**Tech Stack:** Next.js 16.1.6 (App Router, Turbopack), React 19.2.3, TypeScript, CSS Modules + `app/globals.css`, pruebas con `node --test` (type stripping), verificación con Playwright para Python + axe-core.

---

## Convenciones (leer antes de cualquier tarea)

- **Directorio:** todo se corre desde la raíz del repo `portfolio-milan/`.
- **Rama:** `feat/navegacion-mixta`, creada en la Tarea 0 desde `docs/spec-navegacion-mixta`.
- **Commits:** agrega rutas explícitas (`git add <rutas>`), nunca `git add -A`. **Nunca** agregues trailers `Co-Authored-By` ni menciones de IA en commits o PRs (decisión de Misael para sus repos personales).
- **Chequeo rápido** después de cada tarea con código: `npx tsc --noEmit && npm run lint && npm test`. Los tres deben terminar sin errores.
- **Servidor para capturas:** en segundo plano (Bash con `run_in_background: true`): `npx next dev -p 3100`. Espera a que `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/` devuelva `200`. Para detenerlo (PowerShell): `Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`. **Nunca** lo corras en primer plano: bloquea la sesión.
- **Capturas:** `MSYS_NO_PATHCONV=1 python .superpowers/shot.py <rutas> --widths 1440,390 --out <nombre>` (lo crea la Tarea 0) guarda PNG en `.superpowers/shots/nav/`. Míralas con la herramienta Read antes de dar una tarea visual por terminada. En Git Bash, `MSYS_NO_PATHCONV=1` evita que `/ruta` se convierta en una ruta de Windows.
- `.superpowers/` está en `.gitignore`: los scripts de verificación no se commitean.
- `npm run build` a veces falla una vez por un error pasajero de Google Fonts ("next/font/google queries…"). Reintenta una vez antes de tratarlo como un fallo real.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `lib/nav.ts` + `lib/nav.test.ts` | Crear | Enlaces, `isHome`, `isActive`, `terminalPath` |
| `lib/theme.ts` + `lib/theme.test.ts` | Crear | Clave de tema, `parseTheme`, `otherTheme`, script previo al pintado |
| `lib/cursor.ts` + `lib/cursor.test.ts` | Crear | Selector de interactivos, factor de seguimiento, escala |
| `app/globals.css` | Modificar | Tokens navy, resplandor/grano, cursor, foco visible; borrar la navbar vieja |
| `app/opengraph-image.tsx` | Modificar | Colores navy |
| `components/SiteBackdrop.tsx` | Crear | Capa fija de resplandor + grano |
| `components/CustomCursor.tsx` | Reescribir | Punto + resplandor con delegación |
| `components/nav/icons.tsx` | Crear | Iconos sol, luna, GitHub |
| `components/nav/IconButton.module.css` | Crear | Botón circular de 44px |
| `components/nav/ThemeToggle.tsx` | Crear | Botón de tema sincronizado con `data-theme` |
| `components/nav/SiteMark.tsx` + `.module.css` | Crear | "Misael." |
| `components/nav/TerminalPath.tsx` + `.module.css` | Crear | `~/proyectos` tipeado |
| `components/nav/MobileMenu.tsx` + `.module.css` | Crear | Menú modal a pantalla completa |
| `components/nav/TopBar.tsx` + `.module.css` | Crear | Barra superior |
| `components/nav/Sidebar.tsx` + `.module.css` | Crear | Sidebar de páginas internas |
| `components/nav/SidebarIndex.tsx` | Crear | Índice de `/servicios` en el sidebar |
| `components/nav/MarkTransition.tsx` | Crear (opcional, Tarea 14) | View Transition del nombre |
| `components/servicios/useScrollSpy.ts` | Crear | Hook de scroll-spy compartido |
| `components/servicios/Toc.tsx` | Modificar | Usa el hook |
| `components/servicios/Servicios.module.css` | Modificar | Sin columna de TOC desde 1024px |
| `components/Navbar.tsx` | Borrar | Reemplazada por `TopBar` |
| `app/layout.tsx` | Modificar | Script de tema, fondo, `TopBar` |
| `app/(internas)/layout.tsx` + `layout.module.css` | Crear | Rejilla con sidebar |
| `app/proyectos`, `app/servicios`, `app/sobre-mi`, `app/contacto` | Mover a `app/(internas)/` | Las URLs no cambian |
| `components/proyectos/{ProjectList,Expediente,ArchitectureFlow}.module.css`, `Expediente.tsx` | Modificar | Container queries |
| `components/home/Sections.tsx` | Modificar | Sin línea de stack |
| `components/hero/Hero.module.css` | Modificar | Fondo transparente; línea `audit` en móvil |

---

### Task 0: Rama, línea base y script de capturas

**Files:**
- Create: `.superpowers/shot.py` (gitignored)

- [ ] **Step 1: Crear la rama desde la del spec**

```bash
git checkout docs/spec-navegacion-mixta
git checkout -b feat/navegacion-mixta
```

- [ ] **Step 2: Confirmar la línea base en verde**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores; `npm test` termina con `# fail 0`.

- [ ] **Step 3: Crear el script de capturas**

Crea `.superpowers/shot.py`:

```python
"""Capturas rápidas contra el servidor local (puerto 3100).

Uso: python .superpowers/shot.py /ruta [/otra ...] [--widths 1440,1000,390] [--out nombre]
Salta el muro de código (sessionStorage gateSeen=1) y fuerza los .fade-in-section visibles.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
args = sys.argv[1:]
widths = [1440, 390]
tag = "shot"
paths = []
i = 0
while i < len(args):
    if args[i] == "--widths":
        widths = [int(w) for w in args[i + 1].split(",")]
        i += 2
    elif args[i] == "--out":
        tag = args[i + 1]
        i += 2
    else:
        paths.append(args[i])
        i += 1

out = Path(".superpowers/shots/nav")
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in widths:
        mobile = w < 768
        ctx = b.new_context(viewport={"width": w, "height": 844 if mobile else 900}, is_mobile=mobile, has_touch=mobile)
        ctx.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        for path in paths or ["/"]:
            pg.goto(BASE + path, wait_until="load", timeout=120000)
            pg.evaluate("document.querySelectorAll('.fade-in-section').forEach(e => e.classList.add('visible'))")
            pg.wait_for_timeout(1500)
            name = f"{tag}-{w}-{(path.strip('/') or 'home').replace('/', '_')}.png"
            pg.screenshot(path=str(out / name))
            print("captura:", out / name)
        if errors:
            print("ERRORES JS:", errors)
        ctx.close()
    b.close()
```

- [ ] **Step 4: Probar el script contra el sitio actual**

Arranca el servidor (ver Convenciones), luego:
Run: `python .superpowers/shot.py / /proyectos --widths 1440 --out base`
Expected: imprime dos rutas `captura: .superpowers/shots/nav/base-1440-...png` y ninguna línea `ERRORES JS`.

(No hay commit: el script está en `.superpowers/`, que se ignora.)

---

### Task 1: `lib/nav.ts` — enlaces, activo y ruta tipo terminal

**Files:**
- Create: `lib/nav.ts`
- Test: `lib/nav.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

Crea `lib/nav.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NAV_LINKS, isActive, isHome, terminalPath } from "./nav.ts";

describe("NAV_LINKS", () => {
  it("tiene las 4 páginas en el orden de la barra", () => {
    assert.deepEqual(
      NAV_LINKS.map((l) => l.href),
      ["/proyectos", "/servicios", "/sobre-mi", "/contacto"],
    );
  });
});

describe("isHome", () => {
  it("solo la raíz es el home", () => {
    assert.equal(isHome("/"), true);
    assert.equal(isHome("/proyectos"), false);
  });
});

describe("isActive", () => {
  it("activo en su ruta y en sus subrutas", () => {
    assert.equal(isActive("/proyectos", "/proyectos"), true);
    assert.equal(isActive("/proyectos/medi-ia", "/proyectos"), true);
  });

  it("no se confunde con rutas que solo comparten el prefijo", () => {
    assert.equal(isActive("/proyectos-viejos", "/proyectos"), false);
    assert.equal(isActive("/", "/proyectos"), false);
  });
});

describe("terminalPath", () => {
  it("el home es ~", () => {
    assert.deepEqual(terminalPath("/"), { base: "~", last: "" });
  });

  it("una página: ~/ y el nombre resaltado", () => {
    assert.deepEqual(terminalPath("/servicios"), { base: "~/", last: "servicios" });
  });

  it("una subpágina: se resalta el último segmento", () => {
    assert.deepEqual(terminalPath("/proyectos/medi-ia"), { base: "~/proyectos/", last: "medi-ia" });
  });

  it("ignora la barra final, la query y el hash", () => {
    assert.deepEqual(terminalPath("/servicios/"), { base: "~/", last: "servicios" });
    assert.deepEqual(terminalPath("/servicios?x=1#precios"), { base: "~/", last: "servicios" });
  });
});
```

- [ ] **Step 2: Correrla para ver que falla**

Run: `node --test lib/nav.test.ts`
Expected: FAIL con `Cannot find module` apuntando a `lib/nav.ts`.

- [ ] **Step 3: Implementar**

Crea `lib/nav.ts`:

```ts
export interface NavLink {
  href: string;
  label: string;
}

/** Páginas principales, en el orden de la barra, el sidebar y el menú móvil. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export function isHome(pathname: string): boolean {
  return pathname === "/";
}

/** Activo en su ruta y en sus subrutas: /proyectos/medi-ia activa "Proyectos". */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface TerminalPath {
  /** Todo menos el último segmento, con su barra final: "~/proyectos/". En el home, "~". */
  base: string;
  /** El último segmento, que se resalta: "medi-ia". Vacío en el home. */
  last: string;
}

/** Ruta tipo terminal para la barra: "/proyectos/medi-ia" → "~/proyectos/" + "medi-ia". */
export function terminalPath(pathname: string): TerminalPath {
  const segments = pathname.split(/[?#]/)[0].split("/").filter(Boolean);
  if (segments.length === 0) return { base: "~", last: "" };
  const last = segments[segments.length - 1];
  const base = "~/" + segments.slice(0, -1).map((s) => `${s}/`).join("");
  return { base, last };
}
```

- [ ] **Step 4: Correr la prueba**

Run: `node --test lib/nav.test.ts`
Expected: PASS, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/nav.ts lib/nav.test.ts
git commit -m "feat(nav): enlaces, estado activo y ruta tipo terminal"
```

---

### Task 2: `lib/theme.ts` — tema recordado sin parpadeo

**Files:**
- Create: `lib/theme.ts`
- Test: `lib/theme.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

Crea `lib/theme.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { THEME_KEY, THEME_PRE_PAINT_SCRIPT, otherTheme, parseTheme } from "./theme.ts";

function run(stored: string | null, opts: { throws?: boolean } = {}) {
  const attrs: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; } } };
  const localStorage = {
    getItem: (k: string) => {
      if (opts.throws) throw new Error("bloqueado");
      return k === THEME_KEY ? stored : null;
    },
  };
  new Function("document", "localStorage", THEME_PRE_PAINT_SCRIPT)(document, localStorage);
  return attrs["data-theme"];
}

describe("parseTheme", () => {
  it("solo 'light' es claro; lo demás es el oscuro por defecto", () => {
    assert.equal(parseTheme("light"), "light");
    assert.equal(parseTheme("dark"), "dark");
    assert.equal(parseTheme(null), "dark");
    assert.equal(parseTheme("sepia"), "dark");
  });
});

describe("otherTheme", () => {
  it("alterna entre los dos", () => {
    assert.equal(otherTheme("dark"), "light");
    assert.equal(otherTheme("light"), "dark");
  });
});

describe("THEME_PRE_PAINT_SCRIPT", () => {
  it("aplica el tema guardado", () => {
    assert.equal(run("light"), "light");
    assert.equal(run("dark"), "dark");
  });

  it("sin valor o con un valor raro, oscuro", () => {
    assert.equal(run(null), "dark");
    assert.equal(run("sepia"), "dark");
  });

  it("si localStorage lanza (modo privado), oscuro y sin romper", () => {
    assert.equal(run("light", { throws: true }), "dark");
  });
});
```

- [ ] **Step 2: Correrla para ver que falla**

Run: `node --test lib/theme.test.ts`
Expected: FAIL con `Cannot find module` apuntando a `lib/theme.ts`.

- [ ] **Step 3: Implementar**

Crea `lib/theme.ts`:

```ts
import type { ThemeName } from "./a11y.ts";

/** Clave de localStorage donde se recuerda el tema elegido. */
export const THEME_KEY = "theme";

/** Solo "light" es claro; cualquier otro valor (o ninguno) es el oscuro por defecto. */
export function parseTheme(stored: string | null | undefined): ThemeName {
  return stored === "light" ? "light" : "dark";
}

export function otherTheme(theme: ThemeName): ThemeName {
  return theme === "light" ? "dark" : "light";
}

/**
 * Corre en el <head>, antes del primer pintado (ver app/layout.tsx): aplica el tema guardado
 * sin parpadeo. ES5 plano y a prueba de errores: localStorage puede lanzar en modo privado.
 */
export const THEME_PRE_PAINT_SCRIPT =
  "(function(){var t='dark';" +
  `try{if(localStorage.getItem('${THEME_KEY}')==='light')t='light'}catch(e){}` +
  "try{document.documentElement.setAttribute('data-theme',t)}catch(e){}})();";
```

- [ ] **Step 4: Correr la prueba**

Run: `node --test lib/theme.test.ts`
Expected: PASS, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/theme.ts lib/theme.test.ts
git commit -m "feat(tema): tema recordado y script previo al primer pintado"
```

---

### Task 3: `lib/cursor.ts` — números del cursor

**Files:**
- Create: `lib/cursor.ts`
- Test: `lib/cursor.test.ts`

- [ ] **Step 1: Escribir la prueba que falla**

Crea `lib/cursor.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { approach, followFactor, glowScale } from "./cursor.ts";

describe("cursor", () => {
  it("el resplandor sigue al mouse con el factor J3 (0.22)", () => {
    assert.equal(followFactor(false), 0.22);
  });

  it("con movimiento reducido llega al instante", () => {
    assert.equal(followFactor(true), 1);
    assert.equal(approach(10, 300, followFactor(true)), 300);
  });

  it("approach avanza la fracción indicada", () => {
    assert.equal(approach(0, 100, 0.22), 22);
    assert.equal(approach(50, 50, 0.22), 50);
  });

  it("crece 1.4x sobre lo interactivo", () => {
    assert.equal(glowScale(true), 1.4);
    assert.equal(glowScale(false), 1);
  });
});
```

- [ ] **Step 2: Correrla para ver que falla**

Run: `node --test lib/cursor.test.ts`
Expected: FAIL con `Cannot find module` apuntando a `lib/cursor.ts`.

- [ ] **Step 3: Implementar**

Crea `lib/cursor.ts`:

```ts
/** Elementos sobre los que el resplandor crece. Se detectan con closest() en cada movimiento (delegación). */
export const INTERACTIVE_SELECTOR =
  "a[href], button, input, select, textarea, summary, label[for], [role='button'], [data-cursor]";

/** Fracción del camino que el resplandor recorre por cuadro: J3 = 0.22; con movimiento reducido, todo. */
export function followFactor(reduced: boolean): number {
  return reduced ? 1 : 0.22;
}

export function glowScale(hovering: boolean): number {
  return hovering ? 1.4 : 1;
}

/** Un paso de interpolación lineal de `current` hacia `target`. */
export function approach(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}
```

- [ ] **Step 4: Correr la prueba**

Run: `node --test lib/cursor.test.ts`
Expected: PASS, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/cursor.ts lib/cursor.test.ts
git commit -m "feat(cursor): factor de seguimiento, escala e interactivos"
```

---

### Task 4: Tokens navy, contraste AA, foco visible e imagen para redes

**Files:**
- Modify: `app/globals.css` (bloques `:root` y `[data-theme="light"]` de TOKENS; final del archivo)
- Modify: `app/opengraph-image.tsx`

- [ ] **Step 1: Cambiar los tokens oscuros**

En `app/globals.css`, reemplaza:

```css
:root {
  --bg:        #0c0c0e;
  --bg2:       #111114;
  --surface:   #16161a;
  --border:    rgba(255,255,255,0.07);
  --accent:    #4f8ef7;
  --accent2:   #7eb3ff;
  --text:      #f0f0f2;
  --muted:     #6b6b78;
```

por:

```css
:root {
  /* Navy (spec 2026-09-28). --muted: 5.98:1 sobre --bg (el anterior, 3.57:1, no pasaba AA). */
  --bg:        #0b1220;
  --bg2:       #0e1628;
  --surface:   #111a2e;
  --border:    rgba(148,170,210,0.10);
  --accent:    #4f8ef7;
  --accent2:   #7eb3ff;
  --text:      #eef1f6;
  --muted:     #8792a8;
```

- [ ] **Step 2: Subir el contraste del gris en claro**

En el bloque `[data-theme="light"]` de TOKENS, reemplaza `  --muted:     #7a7a88;` por:

```css
  --muted:     #62626f; /* 5.52:1 sobre #f5f5f7 (el anterior, 3.88:1, no pasaba AA) */
```

- [ ] **Step 3: Agregar el foco visible**

Al final de `app/globals.css` (después de `.skip-link:focus { transform: none; }`), agrega:

```css

/* ─── FOCO VISIBLE ────────────────────────────────────────── */
/* Con el cursor propio, el teclado necesita su propio indicador. Sin border-radius:
   el contorno ya sigue la forma de cada elemento (forzarlo deformaría los botones redondos). */
:focus-visible {
  outline: 2px solid var(--accent2);
  outline-offset: 3px;
}
[data-theme="light"] :focus-visible { outline-color: var(--accent); }
```

- [ ] **Step 4: Verificar los contrastes con la fórmula WCAG**

Run:

```bash
python -c "
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda x: x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4
    r,g,b=map(f,c); return 0.2126*r+0.7152*g+0.0722*b
cr=lambda a,b: (max(L(a),L(b))+0.05)/(min(L(a),L(b))+0.05)
for fg,bg in [('#8792a8','#0b1220'),('#8792a8','#111a2e'),('#eef1f6','#0b1220'),('#62626f','#f5f5f7')]:
    print(fg,bg,round(cr(fg,bg),2))
"
```

Expected: `#8792a8 #0b1220 5.98`, `#8792a8 #111a2e 5.54`, `#eef1f6 #0b1220` ≥ 16, `#62626f #f5f5f7 5.52`. Todos ≥ 4.5.

- [ ] **Step 5: Pasar la imagen para redes al navy**

En `app/opengraph-image.tsx`:
- reemplaza `background: "linear-gradient(160deg, #0c0c0e 0%, #111114 60%, #16161a 100%)",` por `background: "linear-gradient(160deg, #0b1220 0%, #0e1628 60%, #111a2e 100%)",`
- reemplaza las dos apariciones de `color: "#f0f0f2",` por `color: "#eef1f6",`
- reemplaza `color: "#6b6b78",` por `color: "#8792a8",`

- [ ] **Step 6: Chequeo y capturas**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
Con el servidor arriba: `python .superpowers/shot.py / /proyectos /servicios --widths 1440 --out tokens`
Expected: el fondo es navy (`#0b1220`) en las tres capturas; los textos secundarios se leen bien.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/opengraph-image.tsx
git commit -m "feat(estilo): paleta navy con contraste AA y foco visible"
```

---

### Task 5: Fondo — resplandor + grano

**Files:**
- Create: `components/SiteBackdrop.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/hero/Hero.module.css:8`

- [ ] **Step 1: Tokens del resplandor**

En `app/globals.css`, dentro del bloque `:root` de TOKENS, después de la línea `  --transition: 300ms cubic-bezier(0.4,0,0.2,1);`, agrega:

```css
  --glow-a:    rgba(79,142,247,0.16);
  --glow-b:    rgba(126,179,255,0.08);
```

Y dentro del bloque `[data-theme="light"]` de TOKENS, después de `  --live:      #15803d;`, agrega:

```css
  --glow-a:    rgba(26,93,245,0.07);
  --glow-b:    rgba(58,123,255,0.04);
```

- [ ] **Step 2: Estilos de la capa de fondo**

En `app/globals.css`, justo antes de la línea `/* ─── SELECTION & SCROLLBAR ───────────────────────────────── */`, agrega:

```css
/* ─── FONDO: RESPLANDOR + GRANO (spec 2026-09-28) ────────── */
/* Capa fija detrás de todo el contenido. Lleva su propio --bg para que el grano
   (overlay) se mezcle con el fondo dentro de la capa y nunca toque el texto. */
.site-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--bg);
  transition: background-color var(--transition);
}
.site-backdrop-glow,
.site-backdrop-grain { position: absolute; inset: 0; }
.site-backdrop-glow {
  background:
    radial-gradient(900px 620px at 10% 6%, var(--glow-a), transparent 62%),
    radial-gradient(720px 520px at 94% 42%, var(--glow-b), transparent 62%);
}
/* Grano casi imperceptible: disimula las bandas de los degradados. Solo en oscuro. */
.site-backdrop-grain {
  opacity: 0.045;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
[data-theme="light"] .site-backdrop-grain { display: none; }
html[data-a11y-contrast="high"] .site-backdrop-glow,
html[data-a11y-contrast="high"] .site-backdrop-grain { display: none; }

```

- [ ] **Step 3: El componente**

Crea `components/SiteBackdrop.tsx`:

```tsx
/** Fondo decorativo fijo detrás de todo: resplandor navy + grano (ver globals.css). */
export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop-glow" />
      <div className="site-backdrop-grain" />
    </div>
  );
}
```

- [ ] **Step 4: Montarlo en el layout raíz**

En `app/layout.tsx`:
- agrega el import `import SiteBackdrop from "@/components/SiteBackdrop";` debajo de `import AccessibilityWidget from "@/components/AccessibilityWidget";`
- reemplaza `          <CustomCursor />` por:

```tsx
          <SiteBackdrop />
          <CustomCursor />
```

- [ ] **Step 5: El hero deja ver el resplandor**

En `components/hero/Hero.module.css`, dentro de `.hero { ... }`, reemplaza `  background: var(--bg);` por:

```css
  /* Transparente: detrás se ve el resplandor del sitio (SiteBackdrop). */
  background: transparent;
```

(El canvas de Three.js ya se crea con `alpha: true`, así que no tapa el fondo.)

- [ ] **Step 6: Chequeo y capturas**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
`python .superpowers/shot.py / /proyectos /servicios --widths 1440,390 --out fondo`
Expected: resplandor azul tenue arriba a la izquierda y a la derecha, también detrás del nombre del hero; el footer Cordilleras sigue igual. (El tema claro se verifica en la Tarea 15.)

- [ ] **Step 7: Commit**

```bash
git add components/SiteBackdrop.tsx app/globals.css app/layout.tsx components/hero/Hero.module.css
git commit -m "feat(estilo): resplandor navy y grano detrás del contenido"
```

---

### Task 6: Cursor — punto + resplandor etéreo

**Files:**
- Rewrite: `components/CustomCursor.tsx`
- Modify: `app/globals.css` (bloque `@media not ((hover: hover) and (pointer: fine))` de GLOBAL RESETS)

- [ ] **Step 1: Estilos del cursor**

En `app/globals.css`, reemplaza:

```css
@media not ((hover: hover) and (pointer: fine)) {
  .custom-cursor { display: none !important; }
}
```

por:

```css
@media not ((hover: hover) and (pointer: fine)) {
  .cursor-dot, .cursor-glow { display: none !important; }
}

/* ─── CURSOR: PUNTO + RESPLANDOR ETÉREO (J3) ──────────────── */
/* Invisibles hasta el primer movimiento del mouse (data-pointer lo pone CustomCursor). */
.cursor-dot, .cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
html[data-pointer="in"] .cursor-dot,
html[data-pointer="in"] .cursor-glow { opacity: 1; }
.cursor-dot {
  z-index: 99999;
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 50%;
  background: var(--accent2);
}
.cursor-glow {
  z-index: 99998;
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent2) 42%, transparent) 0%, color-mix(in srgb, var(--accent) 16%, transparent) 45%, transparent 70%);
  filter: blur(6px);
}
[data-theme="light"] .cursor-glow {
  background: radial-gradient(circle, rgba(26,93,245,0.22) 0%, rgba(26,93,245,0.08) 45%, transparent 70%);
}
/* Con el cursor grande del widget queda solo ese (antes se veían los dos). */
html[data-a11y-cursor="large"] .cursor-dot,
html[data-a11y-cursor="large"] .cursor-glow { display: none; }
```

- [ ] **Step 2: Reescribir el componente**

Reemplaza todo `components/CustomCursor.tsx` por:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motionReduced } from "@/lib/a11y";
import { INTERACTIVE_SELECTOR, approach, followFactor, glowScale } from "@/lib/cursor";

/**
 * Cursor propio: un punto pegado al mouse y un resplandor que lo sigue (lerp 0.22) y crece
 * sobre lo interactivo. Solo con mouse fino. Los interactivos se detectan por delegación en
 * cada movimiento, así funciona en cualquier página después de navegar.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;

    let mx = 0;
    let my = 0;
    let gx = 0;
    let gy = 0;
    let scale = 1;
    let hovering = false;
    let seen = false;
    let raf = 0;

    const tick = () => {
      const factor = followFactor(motionReduced(root, matchMedia));
      gx = approach(gx, mx, factor);
      gy = approach(gy, my, factor);
      scale = approach(scale, glowScale(hovering), factor === 1 ? 1 : 0.2);
      glow.style.transform = `translate(${gx}px, ${gy}px) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        // Primer movimiento: el resplandor arranca donde está el mouse, no en (0,0).
        seen = true;
        gx = mx;
        gy = my;
      }
      root.setAttribute("data-pointer", "in");
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      hovering = e.target instanceof Element && e.target.closest(INTERACTIVE_SELECTOR) !== null;
    };
    const onLeave = () => root.setAttribute("data-pointer", "out");

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
```

- [ ] **Step 3: Chequeo**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.

- [ ] **Step 4: Probar el cursor en el navegador**

Con el servidor arriba, crea y corre `.superpowers/check-cursor.py`:

```python
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
    pg.goto("http://localhost:3100/proyectos", wait_until="networkidle")
    pg.mouse.move(700, 600)
    pg.wait_for_timeout(300)
    print("data-pointer:", pg.evaluate("document.documentElement.dataset.pointer"))
    box = pg.locator("a[href='/servicios']").first.bounding_box()
    pg.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=5)
    pg.wait_for_timeout(700)
    t = pg.evaluate("document.querySelector('.cursor-glow').style.transform")
    s = float(re.search(r"scale\(([\d.]+)\)", t).group(1))
    print("escala sobre enlace:", round(s, 2))
    b.close()
```

Run: `python .superpowers/check-cursor.py`
Expected: `data-pointer: in` y `escala sobre enlace:` ≥ 1.35.

- [ ] **Step 5: Commit**

```bash
git add components/CustomCursor.tsx app/globals.css
git commit -m "feat(cursor): punto + resplandor etereo con deteccion por delegacion"
```

---

### Task 7: Iconos, botón circular, `ThemeToggle` y script de tema

**Files:**
- Create: `components/nav/icons.tsx`
- Create: `components/nav/IconButton.module.css`
- Create: `components/nav/ThemeToggle.tsx`
- Modify: `app/layout.tsx`
- Rewrite: `components/Navbar.tsx` (temporal: la Tarea 9 la borra)

- [ ] **Step 1: Iconos**

Crea `components/nav/icons.tsx`:

```tsx
export function SunIcon() {
  return (
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
  );
}

export function MoonIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
```

- [ ] **Step 2: Botón circular de 44px**

Crea `components/nav/IconButton.module.css`:

```css
/* Área táctil de 44px con un círculo visible de 36px (tema, GitHub). */
.btn {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--soft);
  transition: color var(--transition);
}
.btn::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid var(--border);
  border-radius: 50%;
  transition: border-color var(--transition);
}
.btn:hover { color: var(--text); }
.btn:hover::before { border-color: var(--accent); }
.btn svg { position: relative; }
```

- [ ] **Step 3: `ThemeToggle`**

Crea `components/nav/ThemeToggle.tsx`:

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { themeOf, type ThemeName } from "@/lib/a11y";
import { THEME_KEY, otherTheme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";
import styles from "./IconButton.module.css";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getSnapshot = (): ThemeName => themeOf(document.documentElement);
const getServerSnapshot = (): ThemeName => "dark";

/**
 * Botón de tema. La fuente de verdad es data-theme en <html> (lo aplica el script previo al
 * pintado): todas las instancias (barra, sidebar, menú móvil) quedan sincronizadas solas.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next = otherTheme(theme);

  const toggle = () => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Modo privado: el tema cambia igual, solo no se recuerda.
    }
    const live = document.getElementById("a11y-announcer");
    if (live) live.textContent = next === "light" ? "Tema claro activado" : "Tema oscuro activado";
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-label={next === "light" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

- [ ] **Step 4: Script de tema en el `<head>`**

En `app/layout.tsx`:
- agrega `import { THEME_PRE_PAINT_SCRIPT } from "@/lib/theme";` debajo de los otros imports.
- reemplaza `    <html lang="es" className="h-full" suppressHydrationWarning>` por:

```tsx
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado antes del primer pintado (sin parpadeo). Ver lib/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_PRE_PAINT_SCRIPT }} />
      </head>
```

- actualiza el comentario de `suppressHydrationWarning` para que diga: `// suppressHydrationWarning: los scripts previos al primer paint escriben data-theme (todas las páginas) y data-landing / data-gate / data-hero3d (home) en <html> antes de hidratar.`

- [ ] **Step 5: La navbar actual usa el nuevo botón (transición hasta la Tarea 9)**

Hoy `Navbar.tsx` pone `data-theme="dark"` al montar, lo que pisaría el tema guardado. Reemplaza todo `components/Navbar.tsx` por:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/nav/ThemeToggle";
import { NAV_LINKS, isActive } from "@/lib/nav";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
        <span className="logo-long">Portfolio </span>Misael
      </Link>

      <div className="navbar-links">
        {NAV_LINKS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} style={linkStyle(active)} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

- [ ] **Step 6: Chequeo y prueba del tema recordado**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
Con el servidor arriba, crea y corre `.superpowers/check-theme.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
    pg.goto("http://localhost:3100/proyectos", wait_until="networkidle")
    print("inicial:", pg.evaluate("document.documentElement.dataset.theme"))
    pg.locator("button[aria-label='Cambiar a tema claro']").first.click()
    print("tras clic:", pg.evaluate("document.documentElement.dataset.theme"), pg.evaluate("localStorage.getItem('theme')"))
    pg.goto("http://localhost:3100/servicios", wait_until="domcontentloaded")
    print("al cargar otra página (antes de hidratar):", pg.evaluate("document.documentElement.dataset.theme"))
    pg.evaluate("localStorage.removeItem('theme')")
    b.close()
```

Run: `python .superpowers/check-theme.py`
Expected: `inicial: dark`, `tras clic: light light`, `al cargar otra página (antes de hidratar): light`.

- [ ] **Step 7: Commit**

```bash
git add components/nav/icons.tsx components/nav/IconButton.module.css components/nav/ThemeToggle.tsx app/layout.tsx components/Navbar.tsx
git commit -m "feat(tema): boton de tema sincronizado y tema recordado sin parpadeo"
```

---

### Task 8: `SiteMark` y `TerminalPath`

**Files:**
- Create: `components/nav/SiteMark.tsx`, `components/nav/SiteMark.module.css`
- Create: `components/nav/TerminalPath.tsx`, `components/nav/TerminalPath.module.css`

- [ ] **Step 1: La marca**

Crea `components/nav/SiteMark.module.css`:

```css
.mark {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  min-height: 44px;
  font-family: var(--font-dm-serif), serif;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: var(--text);
}
.dot { color: var(--accent2); }
:global([data-theme="light"]) .dot { color: var(--accent); }
.sm { font-size: 1.45rem; }
.lg { font-size: clamp(2.6rem, 4vw, 3.4rem); }
```

Crea `components/nav/SiteMark.tsx`:

```tsx
import Link from "next/link";
import styles from "./SiteMark.module.css";

/**
 * "Misael." — la marca del sitio, enlaza al home. `site-mark` (global) la excluye del
 * resaltado de enlaces del AccessibilityWidget. `onClick` lo usa el menú móvil para cerrarse.
 */
export default function SiteMark({ size = "sm", onClick }: { size?: "sm" | "lg"; onClick?: () => void }) {
  return (
    <Link href="/" className={`site-mark ${styles.mark} ${styles[size]}`} onClick={onClick}>
      Misael<span className={styles.dot}>.</span>
    </Link>
  );
}
```

- [ ] **Step 2: La ruta tipo terminal**

Crea `components/nav/TerminalPath.module.css`:

```css
/* Decorativa: si no cabe, se corta con puntos suspensivos y nunca empuja a los enlaces. */
.path {
  display: block;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  padding-left: 0.9rem;
  border-left: 1px solid var(--border);
  font-family: var(--font-mono), monospace;
  font-size: 0.74rem;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--muted);
}
.path b { font-weight: 400; color: var(--accent2); }
.caret {
  display: inline-block;
  width: 0.5em;
  height: 1em;
  margin-left: 1px;
  vertical-align: -2px;
  background: var(--accent2);
  opacity: 0.8;
  animation: pathCaret 1s steps(1) infinite;
}
@keyframes pathCaret { 50% { opacity: 0; } }
:global([data-theme="light"]) .path b { color: var(--accent); }
:global([data-theme="light"]) .caret { background: var(--accent); }

@media (max-width: 767px) {
  .path { padding-left: 0.7rem; font-size: 0.7rem; }
}
```

Crea `components/nav/TerminalPath.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motionReduced } from "@/lib/a11y";
import { isHome, terminalPath } from "@/lib/nav";
import { sliceParts, totalLength, type TypedPart } from "@/lib/typing";
import styles from "./TerminalPath.module.css";

const CHAR_MS = 45;

/** "~/proyectos/medi-ia" junto a la marca. Decorativa: la ubicación la anuncia el enlace activo. */
export default function TerminalPath() {
  const pathname = usePathname();
  if (isHome(pathname)) return null;
  const { base, last } = terminalPath(pathname);
  // key: al cambiar de página se remonta y se vuelve a escribir desde cero.
  return <TypedPath key={pathname} parts={[{ text: base }, { text: last, strong: true }]} />;
}

function TypedPath({ parts }: { parts: TypedPart[] }) {
  const total = totalLength(parts);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Con movimiento reducido se escribe completa en el primer tic, sin letra por letra.
    const reduced = motionReduced(document.documentElement, matchMedia);
    let n = 0;
    const id = window.setInterval(
      () => {
        n = reduced ? total : n + 1;
        setShown(n);
        if (n >= total) window.clearInterval(id);
      },
      reduced ? 0 : CHAR_MS,
    );
    return () => window.clearInterval(id);
  }, [total]);

  return (
    <span className={styles.path} data-terminal-path="" aria-hidden="true">
      {sliceParts(parts, shown).map((p, i) => (p.strong ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
      <i className={styles.caret} />
    </span>
  );
}
```

- [ ] **Step 3: Chequeo**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores. (Todavía no se montan: se usan en las Tareas 9 y 11.)

- [ ] **Step 4: Commit**

```bash
git add components/nav/SiteMark.tsx components/nav/SiteMark.module.css components/nav/TerminalPath.tsx components/nav/TerminalPath.module.css
git commit -m "feat(nav): marca Misael. y ruta tipo terminal tipeada"
```

---

### Task 9: `MobileMenu` + `TopBar`, adiós a la navbar vieja

**Files:**
- Create: `components/nav/MobileMenu.tsx`, `components/nav/MobileMenu.module.css`
- Create: `components/nav/TopBar.tsx`, `components/nav/TopBar.module.css`
- Modify: `app/layout.tsx`
- Delete: `components/Navbar.tsx`
- Modify: `app/globals.css` (borrar NAVBAR, reglas de navbar en RESPONSIVE, selector de resaltado de enlaces)

- [ ] **Step 1: Estilos del menú móvil**

Crea `components/nav/MobileMenu.module.css`:

```css
.menu {
  position: fixed;
  inset: 0;
  z-index: 200; /* sobre la barra (100), bajo el AccessibilityWidget (9989+) */
  display: flex;
  flex-direction: column;
  padding: 0.7rem 1rem 2rem;
  background: color-mix(in srgb, var(--bg) 96%, transparent);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s;
}
.menu::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(600px 420px at 0% 0%, var(--glow-a), transparent 65%);
}
.menu[data-open] { opacity: 1; visibility: visible; }

.head { position: relative; display: flex; align-items: center; justify-content: space-between; }
.close {
  min-height: 44px;
  padding: 0 0.25rem;
  border: 0;
  background: none;
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  color: var(--soft);
}
.close:hover { color: var(--text); }

.list { position: relative; margin: auto 0; padding: 0; list-style: none; }
/* Cascada de 60ms (el CSS de movimiento reducido del sitio y del widget la anula). */
.list li { opacity: 0; transform: translateY(10px); transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.menu[data-open] .list li { opacity: 1; transform: none; }
.menu[data-open] .list li:nth-child(2) { transition-delay: 60ms; }
.menu[data-open] .list li:nth-child(3) { transition-delay: 120ms; }
.menu[data-open] .list li:nth-child(4) { transition-delay: 180ms; }
/* Con movimiento reducido el CSS del sitio acorta las transiciones, pero no los retrasos: sin cascada. */
@media (prefers-reduced-motion: reduce) {
  .menu[data-open] .list li { transition-delay: 0s !important; }
}
:global(html[data-a11y-motion="reduced"]) .menu[data-open] .list li { transition-delay: 0s !important; }
.link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-dm-serif), serif;
  font-size: 2.4rem;
  line-height: 1.1;
  color: var(--text);
}
.num { font-family: var(--font-mono), monospace; font-size: 0.72rem; color: var(--accent2); }
.link[aria-current="page"]::after {
  content: "";
  align-self: center;
  width: 7px;
  height: 7px;
  margin-left: auto;
  border-radius: 50%;
  background: var(--accent2);
}
:global([data-theme="light"]) .num { color: var(--accent); }
:global([data-theme="light"]) .link[aria-current="page"]::after { background: var(--accent); }

.foot { position: relative; display: flex; align-items: center; justify-content: space-between; }
.gh {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-mono), monospace;
  font-size: 0.75rem;
  color: var(--muted);
}
.gh:hover { color: var(--text); }
```

- [ ] **Step 2: El menú móvil**

Crea `components/nav/MobileMenu.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive } from "@/lib/nav";
import SiteMark from "./SiteMark";
import ThemeToggle from "./ThemeToggle";
import styles from "./MobileMenu.module.css";

const FOCUSABLE = "a[href], button:not([disabled])";

interface Props {
  id: string;
  open: boolean;
  /** Cerrar con "cerrar" o Esc: el foco vuelve al botón "menú". */
  onClose: () => void;
  /** Cerrar porque se eligió un enlace: el foco se queda en la página nueva. */
  onNavigate: () => void;
}

/** Menú a pantalla completa (< 768px). Diálogo modal: foco atrapado, Esc cierra, bloquea el scroll. */
export default function MobileMenu({ id, open, onClose, onNavigate }: Props) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.menu}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      data-open={open ? "" : undefined}
      inert={!open}
    >
      <div className={styles.head}>
        <SiteMark onClick={onNavigate} />
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          cerrar ✕
        </button>
      </div>
      <nav aria-label="Principal">
        <ol className={styles.list}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <li key={href}>
              <Link href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined} onClick={onNavigate}>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.foot}>
        <a className={styles.gh} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer">
          github.com/Milan32555<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
```

Nota: `sr-only` ya existe como utilidad de Tailwind (se usa en `layout.tsx` para el anunciador).

- [ ] **Step 3: Estilos de la barra**

Crea `components/nav/TopBar.module.css`:

```css
.bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem clamp(1rem, 3vw, 2.25rem);
  border-bottom: 1px solid transparent;
  transition: background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
}
.bar[data-scrolled] {
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom-color: var(--border);
}

.links { display: flex; flex-shrink: 0; align-items: center; gap: 2rem; margin-left: auto; }
.link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 0.86rem;
  color: var(--soft);
  transition: color var(--transition);
}
.link:hover,
.link[aria-current="page"] { color: var(--text); }
.link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.55rem;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.link:hover::after { transform: scaleX(0.35); }
.link[aria-current="page"]::after { transform: scaleX(1); }

.menuBtn {
  display: none;
  flex-shrink: 0;
  align-items: center;
  gap: 0.55rem;
  min-height: 44px;
  margin-left: auto;
  padding: 0 0.25rem;
  border: 0;
  background: none;
  font-family: var(--font-mono), monospace;
  font-size: 0.78rem;
  color: var(--soft);
}
.menuBtn:hover { color: var(--text); }
.bars { position: relative; width: 18px; height: 10px; }
.bars::before,
.bars::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1.5px;
  border-radius: 2px;
  background: currentColor;
}
.bars::before { top: 0; }
.bars::after { bottom: 0; left: 6px; }

@media (max-width: 767px) {
  .links { display: none; }
  .menuBtn { display: inline-flex; }
}
/* Desde 1024px las páginas internas usan el sidebar. */
@media (min-width: 1024px) {
  .bar[data-inner] { display: none; }
}
```

- [ ] **Step 4: La barra**

Crea `components/nav/TopBar.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive, isHome } from "@/lib/nav";
import MobileMenu from "./MobileMenu";
import SiteMark from "./SiteMark";
import TerminalPath from "./TerminalPath";
import ThemeToggle from "./ThemeToggle";
import styles from "./TopBar.module.css";

const MENU_ID = "menu-movil";

/**
 * Barra superior. En el home, siempre; en las páginas internas, solo bajo 1024px (arriba manda
 * el sidebar). Bajo 768px los enlaces pasan al menú a pantalla completa.
 */
export default function TopBar() {
  const pathname = usePathname();
  const home = isHome(pathname);
  const [scrolled, setScrolled] = useState(false);
  // El menú queda abierto solo para la ruta en la que se abrió: al navegar se cierra solo.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuFor(null);
    menuBtnRef.current?.focus();
  }, []);
  const leaveMenu = useCallback(() => setMenuFor(null), []);

  return (
    <>
      <header className={styles.bar} data-topbar="" data-scrolled={scrolled ? "" : undefined} data-inner={home ? undefined : ""}>
        <SiteMark />
        <TerminalPath />
        <nav className={styles.links} aria-label="Principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
        <button
          ref={menuBtnRef}
          type="button"
          className={styles.menuBtn}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => setMenuFor(pathname)}
        >
          <span className={styles.bars} aria-hidden="true" />
          menú
        </button>
      </header>
      {/* Fuera del <header>: su backdrop-filter atraparía a un hijo position: fixed. */}
      <MobileMenu id={MENU_ID} open={menuOpen} onClose={closeMenu} onNavigate={leaveMenu} />
    </>
  );
}
```

- [ ] **Step 5: Cambiar la navbar por la barra en el layout**

En `app/layout.tsx`:
- reemplaza `import Navbar from "@/components/Navbar";` por `import TopBar from "@/components/nav/TopBar";`
- reemplaza `          <Navbar />` por `          <TopBar />`

Luego borra la navbar vieja:

```bash
git rm components/Navbar.tsx
```

- [ ] **Step 6: Limpiar `globals.css`**

En `app/globals.css`:

1. Borra todo el bloque desde la línea `/* ─── NAVBAR ──────────────────────────────────────────────── */` hasta `.theme-toggle:hover { color: var(--text); border-color: var(--accent); }` inclusive (reglas `.navbar`, `.navbar-logo`, `.navbar-links`, `.theme-toggle`).
2. Reemplaza el bloque RESPONSIVE completo:

```css
/* ─── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .navbar { padding: 1rem 1.2rem; }
  .navbar-links { gap: 1.2rem; }
  .section { padding: 4rem 1rem; }
}
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

por:

```css
/* ─── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .section { padding: 4rem 1rem; }
}
```

3. En la regla de "Resaltar enlaces", reemplaza `:not(.navbar-logo)` por `:not(.site-mark)`.

- [ ] **Step 7: Comprobar que no queden restos**

Run: `grep -rn "navbar\|Navbar\|theme-toggle" app components lib`
Expected: sin resultados.

- [ ] **Step 8: Chequeo y capturas**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
`python .superpowers/shot.py / /proyectos/medi-ia --widths 1440,1000,390 --out barra`
Expected:
- 1440 `/`: "Misael." a la izquierda, 4 enlaces + tema a la derecha, sin ruta.
- 1440 `/proyectos/medi-ia`: todavía se ve la barra (el sidebar llega en la Tarea 11), con `~/proyectos/medi-ia` y "Proyectos" subrayado.
- 1000: igual que 1440.
- 390: marca + ruta + botón "menú"; sin enlaces en línea.

- [ ] **Step 9: Probar el menú móvil**

Crea y corre `.superpowers/check-menu.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    ctx.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
    pg = ctx.new_page()
    pg.goto("http://localhost:3100/proyectos", wait_until="networkidle")
    btn = pg.locator("button[aria-controls='menu-movil']")
    btn.click()
    pg.wait_for_timeout(500)
    print("abierto:", pg.evaluate("document.getElementById('menu-movil').hasAttribute('data-open')"))
    print("foco en cerrar:", "cerrar" in pg.evaluate("document.activeElement.textContent"))
    print("scroll bloqueado:", pg.evaluate("document.documentElement.style.overflow"))
    for _ in range(12):
        pg.keyboard.press("Tab")
    print("foco sigue dentro:", pg.evaluate("document.getElementById('menu-movil').contains(document.activeElement)"))
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(400)
    print("cerrado con Esc:", not pg.evaluate("document.getElementById('menu-movil').hasAttribute('data-open')"))
    print("foco volvió al botón:", pg.evaluate("document.activeElement.getAttribute('aria-controls')"))
    btn.click()
    pg.wait_for_timeout(400)
    pg.locator("#menu-movil a[href='/servicios']").click()
    pg.wait_for_url("**/servicios")
    pg.wait_for_timeout(400)
    print("cerrado al navegar:", not pg.evaluate("document.getElementById('menu-movil').hasAttribute('data-open')"))
    b.close()
```

Run: `python .superpowers/check-menu.py`
Expected: `abierto: True`, `foco en cerrar: True`, `scroll bloqueado: hidden`, `foco sigue dentro: True`, `cerrado con Esc: True`, `foco volvió al botón: menu-movil`, `cerrado al navegar: True`.
Captura del menú abierto para revisarla: agrega al script, después del primer `btn.click()`, `pg.screenshot(path=".superpowers/shots/nav/menu-390.png")` y mírala: enlaces grandes en serif con `01`–`04`, punto en "Proyectos".

- [ ] **Step 10: Commit**

```bash
git add components/nav/MobileMenu.tsx components/nav/MobileMenu.module.css components/nav/TopBar.tsx components/nav/TopBar.module.css app/layout.tsx app/globals.css
git commit -m "feat(nav): barra superior con ruta tipo terminal y menu movil a pantalla completa"
```

(`git rm` de la Tarea 9 Step 5 ya dejó el borrado de `components/Navbar.tsx` en el índice; entra en este commit.)

---

### Task 10: Hook `useScrollSpy` compartido

**Files:**
- Create: `components/servicios/useScrollSpy.ts`
- Modify: `components/servicios/Toc.tsx`

- [ ] **Step 1: El hook**

Crea `components/servicios/useScrollSpy.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { pickActive } from "@/lib/scrollSpy";

/** Línea de lectura: debajo de la barra fija (y del TOC sticky en móvil). */
export const SPY_OFFSET = 160;

/**
 * Id de la sección en la que va la lectura (ver pickActive). `ids` debe ser estable
 * (constante de módulo o memorizado): si cambia en cada render, se re-suscribe en cada render.
 */
export function useScrollSpy(ids: readonly string[], offset = SPY_OFFSET): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const tops = ids.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      setActive(pickActive(tops, offset, atBottom));
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
  }, [ids, offset]);

  return active;
}
```

- [ ] **Step 2: `Toc.tsx` usa el hook**

Reemplaza todo `components/servicios/Toc.tsx` por:

```tsx
"use client";

import { useMemo, useState } from "react";
import styles from "./Servicios.module.css";
import { useScrollSpy } from "./useScrollSpy";
import type { Section } from "@/lib/servicios";

export default function Toc({ sections, minutes }: { sections: readonly Section[]; minutes: number }) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useScrollSpy(ids);
  const [open, setOpen] = useState(false);

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

- [ ] **Step 3: Chequeo y regresión del índice**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
No uses el viejo `.superpowers/verify-servicios.py`: busca `.navbar` y el botón "Cambiar tema", que ya no existen desde la Tarea 9. Con el servidor arriba, crea y corre `.superpowers/check-toc.py`:

```python
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://localhost:3100/servicios", wait_until="networkidle")
    toc = pg.get_by_role("navigation", name="En esta página")
    print("secciones:", toc.get_by_role("link").count())
    print("al cargar:", pg.locator("[aria-current=location]").inner_text())
    toc.get_by_role("link", name=re.compile("Precios")).click()
    pg.wait_for_timeout(1800)
    print("tras clic:", pg.locator("[aria-current=location]").inner_text())
    b.close()
```

Run: `python .superpowers/check-toc.py`
Expected: `secciones: 6`, `al cargar:` termina en `Intro`, `tras clic:` termina en `Precios` (igual que antes del cambio).

- [ ] **Step 4: Commit**

```bash
git add components/servicios/useScrollSpy.ts components/servicios/Toc.tsx
git commit -m "refactor(servicios): scroll-spy del indice como hook reutilizable"
```

---

### Task 11: Sidebar, índice de `/servicios` y grupo de rutas `(internas)`

**Files:**
- Create: `components/nav/Sidebar.tsx`, `components/nav/Sidebar.module.css`, `components/nav/SidebarIndex.tsx`
- Create: `app/(internas)/layout.tsx`, `app/(internas)/layout.module.css`
- Move: `app/proyectos`, `app/servicios`, `app/sobre-mi`, `app/contacto` → `app/(internas)/`
- Modify: `components/servicios/Servicios.module.css`

- [ ] **Step 1: Estilos del sidebar**

Crea `components/nav/Sidebar.module.css`:

```css
.sidebar { display: none; }
@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
    height: 100vh;
    padding: 5.5rem 0 2.5rem;
    overflow-y: auto; /* por si la ventana es baja */
    scrollbar-width: none;
  }
}

.role { margin-top: 0.9rem; font-family: var(--font-mono), monospace; font-size: 0.78rem; color: var(--soft); }
.tagline { max-width: 30ch; margin-top: 1.1rem; font-size: 0.95rem; line-height: 1.65; color: var(--muted); }

.nav { margin: 3.2rem 0 0; padding: 0; list-style: none; }
.link {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 44px;
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color var(--transition);
}
.link::before {
  content: "";
  width: 32px;
  height: 1px;
  background: currentColor;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
}
.link:hover,
.link[aria-current="page"] { color: var(--text); }
.link:hover::before,
.link[aria-current="page"]::before { width: 64px; background: var(--text); }

/* Índice de /servicios, sangrado bajo la línea del ítem */
.index { margin: 0.2rem 0 0.6rem; padding: 0 0 0 48px; list-style: none; }
.indexLink {
  display: flex;
  gap: 0.7rem;
  padding: 0.32rem 0;
  font-size: 0.84rem;
  color: var(--muted);
  transition: color var(--transition);
}
.indexLink:hover,
.indexLink[aria-current="location"] { color: var(--text); }
.indexNum { padding-top: 0.12rem; font-family: var(--font-mono), monospace; font-size: 0.7rem; color: var(--accent2); }
:global([data-theme="light"]) .indexNum { color: var(--accent); }

.foot { display: flex; align-items: center; gap: 0.5rem; margin-left: -4px; }
```

- [ ] **Step 2: El índice de `/servicios`**

Crea `components/nav/SidebarIndex.tsx`:

```tsx
"use client";

import { useScrollSpy } from "@/components/servicios/useScrollSpy";
import { SECTIONS } from "@/lib/servicios";
import styles from "./Sidebar.module.css";

const IDS = SECTIONS.map((s) => s.id);

/** Índice de /servicios dentro del sidebar: marca la sección en la que va la lectura. */
export default function SidebarIndex() {
  const active = useScrollSpy(IDS);
  return (
    <ol className={styles.index} aria-label="En esta página">
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={styles.indexLink} aria-current={active === s.id ? "location" : undefined}>
            <span className={styles.indexNum} aria-hidden="true">
              {s.num}
            </span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 3: El sidebar**

Crea `components/nav/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActive } from "@/lib/nav";
import { GitHubIcon } from "./icons";
import iconStyles from "./IconButton.module.css";
import SidebarIndex from "./SidebarIndex";
import SiteMark from "./SiteMark";
import ThemeToggle from "./ThemeToggle";
import styles from "./Sidebar.module.css";

/** Columna fija de las páginas internas (desde 1024px). En /servicios despliega el índice bajo "Servicios". */
export default function Sidebar() {
  const pathname = usePathname();
  const onServicios = pathname === "/servicios";

  return (
    <div className={styles.sidebar} data-sidebar="">
      <div>
        <SiteMark size="lg" />
        <p className={styles.role}>{"// dev freelance · auditor de código"}</p>
        {!onServicios && (
          <p className={styles.tagline}>Construyo interfaces y reviso código ajeno buscando qué se rompe antes de que lo haga otro.</p>
        )}
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.link} aria-current={isActive(pathname, href) ? "page" : undefined}>
                  {label}
                </Link>
                {href === "/servicios" && onServicios && <SidebarIndex />}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.foot}>
        <a className={iconStyles.btn} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Misael (se abre en una pestaña nueva)">
          <GitHubIcon />
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Mover las páginas internas al grupo de rutas**

```bash
mkdir -p "app/(internas)"
git mv app/proyectos "app/(internas)/proyectos"
git mv app/servicios "app/(internas)/servicios"
git mv app/sobre-mi "app/(internas)/sobre-mi"
git mv app/contacto "app/(internas)/contacto"
rm -rf .next
```

(`rm -rf .next` borra los tipos generados que apuntan a las rutas viejas; si no, `tsc` falla. Detén el servidor antes y vuelve a arrancarlo después de este paso.)

- [ ] **Step 5: El layout de las páginas internas**

Crea `app/(internas)/layout.module.css`:

```css
/* Desde 1024px: sidebar de 280px + contenido. Debajo, solo el contenido (manda la barra superior). */
@media (min-width: 1024px) {
  .shell {
    --page-top: 5.5rem; /* alineado con la marca del sidebar */
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 3rem;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  /* .section trae padding lateral y centrado pensados para la barra superior:
     dentro de la columna, el aire lo da la rejilla y el contenido se alinea a la izquierda. */
  .content :global(.section) {
    margin-left: 0;
    padding: var(--page-top) 0 6rem;
  }
}
@media (min-width: 1280px) {
  .shell { gap: 4.5rem; padding: 0 3rem; }
}
```

Crea `app/(internas)/layout.tsx`:

```tsx
import Sidebar from "@/components/nav/Sidebar";
import styles from "./layout.module.css";

/** Páginas internas: sidebar + contenido desde 1024px (spec 2026-09-28). Las URLs no cambian. */
export default function InternasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: `/servicios` sin columna de TOC en escritorio**

En `components/servicios/Servicios.module.css`, justo antes de la línea `/* ─── Móvil: el TOC colapsa a "En esta página ▾" ───────── */`, agrega:

```css
/* ─── Escritorio con sidebar: el índice vive en el sidebar (spec 2026-09-28) ─── */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    max-width: none;
    margin: 0;
    padding: var(--page-top, 9rem) 0 6rem;
  }
  .toc { display: none; }
}

```

- [ ] **Step 7: Chequeo**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
Run: `npm run build`
Expected: compila; en la lista de rutas siguen apareciendo `/proyectos`, `/proyectos/[slug]`, `/servicios`, `/sobre-mi`, `/contacto` (el grupo `(internas)` no cambia las URLs).

- [ ] **Step 8: Capturas**

Arranca de nuevo el servidor de desarrollo y corre:
`python .superpowers/shot.py / /proyectos /proyectos/medi-ia /servicios /sobre-mi /contacto --widths 1440,1024,1000,390 --out sidebar`
Expected:
- 1440 y 1024, internas: sidebar a la izquierda ("Misael." grande, rol, frase, 4 enlaces con línea, GitHub + tema abajo), sin barra superior; el título de la página alineado a la altura de la marca.
- 1440 `/servicios`: bajo "SERVICIOS" las 6 secciones; sin la frase; el artículo en una sola columna.
- 1440 `/`: sin sidebar, barra superior como antes.
- 1000 y 390: sin sidebar, barra superior con la ruta.
- `/proyectos/medi-ia` a 1024: sin scroll horizontal (el Expediente puede verse apretado hasta la Tarea 12).

- [ ] **Step 9: Probar el índice del sidebar**

Crea y corre `.superpowers/check-sidebar.py`:

```python
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://localhost:3100/servicios", wait_until="networkidle")
    idx = pg.locator("[data-sidebar] ol[aria-label='En esta página']")
    print("secciones en el sidebar:", idx.locator("a").count())
    print("TOC del contenido oculto:", not pg.locator("main nav[aria-label='En esta página']").is_visible())
    idx.get_by_role("link", name=re.compile("Precios")).click()
    pg.wait_for_timeout(1500)
    print("activa tras clic:", idx.locator("[aria-current=location]").inner_text())
    print("activo en el nav:", pg.locator("[data-sidebar] a[aria-current=page]").inner_text())
    b.close()
```

Run: `python .superpowers/check-sidebar.py`
Expected: `secciones en el sidebar: 6`, `TOC del contenido oculto: True`, `activa tras clic:` termina en `Precios`, `activo en el nav: SERVICIOS`.

- [ ] **Step 10: Commit**

```bash
git add components/nav/Sidebar.tsx components/nav/Sidebar.module.css components/nav/SidebarIndex.tsx "app/(internas)" components/servicios/Servicios.module.css
git commit -m "feat(nav): sidebar en paginas internas con el indice de servicios"
```

(Los `git mv` del Step 4 ya están en el índice y entran en este commit.)

---

### Task 12: Container queries en los componentes de proyectos

**Files:**
- Modify: `components/proyectos/ProjectList.module.css`
- Modify: `components/proyectos/ArchitectureFlow.module.css`
- Modify: `components/proyectos/Expediente.module.css`, `components/proyectos/Expediente.tsx:47`

Los quiebres nuevos equivalen a los viejos: el ancho de ventana menos los 2×32px de padding de `.section` (700 → 636, 860 → 796, 900 → 836).

- [ ] **Step 1: `ProjectList`**

En `components/proyectos/ProjectList.module.css`:
- reemplaza `.rows { margin-top: 3.5rem; list-style: none; padding: 0; }` por:

```css
/* Contenedor: la lista se adapta al ancho de su columna (con sidebar es más angosta que la ventana). */
.rows { margin-top: 3.5rem; list-style: none; padding: 0; container-type: inline-size; }
```

- reemplaza `@media (max-width: 700px) {` por `@container (max-width: 636px) {`

- [ ] **Step 2: `ArchitectureFlow`**

En `components/proyectos/ArchitectureFlow.module.css`:
- reemplaza `.arch { margin-top: 4rem; }` por `.arch { margin-top: 4rem; container-type: inline-size; }`
- reemplaza `@media (max-width: 900px) {` por `@container (max-width: 836px) {`

- [ ] **Step 3: `Expediente`**

En `components/proyectos/Expediente.tsx`, envuelve la pila en un contenedor. Reemplaza el `return` completo del componente (desde `  return (` hasta el `}` final del archivo) por:

```tsx
  return (
    <div className={styles.frame}>
      <div className={styles.stack} role="group" aria-label={label}>
        {carpetas.map((c, i) => {
          const isOpen = open === i;
          return (
            <section key={c.id} className={styles.folder} style={{ "--i": i } as CSSProperties} data-open={isOpen}>
              <h3 className={styles.heading}>
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
              </h3>

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
    </div>
  );
}
```

(Es el mismo JSX de antes, con un `<div className={styles.frame}>` alrededor y dos espacios más de sangría.)

En `components/proyectos/Expediente.module.css`:
- al principio del archivo agrega:

```css
/* Contenedor: las pestañas escalonadas necesitan ~800px de columna, no de ventana. */
.frame { container-type: inline-size; }

```

- reemplaza `@media (max-width: 860px) {` por `@container (max-width: 796px) {`

- [ ] **Step 4: Chequeo y capturas**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
`python .superpowers/shot.py /proyectos /proyectos/medi-ia /proyectos/library-system --widths 1440,1024,768,390 --out cq`
Expected:
- 1440 `/proyectos/medi-ia`: el Expediente en carpetas escalonadas si la columna mide ≥ 797px (≈ 832px a 1440); la arquitectura en vertical (columna < 837px).
- 1024: Expediente como acordeón a ancho completo; lista de proyectos con portada arriba.
- 768 y 390: igual que antes de esta tarea.
- Ningún ancho con scroll horizontal ni pestañas cortadas.

- [ ] **Step 5: Commit**

```bash
git add components/proyectos/ProjectList.module.css components/proyectos/ArchitectureFlow.module.css components/proyectos/Expediente.module.css components/proyectos/Expediente.tsx
git commit -m "fix(proyectos): los componentes se adaptan al ancho de su columna"
```

---

### Task 13: Arreglos del home

**Files:**
- Modify: `components/home/Sections.tsx`
- Modify: `components/hero/Hero.module.css` (bloque `@media (max-width: 600px)`)

- [ ] **Step 1: Quitar la línea de stack de "Desarrollo"**

En `components/home/Sections.tsx`, borra la línea:

```tsx
            <div className={styles.mini}>React · Next.js · Vue · Node.js · Flutter</div>
```

(`styles.mini` sigue en uso en la tarjeta de Auditoría: no toques el CSS.)

- [ ] **Step 2: La línea `audit` no choca con el engranaje**

El engranaje mide 52px y está a 28px del borde derecho e inferior: ocupa los últimos 80px por la derecha. En `components/hero/Hero.module.css`, dentro de `@media (max-width: 600px)`, reemplaza:

```css
  .audit { left: 16px; right: 16px; bottom: 48px; transform: none; white-space: normal; text-align: center; font-size: 0.64rem; }
```

por:

```css
  /* Deja libres los 80px del engranaje de accesibilidad (52px + 28px de margen) más 8px de aire. */
  .audit { left: 16px; right: 88px; bottom: 48px; transform: none; white-space: normal; text-align: left; font-size: 0.64rem; }
```

- [ ] **Step 3: Chequeo y comprobación de la superposición**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores.
Crea y corre `.superpowers/check-audit.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for w in (360, 390, 430):
        ctx = b.new_context(viewport={"width": w, "height": 800}, is_mobile=True, has_touch=True)
        ctx.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
        pg = ctx.new_page()
        pg.goto("http://localhost:3100/", wait_until="networkidle")
        pg.wait_for_timeout(9000)
        a = pg.locator("[class*='audit']").first.bounding_box()
        g = pg.locator("button[aria-label='Opciones de accesibilidad']").bounding_box()
        overlap = not (a["x"] + a["width"] <= g["x"] or g["x"] + g["width"] <= a["x"] or a["y"] + a["height"] <= g["y"] or g["y"] + g["height"] <= a["y"])
        print(w, "se solapan:", overlap)
        pg.screenshot(path=f".superpowers/shots/nav/audit-{w}.png")
        ctx.close()
    b.close()
```

Run: `python .superpowers/check-audit.py`
Expected: `360 se solapan: False`, `390 se solapan: False`, `430 se solapan: False`.

- [ ] **Step 4: Commit**

```bash
git add components/home/Sections.tsx components/hero/Hero.module.css
git commit -m "fix(home): sin stack fijo en Desarrollo y linea audit libre del engranaje"
```

---

### Task 14 (opcional): "Misael." viaja de la barra al sidebar

Mejora progresiva. **Criterio de aborto:** si `tsc`, `lint` o `build` fallan por el flag experimental, si aparece cualquier error o advertencia de hidratación en la consola al navegar, o si la navegación se ve peor (parpadeos, saltos), revierte esta tarea (`git revert HEAD` si ya se commiteó, o `git checkout -- .` si no) y anótalo en el PR. Nada más depende de ella.

**Files:**
- Modify: `next.config.ts`
- Create: `react-canary.d.ts`
- Create: `components/nav/MarkTransition.tsx`
- Modify: `components/nav/TopBar.tsx`, `components/nav/Sidebar.tsx`, `app/globals.css`

- [ ] **Step 1: Activar las View Transitions de Next 16**

Reemplaza el objeto de `next.config.ts` por:

```ts
const nextConfig: NextConfig = {
  // Ancla la raíz del workspace a este proyecto: evita que Next.js confunda
  // la raíz cuando detecta un package-lock.json suelto en una carpeta padre.
  turbopack: {
    root: path.join(__dirname),
  },
  // <ViewTransition> de React: "Misael." viaja entre la barra y el sidebar (spec 2026-09-28).
  experimental: {
    viewTransition: true,
  },
};
```

- [ ] **Step 2: Tipos de `ViewTransition`**

Crea `react-canary.d.ts` en la raíz del repo:

```ts
// Tipos de <ViewTransition> (canal canary de React, que es el que usa el App Router de Next).
/// <reference types="react/canary" />
```

- [ ] **Step 3: El envoltorio**

Crea `components/nav/MarkTransition.tsx`:

```tsx
import { ViewTransition } from "react";

/** Mismo nombre en la barra (home) y en el sidebar (internas): React los empareja y el nombre viaja. */
export default function MarkTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition name="site-mark">{children}</ViewTransition>;
}
```

- [ ] **Step 4: Usarlo en la barra (solo en el home) y en el sidebar**

En `components/nav/TopBar.tsx`:
- agrega `import MarkTransition from "./MarkTransition";`
- reemplaza `        <SiteMark />` (el de dentro del `<header>`) por:

```tsx
        {home ? (
          <MarkTransition>
            <SiteMark />
          </MarkTransition>
        ) : (
          <SiteMark />
        )}
```

En `components/nav/Sidebar.tsx`:
- agrega `import MarkTransition from "./MarkTransition";`
- reemplaza `        <SiteMark size="lg" />` por:

```tsx
        <MarkTransition>
          <SiteMark size="lg" />
        </MarkTransition>
```

- [ ] **Step 5: Duración y movimiento reducido**

Al final de `app/globals.css` agrega:

```css

/* ─── TRANSICIÓN DEL NOMBRE (View Transitions) ────────────── */
::view-transition-group(site-mark) {
  animation-duration: 0.45s;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
html[data-a11y-motion="reduced"]::view-transition-group(*),
html[data-a11y-motion="reduced"]::view-transition-old(*),
html[data-a11y-motion="reduced"]::view-transition-new(*) { animation: none !important; }
```

- [ ] **Step 6: Chequeo**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: todo sin errores. Si algo falla por `ViewTransition` o el flag: aplica el criterio de aborto.

- [ ] **Step 7: Probarlo navegando**

Con el servidor arriba, crea y corre `.superpowers/check-vt.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
    logs = []
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: logs.append(f"pageerror: {e}"))
    pg.goto("http://localhost:3100/", wait_until="networkidle")
    pg.locator("[data-topbar] a[href='/proyectos']").click()
    pg.wait_for_timeout(200)
    pg.screenshot(path=".superpowers/shots/nav/vt-mitad.png")
    pg.wait_for_url("**/proyectos")
    pg.wait_for_timeout(800)
    pg.screenshot(path=".superpowers/shots/nav/vt-final.png")
    pg.locator("[data-sidebar] a[href='/']").first.click()
    pg.wait_for_url("http://localhost:3100/")
    pg.wait_for_timeout(800)
    print("errores/advertencias:", logs)
    b.close()
```

Run: `python .superpowers/check-vt.py`
Expected: `errores/advertencias: []`; en `vt-mitad.png` el nombre va a medio camino entre la barra y el sidebar; en `vt-final.png` el sidebar está completo. Si hay errores o advertencias: criterio de aborto.

- [ ] **Step 8: Commit**

```bash
git add next.config.ts react-canary.d.ts components/nav/MarkTransition.tsx components/nav/TopBar.tsx components/nav/Sidebar.tsx app/globals.css
git commit -m "feat(nav): el nombre viaja entre la barra y el sidebar con View Transitions"
```

---

### Task 15: Verificación completa y PR

**Files:**
- Create: `.superpowers/verify-navegacion.py` (gitignored)
- Create: `.superpowers/pr-navegacion.md` (gitignored)

- [ ] **Step 1: Build de producción y servidor**

Detén el servidor de desarrollo. Luego:
Run: `npm run build`
Expected: compila sin errores.
Arranca en segundo plano: `npx next start -p 3100` y espera el `200`.

- [ ] **Step 2: Script de verificación**

Crea `.superpowers/verify-navegacion.py`:

```python
"""Verificación de la navegación mixta (spec 2026-09-28 §6) contra `next start -p 3100`."""
import re
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
AXE = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
ROUTES = ["/", "/proyectos", "/proyectos/medi-ia", "/servicios", "/sobre-mi", "/contacto"]
fails = []


def check(cond, msg):
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)


def visible(pg, selector):
    return pg.evaluate(
        """s => { const e = document.querySelector(s); if (!e) return false;
        const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; }""",
        selector,
    )


def page_at(b, width, mobile=False):
    ctx = b.new_context(viewport={"width": width, "height": 844 if mobile else 900}, is_mobile=mobile, has_touch=mobile)
    ctx.add_init_script("try{sessionStorage.setItem('gateSeen','1')}catch(e){}")
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    return ctx, pg, errs


def no_hscroll(pg):
    return pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth")


def axe(pg, name):
    pg.add_script_tag(url=AXE)
    v = pg.evaluate("axe.run(document, {runOnly: ['wcag2a','wcag2aa']}).then(r => r.violations.map(v => v.id + ' x' + v.nodes.length))")
    check(v == [], f"axe {name}: {v}")


with sync_playwright() as p:
    b = p.chromium.launch()

    # 1. Escritorio 1440: barra solo en el home, sidebar en internas
    ctx, pg, errs = page_at(b, 1440)
    for r in ROUTES:
        pg.goto(BASE + r, wait_until="networkidle")
        home = r == "/"
        check(visible(pg, "[data-topbar]") == home, f"1440 {r}: barra {'visible' if home else 'oculta'}")
        check(visible(pg, "[data-sidebar]") == (not home), f"1440 {r}: sidebar {'ausente' if home else 'visible'}")
        check(no_hscroll(pg), f"1440 {r}: sin scroll horizontal")
        axe(pg, f"1440 {r}")
    pg.goto(BASE + "/proyectos/medi-ia", wait_until="networkidle")
    check(pg.locator("[data-sidebar] a[aria-current=page]").inner_text().strip().lower() == "proyectos", "detalle: 'Proyectos' activo en el sidebar")
    pg.goto(BASE + "/servicios", wait_until="networkidle")
    idx = pg.locator("[data-sidebar] ol[aria-label='En esta página']")
    check(idx.locator("a").count() == 6, "/servicios: 6 secciones en el sidebar")
    check(not visible(pg, "main nav[aria-label='En esta página']"), "/servicios: TOC del contenido oculto en escritorio")
    idx.get_by_role("link", name=re.compile("Precios")).click()
    pg.wait_for_timeout(1500)
    check(idx.locator("[aria-current=location]").inner_text().endswith("Precios"), "/servicios: el índice sigue la lectura")
    check(errs == [], f"1440 sin errores JS: {errs}")
    ctx.close()

    # 2. Cursor después de navegar en el cliente
    ctx, pg, errs = page_at(b, 1440)
    pg.goto(BASE + "/", wait_until="networkidle")
    pg.locator("[data-topbar] a[href='/proyectos']").click()
    pg.wait_for_url("**/proyectos")
    pg.wait_for_timeout(600)
    box = pg.locator("[data-sidebar] a[href='/servicios']").bounding_box()
    pg.mouse.move(box["x"] + 20, box["y"] + box["height"] / 2, steps=6)
    pg.wait_for_timeout(700)
    t = pg.evaluate("document.querySelector('.cursor-glow').style.transform")
    m = re.search(r"scale\(([\d.]+)\)", t)
    check(m is not None and float(m.group(1)) >= 1.35, f"el cursor crece sobre un enlace tras navegar ({t})")
    ctx.close()

    # 3. Tema recordado sin parpadeo
    ctx, pg, errs = page_at(b, 1440)
    pg.goto(BASE + "/proyectos", wait_until="networkidle")
    pg.locator("[data-sidebar] button[aria-label='Cambiar a tema claro']").click()
    check(pg.evaluate("document.documentElement.dataset.theme") == "light", "tema: cambia a claro")
    pg.goto(BASE + "/servicios", wait_until="domcontentloaded")
    check(pg.evaluate("document.documentElement.dataset.theme") == "light", "tema: claro desde el primer pintado en otra página")
    pg.wait_for_load_state("networkidle")
    pg.screenshot(path=".superpowers/shots/nav/final-claro-1440-servicios.png")
    axe(pg, "1440 /servicios claro")
    pg.evaluate("localStorage.removeItem('theme')")
    ctx.close()

    # 4. Tablet 1000: barra en todas, ruta tipo terminal, TOC del contenido
    ctx, pg, errs = page_at(b, 1000)
    for r, expected in [("/servicios", "~/servicios"), ("/proyectos/medi-ia", "~/proyectos/medi-ia")]:
        pg.goto(BASE + r, wait_until="networkidle")
        pg.wait_for_timeout(1500)
        check(visible(pg, "[data-topbar]") and not visible(pg, "[data-sidebar]"), f"1000 {r}: barra sí, sidebar no")
        check(pg.locator("[data-terminal-path]").inner_text().strip() == expected, f"1000 {r}: ruta '{expected}'")
        check(no_hscroll(pg), f"1000 {r}: sin scroll horizontal")
    pg.goto(BASE + "/servicios", wait_until="networkidle")
    check(visible(pg, "main nav[aria-label='En esta página']"), "1000 /servicios: TOC del contenido visible")
    ctx.close()

    # 5. Móvil 390: menú, sin scroll horizontal, axe
    ctx, pg, errs = page_at(b, 390, mobile=True)
    for r in ROUTES:
        pg.goto(BASE + r, wait_until="networkidle")
        check(no_hscroll(pg), f"390 {r}: sin scroll horizontal")
        axe(pg, f"390 {r}")
    pg.goto(BASE + "/proyectos", wait_until="networkidle")
    pg.locator("button[aria-controls='menu-movil']").click()
    pg.wait_for_timeout(500)
    check(pg.evaluate("document.getElementById('menu-movil').hasAttribute('data-open')"), "390: el menú abre")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(400)
    check(pg.evaluate("document.activeElement.getAttribute('aria-controls')") == "menu-movil", "390: Esc cierra y el foco vuelve")
    check(errs == [], f"390 sin errores JS: {errs}")
    ctx.close()

    # 6. 1024 y 768: sidebar desde 1024 solo en internas; sin scroll horizontal. Capturas en los 4 anchos.
    for w in (1440, 1024, 768, 390):
        ctx, pg, errs = page_at(b, w, mobile=w < 768)
        for r in ROUTES:
            pg.goto(BASE + r, wait_until="networkidle")
            if w in (1024, 768):
                expect_sidebar = w == 1024 and r != "/"
                check(visible(pg, "[data-sidebar]") == expect_sidebar, f"{w} {r}: sidebar {'visible' if expect_sidebar else 'oculto'}")
                check(no_hscroll(pg), f"{w} {r}: sin scroll horizontal")
            pg.evaluate("document.querySelectorAll('.fade-in-section').forEach(e => e.classList.add('visible'))")
            pg.wait_for_timeout(1200)
            pg.screenshot(path=f".superpowers/shots/nav/final-{w}-{(r.strip('/') or 'home').replace('/', '_')}.png")
        ctx.close()

    b.close()

print(f"\n{len(fails)} fallos")
sys.exit(1 if fails else 0)
```

- [ ] **Step 3: Correr la verificación**

Run: `python .superpowers/verify-navegacion.py`
Expected: todas las líneas en `OK` y `0 fallos`. Si algo falla, corrige en la tarea correspondiente, vuelve a construir y repite.

- [ ] **Step 4: Otras verificaciones**

- Footer: `python .superpowers/verify-footer.py` → todo `OK` (la unión con el footer cambió de color de fondo).
- Línea `audit`: `python .superpowers/check-audit.py` → `False` en los tres anchos.
- Revisa con Read las capturas `final-*.png`: sidebar alineado, nada cortado, la pestaña `EXP-00x` de `/proyectos` no forma una caja visible sobre el resplandor. Si la forma, en `components/proyectos/ProjectList.module.css` cambia `background: var(--bg);` de `.tab` por `background: transparent;`, reconstruye y vuelve a mirar.

- [ ] **Step 5: Lighthouse móvil (con la máquina tranquila)**

Para cada ruta de `/`, `/proyectos`, `/servicios`, `/sobre-mi`, `/contacto`:

```bash
npx lighthouse http://localhost:3100/proyectos --only-categories=performance,accessibility --quiet --chrome-flags="--headless=new" --output=json --output-path=.superpowers/lh-proyectos.json
python -c "import json;d=json.load(open('.superpowers/lh-proyectos.json'));print({k:round(v['score']*100) for k,v in d['categories'].items()})"
```

Expected: rendimiento sin bajar de lo de antes (home ≥ 73; las demás ≥ 92) y accesibilidad ≥ 96. Si una baja más de 3 puntos, repite la medición una vez (hay variación) antes de investigar.

- [ ] **Step 6: Detener el servidor y subir la rama**

Detén el servidor (ver Convenciones). Luego:

```bash
gh auth status
git push -u origin feat/navegacion-mixta
```

Expected: `gh auth status` muestra `Active account: true` para `Milan32555`. Si la cuenta activa es otra, corre `gh auth switch --user Milan32555` antes del push.

- [ ] **Step 7: Abrir el PR**

Crea `.superpowers/pr-navegacion.md`:

```markdown
## Qué cambia

Implementa el spec `docs/superpowers/specs/2026-09-28-navegacion-mixta-y-sistema-visual-design.md`.

- **Navegación mixta:** barra superior en el home; sidebar en las páginas internas desde 1024px, con el índice de `/servicios` dentro del sidebar. Bajo 1024px, barra con la ruta tipo terminal (`~/proyectos`); bajo 768px, menú a pantalla completa.
- **Paleta navy** con contraste AA (el gris secundario anterior no pasaba ni en oscuro ni en claro), resplandor de fondo y grano casi imperceptible (solo en oscuro).
- **Cursor:** punto + resplandor que crece sobre lo interactivo, también después de navegar.
- **Foco visible** para teclado y **tema recordado** sin parpadeo.
- Expediente, arquitectura y lista de proyectos se adaptan al ancho de su columna.
- Home: sin stack fijo en "Desarrollo"; la línea `audit` ya no queda bajo el botón de accesibilidad en móvil.

## Verificación

- `tsc`, `lint`, pruebas (`node --test`) y `build` en verde.
- Playwright: `verify-navegacion` (barra/sidebar por ancho, índice de servicios, menú móvil con Esc y foco, tema recordado, cursor tras navegar, sin scroll horizontal) y footer.
- axe: 0 violaciones en todas las rutas (1440 y 390, oscuro y claro en /servicios).
- Lighthouse móvil: (pegar aquí los números del Step 5).
```

Reemplaza la última línea con los números reales del Step 5 y, si la Tarea 14 se abortó, agrega una línea que lo diga y por qué. Luego:

```bash
gh pr create --repo Milan32555/portfolio-milan --base main --head feat/navegacion-mixta --title "feat: navegación mixta y sistema visual navy" --body-file .superpowers/pr-navegacion.md
```

Expected: imprime la URL del PR. **No lo fusiones:** Misael lo prueba en la preview de Vercel y en su teléfono, y lo fusiona él.
