import PrePaintScript from "@/components/home/PrePaintScript";
import CodeGate from "@/components/gate/CodeGate";
import Hero from "@/components/hero/Hero";
import { AboutPreview, ContactCta, ProjectsPreview, ServicesPreview } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <noscript>
        <style>{".fade-in-section{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <PrePaintScript />
      <CodeGate />
      <main id="main-content">
        <Hero />
        <ServicesPreview />
        <ProjectsPreview />
        <AboutPreview />
        <ContactCta />
      </main>
    </>
  );
}
