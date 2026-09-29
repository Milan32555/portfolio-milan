import Sidebar from "@/components/nav/Sidebar";
import styles from "./layout.module.css";

/** Páginas internas: sidebar + contenido desde 1024px (spec 2026-09-28). Las URLs no cambian. */
export default function InternasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
