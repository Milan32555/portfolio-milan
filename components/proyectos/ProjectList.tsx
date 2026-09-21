import Link from "next/link";
import { isLive, projectNumber, projects } from "@/lib/projects";
import ProjectActions from "./ProjectActions";
import ProjectCover from "./ProjectCover";
import styles from "./ProjectList.module.css";

export default function ProjectList() {
  return (
    <ol className={styles.rows}>
      {projects.map((p) => {
        const live = isLive(p);
        return (
          <li key={p.slug} className={styles.row}>
            <span className={styles.tab} aria-hidden="true">
              <i />
              EXP-{projectNumber(p.slug)}
            </span>

            <div className={styles.cover}>
              <ProjectCover project={p} variant="row" />
            </div>

            <div className={styles.body}>
              <h2 className={styles.title}>
                <Link href={`/proyectos/${p.slug}`}>
                  {p.title}
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </h2>
              <p className={styles.summary}>{p.summary}</p>

              <div className={styles.meta}>
                <span className={styles.metric}>
                  <b>{p.metric.value}</b>
                  <span>{p.metric.label}</span>
                </span>
                <span className={`${styles.status} ${live ? styles.live : styles.code}`}>
                  <i aria-hidden="true" />
                  {live ? "Demo en vivo" : "Solo código"}
                </span>
                <span className={styles.ctx}>{p.context === "universitario" ? "Proyecto universitario" : "Proyecto personal"}</span>
              </div>

              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

              <ProjectActions project={p} variant="row" className={styles.actions} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
