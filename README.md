# portfolio-milan

Portfolio personal de **Misael** — Ingeniero en Sistemas & Ethical Hacker.

Construido con Next.js 16, TypeScript y Tailwind CSS. Diseño dark/light, cursor personalizado, loader animado, accesibilidad WCAG y rendimiento optimizado.

## Stack

- **Framework:** Next.js 16 + React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4 + CSS custom properties
- **Fuentes:** DM Sans / DM Serif Display (Google Fonts)

## Features

- Tema dark/light con persistencia en localStorage
- Loader animado con efecto de cortina
- Cursor personalizado con anillo de seguimiento
- Video de fondo con parallax al movimiento del mouse
- Animaciones de entrada con Intersection Observer
- Widget de accesibilidad (tamaño de fuente, alto contraste, fuente disléxica, movimiento reducido)
- Cumplimiento WCAG 2.1 (skip-link, aria-live, lang, semántica)
- Totalmente responsivo

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura

```
app/
  page.tsx        # Secciones: Hero, Proyectos, About, Contacto
  layout.tsx      # Metadata, providers, accesibilidad
  globals.css     # Design tokens y estilos globales
components/
  Navbar.tsx
  Loader.tsx
  HeroVideo.tsx
  CustomCursor.tsx
  AccessibilityWidget.tsx
```

## GitHub

[github.com/Milan32555](https://github.com/Milan32555)
