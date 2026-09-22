import Image from "next/image";
import { coverLayers, hueFor } from "@/lib/cover";
import type { Project } from "@/lib/projects";
import styles from "./ProjectCover.module.css";

interface Props {
  project: Project;
  variant?: "row" | "hero";
}

const SIZES = { row: { w: 480, h: 300 }, hero: { w: 840, h: 360 } } as const;

/** Captura real si existe; si no, una portada generada determinista (nunca una imagen rota). */
export default function ProjectCover({ project, variant = "row" }: Props) {
  const frame = `${styles.frame} ${styles[variant]}`;

  if (project.cover) {
    return (
      <div className={frame}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={variant === "row" ? "(max-width: 700px) 100vw, 230px" : "(max-width: 1100px) 100vw, 1000px"}
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
      </div>
    );
  }

  const { w, h } = SIZES[variant];
  const hue = hueFor(project.slug);
  const layers = coverLayers(hue * 7, w, h, hue);
  const gradId = `pc-g-${project.slug}-${variant}`;
  const dotsId = `pc-d-${project.slug}-${variant}`;

  return (
    <div className={frame}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Portada de ${project.title}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`hsl(${hue} 55% 14%)`} />
            <stop offset="1" stopColor={`hsl(${hue} 60% 30%)`} />
          </linearGradient>
          <pattern id={dotsId} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1" fill={`hsl(${hue} 90% 75%)`} opacity="0.5" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${gradId})`} />
        {layers.map((l, i) => (
          <g key={i} className={`${styles.layer} pj-l${i}`}>
            <path d={l.d} fill={l.fill} />
            {l.dots && <path d={l.d} fill={`url(#${dotsId})`} opacity="0.28" />}
          </g>
        ))}
        <text
          x={variant === "hero" ? 36 : 22}
          y={variant === "hero" ? 60 : 44}
          fill="#f0f0f2"
          opacity="0.92"
          fontSize={variant === "hero" ? 34 : 24}
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          {project.title}
        </text>
      </svg>
    </div>
  );
}
