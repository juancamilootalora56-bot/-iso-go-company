// Diseño y desarrollo de productos y servicios — ISO 9001:2015, cláusula 8.3.

export type ProyectoDiseno = {
  id: string;
  imagen: string | null; // data URL (base64)

  codigo: string;
  nombre: string;
  tipo: string; // ver TIPOS_PROYECTO_DISENO
  responsableDiseno: string;
  clienteSolicitante: string;
  descripcion: string;

  fechaInicio: string;
  fechaFinPlaneada: string;
  fechaFinReal: string;

  estado: string; // ver ESTADOS_PROYECTO_DISENO
  fechaAlta: string;
  observaciones: string;
};

export const TIPOS_PROYECTO_DISENO = [
  "Producto nuevo",
  "Modificación de producto existente",
  "Servicio nuevo",
  "Proceso nuevo",
  "Otro",
];

export const ESTADOS_PROYECTO_DISENO = [
  "Planificación",
  "En desarrollo",
  "En revisión",
  "Verificado",
  "Validado",
  "Cerrado",
  "Suspendido",
];

export function colorEstadoProyectoDiseno(estado: string): string {
  switch (estado) {
    case "Planificación":
      return "#9CA3AF";
    case "En desarrollo":
      return "#3B82F6";
    case "En revisión":
      return "#F5A623";
    case "Verificado":
      return "#8B5CF6";
    case "Validado":
      return "#14B8A6";
    case "Cerrado":
      return "#22C55E";
    case "Suspendido":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function proyectoDisenoAbierto(estado: string): boolean {
  return estado !== "Cerrado" && estado !== "Suspendido";
}

export function proyectoDisenoVencido(p: ProyectoDiseno): boolean {
  if (!p.fechaFinPlaneada || !proyectoDisenoAbierto(p.estado)) return false;
  return new Date(p.fechaFinPlaneada + "T00:00:00").getTime() < Date.now();
}

export function proyectoDisenoVacio(): ProyectoDiseno {
  return {
    id: crypto.randomUUID(),
    imagen: null,
    codigo: "",
    nombre: "",
    tipo: "Producto nuevo",
    responsableDiseno: "",
    clienteSolicitante: "",
    descripcion: "",
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFinPlaneada: "",
    fechaFinReal: "",
    estado: "Planificación",
    fechaAlta: new Date().toISOString().slice(0, 10),
    observaciones: "",
  };
}

export function parseProyectosDiseno(contenido: string): ProyectoDiseno[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function resumenPorEstadoProyectoDiseno(
  proyectos: ProyectoDiseno[]
): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_PROYECTO_DISENO.map((estado) => ({
    estado,
    cantidad: proyectos.filter((p) => p.estado === estado).length,
    color: colorEstadoProyectoDiseno(estado),
  })).filter((r) => r.cantidad > 0);
}

// --- 8.3.2 Planificación del diseño y desarrollo ---

export type EtapaPlanificacion = {
  id: string;
  nombre: string;
  responsable: string;
  fechaInicio: string;
  fechaFinPlaneada: string;
  fechaFinReal: string;
  estado: string; // ver ESTADOS_ETAPA_PLANIFICACION
  recursosNecesarios: string;
  observaciones: string;
};

export const ESTADOS_ETAPA_PLANIFICACION = ["Pendiente", "En curso", "Completada", "Retrasada"];

export function colorEstadoEtapaPlanificacion(estado: string): string {
  switch (estado) {
    case "Pendiente":
      return "#9CA3AF";
    case "En curso":
      return "#3B82F6";
    case "Completada":
      return "#22C55E";
    case "Retrasada":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function etapaPlanificacionVacia(): EtapaPlanificacion {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    responsable: "",
    fechaInicio: "",
    fechaFinPlaneada: "",
    fechaFinReal: "",
    estado: "Pendiente",
    recursosNecesarios: "",
    observaciones: "",
  };
}

export function parseEtapasPlanificacion(contenido: string): EtapaPlanificacion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function cumplimientoPlanificacion(etapas: EtapaPlanificacion[]): number | null {
  if (etapas.length === 0) return null;
  const completas = etapas.filter((e) => e.estado === "Completada").length;
  return Math.round((completas / etapas.length) * 100);
}

// --- 8.3.3 Entradas para el diseño y desarrollo ---

export type EntradaDiseno = {
  id: string;
  tipo: string; // ver TIPOS_ENTRADA_DISENO
  descripcion: string;
  fuente: string;
  obligatorio: boolean;
  resuelta: boolean;
  archivo: string | null; // data URL
  archivoNombre: string;
};

export const TIPOS_ENTRADA_DISENO = [
  "Requisito funcional y de desempeño",
  "Requisito legal o reglamentario",
  "Norma o estándar aplicable",
  "Información de diseños previos similares",
  "Consecuencias potenciales de falla",
  "Requisito del cliente",
  "Otro",
];

export function entradaDisenoVacia(): EntradaDiseno {
  return {
    id: crypto.randomUUID(),
    tipo: "Requisito funcional y de desempeño",
    descripcion: "",
    fuente: "",
    obligatorio: true,
    resuelta: false,
    archivo: null,
    archivoNombre: "",
  };
}

export function parseEntradasDiseno(contenido: string): EntradaDiseno[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: EntradaDiseno) => ({
      ...e,
      archivo: e.archivo ?? null,
      archivoNombre: e.archivoNombre ?? "",
    }));
  } catch {
    return [];
  }
}

