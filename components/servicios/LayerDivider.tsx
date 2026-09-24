import styles from "./Servicios.module.css";

/** Dos crestas superpuestas, como el footer Cordilleras en miniatura. Solo decorativo. */
export default function LayerDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <svg viewBox="0 0 720 46" preserveAspectRatio="none" focusable="false">
        <path className={styles.layerBack} d="M0 30 L90 14 L170 24 L260 6 L350 20 L430 10 L520 26 L610 8 L720 22 L720 46 L0 46 Z" />
        <path className={styles.layerFront} d="M0 38 L110 26 L200 34 L300 20 L380 32 L470 22 L560 36 L650 24 L720 32 L720 46 L0 46 Z" />
      </svg>
    </div>
  );
}
