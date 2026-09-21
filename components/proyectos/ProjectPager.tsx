import Link from "next/link";
import { getAdjacent } from "@/lib/projects";
import styles from "./ProjectPager.module.css";

export default function ProjectPager({ slug }: { slug: string }) {
  const { prev, next } = getAdjacent(slug);
  return (
    <nav className={styles.pager} aria-label="Otros proyectos">
      <Link className={styles.link} href={`/proyectos/${prev.slug}`}>
        <span className={styles.hint}><span aria-hidden="true">← </span>Anterior</span>
        <span className={styles.name}>{prev.title}</span>
      </Link>
      <Link className={`${styles.link} ${styles.next}`} href={`/proyectos/${next.slug}`}>
        <span className={styles.hint}>Siguiente<span aria-hidden="true"> →</span></span>
        <span className={styles.name}>{next.title}</span>
      </Link>
    </nav>
  );
}
