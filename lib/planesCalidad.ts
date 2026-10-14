// Planes de Calidad — ISO 9001:2015 / guía ISO 10005: plan específico de calidad
// para un producto, proyecto, contrato o proceso puntual.

export type PlanCalidad = {
  id: string;
  codigo: string; // ej: PC-0001
  nombre: string; // alcance / para qué producto, proyecto o contrato aplica
  proyectoRelacionadoId: string; // opcional, vincula a un Proyecto de Diseño
  proyectoRelacionadoNombre: string;
  objetivo: string;
  requisitosEspecificos: string;
  responsable: string;
  recursos: string;
  actividadesControl: string; // inspecciones, ensayos, verificaciones y en qué punto
  criteriosAceptacion: string;
  documentosGenerados: string; // registros/evidencia que se van a producir
  fechaInicio: string;
  fechaFin: string;
  estado: string; // ver ESTADOS_PLAN_CALIDAD
  observaciones: string;
};

export const ESTADOS_PLAN_CALIDAD = ["Planificado", "En ejecución", "Completado", "Suspendido"];

export function colorEstadoPlanCalidad(estado: string): string {
  switch (estado) {
    case "Planificado":
      return "#9CA3AF";
    case "En ejecución":
      return "#3B82F6";
    case "Completado":
      return "#22C55E";
    case "Suspendido":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function siguienteRadicadoPC(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `PC-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicadoPC(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function planCalidadVacio(codigo: string): PlanCalidad {
  return {
    id: crypto.randomUUID(),
    codigo,
    nombre: "",
    proyectoRelacionadoId: "",
    proyectoRelacionadoNombre: "",
    objetivo: "",
    requisitosEspecificos: "",
    responsable: "",
    recursos: "",
    actividadesControl: "",
    criteriosAceptacion: "",
    documentosGenerados: "",
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: "",
    estado: "Planificado",
    observaciones: "",
  };
}

export function parsePlanesCalidad(contenido: string): PlanCalidad[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function resumenPorEstadoPC(planes: PlanCalidad[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_PLAN_CALIDAD.map((estado) => ({
    estado,
    cantidad: planes.filter((p) => p.estado === estado).length,
    color: colorEstadoPlanCalidad(estado),
  })).filter((r) => r.cantidad > 0);
}
