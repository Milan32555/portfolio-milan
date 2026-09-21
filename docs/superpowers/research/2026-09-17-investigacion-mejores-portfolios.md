# Investigación: qué hace destacar a los mejores portfolios del mundo

> Investigación pedida por el usuario durante el brainstorming de `/servicios` (2026-09-17), en cinco pasadas: developers/seguridad, todas las categorías (diseño, agencias, arte digital, fotografía), código real en GitHub, perspectiva de reclutadores/clientes (LinkedIn y fuentes relacionadas), y mobile/accesibilidad concreta contrastada contra el código real del repo. Esto es **material de referencia curado, no decisiones de diseño** — todavía no se filtró qué aplica a este portfolio específico. Sirve para futuras sesiones de brainstorming (Loader, home, `/proyectos`, `/sobre-mi`, y para revisar `/servicios`).
>
> Contexto del usuario: Misael es **estudiante** que además hace freelance (dev + auditoría de código, sin pentesting todavía) — por eso la pasada 3 prioriza comparaciones con portfolios de estudiantes/junior devs, no solo trabajo de senior/agencia.

## Pasada 1 — Ángulo developer / seguridad

Fuentes: Awwwards (categoría Developer), listados "best developer portfolios 2026", DEV Community, GitHub (plantillas de portfolios de seguridad).

### Patrones encontrados
- **Motion con propósito, no decorativo**: scroll-sequences que "narran", no solo fade-in. Ej: By-Kin (Next.js + GSAP), Epic (tipografía que muta al hacer scroll).
- **Tipografía como elemento visual principal**: letras grandes como pieza central del diseño. Ej: Koto, Brittany Chiang.
- **"Technical flex" físico/interactivo**: Bruno Simon convirtió su portfolio en un mundo 3D navegable con auto (Three.js + física) — el extremo de "la interfaz demuestra la habilidad", no solo la describe.
- **Craft en microinteracciones**: feedback táctil sutil e instantáneo en cada elemento — se valora por *guiar*, no por ser "cute".
- **Performance como parte del diseño**: "beauty at 60fps es toda la disciplina" — los sitios premiados en 2026 son rápidos, no solo bonitos.
- **Storytelling honesto sobre proyectos**: case studies con proceso/decisiones reales, no solo screenshots.

### Hallazgo específico de la categoría seguridad
Casi todos los portfolios de seguridad/ethical hacking encontrados (ej. plantillas tipo "HackFolio" en GitHub) usan el cliché **verde neón / matrix / terminal monospace**. Es un molde genérico de la categoría — diferenciarse de él (como ya hace este portfolio con navy+editorial) es una ventaja, no una carencia.

### Filtro ya aplicado en la conversación (ver spec de `/servicios`)
- Encaja: tipografía grande/editorial, motion con propósito, craft en microinteracciones, performance-first.
- No encaja para `/servicios`: mundos 3D tipo Bruno Simon (compite con la lectura larga). Se decidió que si se usa Three.js, va en el Loader — tema aparte, todavía sin diseñar.

## Pasada 2 — Ángulo amplio (todas las categorías)

Fuentes: Awwwards (todas las categorías, no solo Developer), FWA, CSS Design Awards, listados curados de diseño 2025/2026.

### Sitios/estudios de referencia por categoría

**Diseño gráfico / agencias**
- **Obys Agency** (Ucrania) — motion experimental, tipografía refinada, storytelling
- **Cappen** (Miami/São Paulo) — scroll effects audaces, animación por capas, sistemas modulares
- **Uncommon Studio** (Australia) — Site of the Day + Developer Award + FWA
- **By-Kin** (UK, Next.js + GSAP) — tipografía editorial confiada, transiciones suaves

**Arte 3D / motion**
- **Bruno Simon** — mundo 3D navegable con auto, Site of the Month ene-2026
- **Samsy Ninja (SMSY)** — 3D interactivo + diseño computacional, 50+ premios (incl. Cannes Lions)
- **Hashmukh** (Londres) — visuales surreales, VFX + motion, tipografía dinámica
- **Guillaume Combeaud** — motion 3D/IA, tipografía audaz, previews animados
- **Jordan Breton** — isla flotante detallada, FWA Site of the Day (oct-2025)
- **Alche, Inc** — mundos digitales inmersivos con Unreal Engine
- **Orage Studio** (París) — VFX/motion cinemático

