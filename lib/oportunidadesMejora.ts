// Gestión de Oportunidades de Mejora — ISO 9001:2015, cláusulas 10.1 (Mejora, general)
// y 10.3 (Mejora continua). Ciclo PHVA completo con priorización por impacto/esfuerzo.

export type EventoOM = {
  id: string;
  fecha: string; // fecha y hora ISO
  nota: string;
  autor: string;
};

export type OportunidadMejora = {
  id: string;
  radicado: string; // ej: "OM-0001"

  // Identificación
  titulo: string;
  origen: string; // ver ORIGENES_OM
  procesoArea: string;
  descripcion: string;
  beneficioEsperado: string;
  fechaIdentificacion: string;
  identificadoPor: string;

  // Priorización (matriz impacto x esfuerzo)
  impacto: string; // ver NIVELES_OM
  esfuerzo: string; // ver NIVELES_OM

  // Planificar (P)
  accionPropuesta: string;
  responsable: string;
  recursosNecesarios: string;
  fechaPlaneada: string;

  // Hacer (H)
  fechaEjecucion: string;
  evidenciaEjecucion: string;
  evidenciaArchivo: string | null; // data URL
  evidenciaArchivoNombre: string;

  // Verificar (V)
  fechaVerificacion: string;
  indicadorVerificacion: string;
  resultadoVerificacion: string; // ver RESULTADOS_VERIFICACION_OM

  // Actuar (A)
  seEstandarizo: boolean;
  comoSeEstandarizo: string;

  // Estado y seguimiento
  estado: string; // ver ESTADOS_OM
  bitacora: EventoOM[];
  fechaCierre: string;
  observaciones: string;
};

export const ORIGENES_OM = [
  "Auditoría interna",
  "Auditoría externa",
  "No conformidad",
  "Revisión por la dirección",
  "Sugerencia de colaborador",
  "Análisis de riesgos y oportunidades",
  "Indicador / desempeño de proceso",
  "Retroalimentación del cliente",
  "Benchmarking",
  "Otro",
];

export const NIVELES_OM = ["Alto", "Medio", "Bajo"];

export const RESULTADOS_VERIFICACION_OM = ["Pendiente", "Efectiva", "Parcialmente efectiva", "No efectiva"];

export const ESTADOS_OM = [
  "Identificada",
  "En evaluación",
  "Aprobada",
  "En implementación",
  "Implementada",
  "Verificada",
  "Cerrada",
  "Rechazada",
];