// --- 8.3.5 Salidas del diseño y desarrollo ---

export type SalidaDiseno = {
  id: string;
  tipo: string; // ver TIPOS_SALIDA_DISENO
  descripcion: string;
  entradaRelacionadaId: string;
  archivo: string | null; // data URL
  archivoNombre: string;
  aprobada: boolean;
  fecha: string;
};

export const TIPOS_SALIDA_DISENO = [
  "Especificación técnica",
  "Plano o dibujo técnico",
  "Lista de materiales (BOM)",
  "Criterio de aceptación",
  "Ficha técnica",
  "Instructivo de uso o instalación",
  "Requisito de seguimiento y medición",
  "Otro",
];

export function salidaDisenoVacia(): SalidaDiseno {
  return {
    id: crypto.randomUUID(),
    tipo: "Especificación técnica",
    descripcion: "",
    entradaRelacionadaId: "",
    archivo: null,
    archivoNombre: "",
    aprobada: false,
    fecha: new Date().toISOString().slice(0, 10),
  };
}

export function parseSalidasDiseno(contenido: string): SalidaDiseno[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- 8.3.4 Controles del diseño y desarrollo (revisión, verificación, validación) ---

export type RevisionDiseno = {
  id: string;
  fecha: string;
  participantes: string;
  hallazgos: string;
  accionesDerivadas: string;
  responsable: string;
};

export type VerificacionDiseno = {
  id: string;
  fecha: string;
  metodo: string; // ver METODOS_CONTROL_DISENO
  resultado: string; // ver RESULTADOS_CONTROL_DISENO
  responsable: string;
  observaciones: string;
};

export type ValidacionDiseno = {
  id: string;
  fecha: string;
  condicionesUso: string;
  resultado: string; // ver RESULTADOS_CONTROL_DISENO
  responsable: string;
  observaciones: string;
};

export type ControlDiseno = {
  revisiones: RevisionDiseno[];
  verificaciones: VerificacionDiseno[];
  validaciones: ValidacionDiseno[];
};

export const METODOS_CONTROL_DISENO = [
  "Cálculo alternativo",
  "Comparación con un diseño similar probado",
  "Ensayo y demostración",
  "Inspección antes de la entrega",
  "Revisión documental",
  "Otro",
];

export const RESULTADOS_CONTROL_DISENO = ["Pendiente", "Conforme", "No conforme"];

export function colorResultadoControlDiseno(resultado: string): string {
  switch (resultado) {
    case "Conforme":
      return "#22C55E";
    case "No conforme":
      return "#EF4444";
    case "Pendiente":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function revisionDisenoVacia(): RevisionDiseno {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    participantes: "",
    hallazgos: "",
    accionesDerivadas: "",
    responsable: "",
  };
}

export function verificacionDisenoVacia(): VerificacionDiseno {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    metodo: "Inspección antes de la entrega",
    resultado: "Pendiente",
    responsable: "",
    observaciones: "",
  };
}

export function validacionDisenoVacia(): ValidacionDiseno {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    condicionesUso: "",
    resultado: "Pendiente",
    responsable: "",
    observaciones: "",
  };
}

