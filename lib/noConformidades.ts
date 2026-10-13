// Control de producto no conforme — ISO 9001:2015, cláusula 8.7.

export type EventoNC = {
  id: string;
  fecha: string; // fecha y hora ISO
  nota: string;
  autor: string;
};

export type NoConformidad = {
  id: string;
  radicado: string; // ej: "NC-0001"

  // Identificación
  productoId: string;
  productoNombre: string;
  cantidadAfectada: number;
  unidadMedida: string;
  loteONumeroSerie: string;
  etapaDeteccion: string; // ver ETAPAS_DETECCION_NC
  clienteId: string; // solo si etapaDeteccion = post-entrega
  clienteNombre: string;
  fechaDeteccion: string;
  detectadoPor: string;
  descripcion: string;
  requisitoIncumplido: string;
  evidencia: string | null; // data URL
  evidenciaNombre: string;

  // Clasificación
  severidad: string; // ver SEVERIDADES_NC
  causaAparente: string; // ver CAUSAS_APARENTES_NC

  // Disposición (8.7.1 a-d)
  disposiciones: string[]; // subconjunto de DISPOSICIONES_NC
  detalleDisposicion: string;
  concesionAutorizadoPor: string;
  concesionCondiciones: string;

  // Verificación de la corrección
  requiereVerificacion: boolean;
  fechaVerificacion: string;
  responsableVerificacion: string;
  resultadoVerificacion: string; // ver RESULTADOS_VERIFICACION_NC

  // Costo de no calidad
  costoReproceso: number;
  costoDesperdicio: number;
  costoDevolucion: number;
  moneda: string;

  // Acción correctiva
  requiereAccionCorrectiva: boolean;
  analisisCausaRaiz: string;
  planAccion: string;
  responsableAccion: string;
  fechaCompromiso: string;

  // Estado y seguimiento
  estado: string; // ver ESTADOS_NC
  responsableCaso: string;
  bitacora: EventoNC[];
  fechaCierre: string;
  observaciones: string;
};

export const ETAPAS_DETECCION_NC = [
  "Recepción de materia prima",
  "En proceso",
  "Producto terminado",
  "Post-entrega (cliente)",
];

export const SEVERIDADES_NC = ["Crítica", "Mayor", "Menor"];

export const CAUSAS_APARENTES_NC = [
  "Materia prima",
  "Proceso",
  "Diseño",
  "Mano de obra",
  "Equipo / Maquinaria",
  "Proveedor",
  "Cliente (mal uso)",
  "Otro",
];

export const DISPOSICIONES_NC = [
  "Corrección (reproceso / reparación)",
  "Segregación / contención / devolución / suspensión",
  "Informar al cliente",
  "Concesión (aceptación con autorización)",
];

export const RESULTADOS_VERIFICACION_NC = ["Pendiente", "Conforme", "No conforme"];

export const ESTADOS_NC = ["Abierto", "En disposición", "En verificación", "Cerrado"];

export const MONEDAS_NC = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export function colorSeveridadNC(severidad: string): string {
  switch (severidad) {
    case "Crítica":
      return "#EF4444";
    case "Mayor":
      return "#F5A623";
    case "Menor":
      return "#3B82F6";
    default:
      return "#9CA3AF";
  }
}

