// Inventario de máquinas, equipos, herramientas e instrumentos — hoja de vida completa.

export type EventoInventario = {
  id: string;
  fecha: string;
  tipo: string; // ver TIPOS_EVENTO_INVENTARIO
  descripcion: string;
  responsable: string;
  costo: number;
};

export type Mantenimiento = {
  id: string;
  tipo: string; // "Preventivo" | "Correctivo"
  estado: string; // ver ESTADOS_MANTENIMIENTO
  fechaProgramada: string;
  fechaRealizada: string;
  descripcion: string;
  responsable: string;
  repuestos: string;
  tiempoParadaHoras: number;
  costo: number;
  observaciones: string;
};

export type RegistroCalibracion = {
  id: string;
  fecha: string;
  resultado: string; // ver RESULTADOS_CALIBRACION
  entidadCalibradora: string;
  numeroCertificado: string;
  proximaCalibracion: string;
  responsable: string;
  costo: number;
  certificado: string | null; // data URL del certificado adjunto (imagen o PDF)
  certificadoNombre: string;
  observaciones: string;
};

export type ItemInventario = {
  id: string;
  imagen: string | null; // data URL (base64)

  // Identificación
  nombre: string;
  codigo: string; // número de inventario / activo
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  fabricante: string;
  anioFabricacion: string;

  // Ubicación y responsable
  ubicacion: string;
  responsable: string;
  proveedor: string;

  // Adquisición
  fechaAdquisicion: string;
  valorAdquisicion: number;
  moneda: string;
  vidaUtilAnios: string;
  numeroFactura: string;
  garantiaHasta: string;

  // Especificaciones técnicas
  capacidadPotencia: string;
  voltaje: string;
  dimensiones: string;
  pesoKg: string;
  especificacionesTecnicas: string;

  // Estado y mantenimiento
  estado: string;
  criticidad: string;
  frecuenciaMantenimiento: string;
  ultimoMantenimiento: string;
  proximoMantenimiento: string;

  // Calibración (instrumentos de medición)
  requiereCalibracion: boolean;
  frecuenciaCalibracion: string;
  ultimaCalibracion: string;
  proximaCalibracion: string;

  observaciones: string;
  bitacora: EventoInventario[];
  mantenimientos: Mantenimiento[];
  calibraciones: RegistroCalibracion[];
  fechaAlta: string;
};

export const TIPOS_ITEM_INVENTARIO = [
  "Máquina",
  "Equipo",
  "Herramienta",
  "Instrumento de medición",
  "Vehículo",
  "Mobiliario",
  "Equipo informático",
  "Otro",
];

export const ESTADOS_ITEM_INVENTARIO = ["Operativo", "En mantenimiento", "Fuera de servicio", "De baja"];

export const CRITICIDADES_ITEM = ["Alta", "Media", "Baja"];

export const MONEDAS_INVENTARIO = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export const TIPOS_EVENTO_INVENTARIO = [
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
  "Reparación",
  "Calibración",
  "Traslado",
  "Inspección",
  "Baja",
  "Otro",
];

