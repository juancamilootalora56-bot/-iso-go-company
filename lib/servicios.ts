// Servicios prestados: alta y perfil, base para el Proceso Operativo.
// Análogo a lib/productosFabricados.ts, pero para empresas que prestan servicios
// en vez de (o además de) fabricar productos — ISO 9001 cl. 8.5 (provisión del servicio).

export type Servicio = {
  id: string;
  imagen: string | null; // data URL (base64)

  nombre: string;
  descripcion: string;
  codigo: string; // código interno del servicio
  categoria: string;

  duracionEstimada: number;
  unidadDuracion: string;
  criteriosAceptacion: string; // qué define que el servicio se prestó correctamente

  estado: string;
  fechaAlta: string;
  observaciones: string;

  // IDs de Empleado (lib/personal.ts) de los colaboradores con acceso de
  // solo lectura a este servicio puntual, sin importar si tienen el
  // módulo Gestión Operativa asignado desde su perfil.
  colaboradoresConAcceso: string[];
};

export const CATEGORIAS_SERVICIO = [
  "Consultoría y asesoría",
  "Mantenimiento y soporte técnico",
  "Instalación",
  "Capacitación y formación",
  "Limpieza y aseo",
  "Transporte y logística",
  "Salud y bienestar",
  "Tecnología e informática",
  "Profesional (legal, contable, etc.)",
  "Alimentación y catering",
  "Otro",
];

export const UNIDADES_DURACION_SERVICIO = ["Minutos", "Horas", "Días", "Semanas", "Meses"];

export const ESTADOS_SERVICIO = ["Activo", "En desarrollo", "Descontinuado"];

export function colorEstadoServicio(estado: string): string {
  switch (estado) {
    case "Activo":
      return "#22C55E";
    case "En desarrollo":
      return "#F5A623";
    case "Descontinuado":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function servicioVacio(): Servicio {
  return {
    id: crypto.randomUUID(),
    imagen: null,
    nombre: "",
    descripcion: "",
    codigo: "",
    categoria: "",
    duracionEstimada: 0,
    unidadDuracion: "Horas",
    criteriosAceptacion: "",
    estado: "Activo",
    fechaAlta: new Date().toISOString().slice(0, 10),
    observaciones: "",
    colaboradoresConAcceso: [],
  };
}

export function parseServicios(contenido: string): Servicio[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: Servicio) => ({ ...s, colaboradoresConAcceso: s.colaboradoresConAcceso ?? [] }));
  } catch {
    return [];
  }
}