export function colorEstadoNC(estado: string): string {
  switch (estado) {
    case "Abierto":
      return "#EF4444";
    case "En disposición":
      return "#F5A623";
    case "En verificación":
      return "#3B82F6";
    case "Cerrado":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function colorResultadoVerificacionNC(resultado: string): string {
  switch (resultado) {
    case "Conforme":
      return "#22C55E";
    case "No conforme":
      return "#EF4444";
    case "Pendiente":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function estaAbiertaNC(estado: string): boolean {
  return estado !== "Cerrado";
}

export function siguienteRadicadoNC(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `NC-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicadoNC(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function eventoNCVacio(nota: string, autor: string): EventoNC {
  return { id: crypto.randomUUID(), fecha: new Date().toISOString(), nota, autor };
}

export function noConformidadVacia(radicado: string): NoConformidad {
  return {
    id: crypto.randomUUID(),
    radicado,
    productoId: "",
    productoNombre: "",
    cantidadAfectada: 0,
    unidadMedida: "",
    loteONumeroSerie: "",
    etapaDeteccion: "En proceso",
    clienteId: "",
    clienteNombre: "",
    fechaDeteccion: new Date().toISOString().slice(0, 10),
    detectadoPor: "",
    descripcion: "",
    requisitoIncumplido: "",
    evidencia: null,
    evidenciaNombre: "",
    severidad: "Menor",
    causaAparente: "",
    disposiciones: [],
    detalleDisposicion: "",
    concesionAutorizadoPor: "",
    concesionCondiciones: "",
    requiereVerificacion: false,
    fechaVerificacion: "",
    responsableVerificacion: "",
    resultadoVerificacion: "Pendiente",
    costoReproceso: 0,
    costoDesperdicio: 0,
    costoDevolucion: 0,
    moneda: "Guaraníes (PYG)",
    requiereAccionCorrectiva: false,
    analisisCausaRaiz: "",
    planAccion: "",
    responsableAccion: "",
    fechaCompromiso: "",
    estado: "Abierto",
    responsableCaso: "",
    bitacora: [],
    fechaCierre: "",
    observaciones: "",
  };
}

export function parseNoConformidades(contenido: string): NoConformidad[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n: NoConformidad) => ({
      ...n,
      disposiciones: n.disposiciones ?? [],
      bitacora: n.bitacora ?? [],
    }));
  } catch {
    return [];
  }
}

export function formatoMontoNC(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

export function costoTotalNC(nc: NoConformidad): number {
  return (nc.costoReproceso || 0) + (nc.costoDesperdicio || 0) + (nc.costoDevolucion || 0);
}

export function costoTotalNoCalidad(ncs: NoConformidad[]): number {
  return ncs.reduce((acc, n) => acc + costoTotalNC(n), 0);
}

function diasEntre(desde: string, hasta: string): number | null {
  if (!desde || !hasta) return null;
  const a = new Date(desde + "T00:00:00").getTime();
  const b = new Date(hasta + "T00:00:00").getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

export function diasAbiertaNC(nc: NoConformidad): number {
  const hasta = nc.fechaCierre || new Date().toISOString().slice(0, 10);
  return diasEntre(nc.fechaDeteccion, hasta) ?? 0;
}

export function tiempoPromedioResolucionNC(ncs: NoConformidad[]): number | null {
  const cerradas = ncs.filter((n) => !estaAbiertaNC(n.estado) && n.fechaCierre);
  if (cerradas.length === 0) return null;
  const total = cerradas.reduce((acc, n) => acc + (diasEntre(n.fechaDeteccion, n.fechaCierre) ?? 0), 0);
  return Math.round((total / cerradas.length) * 10) / 10;
}

export function resumenPorEtapaNC(ncs: NoConformidad[]): { etapa: string; cantidad: number }[] {
  return ETAPAS_DETECCION_NC.map((etapa) => ({
    etapa,
    cantidad: ncs.filter((n) => n.etapaDeteccion === etapa).length,
  })).filter((r) => r.cantidad > 0);
}

export function rankingPorProducto(ncs: NoConformidad[], limite = 5): { productoId: string; productoNombre: string; cantidad: number; costo: number }[] {
  const mapa = new Map<string, { productoId: string; productoNombre: string; cantidad: number; costo: number }>();
  ncs.forEach((n) => {
    if (!n.productoId) return;
    const actual = mapa.get(n.productoId) ?? { productoId: n.productoId, productoNombre: n.productoNombre, cantidad: 0, costo: 0 };
    actual.cantidad += 1;
    actual.costo += costoTotalNC(n);
    mapa.set(n.productoId, actual);
  });
  return Array.from(mapa.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
}
