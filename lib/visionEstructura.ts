export type CampoVision = { key: string; pregunta: string };
export type GrupoVision = { grupo: string; campos: CampoVision[] };

export const ESTRUCTURA_VISION: GrupoVision[] = [
  {
    grupo: "Horizonte",
    campos: [
      { key: "ano_proyeccion", pregunta: "¿Para qué año proyecta esta visión?" },
      { key: "cambios_entorno", pregunta: "¿Qué cambios en el entorno o el mercado espera enfrentar?" },
    ],
  },
  {
    grupo: "Posicionamiento",
    campos: [
      { key: "como_reconocida", pregunta: "¿Cómo quiere ser reconocida la empresa en el futuro?" },
      { key: "diferenciacion_futura", pregunta: "¿En qué se querrá diferenciar frente al mercado?" },
    ],
  },
  {
    grupo: "Alcance",
    campos: [
      { key: "mercados_futuros", pregunta: "¿En qué mercados o regiones se ve la empresa?" },
      { key: "productos_futuros", pregunta: "¿Qué productos o servicios nuevos espera ofrecer?" },
    ],
  },
  {
    grupo: "Crecimiento",
    campos: [
      { key: "nivel_crecimiento", pregunta: "¿Qué nivel de crecimiento aspira a alcanzar (ventas, clientes, equipo)?" },
    ],
  },
  {
    grupo: "Innovación y Tecnología",
    campos: [
      { key: "rol_innovacion", pregunta: "¿Qué papel juega la innovación o la tecnología en ese futuro?" },
    ],
  },
  {
    grupo: "Impacto",
    campos: [
      { key: "impacto_clientes", pregunta: "¿Qué impacto quiere generar en sus clientes?" },
      { key: "impacto_comunidad", pregunta: "¿Qué impacto quiere generar en sus colaboradores o la comunidad?" },
    ],
  },
];

export function estructuraVacia(): Record<string, string> {
  const obj: Record<string, string> = {};
  ESTRUCTURA_VISION.forEach((g) => g.campos.forEach((c) => (obj[c.key] = "")));
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
