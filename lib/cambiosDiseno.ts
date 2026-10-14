// Control de cambios del diseño y desarrollo — ISO 9001:2015, cláusula 8.3.6.

export type EventoCD = {
  id: string;
  fecha: string; // fecha y hora ISO
  nota: string;
  autor: string;
};

export type CambioDiseno = {
  id: string;
  radicado: string; // ej: "CD-0001"

  proyectoId: string;
  proyectoNombre: string;

  fechaSolicitud: string;
  solicitadoPor: string;
  descripcionCambio: string;
  motivoCambio: string; // ver MOTIVOS_CAMBIO_DISENO

  evaluacionImpacto: string;
  impactoEnEntregasCliente: boolean;
  impactoEnPartesInteresadas: boolean;

  responsableAprobacion: string;
  fechaAprobacion: string;

  estado: string; // ver ESTADOS_CAMBIO_DISENO
  bitacora: EventoCD[];
  fechaCierre: string;
  observaciones: string;
};

export const MOTIVOS_CAMBIO_DISENO = [
  "Solicitud del cliente",
  "Hallazgo en revisión de diseño",
  "No conformidad en verificación",
  "No conformidad en validación",
  "Cambio normativo o legal",
  "Mejora de desempeño",
  "Disponibilidad de materiales o proveedores",
  "Otro",
];

export const ESTADOS_CAMBIO_DISENO = ["Solicitado", "En evaluación de impacto", "Aprobado", "Rechazado", "Implementado"];

export function colorEstadoCambioDiseno(estado: string): string {
  switch (estado) {
    case "Solicitado":
      return "#9CA3AF";
    case "En evaluación de impacto":
      return "#F5A623";
    case "Aprobado":
      return "#3B82F6";
    case "Rechazado":
      return "#EF4444";
    case "Implementado":
      return "#22C55E";
    default:
      return "#9CA3AF";
  }
}

export function cambioDisenoAbierto(estado: string): boolean {
  return estado !== "Rechazado" && estado !== "Implementado";
}

export function siguienteRadicadoCD(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `CD-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeRadicadoCD(radicado: string): number {
  const m = radicado.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function eventoCDVacio(nota: string, autor: string): EventoCD {
  return { id: crypto.randomUUID(), fecha: new Date().toISOString(), nota, autor };
}

export function cambioDisenoVacio(radicado: string, proyectoId = "", proyectoNombre = ""): CambioDiseno {
  return {
    id: crypto.randomUUID(),
    radicado,
    proyectoId,
    proyectoNombre,
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    solicitadoPor: "",
    descripcionCambio: "",
    motivoCambio: "Solicitud del cliente",
    evaluacionImpacto: "",
    impactoEnEntregasCliente: false,
    impactoEnPartesInteresadas: false,
    responsableAprobacion: "",
    fechaAprobacion: "",
    estado: "Solicitado",
    bitacora: [],
    fechaCierre: "",
    observaciones: "",
  };
}

export function parseCambiosDiseno(contenido: string): CambioDiseno[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: CambioDiseno) => ({ ...c, bitacora: c.bitacora ?? [] }));
  } catch {
    return [];
  }
}

export function resumenPorEstadoCD(cambios: CambioDiseno[]): { estado: string; cantidad: number; color: string }[] {
  return ESTADOS_CAMBIO_DISENO.map((estado) => ({
    estado,
    cantidad: cambios.filter((c) => c.estado === estado).length,
    color: colorEstadoCambioDiseno(estado),
  })).filter((r) => r.cantidad > 0);
}

export function resumenPorMotivoCD(cambios: CambioDiseno[]): { motivo: string; cantidad: number }[] {
  return MOTIVOS_CAMBIO_DISENO.map((motivo) => ({
    motivo,
    cantidad: cambios.filter((c) => c.motivoCambio === motivo).length,
  })).filter((r) => r.cantidad > 0);
}

export function cambiosPorMesCD(cambios: CambioDiseno[]): { mes: string; cantidad: number }[] {
  const mapa = new Map<string, number>();
  cambios.forEach((c) => {
    if (!c.fechaSolicitud) return;
    const mes = c.fechaSolicitud.slice(0, 7);
    mapa.set(mes, (mapa.get(mes) ?? 0) + 1);
  });
  return Array.from(mapa.entries())
    .map(([mes, cantidad]) => ({ mes, cantidad }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}
