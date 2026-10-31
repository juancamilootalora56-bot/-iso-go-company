// Calendario de Colaboradores — un calendario mensual por colaborador,
// guardado con el mismo patrón que Relación de Actividades: un item_key por
// colaborador y mes dentro del módulo "talento_humano".

export type EventoCalendario = {
  id: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // "09:00"
  horaFin: string; // "10:00"
  titulo: string;
  tipo: string;
  descripcion: string;
};

export const TIPOS_EVENTO = [
  "Reunión",
  "Tarea",
  "Capacitación",
  "Viaje / Visita",
  "Vacaciones / Permiso",
  "Otro",
];

export function colorTipoEvento(tipo: string): string {
  switch (tipo) {
    case "Reunión":
      return "#4F46E5";
    case "Tarea":
      return "#F5A623";
    case "Capacitación":
      return "#0EA5A4";
    case "Viaje / Visita":
      return "#3B82F6";
    case "Vacaciones / Permiso":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function eventoVacio(fecha: string): EventoCalendario {
  return {
    id: crypto.randomUUID(),
    fecha,
    horaInicio: "09:00",
    horaFin: "10:00",
    titulo: "",
    tipo: TIPOS_EVENTO[0],
    descripcion: "",
  };
}

export function parseEventos(contenido: string): EventoCalendario[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: EventoCalendario) => ({ ...eventoVacio(e.fecha ?? ""), ...e }));
  } catch {
    return [];
  }
}

export function itemKeyCalendario(empleadoId: string, mes: string): string {
  return `calendario_personal_${empleadoId}_${mes}`;
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

// Días del grid del mes (incluye los días del mes anterior/siguiente que
// completan la primera y última semana), empezando en lunes.
export function diasGrilla(mes: string): { fecha: string; enMes: boolean }[] {
  const [anio, m] = mes.split("-").map(Number);
  const primerDia = new Date(anio, m - 1, 1);
  const ultimoDia = new Date(anio, m, 0);

  // getDay(): 0=domingo..6=sábado -> lo convertimos a 0=lunes..6=domingo
  const offsetInicio = (primerDia.getDay() + 6) % 7;

  const dias: { fecha: string; enMes: boolean }[] = [];
  for (let i = 0; i < offsetInicio; i++) {
    const d = new Date(anio, m - 1, 1 - (offsetInicio - i));
    dias.push({ fecha: toISO(d), enMes: false });
  }
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    dias.push({ fecha: toISO(new Date(anio, m - 1, dia)), enMes: true });
  }
  while (dias.length % 7 !== 0) {
    const ultima = new Date(dias[dias.length - 1].fecha + "T00:00:00");
    dias.push({ fecha: toISO(new Date(ultima.getFullYear(), ultima.getMonth(), ultima.getDate() + 1)), enMes: false });
  }
  return dias;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
