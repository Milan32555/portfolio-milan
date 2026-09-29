import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ancla la raíz del workspace a este proyecto: evita que Next.js confunda
  // la raíz cuando detecta un package-lock.json suelto en una carpeta padre.
  turbopack: {
    root: path.join(__dirname),
  },
  // <ViewTransition> de React: "Misael." viaja entre la barra y el sidebar (spec 2026-09-28).
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
