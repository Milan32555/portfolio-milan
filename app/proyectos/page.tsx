import type { Metadata, ResolvingMetadata } from "next";
import ProjectList from "@/components/proyectos/ProjectList";
import { getCounts } from "@/lib/projects";
import styles from "./page.module.css";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const parentOg = (await parent).openGraph;
  const description =
    "Cuatro proyectos elegidos por lo que enseñan: MEDI-IA, AnimalVision, un sistema de librería con Clean Architecture y SafeTransfer AI. Cada uno con su problema, decisiones y evidencia.";
  return {
    title: "Proyectos",
    description,
    alternates: { canonical: "/proyectos" },
    openGraph: {
      title: "Proyectos — Misael",
      description,
      url: "/proyectos",
      type: "website",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: "Proyectos — Misael", description },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProyectosPage() {
  const { total, live, codeOnly } = getCounts();

  return (
    <main id="main-content">
      <div className="section">
        <p className="section-label">Proyectos</p>
        <h1 className={`section-title ${styles.h1}`}>Lo que he construido</h1>
        <p className={styles.lead}>
          Cuatro proyectos, elegidos por lo que enseñan y no por cantidad. Cada uno tiene su expediente con el problema, mis decisiones y la evidencia.
        </p>
        <p className={styles.counts}>
          <b>{pad(total)}</b> expedientes · <span className={styles.live}><b>{pad(live)}</b> con demo en vivo</span> · <b>{pad(codeOnly)}</b> solo código
        </p>

        <ProjectList />

        <a className={styles.archive} href="https://github.com/Milan32555" target="_blank" rel="noopener noreferrer">
          Ver todo en GitHub <span aria-hidden="true">↗</span>
          <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </main>
  );
}
