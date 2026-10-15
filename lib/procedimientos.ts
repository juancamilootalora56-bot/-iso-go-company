// Gestión de Procedimientos — ISO 9001:2015, cláusula 7.5 (Información documentada).
// Jerarquía: Procedimiento (documento maestro, agrupado por proceso del Mapa de Procesos)
//   → Instructivos (se desprenden del procedimiento, paso a paso de una tarea puntual)
//   → Formatos (se desprenden del procedimiento, plantillas/registros para subir el archivo)

export type EstadoDocumento = "Vigente" | "En revisión" | "Obsoleto";
export const ESTADOS_DOCUMENTO: EstadoDocumento[] = ["Vigente", "En revisión", "Obsoleto"];

export function colorEstadoDocumento(estado: string): string {
  switch (estado) {
    case "Vigente":
      return "#22C55E";
    case "En revisión":
      return "#F5A623";
    case "Obsoleto":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

// --- Actividades del desarrollo del procedimiento ---

export type ActividadProcedimiento = {
  id: string;
  numero: number;
  etapa: string; // nombre corto de la etapa (ej: "Recepción de la solicitud")
  descripcion: string; // qué se hace
  responsable: string;
};

export function actividadVacia(numero: number): ActividadProcedimiento {
  return { id: crypto.randomUUID(), numero, etapa: "", descripcion: "", responsable: "" };
}

export function reordenarActividades(
  actividades: ActividadProcedimiento[],
  id: string,
  direccion: "arriba" | "abajo"
): ActividadProcedimiento[] {
  const ordenadas = [...actividades].sort((a, b) => a.numero - b.numero);
  const idx = ordenadas.findIndex((a) => a.id === id);
  const idxVecino = direccion === "arriba" ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenadas.length) return actividades;
  [ordenadas[idx], ordenadas[idxVecino]] = [ordenadas[idxVecino], ordenadas[idx]];
  return ordenadas.map((a, i) => ({ ...a, numero: i + 1 }));
}

// --- Glosario de definiciones ---

export type DefinicionTermino = { id: string; termino: string; definicion: string };

export function definicionVacia(): DefinicionTermino {
  return { id: crypto.randomUUID(), termino: "", definicion: "" };
}

// --- Registros que genera el procedimiento (pueden enlazar a un Formato ya creado) ---

export type RegistroProcedimiento = { id: string; nombre: string; formatoId: string };

export function registroVacio(): RegistroProcedimiento {
  return { id: crypto.randomUUID(), nombre: "", formatoId: "" };
}

// --- Procedimiento (documento maestro) ---

export type Procedimiento = {
  id: string;
  codigo: string; // ej: PRO-0001
  nombre: string;
  version: string; // ej: "01"
  fechaVigencia: string;
  estado: EstadoDocumento;

  proceso: string; // nombre del proceso (del Mapa de Procesos, o libre si no hay mapa)
  categoriaProceso: string; // "estrategicos" | "misionales" | "apoyo" | ""

  objetivo: string;
  alcance: string;
  responsables: string;
  definiciones: DefinicionTermino[];
  recursos: string;
  desarrollo: ActividadProcedimiento[];
  registros: RegistroProcedimiento[];

  elaboradoPor: string;
  revisadoPor: string;
  aprobadoPor: string;
  fechaElaboracion: string;
  fechaAprobacion: string;
  observaciones: string;
};

export function siguienteCodigo(prefijo: string, numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeCodigo(codigo: string): number {
  const m = codigo.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function procedimientoVacio(codigo: string): Procedimiento {
  return {
    id: crypto.randomUUID(),
    codigo,
    nombre: "",
    version: "01",
    fechaVigencia: "",
    estado: "En revisión",
    proceso: "",
    categoriaProceso: "",
    objetivo: "",
    alcance: "",
    responsables: "",
    definiciones: [],
    recursos: "",
    desarrollo: [actividadVacia(1)],
    registros: [],
    elaboradoPor: "",
    revisadoPor: "",
    aprobadoPor: "",
    fechaElaboracion: new Date().toISOString().slice(0, 10),
    fechaAprobacion: "",
    observaciones: "",
  };
}

export function parseProcedimientos(contenido: string): Procedimiento[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: Procedimiento) => ({
      ...p,
      definiciones: p.definiciones ?? [],
      desarrollo: p.desarrollo ?? [],
      registros: p.registros ?? [],
    }));
  } catch {
    return [];
  }
}

