// Cronograma General del Sistema — diagrama de Gantt a 6 meses con todas las actividades
// del sistema de gestión, agrupadas por módulo. Cada tarea se puede pintar en el calendario
// de dos formas (compatibles entre sí): escribiendo fecha de inicio/fin (se pinta sola la
// semana que corresponda) o haciendo clic directo sobre los días del calendario.

export type TareaCronograma = {
  id: string;
  moduloKey: string;
  numero: number; // numeración dentro del módulo ("Actividad N")
  titulo: string;
  responsable: string;
  fechaInicio: string;
  fechaFin: string;
  porcentaje: number;
  diasPintados: string[]; // fechas YYYY-MM-DD pintadas en el gantt (fuente de verdad visual)
  observaciones: string;
};

export type CronogramaData = {
  titulo: string;
  responsableGeneral: string;
  fechaInicioCronograma: string; // primer lunes del cronograma de 6 meses
  tareas: TareaCronograma[];
};

export const MODULOS_SISTEMA: { key: string; label: string; color: string; tareas: string[] }[] = [
  {
    key: "gerencia",
    label: "Gestión de la Gerencia",
    color: "#6366F1",
    tareas: [
      "Compromiso por la Dirección",
      "FODA",
      "Matriz del Cliente y Partes Interesadas",
      "Matriz de Productos Estrella",
      "Mapa de Procesos",
      "Matriz de la Gestión de Riesgos",
      "Misión",
      "Visión",
      "Valores Organizacionales",
      "Política de Calidad",
      "Alcance del Sistema",
      "Objetivos de Calidad",
      "Estructura Organizacional",
    ],
  },
  {
    key: "talento_humano",
    label: "Gestión del Talento Humano",
    color: "#EC4899",
    tareas: ["Alta de Personal", "Gestión de Personal (hojas de vida)", "Capacitaciones Generales", "Evaluaciones Generales"],
  },
  {
    key: "compras",
    label: "Gestión de Compras",
    color: "#10B981",
    tareas: ["Inscripción de Proveedores", "Lista Maestra de Proveedores", "Evaluación de Proveedores", "Órdenes de Compra"],
  },
  {
    key: "comercial",
    label: "Gestión Comercial",
    color: "#3B82F6",
    tareas: ["Inscripción de Clientes", "Lista Maestra de Clientes", "PQRSF", "Satisfacción de Clientes", "Seguimiento de Ventas"],
  },
  {
    key: "operativa",
    label: "Gestión Operativa",
    color: "#8B5CF6",
    tareas: [
      "Alta de Productos",
      "Alta de Servicios",
      "Inventario de Máquinas y Equipos",
      "Programa de Mantenimiento",
      "No Conformidades",
      "Relación de Actividades",
    ],
  },
  {
    key: "diseno_desarrollo",
    label: "Gestión de Diseño y Desarrollo",
    color: "#14B8A6",
    tareas: ["Inscripción de Proyectos", "Planes de Calidad", "Control de Cambios", "Indicadores de Diseño"],
  },
  {
    key: "calidad",
    label: "Gestión de Calidad",
    color: "#F97316",
    tareas: [
      "Gestión de Procedimientos",
      "Oportunidades de Mejora",
      "Lecciones Aprendidas",
      "Matriz de Requisitos Legales",
      "Matriz de Comunicaciones",
      "Matriz de Competencias",
      "Caracterizaciones de Procesos",
      "Control de Documentos",
    ],
  },
];

export function colorDeModulo(moduloKey: string): string {
  return MODULOS_SISTEMA.find((m) => m.key === moduloKey)?.color ?? "#9CA3AF";
}

