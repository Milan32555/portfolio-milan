# Navegación mixta + sistema visual navy — spec de diseño

> Cierra lo que faltaba del spec maestro `2026-09-08-portfolio-redesign-design.md`: §1 Layout, §2 Fondo, §3 Cursor, Pendiente 5 (grano) y Pendiente 7 (correcciones sitewide). Aprobado por Misael el 2026-09-28 sobre el mockup `docs/superpowers/mockups/2026-09-28-navegacion-mixta.html`. La comparación de opciones que llevó a la decisión está en `docs/superpowers/mockups/2026-09-28-navegacion-opciones-abc.html`.
>
> **Reemplaza la decisión del 8-sep de "sidebar fijo en todo el sitio"** y la del spec de `/servicios` (17-sep) de que "el TOC reemplaza al sidebar".

## Por qué cambió la decisión del 8-sep

El sidebar se decidió cuando el sitio era de una sola página y no tenía hero. Después se construyeron tres piezas a ancho completo (hero "nombre hecho de código", muro de código, footer Cordilleras). Con un sidebar en todas las páginas el hero se encoge a una columna, "Misael." aparece dos veces y en `/servicios` el índice dejaba la página sin menú.

Se compararon tres opciones en un mockup (A: barra en todo el sitio; B: mixta; C: sidebar en todo el sitio). **Misael eligió B: barra en el home, sidebar en las páginas internas.**

## 1. Navegación

### Home (`/`) — barra superior

- Izquierda: marca **"Misael."** (DM Serif Display, el punto en `--accent2`). Reemplaza al texto actual "Portfolio Misael".
- Derecha: Proyectos · Servicios · Sobre mí · Contacto (mismo orden de hoy) + botón de tema.
- Transparente sobre el hero; al bajar más de 40px, fondo `--bg` al 78% con `backdrop-filter: blur(16px)` y borde inferior `--border` (el comportamiento actual).
- Enlace activo: línea de 1px en `--accent` que crece de izquierda a derecha; en hover, la línea asoma al 35%.
- El hero, el muro y el footer se quedan a ancho completo, sin cambios de composición.

### Páginas internas en escritorio (≥ 1024px) — sidebar

Aplica a `/proyectos`, `/proyectos/[slug]`, `/servicios`, `/sobre-mi` y `/contacto`.

- **Rejilla:** sidebar de `280px` + contenido `minmax(0, 1fr)`, `max-width: 1280px` centrada. Entre 1024 y 1279px: `gap: 3rem`, padding lateral `2rem`. Desde 1280px: `gap: 4.5rem`, padding lateral `3rem`. A 1440px el contenido mide unos 830px; a 1024px, unos 630px.
- **Sidebar:** `position: sticky; top: 0; height: 100vh`, padding `5.5rem 0 2.5rem`, `overflow-y: auto` por si la ventana es baja. Contenido, de arriba abajo:
  1. "Misael." grande (`clamp(2.6rem, 4vw, 3.4rem)`), enlace al home.
  2. Rol en mono: `// dev freelance · auditor de código`.
  3. Frase: "Construyo interfaces y reviso código ajeno buscando qué se rompe antes de que lo haga otro." (`--muted`, máx. 30ch).
  4. Nav vertical: mayúsculas pequeñas con tracking, cada ítem precedido por una línea de 32px que crece a 64px en el activo y en hover (patrón de Brittany Chiang).
  5. Abajo: icono de GitHub + botón de tema.
- Sin línea divisora entre sidebar y contenido (decisión del 8-sep que se mantiene).
- En la ruta `/proyectos/[slug]` el activo es "Proyectos".
- La barra superior **no se muestra** en estas páginas a partir de 1024px.

### `/servicios` — el índice vive dentro del sidebar

- En escritorio, el ítem "Servicios" del sidebar se despliega con las 6 secciones (número en mono + título), sangradas bajo la línea del ítem. La sección visible se marca con `aria-current="location"` (scroll-spy), igual que el TOC actual.
- La columna del TOC dentro del contenido **desaparece en escritorio** (el artículo queda en una sola columna). Entre 768 y 1023px se mantiene el TOC actual; en móvil, el botón "En esta página ▾" actual.
- En `/servicios` la frase del sidebar (punto 3) se oculta para dar espacio al índice.
- El cálculo del scroll-spy se comparte entre el TOC y el índice del sidebar (sale de `Toc.tsx` a un hook; la lógica pura `pickActive` de `lib/scrollSpy.ts` no cambia).

