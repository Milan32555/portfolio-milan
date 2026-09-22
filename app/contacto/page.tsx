import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbele a Misael para un proyecto de desarrollo web o móvil, o para auditar el código de tu aplicación.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <p className="section-label">Contacto</p>
        <h1 className="section-title">Hablemos</h1>
        <p className={styles.lead}>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
        <div className={styles.form}>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
