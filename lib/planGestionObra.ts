// Plan de Gestión de Obra — anexo del Plan de Calidad para proyectos de
// construcción/obra civil. Las actividades son una lista fija (mismo orden
// que la plantilla de referencia): no se agregan ni se eliminan filas, solo
// se completan las columnas de control para cada una.

export const ACTIVIDADES_OBRA_FIJAS = [
  "Demolición",
  "Implantación",
  "Replanteo general",
  "Pilotes",
  "Estructura de hormigón armado",
  "Mampostería",
  "Instalaciones",
  "Revoques",
  "Carpeta",
  "Cielorraso",
  "Pisos",
  "Revestimientos",
  "Impermeabilizaciones",
  "Carpintería de Aluminio",
  "Carpintería de Madera",
  "Ascensor",
  "Herrería",
  "Pintura",
  "Equipamiento",
  "Limpieza fina",
  "Entrega de unidades",
  "Repliegue de obra",
  "Cierre de obra",
] as const;

export type ActividadObra = {
  nombre: string;
  documentoAplicable: string;
  responsableActividad: string;
  caracteristicaCalidad: string;
  documentoControlAplicable: string;
  registroFichaControl: string;
  responsableControl: string;
  metodoEquipoInspeccion: string;
  observaciones: string;
  documentosSeguridad: string;
};

export type PlanGestionObra = {
  codigo: string;
  revision: string;
  proyecto: string;
  cliente: string;
  subrubro: string;
  fecha: string;
  actividades: ActividadObra[];
  elaboradoCargo: string;
  elaboradoFirma: string;
  elaboradoFecha: string;
  revisadoCargo: string;
  revisadoFirma: string;
  revisadoFecha: string;
  aprobadoCargo: string;
  aprobadoFirma: string;
  aprobadoFecha: string;
};

export function actividadObraVacia(nombre: string): ActividadObra {
  return {
    nombre,
    documentoAplicable: "",
    responsableActividad: "",
    caracteristicaCalidad: "",
    documentoControlAplicable: "",
    registroFichaControl: "",
    responsableControl: "",
    metodoEquipoInspeccion: "",
    observaciones: "",
    documentosSeguridad: "",
  };
}

export function planGestionObraVacio(): PlanGestionObra {
  return {
    codigo: "",
    revision: "00",
    proyecto: "",
    cliente: "",
    subrubro: "",
    fecha: new Date().toISOString().slice(0, 10),
    actividades: ACTIVIDADES_OBRA_FIJAS.map((n) => actividadObraVacia(n)),
    elaboradoCargo: "Jefe de Obra / Capataz",
    elaboradoFirma: "",
    elaboradoFecha: "",
    revisadoCargo: "Coordinador de Calidad (ISOGO)",
    revisadoFirma: "",
    revisadoFecha: "",
    aprobadoCargo: "Gerencia General / Jefe de Obra",
    aprobadoFirma: "",
    aprobadoFecha: "",
  };
}

// Las actividades siempre se reconstruyen a partir de la lista fija, tomando
// los datos guardados de cada una por nombre — así, si la plantilla cambia
// en el futuro, los planes viejos no quedan con filas huérfanas o faltantes.
export function parsePlanGestionObra(contenido: string): PlanGestionObra {
  const base = planGestionObraVacio();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    const guardadas: ActividadObra[] = Array.isArray(parsed.actividades) ? parsed.actividades : [];
    const actividades = ACTIVIDADES_OBRA_FIJAS.map((nombre) => {
      const encontrada = guardadas.find((a) => a.nombre === nombre);
      return encontrada ? { ...actividadObraVacia(nombre), ...encontrada } : actividadObraVacia(nombre);
    });
    return { ...base, ...parsed, actividades };
  } catch {
    return base;
  }
}
