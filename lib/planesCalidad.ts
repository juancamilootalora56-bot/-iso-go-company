// Planes de Calidad — ISO 9001:2015 / guía ISO 10005: plan específico de calidad
// para un producto, proyecto o contrato puntual, documentado por fases de trabajo.

export type ActividadFase = {
  id: string;
  numero: number;
  actividad: string;
  responsable: string;
  fechaInicio: string;
  fechaEntrega: string;
  duracion: string;
  porcentajeCompletado: number;
};

export type FaseCronograma = {
  id: string;
  nombre: string; // "Fase 1", "Fase 2"...
  actividades: ActividadFase[];
};

export type PlanCalidad = {
  id: string;
  codigo: string; // ej: PC-0001
  nombreProyecto: string;
  foto: string | null; // data URL (base64)

  introduccion: string;
  alcance: string;
  definiciones: string;
  objetivoCalidad: string;
  requisitosCalidad: string;

  responsableProyecto: string;
  nombreEmpresa: string;
  fecha: string;

  fases: FaseCronograma[];

  estado: string; // ver ESTADOS_PLAN_CALIDAD
  fechaAlta: string;

  // IDs de Empleado (lib/personal.ts) de los colaboradores con acceso de
  // edición completa a este plan puntual (pueden trabajarlo entero: Planes,
  // Organigrama, Manuales, Cronograma y Plan de Gestión de Obra), sin
  // importar si tienen el módulo Diseño y Desarrollo asignado desde su perfil.
  colaboradoresConAcceso: string[];
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

export function actividadFaseVacia(numero: number): ActividadFase {
  return {
    id: crypto.randomUUID(),
    numero,
    actividad: "",
    responsable: "",
    fechaInicio: "",
    fechaEntrega: "",
    duracion: "",
    porcentajeCompletado: 0,
  };
}

export function faseVacia(numeroFase: number): FaseCronograma {
  return {
    id: crypto.randomUUID(),
    nombre: `Fase ${numeroFase}`,
    actividades: [actividadFaseVacia(1), actividadFaseVacia(2), actividadFaseVacia(3)],
  };
}

export function planCalidadVacio(codigo: string): PlanCalidad {
  return {
    id: crypto.randomUUID(),
    codigo,
    nombreProyecto: "",
    foto: null,
    introduccion: "",
    alcance: "",
    definiciones: "",
    objetivoCalidad: "",
    requisitosCalidad: "",
    responsableProyecto: "",
    nombreEmpresa: "",
    fecha: new Date().toISOString().slice(0, 10),
    fases: [faseVacia(1)],
    estado: "Planificado",
    fechaAlta: new Date().toISOString().slice(0, 10),
    colaboradoresConAcceso: [],
  };
}

export function parsePlanesCalidad(contenido: string): PlanCalidad[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: PlanCalidad) => ({
      ...p,
      foto: p.foto ?? null,
      fases: Array.isArray(p.fases)
        ? p.fases.map((f) => ({ ...f, actividades: Array.isArray(f.actividades) ? f.actividades : [] }))
        : [],
      colaboradoresConAcceso: p.colaboradoresConAcceso ?? [],
    }));
  } catch {
    return [];
  }
}

export function cumplimientoFase(fase: FaseCronograma): number | null {
  if (fase.actividades.length === 0) return null;
  const total = fase.actividades.reduce((acc, a) => acc + (a.porcentajeCompletado || 0), 0);
  return Math.round(total / fase.actividades.length);
}

export function cumplimientoPlan(plan: PlanCalidad): number | null {
  const todas = plan.fases.flatMap((f) => f.actividades);
  if (todas.length === 0) return null;
  const total = todas.reduce((acc, a) => acc + (a.porcentajeCompletado || 0), 0);
  return Math.round(total / todas.length);
}

export function resumenPorEstadoPC(planes: PlanCalidad[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_PLAN_CALIDAD.map((estado) => ({
    estado,
    cantidad: planes.filter((p) => p.estado === estado).length,
    color: colorEstadoPlanCalidad(estado),
  })).filter((r) => r.cantidad > 0);
}
