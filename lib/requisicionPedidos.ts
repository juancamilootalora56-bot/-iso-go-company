// Requisición de Pedidos — pipeline de compras tipo Kanban.
// Solicitud → Autorización → Cotización (1 o 3 según si el proveedor es conocido) →
// Selección (mejor cotización por precio/calidad/tiempo) → Compra (genera la Orden de Compra).

export type TipoRequisicion = "Producto" | "Servicio" | "Capacitación" | "Otro";
export const TIPOS_REQUISICION: TipoRequisicion[] = ["Producto", "Servicio", "Capacitación", "Otro"];

export const PRIORIDADES_REQUISICION = ["Alta", "Media", "Baja"];

export type EtapaRequisicion = "Solicitud" | "Autorización" | "Cotización" | "Selección" | "Compra" | "Rechazada";

export const ETAPAS_PIPELINE_COMPRAS: EtapaRequisicion[] = ["Solicitud", "Autorización", "Cotización", "Selección", "Compra"];

export const ICONO_ETAPA_REQ: Record<string, string> = {
  "Solicitud": "📝",
  "Autorización": "✅",
  "Cotización": "💬",
  "Selección": "⚖️",
  "Compra": "🛒",
  "Rechazada": "✕",
};

export function colorEtapaRequisicion(etapa: string): string {
  switch (etapa) {
    case "Solicitud":
      return "#3B82F6";
    case "Autorización":
      return "#7C4DFF";
    case "Cotización":
      return "#F5A623";
    case "Selección":
      return "#14B8A6";
    case "Compra":
      return "#22C55E";
    case "Rechazada":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
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

// --- Cotización individual dentro de una requisición ---

export type Cotizacion = {
  id: string;
  proveedorId: string | null; // vinculada a la lista maestra, si existe
  proveedorNombre: string; // texto libre si es un proveedor nuevo sin registrar
  precio: number;
  moneda: string;
  plazoEntrega: string;
  condicionesPago: string;
  calidadObservada: string;
  archivo: string | null;
  archivoNombre: string;
  fecha: string;
};

export const MONEDAS_COTIZACION = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export function cotizacionVacia(): Cotizacion {
  return {
    id: crypto.randomUUID(),
    proveedorId: null,
    proveedorNombre: "",
    precio: 0,
    moneda: "Guaraníes (PYG)",
    plazoEntrega: "",
    condicionesPago: "",
    calidadObservada: "",
    archivo: null,
    archivoNombre: "",
    fecha: new Date().toISOString().slice(0, 10),
  };
}

// --- Bitácora ---

export type EventoRequisicion = {
  id: string;
  fecha: string;
  nota: string;
  etapaDesde: string;
  etapaHasta: string;
};

// --- Requisición (tarjeta del pipeline) ---

export type Requisicion = {
  id: string;
  codigo: string; // REQ-0001

  // 1. Solicitud
  tipo: TipoRequisicion;
  descripcion: string;
  cantidad: number;
  unidad: string;
  area: string;
  solicitante: string;
  fechaSolicitud: string;
  fechaNecesaria: string;
  prioridad: string;
  justificacion: string;

  // 2. Autorización
  aprobador: string;
  fechaAprobacion: string;
  comentarioAprobacion: string;
  motivoRechazo: string;

  // 3. Cotización
  proveedorConocido: boolean; // false = producto/servicio nuevo → exige 3 cotizaciones
  cotizaciones: Cotizacion[];

  // 4. Selección
  cotizacionGanadoraId: string | null;
  criterioSeleccion: string;

  // 5. Compra
  ordenCompraId: string | null;

  etapa: EtapaRequisicion;
  bitacora: EventoRequisicion[];
  observaciones: string;
  fechaAlta: string;
};

export function requisicionVacia(codigo: string): Requisicion {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    codigo,
    tipo: "Producto",
    descripcion: "",
    cantidad: 1,
    unidad: "unidad",
    area: "",
    solicitante: "",
    fechaSolicitud: hoy,
    fechaNecesaria: "",
    prioridad: "Media",
    justificacion: "",
    aprobador: "",
    fechaAprobacion: "",
    comentarioAprobacion: "",
    motivoRechazo: "",
    proveedorConocido: true,
    cotizaciones: [],
    cotizacionGanadoraId: null,
    criterioSeleccion: "",
    ordenCompraId: null,
    etapa: "Solicitud",
    bitacora: [{ id: crypto.randomUUID(), fecha: hoy, nota: "Requisición creada", etapaDesde: "", etapaHasta: "Solicitud" }],
    observaciones: "",
    fechaAlta: hoy,
  };
}

export function parseRequisiciones(contenido: string): Requisicion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: Requisicion) => ({ ...requisicionVacia(r.codigo ?? ""), ...r, cotizaciones: r.cotizaciones ?? [], bitacora: r.bitacora ?? [] }));
  } catch {
    return [];
  }
}

export function siguienteCodigo(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `REQ-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeCodigo(codigo: string): number {
  const m = codigo.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function moverEtapaRequisicion(req: Requisicion, nuevaEtapa: EtapaRequisicion, nota = ""): Requisicion {
  const hoy = new Date().toISOString().slice(0, 10);
  const evento: EventoRequisicion = {
    id: crypto.randomUUID(),
    fecha: hoy,
    nota: nota || `Pasó de "${req.etapa}" a "${nuevaEtapa}"`,
    etapaDesde: req.etapa,
    etapaHasta: nuevaEtapa,
  };
  return { ...req, etapa: nuevaEtapa, bitacora: [...req.bitacora, evento] };
}

export function cotizacionesMinimasRequeridas(req: Requisicion): number {
  return req.proveedorConocido ? 1 : 3;
}

export function cotizacionesCompletas(req: Requisicion): boolean {
  return req.cotizaciones.length >= cotizacionesMinimasRequeridas(req);
}

export function mejorCotizacionSugerida(req: Requisicion): Cotizacion | null {
  if (req.cotizaciones.length === 0) return null;
  return [...req.cotizaciones].sort((a, b) => a.precio - b.precio)[0];
}

export function resumenPorEtapaRequisicion(requisiciones: Requisicion[]): { etapa: string; cantidad: number; color: string }[] {
  return ETAPAS_PIPELINE_COMPRAS.map((etapa) => ({
    etapa,
    cantidad: requisiciones.filter((r) => r.etapa === etapa).length,
    color: colorEtapaRequisicion(etapa),
  }));
}

export function tiempoPromedioCiclo(requisiciones: Requisicion[]): number | null {
  const compradas = requisiciones.filter((r) => r.etapa === "Compra");
  if (compradas.length === 0) return null;
  const dias = compradas.map((r) => {
    const inicio = new Date(r.fechaSolicitud + "T00:00:00").getTime();
    const ultimoEvento = r.bitacora[r.bitacora.length - 1];
    const fin = new Date(ultimoEvento.fecha + "T00:00:00").getTime();
    return Math.max(0, Math.round((fin - inicio) / (1000 * 60 * 60 * 24)));
  });
  return Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
}
