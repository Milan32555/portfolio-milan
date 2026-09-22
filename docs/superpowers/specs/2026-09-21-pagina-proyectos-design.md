# `/proyectos` — spec de diseño

> Sesión de brainstorming 2026-09-21. Complementa `2026-09-08-portfolio-redesign-design.md` (layout general, sidebar, footer "Cordilleras") y se apoya en la investigación `docs/superpowers/research/2026-09-17-investigacion-mejores-portfolios.md` (pasadas 4 y 6-7). Estado: **diseño aprobado por el usuario en conversación (2026-09-21, lista sutil + detalle rico); pasó el self-review; falta que el usuario lea este documento antes de pasar a `writing-plans`** (`docs/superpowers/mockups/2026-09-21-proyectos-lista-y-detalle.html`). Sin cambios de código de producción todavía.

## Decisión de fondo
Cada proyecto tiene **su propia página** (`/proyectos/[slug]`), con botones "Ver demo en vivo" y "Ver código". Esto reemplaza la decisión previa "lista curada sin subpáginas". Se mantiene la curación: **4 proyectos**, no una grilla grande.

La investigación muestra que las referencias top (Brittany Chiang, Dillion Verma) enlazan directo a lo desplegado y no tienen detalle; el detalle propio viene de las guías de case studies (problema → decisiones → resultado, 1-2 minutos). Para que el clic extra no cueste al que escanea rápido, **la fila de la lista ya incluye los dos botones directos**, y el detalle es una lectura opcional más profunda.

## Dependencias
Este spec **asume el layout compartido del master spec** (sidebar fijo en `app/layout.tsx`, tokens navy `--bg: #0b1220` y `--muted` corregido, `:focus-visible` global, cursor "resplandor etéreo"). El plan de implementación debe ordenarse **después de, o junto con**, ese layout; no es independiente. La fuente serif del mockup (Fraunces) es un placeholder: usar la tipografía real definida para el sitio.

## Rutas y datos
- `/proyectos` (lista) y `/proyectos/[slug]` (detalle) con `generateStaticParams`; `metadata` y OG propios por proyecto; entradas en `app/sitemap.ts`.
- Los datos viven en `lib/projects.ts` (objetos TypeScript, no hardcodeados en JSX; patrón "object-driven" de la investigación).
- Slugs: `medi-ia`, `animalvision`, `library-system`, `safe-transfer-ai`.
- Tipo `Project` (en `lib/projects.ts`):
  - Identidad: `slug`, `title`, `summary` (1 línea), `context` (`"personal" | "universitario"`), `subtitulo?` (contexto o reconocimiento, p. ej. "Proyecto del curso de Arquitectura de Software"; opcional, patrón de mldangelo), `periodo` (texto, p. ej. "Mar 2026 – presente"), `estado` (`"activo" | "archivado"`, señal de mantenimiento como el `active` de Dillion), `tags[]`. El número `EXP-00N` **se deriva del orden** en el array (no se guarda).
  - Lista: `metric: { value, label }` (una cifra verificable, corta).
  - Enlaces: `repo: { url }` y `demo?: { url, note? }`. **`demo` es opcional**: si falta, el botón no se renderiza y el estado pasa a "Solo código". `note` es el aviso junto al botón (p. ej. arranque en frío).
  - Portada y medios: `cover?: { src, alt }`; si falta, se genera una portada determinista (semilla por slug). `video?: { src, poster, label }` (`label` describe lo que muestra el video) (recorrido corto, ver regla abajo) y `galeria?: [{ src, alt }]` (2-4 capturas de estados reales).
  - Detalle: `stats: [{ value, label }, { value, label }, { value, label }]` (exactamente 3), `arquitectura: [{ nombre, descripcion }]` (3-5 partes, en orden de la pantalla a los datos) y `expediente: { problema, queHace[] (3-5 funciones), rol, decisiones[], noHice[], evidencia[], resultado, conMasTiempo[] }`. Opcional `aviso?: string` para el recuadro informativo (p. ej. MEDI-IA, safe-transfer-ai).
