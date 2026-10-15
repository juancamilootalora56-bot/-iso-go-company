// Matriz de Requisitos Legales y Reglamentarios — ISO 9001:2015, cláusulas 4.2 y 8.2.2 (cumplimiento legal).
// Diseñada genérica: categorías y ámbitos cubren cualquier sector; cada empresa solo llena las filas aplicables.

export type NivelCumplimiento = "Cumple" | "Cumple parcialmente" | "No cumple" | "No aplica" | "En evaluación";
export const NIVELES_CUMPLIMIENTO: NivelCumplimiento[] = ["Cumple", "Cumple parcialmente", "No cumple", "No aplica", "En evaluación"];

export function colorNivelCumplimiento(nivel: string): string {
  switch (nivel) {
    case "Cumple":
      return "#22C55E";
    case "Cumple parcialmente":
      return "#F5A623";
    case "No cumple":
      return "#EF4444";
    case "No aplica":
      return "#9CA3AF";
    case "En evaluación":
      return "#3B82F6";
    default:
      return "#9CA3AF";
  }
}

export const CATEGORIAS_LEGALES = [
  "Laboral y Seguridad Social",
  "Seguridad y Salud en el Trabajo",
  "Ambiental",
  "Sanitario / Salud Pública",
  "Tributario y Fiscal",
  "Comercial y Societario",
  "Protección de Datos Personales",
  "Propiedad Intelectual",
  "Técnico / Calidad del Producto",
  "Metrología y Normas Técnicas",
  "Aduanero y Comercio Exterior",
  "Contratación Pública",
  "Otro",
] as const;

export const AMBITOS_LEGALES = ["Internacional", "Nacional", "Departamental / Regional", "Municipal / Local", "Sectorial / Gremial"] as const;

export const TIPOS_NORMA = [
  "Ley",
  "Decreto",
  "Resolución",
  "Norma técnica (NTC/ISO/etc.)",
  "Circular",
  "Acuerdo",
  "Ordenanza",
  "Reglamento",
  "Convenio / Tratado",
  "Otro",
] as const;

export const PERIODICIDADES_VERIFICACION = ["Mensual", "Trimestral", "Semestral", "Anual", "Según cambios normativos"] as const;

export type RequisitoLegal = {
  id: string;
  numero: number;

  categoria: string;
  ambito: string;
  tipoNorma: string;
  norma: string; // nombre/número de la norma, ej: "Ley 1581 de 2012"
  entidadEmisora: string;
  fechaExpedicion: string;

  articuloRequisito: string; // artículo(s) o numeral específico aplicable
  descripcionRequisito: string; // qué exige puntualmente

  procesoAplica: string; // proceso/área de la empresa al que aplica
  comoSeCumple: string; // evidencia / mecanismo de cumplimiento
  nivelCumplimiento: NivelCumplimiento;
  responsable: string;

  periodicidadVerificacion: string;
  fechaUltimaVerificacion: string;
  fechaProximaVerificacion: string;

  observaciones: string;
  fechaAlta: string;
};

export function requisitoVacio(numero: number): RequisitoLegal {
  return {
    id: crypto.randomUUID(),
    numero,
    categoria: "",
    ambito: "Nacional",
    tipoNorma: "",
    norma: "",
    entidadEmisora: "",
    fechaExpedicion: "",
    articuloRequisito: "",
    descripcionRequisito: "",
    procesoAplica: "",
    comoSeCumple: "",
    nivelCumplimiento: "En evaluación",
    responsable: "",
    periodicidadVerificacion: "Anual",
    fechaUltimaVerificacion: "",
    fechaProximaVerificacion: "",
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function parseRequisitosLegales(contenido: string): RequisitoLegal[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: RequisitoLegal, i: number) => ({ ...requisitoVacio(i + 1), ...r }));
  } catch {
    return [];
  }
}

export function renumerar(requisitos: RequisitoLegal[]): RequisitoLegal[] {
  return requisitos.map((r, i) => ({ ...r, numero: i + 1 }));
}

export function resumenPorNivel(requisitos: RequisitoLegal[]): { nivel: string; cantidad: number; color: string }[] {
  return NIVELES_CUMPLIMIENTO.map((nivel) => ({
    nivel,
    cantidad: requisitos.filter((r) => r.nivelCumplimiento === nivel).length,
    color: colorNivelCumplimiento(nivel),
  })).filter((r) => r.cantidad > 0);
}

export function porcentajeCumplimiento(requisitos: RequisitoLegal[]): number {
  const aplicables = requisitos.filter((r) => r.nivelCumplimiento !== "No aplica");
  if (aplicables.length === 0) return 0;
  const cumplen = aplicables.filter((r) => r.nivelCumplimiento === "Cumple").length;
  return Math.round((cumplen / aplicables.length) * 100);
}

export function vencenEn30Dias(requisitos: RequisitoLegal[]): RequisitoLegal[] {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 30);
  return requisitos.filter((r) => {
    if (!r.fechaProximaVerificacion) return false;
    const fecha = new Date(r.fechaProximaVerificacion + "T00:00:00");
    return fecha >= hoy && fecha <= limite;
  });
}
