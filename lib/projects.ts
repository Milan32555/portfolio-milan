export type Context = "personal" | "universitario";
export type Estado = "activo" | "archivado";
export const CAMPOS_BORRADOR = ["periodo", "estado", "rol", "conMasTiempo", "arquitectura", "aviso"] as const;
export type CampoBorrador = (typeof CAMPOS_BORRADOR)[number];

export interface Stat {
  value: string;
  label: string;
}
export interface ArchPart {
  nombre: string;
  descripcion: string;
}
export interface Decision {
  titulo: string;
  texto: string;
}
export interface ExpedienteData {
  problema: string;
  queHace: string[];
  rol: string;
  decisiones: Decision[];
  noHice: string[];
  evidencia: string[];
  resultado: string;
  conMasTiempo: string[];
}
export interface Media {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Project {
  slug: string;
  title: string;
  summary: string;
  context: Context;
  subtitulo?: string;
  periodo: string;
  estado: Estado;
  tags: string[];
  metric: Stat;
  repo: { url: string };
  demo?: { url: string; note?: string };
  cover?: Media;
  video?: { src: string; poster: string; label: string };
  galeria?: Media[];
  aviso?: string;
  stats: [Stat, Stat, Stat];
  arquitectura: ArchPart[];
  expediente: ExpedienteData;
  /** Campos cuyo texto es un borrador que el usuario aún debe confirmar. Debe quedar vacío para publicar. */
  borrador: CampoBorrador[];
}

export const projects: Project[] = [
  {
    slug: "medi-ia",
    title: "MEDI-IA",
    summary:
      "Asistente de diagnóstico diferencial que responde a partir de 14 libros médicos reales, con recuperación híbrida y un agente ReAct.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["Python", "Flask", "RAG", "FAISS", "BM25", "ReAct"],
    metric: { value: "97.1%", label: "Recall@1 · 40 consultas" },
    repo: { url: "https://github.com/Milan32555/medi-ia-medical-agent" },
    aviso:
      "No hay demo pública: depende de un corpus de 14 libros y de un token de HuggingFace. Proyecto educativo, no sustituye el criterio médico.",
    stats: [
      { value: "97.1%", label: "Recall@1 en 40 consultas anotadas" },
      { value: "185", label: "funciones de test" },
      { value: "14", label: "libros indexados (~136 000 fragmentos)" },
    ],
    arquitectura: [
      { nombre: "Guardrails", descripcion: "Filtra con reglas las consultas que no son médicas, antes de llegar al modelo." },
      { nombre: "BM25 + FAISS", descripcion: "Busca en los 14 libros por palabras y por significado, y fusiona los resultados (RRF)." },
      { nombre: "Reranker", descripcion: "Reordena los fragmentos con un cross-encoder multilingüe para quedarse con los más relevantes." },
      { nombre: "Agente ReAct", descripcion: "Un modelo (Qwen2.5-7B) razona con 4 herramientas y arma la respuesta." },
    ],
    expediente: {
      problema:
        "Un modelo de lenguaje solo, respondiendo preguntas clínicas, puede inventar. El reto era que cada respuesta parta de fuentes médicas reales y que se pueda medir qué tan bien se recupera la información.",
      queHace: [
        "Responde consultas clínicas apoyándose en 14 libros médicos, con el razonamiento en streaming.",
        "Un agente con 4 herramientas: síntomas, urgencia, fármacos y secciones del libro.",
        "Mapa corporal de 24 zonas, perfil clínico, voz y exportación a PDF.",
        "Panel de métricas y de evaluación (Recall@k, MRR).",
      ],
      rol: "Diseño y desarrollo completo: ingesta de los libros, recuperación, agente, API y frontend.",
      decisiones: [
        { titulo: "Recuperación híbrida", texto: "BM25 + FAISS fusionados con Reciprocal Rank Fusion, más un reranker cross-encoder multilingüe." },
        { titulo: "Un cambio con dato", texto: "pasar de MiniLM a multilingual-e5-base subió Recall@1 de 74.3% a 91.4%; ampliar de 4 a 14 libros lo llevó a 97.1%." },
        { titulo: "Guardrails antes del LLM", texto: "un filtro por regex separa las consultas médicas de las que no lo son." },
      ],
      noHice: ["No publiqué una demo: exige el corpus de libros y un token de HuggingFace."],
      evidencia: [
        "185 funciones de test (guardrails, herramientas, memoria, API, métricas, feedback, evaluación, pipeline).",
        "CI en GitHub Actions (Python 3.13) y despliegue con Docker + nginx.",
        "Evaluación con 40 consultas anotadas: Recall@3 100%, MRR 0.9857. Es un dataset pequeño: hay que leerlo con cautela.",
      ],
      resultado: "Un agente con respuestas en streaming, voz, mapa corporal de 24 zonas y panel de métricas.",
      conMasTiempo: ["Ampliar el dataset de evaluación y validarlo con criterio clínico externo."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura", "aviso"],
  },
  {
    slug: "animalvision",
    title: "AnimalVision",
    summary: "Clasificador web de imágenes de animales con transfer learning sobre MobileNetV2, desplegado en producción.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["MobileNetV2", "Flask", "Gunicorn", "Render"],
    metric: { value: "93.4%", label: "accuracy · 5 clases" },
    repo: { url: "https://github.com/Milan32555/AnimalVision-AI-Image-Classification-System" },
    cover: {
      src: "/proyectos/animalvision/cover.webp",
      alt: "Interfaz de AnimalVision: un área para arrastrar o seleccionar una imagen y, al lado, el panel donde aparece la predicción del animal.",
      width: 1440,
      height: 860,
    },
    demo: {
      url: "https://animal-cnn-classifier.onrender.com",
      note: "Plan gratuito de Render: la primera carga puede tardar cerca de 1 minuto mientras el servicio despierta.",
    },
    stats: [
      { value: "93.4%", label: "accuracy en test (5 clases)" },
      { value: "98.7%", label: "top-3 accuracy" },
      { value: "~0.8 s", label: "por imagen, latencia media" },
    ],
    arquitectura: [
      { nombre: "Interfaz Flask", descripcion: "La página donde subes la imagen y ves el resultado." },
      { nombre: "Inferencia", descripcion: "Carga el modelo entrenado y prepara la imagen para analizarla." },
      { nombre: "MobileNetV2", descripcion: "Red pre-entrenada con ImageNet, ajustada (transfer learning) a 5 animales." },
      { nombre: "Top-5", descripcion: "Devuelve las 5 predicciones más probables con su porcentaje." },
    ],
    expediente: {
      problema: "Llevar un modelo entrenado en un notebook a una aplicación que cualquiera pueda usar desde el navegador, con respuesta en tiempo real.",
      queHace: [
        "Sube una imagen y clasifica el animal (5 clases).",
        "Muestra las 5 predicciones más probables con su porcentaje.",
        "Responde en menos de un segundo por imagen (~0.8 s según el README).",
      ],
      rol: "Entrenamiento del modelo, API de inferencia, interfaz web y despliegue.",
      decisiones: [
        { titulo: "Transfer learning", texto: "sobre MobileNetV2 (ImageNet) en lugar de entrenar desde cero." },
        { titulo: "Arquitectura modular", texto: "Factory Pattern y separación de responsabilidades entre rutas, inferencia y configuración." },
        { titulo: "Gunicorn en Render", texto: "para servir en producción." },
      ],
      noHice: ["Solo reconoce 5 clases de animales: no es un clasificador general."],
      evidencia: [
        "Accuracy en test 93.4%, top-3 98.7%, latencia media ~0.8 s por imagen (cifras del README).",
        "Pipeline completo y reproducible: dataset → entrenamiento → API → UI.",
      ],
      resultado: "Demo en producción con las 5 predicciones más probables y sus porcentajes.",
      conMasTiempo: ["Ampliar las clases y publicar el análisis de errores por clase."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
  {
    slug: "library-system",
    title: "Sistema de librería",
    summary: "Gestión de catálogo con Clean Architecture: CRUD, búsqueda, filtro por género y panel de administración.",
    context: "universitario",
    periodo: "2026",
    estado: "activo",
    tags: ["Vue 3", "Node.js", "Express", "Neon", "Vercel"],
    metric: { value: "1 archivo", label: "reescrito al cambiar de base de datos" },
    repo: { url: "https://github.com/Milan32555/Full-stack-library-management-system-with-Vue.js-frontend-and-Node.js-backend" },
    cover: {
      src: "/proyectos/library-system/cover.webp",
      alt: "Catálogo de La Gran Librería: buscador, filtros por género y tarjetas de libros con su precio y cantidad disponible.",
      width: 1440,
      height: 900,
    },
    demo: { url: "https://full-stack-library-management-syste-eight.vercel.app" },
    stats: [
      { value: "1", label: "archivo reescrito al cambiar de base de datos" },
      { value: "2 en 1", label: "frontend y backend en un solo despliegue" },
      { value: "4", label: "capas: pantalla, lógica, repositorio y datos" },
    ],
    arquitectura: [
      { nombre: "Vue 3", descripcion: "Las pantallas: catálogo, búsqueda, filtro por género y panel de administración." },
      { nombre: "Casos de uso", descripcion: "Las reglas de la aplicación (crear, buscar, actualizar libros) sin saber qué base de datos hay detrás." },
      { nombre: "Repositorio", descripcion: "Traduce esas operaciones a consultas SQL. Es la pieza que se cambió al migrar de Supabase a Neon." },
      { nombre: "Neon", descripcion: "La base de datos Postgres en la nube donde quedan guardados los libros." },
    ],
    expediente: {
      problema:
        "Un CRUD de tutorial se rompe cuando cambian la base de datos o el hosting. El objetivo fue separar dominio, casos de uso e infraestructura para que esos cambios no toquen la lógica.",
      queHace: ["Catálogo con alta, edición y baja de libros.", "Búsqueda y filtro por género.", "Panel de administración con estadísticas."],
      rol: "Diseño de la arquitectura, backend, frontend y despliegue. Empezó como trabajo universitario; las mejoras posteriores son propias.",
      decisiones: [
        { titulo: "Repositorio intercambiable", texto: "los casos de uso dependen de una interfaz, no de la base de datos." },
        { titulo: "Supabase → Neon", texto: "el plan gratuito limita a 2 proyectos activos; migrar reescribió un solo archivo." },
        { titulo: "Railway → Vercel Services", texto: "venció la prueba gratuita; frontend y backend ahora viven en un mismo dominio y despliegue." },
      ],
      noHice: ["No usé un ORM: consulto Neon con su driver serverless directamente."],
      evidencia: [
        "La migración de base de datos no tocó casos de uso ni frontend.",
        "Producción verificada: /api/books devuelve el catálogo y /health responde.",
      ],
      resultado: "Una demo en vivo con catálogo, búsqueda, filtro por género y panel de administración.",
      conMasTiempo: ["Añadir tests de los casos de uso y autenticación para el panel."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
  {
    slug: "safe-transfer-ai",
    title: "SafeTransfer AI",
    summary: "Simulador de riesgo de fraude en transferencias: un motor de reglas que explica por qué llegó a cada resultado.",
    context: "personal",
    periodo: "2026",
    estado: "activo",
    tags: ["Kotlin", "Jetpack Compose", "JUnit"],
    metric: { value: "8 tests", label: "unitarios del motor de riesgo" },
    repo: { url: "https://github.com/Milan32555/safe-transfer-ai" },
    aviso: "App Android nativa: no hay demo web. Pese al nombre, es un motor de reglas determinístico, no machine learning.",
    stats: [
      { value: "8", label: "tests unitarios del motor" },
      { value: "7", label: "señales de riesgo ponderadas" },
      { value: "0–100", label: "puntaje con razones legibles" },
    ],
    arquitectura: [
      { nombre: "Pantalla Compose", descripcion: "El formulario de la transferencia y las señales de alerta que marcas." },
      { nombre: "FraudEngine", descripcion: "Aplica reglas ponderadas. Es lógica pura, separada de la interfaz y probada con 8 tests." },
      { nombre: "Puntaje 0–100", descripcion: "Un nivel Bajo, Medio o Alto, con las razones y recomendaciones que lo produjeron." },
    ],
    expediente: {
      problema: "Muchos sistemas antifraude son cajas negras. Quise un motor cuyo puntaje se pueda explicar regla por regla.",
      queHace: [
        "Formulario con monto, país destino y canal, más las señales de alerta.",
        "Calcula un puntaje de riesgo de 0 a 100 (Bajo, Medio o Alto).",
        "Explica qué reglas sumaron y qué recomendaciones aplicar.",
      ],
      rol: "Diseño del motor de reglas, la interfaz en Compose y los tests.",
      decisiones: [
        { titulo: "Reglas ponderadas y determinísticas", texto: "score de 0 a 100 con niveles Bajo (<40), Medio (40–69) y Alto (≥70)." },
        { titulo: "Lógica pura separada de la UI", texto: "FraudEngine no depende de Compose, así se prueba sin emulador." },
        { titulo: "Explicación incluida", texto: "cada resultado devuelve las razones y las recomendaciones que lo produjeron." },
      ],
      noHice: ["No es un modelo de machine learning, aunque el nombre lo sugiera. Prefiero un proyecto bien descrito."],
      evidencia: ["8 tests unitarios de FraudEngine (JUnit)."],
      resultado: "Una app Android nativa que evalúa una transferencia y justifica el riesgo.",
      conMasTiempo: ["Calibrar los pesos con datos reales y añadir reglas por historial del usuario."],
    },
    borrador: ["periodo", "estado", "rol", "conMasTiempo", "arquitectura"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Número de expediente derivado del orden: "001", "002"… */
export function projectNumber(slug: string): string {
  const i = projects.findIndex((p) => p.slug === slug);
  return String(i + 1).padStart(3, "0");
}

export function isLive(p: Project): boolean {
  return p.demo !== undefined;
}

/** Anterior y siguiente, circulares (el siguiente del último es el primero). */
export function getAdjacent(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export function getCounts(): { total: number; live: number; codeOnly: number } {
  const live = projects.filter(isLive).length;
  return { total: projects.length, live, codeOnly: projects.length - live };
}
