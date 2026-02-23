"use client";

import { useEffect, useRef } from "react";
import HeroVideo from "@/components/HeroVideo";

/* ─── DATA ──────────────────────────────────────────────────── */
const projects = [
  {
    num: "01",
    title: "App Android — Gestión de Tareas",
    tags: ["Java", "Android", "SQLite"],
    desc: "Aplicación móvil nativa para organización de tareas con persistencia local. Arquitectura MVC, notificaciones push y soporte offline completo.",
    href: "#",
  },
  {
    num: "02",
    title: "Portfolio Personal",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    desc: "Este mismo portfolio — construido con Next.js 16, Tailwind CSS y animaciones CSS puras. Diseño dark/light, totalmente responsivo y optimizado.",
    href: "#",
  },
];

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Java",
  "Android Studio",
  "Tailwind CSS",
  "Git & GitHub",
  "REST APIs",
  "Figma",
];

/* ─── SCROLL REVEAL HOOK ────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── SECTIONS ──────────────────────────────────────────────── */
function ProjectsSection() {
  const ref = useFadeIn();
  return (
    <section id="projects" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section" ref={ref} style={{ opacity: 1 }}>
        <p className="section-label">Proyectos</p>
        <h2 className="section-title">Lo que he construido</h2>

        <div className="projects-grid">
          {projects.map((p) => (
            <a key={p.num} href={p.href} className="project-card fade-in-section visible">
              <p className="card-number">{p.num} — Proyecto</p>
              <div className="card-tags">
                {p.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
              <h3 className="card-title">{p.title}</h3>
              <p className="card-desc">{p.desc}</p>
              <span className="card-arrow">
                Ver proyecto
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const ref = useFadeIn();
  return (
    <section id="about" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Sobre mí</p>
        <div className="about-grid fade-in-section" ref={ref}>
          <div>
            <p className="about-big-text">
              Construyo experiencias web <em>limpias, rápidas</em> y con atención a cada detalle.
            </p>
            <div className="skills-list" style={{ marginTop: "2rem" }}>
              {skills.map((s) => (
                <span key={s} className="skill-pill">
                  <span className="skill-dot" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="about-body">
            <p style={{ marginBottom: "1.2rem" }}>
              Soy <strong style={{ color: "var(--text)", fontWeight: 500 }}>Misael</strong>, desarrollador frontend con pasión por crear interfaces que no solo funcionen — sino que se sientan bien al usarlas.
            </p>
            <p style={{ marginBottom: "1.2rem" }}>
              Me especializo en el ecosistema de <strong style={{ color: "var(--text)", fontWeight: 500 }}>React y Next.js</strong> para web, y en <strong style={{ color: "var(--text)", fontWeight: 500 }}>Java con Android</strong> para aplicaciones móviles nativas. Me interesa la intersección entre diseño y código: cuando los dos trabajan juntos, el resultado es algo especial.
            </p>
            <p>
              Actualmente buscando oportunidades donde pueda contribuir con código de calidad y seguir creciendo junto a un equipo con altos estándares.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const ref = useFadeIn();
  return (
    <section id="contact" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Contacto</p>
        <h2 className="section-title">Hablemos</h2>

        <div className="contact-wrap fade-in-section" ref={ref}>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2.5rem", fontWeight: 300 }}>
            ¿Tienes un proyecto en mente o quieres conectar? Escríbeme — normalmente respondo en menos de 24 horas.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre</label>
              <input id="name" type="text" className="form-input" placeholder="Tu nombre" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-input" placeholder="tu@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">Mensaje</label>
              <textarea id="message" className="form-textarea" placeholder="Cuéntame sobre tu proyecto..." />
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary">
                Enviar mensaje
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <HeroVideo />
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-eyebrow">Frontend Developer · 2026</span>
          <h1 className="hero-title">
            Misael<em>.</em>
          </h1>
          <p className="hero-sub">
            Construyo experiencias web limpias, modernas y de alto rendimiento que marcan la diferencia.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn-primary">
              Ver proyectos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a href="#contact" className="btn-ghost">
              Contacto
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <span>scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      <ProjectsSection />
      <AboutSection />
      <ContactSection />

      <footer className="footer">
        <p style={{ marginBottom: "0.3rem" }}>Portfolio Misael · {new Date().getFullYear()}</p>
        <p style={{ fontSize: "0.72rem" }}>Diseñado y construido con Next.js & Tailwind CSS</p>
      </footer>
    </>
  );
}