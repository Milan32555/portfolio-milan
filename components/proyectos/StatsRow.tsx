import type { Stat } from "@/lib/projects";
import styles from "./StatsRow.module.css";

export default function StatsRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <ul className={styles.stats} aria-label="Cifras destacadas">
      {stats.map((s) => (
        <li key={s.label} className={styles.stat}>
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
