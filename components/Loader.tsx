"use client";

import { useEffect, useState } from "react";
import { useLoader } from "@/components/LoaderContext";

const NAME = "Misael";
const LETTER_SPEED = 160;
const TYPING_DONE = NAME.length * LETTER_SPEED;

export default function Loader() {
  const { setLoaderDone } = useLoader();
  const [visibleChars, setVisibleChars] = useState(0);
  const [showDot, setShowDot] = useState(false);
  const [phase, setPhase] = useState<"typing" | "curtain" | "gone">("typing");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Scroll to top instantly before anything is visible
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Wait one frame to ensure scroll applied, then start loader
    requestAnimationFrame(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;

    const typingInterval = setInterval(() => {
      setVisibleChars(prev => {
        if (prev >= NAME.length) { clearInterval(typingInterval); return prev; }
        return prev + 1;
      });
    }, LETTER_SPEED);

    const dotTimer     = setTimeout(() => setShowDot(true),    TYPING_DONE + 600);
    const doneTimer    = setTimeout(() => setLoaderDone(true), TYPING_DONE + 1200);
    const curtainTimer = setTimeout(() => setPhase("curtain"), TYPING_DONE + 1500);
    const goneTimer    = setTimeout(() => setPhase("gone"),    TYPING_DONE + 2700);

    return () => {
      clearInterval(typingInterval);
      [dotTimer, doneTimer, curtainTimer, goneTimer].forEach(clearTimeout);
    };
  }, [ready]);

  if (phase === "gone") return null;

  const curtaining = phase === "curtain";

  return (
    <>
      {/* ── DARK BACKGROUND — slides up as curtain ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "#0c0c0e",
          transform: curtaining ? "translateY(-100%)" : "translateY(0%)",
          transition: curtaining ? "transform 1s cubic-bezier(0.76,0,0.24,1)" : "none",
          pointerEvents: curtaining ? "none" : "all",
        }}
      />

      {/* ── GLOW ── */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "360px", height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 70%)",
          zIndex: 9999,
          pointerEvents: "none",
          opacity: curtaining ? 0 : 1,
          transition: "opacity 0.35s ease",
          animation: !curtaining ? "glowIn 2.2s cubic-bezier(0.4,0,0.2,1) 2 alternate forwards" : "none",
        }}
      />

      {/* ── NAME ── */}
      <h1
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10000,
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(3.5rem, 12vw, 7rem)",
          letterSpacing: "-0.03em",
          color: "#f0f0f2",
          lineHeight: 1,
          display: "flex",
          alignItems: "flex-end",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: curtaining ? 0 : 1,
          transition: curtaining ? "opacity 0.4s ease" : "none",
          animation: !curtaining && ready ? "nameRise 0.7s cubic-bezier(0.22,1,0.36,1) both" : "none",
        }}
      >
        {NAME.slice(0, visibleChars)}

        {showDot && (
          <span
            style={{
              color: "#4f8ef7",
              display: "inline-block",
              animation: "dotReveal 0.75s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            .
          </span>
        )}

        {visibleChars < NAME.length && (
          <span
            style={{
              display: "inline-block",
              width: "3px", height: "0.72em",
              background: "#4f8ef7",
              marginLeft: "5px",
              verticalAlign: "middle",
              borderRadius: "2px",
              animation: "blink 0.65s step-end infinite",
            }}
          />
        )}
      </h1>

      <style>{`
        @keyframes nameRise {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 22px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes glowIn {
          from { transform: translate(-50%,-50%) scale(0.85); opacity: 0; }
          to   { transform: translate(-50%,-50%) scale(1.1);  opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes dotReveal {
          0%   { opacity: 0; transform: translateY(6px) scale(0.4); filter: blur(3px); }
          55%  { opacity: 1; transform: translateY(-3px) scale(1.45); filter: blur(0px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
      `}</style>
    </>
  );
}