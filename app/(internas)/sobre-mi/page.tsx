import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import KaliConsole from "@/components/sobre-mi/KaliConsole";
import ConsoleAnimScript from "@/components/sobre-mi/ConsoleAnimScript";
import styles from "./page.module.css";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const parentOg = (await parent).openGraph;
  const description =
    "Misael: desarrollador freelance y auditor de código. Empezó en seguridad con El Pingüino de Mario y S4vitar; hoy construye con React, Next.js, Flutter y Python.";
  return {
    title: "Sobre mí",
    description,
    alternates: { canonical: "/sobre-mi" },
    openGraph: {
      title: "Sobre mí — Misael",
      description,
      url: "/sobre-mi",
      type: "website",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: "Sobre mí — Misael", description },
  };
}

export default function SobreMiPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <p className="section-label">Sobre mí</p>
        <h1 className={styles.big}>
          Construyo con la misma disciplina con la que entreno: <em>poco a poco, sin atajos.</em>
        </h1>
        <ConsoleAnimScript />
        <KaliConsole />
        <div className={styles.cta}>
          <Link className="btn-primary" href="/contacto">
            Hablemos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