- **Slug inexistente → 404** (`dynamicParams = false` + `notFound()`). Anterior/siguiente son **circulares** (el siguiente del último es el primero).
- `generateMetadata` por proyecto: título `"{title} — Misael"`, descripción = `summary`, OG con la portada.

## Orden (por relevancia y calidad, no por fecha)
1. **MEDI-IA** — la más original y documentada.
2. **AnimalVision** — demo viva, métricas claras.
3. **library-system** — demo viva, arquitectura, historia de migración.
4. **safe-transfer-ai** — ángulo de seguridad que conecta con el servicio de auditoría.

## Lista (`/proyectos`)
**Principio (decidido 2026-09-21): la lista es sutil; toda la información va en el detalle.** Una primera versión enriquecida (paisaje en la cabecera, tira de capas, cifra gigante, número decorativo) se probó en el mockup y se descartó: recargaba la fila y mucha de esa información no ayuda a quien escanea rápido. Ese contenido pasó a la página de detalle.

Cuatro filas editoriales (sin grilla), inspiradas en la fila de Brittany Chiang (miniatura + título + descripción + prueba + tags) y en los botones de texto de Dillion Verma.

Cabecera: título, introducción y una línea de contadores honestos **calculados de los datos** (`04 expedientes · 02 con demo en vivo · 02 solo código`).

Cada fila:
- **Pestaña de carpeta `EXP-001`** apoyada sobre la línea divisoria (personalidad del "expediente"; decorativa, `aria-hidden`).
- Miniatura, título, resumen de una línea.
- Una línea de meta: **una cifra verificable** pequeña (`97.1% Recall@1`, `93.4% accuracy`, `1 archivo`, `8 tests`), **estado** (`● Demo en vivo` / `○ Solo código`, derivado de si existe `demo`) y etiqueta de contexto ("Proyecto personal" / "Proyecto universitario").
- Tags en píldoras.
- Botones de texto **"Ver demo"** y **"Ver código"**. Un botón que no aplica **se omite**, no se deshabilita.
- **Toda la fila** navega al detalle (enlace estirado sobre el título; los botones quedan por encima).
- En touch no hay hover: la flecha y los botones siempre visibles.
- Al final: enlace "Ver todo en GitHub ↗" (equivalente al "Full Project Archive" de Chiang).

**Hover de la fila (discreto, decidido 2026-09-21):** solo CSS, con `(hover: hover) and (pointer: fine)`. Al pasar el cursor: las **demás filas se atenúan** (opacidad ~0.6, recurso visto en Chiang), aparece una **línea de acento** en el borde izquierdo de la fila, la flecha del título se desplaza unos píxeles y las **capas de la portada se separan apenas** (desplazamientos de 5/12/20 px a distinta velocidad; con capturas reales se sustituye por un zoom muy leve). Sin JS, sin vista previa flotante ni burbuja. En touch/teclado la fila funciona igual, y con `prefers-reduced-motion` no hay transiciones.

> **Descartado tras probarlo:** una vista previa grande de la captura que seguía al cursor con una burbuja "Ver" (patrón de Olivier Larose). El usuario lo vio en el mockup y prefirió algo más disimulado; además tapaba el texto de la fila.

## Detalle (`/proyectos/[slug]`)
**Arriba, siempre visible** (lo que el reclutador busca en los primeros segundos):
- Enlace "← Proyectos", etiqueta `EXPEDIENTE 001`, título, resumen, meta (contexto · año · estado), botones "Ver demo en vivo" (primario) y "Ver código" (secundario), y la portada/captura.

**Bloques ricos del detalle (aquí va toda la información):**
- **Fila de cifras destacadas** (3 por proyecto, número grande en serif + etiqueta), p. ej. MEDI-IA: `97.1%` Recall@1 · `185` tests · `14` libros; AnimalVision: `93.4%` accuracy · `98.7%` top-3 · `~0.8 s`; library-system: `1` archivo reescrito al cambiar de BD · `2 en 1` despliegue · `4` capas; safe-transfer-ai: `8` tests · `7` señales · `0–100` puntaje. Datos en `lib/projects.ts` (`stats[]`).
- **"De la pantalla a los datos"** (arquitectura): las partes reales del sistema como tarjetas conectadas por flechas, cada una con nombre y **una explicación en lenguaje simple** (ej. library-system: Vue 3 → Casos de uso → Repositorio → Neon). Se evita el nombre "Capas" en la interfaz porque es jerga para un cliente que no programa. Lista ordenada semántica (`ol`), en columna con flechas verticales en mobile. Datos en `lib/projects.ts` (`arquitectura[]`). Las tarjetas usan un borde apilado sutil (efecto de capas) sin animación.

