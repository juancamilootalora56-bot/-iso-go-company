export type CampoMision = { key: string; pregunta: string };
export type GrupoMision = { grupo: string; campos: CampoMision[] };

export const ESTRUCTURA_MISION: GrupoMision[] = [
  {
    grupo: "Propósito",
    campos: [
      { key: "aporta_comunidad", pregunta: "¿Qué le aporta la empresa a la Comunidad?" },
      { key: "razon_ser", pregunta: "¿Cuál es la Razón de Ser?" },
    ],
  },
  {
    grupo: "Mercado",
    campos: [
      { key: "dirige_empresa", pregunta: "¿A Quién se dirige la Empresa?" },
      { key: "publico_objetivo", pregunta: "¿Cuál es el Público Objetivo?" },
    ],
  },
  {
    grupo: "Valores",
    campos: [
      { key: "principios_eticos", pregunta: "¿Cuáles son los principios éticos y morales que guían las acciones de la compañía?" },
    ],
  },
  {
    grupo: "Compromiso",
    campos: [
      { key: "compromete_empresa", pregunta: "¿Con Quién se Compromete la Empresa?" },
    ],
  },
  {
    grupo: "Diferenciación",
    campos: [
      { key: "hace_unica", pregunta: "¿Qué la hace Única?" },
      { key: "diferencia_competencia", pregunta: "¿Cómo se diferencia de la competencia?" },
    ],
  },
  {
    grupo: "Objetivo",
    campos: [
      { key: "corto_plazo", pregunta: "Aspiraciones a lograr a Corto Plazo" },
      { key: "mediano_plazo", pregunta: "Aspiraciones a lograr a Mediano Plazo" },
      { key: "largo_plazo", pregunta: "Aspiraciones a lograr a Largo Plazo" },
    ],
  },
];

export function estructuraVacia(): Record<string, string> {
  const obj: Record<string, string> = {};
  ESTRUCTURA_MISION.forEach((g) => g.campos.forEach((c) => (obj[c.key] = "")));
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
