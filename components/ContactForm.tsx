"use client";

import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "sending" | "success" | "error";

function announce(message: string) {
  const el = document.getElementById("a11y-announcer");
  if (el) el.textContent = message;
}

function SendIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ContactForm() {
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

  if (status === "success") {
    return (
      <p role="status" style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
        ¡Gracias! Tu mensaje fue enviado correctamente. Te responderé pronto.
      </p>
    );
  }

  return (
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
  );
}