export function colorEstadoOM(estado: string): string {
  switch (estado) {
    case "Identificada":
      return "#9CA3AF";
    case "En evaluación":
      return "#F5A623";
    case "Aprobada":
      return "#3B82F6";
    case "En implementación":
      return "#8B5CF6";
    case "Implementada":
      return "#14B8A6";
    case "Verificada":
      return "#22C55E";
    case "Cerrada":
      return "#16A34A";
    case "Rechazada":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function colorResultadoVerificacionOM(resultado: string): string {
  switch (resultado) {
    case "Efectiva":
      return "#22C55E";
    case "Parcialmente efectiva":
      return "#F5A623";
    case "No efectiva":
      return "#EF4444";
    case "Pendiente":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function estaAbiertaOM(estado: string): boolean {
  return estado !== "Cerrada" && estado !== "Rechazada";
}

export function siguienteRadicadoOM(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `OM-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicadoOM(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function eventoOMVacio(nota: string, autor: string): EventoOM {
  return { id: crypto.randomUUID(), fecha: new Date().toISOString(), nota, autor };
}

export function oportunidadMejoraVacia(radicado: string): OportunidadMejora {
  return {
    id: crypto.randomUUID(),
    radicado,
    titulo: "",
    origen: "Indicador / desempeño de proceso",
    procesoArea: "",
    descripcion: "",
    beneficioEsperado: "",
    fechaIdentificacion: new Date().toISOString().slice(0, 10),
    identificadoPor: "",
    impacto: "Medio",
    esfuerzo: "Medio",
    accionPropuesta: "",
    responsable: "",
    recursosNecesarios: "",
    fechaPlaneada: "",
    fechaEjecucion: "",
    evidenciaEjecucion: "",
    evidenciaArchivo: null,
    evidenciaArchivoNombre: "",
    fechaVerificacion: "",
    indicadorVerificacion: "",
    resultadoVerificacion: "Pendiente",
    seEstandarizo: false,
    comoSeEstandarizo: "",
    estado: "Identificada",
    bitacora: [],
    fechaCierre: "",
    observaciones: "",
  };
}

export function parseOportunidadesMejora(contenido: string): OportunidadMejora[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((o: OportunidadMejora) => ({
      ...o,
      bitacora: o.bitacora ?? [],
      evidenciaArchivo: o.evidenciaArchivo ?? null,
      evidenciaArchivoNombre: o.evidenciaArchivoNombre ?? "",
    }));
  } catch {
    return [];
  }
}

// --- Priorización: matriz Impacto x Esfuerzo (2x2 clásica de mejora continua) ---

export type CuadrantePrioridad = {
  etiqueta: string;
  color: string;
  orden: number; // 1 = máxima prioridad
};

export function prioridadOM(impacto: string, esfuerzo: string): CuadrantePrioridad {
  if (impacto === "Alto" && esfuerzo === "Bajo") return { etiqueta: "Victoria rápida", color: "#22C55E", orden: 1 };
  if (impacto === "Alto" && esfuerzo === "Medio") return { etiqueta: "Alta prioridad", color: "#14B8A6", orden: 2 };
  if (impacto === "Alto" && esfuerzo === "Alto") return { etiqueta: "Proyecto estratégico", color: "#3B82F6", orden: 3 };
  if (impacto === "Medio" && esfuerzo === "Bajo") return { etiqueta: "Oportunista", color: "#F5A623", orden: 4 };
  if (impacto === "Medio" && esfuerzo === "Medio") return { etiqueta: "A evaluar", color: "#F5A623", orden: 5 };
  if (impacto === "Bajo" && esfuerzo === "Bajo") return { etiqueta: "Relleno", color: "#9CA3AF", orden: 6 };
  return { etiqueta: "Bajo valor", color: "#EF4444", orden: 7 };
}

function nivelAEje(nivel: string): number {
  // 0 = Bajo, 1 = Medio, 2 = Alto — usado para ubicar el punto en la matriz 2x2.
  if (nivel === "Alto") return 2;
  if (nivel === "Medio") return 1;
  return 0;
}

export function posicionMatrizOM(o: OportunidadMejora): { x: number; y: number } {
  return { x: nivelAEje(o.esfuerzo), y: nivelAEje(o.impacto) };
}

function diasEntre(desde: string, hasta: string): number | null {
  if (!desde || !hasta) return null;
  const a = new Date(desde + "T00:00:00").getTime();
  const b = new Date(hasta + "T00:00:00").getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

export function diasAbiertaOM(o: OportunidadMejora): number {
  const hasta = o.fechaCierre || new Date().toISOString().slice(0, 10);
  return diasEntre(o.fechaIdentificacion, hasta) ?? 0;
}

export function tiempoPromedioCicloOM(oms: OportunidadMejora[]): number | null {
  const cerradas = oms.filter((o) => o.estado === "Cerrada" && o.fechaCierre);
  if (cerradas.length === 0) return null;
  const total = cerradas.reduce((acc, o) => acc + (diasEntre(o.fechaIdentificacion, o.fechaCierre) ?? 0), 0);
  return Math.round((total / cerradas.length) * 10) / 10;
}

export function tasaEfectividadOM(oms: OportunidadMejora[]): number | null {
  const verificadas = oms.filter((o) => o.resultadoVerificacion !== "Pendiente");
  if (verificadas.length === 0) return null;
  const efectivas = verificadas.filter((o) => o.resultadoVerificacion === "Efectiva").length;
  return Math.round((efectivas / verificadas.length) * 100);
}

export function resumenPorEstadoOM(oms: OportunidadMejora[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_OM.map((estado) => ({
    estado,
    cantidad: oms.filter((o) => o.estado === estado).length,
    color: colorEstadoOM(estado),
  })).filter((r) => r.cantidad > 0);
}

export function resumenPorOrigenOM(oms: OportunidadMejora[]): { origen: string; cantidad: number }[] {
  return ORIGENES_OM.map((origen) => ({
    origen,
    cantidad: oms.filter((o) => o.origen === origen).length,
  })).filter((r) => r.cantidad > 0);
}
