// Selección y Contratación de Personal — pipeline de reclutamiento tipo Kanban.
// Jerarquía: Vacante (el requerimiento) → Candidatos que avanzan por etapas hasta
// Contratado (o Descartado en cualquier punto). Al contratar, se puede dar de alta
// directo en Gestión del Personal sin volver a tipear los datos básicos.

import { TIPOS_CONTRATO, JORNADAS, empleadoVacio, type Empleado } from "./personal";

export { TIPOS_CONTRATO, JORNADAS };

// --- Vacante (Requerimiento) ---

export const MODALIDADES_TRABAJO = ["Presencial", "Remoto", "Híbrido"];
export const MOTIVOS_VACANTE = ["Nueva posición", "Reemplazo", "Expansión del equipo", "Proyecto temporal", "Otro"];
export const ESTADOS_VACANTE = ["Abierta", "En pausa", "Cerrada", "Cancelada"];

export function colorEstadoVacante(estado: string): string {
  switch (estado) {
    case "Abierta":
      return "#3B82F6";
    case "En pausa":
      return "#F5A623";
    case "Cerrada":
      return "#22C55E";
    case "Cancelada":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export type Vacante = {
  id: string;
  codigo: string; // VAC-0001
  cargo: string;
  area: string;
  tipoContrato: string;
  jornada: string;
  modalidad: string;
  numeroVacantes: number;
  salario: string;
  motivo: string;
  perfilRequerido: string;
  responsableSolicitante: string;
  fechaSolicitud: string;
  fechaLimite: string;
  estado: string;
  observaciones: string;
  fechaAlta: string;
};

export function vacanteVacia(codigo: string): Vacante {
  return {
    id: crypto.randomUUID(),
    codigo,
    cargo: "",
    area: "",
    tipoContrato: TIPOS_CONTRATO[0],
    jornada: JORNADAS[0],
    modalidad: "Presencial",
    numeroVacantes: 1,
    salario: "",
    motivo: "Nueva posición",
    perfilRequerido: "",
    responsableSolicitante: "",
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    fechaLimite: "",
    estado: "Abierta",
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function parseVacantes(contenido: string): Vacante[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v: Vacante) => ({ ...vacanteVacia(v.codigo ?? ""), ...v }));
  } catch {
    return [];
  }
}

export function siguienteCodigo(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `VAC-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeCodigo(codigo: string): number {
  const m = codigo.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

// --- Candidato (tarjeta del pipeline) ---

export type EtapaCandidato = "Búsqueda" | "Entrevista" | "Test de Habilidades" | "Selección" | "Contratado" | "Descartado";

export const ETAPAS_PIPELINE: EtapaCandidato[] = ["Búsqueda", "Entrevista", "Test de Habilidades", "Selección", "Contratado"];

export const ICONO_ETAPA: Record<string, string> = {
  "Búsqueda": "🔍",
  "Entrevista": "🗣️",
  "Test de Habilidades": "🧪",
  "Selección": "⚖️",
  "Contratado": "✅",
  "Descartado": "✕",
};

export function colorEtapa(etapa: string): string {
  switch (etapa) {
    case "Búsqueda":
      return "#3B82F6";
    case "Entrevista":
      return "#7C4DFF";
    case "Test de Habilidades":
      return "#F5A623";
    case "Selección":
      return "#14B8A6";
    case "Contratado":
      return "#22C55E";
    case "Descartado":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export const FUENTES_CANDIDATO = [
  "LinkedIn",
  "Referido interno",
  "Portal de empleo",
  "Redes sociales",
  "Base de datos propia",
  "Universidad / Bolsa de empleo",
  "Otro",
];

export type EventoCandidato = {
  id: string;
  fecha: string;
  nota: string;
  autor: string;
  etapaDesde: string;
  etapaHasta: string;
};

export type Candidato = {
  id: string;
  vacanteId: string;
  empleadoId: string | null; // ficha en Gestión de Personal, creada al llegar a Entrevista
  nombre: string;
  email: string;
  telefono: string;
  foto: string | null;
  cv: string | null; // data URL
  cvNombre: string;
  fuente: string;
  fechaPostulacion: string;
  etapa: EtapaCandidato;
  calificacion: number; // 0-5
  notasEntrevista: string;
  notasTest: string;
  puntajeTest: number; // 0-100
  motivoDescarte: string;
  fechaUltimoCambio: string;
  bitacora: EventoCandidato[];
  observaciones: string;
};

export function candidatoVacio(vacanteId: string): Candidato {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    vacanteId,
    empleadoId: null,
    nombre: "",
    email: "",
    telefono: "",
    foto: null,
    cv: null,
    cvNombre: "",
    fuente: "",
    fechaPostulacion: hoy,
    etapa: "Búsqueda",
    calificacion: 0,
    notasEntrevista: "",
    notasTest: "",
    puntajeTest: 0,
    motivoDescarte: "",
    fechaUltimoCambio: hoy,
    bitacora: [{ id: crypto.randomUUID(), fecha: hoy, nota: "Candidato agregado al pipeline", autor: "", etapaDesde: "", etapaHasta: "Búsqueda" }],
    observaciones: "",
  };
}

export function parseCandidatos(contenido: string): Candidato[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: Candidato) => ({ ...candidatoVacio(c.vacanteId ?? ""), ...c, bitacora: c.bitacora ?? [] }));
  } catch {
    return [];
  }
}

export function moverEtapa(candidato: Candidato, nuevaEtapa: EtapaCandidato, nota = "", autor = ""): Candidato {
  const hoy = new Date().toISOString().slice(0, 10);
  const evento: EventoCandidato = {
    id: crypto.randomUUID(),
    fecha: hoy,
    nota: nota || `Pasó de "${candidato.etapa}" a "${nuevaEtapa}"`,
    autor,
    etapaDesde: candidato.etapa,
    etapaHasta: nuevaEtapa,
  };
  return { ...candidato, etapa: nuevaEtapa, fechaUltimoCambio: hoy, bitacora: [...candidato.bitacora, evento] };
}

// Crea (o reutiliza si ya existe) la ficha del candidato en Gestión de Personal,
// con los datos básicos ya cargados desde el candidato y el cargo de la vacante.
// Se usa al llegar a "Entrevista" para poder abrir el formulario real de entrevista,
// y se reutiliza (no se duplica) al contratar.
export function asegurarEmpleado(
  candidato: Candidato,
  vacante: Vacante,
  personalExistente: Empleado[]
): { empleadoId: string; personalActualizado: Empleado[] } {
  if (candidato.empleadoId) {
    const existe = personalExistente.some((e) => e.id === candidato.empleadoId);
    if (existe) return { empleadoId: candidato.empleadoId, personalActualizado: personalExistente };
  }
  const partes = candidato.nombre.trim().split(" ");
  const nuevoEmpleado: Empleado = {
    ...empleadoVacio(),
    nombre: partes[0] ?? candidato.nombre,
    apellido: partes.slice(1).join(" "),
    email: candidato.email,
    telefono: candidato.telefono,
    foto: candidato.foto,
    cargo: vacante.cargo,
    area: vacante.area,
    tipoContrato: vacante.tipoContrato,
    jornada: vacante.jornada,
  };
  return { empleadoId: nuevoEmpleado.id, personalActualizado: [...personalExistente, nuevoEmpleado] };
}

export function diasEnEtapa(candidato: Candidato): number {
  const desde = new Date(candidato.fechaUltimoCambio + "T00:00:00").getTime();
  const hoy = Date.now();
  return Math.max(0, Math.round((hoy - desde) / (1000 * 60 * 60 * 24)));
}

export function resumenPorEtapa(candidatos: Candidato[]): { etapa: string; cantidad: number; color: string }[] {
  return ETAPAS_PIPELINE.map((etapa) => ({
    etapa,
    cantidad: candidatos.filter((c) => c.etapa === etapa).length,
    color: colorEtapa(etapa),
  }));
}

export function tasaConversion(candidatos: Candidato[]): number {
  const total = candidatos.length;
  if (total === 0) return 0;
  const contratados = candidatos.filter((c) => c.etapa === "Contratado").length;
  return Math.round((contratados / total) * 100);
}

export function tiempoPromedioContratacion(candidatos: Candidato[]): number | null {
  const contratados = candidatos.filter((c) => c.etapa === "Contratado");
  if (contratados.length === 0) return null;
  const dias = contratados.map((c) => {
    const inicio = new Date(c.fechaPostulacion + "T00:00:00").getTime();
    const fin = new Date(c.fechaUltimoCambio + "T00:00:00").getTime();
    return Math.max(0, Math.round((fin - inicio) / (1000 * 60 * 60 * 24)));
  });
  return Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
}
