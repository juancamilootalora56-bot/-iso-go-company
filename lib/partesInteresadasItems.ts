export type GrupoInteresado = "accionistas" | "colaboradores" | "clientes" | "proveedores" | "comunidad";

export const GRUPOS_INTERESADOS: { key: GrupoInteresado; label: string; color: string }[] = [
  { key: "accionistas", label: "Accionistas", color: "#F5A623" },
  { key: "colaboradores", label: "Colaboradores", color: "#2EA3F2" },
  { key: "clientes", label: "Clientes", color: "#E8366B" },
  { key: "proveedores", label: "Proveedores", color: "#22C55E" },
  { key: "comunidad", label: "Comunidad", color: "#7C4DFF" },
];

export const REQUISITOS_COMUNES: Record<GrupoInteresado, string[]> = {
  accionistas: [
    "Rentabilidad",
    "Competitividad",
    "Posicionamiento",
    "Pertenencia en el tiempo",
    "Cumplimiento de políticas",
    "Gestión eficiente en los procesos",
  ],
  colaboradores: [
    "Capacitaciones",
    "Pagos oportunos",
    "Dotación",
    "Buen clima laboral",
    "Procedimientos definidos",
    "Recursos y equipos",
  ],
  clientes: [
    "Servicio oportuno",
    "Servicio de calidad",
    "Productos de calidad",
    "Servicio de garantía",
    "Precios competitivos",
    "Garantía",
    "Entregas a tiempo",
  ],
  proveedores: [
    "Pago a tiempo",
    "Acuerdos de negociación",
    "Cumplimiento de normas",
    "Solicitudes con tiempo previo",
    "Definición de requisitos",
  ],
  comunidad: ["Producción limpia", "Ambiente sano", "Impuestos", "Leyes"],
};

export type DetalleRequisito = {
  definicion: string;
  expectativas: string;
  registros: string;
};

export type SeleccionPartesInteresadas = Record<GrupoInteresado, string[]>;

export function detalleKey(grupo: GrupoInteresado, requisito: string) {
  return `${grupo}::${requisito}`;
}

export function seleccionVacia(): SeleccionPartesInteresadas {
  return { accionistas: [], colaboradores: [], clientes: [], proveedores: [], comunidad: [] };
}

export function parseSeleccion(contenido: string): SeleccionPartesInteresadas {
  const base = seleccionVacia();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    GRUPOS_INTERESADOS.forEach((g) => {
      if (Array.isArray(parsed?.[g.key])) base[g.key] = parsed[g.key];
    });
  } catch {
    // ignore
  }
  return base;
}

export function parseDetalles(contenido: string): Record<string, DetalleRequisito> {
  if (!contenido) return {};
  try {
    const parsed = JSON.parse(contenido);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}
