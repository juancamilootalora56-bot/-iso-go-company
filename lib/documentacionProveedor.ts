export type CategoriaDocumentoProveedor = {
  clave: string;
  nombre: string;
  icono: string;
  obligatorio: boolean;
};

// Expediente documental típico de un proveedor dentro de un sistema de gestión ISO 9001.
export const CATEGORIAS_DOCUMENTOS_PROVEEDOR: CategoriaDocumentoProveedor[] = [
  { clave: "ruc", nombre: "RUC / Constancia de inscripción", icono: "🪪", obligatorio: true },
  { clave: "patente", nombre: "Patente comercial / Habilitación municipal", icono: "🏛️", obligatorio: false },
  { clave: "cedula_representante", nombre: "Cédula del representante legal", icono: "🆔", obligatorio: false },
  { clave: "certificado_calidad", nombre: "Certificaciones de calidad (ISO u otras)", icono: "📜", obligatorio: false },
  { clave: "contrato", nombre: "Contrato / Acuerdo comercial firmado", icono: "📝", obligatorio: false },
  { clave: "referencias_comerciales", nombre: "Referencias comerciales", icono: "✉️", obligatorio: false },
  { clave: "lista_precios", nombre: "Lista de precios / Catálogo", icono: "🏷️", obligatorio: false },
  { clave: "datos_bancarios", nombre: "Constancia de cuenta bancaria", icono: "🏦", obligatorio: false },
  { clave: "seguro", nombre: "Póliza de seguro (si aplica)", icono: "🛡️", obligatorio: false },
];

export type DocumentoProveedorArchivo = {
  id: string;
  categoria: string; // clave de CATEGORIAS_DOCUMENTOS_PROVEEDOR, o "otro"
  nombreOtro: string; // solo si categoria === "otro"
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  fechaCarga: string;
};

export function parseDocumentosProveedor(contenido: string): DocumentoProveedorArchivo[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function nombreCategoriaProveedor(clave: string): string {
  return CATEGORIAS_DOCUMENTOS_PROVEEDOR.find((c) => c.clave === clave)?.nombre ?? clave;
}