**Fotografía**
- **Eva Kolenko** — grid denso de imágenes, navegación angosta que no compite con las fotos
- **Photoyoshi** (Tokio) — navegación interactiva
- **Ottografie** (Países Bajos) — composición fuerte, uso de luz
- **Hallazgo clave**: los fotógrafos que consiguen trabajo casi nunca tienen sitios flashy — tienen sitios **claros**. La foto es la protagonista, no el sitio.

**Otros / experimental**
- **Clay Boan** (NYC) — motion + narrativa
- **Merouane Bali** — full-stack + 3D + diseño combinados

### Patrones transversales (se repiten en TODAS las categorías — lo más valioso)
1. Tipografía grande como elemento visual principal, no solo texto.
2. Motion "con propósito" — transiciones que comunican estado, no decoran porque sí.
3. Cursores custom y microinteracciones táctiles en cada elemento.
4. Scroll-triggered reveals / parallax con sensación de profundidad por capas.
5. Paletas minimalistas con acentos enérgicos puntuales (no todo bold a la vez).
6. Storytelling honesto sobre el proceso, no solo mostrar el resultado final.

### Técnicas específicas notables (no universales, pero fuertes)
- **Transiciones "wipe"/máscara entre páginas** — tendencia hacia usar la View Transitions API nativa del navegador en vez de librerías pesadas (mejor performance).
- **Grain/noise sutil** — tendencia fuerte 2026, reacción contra lo "demasiado perfecto" del diseño generado por IA. Se implementa como overlay SVG de opacidad muy baja (~0.03–0.05).
- **Scroll horizontal** para galerías/timelines, a modo de "capítulos".
- **Cursores no convencionales** — reactivos a movimiento, "hotspots" interactivos.
- **WebGL/Three.js** para mundos o escenas navegables — el extremo del "technical flex".

### Tensión accesibilidad/performance (confirma la prioridad de performance de este proyecto)
- Hay crítica documentada de que Awwwards históricamente premia sitios flashy que **no son navegables por teclado** ni accesibles.
- La métrica de "usabilidad" de Awwwards no pesaba bien la accesibilidad real.
- **Tendencia 2026**: los jueces ahora evalúan explícitamente accesibilidad, semántica/SEO, responsive, animaciones y **WPO (performance)** como parte del puntaje — ya no alcanza con verse bien.
- Conclusión citada de una fuente, directamente aplicable a este proyecto: *"animación con propósito, no decoración"* es la diferencia entre un sitio premiado en 2026 y uno que se ve bonito pero es solo ruido.

## Pasada 3 — GitHub / código real

Fuentes: listas curadas de GitHub (emmabostian/developer-portfolios), repos individuales de portfolio con estrellas, foros (Blind, DEV Community, Reddit) sobre qué pesa realmente para conseguir trabajo/pasantías.

