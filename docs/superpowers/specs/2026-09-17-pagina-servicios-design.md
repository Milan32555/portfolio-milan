# /servicios — spec de diseño

> Retoma el pendiente #1 de `2026-09-08-portfolio-redesign-design.md`. Ver también `docs/superpowers/research/2026-09-17-investigacion-mejores-portfolios.md` (5 pasadas de investigación: dev/seguridad, todas las categorías, GitHub/código, reclutadores/clientes, mobile/accesibilidad) — este spec incorpora lo aplicable a `/servicios`; el resto queda anotado ahí para cuando se diseñen el Loader (Three.js), `/proyectos`, `/sobre-mi` y el home.

## Layout: TOC reemplaza al sidebar (no conviven)

En `/servicios`, el sidebar de navegación general (mark + nav + sociales) **desaparece por completo** mientras se lee el artículo. En su lugar, la misma columna izquierda muestra un **TOC puro**: solo el índice de secciones, sin mark ni link de "volver". La salida de la página es natural, no un breadcrumb: al llegar al final del artículo aparece el footer del sitio (con el CTA "Hablemos →" a `/contacto`), o el usuario usa el botón atrás del navegador.

Decisión explícita (se evaluaron variantes con mark clickeable y sin él): **sin ninguna marca**, TOC 100% limpio.

**Tiempo de lectura**: vive dentro del panel del TOC, como texto pequeño y sutil arriba de la lista de secciones — no junto al título del artículo. Refuerza que el TOC es "el mapa completo de la lectura" (índice + duración) y deja el título limpio.

### Mobile (`< 768px`)
La columna fija no cabe. El TOC colapsa a un botón **"En esta página ▾"** que despliega la lista al tocarlo, en vez de una columna lateral permanente.

## Estructura del artículo

Orden de secciones (y del TOC):

1. **Intro** — hook personal, tono honesto: no es una fábrica de sitios genéricos ni una lista de precios cerrada para todo; se entiende el problema antes de proponer una solución.
2. **Desarrollo** — 4 líneas de trabajo: Sitios y landing pages · Apps web full-stack · Apps móviles · Sistemas empresariales.
3. **Auditoría de código** — en qué consiste, para quién tiene sentido. (No se ofrece pentesting todavía — se dice explícitamente si surge la pregunta, no se oculta ni se infla.)
4. **Cómo trabajo** — proceso (ver detalle abajo).
5. **Precios** — texto honesto, sin tabla ni montos (ver detalle abajo).
6. **Preguntas frecuentes** — acordeón (ver detalle abajo).
7. Cierre natural en el **footer del sitio** (capas + mark + CTA "Hablemos →").

## Sección "Cómo trabajo"

**Para proyectos de desarrollo:**
1. Contacto y diagnóstico — charla corta o intercambio escrito para entender el problema real, no solo lo pedido al inicio.
2. Propuesta y cotización — alcance por escrito, precio cerrado (sitios) o cotización a medida, tiempos estimados.
3. Anticipo y arranque — adelanto para reservar el cupo.
4. Desarrollo con checkpoints — avances visibles en staging, no entrega ciega; 1 ronda de ajustes incluida.
5. Entrega y capacitación — guía corta de uso/actualización.
6. Soporte posterior — ventana corta post-entrega para bugs; mantenimiento continuo es un servicio aparte.

**Para auditoría de código** (más corto): acceso al repo y alcance → revisión → informe con hallazgos priorizados (crítico vs. nice-to-have) → sesión de revisión de resultados.

**Mejora de credibilidad (de la investigación, pasada 1 y 4)**: cuando exista un caso real, insertar una mención breve de problema→enfoque→resultado en vez de solo listar el proceso en abstracto. Por ahora el proceso queda en abstracto — se suma contenido real más adelante sin cambiar la estructura.

## Sección "Precios"

Texto puro, **sin tabla ni montos**, aplicado por igual a todos los servicios (no solo a los más complejos). Explica que se cotiza después de conocer la necesidad real del cliente — no por elegir de una lista, sino por entender el problema primero.

> Nota interna (no publicar en el sitio): existen 3 planes de referencia en COP para sitios/landing pages (Esencial $1.500.000 / Profesional $2.500.000 / Sitio+Tienda $3.800.000) que Misael usa **después** de que el cliente escribe su necesidad por `/contacto` — no se muestran en `/servicios`.

## Sección "Preguntas frecuentes"

Formato **acordeón** (clic para expandir/colapsar, transición suave de `max-height`). 5 preguntas, en este orden:

1. ¿Cuánto cuesta?
2. ¿Cuánto tarda un proyecto típico?
3. ¿Trabajás solo o con un equipo?
4. ¿Hacés mantenimiento después de la entrega?
5. ¿Qué necesitás de mí para arrancar?

## Tratamiento visual — por qué no se siente "plano"

Decisiones de pulido visual, validadas contra mockups y contra la investigación (ver research doc):

