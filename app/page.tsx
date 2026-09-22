"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import { useLoader } from "@/components/LoaderContext";
import { projectNumber, projects } from "@/lib/projects";

// ─── DATOS ────────────────────────────────────────────────────────────────────
const skills = [
  "React", "Next.js", "TypeScript", "Vue.js",
  "Node.js", "Python", "Deep Learning", "Socket.io",
  "Tailwind CSS", "Git & GitHub", "REST APIs", "Ethical Hacking",
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── ÍCONOS ───────────────────────────────────────────────────────────────────
function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { loaderDone } = useLoader();
  const fade = (delay: string) => ({
    opacity: 0 as const,
    animation: loaderDone ? `heroFadeUp 0.7s ${delay} ease-out forwards` : "none",
  });

  return (
    <section className="hero">
      <HeroVideo />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-eyebrow" style={fade("0.15s")}>
          Frontend Developer · 2026
        </span>
        <h1 className="hero-title" style={{ opacity: 0, animation: loaderDone ? "heroFadeUp 0.6s 0.05s ease-out forwards" : "none" }}>
          Misael<em>.</em>
        </h1>
        <p className="hero-sub" style={fade("0.35s")}>
          Construyo experiencias web limpias, modernas y de alto rendimiento que marcan la diferencia.
        </p>
        <div className="hero-actions" style={fade("0.5s")}>
          <a href="#projects" className="btn-primary">
            Ver proyectos <ArrowIcon />
          </a>
          <a href="#contact" className="btn-ghost">Contacto</a>
        </div>
      </div>
      <div className="scroll-hint" style={fade("0.8s")} aria-hidden="true">
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectsSection() {
  const ref = useFadeIn();
  return (
    <section id="projects" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section fade-in-section" ref={ref}>
        <p className="section-label">Proyectos</p>
        <h2 className="section-title">Lo que he construido</h2>
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.slug} className="project-card">
              {/* Número */}
              <p className="card-number">{projectNumber(p.slug)} — Proyecto</p>

              {/* Tags */}
              <div className="card-tags">
                {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>

              {/* Título */}
              <h3 className="card-title">{p.title}</h3>

              {/* Resumen — flex:1 lo empuja hacia abajo */}
              <p className="card-desc">{p.summary}</p>

              {/* Footer de la card */}
              <div className="card-footer">
                <Link href={`/proyectos/${p.slug}`} className="card-arrow" aria-label={`Ver el expediente de ${p.title}`}>
                  Ver detalle <ArrowIcon />
                </Link>
                <a
                  href={p.repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-github"
                  aria-label={`Código de ${p.title} en GitHub (se abre en una pestaña nueva)`}
                  title="Ver código en GitHub"
                >
                  <GitHubIcon size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/proyectos" className="btn-ghost">
            Ver todos los proyectos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const ref = useFadeIn();
  return (
    <section id="about" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Sobre mí</p>
        <div className="about-grid fade-in-section" ref={ref}>
          {/* Columna izquierda */}
          <div>
            <p className="about-big-text">
              Construyo experiencias web <em>limpias, rápidas</em> y con atención a cada detalle.
            </p>

            {/* Skills */}
            <div className="skills-list" style={{ marginTop: "2rem" }}>
              {skills.map((s) => (
                <span key={s} className="skill-pill">
                  <span className="skill-dot" aria-hidden="true" />{s}
                </span>
              ))}
            </div>

            {/* GitHub link */}
            <a
              href="https://github.com/Milan32555"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              aria-label="Ver perfil de GitHub"
            >
              <GitHubIcon size={17} />
              Ver mi GitHub
              <ArrowIcon />
            </a>
          </div>

          {/* Columna derecha */}
          <div className="about-body">
            <p style={{ marginBottom: "1.2rem" }}>
              Soy <strong style={{ color: "var(--text)", fontWeight: 500 }}>Misael</strong>, Ingeniero en
              Sistemas y Ethical Hacker con pasión por construir productos digitales que no solo funcionen —
              sino que se sientan bien al usarlos.
            </p>
            <p style={{ marginBottom: "1.2rem" }}>
              Me especializo en el ecosistema de{" "}
              <strong style={{ color: "var(--text)", fontWeight: 500 }}>React, Next.js y Vue.js</strong> para
              web, <strong style={{ color: "var(--text)", fontWeight: 500 }}>Node.js</strong> para backends, y{" "}
              <strong style={{ color: "var(--text)", fontWeight: 500 }}>Python con Deep Learning</strong> para
              soluciones de inteligencia artificial.
            </p>
            <p>
              Actualmente buscando oportunidades donde pueda contribuir con código de calidad, aplicar mis
              conocimientos en seguridad y seguir creciendo junto a un equipo con altos estándares.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
type SubmitStatus = "idle" | "sending" | "success" | "error";

function announce(message: string) {
  const el = document.getElementById("a11y-announcer");
  if (el) el.textContent = message;
}

function ContactSection() {
  const ref = useFadeIn();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          // Campo honeypot: invisible para personas, los bots suelen rellenarlo.
          honeypot: data.get("company"),
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = json.error ?? "No se pudo enviar el mensaje. Intenta de nuevo.";
        setErrorMsg(msg);
        setStatus("error");
        announce(msg);
        return;
      }

      setStatus("success");
      announce("Mensaje enviado correctamente. Gracias por escribir.");
      form.reset();
    } catch {
      const msg = "Error de conexión. Revisa tu internet e intenta de nuevo.";
      setErrorMsg(msg);
      setStatus("error");
      announce(msg);
    }
  }

  return (
    <section id="contact" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Contacto</p>
        <h2 className="section-title">Hablemos</h2>
        <div className="contact-wrap fade-in-section" ref={ref}>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2.5rem", fontWeight: 300 }}>
            ¿Tienes un proyecto en mente o quieres conectar? Escríbeme — normalmente respondo en menos de 24 horas.
          </p>

          {status === "success" ? (
            <p role="status" style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
              ¡Gracias! Tu mensaje fue enviado correctamente. Te responderé pronto.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
              {/* Honeypot anti-spam: oculto visualmente, invisible para lectores de pantalla */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
              />

              <div className="form-group">
                <label className="form-label" htmlFor="name">Nombre</label>
                <input id="name" name="name" type="text" className="form-input" placeholder="Tu nombre" required disabled={status === "sending"} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="form-input" placeholder="tu@email.com" required disabled={status === "sending"} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Mensaje</label>
                <textarea id="message" name="message" className="form-textarea" placeholder="Cuéntame sobre tu proyecto..." required disabled={status === "sending"} />
              </div>

              {status === "error" && (
                <p role="alert" style={{ color: "#f37272", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  {errorMsg}
                </p>
              )}

              <div style={{ marginTop: "0.5rem" }}>
                <button type="submit" className="btn-primary" disabled={status === "sending"} aria-busy={status === "sending"}>
                  {status === "sending" ? "Enviando..." : <>Enviar mensaje <SendIcon /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
      <footer className="footer">
        <p style={{ marginBottom: "0.3rem" }}>Portfolio Misael · {new Date().getFullYear()}</p>
        <p style={{ fontSize: "0.72rem" }}>Diseñado y construido con Next.js &amp; Tailwind CSS</p>
      </footer>
    </main>
  );
}