export type CriterioEvaluado = {
  id: string;
  nombre: string;
  calificacion: number; // 1 a 5, 0 = sin calificar
  comentario: string;
  personalizado: boolean;
};

export type EvaluacionDesempeno = {
  id: string;
  periodoInicio: string;
  periodoFin: string;
  fechaEvaluacion: string;
  evaluador: string;
  tipoEvaluacion: string;
  criterios: CriterioEvaluado[];
  fortalezas: string;
  areasMejora: string;
  planDesarrollo: string;
  comentariosColaborador: string;
};

// Criterios universales: aplican a cualquier cargo o rubro. Cada empresa puede
// sumar los suyos propios en "Criterios adicionales" dentro de cada evaluación.
export const CRITERIOS_UNIVERSALES = [
  "Calidad del trabajo",
  "Cumplimiento de metas y objetivos",
  "Trabajo en equipo",
  "Comunicación",
  "Puntualidad y asistencia",
  "Iniciativa y proactividad",
  "Adaptabilidad",
  "Conocimiento técnico del cargo",
];

export const TIPOS_EVALUACION = ["Evaluación de jefe directo", "Autoevaluación", "Evaluación 180°", "Evaluación 360°"];

export function criterioVacio(nombre: string, personalizado = false): CriterioEvaluado {
  return { id: crypto.randomUUID(), nombre, calificacion: 0, comentario: "", personalizado };
}

export function evaluacionVacia(): EvaluacionDesempeno {
  return {
    id: crypto.randomUUID(),
    periodoInicio: "",
    periodoFin: "",
    fechaEvaluacion: "",
    evaluador: "",
    tipoEvaluacion: "Evaluación de jefe directo",
    criterios: CRITERIOS_UNIVERSALES.map((n) => criterioVacio(n)),
    fortalezas: "",
    areasMejora: "",
    planDesarrollo: "",
    comentariosColaborador: "",
  };
}

export function parseEvaluaciones(contenido: string): EvaluacionDesempeno[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function promedioEvaluacion(e: EvaluacionDesempeno): number {
  const calificados = e.criterios.filter((c) => c.calificacion > 0);
  if (calificados.length === 0) return 0;
  return calificados.reduce((acc, c) => acc + c.calificacion, 0) / calificados.length;
}

export function resultadoEvaluacion(promedio: number): string {
  if (promedio === 0) return "Sin calificar";
  if (promedio >= 4.5) return "Excelente";
  if (promedio >= 3.5) return "Bueno";
  if (promedio >= 2.5) return "Regular";
  return "Deficiente";
}

export function colorResultado(resultado: string): string {
  switch (resultado) {
    case "Excelente":
      return "#22C55E";
    case "Bueno":
      return "#3B82F6";
    case "Regular":
      return "#F5A623";
    case "Deficiente":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}
