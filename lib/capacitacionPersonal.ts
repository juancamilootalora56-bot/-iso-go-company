export type CapacitacionItem = {
  id: string;
  tema: string;
  objetivo: string;
  tipo: string;
  modalidad: string;
  responsable: string;
  fechaProgramada: string;
  duracionHoras: string;
  estado: string;
  evaluacionEficacia: string;
  calificacion: string;
  observaciones: string;
};

export type ProgramaCapacitacion = {
  objetivoPrograma: string;
  deteccionNecesidades: string;
  capacitaciones: CapacitacionItem[];
};

export const TIPOS_CAPACITACION = [
  "Inducción",
  "Técnica / Específica del cargo",
  "Sistema de Gestión de Calidad",
  "Seguridad y Salud en el Trabajo",
  "Habilidades Blandas",
  "Normativa / Legal",
];

export const MODALIDADES_CAPACITACION = ["Presencial", "Virtual", "Mixta"];

export const ESTADOS_CAPACITACION = ["Programada", "En curso", "Completada", "Cancelada", "Reprogramada"];

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const OBJETIVO_PROGRAMA_DEFECTO =
  "Garantizar que el colaborador cuente con las competencias necesarias para desempeñar su cargo conforme " +
  "a los requisitos del Sistema de Gestión de Calidad (ISO 9001:2015, numerales 7.2 Competencia y 7.3 Toma " +
  "de Conciencia), mediante la identificación, planificación, ejecución y evaluación de la eficacia de las " +
  "acciones de capacitación.";

export function capacitacionVacia(): CapacitacionItem {
  return {
    id: crypto.randomUUID(),
    tema: "",
    objetivo: "",
    tipo: "",
    modalidad: "",
    responsable: "",
    fechaProgramada: "",
    duracionHoras: "",
    estado: "Programada",
    evaluacionEficacia: "",
    calificacion: "",
    observaciones: "",
  };
}

export function programaVacio(): ProgramaCapacitacion {
  return {
    objetivoPrograma: OBJETIVO_PROGRAMA_DEFECTO,
    deteccionNecesidades: "",
    capacitaciones: [],
  };
}

export function parsePrograma(contenido: string): ProgramaCapacitacion {
  const base = programaVacio();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    return {
      objetivoPrograma: parsed.objetivoPrograma ?? base.objetivoPrograma,
      deteccionNecesidades: parsed.deteccionNecesidades ?? base.deteccionNecesidades,
      capacitaciones: Array.isArray(parsed.capacitaciones) ? parsed.capacitaciones : [],
    };
  } catch {
    return base;
  }
}

export function colorEstado(estado: string): string {
  switch (estado) {
    case "Completada":
      return "#22C55E";
    case "En curso":
      return "#3B82F6";
    case "Cancelada":
      return "#EF4444";
    case "Reprogramada":
      return "#A78BFA";
    default:
      return "#F5A623"; // Programada
  }
}
