// Relación de Actividades — bitácora diaria de cada colaborador, organizada por mes.
// Cada colaborador (Gestión del Talento Humano) tiene su propia planilla; cada día se
// genera una nueva jornada con franjas horarias, y los registros se acumulan mes a mes.

export type ActividadRelacion = {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // "08:00"
  proceso: string;
  prioridad: string;
  frecuencia: string;
  descripcion: string;
  cantidad: number;
  estado: string;
  duracionMinutos: number;
  observaciones: string;
};

export const PRIORIDADES_ACTIVIDAD = ["Alta", "Media", "Baja"];

export const FRECUENCIAS_ACTIVIDAD = ["Diaria", "Semanal", "Quincenal", "Mensual", "Eventual"];

export const ESTADOS_ACTIVIDAD = ["Sin empezar", "En progreso", "Completado", "Pausado", "Cancelado"];

export function colorEstadoActividad(estado: string): string {
  switch (estado) {
    case "Sin empezar":
      return "#EF4444";
    case "En progreso":
      return "#F5A623";
    case "Completado":
      return "#22C55E";
    case "Pausado":
      return "#3B82F6";
    case "Cancelado":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function actividadVacia(fecha: string, hora: string): ActividadRelacion {
  return {
    id: crypto.randomUUID(),
    fecha,
    hora,
    proceso: "",
    prioridad: "Media",
    frecuencia: "Diaria",
    descripcion: "",
    cantidad: 0,
    estado: "Sin empezar",
    duracionMinutos: 0,
    observaciones: "",
  };
}

export function parseActividades(contenido: string): ActividadRelacion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((a: ActividadRelacion) => ({ ...actividadVacia(a.fecha ?? "", a.hora ?? ""), ...a }));
  } catch {
    return [];
  }
}

export function itemKeyMes(colaboradorId: string, mes: string): string {
  return `relacion_actividades_${colaboradorId}_${mes}`;
}

export function mesActual(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function nombreMes(mes: string): string {
  try {
    const [anio, m] = mes.split("-").map(Number);
    return new Date(anio, m - 1, 1).toLocaleDateString("es", { month: "long", year: "numeric" });
  } catch {
    return mes;
  }
}

export function mesAnterior(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const d = new Date(anio, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesSiguiente(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const d = new Date(anio, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Genera las franjas horarias de una jornada (ej: 08:00 a 17:00 cada 15 min) para una fecha dada.
export function generarJornada(fecha: string, horaInicio: string, horaFin: string, intervaloMin: number): ActividadRelacion[] {
  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);
  const inicioMin = hIni * 60 + mIni;
  const finMin = hFin * 60 + mFin;

  const franjas: ActividadRelacion[] = [];
  for (let t = inicioMin; t < finMin; t += intervaloMin) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    franjas.push(actividadVacia(fecha, `${hh}:${mm}`));
  }
  return franjas;
}

export function formatoDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}:${String(mins).padStart(2, "0")}:00`;
}

export function diasDistintos(actividades: ActividadRelacion[]): string[] {
  return Array.from(new Set(actividades.map((a) => a.fecha))).sort();
}

export function resumenPorEstado(actividades: ActividadRelacion[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_ACTIVIDAD.map((estado) => ({
    estado,
    cantidad: actividades.filter((a) => a.estado === estado).length,
    color: colorEstadoActividad(estado),
  })).filter((r) => r.cantidad > 0);
}
