import type { Metadata, ResolvingMetadata } from "next";
import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const parentOg = (await parent).openGraph;
  const description = "Escríbele a Misael para un proyecto de desarrollo web o móvil, o para auditar el código de tu aplicación.";
  return {
    title: "Contacto",
    description,
    alternates: { canonical: "/contacto" },
    openGraph: {
      title: "Contacto — Misael",
      description,
      url: "/contacto",
      type: "website",
      siteName: parentOg?.siteName,
      locale: parentOg?.locale,
      images: parentOg?.images,
    },
    twitter: { card: "summary_large_image", title: "Contacto — Misael", description },
  };
}

export default function ContactoPage() {
  return (
    <main id="main-content">
      <div className={`section ${styles.wrap}`}>
        <p className="section-label">Contacto</p>
        <h1 className={`section-title ${styles.h1}`}>Hablemos</h1>
        <p className={styles.lead}>Cuéntame qué necesitas construir o revisar y te respondo con una propuesta.</p>
        <div className={styles.form}>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
