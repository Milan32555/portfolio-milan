import type { Project } from "@/lib/projects";

interface Props {
  project: Project;
  variant?: "row" | "detail";
  className?: string;
}

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

/**
 * "Ver demo" solo existe si el proyecto tiene demo (un botón que no aplica se omite, no se deshabilita).
 * La acción primaria es la demo; si no hay, es el código.
 */
export default function ProjectActions({ project, variant = "row", className }: Props) {
  const demoLabel = variant === "detail" ? "Ver demo en vivo" : "Ver demo";
  const newTab = "(se abre en una pestaña nueva)";

  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
      {project.demo && (
        <a
          className="btn-primary"
          href={project.demo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${demoLabel} de ${project.title} ${newTab}`}
        >
          {demoLabel} <ExternalIcon />
        </a>
      )}
      <a
        className={project.demo ? "btn-ghost" : "btn-primary"}
        href={project.repo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver código de ${project.title} en GitHub ${newTab}`}
      >
        <GitHubIcon /> Ver código
      </a>
    </div>
  );
}
