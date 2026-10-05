export type Referencia = {
  id: string;
  // Datos del referente
  nombreReferente: string;
  empresaReferente: string;
  cargoReferente: string;
  relacion: string;
  telefono: string;
  email: string;
  fechaVerificacion: string;
  verificadoPor: string;

  // Datos laborales a confirmar
  cargoConfirmado: string;
  fechaIngresoConfirmada: string;
  fechaEgresoConfirmada: string;
  motivoSalidaSegunReferente: string;
  funcionesConfirmadas: string;

  // Evaluación
  desempeno: string;
  fortalezas: string;
  areasMejora: string;
  relacionCompaneros: string;
  problemasAsistencia: string;
  volveriaContratar: string;
  comentariosAdicionales: string;
  calificacionGeneral: string;
};

export const RELACIONES_REFERENTE = [
  "Jefe directo",
  "Gerente / Director",
  "Compañero de trabajo",
  "Subordinado",
  "Cliente",
  "Proveedor",
  "Otro",
];

export const NIVELES_DESEMPENO = ["Excelente", "Bueno", "Regular", "Deficiente"];
export const OPCIONES_SI_NO = ["Sí", "No", "Con condiciones"];
export const CALIFICACIONES_GENERALES = ["Apto", "Apto con observaciones", "No apto"];

export function referenciaVacia(): Referencia {
  return {
    id: crypto.randomUUID(),
    nombreReferente: "",
    empresaReferente: "",
    cargoReferente: "",
    relacion: "",
    telefono: "",
    email: "",
    fechaVerificacion: "",
    verificadoPor: "",
    cargoConfirmado: "",
    fechaIngresoConfirmada: "",
    fechaEgresoConfirmada: "",
    motivoSalidaSegunReferente: "",
    funcionesConfirmadas: "",
    desempeno: "",
    fortalezas: "",
    areasMejora: "",
    relacionCompaneros: "",
    problemasAsistencia: "",
    volveriaContratar: "",
    comentariosAdicionales: "",
    calificacionGeneral: "",
  };
}

export function parseReferencias(contenido: string): Referencia[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function colorCalificacion(valor: string): string {
  switch (valor) {
    case "Apto":
      return "#22C55E";
    case "Apto con observaciones":
      return "#F5A623";
    case "No apto":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}