### Tablet (768–1023px)

- Todas las páginas usan la barra superior con los enlaces en línea.
- En páginas internas, junto a la marca aparece la **ruta tipo terminal**: `~/proyectos`, `~/proyectos/medi-ia`, `~/servicios`… (mono `0.74rem`, `--muted`, el segmento final en `--accent2`, separada de la marca por un borde izquierdo de 1px). Al cambiar de página se escribe letra por letra (45ms por carácter) con un cursor de bloque que parpadea. En el home no se muestra.
- La ruta es decorativa (`aria-hidden="true"`): la ubicación ya la anuncia el enlace activo. Si no cabe, se corta con puntos suspensivos; nunca empuja a los enlaces.

### Móvil (< 768px)

- Barra: marca + ruta (internas) + botón **"menú"** (mono, dos líneas de hamburguesa, área táctil ≥ 44px, `aria-expanded`, `aria-controls`).
- El menú se abre a **pantalla completa**: fondo `--bg` al 96% con blur y el resplandor arriba a la izquierda; los 4 enlaces grandes en DM Serif (`2.4rem`) con su número en mono (`01`–`04`) y un punto en `--accent2` en la página actual; abajo, `github.com/Milan32555` y el botón de tema. Botón "cerrar ✕" arriba.
- Los enlaces entran en cascada (60ms entre uno y otro, `translateY(10px)` → 0 + fundido).
- `role="dialog"` + `aria-modal="true"`, foco atrapado dentro, **Esc** cierra, el foco vuelve al botón "menú", el scroll de la página se bloquea mientras está abierto y el menú se cierra al navegar.

### Transición del nombre (mejora progresiva)

Al pasar del home a una página interna en escritorio, "Misael." viaja de la barra al sidebar (y al revés) con View Transitions (`view-transition-name: site-mark`, ~450ms). Se implementa con el soporte de Next 16 (`experimental.viewTransition` + `<ViewTransition>` de React). **Es opcional:** si el flag experimental da problemas de build, hidratación o rendimiento, se omite y el cambio es directo; nada más depende de esto. Sin soporte del navegador o con movimiento reducido: cambio directo.

### Footer

Las Cordilleras siguen a todo el ancho, debajo de todo, en todas las páginas. El sidebar es sticky dentro de la rejilla de la página, así que al llegar al footer se va con el contenido.

## 2. Sistema visual

### Tokens

**Oscuro (navy)** — reemplaza a `#0c0c0e`:

| Token | Antes | Ahora | Contraste sobre `--bg` |
|---|---|---|---|
| `--bg` | `#0c0c0e` | `#0b1220` | — |
| `--bg2` | `#111114` | `#0e1628` | — |
| `--surface` | `#16161a` | `#111a2e` | — |
| `--border` | `rgba(255,255,255,.07)` | `rgba(148,170,210,.10)` | — |
| `--text` | `#f0f0f2` | `#eef1f6` | ≈16:1 |
| `--muted` | `#6b6b78` (3.57:1 sobre navy, **falla AA**) | `#8792a8` | 5.98:1 (5.54:1 sobre `--surface`) |
| `--accent` / `--accent2` / `--live` | sin cambios | sin cambios | 5.84 / 8.72 / 9.79 |

**Claro:** se queda con sus grises actuales, salvo `--muted`: `#7a7a88` (3.88:1, **falla AA hoy**) → `#62626f` (5.52:1 sobre `#f5f5f7`).

Los modos de alto contraste del AccessibilityWidget no cambian (sus valores tienen `!important` y ganan).

### Fondo: resplandor + grano

