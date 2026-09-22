# Home + hero "nombre hecho de código" — spec de diseño

> Cerrado en brainstorming el 2026-09-22. Mockup aprobado (documento completo con loader + hero + home, funciona abierto directo en el navegador): `docs/superpowers/mockups/2026-09-22-home-hero-codigo.html`. El mockup trae un panel "solo mockup" arriba a la derecha que simula el `AccessibilityWidget` (tema claro, alto contraste, reducir movimiento, dislexia); **no** forma parte del sitio.

## Decisión de alcance: Three.js va en el hero, no en el Loader

El spec maestro (Pendiente #9) había reservado Three.js para el Loader. Misael lo cambió: *el hero debe ser lo primero que se ve de golpe, y llamativo*. Three.js vive en el **hero**, visible en cada visita a home.

El **Loader** se mantiene, rediseñado como "muro de código" (ver sección Loader): es la puerta de entrada y el hero es lo que hay detrás. Reemplaza al `components/Loader.tsx` actual (tipeo de "Misael" + cortina). Se había propuesto retirarlo; Misael pidió conservarlo, interactivo y con clic para entrar, porque lo hace más inmersivo.

Conceptos descartados para el hero: "Cordilleras" en 3D (misma escena del footer; Misael: "se ven muy básicas"). No volver a proponerlo.

## Concepto del hero

**"Misael." hecho de miles de caracteres de código** (`{ } < > / ; = $ # …`). De lejos se lee el nombre; de cerca es código. Resume lo que hace: construye con código y lo audita por dentro.

### Secuencia de entrada
1. **Primer paint**: "Misael." es un `<h1>` real en DM Serif Display (punto en `--accent2`) en el HTML del servidor (SEO y lectores de pantalla), pero **invisible** cuando se espera la versión 3D: un script inline antes del primer paint le pone `opacity:0`. Se probó mostrarlo como texto y luego reemplazarlo por el código, y al recargar se veía como un salto ("primero aparece el Misael en letras blancas y después el interactivo"). El texto solo se muestra si no habrá 3D: sin WebGL, `hardwareConcurrency <= 2`, alto contraste/dislexia, o si Three.js no cargó a los ~3.2 s.
2. Three.js se pide **de inmediato** (import dinámico, sin esperar a `requestIdleCallback`). Un benchmark invisible de ~0.4 s decide la calidad; el resultado se guarda en `sessionStorage` y en las visitas siguientes de la sesión se reutiliza sin medir (ver Rendimiento).
3. ~2.7k glifos vuelan y forman el nombre (≈2.6 s, con retardo por partícula). En la primera visita salen **de la rendija del loader** (atributo `aDoor` + uniform `uDoor`); en visitas siguientes llegan desde un enjambre disperso.
4. El eyebrow se **escribe letra por letra** con cursor de bloque: `// dev freelance · auditor de código` (en móvil solo `// dev freelance`). Mismo lenguaje que la consola de `/sobre-mi`.
5. Aparecen el subtítulo y los botones.

Copy:
- Subtítulo: "Construyo interfaces con React y Next.js, y audito código ajeno con la misma cabeza con la que aprendí seguridad: buscando qué se rompe antes de que lo haga otro."
- Botones: **Ver proyectos →** (`/proyectos`) y **Contacto** (`/contacto`). Rutas reales, no las anclas `#projects`/`#contact` de hoy.

### Interacciones (todas aprobadas)
- **Mouse**: los glifos se apartan y se acercan a la cámara alrededor del cursor; la escena se inclina levemente hacia el mouse (parallax contenido, no navegación libre). Solo con `(hover: hover) and (pointer: fine)`.
- **Escaneo de auditoría**: cada ~7.5 s una línea ámbar recorre **solo el nombre** de arriba abajo; los glifos bajo la línea se encienden y se revuelven como si los leyera.
- **Hallazgos**: el escaneo marca **exactamente 4 glifos** repartidos a lo ancho del nombre, cada uno con una etiqueta mini en mono (`xss`, `sqli`, `secret expuesto`, `csrf`): aparecen en rojo al ser encontrados y pasan a verde con ✓ al corregirse. Se probó con ~1.2 % de glifos (≈41 hallazgos) y no se notaba ninguno.
- **Estado en la esquina inferior derecha** (mono, pequeño): `$ audit ./misael ✓ limpio` → `escaneando 63% · 3 hallazgos` → `✓ 4 hallazgos corregidos` → `✓ limpio`.
- **Código vivo**: de vez en cuando un glifo cambia de carácter.
- **Clic / toque en el fondo**: onda expansiva que empuja los glifos (funciona también en táctil).
- **Scroll**: el nombre se deshace hacia arriba en glifos sueltos y se desvanece; transición suave hacia el resto del home.
- **Easter egg**: escribir `whoami` en el teclado (con el hero en pantalla, fuera de inputs) reordena el código en `/sobre-mi →`; clic o Enter navega a `/sobre-mi`. Vuelve al nombre a los 7 s. Durante el easter egg no corre el escaneo.

Descartado a propósito: sonido, más partículas/colores, cursor personalizado dentro del hero (compite con la repulsión).

### Implementación de referencia (del mockup)
- Un `THREE.Points` con `ShaderMaterial`; cada punto dibuja un glifo desde un **atlas** (canvas 8×4 celdas, JetBrains Mono 500).
- Atributos por punto: `aTarget` (posición en el nombre, muestreada de un canvas 2D con "Misael." en DM Serif), `aStart` (posición dispersa), `aTarget2` (posición en `/sobre-mi →`), `aGlyph`, `aSeed`, `aDot` (el punto del nombre va en acento), `aBug`.
- Uniforms: `uProgress` (intro), `uScan`/`uScanOn`, `uMouse`/`uMouseStr`, `uClick`/`uClickT`, `uScroll`, `uMorph`, colores por tema (`uBase`, `uAccent`, `uAmber`, `uRed`, `uGreen`), `uAlphaMul` (polvo de fondo).
- Capa de "polvo" de ~420 glifos tenues en profundidad (180 en móvil).
- Las etiquetas de hallazgos son elementos DOM proyectados desde la posición 3D de cada glifo (`Vector3.project`).
- En Next.js: componente cliente con `dynamic(..., { ssr:false })` para la escena; el `<h1>` y el resto del hero se renderizan en el servidor. Importar de `three` solo lo necesario.

## Robustez (condiciones reales del sitio)

- **Tema claro** (`data-theme="light"`, tokens de `globals.css`): glifos navy con trazo extra en el atlas para que tengan "tinta", `NormalBlending` en vez de aditivo, escaneo `#b86a00`, etiquetas rojo `#b3261e` / verde `#146c43` sobre fondos claros, polvo de fondo al 30 %. Cambia en vivo.
- **AccessibilityWidget**, en vivo con `MutationObserver` sobre `<html>` (igual criterio que `Footer.tsx`):
  - `data-a11y-motion="reduced"` o `prefers-reduced-motion`: sin intro, sin escaneo, sin onda, sin mouse; nombre formado y quieto; se renderiza **solo cuando algo cambia** (no gasta batería).
  - `data-a11y-contrast="high"` o `data-a11y-dyslexia="on"`: se oculta el canvas y queda "Misael." como **texto sólido** con los colores de alto contraste. Un nombre hecho de glifos es justo lo que esas personas pidieron no ver. Al desactivarlo vuelve el código (y si Three.js nunca cargó, se carga en ese momento).
- **Sin WebGL, CDN caído o `hardwareConcurrency ≤ 2`**: hero tipográfico (el `<h1>` real), sin escaneo. Verificado en desktop y 400 px.
- **Red de seguridad**: si Three.js tarda más de ~3.2 s, el eyebrow/subtítulo/botones aparecen igual.
- Se pausa fuera de pantalla (`IntersectionObserver`) y con la pestaña oculta (`visibilitychange`). `devicePixelRatio` limitado a 1.5.

## Rendimiento

- Benchmark invisible antes de la intro (partículas aún con alfa 0): si baja de **45 fps**, calidad baja: `pixelRatio` 1, polvo reducido (160 / 60 en móvil) y separación de glifos ×1.25 (×1.08 en móvil), manteniendo casi todos los glifos del nombre para que se siga leyendo. Con la CPU frenada ×6 en Playwright bajó solo a calidad baja y el nombre siguió legible.
- **Meta de implementación**: Lighthouse **≥ 90 en móvil** medido en el sitio real (no estimado). Como el `<h1>` es invisible mientras carga el 3D, el LCP pasa a ser el subtítulo (~1.4 s tras la intro); si Lighthouse lo marca mal, mostrar el subtítulo desde el primer paint, sin retraso.

## Loader: "muro de código"

Primera visita de la sesión. La pantalla es un **muro de glifos** (los mismos del hero, JetBrains Mono, tenues) partido en dos mitades, con una mini terminal Kali al centro que ejecuta `./entrar.sh` y lista la carga **real**:
`[ ok ] fuentes cargadas` → `[ ok ] three.js listo` → `[ ok ] escena: 2.713 glifos` → `[ ok ] calidad: completa · 55 fps` → `acceso listo.`, con barra de progreso (`role="progressbar"`) y porcentaje.

- Mientras carga: el muro se va "encendiendo" con el progreso, algunos glifos cambian solos y, con mouse, los glifos cercanos al cursor se iluminan como una linterna.
- El progreso refleja etapas reales (fuentes 25 %, Three.js 55 %, escena 82 %, benchmark 100 %), nunca avanza más rápido que un mínimo de ~1.7 s para que se alcance a leer, y nunca por delante de lo que de verdad cargó. No es una espera falsa: al abrir, el hero ya está listo.
- **Al completarse**: aparece una **rendija de luz vertical** en el centro (late suave) y el botón **Entrar →**, que recibe el foco. Pista: "o pulsa Enter" (en táctil: "o toca en cualquier parte").
- **Al entrar** (clic en cualquier parte del muro, el botón, Enter o toque): las dos mitades se abren hacia los lados con un leve giro 3D (`rotateY` ±14°, 1.15 s) y **desde la rendija sale el código que forma "Misael."** en el hero.

Reglas para que no espante a quien tiene prisa (reclutadores/clientes):
- **Una vez por sesión** (`sessionStorage`); un script inline antes del primer paint lo oculta en visitas siguientes, sin parpadeo.
- **"Saltar intro"** visible desde el primer segundo (abajo a la derecha) y **Esc** también salta. Si se salta antes de terminar, el hero sigue cargando detrás y arranca normal.
- Mientras el muro está cerrado, el resto de la página es `inert` (el foco de teclado no se va detrás); es un `role="dialog"` con `aria-modal`.
- Tema claro: glifos navy sobre fondo claro. Movimiento reducido: la barra se llena sin animación y el muro desaparece sin abrirse. Alto contraste/dislexia: termina en "modo texto (accesibilidad)" sin cargar Three.js.
- Descartado: botón para repetir la animación en el sitio real (el del mockup es solo del panel de pruebas).

## Home resumido (debajo del hero)

Etiquetas de sección en JetBrains Mono con estilo de comentario (`// 01 · qué hago`), misma voz que el eyebrow. Títulos en DM Serif Display. Cada bloque aparece una sola vez con un fade sutil al entrar en pantalla (desactivado con movimiento reducido).

1. **`// 01 · qué hago`** — "Construyo software y reviso el de otros." Dos tarjetas:
   - *Desarrollo*: sitios y landing pages, apps web full-stack, apps móviles y sistemas a medida. Línea de stack en mono: `React · Next.js · Vue · Node.js · Flutter` (Flutter confirmado: es con lo que se construye la app Base).
   - *Auditoría de código*: "Reviso tu repositorio y te entrego un informe con hallazgos priorizados: qué es crítico y qué puede esperar. No ofrezco pentesting por ahora." + mini línea `$ audit ./tu-repo xss ✓ secret expuesto ✓` (eco del hero).
   - Link "Ver servicios y cómo trabajo →" (`/servicios`). Sección nueva respecto al home de hoy: para un freelance, qué le puede hacer a un cliente es lo primero que el cliente busca.
2. **`// 02 · proyectos`** — "Lo que he construido". **3 filas sutiles** (mismo patrón de hover aprobado en `/proyectos`: filas hermanas atenuadas + línea fina de acento), en el orden curado: **MEDI-IA** (97.1 % Recall@1), **AnimalVision** (93.4 % accuracy), **Sistema de librería** (1 archivo reescrito al cambiar de BD). Datos desde `lib/projects.ts`. Link "Ver los 4 proyectos →".
3. **`// 03 · sobre mí`** — la frase del gym en DM Serif + mini consola Kali (prompt de dos líneas) que escribe `whoami` una vez al entrar en pantalla, sin respuesta; "Conóceme mejor →" (`/sobre-mi`).
4. **`// 04 · contacto`** — "¿Tienes un proyecto en mente?" / "Cuéntame qué necesitas construir o revisar y te respondo con una propuesta." / botón **Hablemos →** (`/contacto`). El formulario mad-libs vive solo en `/contacto`.
5. Footer "Cordilleras" (ya en producción, sin cambios).

Sale del home: la bio en 2 columnas, skills y stats de GitHub del `AboutSection` actual (pasa a `/sobre-mi`), y la grilla de 4 tarjetas de proyectos.

Verificado en el mockup: axe-core (WCAG 2 A/AA) sobre todo el `<main>` con **0 violaciones** en desktop, móvil 400 px y tema claro; sin errores de JS.

## Pendiente

- Este diseño se construyó sobre la paleta navy (`#0B1220`) del rediseño grande, que aún no está implementado. Al pasar a código, decidir si el home nuevo sale junto con el rediseño o antes, sobre los tokens actuales.