// --- Instructivo (se desprende de un procedimiento) ---

export type PasoInstructivo = { id: string; numero: number; descripcion: string; responsable: string };

export function pasoInstructivoVacio(numero: number): PasoInstructivo {
  return { id: crypto.randomUUID(), numero, descripcion: "", responsable: "" };
}

export function reordenarPasos(pasos: PasoInstructivo[], id: string, direccion: "arriba" | "abajo"): PasoInstructivo[] {
  const ordenados = [...pasos].sort((a, b) => a.numero - b.numero);
  const idx = ordenados.findIndex((p) => p.id === id);
  const idxVecino = direccion === "arriba" ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenados.length) return pasos;
  [ordenados[idx], ordenados[idxVecino]] = [ordenados[idxVecino], ordenados[idx]];
  return ordenados.map((p, i) => ({ ...p, numero: i + 1 }));
}

export type Instructivo = {
  id: string;
  codigo: string; // ej: INS-0001
  procedimientoId: string;
  nombre: string;
  version: string;
  fechaVigencia: string;
  estado: EstadoDocumento;
  objetivo: string;
  alcance: string;
  pasos: PasoInstructivo[];
  elaboradoPor: string;
  fechaElaboracion: string;
  observaciones: string;
};

export function instructivoVacio(codigo: string, procedimientoId: string): Instructivo {
  return {
    id: crypto.randomUUID(),
    codigo,
    procedimientoId,
    nombre: "",
    version: "01",
    fechaVigencia: "",
    estado: "En revisión",
    objetivo: "",
    alcance: "",
    pasos: [pasoInstructivoVacio(1)],
    elaboradoPor: "",
    fechaElaboracion: new Date().toISOString().slice(0, 10),
    observaciones: "",
  };
}

export function parseInstructivos(contenido: string): Instructivo[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((i: Instructivo) => ({ ...i, pasos: i.pasos ?? [] }));
  } catch {
    return [];
  }
}

// --- Formato (se desprende de un procedimiento; solo metadatos + archivo) ---

export type Formato = {
  id: string;
  codigo: string; // ej: FOR-0001
  procedimientoId: string;
  nombre: string;
  version: string;
  estado: EstadoDocumento;
  descripcion: string;
  archivo: string | null; // data URL
  archivoNombre: string;
  archivoTipo: string;
  fechaCarga: string;
};

export function formatoVacio(codigo: string, procedimientoId: string): Formato {
  return {
    id: crypto.randomUUID(),
    codigo,
    procedimientoId,
    nombre: "",
    version: "01",
    estado: "Vigente",
    descripcion: "",
    archivo: null,
    archivoNombre: "",
    archivoTipo: "",
    fechaCarga: new Date().toISOString().slice(0, 10),
  };
}

export function parseFormatos(contenido: string): Formato[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((f: Formato) => ({ ...f, archivo: f.archivo ?? null, archivoNombre: f.archivoNombre ?? "" }));
  } catch {
    return [];
  }
}

// --- Agregados por proceso (para el listado maestro) ---

export function resumenPorEstado(procedimientos: Procedimiento[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_DOCUMENTO.map((estado) => ({
    estado,
    cantidad: procedimientos.filter((p) => p.estado === estado).length,
    color: colorEstadoDocumento(estado),
  })).filter((r) => r.cantidad > 0);
}
