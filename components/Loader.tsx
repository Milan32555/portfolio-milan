"use client";

import { useEffect, useState } from "react";

const NAME = "Misael";

export default function Loader() {
  const [visibleChars, setVisibleChars] = useState(0);
  const [showDot, setShowDot] = useState(false);
  const [phase, setPhase] = useState<"typing" | "hold" | "exit" | "curtain" | "gone">("typing");

  useEffect(() => {
    // Type each letter every 160ms (slower, more deliberate)
    const typingInterval = setInterval(() => {
      setVisibleChars(prev => {
        if (prev >= NAME.length) {
          clearInterval(typingInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 160);

    // Dot appears 600ms after last letter
    const dotTimer = setTimeout(() => setShowDot(true), NAME.length * 160 + 600);

    // Hold a moment after dot, then exit
    const exitTimer = setTimeout(() => setPhase("exit"), NAME.length * 160 + 1100);
    const curtainTimer = setTimeout(() => setPhase("curtain"), NAME.length * 160 + 1500);
    const goneTimer = setTimeout(() => setPhase("gone"), NAME.length * 160 + 2500);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(dotTimer);
      clearTimeout(exitTimer);
      clearTimeout(curtainTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: phase === "curtain" ? "none" : "all",
      }}
    >
      {/* ── CURTAIN ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0c0c0e",
          transform: phase === "curtain" ? "translateY(-100%)" : "translateY(0%)",
          transition: phase === "curtain"
            ? "transform 1s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
        }}
      />

      {/* ── CONTENT ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase === "exit" || phase === "curtain" ? 0 : 1,
          transform: phase === "exit" || phase === "curtain" ? "translateY(-16px)" : "translateY(0)",
          transition: "opacity 0.45s ease, transform 0.55s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 70%)",
            animation: "glowIn 2.2s cubic-bezier(0.4,0,0.2,1) 2 alternate forwards",
          }}
        />

        {/* Name */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
            letterSpacing: "-0.03em",
            color: "#f0f0f2",
            lineHeight: 1,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            animation: "nameRise 0.7s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {NAME.slice(0, visibleChars)}

          {/* Dot — appears with its own elegant animation */}
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

          {/* Blinking cursor while typing */}
          {visibleChars < NAME.length && (
            <span
              style={{
                display: "inline-block",
                width: "3px",
                height: "0.72em",
                background: "#4f8ef7",
                marginLeft: "5px",
                verticalAlign: "middle",
                borderRadius: "2px",
                animation: "blink 0.65s step-end infinite",
              }}
            />
          )}
        </h1>
      </div>

      <style>{`
        @keyframes nameRise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1.1);  opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes dotReveal {
          0%   {
            opacity: 0;
            transform: translateY(6px) scale(0.4);
            filter: blur(3px);
          }
          55%  {
            opacity: 1;
            transform: translateY(-3px) scale(1.45);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
      `}</style>
    </div>
  );
}