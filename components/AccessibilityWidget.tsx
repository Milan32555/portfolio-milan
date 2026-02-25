"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type FontSize  = "normal" | "lg" | "xl";
type A11yState = {
  fontSize:  FontSize;
  contrast:  boolean;
  motion:    boolean;
  links:     boolean;
  dyslexia:  boolean;
  cursor:    boolean;
};

const DEFAULTS: A11yState = {
  fontSize: "normal",
  contrast: false,
  motion:   false,
  links:    false,
  dyslexia: false,
  cursor:   false,
};

// ─── APLICAR AL DOM ───────────────────────────────────────────────────────────
// Todo se hace mediante atributos en <html>. El CSS de globals.css los escucha.
function applyState(s: A11yState) {
  const h = document.documentElement;
  h.setAttribute("data-a11y-fontsize", s.fontSize);
  h.setAttribute("data-a11y-contrast", s.contrast  ? "high"      : "off");
  h.setAttribute("data-a11y-motion",   s.motion    ? "reduced"   : "off");
  h.setAttribute("data-a11y-links",    s.links     ? "highlight" : "off");
  h.setAttribute("data-a11y-dyslexia", s.dyslexia  ? "on"        : "off");
  h.setAttribute("data-a11y-cursor",   s.cursor    ? "large"     : "off");
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AccessibilityWidget() {
  const [open, setOpen]   = useState(false);
  const [s, setS]         = useState<A11yState>(DEFAULTS);
  const panelRef          = useRef<HTMLDivElement>(null);
  const btnRef            = useRef<HTMLButtonElement>(null);

  // Cada vez que cambia el estado, lo aplica al DOM inmediatamente
  useEffect(() => { applyState(s); }, [s]);

  // Cierra al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) === false &&
        btnRef.current?.contains(e.target as Node) === false
      ) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  // Cierra con Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  const toggle = useCallback(<K extends keyof A11yState>(key: K, val: A11yState[K]) => {
    setS(prev => ({ ...prev, [key]: prev[key] === val ? DEFAULTS[key] : val }));
  }, []);

  const reset = useCallback(() => setS(DEFAULTS), []);

  const activeCount = [
    s.fontSize !== "normal", s.contrast, s.motion, s.links, s.dyslexia, s.cursor,
  ].filter(Boolean).length;

  // ─── ESTILOS BASE ────────────────────────────────────────────────────────────
  const accent       = "#4f8ef7";
  const surface      = "var(--surface, #16161a)";
  const border       = "var(--border, rgba(255,255,255,0.08))";
  const textColor    = "var(--text, #f0f0f2)";
  const mutedColor   = "var(--muted, #6b6b78)";
  const bg2          = "var(--bg2, #111114)";

  return (
    <>
      {/* ── BOTÓN FLOTANTE ────────────────────────────────────────────────── */}
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Opciones de accesibilidad"
        aria-expanded={open}
        aria-controls="a11y-panel"
        style={{
          position:       "fixed",
          bottom:         "1.75rem",
          right:          "1.75rem",
          zIndex:         9990,
          width:          "52px",
          height:         "52px",
          borderRadius:   "50%",
          background:     open ? accent : surface,
          border:         `1px solid ${open ? accent : "var(--border, rgba(255,255,255,0.1))"}`,
          color:          open ? "#fff" : mutedColor,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          boxShadow:      open
            ? `0 0 0 4px rgba(79,142,247,0.2), 0 8px 32px rgba(0,0,0,0.5)`
            : "0 4px 24px rgba(0,0,0,0.4)",
          transition:     "all 250ms ease",
          cursor:         "none",
          flexShrink:     0,
        }}
      >
        {/* Engranaje */}
        <svg
          aria-hidden="true" focusable="false"
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(60deg)" : "rotate(0deg)", transition: "transform 350ms ease" }}
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>

        {/* Badge de activos */}
        {activeCount > 0 && !open && (
          <span
            aria-hidden="true"
            style={{
              position:      "absolute",
              top:           "2px", right: "2px",
              width:         "18px", height: "18px",
              borderRadius:  "50%",
              background:    accent,
              color:         "#fff",
              fontSize:      "10px", fontWeight: 700,
              display:       "flex",
              alignItems:    "center", justifyContent: "center",
              border:        "2px solid var(--bg, #0c0c0e)",
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* ── PANEL ─────────────────────────────────────────────────────────── */}
      <div
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-label="Panel de accesibilidad"
        aria-hidden={!open}
        style={{
          position:      "fixed",
          bottom:        "calc(1.75rem + 64px)",
          right:         "1.75rem",
          zIndex:        9989,
          width:         "296px",
          background:    surface,
          border:        `1px solid ${border}`,
          borderRadius:  "1.2rem",
          padding:       "1.4rem",
          boxShadow:     "0 24px 64px rgba(0,0,0,0.5)",
          backdropFilter:"blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          // Animación de entrada/salida
          transform:     open ? "translateY(0) scale(1)"    : "translateY(10px) scale(0.97)",
          opacity:       open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition:    "transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease",
          fontFamily:    "inherit",
        }}
      >
        {/* Cabecera */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: accent, marginBottom: "0.1rem" }}>
              Accesibilidad
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 600, color: textColor, lineHeight: 1.2 }}>
              Personalizar vista
            </p>
          </div>
          {activeCount > 0 && (
            <button
              onClick={reset}
              aria-label="Restablecer todo"
              style={{
                fontSize: "0.7rem", fontWeight: 500,
                color: mutedColor,
                background: "transparent",
                border: `1px solid ${border}`,
                borderRadius: "99px",
                padding: "0.28rem 0.7rem",
                cursor: "none",
                transition: "color 150ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = textColor)}
              onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}
            >
              Resetear
            </button>
          )}
        </div>

        <div style={{ height: "1px", background: border, marginBottom: "1.1rem" }} />

        {/* ── TAMAÑO DE TEXTO ─────────────────────────────────────────────── */}
        <p style={labelStyle(mutedColor)}>Tamaño de texto</p>
        <div style={{ display: "flex", gap: "0.45rem", marginBottom: "1rem" }}>
          {(["normal", "lg", "xl"] as FontSize[]).map((size) => {
            const active = s.fontSize === size;
            return (
              <button
                key={size}
                onClick={() => setS(prev => ({ ...prev, fontSize: size }))}
                aria-pressed={active}
                aria-label={size === "normal" ? "Texto normal" : size === "lg" ? "Texto grande" : "Texto muy grande"}
                style={{
                  flex: 1,
                  padding: "0.45rem 0.3rem",
                  borderRadius: "0.55rem",
                  border: `1px solid ${active ? accent : border}`,
                  background: active ? `rgba(79,142,247,0.15)` : "transparent",
                  color: active ? accent : mutedColor,
                  fontSize: size === "normal" ? "0.8rem" : size === "lg" ? "0.92rem" : "1.05rem",
                  fontWeight: active ? 700 : 400,
                  cursor: "none",
                  transition: "all 150ms ease",
                  fontFamily: "inherit",
                }}
              >
                {size === "normal" ? "A" : size === "lg" ? "A+" : "A++"}
              </button>
            );
          })}
        </div>

        {/* ── TOGGLES ─────────────────────────────────────────────────────── */}
        <p style={{ ...labelStyle(mutedColor), marginBottom: "0.5rem" }}>Opciones visuales</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          <ToggleRow label="Alto contraste"     icon={<IcoContrast />} active={s.contrast} onToggle={() => setS(p => ({ ...p, contrast: !p.contrast }))} accent={accent} border={border} textColor={textColor} />
          <ToggleRow label="Reducir animaciones" icon={<IcoMotion />}  active={s.motion}   onToggle={() => setS(p => ({ ...p, motion:   !p.motion   }))} accent={accent} border={border} textColor={textColor} />
          <ToggleRow label="Resaltar enlaces"   icon={<IcoLink />}    active={s.links}    onToggle={() => setS(p => ({ ...p, links:    !p.links    }))} accent={accent} border={border} textColor={textColor} />
          <ToggleRow label="Modo dislexia"      icon={<IcoDyslexia />} active={s.dyslexia} onToggle={() => setS(p => ({ ...p, dyslexia: !p.dyslexia }))} accent={accent} border={border} textColor={textColor} />
          <ToggleRow label="Cursor grande"      icon={<IcoCursor />}  active={s.cursor}   onToggle={() => setS(p => ({ ...p, cursor:   !p.cursor   }))} accent={accent} border={border} textColor={textColor} />
        </div>

        <p style={{ fontSize: "0.63rem", color: mutedColor, textAlign: "center", marginTop: "1.1rem", opacity: 0.7 }}>
          WCAG 2.1 — Principio Perceptible
        </p>
      </div>
    </>
  );
}

