export type PreguntaSatisfaccion = {
  id: string;
  categoria: string;
  texto: string;
  calificacion: number; // 0 = sin calificar, 1 a 5
  personalizada: boolean;
};

export type EncuestaSatisfaccion = {
  id: string;
  periodo: string; // ej: "1er Semestre 2026" — agrupa con las de otros clientes en una matriz general
  fecha: string;
  canal: string;
  encuestadoNombre: string;
  encuestadoCargo: string;
  preguntas: PreguntaSatisfaccion[];
  satisfaccionGeneral: number; // 0 a 5
  probabilidadRecompra: number; // 0 a 5
  nps: number; // -1 = sin calificar, 0 a 10
  fortalezas: string;
  mejoras: string;
  comentarios: string;
};

// Cuestionario completo alineado a ISO 9001 cláusula 9.1.2 (percepción del cliente).
export const CATEGORIAS_SATISFACCION: { categoria: string; icono: string; preguntas: string[] }[] = [
  {
    categoria: "Calidad del Producto o Servicio",
    icono: "⭐",
    preguntas: [
      "Calidad del producto o servicio recibido",
      "Cumplimiento de las especificaciones acordadas",
      "Confiabilidad y durabilidad",
    ],
  },
  {
    categoria: "Cumplimiento de Plazos",
    icono: "⏱️",
    preguntas: [
      "Puntualidad en la entrega",
      "Cumplimiento de los plazos acordados",
    ],
  },
  {
    categoria: "Atención y Comunicación",
    icono: "🗣️",
    preguntas: [
      "Amabilidad y profesionalismo del personal",
      "Claridad en la comunicación",
      "Capacidad de respuesta ante consultas",
    ],
  },
  {
    categoria: "Precio y Condiciones Comerciales",
    icono: "💲",
    preguntas: [
      "Relación precio-calidad",
      "Competitividad de precios",
      "Flexibilidad en condiciones de pago",
    ],
  },
  {
    categoria: "Soporte Postventa",
    icono: "🛠️",
    preguntas: [
      "Atención a reclamos o incidencias",
      "Resolución efectiva de problemas",
      "Seguimiento postventa",
    ],
  },
];

export const CANALES_ENCUESTA = ["Presencial", "Telefónica", "Email", "Formulario digital", "Otro"];

// Lista plana de las 13 preguntas base, en orden estable — usada como columnas fijas de la matriz consolidada.
export const PREGUNTAS_BASE_SATISFACCION: string[] = CATEGORIAS_SATISFACCION.flatMap((c) => c.preguntas);

export function preguntaVacia(categoria: string, texto: string, personalizada = false): PreguntaSatisfaccion {
  return { id: crypto.randomUUID(), categoria, texto, calificacion: 0, personalizada };
}

export function encuestaVacia(): EncuestaSatisfaccion {
  const preguntas: PreguntaSatisfaccion[] = [];
  CATEGORIAS_SATISFACCION.forEach((cat) => {
    cat.preguntas.forEach((texto) => preguntas.push(preguntaVacia(cat.categoria, texto)));
  });
  return {
    id: crypto.randomUUID(),
    periodo: periodoSugerido(),
    fecha: new Date().toISOString().slice(0, 10),
    canal: "Presencial",
    encuestadoNombre: "",
    encuestadoCargo: "",
    preguntas,
    satisfaccionGeneral: 0,
    probabilidadRecompra: 0,
    nps: -1,
    fortalezas: "",
    mejoras: "",
    comentarios: "",
  };
}

export function periodoSugerido(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const semestre = hoy.getMonth() < 6 ? "1er Semestre" : "2do Semestre";
  return `${semestre} ${anio}`;
}

export function parseEncuestas(contenido: string): EncuestaSatisfaccion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function resultadoEncuesta(e: EncuestaSatisfaccion): {
  promedio: number; // 0 a 5
  porcentaje: number; // 0 a 100
  calificadas: number;
  total: number;
} {
  const todas = [
    ...e.preguntas,
    { calificacion: e.satisfaccionGeneral },
    { calificacion: e.probabilidadRecompra },
  ];
  const calificadas = todas.filter((p) => p.calificacion > 0);
  const promedio = calificadas.length > 0 ? calificadas.reduce((acc, p) => acc + p.calificacion, 0) / calificadas.length : 0;
  return {
    promedio,
    porcentaje: (promedio / 5) * 100,
    calificadas: calificadas.length,
    total: todas.length,
  };
}

export function nivelSatisfaccion(porcentaje: number): string {
  if (porcentaje === 0) return "Sin calificar";
  if (porcentaje >= 90) return "Muy Satisfecho";
  if (porcentaje >= 70) return "Satisfecho";
  if (porcentaje >= 50) return "Neutral";
  if (porcentaje >= 30) return "Insatisfecho";
  return "Muy Insatisfecho";
}

export function colorNivelSatisfaccion(nivel: string): string {
  switch (nivel) {
    case "Muy Satisfecho":
      return "#22C55E";
    case "Satisfecho":
      return "#84CC16";
    case "Neutral":
      return "#F5A623";
    case "Insatisfecho":
      return "#F97316";
    case "Muy Insatisfecho":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function claseNPS(valor: number): string {
  if (valor < 0) return "Sin calificar";
  if (valor >= 9) return "Promotor";
  if (valor >= 7) return "Pasivo";
  return "Detractor";
}

export function colorNPS(clase: string): string {
  switch (clase) {
    case "Promotor":
      return "#22C55E";
    case "Pasivo":
      return "#F5A623";
    case "Detractor":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

// Puntaje NPS tradicional (-100 a 100) a partir de un conjunto de encuestas.
export function calcularNPS(encuestas: EncuestaSatisfaccion[]): number | null {
  const calificadas = encuestas.filter((e) => e.nps >= 0);
  if (calificadas.length === 0) return null;
  const promotores = calificadas.filter((e) => e.nps >= 9).length;
  const detractores = calificadas.filter((e) => e.nps <= 6).length;
  return Math.round(((promotores - detractores) / calificadas.length) * 100);
}
