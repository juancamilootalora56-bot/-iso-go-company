export type CampoValores = { key: string; pregunta: string };
export type GrupoValores = { grupo: string; campos: CampoValores[] };

export const ESTRUCTURA_VALORES: GrupoValores[] = [
  {
    grupo: "Identidad",
    campos: [
      { key: "principios_innegociables", pregunta: "¿Qué principios son innegociables para la empresa?" },
      { key: "comportamientos_esperados", pregunta: "¿Qué comportamientos se esperan de todo el equipo?" },
    ],
  },
  {
    grupo: "Relación con la Misión y Visión",
    campos: [
      { key: "aporte_mision", pregunta: "¿Cómo contribuyen estos valores a cumplir la misión?" },
      { key: "conexion_vision", pregunta: "¿Cómo se conectan con la visión de futuro de la empresa?" },
    ],
  },
  {
    grupo: "Cultura",
    campos: [
      { key: "como_se_viven", pregunta: "¿Cómo se viven estos valores en el día a día?" },
      { key: "conductas_contrarias", pregunta: "¿Qué conductas contradicen estos valores y deben evitarse?" },
    ],
  },
  {
    grupo: "Implementación",
    campos: [
      { key: "como_comunicar", pregunta: "¿Cómo se van a comunicar y reforzar estos valores entre los colaboradores?" },
      { key: "medidas_incumplimiento", pregunta: "¿Qué medidas se tomarán si no se cumplen?" },
    ],
  },
];

export function estructuraVacia(): Record<string, string> {
  const obj: Record<string, string> = {};
  ESTRUCTURA_VALORES.forEach((g) => g.campos.forEach((c) => (obj[c.key] = "")));
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

export const COLORES_VALORES = [
  "#F5A623",
  "#22C55E",
  "#3B82F6",
  "#E8366B",
  "#7C4DFF",
  "#F2CB4E",
  "#14B8A6",
];

export type ValorOrganizacional = { nombre: string; descripcion: string };

function valorVacio(): ValorOrganizacional {
  return { nombre: "", descripcion: "" };
}

export function valoresVacios(): ValorOrganizacional[] {
  return Array.from({ length: 7 }, valorVacio);
}

export function parseValores(contenido: string): ValorOrganizacional[] {
  if (!contenido) return valoresVacios();
  try {
    const parsed = JSON.parse(contenido);
    if (Array.isArray(parsed)) {
      const arr = parsed.map((v) =>
        typeof v === "string"
          ? { nombre: v, descripcion: "" }
          : { nombre: v?.nombre ?? "", descripcion: v?.descripcion ?? "" }
      );
      while (arr.length < 7) arr.push(valorVacio());
      return arr.slice(0, 7);
    }
  } catch {
    // ignore
  }
  return valoresVacios();
}
