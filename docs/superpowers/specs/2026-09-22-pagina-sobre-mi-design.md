# /sobre-mi — spec de diseño

> Cerrado en brainstorming el 2026-09-22 (sesión cortada por un apagón; recuperada desde la transcripción). Mockup aprobado: `docs/superpowers/mockups/2026-09-22-sobre-mi-consola.html` (v15). El mockup es un fragmento pensado para el visual companion: abierto directo en el navegador se ve sin el marco, pero el contenido y el comportamiento son los aprobados.

## Concepto

Una **consola real estilo Kali Linux**, en la paleta del sitio (nada de verde neón de "terminal-portfolio"), que se escribe sola y responde quién es Misael. Es el momento propio de esta página, igual que "Cordilleras" en el footer y "Expediente" en `/proyectos`.

Por qué Kali: el origen de Misael en seguridad son **El Pingüino de Mario** y **S4vitar** (YouTube), y el prompt de dos líneas de Kali (zsh) es lo que cualquiera de ese mundo reconoce al instante. Es más auténtico que un bash genérico.

Iteraciones descartadas (para no volver a ellas): arco narrativo de 4 bloques de texto con hilo vertical y números grandes (v1–v3, "muy quieta"); comandos inventados tipo `sudo dame-un-consejo` / `historia --extendida` (rompen la ilusión de terminal real); botón "Repetir animación" (no existe en el sitio real); Georgia como serif (el sitio usa DM Serif Display).

## Estructura

1. Etiqueta de sección + **titular** en DM Serif Display:
   "Construyo con la misma disciplina con la que entreno: *poco a poco, sin atajos.*" (la parte final en `--accent2`).
   - Tipografía de titular, no de párrafo: `line-height` ~1.22, tamaño con `clamp()` hasta ~2.4rem, `letter-spacing:-0.01em`, `text-wrap: balance`, `max-width: 34ch`.
2. **Consola** (ver abajo).
3. CTA **"Hablemos →"** a `/contacto`.

## Consola

- Barra superior con 3 puntos y título `misael@portfolio: ~`.
- Línea inicial tenue: `Last login: hoy — sesión iniciada desde este navegador`.
- Prompt de dos líneas de Kali, antes de cada comando:
  `┌──(misael㉿portfolio)-[~]` / `└─$ ` — usuario y host en verde (`#6bcf6b`), resto en `#8b95b0`.
- Fuente JetBrains Mono, cursor de bloque parpadeante.
- **Resaltado de sintaxis**: los flags (`--list`, `--current`) en ámbar, distinto del comando base.

### Los 4 comandos base (se escriben solos, en orden)

| Comando | Salida |
|---|---|
| `whoami` | Ingeniería en Sistemas, freelance (desarrollo + auditoría de código). Empecé en seguridad viendo a **El Pingüino de Mario** y **S4vitar** en YouTube. (ambos nombres son **links reales** a sus canales, `rel="noopener"`) |
| `stack --list` | `frontend` → React, Next.js, Vue.js · `móvil` → Flutter · `backend` → Node.js, Python · `ia` → Deep Learning (categorías en `--accent2`; `móvil` se agregó al confirmar que Base se construye con Flutter, no estaba en el mockup v15) |
| `status --current` | **Base** (app móvil, cliente privado) — chip con punto pulsante "en revisión de tiendas". Cliente conforme con el resultado. |
| `fuera-de-codigo` | gym · inglés |

Sobre **Base**: es prueba social real y honesta (el repo es privado; el cliente está satisfecho; esperando verificación de tiendas). No se inventa una cita, un nombre de cliente ni un logo. Cuando la app salga publicada, actualizar el status (y considerar pedir un testimonio real).

### Comandos bonus (el único elemento interactivo)

Barra fija **debajo** del área de texto (no dentro del log), con dos botones que se escriben con el mismo tipeo que los base y quedan deshabilitados tras usarse:

- **`neofetch`** — ficha estilo specs de sistema con un logo ASCII: `OS: Misael OS (navy edition)`, `Host: portfolio`, `Shell: zsh`, `Rol: …`, `Uptime: estudiante + freelance desde 2025`, y la barrita de colores del comando real.
- **`history`** — historial falso pero honesto de la trayectoria: `youtube.com/watch?v=writeup-ctf-01` → `apt install curiosidad` → `git clone primer-proyecto-que-funciono.git` → `code . # y ya no paré`.

## Comportamiento

- La animación se dispara **una sola vez** al entrar la consola al viewport (`IntersectionObserver`), no al cargar la página. No se repite.
- Velocidad de tipeo **68 ms por carácter** (se probó 40 ms; el usuario la pidió más lenta).
- **Altura**: la consola **crece** para mostrar los 4 comandos base completos, sin scroll interno. Con altura fija (280 px) Playwright mostró que `whoami`, la respuesta más importante, quedaba scrolleada fuera de vista al terminar, en desktop y en móvil. El scroll interno (auto-scroll al fondo, como una terminal real) solo entra en juego cuando se agregan los comandos bonus (`max-height` ~640 px).
- **Sin sonido de teclas** (se descartó a propósito: audio automático al hacer scroll va contra accesibilidad).

## Accesibilidad

- **Todo el contenido existe en el HTML desde el inicio** (server-rendered); la animación solo lo revela. Sin JS, se lee completo. Lector de pantalla: el texto completo sin depender de la animación (el tipeo va en un elemento `aria-hidden` o se anuncia el resultado final, no letra por letra).
- `prefers-reduced-motion` **y** el toggle del sitio `data-a11y-motion="reduced"` (mismo chequeo explícito en JS que `Footer.tsx`): todo aparece de una, sin tipeo ni parpadeo.
- Contraste AA verificado con axe-core sobre `#070b16`: los tonos tenues del prompt y del "Last login" se subieron de `#5d6b8a`/`#4a5570` a `#8b95b0`. **0 violaciones** en desktop y móvil (400 px) en la v15.
- Los botones bonus son `<button>` reales con `:focus-visible`.

## Relación con el resto del sitio

- El home muestra un **avance** de esta consola (prompt + `whoami` que se escribe solo, sin respuesta) con "Conóceme mejor →". Ver `2026-09-22-home-y-hero-design.md`.
- El hero tiene un easter egg: escribir `whoami` en el teclado forma `/sobre-mi →` y lleva a esta página.
- Reemplaza el `AboutSection` actual del home (bio en 2 columnas + skills + stats de GitHub): ese contenido deja de vivir en el home.

## Pendiente

- Actualizar `status --current` cuando Base salga publicada en las tiendas.