// ─── HELPER STYLES ────────────────────────────────────────────────────────────
function labelStyle(color: string): React.CSSProperties {
  return {
    fontSize: "0.62rem", fontWeight: 700,
    letterSpacing: "0.13em", textTransform: "uppercase",
    color, marginBottom: "0.55rem",
  };
}

// ─── TOGGLE ROW ───────────────────────────────────────────────────────────────
function ToggleRow({
  label, icon, active, onToggle, accent, border, textColor,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: () => void;
  accent: string;
  border: string;
  textColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`${label}: ${active ? "activado" : "desactivado"}`}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        width:          "100%",
        padding:        "0.55rem 0.7rem",
        borderRadius:   "0.65rem",
        border:         `1px solid ${active ? accent : border}`,
        background:     active ? "rgba(79,142,247,0.1)" : "transparent",
        color:          active ? accent : textColor,
        cursor:         "none",
        transition:     "all 180ms ease",
        fontFamily:     "inherit",
        textAlign:      "left",
      }}
    >
      {/* Label + ícono */}
      <span style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.83rem", fontWeight: active ? 500 : 400 }}>
        <span aria-hidden="true" style={{ opacity: active ? 1 : 0.55 }}>{icon}</span>
        {label}
      </span>

      {/* Toggle pill */}
      <span
        aria-hidden="true"
        style={{
          width:          "32px", height: "18px",
          borderRadius:   "99px",
          background:     active ? accent : border,
          position:       "relative",
          flexShrink:     0,
          transition:     "background 200ms ease",
          display:        "block",
        }}
      >
        <span
          style={{
            position:     "absolute",
            top:          "3px",
            left:         active ? "15px" : "3px",
            width:        "12px", height: "12px",
            borderRadius: "50%",
            background:   "#fff",
            transition:   "left 200ms ease",
            display:      "block",
          }}
        />
      </span>
    </button>
  );
}

// ─── ÍCONOS SVG INLINE ────────────────────────────────────────────────────────
const ico = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IcoContrast  = () => <svg {...ico}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>;
const IcoMotion    = () => <svg {...ico}><path d="M5 9l4 3-4 3M12 6l6 6-6 6" strokeWidth={1.8}/></svg>;
const IcoLink      = () => <svg {...ico}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoDyslexia  = () => <svg {...ico}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
const IcoCursor    = () => <svg {...ico}><path d="M5 3l14 9-7 1-4 7z"/></svg>;