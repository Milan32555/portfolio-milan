import type { CSSProperties } from "react";
import type { ArchPart } from "@/lib/projects";
import styles from "./ArchitectureFlow.module.css";

export default function ArchitectureFlow({ parts }: { parts: readonly ArchPart[] }) {
  return (
    <section className={styles.arch} aria-labelledby="arquitectura-titulo">
      <p className={styles.eyebrow}>Arquitectura</p>
      <h2 id="arquitectura-titulo" className={styles.title}>De la pantalla a los datos</h2>
      <p className={styles.intro}>Las partes del sistema, en el orden en que viaja la información.</p>
      <ol className={styles.layers} role="list" style={{ "--n": parts.length } as CSSProperties}>
        {parts.map((p, i) => (
          <li key={p.nombre} className={styles.layer}>
            <span className={styles.k}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={styles.name}>{p.nombre}</h3>
            <p className={styles.desc}>{p.descripcion}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
