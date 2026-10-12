// Sistema de Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones (PQRSF).

export type EventoBitacora = {
  id: string;
  fecha: string; // fecha y hora ISO
  nota: string;
  autor: string;
};

export type CasoPQRSF = {
  id: string;
  radicado: string; // ej: "PQRSF-0001"
  tipo: string; // "Petición" | "Queja" | "Reclamo" | "Sugerencia" | "Felicitación"
  categoria: string;
  descripcion: string;
  canal: string;
  prioridad: string; // "Alta" | "Media" | "Baja"
  fecha: string; // fecha de recepción
  slaDias: number; // plazo de respuesta según tipo (0 = no aplica)
  responsable: string;
  estado: string; // "Recibido" | "En trámite" | "Escalado" | "Resuelto" | "Cerrado"
  bitacora: EventoBitacora[];
  resolucion: string;
  fechaCierre: string;
  satisfaccionResolucion: number; // 0 = sin calificar, 1 a 5
};

export const TIPOS_PQRSF: { tipo: string; letra: string; color: string; icono: string; slaDias: number; descripcion: string }[] = [
  { tipo: "Petición", letra: "P", color: "#3B82F6", icono: "📝", slaDias: 15, descripcion: "Solicitud de información, documentación o acción específica." },
  { tipo: "Queja", letra: "Q", color: "#F97316", icono: "⚠️", slaDias: 15, descripcion: "Manifestación de inconformidad con la atención o el servicio." },
  { tipo: "Reclamo", letra: "R", color: "#EF4444", icono: "❗", slaDias: 15, descripcion: "Exigencia de solución frente a un producto o servicio deficiente." },
  { tipo: "Sugerencia", letra: "S", color: "#8B5CF6", icono: "💡", slaDias: 30, descripcion: "Propuesta de mejora para procesos, productos o atención." },
  { tipo: "Felicitación", letra: "F", color: "#22C55E", icono: "🎉", slaDias: 0, descripcion: "Reconocimiento positivo a un producto, servicio o colaborador." },
];

export const CATEGORIAS_PQRSF = [
  "Calidad del producto o servicio",
  "Plazo de entrega",
  "Atención al cliente",
  "Precio o facturación",
  "Documentación / Contrato",
  "Otro",
];

export const CANALES_PQRSF = ["Presencial", "Telefónico", "Email", "WhatsApp", "Formulario web", "Otro"];

export const PRIORIDADES_PQRSF = ["Alta", "Media", "Baja"];

export const ESTADOS_PQRSF = ["Recibido", "En trámite", "Escalado", "Resuelto", "Cerrado"];

export function infoTipo(tipo: string) {
  return TIPOS_PQRSF.find((t) => t.tipo === tipo) ?? TIPOS_PQRSF[0];
}

export function colorTipo(tipo: string): string {
  return infoTipo(tipo).color;
}

export function colorPrioridad(prioridad: string): string {
  switch (prioridad) {
    case "Alta":
      return "#EF4444";
    case "Media":
      return "#F5A623";
    case "Baja":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function colorEstado(estado: string): string {
  switch (estado) {
    case "Recibido":
      return "#3B82F6";
    case "En trámite":
      return "#F5A623";
    case "Escalado":
      return "#EF4444";
    case "Resuelto":
      return "#84CC16";
    case "Cerrado":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function estaAbierto(estado: string): boolean {
  return estado !== "Resuelto" && estado !== "Cerrado";
}

// Correlativo global simple a partir del mayor radicado visto entre todos los casos ya cargados.
export function siguienteRadicado(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `PQRSF-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicado(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function eventoBitacoraVacio(nota: string, autor: string): EventoBitacora {
  return { id: crypto.randomUUID(), fecha: new Date().toISOString(), nota, autor };
}

export function casoVacio(radicado: string): CasoPQRSF {
  return {
    id: crypto.randomUUID(),
    radicado,
    tipo: "Petición",
    categoria: "",
    descripcion: "",
    canal: "Email",
    prioridad: "Media",
    fecha: new Date().toISOString().slice(0, 10),
    slaDias: infoTipo("Petición").slaDias,
    responsable: "",
    estado: "Recibido",
    bitacora: [],
    resolucion: "",
    fechaCierre: "",
    satisfaccionResolucion: 0,
  };
}

export function parseCasos(contenido: string): CasoPQRSF[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function diasEntre(desde: string, hasta: string): number | null {
  if (!desde || !hasta) return null;
  const a = new Date(desde + "T00:00:00").getTime();
  const b = new Date(hasta + "T00:00:00").getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

// Días transcurridos desde la recepción hasta hoy (o hasta el cierre, si ya cerró).
export function diasTranscurridos(c: CasoPQRSF): number {
  const hasta = c.fechaCierre || new Date().toISOString().slice(0, 10);
  return diasEntre(c.fecha, hasta) ?? 0;
}

export function diasRestantes(c: CasoPQRSF): number | null {
  if (!c.slaDias) return null;
  return c.slaDias - diasTranscurridos(c);
}

export function slaVencido(c: CasoPQRSF): boolean {
  const restantes = diasRestantes(c);
  if (restantes === null) return false;
  if (!estaAbierto(c.estado)) {
    // Si ya se cerró, se evalúa si el cierre fue dentro del plazo.
    const dias = diasEntre(c.fecha, c.fechaCierre);
    return dias !== null && dias > c.slaDias;
  }
  return restantes < 0;
}

export function estadoSLA(c: CasoPQRSF): "no_aplica" | "en_plazo" | "por_vencer" | "vencido" | "cumplido" {
  if (!c.slaDias) return "no_aplica";
  if (!estaAbierto(c.estado)) return slaVencido(c) ? "vencido" : "cumplido";
  const restantes = diasRestantes(c);
  if (restantes === null) return "no_aplica";
  if (restantes < 0) return "vencido";
  if (restantes <= 3) return "por_vencer";
  return "en_plazo";
}

export function colorEstadoSLA(estado: string): string {
  switch (estado) {
    case "vencido":
      return "#EF4444";
    case "por_vencer":
      return "#F5A623";
    case "en_plazo":
      return "#3B82F6";
    case "cumplido":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function etiquetaEstadoSLA(estado: string): string {
  switch (estado) {
    case "vencido":
      return "SLA vencido";
    case "por_vencer":
      return "Por vencer";
    case "en_plazo":
      return "En plazo";
    case "cumplido":
      return "Cumplido";
    default:
      return "Sin SLA";
  }
}

// % de casos cerrados/resueltos dentro del plazo, sobre el total de casos con SLA aplicable que ya tienen fecha de cierre.
export function cumplimientoSLA(casos: CasoPQRSF[]): number | null {
  const evaluables = casos.filter((c) => c.slaDias > 0 && !estaAbierto(c.estado) && c.fechaCierre);
  if (evaluables.length === 0) return null;
  const cumplidos = evaluables.filter((c) => !slaVencido(c)).length;
  return Math.round((cumplidos / evaluables.length) * 100);
}

export function tiempoPromedioResolucion(casos: CasoPQRSF[]): number | null {
  const cerrados = casos.filter((c) => !estaAbierto(c.estado) && c.fechaCierre);
  if (cerrados.length === 0) return null;
  const total = cerrados.reduce((acc, c) => acc + (diasEntre(c.fecha, c.fechaCierre) ?? 0), 0);
  return Math.round((total / cerrados.length) * 10) / 10;
}