- Una capa decorativa fija detrás de todo el contenido (`aria-hidden`, `pointer-events: none`, `z-index` por debajo del contenido) con:
  - **Resplandor:** `radial-gradient(900px 620px at 10% 6%, rgba(79,142,247,.16), transparent 62%)` + `radial-gradient(720px 520px at 94% 42%, rgba(126,179,255,.08), transparent 62%)`. En claro: las mismas manchas a `.07` y `.04` con `#1a5df5` / `#3a7bff`.
  - **Grano: sí**, solo en oscuro. Ruido SVG (`feTurbulence`, `baseFrequency .85`, 2 octavas, desaturado) en mosaico de 180px, `opacity: .045`, `mix-blend-mode: overlay`. Va **detrás** del contenido, así que no toca el texto. Además de la tendencia documentada en la investigación, disimula las bandas de color de los degradados del resplandor. Esto cierra el Pendiente 5 del spec maestro.
- Con `data-a11y-contrast="high"`: sin resplandor ni grano.
- El hero deja de pintar su propio fondo opaco (`background: var(--bg)` → transparente) para que el resplandor del sitio se vea detrás del nombre, como en el mockup; conserva su glow central.

### Cursor: punto + "resplandor etéreo"

Reescritura de `CustomCursor.tsx` (el anillo desaparece por completo):

- **Punto** de 5px en `--accent2`, pegado al mouse (se mantiene para poder apuntar con precisión; un halo borroso solo no basta).
- **Resplandor** de 60px: `radial-gradient` de `--accent2` 42% → `--accent` 16% → transparente, `filter: blur(6px)`. Sigue al mouse con lerp **0.22** (J3) y escala a **1.4×** sobre elementos interactivos (`a, button, input, select, textarea, summary, [data-cursor]`).
- La detección de interactivos es **por delegación** (`closest()` sobre el objetivo del evento), no con listeners enganchados al montar. Hoy, tras navegar, los enlaces nuevos no agrandan el cursor; con delegación funciona en cualquier página.
- Solo se monta con `(hover: hover) and (pointer: fine)` (como hoy). Invisible hasta el primer movimiento (no queda pegado en 0,0) y se oculta cuando el puntero sale de la ventana.
- Movimiento reducido (sistema **o** `data-a11y-motion="reduced"`): sin lerp ni animación de escala.
- Con `data-a11y-cursor="large"`: el cursor propio se oculta y queda solo el cursor grande del widget (hoy se ven los dos a la vez).

### Foco visible

`:focus-visible { outline: 2px solid var(--accent2); outline-offset: 3px; border-radius: 6px; }` en `globals.css`, para todo el sitio. Con el cursor oculto, el teclado necesita su propio indicador. Los componentes que ya definen un foco propio lo conservan.

## 3. Arreglos incluidos

