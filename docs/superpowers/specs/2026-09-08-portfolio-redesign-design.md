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

### 4. Footer
Adaptado del espíritu de Josh Comeau (capas + personalidad + tipografía), **sin copiar literal** las nubes de caricatura (no pega con un dev/ethical hacker):

- **Capas ilustradas**: 2 SVG tipo "colinas" superpuestas en tonos navy (`#0f1830`, `#0b1220`) en vez de nubes — dan profundidad sin ser infantiles.
- **Glow** de fondo consistente con el resto del sitio (`radial-gradient` sutil).
- **Mark "Misael." grande** en serif + emoji 👋 clickeable como easter egg (cambia de emoji al click: 👋🚀✨😄🤙).
- Tagline con personalidad, tono profesional-pero-humano.
- CTA "Hablemos →" hacia `/contacto`.
- Footer bottom: copyright + ícono GitHub. **Sin columnas de links** — no aplican, el nav ya vive en el sidebar en todas las páginas.

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

## Pendiente (sesión se pausó aquí)

1. **`/servicios`** — mockup no llegó a hacerse (el companion visual se cayó dos veces: timeout de inactividad, luego memoria del sistema casi agotada — 0.5GB libres de 15.7GB). Diseño conceptual ya acordado con el usuario, falta visualizarlo y aprobarlo:
   - Contenido: servicios freelance que ofrece Misael (desarrollo + auditoría de seguridad/ethical hacking).
   - Formato: editorial largo, tono conversacional/honesto (como latitude.build/services.html — "no hay lista de precios porque...").
   - TOC lateral fijo con scroll-spy (indicador de sección activa), estimado de tiempo de lectura arriba.
   - Debe convivir con el sidebar de nav general (¿el TOC va en vez del sidebar, o además? — **sin resolver, preguntar al usuario**).

2. **`/proyectos`** — página propia, aún no diseñada en absoluto. Hoy solo existe como grid de cards en el home actual (`app/page.tsx` → `ProjectsSection`). Decidir: ¿lista tipo la del mockup de sidebar (filas con número/tags/flecha) o algo distinto? ¿Cada proyecto individual tiene su propia sub-página o solo la lista es nueva?

3. **`/sobre-mi`** — página propia, aún no diseñada. Hoy es una sección del home (`AboutSection`). Decidir contenido/layout.

4. **Home resumido** — no se ha mockeado cómo se ve el preview de Proyectos/Sobre mí con "ver más" en la página de inicio.

5. **Grano/textura de fondo** — decidir sí/no definitivamente (ver nota en sección Fondo).

6. Tras cerrar todo lo anterior: **presentar el diseño consolidado, obtener aprobación explícita del usuario**, pasar el spec por el self-review (placeholders, contradicciones, alcance, ambigüedad), y **solo entonces invocar `writing-plans`** para el plan de implementación. Todavía no se ha hecho ningún cambio de código de producción para este rediseño — todo lo anterior son mockups desechables en `.superpowers/brainstorm/`.

## Notas técnicas para la implementación (cuando llegue el momento)

- Next.js 16 App Router — las páginas nuevas son rutas reales (`app/proyectos/page.tsx`, `app/sobre-mi/page.tsx`, `app/servicios/page.tsx`, `app/contacto/page.tsx`), no anclas.
- El layout con sidebar fijo probablemente conviene moverlo a `app/layout.tsx` (o un layout compartido) ya que se repite en todas las páginas — evaluar si el Home usa un layout distinto (sin sidebar, o con sidebar + hero) dado que es "resumido".
- Reusar tokens de color existentes en `app/globals.css` (`--bg`, `--accent`, `--accent2`, etc.) actualizando `--bg` a `#0b1220` y agregando el glow como utilidad reusable en vez de duplicar el CSS en cada página.
- `CustomCursor.tsx` necesita reescritura completa (anillo → glow), no un ajuste incremental.
- `Loader.tsx` necesita: actualizar colores, agregar la lógica de stagger post-cortina (probablemente coordinarse con el nuevo layout del sidebar vía `LoaderContext` o clases CSS condicionadas a `loaderDone`).
- El formulario de `/contacto` debe seguir usando `app/api/contact/route.ts` (Resend) ya en producción — no crear un backend nuevo.
