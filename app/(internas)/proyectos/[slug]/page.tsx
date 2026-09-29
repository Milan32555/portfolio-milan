import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchitectureFlow from "@/components/proyectos/ArchitectureFlow";
import Expediente, { type Carpeta } from "@/components/proyectos/Expediente";
import ProjectActions from "@/components/proyectos/ProjectActions";
import ProjectMedia from "@/components/proyectos/ProjectMedia";
import ProjectPager from "@/components/proyectos/ProjectPager";
import StatsRow from "@/components/proyectos/StatsRow";
import { getProject, projectNumber, projects, type CampoBorrador } from "@/lib/projects";
import styles from "./page.module.css";

// Un slug que no está en `projects` responde 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const parentOg = (await parent).openGraph;
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: {
      title: `${p.title} — Misael`,
      description: p.summary,
      url: `/proyectos/${p.slug}`,
      type: "article",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: `${p.title} — Misael`, description: p.summary },
  };
}

export default async function ProyectoPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const e = p.expediente;
  const draft = (campo: CampoBorrador) => (p.borrador.includes(campo) ? <span className={styles.draft}>borrador</span> : null);

  const carpetas: Carpeta[] = [
    {
      id: "problema",
      titulo: "Problema",
      contenido: (
        <>
          <p className={styles.text}>{e.problema}</p>
          <h4 className={styles.sub}>Qué hace</h4>
          <ul className={styles.list}>{e.queHace.map((x) => <li key={x}>{x}</li>)}</ul>
        </>
      ),
    },
    {
      id: "rol",
      titulo: "Mi rol",
      contenido: <p className={styles.text}>{draft("rol")}{e.rol}</p>,
    },
    {
      id: "decisiones",
      titulo: "Decisiones",
      contenido: (
        <>
          <ul className={styles.list}>
            {e.decisiones.map((d) => (
              <li key={d.titulo}><b>{d.titulo}:</b> {d.texto}</li>
            ))}
          </ul>
          <h4 className={styles.sub}>Lo que decidí no hacer</h4>
          <ul className={styles.list}>{e.noHice.map((x) => <li key={x}>{x}</li>)}</ul>
        </>
      ),
    },
    {
      id: "evidencia",
      titulo: "Evidencia",
      contenido: <ul className={styles.list}>{e.evidencia.map((x) => <li key={x}>{x}</li>)}</ul>,
    },
    {
      id: "resultado",
      titulo: "Resultado",
      contenido: (
        <>
          <p className={styles.text}>{e.resultado}</p>
          <h4 className={styles.sub}>Con más tiempo haría…</h4>
          <ul className={styles.list}>
            {e.conMasTiempo.map((x, i) => (
              <li key={x}>{i === 0 && draft("conMasTiempo")}{x}</li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  return (
    <main id="main-content">
      <div className="section">
        <Link className={styles.back} href="/proyectos">
          <span aria-hidden="true">←</span> Proyectos
        </Link>

        <p className={styles.eyebrow}>
          Expediente {projectNumber(p.slug)} · {p.context === "universitario" ? "Proyecto universitario" : "Proyecto personal"} · {p.periodo} ·{" "}
          {p.estado === "activo" ? "Activo" : "Archivado"}
        </p>
        <h1 className={`section-title ${styles.h1}`}>{p.title}</h1>
        <p className={styles.lead}>{p.summary}</p>

        <ProjectActions project={p} variant="detail" />

        {p.demo?.note && <p className={`${styles.note} ${styles.warn}`} role="note">{p.demo.note}</p>}
        {p.aviso && <p className={styles.note} role="note">{p.aviso}</p>}

        <ProjectMedia project={p} />
        <StatsRow stats={p.stats} />
        <ArchitectureFlow parts={p.arquitectura} />
        <h2 className={styles.srOnly}>Expediente de {p.title}</h2>
        <Expediente carpetas={carpetas} label={`Expediente de ${p.title}`} />
        <ProjectPager slug={p.slug} />

        <aside className={styles.cta} aria-label="Contacto">
          <div>
            <h2>¿Tienes un problema parecido?</h2>
            <p>Cuéntame qué necesitas y vemos si puedo ayudarte.</p>
          </div>
          <Link className="btn-primary" href="/contacto">Hablemos <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </main>
  );
}