1. **Componentes que miden su columna:** `Expediente` (quiebre a 860px), `ArchitectureFlow` (900px) y `ProjectList` (700px) pasan de media queries de ventana a **container queries** sobre su contenedor. Con el sidebar, a 1440px la columna mide unos 830px y hoy usarían su diseño ancho.
2. **Tema que se recuerda:** hoy `Navbar.tsx` guarda el tema en estado de React y vuelve a oscuro en cada carga. Con dos botones de tema (barra y sidebar) hay una sola fuente de verdad: el atributo `data-theme` de `<html>`. La elección se guarda en `localStorage` y un script inline en el `<head>` del layout raíz la aplica **antes del primer pintado** (sin parpadeo). Por defecto: oscuro. El script es ES5 y no puede romper la carga (mismo criterio que `lib/prePaint.ts`).
3. **Tarjeta "Desarrollo" del home:** se quita la línea `React · Next.js · Vue · Node.js · Flutter`, igual que en `/servicios` (PR #16: el stack depende de cada proyecto).
4. **Línea `$ audit ./misael` en móvil:** hoy el botón de accesibilidad tapa el final de "4 hallazgos corregidos". Se reubica para que no se solape con el engranaje entre 360 y 430px de ancho (verificado con captura).
5. **Imagen para redes (`app/opengraph-image.tsx`):** pasa del degradado negro viejo al navy nuevo y `--muted` nuevo.
6. **Espacio superior de las páginas internas:** hoy cada página reserva `9rem` arriba para la navbar fija (`/servicios` en móvil usa `5.5rem`). Pasa a una variable compartida (`--page-top`): con barra superior se mantienen esos mismos valores; en escritorio con sidebar vale `5.5rem`, alineado con la marca del sidebar.

## 4. Arquitectura

- **Grupo de rutas `app/(internas)/`** con su `layout.tsx`: la rejilla del sidebar + `<Sidebar />`. Se mueven ahí `proyectos/`, `servicios/`, `sobre-mi/` y `contacto/` (las URLs no cambian). `app/page.tsx` (home), `app/api/`, `opengraph-image`, `robots` y `sitemap` se quedan en la raíz.
- **Layout raíz:** script de tema en `<head>`, capa de fondo, `<TopBar />`, `children`, `<Footer />`, `<AccessibilityWidget />`, `<CustomCursor />`. `<TopBar />` se oculta desde 1024px cuando la ruta no es `/`.
- **Componentes nuevos** en `components/nav/`:
  - `TopBar.tsx`: marca, ruta tipo terminal, enlaces, tema y botón de menú.
  - `MobileMenu.tsx`: el diálogo a pantalla completa.
  - `Sidebar.tsx`: la columna de las páginas internas, con el índice de `/servicios`.
  - `ThemeToggle.tsx`: lee y escribe `data-theme` y `localStorage`; las instancias se mantienen sincronizadas.
- **Se borra** `components/Navbar.tsx` y sus reglas `.navbar*` / `.theme-toggle` de `globals.css`.
- **Lógica pura y probada en `lib/`** (con `node --test`, como el resto):
  - `lib/nav.ts`: la lista de enlaces, `isActive(pathname, href)` y `terminalPath(pathname)` (`/` → `~`, `/proyectos/medi-ia` → `~/proyectos/medi-ia`).
  - `lib/theme.ts`: la clave de `localStorage`, la validación del valor guardado y el script previo al pintado.
- **Landmarks:** la barra y el sidebar usan `<nav aria-label="Principal">`, y solo uno está visible a la vez (el otro con `display: none`, fuera del árbol de accesibilidad). El índice del sidebar usa `aria-label="En esta página"`. El skip link sigue saltando a `#main-content`.

## 5. Movimiento y accesibilidad

Con movimiento reducido (sistema **o** widget):

- la ruta aparece completa, sin tipeo;
- no hay transición del nombre;
- el cursor va sin lerp;
- el menú móvil aparece sin cascada.

Áreas táctiles ≥ 44px en menú, tema y GitHub. Contrastes de la tabla de tokens verificados con la fórmula WCAG.

## 6. Verificación

- **Pruebas unitarias:** `lib/nav.ts` (activo por ruta, ruta tipo terminal incluyendo slugs y la raíz) y `lib/theme.ts` (sin valor guardado → oscuro; valor inválido → oscuro; `localStorage` que lanza error → oscuro sin romper).
- **Playwright** a 1440, 1024, 1000, 768 y 390px en todas las rutas:
  - sidebar solo en internas desde 1024px;
  - barra oculta en internas desde 1024px;
  - el índice de `/servicios` marca la sección correcta al bajar;
  - menú móvil: abre, Esc cierra y el foco vuelve;
  - el tema elegido sobrevive a una recarga sin parpadeo;
  - sin scroll horizontal en ninguna página (en especial `/proyectos/[slug]` a 1024px);
  - la línea `audit` no choca con el engranaje a 390px;
  - el cursor crece sobre un enlace después de navegar.
- **axe:** 0 violaciones en todas las rutas.
- **Lighthouse móvil:** no bajar de lo actual (home 73; `/sobre-mi`, `/contacto`, `/proyectos`, `/servicios` ≥ 92).
- **Footer:** volver a correr `.superpowers/verify-footer.py` por el cambio de fondo en la unión con el footer.

## 7. Fuera de alcance

- **`/contacto` con formulario "mad-libs"** (diseñado y aprobado el 8-sep, §7 del spec maestro, nunca implementado): va en su propio spec y plan, justo después de este. Aquí `/contacto` solo recibe el sidebar y los tokens nuevos.
- **Cascada del loader** (§5 del spec maestro): ya no aplica; el muro de código le pasa el turno al hero directamente. La única cascada nueva es la del menú móvil.
- Transiciones de página completas (más allá del nombre).
