import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Misael — Frontend Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0c0c0e 0%, #111114 60%, #16161a 100%)",
          color: "#f0f0f2",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7eb3ff",
            marginBottom: 28,
          }}
        >
          Frontend Developer
        </div>
        <div style={{ display: "flex", fontSize: 148, fontWeight: 600, letterSpacing: -4 }}>
          Misael<span style={{ color: "#7eb3ff" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#6b6b78",
            marginTop: 32,
          }}
        >
          React · Next.js · Vue.js · Deep Learning
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 56,
            padding: "16px 36px",
            borderRadius: 999,
            border: "2px solid #4f8ef7",
            fontSize: 28,
            color: "#f0f0f2",
          }}
        >
          Ver portfolio
          <span style={{ color: "#7eb3ff" }}>→</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