- **Numeración editorial** ("02", "06") en `DM Serif Display`, grande y en `--accent2`, junto al título de cada sección — sensación de artículo de revista bien estructurado.
- **Filas de servicio interactivas**: hover con lift sutil (`translateX(2px)`) + fondo tenue (`rgba(79,142,247,0.07)`) + flecha (`→`) que aparece desde la izquierda. En touch (sin hover), la flecha queda **siempre visible** o se activa con `:active` — nunca oculta esperando un hover que no va a ocurrir.
- **Divisores en capas** entre secciones grandes: 2 formas SVG superpuestas en tonos navy (`#0f1830`, `#0b1220`), mismo lenguaje visual del footer del sitio pero en miniatura (~46px de alto). Da cohesión y resuelve la idea de "por capas" sin necesidad de 3D.
- **Scroll-reveal por sección**: fade + `translateY(10px)→0` al entrar en viewport, mismo timing que el stagger del loader (~90ms entre elementos) y la misma curva de easing que el cursor (`cubic-bezier(0.4,0,0.2,1)`).
- **FAQ acordeón**: transición suave de expansión, ícono `+` que rota a `×` (45°) al abrir.

**Explícitamente descartado para esta página**: Three.js / escenas 3D. Se decidió que si se implementa, va en el Loader (`components/Loader.tsx`), como tema de brainstorming aparte — no reabrir acá.

## Implementación — notas técnicas (informadas por investigación de código real en GitHub)

- **Framer Motion** para scroll-reveal y transición del acordeón — es la librería que aparece en el 100% de los repos de portfolio Next.js/React mejor valorados revisados, con mejor curva de aprendizaje que GSAP y sin fricción con Next.js 16 / React 19 ya en uso.
- **Contenido en datos, no hardcodeado**: servicios, pasos del proceso y preguntas del FAQ como arrays/objetos TypeScript separados del componente — facilita iterar el copy sin tocar el layout (patrón confirmado en el repo más "reusable" investigado).
- Reusar `app/api/contact/route.ts` (Resend) sin cambios — no aplica a `/servicios` directamente (esa página no tiene formulario), pero el CTA final del footer enlaza a `/contacto`, que sí lo usa.

## Accesibilidad específica de esta página

- El TOC es `<nav aria-label="En esta página">` con una lista simple de `<a>` — no es un widget compuesto, `Tab`/`Shift+Tab` normal alcanza (no hace falta roving tabindex ni flechas de teclado).
- El link de la sección activa (scroll-spy) usa `aria-current="location"` — no `aria-current="true"` — porque semánticamente indica "tu ubicación actual dentro de la página".
- Si el scroll-reveal se implementa con Framer Motion, verificar que respete `prefers-reduced-motion` (Framer Motion lo soporta vía `useReducedMotion()`); si en algún punto se escribe una animación a mano con `requestAnimationFrame`, debe chequear `matchMedia('(prefers-reduced-motion: reduce)')` explícitamente — el `prefers-reduced-motion` a nivel CSS del proyecto **no cubre animaciones JS puras** (ver hallazgo de la Pasada 5 de investigación, que aplica hoy mismo a `CustomCursor.tsx`).

## Correcciones sitewide encontradas durante la investigación (no exclusivas de `/servicios`, anotar para la implementación general del rediseño)

Estas no son decisiones de `/servicios`, pero se descubrieron mientras se investigaba para esta página y afectan secciones ya cerradas del spec maestro (`2026-09-08-portfolio-redesign-design.md`), así que quedan registradas acá para que no se pierdan:

1. **Contraste de `--muted` falla AA en el tema navy nuevo**: `#6b6b78` sobre `#0B1220` da 3.57:1 (necesita 4.5:1 para texto normal). Se usa en descripciones de servicio y respuestas de FAQ de esta misma página, en tamaño pequeño. Ajustar a algo como `#8a8a96` (~4.5:1) al implementar `--bg: #0B1220` en `globals.css`.
2. **`CustomCursor.tsx` no gatea por tipo de puntero ni respeta reduce-motion**: falta `matchMedia('(hover: hover) and (pointer: fine)')` para no montarlo en touch/híbridos, y un chequeo explícito de `prefers-reduced-motion` (su animación es JS puro vía `requestAnimationFrame`, no CSS). Aplica al nuevo cursor "resplandor etéreo" si se construye sobre la misma base.
3. **El sidebar general de navegación no tiene patrón de colapso a mobile definido** — `Navbar.tsx` actual no sirve de base (solo reduce el gap a 600px). Patrón recomendado: panel off-canvas con botón hamburguesa, backdrop y cierre al click afuera, bajo ~768px (confirmado en el sitio real de referencia, Brittany Chiang).
4. **Falta `:focus-visible` custom en `globals.css`** — con `cursor: none` global, el foco por teclado necesita su propio indicador visible explícito.

Estas 4 correcciones deberían entrar en el plan de implementación general del rediseño (no solo el de `/servicios`) cuando se invoque `writing-plans`.