**Debajo, el componente "Expediente"** (variante B del mockup del footer, ver master spec punto 10): 5 carpetas apiladas con pestañas, que funcionan como acordeón (una abierta a la vez):
1. **Problema** — *abierta por defecto*; incluye el problema y debajo **"Qué hace"** (3-5 funciones concretas, equivalente al *Key Features* de las plantillas con detalle).
2. **Mi rol** — contribución exacta, dicha con honestidad.
3. **Decisiones** — tecnologías y compromisos, **incluyendo lo que decidí no hacer y por qué**.
4. **Evidencia** — tests, CI, métricas, cómo se verificó.
5. **Resultado** — qué quedó y **"con más tiempo haría…"**.

Reglas para que el Expediente no oculte lo importante (la investigación advierte contra esconder contenido tras animaciones):
- Cabecera, resumen, botones, fila de cifras y bloque de arquitectura fuera de las carpetas, siempre visibles.
- Todo el contenido está en el DOM (indexable, imprimible); cerrar una carpeta no lo elimina.
- Implementación: botones `aria-expanded` + `aria-controls` (como en el mockup), no `<details>` nativo, porque el hover y la regla "siempre una abierta" requieren JS. Render del servidor: primera carpeta abierta y el resto cerradas, **pero todo el contenido presente en el HTML**; para el caso sin JS, un `<noscript><style>` abre todas las carpetas (mejora progresiva, sin parpadeo de hidratación).
- Longitud: el texto del Expediente ~300-400 palabras. Con cifras y arquitectura la página completa se lee en unos 2-3 minutos, pero **lo esencial (cabecera, botones, cifras) se ve en menos de 30 segundos**; se enlaza al repo para profundizar.

**Apertura por hover (aprobada 2026-09-21), solo mouse en dispositivos con `(hover: hover) and (pointer: fine)`:**
- La carpeta se abre al pasar el cursor sobre su **pestaña o franja** (no sobre el panel de contenido), con **retraso de intención de ~140 ms** para no abrir todas al cruzarlas.
- Solo reacciona a **movimiento real** del mouse (`movementX/Y ≠ 0`): ignora los eventos sintéticos que el navegador dispara cuando el propio layout se desplaza al abrirse/cerrarse una carpeta. Así se evita la cascada de aperturas bajo el cursor (probado en el mockup).
- **Siempre hay una carpeta abierta:** hacer clic sobre la ya abierta no la cierra (evita que el clic contradiga al hover). En touch, un toque abre la carpeta; en teclado, Enter/Espacio sobre la pestaña.
- El hover es solo una comodidad: nada depende de él.

**Pie:** proyecto anterior / siguiente y un CTA a `/contacto` ("¿Tienes un problema parecido?").

## Video de recorrido (nuevo, pasada 8)
Los proyectos **sin demo pública** (MEDI-IA, safe-transfer-ai) y AnimalVision (arranque en frío de ~1 min) deben tener un **video corto de recorrido** (15-30 s, sin audio, ≤ 3 MB), como el campo `video` de Dillion Verma. Reglas: `<video muted playsinline preload="none" poster>` con carga diferida; **sin autoplay** con `prefers-reduced-motion` (se muestra el poster con botón de reproducir); con controles accesibles y subtítulo o texto alternativo que describa lo que muestra. El video sustituye a la demo como **prueba de que funciona**, no la reemplaza en el texto: se sigue diciendo por qué no hay demo. Si no hay video aún, se usa la galería de capturas.

