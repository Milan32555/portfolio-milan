# Rediseño del portfolio — spec de diseño (EN PROGRESO)

> Sesión de brainstorming iniciada 2026-09-08. Este documento se pausó a mitad de proceso — falta cerrar `/servicios`, diseñar `/proyectos` y `/sobre-mi`, revisión final y aprobación del usuario antes de pasar a `writing-plans`. Retomar leyendo este archivo primero.

## Referencias que dispararon el rediseño

El usuario pidió inspirarse en 3 sitios, cada uno por un elemento específico:

- **[joshwcomeau.com](https://www.joshwcomeau.com/)** — el **footer**: escena ilustrada en capas con sensación de profundidad, toque personal/divertido, tipografía.
- **[brittanychiang.com](https://brittanychiang.com/)** — la **simplicidad**: sidebar izquierdo fijo, mucho espacio en blanco, paleta mínima.
- **[era-residence.com](https://www.era-residence.com/)** — el **loader y las transiciones de entrada**: sensación de revelación elegante. Explícitamente **sin** la metáfora del arco/portal (es muy "inmobiliaria", no aplica a un portfolio dev).
- **[latitude.build](https://latitude.build)** (`/contact.html`, `/services.html`) — apareció después, cuando se reveló que el sitio tendrá varias páginas: el **formulario mad-libs** de contacto, y la **página editorial larga con TOC lateral** de servicios.

## Alcance

Visual + estructura. No es solo un refresh de estilos: cambia el layout general (de navbar arriba a sidebar fijo) y la arquitectura de información (de single-page a multi-página).

## Decisiones cerradas ✅

### 1. Layout general
**Sidebar fijo estilo Brittany Chiang**, sin línea divisora entre sidebar y contenido (probado con `border-right`, el usuario prefirió separar solo con espacio en blanco).

- Sidebar: mark "Misael." (serif, punto en `--accent2`), rol, nav, iconos sociales abajo.
- Nav pasa de scroll-spy de anclas a **route-based active state** (ver mapa del sitio abajo) — cada link es una página real, no un ancla.
- Contenido a la derecha, scrolleable, sidebar con `position: sticky`.

### 2. Fondo
**Navy profundo `#0B1220` + resplandor (glow) radial sutil**, no negro plano `#0c0c0e` (el usuario lo encontró "muy plano/liso").

- Glow: dos manchas radiales azules muy tenues (`rgba(79,142,247,0.16)` arriba-izquierda, `rgba(126,179,255,0.08)` derecha), `position: fixed` para que no se muevan raro al hacer scroll.
- Se probó también una versión con grano/ruido SVG (`feTurbulence`) sutil para evitar el efecto "cartel" — el usuario no lo rechazó explícitamente pero tampoco lo pidió al decidir; queda como **mejora opcional de pulido**, no un requisito. Si se incluye, debe ser casi imperceptible (opacity ~0.03-0.05, `mix-blend-mode: overlay`).

### 3. Cursor personalizado (reemplaza el anillo actual de `CustomCursor.tsx`)
**"Resplandor etéreo" (opción J del proceso, ajustada a J3):**
- Sin anillo/borde duro alrededor del cursor (el usuario lo rechazó explícitamente en las primeras rondas — variantes A/B/C con anillo, todas descartadas).
- Un halo de luz difuminado (`radial-gradient` + `blur`), tamaño base ~60px, `filter: blur(6px)`.
- Sigue el mouse con lerp/easing — **factor de suavizado 0.22** (probado contra 0.06 "lento" y 0.13 "medio"; el usuario eligió el más rápido, J3).
- Al hacer hover sobre un elemento interactivo (link, botón, input): escala a ~1.4x.
- Reemplaza por completo el `.cur-ring` — no debe quedar rastro del anillo en la implementación final.

Implementación de referencia (probada en el mockup, usar como base):
```js
let mx=0,my=0,rx=0,ry=0,hover=false;
window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });
// on hover de elementos interactivos: hover = true/false
(function loop(){
  rx += (mx-rx)*0.22; ry += (my-ry)*0.22;
  const scale = hover ? 1.4 : 1;
  glowEl.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%) scale(${scale})`;
  requestAnimationFrame(loop);
})();
```

### 4. Footer — "Cordilleras" — CERRADO 2026-09-21 ✅
Adaptado del espíritu de Josh Comeau (capas + personalidad + tipografía), **sin copiar literal** las nubes de caricatura (no pega con un dev/ethical hacker). La versión original de este spec (2 colinas SVG planas en dos tonos navy) se descartó por ser el patrón común; la investigación (`docs/superpowers/research/2026-09-17-investigacion-mejores-portfolios.md`, pasada 7) mostró que lo que hace memorable a un footer por capas es la textura, la tipografía como capa y un elemento con personalidad, no las curvas suaves.

**Concepto:** una noche en los Andes colombianos (Colombia tiene 3 cordilleras, así que "capas" es literal y personal), con la paleta navy + glow del sitio. Mockup aprobado, versión A: `docs/superpowers/mockups/2026-09-21-footer-cordilleras.html` (copia del mockup de `.superpowers/brainstorm/footer-capas/`, que es gitignored y puede limpiarse).

- **5 crestas** generadas con ruido de valor sembrado (`seed` fijo por capa, determinista), en perspectiva atmosférica: las lejanas más claras/azuladas (`#263a68`), las cercanas casi negras (`#080d1b`). En la implementación real, **precalcular los `path` y guardarlos como constantes** (no generar en el cliente en cada render).
- **Halftone (puntos) en la cresta** de las capas 1-4, con máscara que se desvanece hacia abajo, más un overlay de **grano** (ruido SVG, `mix-blend-mode: overlay`, ~9% de opacidad) sobre toda la escena. Esto cierra la decisión pendiente "grano sí/no" **solo para el footer**; el fondo del resto del sitio sigue abierto (punto 5 de Pendiente).
- **"MISAEL." gigante como capa**: entre las crestas 2 y 3, parcialmente tapado por las delanteras (baseline ajustado para que solo se oculte el pie de las letras y siga leyéndose completo). Tipografía serif, relleno con degradado azul translúcido.
- **Cielo**: degradado navy → azul en el horizonte, glow radial en el horizonte, luna con halo, ~120 estrellas con parpadeo lento.
- **Niebla**: 3 elipses difuminadas que derivan lento entre capas.
- **Pueblo lejano + luciérnagas** (reemplaza al "avatar colgando" de Josh como elemento de personalidad): ~22 ventanas cálidas sobre la capa 3 (concentradas en un cluster) y 14 luciérnagas verdes en la capa 4. Reaccionan al cursor "resplandor etéreo": las luces cercanas se avivan.
- **Profundidad al scroll**: cada capa se desplaza en Y a distinta velocidad según su profundidad (cielo 0.08 … capa frontal 0.95), como cortina que revela el footer.
- Contenido encima del cielo (legible sobre navy): lockup **"Misael." + emoji 👋 clickeable** (easter egg, cicla 👋🚀✨😄🤙), tagline en serif itálica, CTA **"Hablemos →"** hacia `/contacto`. Footer bottom sobre la capa más oscura: copyright + ícono GitHub. **Sin columnas de links** (el nav ya vive en el sidebar en todas las páginas).
- Los textos de tagline son de ejemplo en el mockup; el copy final se define al implementar.

**Accesibilidad / mobile (obligatorio al implementar):**
- Toda la escena SVG es decorativa: `aria-hidden="true"` y `focusable="false"`. La palabra gigante es decoración; el lockup "Misael." real en HTML es el texto accesible.
- `prefers-reduced-motion`: sin parpadeo, deriva, niebla ni parallax (capas estáticas). Además, el parallax por scroll y el efecto del cursor son JS: deben chequear `matchMedia('(prefers-reduced-motion: reduce)')` explícitamente (ver punto 7 de Pendiente).
- El efecto de cursor solo se monta con `(hover: hover) and (pointer: fine)`; en touch no hay glow ni reacción de luces.
- Encuadre adaptable: en pantallas anchas (relación de aspecto del footer ≥ 1.6) `viewBox` recortado con `slice`; en angostas se usa un `viewBox` más ancho con `meet` para que "MISAEL." quepa entera (en mobile la escena queda pequeña abajo con más cielo arriba — **punto a pulir**, el mockup solo lo resuelve a nivel funcional).
- Áreas táctiles ≥ 44px (CTA, GitHub, emoji). Contraste del texto del bottom verificado sobre `#080d1b`.
- Fuente serif del mockup (Fraunces) es un placeholder: confirmar contra la tipografía real del sitio al implementar.

**Reservado para otro lugar del sitio:** la variante B del mockup, **"Expediente"** (carpetas apiladas con pestañas escalonadas que funcionan como acordeón: una abierta a la vez, `aria-expanded` + `aria-controls`, en mobile colapsa a cabeceras de acordeón a ancho completo), **no va en el footer** pero el usuario quiere usarla en otra parte. Ver punto 10 de Pendiente para dónde.

### 5. Loader / transición de entrada
**Se mantiene la mecánica actual** de `components/Loader.tsx` (tipeo de "Misael" letra por letra + cursor parpadeante + punto que rebota + cortina que sube) — está bien lograda y ya alineada con lo que el usuario describió que le gustó de Era Residence. Cambios:

- Colores actualizados a navy + glow (en vez de `#0c0c0e` plano).
- **Nuevo:** al terminar la cortina, el sidebar y el contenido del home entran en **cascada** (stagger) — cada elemento (mark, rol, cada link del nav, intro) aparece con ~90ms de delay entre uno y otro, `translateY(10px)→0` + fade. Esto reemplaza la sensación de "revelación elegante tipo arco" de Era sin copiar la metáfora arquitectónica.
- Timing confirmado por el usuario tal cual se probó en el mockup — no pidió ajustes.

### 6. Mapa del sitio (cambio de alcance importante)
El usuario reveló a mitad de sesión que el sitio **tendrá varias páginas**, no solo un single-page con anclas. Estructura acordada:

```
/              Home resumido: intro corta + preview de Proyectos y Sobre mí con "ver más" (no todo el contenido)
/proyectos     Página propia — NO DISEÑADA AÚN
/sobre-mi      Página propia — NO DISEÑADA AÚN
/servicios     Página propia — editorial larga, TOC lateral scroll-spy (estilo latitude.build/services.html) — MOCKUP PENDIENTE
/contacto      Página propia — formulario "mad-libs" — DISEÑADO Y APROBADO (ver abajo)
```

Sidebar nav en todas las páginas: Sobre mí · Proyectos · Servicios · Contacto (con estado activo por ruta actual).

### 7. `/contacto` — DISEÑADO Y APROBADO ✅
Formulario tipo "mad-libs": una sola oración en serif grande con blancos (`<input>`/`<select>`) para rellenar en vez de campos tradicionales etiquetados, inspirado en `latitude.build/contact.html` pero con copy propio:

> "Hola Misael, soy **[tu nombre]** de **[tu empresa o proyecto]**. Te escribo porque **[qué necesitas]**, y busco **[un desarrollador frontend / una auditoría de seguridad / un colaborador para un proyecto]**. Respóndeme a **[tu@email.com]**."

- Inputs: fondo transparente, `border-bottom` sutil, texto itálico color `--accent2`, placeholder en `--muted`.
- Botón "Enviar →" + nota "Leo todo yo mismo y respondo rápido, normalmente en menos de 24h."
- Bloque "otras formas de contacto" abajo (email directo, GitHub), separado por borde superior sutil.
- **Layout de página**: sidebar y `main` centrados verticalmente (`justify-content: center`, `height: 100vh`), no top-aligned con espacio muerto abajo — el usuario pidió explícitamente que ocupara mejor el alto de pantalla.
- Cursor glow (J3) se agranda sobre inputs/botón/links (`isInteractive` check en el mockup).
- **Backend real ya existe**: `app/api/contact/route.ts` (Resend) — el rediseño visual debe conectarse a ese endpoint existente, ajustando el payload si los campos cambian (agregar el campo del `<select>` como parte del mensaje).

Mockup de referencia completo: `.superpowers/brainstorm/1444-1788908977/content/page-contacto-v2.html` (puede haberse limpiado por retention; si no existe, reconstruir desde este spec).

## Pendiente

1. ~~`/servicios`~~ — **CERRADO 2026-09-17**, ver `docs/superpowers/specs/2026-09-17-pagina-servicios-design.md`. TOC puro reemplaza al sidebar en esta página (no conviven), estructura editorial con 6 secciones + FAQ acordeón, precios sin montos públicos. Ese spec también documenta 4 correcciones de accesibilidad/mobile sitewide encontradas durante la investigación (ver punto 7 abajo).

2. **`/proyectos`** — **DISEÑADO 2026-09-21, pendiente de revisión del usuario: ver `docs/superpowers/specs/2026-09-21-pagina-proyectos-design.md`** y el mockup `docs/superpowers/mockups/2026-09-21-proyectos-lista-y-detalle.html`. Resumen de lo decidido: Hoy solo existe como grid de cards en el home actual (`app/page.tsx` → `ProjectsSection`). Decisiones tomadas en la conversación (cada una fundamentada en la investigación, pasadas 6-7): **sí hay sub-página por proyecto** (`/proyectos/[slug]`, datos en `lib/projects.ts`); la lista son 4 filas con miniatura + título + etiqueta de contexto ("Proyecto personal/universitario") + una cifra verificable + tags + dos botones de texto "Ver demo" / "Ver código" (un botón que no aplica se omite, no se deshabilita), y toda la fila lleva al detalle; el detalle es un case study de 1-2 minutos de lectura (problema, mi rol, decisiones, lo que decidí no hacer, evidencia de calidad, resultado, "con más tiempo haría…", anterior/siguiente + CTA a `/contacto`); orden: MEDI-IA, AnimalVision, library-system, safe-transfer-ai; AnimalVision necesita aviso de arranque en frío (Render tardó 78 s en despertar). Falta: escribir el spec `2026-09-21-pagina-proyectos-design.md`, capturas por proyecto (las tiene que aportar el usuario) y decidir el uso de "Expediente" (punto 10).

3. **`/sobre-mi`** — página propia, aún no diseñada. Hoy es una sección del home (`AboutSection`). Decidir contenido/layout.

4. **Home resumido** — no se ha mockeado cómo se ve el preview de Proyectos/Sobre mí con "ver más" en la página de inicio.

5. **Grano/textura de fondo** — decidir sí/no definitivamente (ver nota en sección Fondo).

6. Tras cerrar todo lo anterior: **presentar el diseño consolidado, obtener aprobación explícita del usuario**, pasar el spec por el self-review (placeholders, contradicciones, alcance, ambigüedad), y **solo entonces invocar `writing-plans`** para el plan de implementación. Todavía no se ha hecho ningún cambio de código de producción para este rediseño — todo lo anterior son mockups desechables en `.superpowers/brainstorm/`.

7. **Correcciones sitewide encontradas investigando `/servicios`** (no estaban contempladas el 2026-09-08, deben entrar al plan de implementación general, detalle en `docs/superpowers/specs/2026-09-17-pagina-servicios-design.md`):
   - `--muted` (`#6b6b78`) falla contraste AA contra el nuevo fondo navy `#0B1220` (3.57:1, necesita 4.5:1) — subir a ~`#8a8a96` al implementar `--bg: #0B1220`.
   - El nuevo cursor "resplandor etéreo" (sección 3) debe gatear por `(hover: hover) and (pointer: fine)` y respetar `prefers-reduced-motion` explícitamente en su loop de `requestAnimationFrame` — el `prefers-reduced-motion` CSS del proyecto no cubre animación JS pura.
   - El sidebar fijo (sección 1) necesita patrón de colapso a mobile sin definir todavía: panel off-canvas + hamburguesa + backdrop bajo ~768px (`Navbar.tsx` actual no sirve de base).
   - Falta `:focus-visible` custom en `globals.css` — con `cursor: none` global, el foco por teclado necesita indicador visible propio.

8. **Tercera pasada pendiente para el resto del sitio**: `docs/superpowers/research/2026-09-17-investigacion-mejores-portfolios.md` tiene 5 pasadas de investigación (patrones visuales transversales, código real de GitHub, perspectiva de reclutadores/clientes, mobile/accesibilidad) que aplican más allá de `/servicios` — usarla como insumo cuando se diseñen el Loader (con Three.js, ver más abajo), `/proyectos` (recomienda narrativa problema→resultado en 3-5 proyectos, no grid grande) y `/sobre-mi`/home (testimonios/casos de estudio identificados como el elemento de mayor impacto en conversión, hoy ausente en todo el sitio).

9. **Three.js — nuevo alcance, no estaba en la sesión original del 2026-09-08**: el usuario pidió incorporar Three.js "para algo". Se decidió explícitamente que **NO va en `/servicios`** (compite con la lectura larga) sino en el **Loader** (`components/Loader.tsx`) — pendiente de su propia sesión de brainstorming completa (no diseñado todavía). La investigación (pasada 3, GitHub) recomienda una escena 3D **contenida** (ej. estilo `sunnypatell/react-threejs-portfolio`), no un mundo navegable completo (ej. Bruno Simon / `VinayMatta63/threejs-portfolio`), para no repetir ese patrón fuera de contexto.

10. **Componente "Expediente" (carpetas apiladas) — DESTINO DECIDIDO 2026-09-21: el detalle de cada proyecto** (el usuario delegó la decisión en la recomendación; ver spec de `/proyectos`). El usuario aprobó la variante B del mockup del footer para usarla en otro lugar. Opciones que se consideraron, en orden de recomendación: (a) **el detalle de cada proyecto** (`/proyectos/[slug]`): cada sección del case study (Problema, Mi rol, Decisiones, Evidencia, Resultado) es una carpeta/pestaña — encaja con el servicio de auditoría de código ("expediente" del proyecto) y evita una página larga; (b) el **FAQ de `/servicios`**, hoy especificado como acordeón simple; (c) un bloque de contacto/estado en `/contacto`. Decidirlo al escribir el spec de `/proyectos`. Nota de riesgo: en (a) hay que cuidar que el contenido clave no quede oculto tras pestañas cerradas para quien escanea 30-90 s (la investigación lo advierte) — abrir por defecto la carpeta "Problema" y mantener visibles arriba el resumen y los botones demo/código.

## Notas técnicas para la implementación (cuando llegue el momento)

- Next.js 16 App Router — las páginas nuevas son rutas reales (`app/proyectos/page.tsx`, `app/sobre-mi/page.tsx`, `app/servicios/page.tsx`, `app/contacto/page.tsx`), no anclas.
- El layout con sidebar fijo probablemente conviene moverlo a `app/layout.tsx` (o un layout compartido) ya que se repite en todas las páginas — evaluar si el Home usa un layout distinto (sin sidebar, o con sidebar + hero) dado que es "resumido".
- Reusar tokens de color existentes en `app/globals.css` (`--bg`, `--accent`, `--accent2`, etc.) actualizando `--bg` a `#0b1220` y agregando el glow como utilidad reusable en vez de duplicar el CSS en cada página.
- `CustomCursor.tsx` necesita reescritura completa (anillo → glow), no un ajuste incremental.
- `Loader.tsx` necesita: actualizar colores, agregar la lógica de stagger post-cortina (probablemente coordinarse con el nuevo layout del sidebar vía `LoaderContext` o clases CSS condicionadas a `loaderDone`).
- El formulario de `/contacto` debe seguir usando `app/api/contact/route.ts` (Resend) ya en producción — no crear un backend nuevo.
