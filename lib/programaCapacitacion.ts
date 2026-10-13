// Programa de Capacitación: formación sobre máquinas, equipos y herramientas de la empresa.

export type Capacitacion = {
  id: string;
  tema: string;
  tipo: string; // ver TIPOS_CAPACITACION
  equiposIds: string[]; // ids de lib/inventario.ts

  fechaProgramada: string;
  fechaRealizada: string;
  estado: string; // ver ESTADOS_CAPACITACION

  responsable: string; // quién organiza / dicta internamente
  proveedor: string; // capacitador / institución externa (opcional)

  duracionHoras: number;
  cantidadParticipantes: number;
  participantes: string; // nombres, opcional

  costo: number;
  moneda: string;

  resultado: string; // ver RESULTADOS_CAPACITACION
  certificado: string | null; // data URL (constancia / certificado)
  certificadoNombre: string;

  observaciones: string;
};

export const TIPOS_CAPACITACION = [
  "Seguridad y uso de equipo",
  "Operación de maquinaria",
  "Mantenimiento",
  "Calidad / Normativa",
  "Inducción",
  "Otro",
];

export const ESTADOS_CAPACITACION = ["Programada", "En curso", "Completada", "Cancelada"];

export const RESULTADOS_CAPACITACION = ["Pendiente", "Aprobado", "Aprobado con observaciones", "No aprobado"];

export const MONEDAS_CAPACITACION = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export function colorEstadoCapacitacion(estado: string): string {
  switch (estado) {
    case "Programada":
      return "#9CA3AF";
    case "En curso":
      return "#F5A623";
    case "Completada":
      return "#22C55E";
    case "Cancelada":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function colorResultadoCapacitacion(resultado: string): string {
  switch (resultado) {
    case "Aprobado":
      return "#22C55E";
    case "Aprobado con observaciones":
      return "#F5A623";
    case "No aprobado":
      return "#EF4444";
    case "Pendiente":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function capacitacionVacia(): Capacitacion {
  return {
    id: crypto.randomUUID(),
    tema: "",
    tipo: "Operación de maquinaria",
    equiposIds: [],
    fechaProgramada: new Date().toISOString().slice(0, 10),
    fechaRealizada: "",
    estado: "Programada",
    responsable: "",
    proveedor: "",
    duracionHoras: 0,
    cantidadParticipantes: 0,
    participantes: "",
    costo: 0,
    moneda: "Guaraníes (PYG)",
    resultado: "Pendiente",
    certificado: null,
    certificadoNombre: "",
    observaciones: "",
  };
}

export function parseCapacitaciones(contenido: string): Capacitacion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: Capacitacion) => ({ ...c, equiposIds: c.equiposIds ?? [] }));
  } catch {
    return [];
  }
}

export function formatoMonto(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

export function estaVencidaCapacitacion(c: Capacitacion): boolean {
  if (c.estado !== "Programada" && c.estado !== "En curso") return false;
  if (!c.fechaProgramada) return false;
  const hoy = new Date().setHours(0, 0, 0, 0);
  const programada = new Date(c.fechaProgramada + "T00:00:00").getTime();
  return programada < hoy;
}

export function costoTotalCapacitaciones(capacitaciones: Capacitacion[]): number {
  return capacitaciones.reduce((acc, c) => acc + (c.costo || 0), 0);
}

export function horasTotalesCapacitacion(capacitaciones: Capacitacion[]): number {
  return capacitaciones
    .filter((c) => c.estado === "Completada")
    .reduce((acc, c) => acc + (c.duracionHoras || 0), 0);
}

// % de capacitaciones completadas sobre el total de programadas que ya deberían haberse dictado.
export function cumplimientoPrograma(capacitaciones: Capacitacion[]): number | null {
  const evaluables = capacitaciones.filter((c) => c.estado === "Completada" || estaVencidaCapacitacion(c));
  if (evaluables.length === 0) return null;
  const completadas = evaluables.filter((c) => c.estado === "Completada").length;
  return Math.round((completadas / evaluables.length) * 100);
}
