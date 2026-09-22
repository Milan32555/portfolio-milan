import type { Metadata } from "next";
import Link from "next/link";
import KaliConsole from "@/components/sobre-mi/KaliConsole";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Misael: desarrollador freelance y auditor de código. Empezó en seguridad con El Pingüino de Mario y S4vitar; hoy construye con React, Next.js, Flutter y Python.",
  alternates: { canonical: "/sobre-mi" },
};

export default function SobreMiPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <h1 className="section-label">Sobre mí</h1>
        <p className={styles.big}>
          Construyo con la misma disciplina con la que entreno: <em>poco a poco, sin atajos.</em>
        </p>
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