export function labelDeModulo(moduloKey: string): string {
  return MODULOS_SISTEMA.find((m) => m.key === moduloKey)?.label ?? moduloKey;
}

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(fecha + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function lunesDeEstaSemana(fecha: string): string {
  const d = new Date(fecha + "T00:00:00");
  const diaSemana = d.getDay(); // 0=domingo
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Lista de días laborables (lunes a viernes) entre dos fechas, ambas inclusive.
export function diasLaborablesEnRango(fechaInicio: string, fechaFin: string): string[] {
  if (!fechaInicio || !fechaFin) return [];
  const dias: string[] = [];
  let actual = new Date(fechaInicio + "T00:00:00");
  const fin = new Date(fechaFin + "T00:00:00");
  if (actual > fin) return [];
  while (actual <= fin) {
    const diaSemana = actual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(actual.toISOString().slice(0, 10));
    }
    actual.setDate(actual.getDate() + 1);
  }
  return dias;
}

export function duracionDias(fechaInicio: string, fechaFin: string): number {
  if (!fechaInicio || !fechaFin) return 0;
  const a = new Date(fechaInicio + "T00:00:00").getTime();
  const b = new Date(fechaFin + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}

export function tareaVacia(moduloKey: string, numero: number, titulo = ""): TareaCronograma {
  return {
    id: crypto.randomUUID(),
    moduloKey,
    numero,
    titulo,
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
    porcentaje: 0,
    diasPintados: [],
    observaciones: "",
  };
}

// Genera automáticamente todas las tareas reales del sistema, distribuidas en bloques
// escalonados de 6 semanas por módulo (con solape de 3 semanas entre módulos consecutivos)
// a lo largo de un cronograma de 6 meses, a partir de una fecha de inicio.
export function generarTareasIniciales(fechaInicioCronograma: string): TareaCronograma[] {
  const tareas: TareaCronograma[] = [];
  MODULOS_SISTEMA.forEach((modulo, idxModulo) => {
    const inicioBloque = sumarDias(fechaInicioCronograma, idxModulo * 21);
    const finBloque = sumarDias(inicioBloque, 41);
    modulo.tareas.forEach((titulo, idxTarea) => {
      tareas.push({
        id: crypto.randomUUID(),
        moduloKey: modulo.key,
        numero: idxTarea + 1,
        titulo,
        responsable: "",
        fechaInicio: inicioBloque,
        fechaFin: finBloque,
        porcentaje: 0,
        diasPintados: diasLaborablesEnRango(inicioBloque, finBloque),
        observaciones: "",
      });
    });
  });
  return tareas;
}

export function cronogramaVacio(): CronogramaData {
  const inicio = lunesDeEstaSemana(new Date().toISOString().slice(0, 10));
  return {
    titulo: "Cronograma General del Sistema de Gestión",
    responsableGeneral: "",
    fechaInicioCronograma: inicio,
    tareas: generarTareasIniciales(inicio),
  };
}

export function parseCronograma(contenido: string): CronogramaData {
  if (!contenido) return cronogramaVacio();
  try {
    const parsed = JSON.parse(contenido);
    if (!parsed || typeof parsed !== "object") return cronogramaVacio();
    return {
      titulo: parsed.titulo ?? "Cronograma General del Sistema de Gestión",
      responsableGeneral: parsed.responsableGeneral ?? "",
      fechaInicioCronograma: parsed.fechaInicioCronograma ?? lunesDeEstaSemana(new Date().toISOString().slice(0, 10)),
      tareas: Array.isArray(parsed.tareas) ? parsed.tareas.map((t: TareaCronograma) => ({ ...tareaVacia(t.moduloKey ?? "", t.numero ?? 1), ...t })) : [],
    };
  } catch {
    return cronogramaVacio();
  }
}

// --- Calendario: 6 meses de semanas laborables (L-V), agrupadas por mes y numeradas por semana dentro del mes ---

export type DiaCalendario = { fecha: string; letra: string };
export type SemanaCalendario = { numero: number; dias: DiaCalendario[] };
export type MesCalendario = { nombre: string; semanas: SemanaCalendario[] };

const LETRAS_DIA = ["L", "M", "X", "J", "V"];

export function generarCalendario(fechaInicioCronograma: string, meses = 6): MesCalendario[] {
  const inicio = new Date(lunesDeEstaSemana(fechaInicioCronograma) + "T00:00:00");
  const fin = new Date(inicio);
  fin.setMonth(fin.getMonth() + meses);

  const mesesMap = new Map<string, MesCalendario>();
  const contadorSemanaPorMes = new Map<string, number>();

  const cursor = new Date(inicio);
  while (cursor < fin) {
    const dias: DiaCalendario[] = [];
    for (let i = 0; i < 5; i++) {
      dias.push({ fecha: cursor.toISOString().slice(0, 10), letra: LETRAS_DIA[i] });
      cursor.setDate(cursor.getDate() + 1);
    }
    cursor.setDate(cursor.getDate() + 2); // saltar fin de semana

    const nombreMes = new Date(dias[0].fecha + "T00:00:00").toLocaleDateString("es", { month: "long", year: "numeric" });
    if (!mesesMap.has(nombreMes)) {
      mesesMap.set(nombreMes, { nombre: nombreMes.toUpperCase(), semanas: [] });
      contadorSemanaPorMes.set(nombreMes, 0);
    }
    const n = (contadorSemanaPorMes.get(nombreMes) ?? 0) + 1;
    contadorSemanaPorMes.set(nombreMes, n);
    mesesMap.get(nombreMes)!.semanas.push({ numero: n, dias });
  }

  return Array.from(mesesMap.values());
}

export function resumenGeneral(tareas: TareaCronograma[]): { total: number; promedioAvance: number; modulosConTareas: number } {
  const total = tareas.length;
  const promedioAvance = total === 0 ? 0 : Math.round(tareas.reduce((sum, t) => sum + t.porcentaje, 0) / total);
  const modulosConTareas = new Set(tareas.map((t) => t.moduloKey)).size;
  return { total, promedioAvance, modulosConTareas };
}
