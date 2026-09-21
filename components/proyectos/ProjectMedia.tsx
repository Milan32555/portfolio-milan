import Image from "next/image";
import type { Project } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import styles from "./ProjectMedia.module.css";

/**
 * Video de recorrido si existe (sin autoplay: el usuario decide, así cumple prefers-reduced-motion);
 * si no, la portada. Después, la galería de capturas si hay.
 */
export default function ProjectMedia({ project }: { project: Project }) {
  return (
    <div className={styles.media}>
      {project.video ? (
        <figure style={{ margin: 0 }}>
          <video className={styles.video} controls muted playsInline preload="none" poster={project.video.poster} aria-label={project.video.label}>
            <source src={project.video.src} type="video/mp4" />
            Tu navegador no reproduce este video. <a href={project.video.src}>Descárgalo aquí</a>.
          </video>
          <figcaption className={styles.caption}>{project.video.label}</figcaption>
        </figure>
      ) : (
        <ProjectCover project={project} variant="hero" />
      )}

      {project.galeria && project.galeria.length > 0 && (
        <ul className={styles.gallery} aria-label="Capturas">
          {project.galeria.map((g) => (
            <li key={g.src} className={styles.shot}>
              <Image src={g.src} alt={g.alt} width={g.width} height={g.height} sizes="(max-width: 700px) 100vw, 320px" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
