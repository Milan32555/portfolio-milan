import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import { LoaderProvider } from "@/components/LoaderContext";
import AccessibilityWidget from "@/components/AccessibilityWidget";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-dm-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-serif",
});

const siteUrl = "https://portfolio-milan-omega.vercel.app";
const title = "Misael — Frontend Developer | React, Next.js & Vue.js";
const description =
  "Portfolio de Misael: Ingeniero en Sistemas y Ethical Hacker. Desarrollo web con React, Next.js y Vue.js. Mira mis proyectos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Misael",
  },
  // WCAG 2.4.2 — título descriptivo y único que identifica el propósito de la página
  description,
  keywords: [
    "Misael",
    "Frontend Developer",
    "React",
    "Next.js",
    "Vue.js",
    "TypeScript",
    "Ethical Hacking",
    "Portfolio",
  ],
  authors: [{ name: "Misael", url: "https://github.com/Milan32555" }],
  creator: "Misael",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // WCAG 3.1.1 — lang="es" permite a los lectores de pantalla
    // usar la pronunciación y gramática correcta del idioma
    <html lang="es" className="h-full">
      <body className={`${dmSans.className} ${dmSans.variable} ${dmSerifDisplay.variable} antialiased h-full`}>
        <LoaderProvider>

          {/*
            WCAG 2.4.1 — Skip to content
            Oculto visualmente pero accesible por teclado (Tab).
            Salta la navbar y lleva al usuario directo al contenido.
            Se hace visible al recibir foco (:focus en .skip-link).
          */}
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>

          {/*
            WCAG 4.1.3 — Región aria-live
            Anuncia dinámicamente mensajes de estado (envío de formulario,
            cambio de tema) a lectores de pantalla sin mover el foco.
            "polite" = espera a que el usuario termine de leer.
          */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            id="a11y-announcer"
          />

          <CustomCursor />
          <Loader />
          <Navbar />
          {children}
          <AccessibilityWidget />
        </LoaderProvider>
      </body>
    </html>
  );
}