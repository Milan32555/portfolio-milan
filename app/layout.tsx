import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import { LoaderProvider } from "@/components/LoaderContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio Misael",
  description: "Frontend Developer — React, Next.js, Android.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${dmSans.className} antialiased h-full`}>
        <LoaderProvider>
          <CustomCursor />
          <Loader />
          <Navbar />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}