export function colorEstadoItem(estado: string): string {
  switch (estado) {
    case "Operativo":
      return "#22C55E";
    case "En mantenimiento":
      return "#F5A623";
    case "Fuera de servicio":
      return "#EF4444";
    case "De baja":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function colorCriticidadItem(criticidad: string): string {
  switch (criticidad) {
    case "Alta":
      return "#EF4444";
    case "Media":
      return "#F5A623";
    case "Baja":
      return "#3B82F6";
    default:
      return "#9CA3AF";
  }
}

export function itemInventarioVacio(): ItemInventario {
  return {
    id: crypto.randomUUID(),
    imagen: null,
    nombre: "",
    codigo: "",
    tipo: "Máquina",
    marca: "",
    modelo: "",
    numeroSerie: "",
    fabricante: "",
    anioFabricacion: "",
    ubicacion: "",
    responsable: "",
    proveedor: "",
    fechaAdquisicion: "",
    valorAdquisicion: 0,
    moneda: "Guaraníes (PYG)",
    vidaUtilAnios: "",
    numeroFactura: "",
    garantiaHasta: "",
    capacidadPotencia: "",
    voltaje: "",
    dimensiones: "",
    pesoKg: "",
    especificacionesTecnicas: "",
    estado: "Operativo",
    criticidad: "Media",
    frecuenciaMantenimiento: "",
    ultimoMantenimiento: "",
    proximoMantenimiento: "",
    requiereCalibracion: false,
    frecuenciaCalibracion: "",
    ultimaCalibracion: "",
    proximaCalibracion: "",
    observaciones: "",
    bitacora: [],
    mantenimientos: [],
    calibraciones: [],
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function eventoInventarioVacio(): EventoInventario {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "Mantenimiento preventivo",
    descripcion: "",
    responsable: "",
    costo: 0,
  };
}

export const TIPOS_MANTENIMIENTO = ["Preventivo", "Correctivo"];

export const ESTADOS_MANTENIMIENTO = ["Programado", "En proceso", "Completado", "Cancelado"];

export function colorTipoMantenimiento(tipo: string): string {
  return tipo === "Correctivo" ? "#EF4444" : "#3B82F6";
}

export function colorEstadoMantenimiento(estado: string): string {
  switch (estado) {
    case "Programado":
      return "#9CA3AF";
    case "En proceso":
      return "#F5A623";
    case "Completado":
      return "#22C55E";
    case "Cancelado":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function mantenimientoVacio(): Mantenimiento {
  return {
    id: crypto.randomUUID(),
    tipo: "Preventivo",
    estado: "Programado",
    fechaProgramada: new Date().toISOString().slice(0, 10),
    fechaRealizada: "",
    descripcion: "",
    responsable: "",
    repuestos: "",
    tiempoParadaHoras: 0,
    costo: 0,
    observaciones: "",
  };
}

export function estaVencidoMantenimiento(m: Mantenimiento): boolean {
  if (m.estado === "Completado" || m.estado === "Cancelado") return false;
  if (!m.fechaProgramada) return false;
  const hoy = new Date().setHours(0, 0, 0, 0);
  const programada = new Date(m.fechaProgramada + "T00:00:00").getTime();
  return programada < hoy;
}

export function costoTotalMantenimientos(mantenimientos: Mantenimiento[]): number {
  return mantenimientos.reduce((acc, m) => acc + (m.costo || 0), 0);
}

export function tiempoParadaTotalHoras(mantenimientos: Mantenimiento[]): number {
  return mantenimientos.reduce((acc, m) => acc + (m.tiempoParadaHoras || 0), 0);
}

export const RESULTADOS_CALIBRACION = ["Conforme", "Conforme con observaciones", "No conforme"];

export function colorResultadoCalibracion(resultado: string): string {
  switch (resultado) {
    case "Conforme":
      return "#22C55E";
    case "Conforme con observaciones":
      return "#F5A623";
    case "No conforme":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function registroCalibracionVacio(): RegistroCalibracion {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    resultado: "Conforme",
    entidadCalibradora: "",
    numeroCertificado: "",
    proximaCalibracion: "",
    responsable: "",
    costo: 0,
    certificado: null,
    certificadoNombre: "",
    observaciones: "",
  };
}

export function parseInventario(contenido: string): ItemInventario[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: ItemInventario) => ({
      ...item,
      bitacora: item.bitacora ?? [],
      mantenimientos: item.mantenimientos ?? [],
      calibraciones: item.calibraciones ?? [],
    }));
  } catch {
    return [];
  }
}

export function formatoMonto(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

function diasHasta(fecha: string): number | null {
  if (!fecha) return null;
  const hoy = new Date().setHours(0, 0, 0, 0);
  const objetivo = new Date(fecha + "T00:00:00").getTime();
  if (isNaN(objetivo)) return null;
  return Math.round((objetivo - hoy) / 86_400_000);
}

export type EstadoAlerta = "sin_fecha" | "vencido" | "proximo" | "al_dia";

function estadoAlertaDeDias(dias: number | null): EstadoAlerta {
  if (dias === null) return "sin_fecha";
  if (dias < 0) return "vencido";
  if (dias <= 15) return "proximo";
  return "al_dia";
}

export function estadoMantenimiento(item: ItemInventario): EstadoAlerta {
  return estadoAlertaDeDias(diasHasta(item.proximoMantenimiento));
}

export function estadoCalibracion(item: ItemInventario): EstadoAlerta {
  if (!item.requiereCalibracion) return "sin_fecha";
  return estadoAlertaDeDias(diasHasta(item.proximaCalibracion));
}

export function diasHastaProximoMantenimiento(item: ItemInventario): number | null {
  return diasHasta(item.proximoMantenimiento);
}

export function diasHastaProximaCalibracion(item: ItemInventario): number | null {
  return diasHasta(item.proximaCalibracion);
}

export function colorEstadoAlerta(estado: EstadoAlerta): string {
  switch (estado) {
    case "vencido":
      return "#EF4444";
    case "proximo":
      return "#F5A623";
    case "al_dia":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function etiquetaEstadoAlerta(estado: EstadoAlerta): string {
  switch (estado) {
    case "vencido":
      return "Vencido";
    case "proximo":
      return "Próximo";
    case "al_dia":
      return "Al día";
    default:
      return "Sin programar";
  }
}
