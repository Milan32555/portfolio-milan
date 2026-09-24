/**
 * Copy de /servicios como datos (spec 2026-09-17-pagina-servicios-design.md).
 * Regla: sin montos ni plazos cerrados publicados; el precio se cotiza tras /contacto.
 */

export interface Section {
  id: string;
  num: string;
  title: string;
}

export interface DevLine {
  title: string;
  description: string;
  stack: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const SECTIONS: readonly Section[] = [
  { id: "intro", num: "01", title: "Intro" },
  { id: "desarrollo", num: "02", title: "Desarrollo" },
  { id: "auditoria", num: "03", title: "Auditoría de código" },
  { id: "como-trabajo", num: "04", title: "Cómo trabajo" },
  { id: "precios", num: "05", title: "Precios" },
  { id: "preguntas", num: "06", title: "Preguntas frecuentes" },
];

export const INTRO: readonly string[] = [
  "No soy una fábrica de sitios ni tengo un paquete cerrado que sirva para todo. Antes de proponerte algo quiero entender el problema: qué necesita tu negocio, quién lo va a usar y qué pasa si algo sale mal.",
  "Hago dos cosas: construyo software y reviso el de otros. Las dos salen de la misma costumbre, que aprendí estudiando seguridad: buscar qué se rompe antes de que lo haga otro.",
];

export const DEV_INTRO =
  "Cuatro líneas de trabajo. En todas entrego código que puedes mantener, con avances visibles desde el principio.";

export const DEV_LINES: readonly DevLine[] = [
  {
    title: "Sitios y landing pages",
    description: "Presencia rápida y bien hecha: carga veloz, accesible y fácil de actualizar.",
    stack: "Next.js · React",
  },
  {
    title: "Apps web full-stack",
    description: "Paneles, portales y herramientas internas con usuarios, datos y lógica de negocio.",
    stack: "Next.js · Node.js · Python",
  },
  {
    title: "Apps móviles",
    description: "Android e iOS desde un mismo código, lista para publicarse en las tiendas.",
    stack: "Flutter",
  },
  {
    title: "Sistemas empresariales",
    description: "Inventarios, kardex y procesos internos hechos a la medida de cómo trabaja tu empresa.",
    stack: "Vue.js · Node.js",
  },
];

export const AUDIT: readonly string[] = [
  "Reviso el código fuente de tu aplicación buscando vulnerabilidades y malas prácticas: inyecciones (SQL, XSS), secretos expuestos, autenticación y permisos débiles, dependencias con fallas conocidas.",
  "Te entrego un informe con cada hallazgo priorizado, qué es crítico y qué puede esperar, y cómo corregirlo.",
];

export const AUDIT_FIT: readonly string[] = [
  "Vas a lanzar y quieres una revisión antes de salir a producción.",
  "Heredaste código que no escribiste y no sabes qué hay adentro.",
  "Tu app maneja datos de usuarios o pagos.",
];

export const AUDIT_NOTE =
  "Por ahora no ofrezco pentesting (pruebas de ataque sobre sistemas en funcionamiento): la revisión es sobre el código.";

export const DEV_STEPS: readonly Step[] = [
  { title: "Contacto y diagnóstico", text: "Una charla corta o un intercambio escrito para entender el problema real, no solo lo que se pidió al inicio." },
  { title: "Propuesta y cotización", text: "Alcance por escrito, precio cerrado (sitios) o cotización a medida, y tiempos estimados." },
  { title: "Anticipo y arranque", text: "Un adelanto reserva el cupo y arrancamos." },
  { title: "Desarrollo con checkpoints", text: "Avances visibles en un entorno de prueba, no una entrega a ciegas. Incluye una ronda de ajustes." },
  { title: "Entrega y capacitación", text: "Te dejo una guía corta para usar y actualizar lo que construimos." },
  { title: "Soporte posterior", text: "Una ventana corta después de la entrega para corregir errores. El mantenimiento continuo es un servicio aparte." },
];

export const AUDIT_STEPS: readonly Step[] = [
  { title: "Acceso y alcance", text: "Acceso de lectura al repositorio y qué partes revisar." },
  { title: "Revisión", text: "Análisis del código buscando vulnerabilidades y malas prácticas." },
  { title: "Informe", text: "Hallazgos priorizados: crítico frente a lo que puede esperar, con cómo corregir cada uno." },
  { title: "Sesión de resultados", text: "Repasamos juntos el informe y resolvemos dudas." },
];

export const PRICING: readonly string[] = [
  "No hay tabla de precios ni montos publicados, y eso aplica a todo lo que hago. No es por esconder nada: el precio sale de entender tu necesidad real, no de elegir un paquete de una lista.",
  "Me escribes contando qué necesitas, conversamos lo necesario y te envío una cotización por escrito con alcance, tiempos y forma de pago. Para sitios y landing pages suele ser un precio cerrado; para apps, sistemas y auditorías, una cotización a medida.",
];

export const FAQ: readonly FaqItem[] = [
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del alcance. Cuéntame qué necesitas en la página de contacto y te respondo con una cotización por escrito. La conversación inicial no tiene costo.",
  },
  {
    q: "¿Cuánto tarda un proyecto típico?",
    a: "Depende de qué se construye: una landing page toma bastante menos que una app con usuarios y datos. El plazo estimado va por escrito en la propuesta, junto con los checkpoints.",
  },
  {
    q: "¿Trabajas solo o con un equipo?",
    a: "Trabajo solo: hablas directamente con quien escribe el código. Si tu proyecto necesita algo fuera de lo que hago, te lo digo desde el principio.",
  },
  {
    q: "¿Haces mantenimiento después de la entrega?",
    a: "Después de la entrega hay una ventana corta de soporte para corregir errores. El mantenimiento continuo (actualizaciones, cambios nuevos) se acuerda aparte.",
  },
  {
    q: "¿Qué necesitas de mí para arrancar?",
    a: "Una descripción del problema o del objetivo, ejemplos de lo que te gusta si los tienes, y el contenido (textos, imágenes, accesos) cuando toque. Para una auditoría: acceso de lectura al repositorio y el alcance.",
  },
];

/** Todos los textos visibles del artículo (para el tiempo de lectura y los tests). */
export function pageText(): string[] {
  return [
    ...INTRO,
    DEV_INTRO,
    ...DEV_LINES.flatMap((d) => [d.title, d.description, d.stack]),
    ...AUDIT,
    ...AUDIT_FIT,
    AUDIT_NOTE,
    ...[...DEV_STEPS, ...AUDIT_STEPS].flatMap((s) => [s.title, s.text]),
    ...PRICING,
    ...FAQ.flatMap((f) => [f.q, f.a]),
  ];
}

/** Minutos de lectura a 200 palabras por minuto, redondeado, mínimo 1. */
export function readingMinutes(texts: readonly string[], wpm = 200): number {
  const words = texts.reduce((n, t) => n + t.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / wpm));
}
