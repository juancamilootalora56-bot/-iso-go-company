// Gestión de Lecciones Aprendidas — ISO 9001:2015, cláusula 7.1.6 (Conocimientos de la
// organización) y apoyo a la mejora continua (10.3): captura y difusión del conocimiento
// generado por la experiencia, para prevenir errores recurrentes y replicar aciertos.

export type EventoLA = {
  id: string;
  fecha: string; // fecha y hora ISO
  nota: string;
  autor: string;
};

export type LeccionAprendida = {
  id: string;
  radicado: string; // ej: "LA-0001"

  titulo: string;
  tipo: string; // ver TIPOS_LA
  categoria: string; // ver CATEGORIAS_LA
  fuente: string; // ver FUENTES_LA
  procesoArea: string;
  fecha: string;
  registradoPor: string;

  contexto: string; // qué pasó, cuándo, en qué circunstancias
  causaRaiz: string;
  leccion: string; // el aprendizaje en sí, redactado como conocimiento reutilizable
  recomendaciones: string;
  aplicabilidad: string; // a qué procesos, áreas o proyectos futuros aplica

  estadoDifusion: string; // ver ESTADOS_DIFUSION_LA
  evidencia: string | null; // data URL
  evidenciaNombre: string;

  bitacora: EventoLA[];
  observaciones: string;
};

export const TIPOS_LA = ["Éxito a replicar", "Error a evitar", "Riesgo materializado", "Hallazgo técnico"];

export const CATEGORIAS_LA = ["Personas", "Proceso", "Tecnología", "Comunicación", "Proveedores", "Cliente", "Otro"];

export const FUENTES_LA = [
  "Cierre de proyecto",
  "No conformidad",
  "Auditoría",
  "Reunión de equipo",
  "Incidente / falla",
  "Revisión por la dirección",
  "Retroalimentación del cliente",
  "Otro",
];

export const ESTADOS_DIFUSION_LA = [
  "Registrada",
  "Compartida con el equipo",
  "Incorporada a procedimiento",
  "Incorporada a capacitación",
];

export function colorTipoLA(tipo: string): string {
  switch (tipo) {
    case "Éxito a replicar":
      return "#22C55E";
    case "Error a evitar":
      return "#EF4444";
    case "Riesgo materializado":
      return "#F5A623";
    case "Hallazgo técnico":
      return "#3B82F6";
    default:
      return "#9CA3AF";
  }
}

export function iconoTipoLA(tipo: string): string {
  switch (tipo) {
    case "Éxito a replicar":
      return "✅";
    case "Error a evitar":
      return "⚠️";
    case "Riesgo materializado":
      return "🔥";
    case "Hallazgo técnico":
      return "🔎";
    default:
      return "📄";
  }
}

export function colorEstadoDifusionLA(estado: string): string {
  switch (estado) {
    case "Registrada":
      return "#9CA3AF";
    case "Compartida con el equipo":
      return "#3B82F6";
    case "Incorporada a procedimiento":
      return "#8B5CF6";
    case "Incorporada a capacitación":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function siguienteRadicadoLA(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `LA-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicadoLA(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function eventoLAVacio(nota: string, autor: string): EventoLA {
  return { id: crypto.randomUUID(), fecha: new Date().toISOString(), nota, autor };
}

export function leccionAprendidaVacia(radicado: string): LeccionAprendida {
  return {
    id: crypto.randomUUID(),
    radicado,
    titulo: "",
    tipo: "Éxito a replicar",
    categoria: "Proceso",
    fuente: "Cierre de proyecto",
    procesoArea: "",
    fecha: new Date().toISOString().slice(0, 10),
    registradoPor: "",
    contexto: "",
    causaRaiz: "",
    leccion: "",
    recomendaciones: "",
    aplicabilidad: "",
    estadoDifusion: "Registrada",
    evidencia: null,
    evidenciaNombre: "",
    bitacora: [],
    observaciones: "",
  };
}

export function parseLeccionesAprendidas(contenido: string): LeccionAprendida[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((l: LeccionAprendida) => ({
      ...l,
      bitacora: l.bitacora ?? [],
      evidencia: l.evidencia ?? null,
      evidenciaNombre: l.evidenciaNombre ?? "",
    }));
  } catch {
    return [];
  }
}

export function resumenPorTipoLA(lecciones: LeccionAprendida[]): { tipo: string; cantidad: number; color: string }[] {
  return TIPOS_LA.map((tipo) => ({
    tipo,
    cantidad: lecciones.filter((l) => l.tipo === tipo).length,
    color: colorTipoLA(tipo),
  })).filter((r) => r.cantidad > 0);
}

export function resumenPorCategoriaLA(lecciones: LeccionAprendida[]): { categoria: string; cantidad: number }[] {
  return CATEGORIAS_LA.map((categoria) => ({
    categoria,
    cantidad: lecciones.filter((l) => l.categoria === categoria).length,
  })).filter((r) => r.cantidad > 0);
}

export function resumenPorEstadoDifusionLA(lecciones: LeccionAprendida[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_DIFUSION_LA.map((estado) => ({
    estado,
    cantidad: lecciones.filter((l) => l.estadoDifusion === estado).length,
    color: colorEstadoDifusionLA(estado),
  })).filter((r) => r.cantidad > 0);
}

export function tasaIncorporacionLA(lecciones: LeccionAprendida[]): number | null {
  if (lecciones.length === 0) return null;
  const incorporadas = lecciones.filter(
    (l) => l.estadoDifusion === "Incorporada a procedimiento" || l.estadoDifusion === "Incorporada a capacitación"
  ).length;
  return Math.round((incorporadas / lecciones.length) * 100);
}
