export type CampoAlcance = { key: string; pregunta: string };
export type GrupoAlcance = { grupo: string; campos: CampoAlcance[] };

export const ESTRUCTURA_ALCANCE: GrupoAlcance[] = [
  {
    grupo: "Productos y Servicios",
    campos: [
      { key: "productos_servicios", pregunta: "¿Qué productos o servicios cubre el Sistema de Gestión de Calidad?" },
    ],
  },
  {
    grupo: "Sitios y Unidades Organizacionales",
    campos: [
      { key: "sitios_incluidos", pregunta: "¿Qué sitios, sedes o ubicaciones físicas están incluidos?" },
      { key: "areas_incluidas", pregunta: "¿Qué áreas o unidades de la organización están incluidas?" },
    ],
  },
  {
    grupo: "Contexto y Partes Interesadas",
    campos: [
      { key: "cuestiones_relevantes", pregunta: "¿Qué cuestiones internas y externas son relevantes para el propósito de la empresa?" },
      { key: "requisitos_partes_interesadas", pregunta: "¿Qué requisitos de las partes interesadas se tuvieron en cuenta para definir el alcance?" },
    ],
  },
  {
    grupo: "Exclusiones",
    campos: [
      { key: "requisitos_no_aplicables", pregunta: "¿Hay algún requisito de la norma ISO que no aplica a la empresa?" },
      { key: "justificacion_exclusiones", pregunta: "Si hay exclusiones, ¿cuál es la justificación?" },
    ],
  },
];

export function estructuraVacia(): Record<string, string> {
  const obj: Record<string, string> = {};
  ESTRUCTURA_ALCANCE.forEach((g) => g.campos.forEach((c) => (obj[c.key] = "")));
  return obj;
}

export function parseEstructura(contenido: string): Record<string, string> {
  const base = estructuraVacia();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    Object.keys(base).forEach((k) => {
      if (typeof parsed?.[k] === "string") base[k] = parsed[k];
    });
  } catch {
    // ignore
  }
  return base;
}
