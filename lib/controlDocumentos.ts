// Gestión de Control de Documentos — ISO 9001:2015, cláusula 7.5.3 (Control de la información documentada).
//
// Este módulo NO duplica la edición de Procedimientos/Instructivos/Formatos — esos se siguen
// editando en Gestión de Procedimientos. Acá se agrega una capa de gobierno sobre todo eso:
//   1. Listado Maestro: agrega en vivo todos los documentos controlados del sistema (internos +
//      "otros documentos" de origen interno/externo que aún no tienen módulo propio).
//   2. Control de Cambios: historial de versiones — quién pidió el cambio, quién lo aprobó, qué
//      cambió y por qué. Al registrar un cambio sobre un documento existente, este módulo
//      actualiza automáticamente la versión y el estado de ese documento en su módulo de origen.
//   3. Otros Documentos: documentos controlados que no se desprenden de un Procedimiento
//      (manuales, políticas, normas técnicas, documentos de origen externo).

import { ESTADOS_DOCUMENTO, type EstadoDocumento } from "./procedimientos";

export { ESTADOS_DOCUMENTO, colorEstadoDocumento, type EstadoDocumento } from "./procedimientos";

// --- Otros Documentos (sin procedimiento padre: manuales, políticas, normas, externos) ---

export const ORIGENES_DOCUMENTO = ["Interno", "Externo"] as const;

export const CATEGORIAS_OTRO_DOCUMENTO = [
  "Manual",
  "Política",
  "Plan",
  "Norma técnica / legal",
  "Contrato",
  "Especificación de producto",
  "Plano / diseño",
  "Otro",
] as const;

export type OtroDocumento = {
  id: string;
  codigo: string; // ej: OD-0001
  nombre: string;
  origen: string; // Interno | Externo
  categoria: string;
  proceso: string;
  version: string;
  estado: EstadoDocumento;
  fechaVigencia: string;
  elaboradoPor: string;
  revisadoPor: string;
  aprobadoPor: string;
  fechaAprobacion: string;
  archivo: string | null;
  archivoNombre: string;
  archivoTipo: string;
  ubicacionDistribucion: string; // dónde está disponible / quién tiene acceso
  observaciones: string;
  fechaAlta: string;
};

export function otroDocumentoVacio(codigo: string): OtroDocumento {
  return {
    id: crypto.randomUUID(),
    codigo,
    nombre: "",
    origen: "Interno",
    categoria: "",
    proceso: "",
    version: "01",
    estado: "En revisión",
    fechaVigencia: "",
    elaboradoPor: "",
    revisadoPor: "",
    aprobadoPor: "",
    fechaAprobacion: "",
    archivo: null,
    archivoNombre: "",
    archivoTipo: "",
    ubicacionDistribucion: "",
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function parseOtrosDocumentos(contenido: string): OtroDocumento[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d: OtroDocumento) => ({ ...otroDocumentoVacio(d.codigo ?? ""), ...d }));
  } catch {
    return [];
  }
}

// --- Control de Cambios (historial de versiones / aprobaciones) ---

export type TipoDocumentoControlado = "Procedimiento" | "Instructivo" | "Formato" | "Otro";
export const TIPOS_DOCUMENTO_CONTROLADO: TipoDocumentoControlado[] = ["Procedimiento", "Instructivo", "Formato", "Otro"];

export const TIPOS_CAMBIO = ["Creación", "Actualización", "Revisión periódica", "Corrección", "Obsolescencia"] as const;

export type CambioDocumento = {
  id: string;
  numero: number;

  documentoTipo: TipoDocumentoControlado;
  documentoId: string; // id del Procedimiento/Instructivo/Formato/OtroDocumento afectado
  documentoCodigo: string;
  documentoNombre: string;

  versionAnterior: string;
  versionNueva: string;
  nuevoEstado: EstadoDocumento;

  tipoCambio: string;
  descripcionCambio: string;
  motivoCambio: string;

  solicitadoPor: string;
  aprobadoPor: string;
  fecha: string;
  fechaAlta: string;
};

export function cambioVacio(numero: number): CambioDocumento {
  return {
    id: crypto.randomUUID(),
    numero,
    documentoTipo: "Procedimiento",
    documentoId: "",
    documentoCodigo: "",
    documentoNombre: "",
    versionAnterior: "",
    versionNueva: "",
    nuevoEstado: "Vigente",
    tipoCambio: "Actualización",
    descripcionCambio: "",
    motivoCambio: "",
    solicitadoPor: "",
    aprobadoPor: "",
    fecha: new Date().toISOString().slice(0, 10),
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function siguienteCodigo(prefijo: string, numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeCodigo(codigo: string): number {
  const m = codigo.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function parseCambios(contenido: string): CambioDocumento[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: CambioDocumento, i: number) => ({ ...cambioVacio(i + 1), ...c }));
  } catch {
    return [];
  }
}

// --- Listado Maestro: fila unificada para cualquier tipo de documento controlado ---

export type FilaMaestra = {
  tipo: TipoDocumentoControlado;
  id: string;
  codigo: string;
  nombre: string;
  proceso: string;
  version: string;
  estado: EstadoDocumento;
  fechaVigencia: string;
  responsable: string; // aprobadoPor o elaboradoPor, el que exista
};

export function resumenPorEstado(filas: { estado: string }[]): { estado: string; cantidad: number }[] {
  return ESTADOS_DOCUMENTO.map((estado) => ({
    estado,
    cantidad: filas.filter((f) => f.estado === estado).length,
  })).filter((r) => r.cantidad > 0);
}

export function resumenPorTipo(filas: { tipo: TipoDocumentoControlado }[]): { tipo: TipoDocumentoControlado; cantidad: number }[] {
  return TIPOS_DOCUMENTO_CONTROLADO.map((tipo) => ({
    tipo,
    cantidad: filas.filter((f) => f.tipo === tipo).length,
  })).filter((r) => r.cantidad > 0);
}

export function vencenEn30Dias(filas: FilaMaestra[]): FilaMaestra[] {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 30);
  return filas.filter((f) => {
    if (!f.fechaVigencia || f.estado === "Obsoleto") return false;
    const fecha = new Date(f.fechaVigencia + "T00:00:00");
    return fecha >= hoy && fecha <= limite;
  });
}
