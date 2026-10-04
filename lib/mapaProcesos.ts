export type CategoriaProceso = "estrategicos" | "misionales" | "apoyo";

export const CATEGORIAS_PROCESO: { key: CategoriaProceso; label: string }[] = [
  { key: "estrategicos", label: "Procesos Estratégicos" },
  { key: "misionales", label: "Procesos Misionales" },
  { key: "apoyo", label: "Procesos de Apoyo" },
];

export const PROCESOS_COMUNES: string[] = [
  "Gerencia General",
  "Planificación Estratégica",
  "Gestión Comercial",
  "Producción / Operaciones",
  "Gestión Humana",
  "Tesorería / Finanzas",
  "Compras",
  "Gestión de Calidad",
  "Logística y Distribución",
  "Mantenimiento",
  "Sistemas / TI",
  "Atención al Cliente",
  "Gestión Jurídica",
  "Auditoría Interna",
  "Mejora Continua",
  "Investigación y Desarrollo",
];

export function parseLista(contenido: string): string[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseClasificacion(contenido: string): Record<string, CategoriaProceso> {
  if (!contenido) return {};
  try {
    const parsed = JSON.parse(contenido);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}
