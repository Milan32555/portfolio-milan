import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Anti-spam simple: máximo 5 envíos por IP cada 10 minutos (en memoria,
// suficiente para el volumen de un portfolio; se reinicia con cada deploy).
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; message?: string; honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { name, email, message, honeypot } = body;

  // Honeypot: campo oculto que un bot rellena pero una persona nunca ve.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "El email no es válido." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    console.error("Faltan RESEND_API_KEY o CONTACT_TO_EMAIL en las variables de entorno.");
    return NextResponse.json(
      { error: "El formulario no está configurado todavía. Intenta contactar por otro medio." },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // "onboarding@resend.dev" funciona sin verificar dominio propio;
      // cámbialo por un remitente de tu dominio verificado cuando lo tengas.
      from: "Portfolio <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — Portfolio`,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando el email de contacto:", err);
    return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