## Honestidad sobre demos y límites (regla de contenido)
| Proyecto | Demo | Tratamiento |
|---|---|---|
| MEDI-IA | No hay | Solo "Ver código". Texto: "No hay demo pública: depende de un corpus de 14 libros y de un token de HuggingFace." Compensa con diagrama de arquitectura y métricas. Incluir aviso: proyecto educativo, no sustituye criterio médico (**confirmar redacción con el usuario**). |
| AnimalVision | https://animal-cnn-classifier.onrender.com | Nota junto al botón: "Plan gratuito: la primera carga puede tardar ~1 min" (medido 78 s el 2026-09-21). |
| library-system | https://full-stack-library-management-syste-eight.vercel.app | Etiqueta "Proyecto universitario", contado por lo propio: Clean Architecture real y la migración Supabase → Neon reescribiendo un solo archivo. |
| safe-transfer-ai | No hay (Android nativo) | Solo "Ver código" + capturas. Decir explícitamente que es un motor de reglas determinístico, **no** ML (ya lo dice su README). |

## Contenido base (borrador a partir de READMEs y del repo)
Cifras **verificadas el 2026-09-21** salvo indicación. Los textos finales de "Mi rol" y "Con más tiempo haría…" **los debe confirmar el usuario**; no se inventan.

- **MEDI-IA** — Recuperación híbrida BM25 + FAISS con fusión RRF, reranker cross-encoder multilingüe, agente ReAct (Qwen2.5-7B) con 4 herramientas y guardrails previos al LLM; 14 libros (~136 000 chunks). Métrica de lista: **Recall@1 97.1%** (dataset de 40 consultas anotadas, según el README; es un dataset pequeño, decirlo). Evidencia: **185 funciones de test** (contadas en `tests/`; el README dice a veces "aserciones", corregirlo), CI en GitHub Actions, Docker + nginx. Decisión con dato: pasar de MiniLM (Recall@1 74.3%) a `multilingual-e5-base` (91.4%) y al corpus de 14 libros (97.1%).
- **AnimalVision** — Transfer learning con MobileNetV2, Flask + Gunicorn en Render, arquitectura modular (Factory + separación de responsabilidades), pipeline dataset → entrenamiento → API → UI. Métrica: **93.4% accuracy** (top-3 98.7%, ~0.8 s, 5 clases; cifras del README, autoinformadas; decir que son 5 clases).
- **library-system** — Vue 3 + Node/Express + Neon (Postgres), Clean Architecture con repositorio intercambiable, desplegado como Vercel Services. Métrica: demo viva + **1 archivo reescrito** al migrar de base de datos. Historia real de decisiones: Supabase (límite de 2 proyectos gratis) → Neon; Railway (trial vencido) → Vercel Services.
- **safe-transfer-ai** — Kotlin + Jetpack Compose, `FraudEngine` con reglas ponderadas (score 0-100, niveles Bajo/Medio/Alto, razones legibles). Métrica: **8 tests unitarios** del motor.

## Estilo (no genérico)
Coherente con el resto del rediseño (navy `#0B1220` + glow, serif para títulos, footer "Cordilleras"): las carpetas del Expediente usan tonos navy escalonados con borde superior de acento; etiquetas mono `EXP-00N`; sin efectos que retrasen el contenido. La portada sin captura real usa una **portada generada** (composición en capas con el nombre y el stack) para no dejar imágenes rotas, pero las capturas reales siempre tienen prioridad.

## Accesibilidad y mobile
- Enlace estirado de la fila: un solo enlace por fila con nombre accesible claro; botones "Ver demo"/"Ver código" con `aria-label` que incluye el proyecto y texto "(se abre en una pestaña nueva)"; `rel="noopener"` en externos.
- `:focus-visible` propio (ya pendiente sitewide), objetivos táctiles ≥ 44px, botones que apilan en mobile.
- Expediente en mobile: pestañas escalonadas colapsan a cabeceras de acordeón a ancho completo (número + título).
- `prefers-reduced-motion`: sin transición de apertura de carpetas.
- `--muted` sube a ~`#8a8a96` (contraste AA), ya decidido en el master spec.
- Imágenes con `next/image`, dimensiones explícitas y `alt` descriptivo.

