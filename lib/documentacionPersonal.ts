export type CategoriaDocumento = {
  clave: string;
  nombre: string;
  icono: string;
  obligatorio: boolean;
};

// Expediente de personal típico de un área de Gestión Humana.
export const CATEGORIAS_DOCUMENTOS: CategoriaDocumento[] = [
  { clave: "cv", nombre: "Curriculum Vitae", icono: "📄", obligatorio: true },
  { clave: "cedula", nombre: "Documento de identidad (CI)", icono: "🪪", obligatorio: true },
  { clave: "titulo", nombre: "Título / Diploma académico", icono: "🎓", obligatorio: false },
  { clave: "certificados_curso", nombre: "Certificados de cursos o capacitaciones", icono: "📜", obligatorio: false },
  { clave: "antecedentes", nombre: "Certificado de antecedentes policiales/judiciales", icono: "🛡️", obligatorio: false },
  { clave: "certificado_medico", nombre: "Certificado médico de aptitud laboral", icono: "🩺", obligatorio: false },
  { clave: "contrato", nombre: "Contrato de trabajo firmado", icono: "📝", obligatorio: true },
  { clave: "seguro_social", nombre: "Afiliación a seguro social (IPS)", icono: "🏥", obligatorio: false },
  { clave: "foto_carnet", nombre: "Fotografía tipo carnet", icono: "📷", obligatorio: false },
  { clave: "licencia_conducir", nombre: "Licencia de conducir (si aplica al cargo)", icono: "🚗", obligatorio: false },
  { clave: "cartas_referencia", nombre: "Cartas de referencia", icono: "✉️", obligatorio: false },
  { clave: "datos_bancarios", nombre: "Datos bancarios para pago de salario", icono: "🏦", obligatorio: false },
];

export type DocumentoArchivo = {
  id: string;
  categoria: string; // clave de CATEGORIAS_DOCUMENTOS, o "otro"
  nombreOtro: string; // solo si categoria === "otro"
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  fechaCarga: string;
};

export function parseDocumentos(contenido: string): DocumentoArchivo[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function nombreCategoria(clave: string): string {
  return CATEGORIAS_DOCUMENTOS.find((c) => c.clave === clave)?.nombre ?? clave;
}
