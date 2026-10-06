export type CriterioEvaluadoProveedor = {
  id: string;
  nombre: string;
  calificacion: number; // 1 a 5, 0 = sin calificar
  comentario: string;
  personalizado: boolean;
};

export type EvaluacionProveedor = {
  id: string;
  periodoInicio: string;
  periodoFin: string;
  fechaEvaluacion: string;
  evaluador: string;
  tipoEvaluacion: string;
  criterios: CriterioEvaluadoProveedor[];
  fortalezas: string;
  areasMejora: string;
  planAccion: string;
  observaciones: string;
};

// Criterios universales para evaluar cualquier proveedor, sin importar el rubro.
// Cada empresa puede sumar los suyos propios en "Criterios adicionales".
export const CRITERIOS_UNIVERSALES_PROVEEDOR = [
  "Calidad del producto o servicio",
  "Cumplimiento de plazos de entrega",
  "Precio y condiciones comerciales",
  "Atención y comunicación",
  "Cumplimiento de documentación y normas",
];

export const TIPOS_EVALUACION_PROVEEDOR = ["Evaluación inicial", "Evaluación periódica", "Reevaluación por incidente"];

export function criterioProveedorVacio(nombre: string, personalizado = false): CriterioEvaluadoProveedor {
  return { id: crypto.randomUUID(), nombre, calificacion: 0, comentario: "", personalizado };
}

export function evaluacionProveedorVacia(): EvaluacionProveedor {
  return {
    id: crypto.randomUUID(),
    periodoInicio: "",
    periodoFin: "",
    fechaEvaluacion: "",
    evaluador: "",
    tipoEvaluacion: "Evaluación periódica",
    criterios: CRITERIOS_UNIVERSALES_PROVEEDOR.map((n) => criterioProveedorVacio(n)),
    fortalezas: "",
    areasMejora: "",
    planAccion: "",
    observaciones: "",
  };
}

export function parseEvaluacionesProveedor(contenido: string): EvaluacionProveedor[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function promedioEvaluacionProveedor(e: EvaluacionProveedor): number {
  const calificados = e.criterios.filter((c) => c.calificacion > 0);
  if (calificados.length === 0) return 0;
  return calificados.reduce((acc, c) => acc + c.calificacion, 0) / calificados.length;
}

export function resultadoEvaluacionProveedor(promedio: number): string {
  if (promedio === 0) return "Sin calificar";
  if (promedio >= 4.5) return "Excelente";
  if (promedio >= 3.5) return "Bueno";
  if (promedio >= 2.5) return "Regular";
  return "Deficiente";
}

export function colorResultadoProveedor(resultado: string): string {
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
