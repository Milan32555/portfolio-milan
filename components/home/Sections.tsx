import Link from "next/link";
import styles from "./Home.module.css";
import Reveal from "./Reveal";
import MiniTerminal from "./MiniTerminal";
import { projectNumber, projects } from "@/lib/projects";

export function ServicesPreview() {
  return (
    <section className={styles.sec} aria-labelledby="t-svc">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 01 · qué hago"}</p>
          <h2 id="t-svc" className={styles.title}>
            Construyo software y reviso el de otros.
          </h2>
        </Reveal>
        <div className={styles.svc}>
          <Reveal className={styles.card}>
            <h3>Desarrollo</h3>
            <p>Sitios y landing pages, apps web full-stack, apps móviles y sistemas a medida para negocios.</p>
            <div className={styles.mini}>React · Next.js · Vue · Node.js · Flutter</div>
          </Reveal>
          <Reveal className={styles.card} delay={80}>
            <h3>Auditoría de código</h3>
            <p>
              Reviso tu repositorio y te entrego un informe con hallazgos priorizados: qué es crítico y qué puede esperar. No ofrezco
              pentesting por ahora.
            </p>
            <div className={styles.mini}>
              $ audit ./tu-repo <span className={styles.chip}>xss ✓</span>
              <span className={styles.chip}>secret expuesto ✓</span>
            </div>
          </Reveal>
        </div>
        <Link className={styles.more} href="/servicios">
          Ver servicios y cómo trabajo →
        </Link>
      </div>
    </section>
  );
}

export function ProjectsPreview() {
  const featured = projects.slice(0, 3);
  return (
    <section className={styles.sec} aria-labelledby="t-proj">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 02 · proyectos"}</p>
          <h2 id="t-proj" className={styles.title}>
            Lo que he construido
          </h2>
        </Reveal>
        <Reveal>
          <ul className={styles.rows}>
            {featured.map((p) => (
              <li key={p.slug}>
                <Link href={`/proyectos/${p.slug}`}>
                  <span className={styles.num}>{projectNumber(p.slug)}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.summary}</p>
                  </div>
                  <span className={styles.metric}>
                    {p.metric.value}
                    <small>{p.metric.label}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <Link className={styles.more} href="/proyectos">
          Ver los {projects.length} proyectos →
        </Link>
      </div>
    </section>
  );
}

export function AboutPreview() {
  return (
    <section className={styles.sec} aria-labelledby="t-about">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 03 · sobre mí"}</p>
        </Reveal>
        <div className={styles.about}>
          <Reveal>
            <h2 id="t-about" className={styles.big}>
              Construyo con la misma disciplina con la que entreno: <em>poco a poco, sin atajos.</em>
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <MiniTerminal />
          </Reveal>
        </div>
        <Link className={styles.more} href="/sobre-mi">
          Conóceme mejor →
        </Link>
      </div>
    </section>
  );
}

export function ContactCta() {
  return (
    <section className={`${styles.sec} ${styles.contact}`} aria-labelledby="t-contact">
      <div className="section">
        <Reveal>
          <p className={styles.label}>{"// 04 · contacto"}</p>
          <h2 id="t-contact" className={styles.title}>
            ¿Tienes un proyecto en mente?
          </h2>
          <p className={styles.lead}>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
          <Link className="btn-primary" href="/contacto">
            Hablemos <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