## Prerrequisitos y tareas fuera de esta página
- **Capturas por proyecto** (el usuario debe aportarlas; idealmente estados reales: lista, detalle/predicción, vista mobile) y **un video corto de recorrido** para MEDI-IA, safe-transfer-ai y AnimalVision (ver "Video de recorrido").
- Repo `library-system` en GitHub: `homepage` apunta a una URL vieja (`…-three.vercel.app`) y los topics dicen netlify/railway → actualizar a la URL de producción y a vercel/neon.
- MEDI-IA en GitHub: la descripción menciona "TF-IDF" pero el README describe BM25+FAISS+ReAct → actualizar; y unificar "185 tests" (no "aserciones") en README.
- Confirmar con el usuario: redacción del aviso médico de MEDI-IA, los textos de "Mi rol" / "Con más tiempo haría…", las explicaciones de cada tarjeta de arquitectura (son borradores a partir de READMEs y código) y el **periodo** de cada proyecto (el mockup usa 2026 como marcador, no está verificado) y su **estado** (activo/archivado).

## Qué información necesita cada proyecto (checklist de contenido, pasada 8)
**Imprescindible** (sin esto no se publica): título · resumen de una línea · tecnologías · portada o captura real · **enlace a código** · **enlace a demo, o la razón honesta de por qué no hay** · una **cifra verificable** · contexto (personal/universitario) · periodo.
**Debe estar en el detalle:** qué hace (3-5 funciones) · problema · mi rol · decisiones y lo que decidí no hacer · evidencia (tests, CI, métricas y su límite) · resultado · con más tiempo haría · arquitectura explicada en simple.
**Marca la diferencia (los mejores lo tienen):** video corto de recorrido · galería con estados reales · final honesto (límites, cold start, proyecto apagado) · estado de mantenimiento.
**No copiar:** el esquema mínimo de las plantillas (`título/descripción/url/imagen`), que es justo lo genérico.

## Estructura de archivos (propuesta)
- `lib/projects.ts` — datos y tipos (fuente única).
- `app/proyectos/page.tsx` — lista (server component).
- `app/proyectos/[slug]/page.tsx` — detalle (server component; `generateStaticParams`, `generateMetadata`).
- `components/proyectos/ProjectList.tsx` — la lista con sus cuatro filas (server; el hover es solo CSS).
- `components/proyectos/ProjectCover.tsx` — portada: imagen real con `next/image` o portada generada determinista en SVG (server, sin JS).
- `components/proyectos/StatsRow.tsx` y `ArchitectureFlow.tsx` — server components.
- `components/proyectos/Expediente.tsx` — **el único client component** (estado abierto, hover con intención, teclado).
- Estilos en CSS (globals o módulo) reutilizando los tokens del sitio; sin dependencias nuevas (nada de GSAP/Framer para esta página).

## Verificación
El repo no tiene framework de tests (`package.json` sin script `test`); no se añade uno solo para esta página (YAGNI). Verificación prevista:
- `next build` y `tsc` sin errores; las 4 rutas generadas estáticas.
- Script Node de integridad de `lib/projects.ts`: slugs únicos, `stats.length === 3`, URLs de `demo`/`repo` en `https`, campos obligatorios presentes, sin proyectos con `cover` roto.
- Capturas con Playwright de lista y detalle en 1440 / 900 / 390 px, y comprobación de que el hover de carpetas no produce cascada (como en el mockup).
- Accesibilidad: navegación solo con teclado (Tab/Enter/Espacio), `prefers-reduced-motion`, contraste AA de texto secundario, lector de pantalla sobre la lista de arquitectura y el Expediente.
- Rendimiento: páginas estáticas sin JS salvo `Expediente`; portadas con dimensiones explícitas.

## Fuera de alcance (YAGNI)
Filtros por tecnología, buscador, paginación, comentarios, JSON-LD por proyecto, animaciones de transición entre páginas, más de 4 proyectos destacados. La grilla actual de 6 cards del home (`ProjectsSection`) se sustituirá luego por el preview del home resumido (pendiente aparte).
