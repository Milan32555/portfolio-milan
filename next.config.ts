import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ancla la raíz del workspace a este proyecto: evita que Next.js confunda
  // la raíz cuando detecta un package-lock.json suelto en una carpeta padre.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
