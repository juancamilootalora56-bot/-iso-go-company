export type NivelCalificacion = "" | "Excelente" | "Bueno" | "Regular" | "Malo";

export type CriterioEvaluadoProveedor = {
  id: string;
  nombre: string;
  nivel: NivelCalificacion;
  personalizado: boolean;
};

export type EvaluacionProveedor = {
  id: string;
  productoServicio: string;
  fecha: string;
  tipoActividad: string; // "Selección y Evaluación" | "Reevaluación"
  incluyeServicioTecnico: boolean;
  evaluador: string;
  criterios: CriterioEvaluadoProveedor[];
  observaciones: string;
};

// Criterios base del formulario "Selección, Evaluación y Reevaluación de Proveedores".
// Todos pesan 10 puntos cada uno; el nivel marcado define los puntos obtenidos.
export const CRITERIOS_BASE_PROVEEDOR = [
  "Calidad",
  "Cumplimiento de la entrega",
  "Documentación",
  "Experiencia",
  "Garantía",
  "Precios",
  "Forma de pago",
  "Descuentos",
  "Servicio técnico",
  "Atención",
  "HSE",
];

export const TIPOS_ACTIVIDAD_PROVEEDOR = ["Selección y Evaluación", "Reevaluación"];

export const NIVELES_CALIFICACION: { nivel: NivelCalificacion; color: string; textoOscuro?: boolean }[] = [
  { nivel: "Excelente", color: "#22C55E" },
  { nivel: "Bueno", color: "#F5A623" },
  { nivel: "Regular", color: "#FDE68A", textoOscuro: true },
  { nivel: "Malo", color: "#EF4444" },
];

export const PESO_CRITERIO = 10;

export function puntosDeNivel(nivel: NivelCalificacion): number {
  switch (nivel) {
    case "Excelente":
      return 10;
    case "Bueno":
      return 8;
    case "Regular":
      return 6;
    case "Malo":
      return 2;
    default:
      return 0;
  }
}

export function criterioProveedorVacio(nombre: string, personalizado = false): CriterioEvaluadoProveedor {
  return { id: crypto.randomUUID(), nombre, nivel: "", personalizado };
}

export function evaluacionProveedorVacia(): EvaluacionProveedor {
  return {
    id: crypto.randomUUID(),
    productoServicio: "",
    fecha: new Date().toISOString().slice(0, 10),
    tipoActividad: "Selección y Evaluación",
    incluyeServicioTecnico: true,
    evaluador: "",
    criterios: CRITERIOS_BASE_PROVEEDOR.map((n) => criterioProveedorVacio(n)),
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

// Si "Servicio técnico" no aplica a esta evaluación, se califica Excelente automáticamente
// (no resta puntos al proveedor por un servicio que no se contrató).
export function criteriosEfectivos(e: EvaluacionProveedor): CriterioEvaluadoProveedor[] {
  return e.criterios.map((c) =>
    c.nombre === "Servicio técnico" && !e.incluyeServicioTecnico ? { ...c, nivel: "Excelente" as NivelCalificacion } : c
  );
}

export function resultadoEvaluacionProveedor(e: EvaluacionProveedor): {
  puntosObtenidos: number;
  puntosMaximos: number;
  porcentaje: number;
  calificados: number;
  total: number;
} {
  const criterios = criteriosEfectivos(e);
  const calificados = criterios.filter((c) => c.nivel !== "");
  const puntosObtenidos = calificados.reduce((acc, c) => acc + puntosDeNivel(c.nivel), 0);
  const puntosMaximos = criterios.length * PESO_CRITERIO;
  const porcentaje = puntosMaximos > 0 ? (puntosObtenidos / puntosMaximos) * 100 : 0;
  return { puntosObtenidos, puntosMaximos, porcentaje, calificados: calificados.length, total: criterios.length };
}

export function nivelResultado(porcentaje: number): string {
  if (porcentaje >= 80) return "Excelente";
  if (porcentaje >= 70) return "Bueno";
  if (porcentaje >= 60) return "Regular";
  return "Malo";
}

export function colorNivel(nivel: string): string {
  switch (nivel) {
    case "Excelente":
      return "#22C55E";
    case "Bueno":
      return "#F5A623";
    case "Regular":
      return "#EAB308";
    case "Malo":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function esProveedorPotencial(porcentaje: number): boolean {
  return porcentaje >= 70;
}