export function controlDisenoVacio(): ControlDiseno {
  return { revisiones: [], verificaciones: [], validaciones: [] };
}

export function parseControlDiseno(contenido: string): ControlDiseno {
  if (!contenido) return controlDisenoVacio();
  try {
    const parsed = JSON.parse(contenido);
    return {
      revisiones: Array.isArray(parsed.revisiones) ? parsed.revisiones : [],
      verificaciones: Array.isArray(parsed.verificaciones) ? parsed.verificaciones : [],
      validaciones: Array.isArray(parsed.validaciones) ? parsed.validaciones : [],
    };
  } catch {
    return controlDisenoVacio();
  }
}

// --- Diagrama de etapas (8.3.2 a 8.3.6), estado derivado para el stepper visual ---

export type EstadoEtapaDiagrama = "pendiente" | "en_curso" | "completo";

export const ETAPAS_DISENO: { clave: string; nombre: string; icono: string }[] = [
  { clave: "planificacion", nombre: "Planificación", icono: "🗒️" },
  { clave: "entradas", nombre: "Entradas", icono: "📥" },
  { clave: "salidas", nombre: "Salidas", icono: "📤" },
  { clave: "revision", nombre: "Revisión", icono: "🔎" },
  { clave: "verificacion", nombre: "Verificación", icono: "✅" },
  { clave: "validacion", nombre: "Validación", icono: "🏁" },
  { clave: "cierre", nombre: "Cierre", icono: "🔒" },
];

export function estadoEtapaPlanificacionDiagrama(etapas: EtapaPlanificacion[]): EstadoEtapaDiagrama {
  if (etapas.length === 0) return "pendiente";
  return etapas.every((e) => e.estado === "Completada") ? "completo" : "en_curso";
}

export function estadoEtapaEntradasDiagrama(entradas: EntradaDiseno[]): EstadoEtapaDiagrama {
  if (entradas.length === 0) return "pendiente";
  return entradas.every((e) => e.resuelta) ? "completo" : "en_curso";
}

export function estadoEtapaSalidasDiagrama(salidas: SalidaDiseno[]): EstadoEtapaDiagrama {
  if (salidas.length === 0) return "pendiente";
  return salidas.every((s) => s.aprobada) ? "completo" : "en_curso";
}

export function estadoEtapaRevisionDiagrama(control: ControlDiseno): EstadoEtapaDiagrama {
  return control.revisiones.length > 0 ? "completo" : "pendiente";
}

export function estadoEtapaVerificacionDiagrama(control: ControlDiseno): EstadoEtapaDiagrama {
  if (control.verificaciones.length === 0) return "pendiente";
  return control.verificaciones.every((v) => v.resultado === "Conforme") ? "completo" : "en_curso";
}

export function estadoEtapaValidacionDiagrama(control: ControlDiseno): EstadoEtapaDiagrama {
  if (control.validaciones.length === 0) return "pendiente";
  return control.validaciones.every((v) => v.resultado === "Conforme") ? "completo" : "en_curso";
}

export function estadoEtapaCierreDiagrama(proyecto: ProyectoDiseno): EstadoEtapaDiagrama {
  return proyecto.estado === "Cerrado" ? "completo" : "pendiente";
}

export function estadosEtapasDiagrama(
  proyecto: ProyectoDiseno,
  etapas: EtapaPlanificacion[],
  entradas: EntradaDiseno[],
  salidas: SalidaDiseno[],
  control: ControlDiseno
): Record<string, EstadoEtapaDiagrama> {
  return {
    planificacion: estadoEtapaPlanificacionDiagrama(etapas),
    entradas: estadoEtapaEntradasDiagrama(entradas),
    salidas: estadoEtapaSalidasDiagrama(salidas),
    revision: estadoEtapaRevisionDiagrama(control),
    verificacion: estadoEtapaVerificacionDiagrama(control),
    validacion: estadoEtapaValidacionDiagrama(control),
    cierre: estadoEtapaCierreDiagrama(proyecto),
  };
}
