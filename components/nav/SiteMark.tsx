import Link from "next/link";
import styles from "./SiteMark.module.css";

/**
 * "Misael." — la marca del sitio, enlaza al home. `site-mark` (global) la excluye del
 * resaltado de enlaces del AccessibilityWidget. `onClick` lo usa el menú móvil para cerrarse.
 */
export default function SiteMark({ size = "sm", onClick }: { size?: "sm" | "lg"; onClick?: () => void }) {
  return (
    <Link href="/" className={`site-mark ${styles.mark} ${styles[size]}`} onClick={onClick}>
      Misael<span className={styles.dot}>.</span>
    </Link>
  );
}
