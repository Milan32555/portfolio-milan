"use client";

import { useEffect, useState } from "react";
import { deviceReport, diagEvents, subscribeDiag } from "./diagLog";

/** Panel del modo `?diag`: se refresca con cada evento y el texto se puede copiar. */
export default function HeroDiag() {
  const [text, setText] = useState("");

  useEffect(() => {
    const render = () => setText([...deviceReport(), "── eventos ──", ...diagEvents()].join("\n"));
    const unsubscribe = subscribeDiag(render);
    const first = requestAnimationFrame(render);
    // La escena puede terminar varios segundos después: refresca el estado del <html>.
    const timer = window.setInterval(render, 1000);
    return () => {
      unsubscribe();
      cancelAnimationFrame(first);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <pre
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        bottom: 8,
        zIndex: 100000,
        maxHeight: "45vh",
        overflow: "auto",
        margin: 0,
        padding: 10,
        border: "1px solid #4f8ef7",
        borderRadius: 8,
        background: "rgba(0,0,0,0.9)",
        color: "#e6e6e6",
        font: "11px/1.4 ui-monospace, monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        userSelect: "text",
      }}
    >
      {text}
    </pre>
  );
}
