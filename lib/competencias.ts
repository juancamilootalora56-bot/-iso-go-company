// Matriz de Competencias — ISO 9001:2015, cláusula 7.2 (Competencia).
// Compara el nivel requerido vs. el nivel actual de cada competencia por cargo/colaborador
// y calcula automáticamente la brecha — en vez de pedir que la carguen a mano.

export const NIVELES_COMPETENCIA = ["Básico", "Intermedio", "Avanzado", "Experto"] as const;
export type NivelCompetencia = (typeof NIVELES_COMPETENCIA)[number];

export const NIVELES_ACTUAL = [...NIVELES_COMPETENCIA, "No evaluado"] as const;
export type NivelActual = (typeof NIVELES_ACTUAL)[number];

function rangoNivel(nivel: string): number {
  const idx = NIVELES_COMPETENCIA.indexOf(nivel as NivelCompetencia);
  return idx === -1 ? 0 : idx + 1; // 1..4
}

export const TIPOS_COMPETENCIA = ["Educación", "Formación / Certificación", "Experiencia", "Habilidad técnica", "Habilidad blanda"] as const;

export type EstadoBrecha = "Cumple" | "Brecha leve" | "Brecha crítica" | "Pendiente evaluar";

export function calcularBrecha(nivelRequerido: string, nivelActual: string): EstadoBrecha {
  if (!nivelActual || nivelActual === "No evaluado") return "Pendiente evaluar";
  const requerido = rangoNivel(nivelRequerido);
  const actual = rangoNivel(nivelActual);
  const diferencia = requerido - actual;
  if (diferencia <= 0) return "Cumple";
  if (diferencia === 1) return "Brecha leve";
  return "Brecha crítica";
}

export function colorBrecha(estado: EstadoBrecha): string {
  switch (estado) {
    case "Cumple":
      return "#22C55E";
    case "Brecha leve":
      return "#F5A623";
    case "Brecha crítica":
      return "#EF4444";
    case "Pendiente evaluar":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export type CompetenciaItem = {
  id: string;
  numero: number;

  cargo: string;
  colaborador: string;

  tipoCompetencia: string;
  competencia: string; // nombre puntual del requisito, ej: "Manejo de Excel avanzado"
  nivelRequerido: NivelCompetencia;
  nivelActual: NivelActual;

  evidencia: string; // diploma, certificado, observación, prueba práctica...
  accionCierre: string; // plan para cerrar la brecha, si la hay
  responsableSeguimiento: string;

  fechaEvaluacion: string;
  fechaProximaEvaluacion: string;
  observaciones: string;
  fechaAlta: string;
};

export function competenciaVacia(numero: number): CompetenciaItem {
  return {
    id: crypto.randomUUID(),
    numero,
    cargo: "",
    colaborador: "",
    tipoCompetencia: "",
    competencia: "",
    nivelRequerido: "Intermedio",
    nivelActual: "No evaluado",
    evidencia: "",
    accionCierre: "",
    responsableSeguimiento: "",
    fechaEvaluacion: new Date().toISOString().slice(0, 10),
    fechaProximaEvaluacion: "",
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function parseCompetencias(contenido: string): CompetenciaItem[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: CompetenciaItem, i: number) => ({ ...competenciaVacia(i + 1), ...c }));
  } catch {
    return [];
  }
}

export function renumerar(items: CompetenciaItem[]): CompetenciaItem[] {
  return items.map((c, i) => ({ ...c, numero: i + 1 }));
}

export function resumenPorBrecha(items: CompetenciaItem[]): { estado: EstadoBrecha; cantidad: number; color: string }[] {
  const estados: EstadoBrecha[] = ["Cumple", "Brecha leve", "Brecha crítica", "Pendiente evaluar"];
  return estados
    .map((estado) => ({
      estado,
      cantidad: items.filter((c) => calcularBrecha(c.nivelRequerido, c.nivelActual) === estado).length,
      color: colorBrecha(estado),
    }))
    .filter((r) => r.cantidad > 0);
}

export function porcentajeCobertura(items: CompetenciaItem[]): number {
  const evaluadas = items.filter((c) => c.nivelActual !== "No evaluado");
  if (evaluadas.length === 0) return 0;
  const cumplen = evaluadas.filter((c) => calcularBrecha(c.nivelRequerido, c.nivelActual) === "Cumple").length;
  return Math.round((cumplen / evaluadas.length) * 100);
}

export function agruparPorColaborador(items: CompetenciaItem[]): { colaborador: string; cargo: string; items: CompetenciaItem[] }[] {
  const mapa = new Map<string, { colaborador: string; cargo: string; items: CompetenciaItem[] }>();
  items.forEach((c) => {
    const clave = c.colaborador || `__sin_colaborador__${c.cargo}`;
    if (!mapa.has(clave)) mapa.set(clave, { colaborador: c.colaborador || "Sin colaborador asignado", cargo: c.cargo, items: [] });
    mapa.get(clave)!.items.push(c);
  });
  return Array.from(mapa.values()).sort((a, b) => a.colaborador.localeCompare(b.colaborador));
}
