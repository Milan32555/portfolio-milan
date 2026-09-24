import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import Reveal from "@/components/home/Reveal";
import Toc from "@/components/servicios/Toc";
import Faq from "@/components/servicios/Faq";
import LayerDivider from "@/components/servicios/LayerDivider";
import styles from "@/components/servicios/Servicios.module.css";
import {
  AUDIT,
  AUDIT_FIT,
  AUDIT_NOTE,
  AUDIT_STEPS,
  DEV_INTRO,
  DEV_LINES,
  DEV_STEPS,
  FAQ,
  INTRO,
  PRICING,
  SECTIONS,
  pageText,
  readingMinutes,
  type Section,
} from "@/lib/servicios";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const parentOg = (await parent).openGraph;
  const description =
    "Desarrollo (sitios, apps web, apps móviles y sistemas a medida) y auditoría de código. Cómo trabajo, cómo cotizo y preguntas frecuentes.";
  return {
    title: "Servicios",
    description,
    alternates: { canonical: "/servicios" },
    openGraph: {
      title: "Servicios — Misael",
      description,
      url: "/servicios",
      type: "website",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: "Servicios — Misael", description },
  };
}

const byId = (id: string): Section => {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Sección desconocida: ${id}`);
  return s;
};

function Heading({ id }: { id: string }) {
  const s = byId(id);
  return (
    <h2 id={`t-${s.id}`} className={styles.h2}>
      <span className={styles.num} aria-hidden="true">
        {s.num}
      </span>
      {s.title}
    </h2>
  );
}

export default function ServiciosPage() {
  const minutes = readingMinutes(pageText());
  return (
    <main id="main-content">
      <div className={styles.layout}>
        <Toc sections={SECTIONS} minutes={minutes} />

        <article className={styles.article}>
          <header>
            <p className="section-label">Servicios</p>
            <h1 className={styles.title}>
              Construyo software y reviso el de otros, <em>empezando por entender el problema.</em>
            </h1>
          </header>

          <section id="intro" className={styles.sec} aria-labelledby="t-intro">
            <Reveal>
              <Heading id="intro" />
              {INTRO.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </section>

          <LayerDivider />

          <section id="desarrollo" className={styles.sec} aria-labelledby="t-desarrollo">
            <Reveal>
              <Heading id="desarrollo" />
              <p>{DEV_INTRO}</p>
            </Reveal>
            <Reveal delay={90}>
              <ul className={styles.rows}>
                {DEV_LINES.map((d) => (
                  <li key={d.title}>
                    <Link href="/contacto">
                      <h3>{d.title}</h3>
                      <p>{d.description}</p>
                      <span className={styles.stack}>{d.stack}</span>
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="auditoria" className={styles.sec} aria-labelledby="t-auditoria">
            <Reveal>
              <Heading id="auditoria" />
              {AUDIT.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className={styles.h3}>Tiene sentido si:</p>
              <ul className={styles.fit}>
                {AUDIT_FIT.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className={styles.note}>{AUDIT_NOTE}</p>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="como-trabajo" className={styles.sec} aria-labelledby="t-como-trabajo">
            <Reveal>
              <Heading id="como-trabajo" />
              <h3 className={styles.h3}>Proyectos de desarrollo</h3>
              <ol className={styles.steps}>
                {DEV_STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    {s.text}
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={90}>
              <h3 className={styles.h3}>Auditoría de código</h3>
              <ol className={styles.steps}>
                {AUDIT_STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    {s.text}
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <LayerDivider />

          <section id="precios" className={styles.sec} aria-labelledby="t-precios">
            <Reveal>
              <Heading id="precios" />
              {PRICING.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </section>

          <LayerDivider />

          <section id="preguntas" className={styles.sec} aria-labelledby="t-preguntas">
            <Reveal>
              <Heading id="preguntas" />
              <Faq items={FAQ} />
            </Reveal>
          </section>

          <section className={`${styles.sec} ${styles.cta}`} aria-labelledby="t-cta">
            <Reveal>
              <h2 id="t-cta" className={styles.h2}>
                ¿Tienes un proyecto en mente?
              </h2>
              <p>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
              <Link className="btn-primary" href="/contacto">
                Hablemos <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </section>
        </article>
      </div>
    </main>
  );
}
