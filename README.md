# portfolio-milan

Portfolio personal de **Misael** — Ingeniero en Sistemas & Ethical Hacker.

Construido con Next.js 16, TypeScript y Tailwind CSS. Diseño dark/light, cursor personalizado, loader animado, accesibilidad WCAG y rendimiento optimizado.

## Stack

- **Framework:** Next.js 16 + React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4 + CSS custom properties
- **Fuentes:** DM Sans / DM Serif Display (Google Fonts, autohospedadas vía `next/font`)
- **Contacto:** API route + [Resend](https://resend.com)

## Features

- Tema dark/light con persistencia en localStorage
- Loader animado con efecto de cortina
- Cursor personalizado con anillo de seguimiento
- Video de fondo optimizado (1080p, ~2.7MB) con parallax al movimiento del mouse y poster para carga instantánea
- Animaciones de entrada con Intersection Observer
- Widget de accesibilidad (tamaño de fuente, alto contraste, fuente disléxica, movimiento reducido)
- Cumplimiento WCAG 2.1 (skip-link, aria-live, lang, semántica)
- Formulario de contacto funcional (envía email real vía Resend, con honeypot anti-spam y rate limiting)
- SEO: metadata completa, Open Graph dinámico, `robots.txt` y `sitemap.xml`
- Totalmente responsivo

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa las variables (ver abajo)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Variables de entorno

El formulario de contacto necesita una cuenta gratuita en [Resend](https://resend.com) (3000 emails/mes gratis):

1. Crea una cuenta en [resend.com](https://resend.com)
2. Genera una API key en [resend.com/api-keys](https://resend.com/api-keys)
3. Copia `.env.example` a `.env.local` y completa:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=tu@email.com
```

Sin estas variables, el formulario responde con un error controlado (no rompe el sitio).

## Deploy en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) con tu cuenta.
2. Importa el repo `Milan32555/portfolio-milan` desde GitHub.
3. En **Environment Variables**, agrega `RESEND_API_KEY` y `CONTACT_TO_EMAIL` (las mismas del paso anterior).
4. Deploy — Vercel detecta Next.js automáticamente, no requiere configuración extra.
5. Cada push a `main` vuelve a desplegar solo.

También puedes usar la CLI:

```bash
npm i -g vercel
vercel login
vercel        # deploy de preview
vercel --prod # deploy a producción
```

> Nota: `app/layout.tsx`, `app/robots.ts` y `app/sitemap.ts` usan `https://portfolio-milan.vercel.app` como URL del sitio. Si usas un dominio distinto, actualiza la constante `siteUrl` en esos tres archivos.

## Estructura

```
app/
  page.tsx             # Secciones: Hero, Proyectos, About, Contacto
  layout.tsx           # Metadata, providers, accesibilidad
  globals.css          # Design tokens y estilos globales
  opengraph-image.tsx  # Imagen OG generada dinámicamente
  robots.ts            # robots.txt
  sitemap.ts           # sitemap.xml
  api/contact/route.ts # Endpoint del formulario de contacto (Resend)
components/
  Navbar.tsx
  Loader.tsx
  HeroVideo.tsx
  CustomCursor.tsx
  AccessibilityWidget.tsx
```

## GitHub

[github.com/Milan32555](https://github.com/Milan32555)