### Repos de referencia
- **[emmabostian/developer-portfolios](https://github.com/emmabostian/developer-portfolios)** — lista curada de ~1,986 portfolios reales, indexados con etiquetas de rol/nivel (incluye "Engineering Student", "CS Undergrad", "Aspiring Developer"). Mejor punto de partida para ver portfolios reales de gente en situación similar a Misael.
- **[ByteGrad/portfolio-website](https://github.com/ByteGrad/portfolio-website)** — 767★. Next.js + **Resend** (mismo proveedor de email que ya usa este proyecto) + Framer Motion + react-intersection-observer para scroll-reveals.
- **[namanbarkiya/minimal-next-portfolio](https://github.com/namanbarkiya/minimal-next-portfolio)** — 204★. Next.js 16 (mismo stack exacto de este proyecto). Estructura "object-driven": contenido en objetos TypeScript separados del JSX.
- **[muhammad-fiaz/portfolio](https://github.com/muhammad-fiaz/portfolio)** — 236★, Next.js + TypeScript.
- **[BUMBAIYA/portfolio-v2](https://github.com/BUMBAIYA/portfolio-v2)** — 145★. Framer Motion + next-seo + husky/lint-staged (calidad de proceso, no solo visual).
- **[nixrajput/portfolio-nextjs](https://github.com/nixrajput/portfolio-nextjs)** — 144★. Stack más avanzado (Drizzle ORM, next-auth, tests con Vitest/Playwright) — sirve de vitrina de buenas prácticas de ingeniería, no solo diseño.
- **3D/Three.js** (relevante para el Loader, cuando se diseñe): [sunnypatell/react-threejs-portfolio](https://github.com/sunnypatell/react-threejs-portfolio) (32★) usa una escena 3D **contenida**, coherente con que el Loader sea un momento breve. [VinayMatta63/threejs-portfolio](https://github.com/VinayMatta63/threejs-portfolio) (228★) es un mundo navegable completo con Blender + R3F — más pesado, menos aplicable acá.

### Casos de estudiantes/junior devs
- Un estudiante universitario de Puerto Rico consiguió una pasantía de verano escribiendo directo a una startup con un link a sus proyectos de GitHub; pasó un quiz de código y entrevistas telefónicas.
- Consenso repetido en foros (Blind, DEV Community): reclutadores rara vez abren repos de GitHub directamente — pesa más una **página de portfolio con descripciones claras de 2-4 proyectos con demo en vivo + link a código** que el perfil de GitHub crudo.
- La calidad importa más que la cantidad: un repo de baja calidad es peor que no tener portfolio.

### Patrones técnicos/de stack recurrentes (mirando `package.json` real)
- **Framer Motion aparece en el 100%** de los repos Next.js/React revisados — es el estándar de facto en este universo (GSAP aparece más en sitios de agencia, no en portfolios individuales).
- **Resend** para el form de contacto aparece en varios — valida que la elección ya hecha en este proyecto es la correcta, no hace falta cambiarla.
- **Radix UI** (primitivos accesibles sin estilo) + **lucide-react** (iconos) es la combinación más común para UI custom sin un framework de componentes pesado.
- **next-themes**, **zod** (validación de forms), **@vercel/analytics** — presentes en la mayoría.
- Estructura "object-driven": datos de proyectos/servicios en objetos TypeScript separados del JSX (no hardcodeados en el componente).

### Aprendizajes de código concretos, de bajo costo/alto impacto
- **Framer Motion** (no GSAP) es la opción de menor curva de aprendizaje y mejor integración con Next.js para los scroll-reveals y el acordeón del FAQ ya diseñados en `/servicios`.
- Separar el contenido de `/servicios` en un objeto/array de datos TypeScript, en vez de hardcodearlo en el JSX — facilita iterar el copy sin tocar el componente.
- **react-intersection-observer** es una forma liviana de implementar el scroll-reveal por sección sin escribir el observer a mano.
- Para el Three.js del Loader (a futuro): preferir una escena 3D **contenida** (estilo sunnypatell) en vez de un mundo navegable completo (estilo VinayMatta63/Bruno Simon) — coherente con que el Loader sea un momento breve.

## Pasada 4 — Perspectiva de reclutadores/hiring managers y clientes (LinkedIn y fuentes relacionadas)

Fuentes: artículos de carrera/blogs que citan o resumen consejos de reclutadores (el contenido de LinkedIn en sí está mayormente detrás de login y no siempre es indexable), foros como Blind.

### Consensos claros
- **Curación por encima de cantidad**: 3-5 proyectos bien documentados y en vivo superan a mostrar todo lo construido. Los reclutadores ya vieron miles de weather apps y calculadoras de tutorial — buscan un problema real resuelto.
- **Evidencia verificable > pulido**: con currículums generados por IA inundando los procesos, lo que no se puede falsificar es una app desplegada en vivo con código legible detrás.
- **Escaneo rápido**: 30-90 segundos en la primera pasada — buscan señales rápidas (qué problema resolviste, claridad de tu rol, si las decisiones tienen sentido), no lectura línea por línea.
- **Narrativa mínima por proyecto**: problema → enfoque → resultado. Un link a un repo sin contexto no convence.

### Desacuerdos / tensiones
- **Portfolio "estándar" vs. creativo**: una postura dice que lo convencional maximiza alcance (encaja con lo que la mayoría espera); la otra dice que un portfolio con personalidad actúa como filtro deliberado — atrae a quien valora ese criterio, aleja a quien prefiere lo convencional. No hay consenso: es una decisión de posicionamiento, no un error a corregir.
- **GitHub crudo vs. portfolio curado**: reclutadores raramente abren el perfil de GitHub directo, pero algunos hiring managers técnicos sí lo revisan si el portfolio los intriga primero.

### Específico para junior/estudiante
- Error más citado: portfolio con **solo proyectos académicos/de clase** — se lee como falta de iniciativa propia.
- Sí valoran señales indirectas: hobbies, proyectos personales, participación en comunidades — humanizan a alguien sin trayectoria laboral larga.
- A un junior se lo evalúa por **evidencia de aprendizaje activo y criterio**, no por magnitud de los proyectos (a diferencia de un senior, evaluado por impacto/escala).

### Específico para freelance/clientes
- Los clientes priorizan **testimonios y casos de estudio** por encima de galerías sin contexto: "4-6 proyectos con resultados claros y testimonios cortos superan a 20 muestras pulidas sin prueba".
- Estructura que genera confianza: problema → enfoque → herramientas → restricciones → resultado ligado a un objetivo de negocio real.
- **La honestidad sobre límites propios (qué no se sabe hacer todavía, timelines reales) se cita explícitamente como generador de confianza** — esto valida directamente la decisión ya tomada en `/servicios` de no ofrecer pentesting todavía y de cotizar según la necesidad real en vez de prometer de más.
- Sin testimonios/casos de estudio, el cliente tiende a quedarse con "la opción más segura" aunque sea más cara o lenta — la ausencia de prueba social tiene un costo de conversión real.

### Recomendaciones derivadas
1. Cada línea de servicio en `/servicios` (Desarrollo, Auditoría de código), cuando haya casos reales disponibles, debería insinuar problema→enfoque→resultado en vez de solo listar la capacidad — refuerza la idea ya anotada en la Pasada 1 del "caso real breve en Cómo trabajo".
2. **Fuera de alcance de esta sesión, anotar para `/proyectos`**: priorizar 3-5 proyectos con narrativa de problema/resultado por encima de una grilla grande de todo lo construido.
3. El tono honesto ya decidido (sin pentesting, sin lista de precios cerrada) está directamente alineado con lo que esta investigación confirma que genera confianza — no cambiar nada ahí.
4. El sitio ya eligió un camino "creativo/editorial" (navy+glow, cursor custom, TOC) en vez de un portfolio convencional — es una decisión consciente de posicionamiento/filtro, no algo a corregir.
5. **Fuera de alcance ahora, anotar para `/sobre-mi` o el home**: considerar espacio para testimonios/casos de estudio cuando existan — es el elemento de mayor impacto en conversión de clientes freelance encontrado en toda la investigación, y hoy no está contemplado en ninguna página del sitio.

## Pasada 5 — Mobile/touch y accesibilidad concreta (contrastada contra el código real)

A diferencia de las pasadas anteriores, esta se hizo leyendo el código existente (`components/AccessibilityWidget.tsx`, `components/CustomCursor.tsx`, `components/Navbar.tsx`, `app/globals.css`) para no duplicar lo que ya funciona y encontrar huecos reales. **Encontró bugs/gaps concretos que afectan decisiones ya cerradas en el spec maestro**, no solo inspiración.

### Ya cubierto (no tocar)
Tamaño de texto, alto contraste, resaltar enlaces, modo dislexia, cursor grande, y `prefers-reduced-motion` a nivel CSS — todo vía `AccessibilityWidget.tsx` + `globals.css`, con `aria-pressed`/`aria-expanded`/`role="dialog"` y cierre con Escape/click-outside. Sólido.

### ⚠️ Huecos reales encontrados en el código actual
1. **`CustomCursor.tsx` no respeta reduce-motion**: anima vía `requestAnimationFrame` en JS puro — ni el `prefers-reduced-motion` del SO ni el toggle manual del widget lo detienen (ambos solo frenan `transition`/`animation` CSS). Aplica directo al nuevo cursor "resplandor etéreo" si se implementa igual.
2. **`CustomCursor.tsx` no gatea por tipo de puntero**: no hay `matchMedia('(pointer: coarse)')` ni `(hover: hover)`. En touch puro no rompe nada visible, pero en híbridos (laptop táctil, tablet con trackpad) el cursor queda "pegado" en `(0,0)` hasta el primer `mousemove`. Además `globals.css` aplica `cursor: none !important` incondicionalmente a todo.
3. **`--muted` (`#6b6b78`) falla contraste AA contra el nuevo fondo navy `#0B1220`**: ratio real calculado = **3.57:1** (necesita 4.5:1 para texto normal, solo pasa el umbral de "texto grande" de 3:1). Se usa hoy en `card-desc`, `about-body`, y quedaría usado en las descripciones de servicio y respuestas del FAQ de `/servicios` — casi siempre en tamaños pequeños (0.85–0.9em), justo donde el umbral de texto grande NO aplica. **Recomendación concreta**: subir a algo como `#8a8a96` en el tema navy para llegar a ~4.5:1 sin perder la jerarquía de "texto secundario". (Para referencia, los otros tokens sí pasan: `--text` #f0f0f2 → 16.45:1, `--accent` #4f8ef7 → 5.83:1 AA, `--accent2` #7eb3ff → 8.72:1 AAA.)
4. **`Navbar.tsx` actual no tiene patrón de colapso a mobile** — a 600px solo reduce el gap, sigue mostrando los links en línea. El nuevo sidebar fijo necesita este patrón desde cero, no hereda nada utilizable.
5. **No hay `:focus-visible` custom en `globals.css`** — con `cursor: none` global y microinteracciones basadas en hover, el foco por teclado necesita su propio indicador visual explícito (ring o glow), no puede asumir que el hover ya lo resuelve.

### Mobile/touch — patrones concretos
- **Cursor custom**: gatear con `@media (hover: hover) and (pointer: fine)` — ningún desktop reconoce `pointer: coarse`, todo mobile sí. Mejor no montar el listener en absoluto que solo ocultarlo con CSS.
- **Sidebar fija → mobile**: patrón validado (incluso en la referencia real de Brittany Chiang): **panel off-canvas** desde la izquierda con botón hamburguesa, backdrop semitransparente, cierre al click afuera, bajo ~768px. En tablet (768–1024px), variante común: colapsar a solo íconos y expandir al activarse.
- **TOC puro de `/servicios` en mobile**: la columna fija no cabe — colapsar a un botón "En esta página ▾" que despliega la lista.
- **Hover microinteractions (filas de servicio, footer emoji)**: en touch se vuelven **tap-states** — el estado que antes aparecía con `:hover` (ej. la flecha de las filas de servicio) debe quedar siempre visible o mostrarse en `:active`, nunca oculto esperando un hover que no va a ocurrir.
- **Scroll-reveal**: no depende de mouse, funciona igual en mobile — solo necesita el mismo chequeo de `prefers-reduced-motion` si se implementa a mano en JS (no vía una librería que ya lo maneje).

### Accesibilidad — checklist priorizado para el TOC scroll-spy
- Usar `aria-current="location"` (no `"true"`) en el link activo del TOC — semánticamente es "tu ubicación actual en la página", que es justo lo que hace el scroll-spy.
- El TOC es una lista simple de links (`<nav aria-label="En esta página"><a>`), no un widget compuesto — `Tab`/`Shift+Tab` normal alcanza, no hace falta roving tabindex ni flechas de teclado.
- Si hay múltiples `<nav>` en la página (TOC + nav general en otras páginas), cada uno necesita su propio `aria-label` para diferenciarse ante lectores de pantalla.

### Tabla de decisiones por elemento (mobile)
| Elemento ya decidido | Qué hacer en mobile |
|---|---|
| Cursor "resplandor etéreo" | No renderizar/montar si `(hover: hover) and (pointer: fine)` no matchea. |
| Sidebar fija con nav | Off-canvas drawer + hamburguesa bajo ~768px, con backdrop y cierre al click afuera. |
| TOC puro de `/servicios` | Colapsa a botón "En esta página ▾" desplegable. |
| Hover en filas de servicio / footer emoji | Tap-state siempre visible o en `:active`, nunca oculto tras hover inexistente. |
| Scroll-reveal por sección | Sin cambios de lógica — solo respetar `prefers-reduced-motion` si es JS a mano. |
| Loader (tipeo + stagger) | Ya confirmado que no depende de hover — sin cambios. |

## Pasada 8 (2026-09-21) — Qué información lleva cada proyecto: esquemas de repos de portfolios reales

Método: leer directamente los archivos donde repos conocidos definen sus proyectos (`gh api`), no artículos. **Límite honesto:** no hay portfolios de estudiantes con reconocimiento en GitHub con estrellas suficientes (las búsquedas por "student portfolio" no devuelven nada con más de 40★), así que la muestra es de desarrolladores conocidos o plantillas muy usadas, no de estudiantes. Solo el de Chiang tiene un caso visto en pantalla (pasada 6); los demás son solo del código.

| Repo | Campos por proyecto | Qué enseña |
|---|---|---|
| `bchiang7/v4` (sitio de Brittany Chiang) | `title`, `cover`, `github`, `external`, `tech[]`, 1-2 frases de texto | Lo mínimo que sirve: **dos enlaces distintos (código y despliegue)**, tecnologías, una descripción corta. Sin página de detalle. |
| `dillionverma/portfolio` | `title`, `dates`, `active`, `description`, `technologies[]`, `links[{type,href}]`, `image`, **`video`** | **Video de demo por proyecto**, periodo con fechas, bandera de si sigue activo, y enlaces tipados ("Website", "Source"). Un proyecto puede no tener imagen y depender del video. |
| `mldangelo/personal-site` | `title`, **`subtitle`** (contexto o reconocimiento: "3rd place at Techcrunch Disrupt SF"), `link?` opcional, `image`, `date`, `desc` (una línea con **una cifra concreta y un final honesto**: "Classified 60,000+ cats across 80 breeds before server costs shut it down"), `tech[]`, `featured` | El **enlace es opcional** y un proyecto ya apagado se cuenta igual, con honestidad. El subtítulo dice en qué contexto nació. |
| `once-ui-system/magic-portfolio` (plantilla con detalle) | Front matter: `title`, `publishedAt`, `summary`, **`images[]`** (galería), `team[{name, role}]`, `link`; cuerpo MDX: **Overview → Key Features → Technologies Used → Challenges and Learnings → Outcome** (con un resultado medible: "cutting down design-to-development time by 40%") | La estructura de case study que usan las plantillas con detalle: coincide con problema → decisiones → resultado, y añade **"qué hace" (features)** y **galería de imágenes**. |
| `tbakerx/react-resume-template` (2 142★, muy copiada) | `title`, `description`, `url`, `image` | El esquema **mínimo y genérico** de las plantillas: es lo que hace que muchos portfolios se vean iguales. Sin cifra, sin contexto, sin rol. |

### Conclusiones aplicables
1. **Lo indispensable en todos**: título, descripción corta, tecnologías, imagen, y **enlaces de código y de despliegue por separado**. Nuestro spec ya lo cubre.
2. **Lo que separa a los mejores**: (a) **una cifra concreta**, (b) **contexto** (hackathon, curso, personal), (c) **honestidad sobre el final** (proyecto apagado, límites), (d) **video corto** cuando no hay demo o la demo es frágil.
3. **Huecos de nuestro spec detectados**: falta **video/galería** (crítico para MEDI-IA y safe-transfer-ai, que no tienen demo), falta **periodo/estado** (activo o archivado), y falta un **"qué hace"** con 3-5 funciones (Key Features) antes de entrar a decisiones.
4. **Lo que NO copiar**: el esquema mínimo de las plantillas (`title/description/url/image`), que es justo el "genérico" que el usuario quiere evitar.
5. Chiang, Dillion y mldangelo **no usan página de detalle**; solo la plantilla de Magic Portfolio la tiene. La decisión del usuario de hacerlo es válida y diferencia, pero implica que la fila de la lista debe bastar por sí sola (ya lo hace: cifra, estado, dos botones).

## Nota sobre alcance
Ninguno de estos hallazgos se aplicó todavía. La decisión de qué traer al portfolio (y a qué página) se toma en conversación, sección por sección, priorizando lo que ya está cerrado en `docs/superpowers/specs/2026-09-08-portfolio-redesign-design.md` y sin comprometer performance ni accesibilidad — ambas ya son prioridades explícitas de este proyecto (ej. optimización de video de 18MB a 2.7MB).
