<div align="center">

# Misael.

**Portfolio personal — desarrollador freelance y auditor de código.**

El nombre está hecho de código: ~2.700 glifos en Three.js que un escáner audita en vivo.

[**Ver en vivo →**](https://portfolio-milan-omega.vercel.app) · [Proyectos](https://portfolio-milan-omega.vercel.app/proyectos) · [Sobre mí](https://portfolio-milan-omega.vercel.app/sobre-mi) · [Contacto](https://portfolio-milan-omega.vercel.app/contacto)

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000?logo=threedotjs)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000?logo=vercel)

</div>

---

## Lo que tiene de distinto

| | |
|---|---|
| **Muro de código** | Loader de primera visita: un muro de glifos con una terminal Kali que muestra la carga **real** (fuentes, Three.js, escena, calidad). Al entrar, el muro se abre en dos y el código sale de la rendija. Se dibuja en un **Web Worker con OffscreenCanvas**, así que no bloquea el hilo principal. Una vez por sesión, con "Saltar intro" y Esc. |
| **Hero "Misael." hecho de código** | `THREE.Points` + `ShaderMaterial` sobre un atlas de glifos. Un escaneo de auditoría recorre el nombre y marca 4 hallazgos (`xss`, `sqli`, `secret expuesto`, `csrf`) que pasan de rojo a verde. Reacciona al mouse, hace una onda al clic y se deshace al hacer scroll. |
| **Easter egg** | Escribe `whoami` en el home. |
| **Consola en `/sobre-mi`** | Una terminal estilo Kali que se escribe sola (`whoami`, `stack --list`, `status --current`) con los comandos extra `neofetch` y `history`. |
| **Expediente de proyectos** | Cada proyecto tiene cifras verificables, su arquitectura explicada en lenguaje simple y un expediente por carpetas. |
| **Footer "Cordilleras"** | Una noche en los Andes en capas SVG, con luciérnagas que reaccionan al cursor. |

## Robustez y accesibilidad

- **Sin salto al cargar**: el `<h1>` real está en el HTML (SEO y lectores de pantalla) y un script previo al primer paint lo oculta mientras llega el 3D.
- **Degradación elegante**: sin WebGL, con carga lenta, con el contexto perdido o **sin JavaScript**, el sitio pasa a un hero tipográfico y todo el contenido sigue visible.
- **Calidad adaptativa**: un benchmark invisible mide los fps y ajusta la densidad. La escena se construye por pasos para no bloquear el navegador.
- **Widget de accesibilidad propio**: tamaño de texto, alto contraste, fuente para dislexia y movimiento reducido. El hero y el muro reaccionan **en vivo** a cada opción.
- Tema claro y oscuro, `prefers-reduced-motion`, foco gestionado, `inert` mientras el muro está cerrado, contraste **WCAG AA**. axe da 0 violaciones en `/`, `/sobre-mi` y `/contacto`.
- Lighthouse móvil: `/sobre-mi` 94, `/contacto` 93, `/proyectos` 92, y accesibilidad de 96 a 100.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19
- **Lenguaje**: TypeScript estricto
- **3D**: Three.js (import dinámico, cargado solo en el home)
- **Estilos**: CSS Modules + tokens CSS globales + Tailwind CSS 4
- **Fuentes**: DM Serif Display, DM Sans y JetBrains Mono (autohospedadas con `next/font`)
- **Contacto**: API route + [Resend](https://resend.com) (honeypot y rate limiting)
- **Tests**: `node:test` con TypeScript nativo sobre la lógica pura de `lib/`
- **Deploy**: Vercel (preview por PR, producción al fusionar en `main`)

## Estructura

```
app/
  page.tsx              # Home: script previo al paint + muro + hero + secciones
  sobre-mi/             # Consola estilo Kali
  proyectos/            # Lista y detalle con Expediente ([slug])
  contacto/             # Formulario
  api/contact/route.ts  # Envío con Resend
  layout.tsx            # Fuentes, navbar, footer, accesibilidad
  opengraph-image.tsx · robots.ts · sitemap.ts
components/
  gate/                 # Muro de código (CodeGate + wall en Web Worker)
  hero/                 # Hero, HeroScene (Three.js), shaders, paletas
  home/                 # Secciones resumidas, MiniTerminal, Reveal
  sobre-mi/             # KaliConsole
  proyectos/            # Expediente, ArchitectureFlow, portadas…
  Navbar · Footer · AccessibilityWidget · CustomCursor · ContactForm
lib/                    # Lógica pura con tests: glifos, escaneo, calidad,
                        # progreso del muro, bus loader↔hero, proyectos…
docs/superpowers/       # Specs, planes, investigación y mockups del diseño
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa las variables (ver abajo)
npm run dev                  # http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint (incluye las reglas de React Compiler) |
| `npm test` | Tests de `lib/**/*.test.ts` con `node --test` |

## Variables de entorno

El formulario de contacto usa [Resend](https://resend.com) (plan gratuito: 3.000 correos al mes):

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=tu@email.com
```

Sin estas variables el formulario responde con un error controlado y el resto del sitio funciona igual.

## Deploy

El proyecto está conectado a Vercel con la integración de GitHub: cada PR genera un **preview** y cada merge a `main` va a **producción**. Para un deploy propio, importa el repo en [vercel.com/new](https://vercel.com/new) y agrega `RESEND_API_KEY` y `CONTACT_TO_EMAIL`.

> La URL del sitio (`https://portfolio-milan-omega.vercel.app`) está en `app/layout.tsx`, `app/robots.ts` y `app/sitemap.ts`. Si conectas un dominio propio, actualiza `siteUrl` en esos archivos.

---

<div align="center">

Hecho por **Misael** · [GitHub](https://github.com/Milan32555)

</div>
