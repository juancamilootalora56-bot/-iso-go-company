export type CampoPolitica = { key: string; pregunta: string };
export type GrupoPolitica = { grupo: string; campos: CampoPolitica[] };

export const ESTRUCTURA_POLITICA: GrupoPolitica[] = [
  {
    grupo: "Propósito y Contexto",
    campos: [
      { key: "proposito_empresa", pregunta: "¿Cuál es el propósito de la empresa y a qué contexto o mercado responde?" },
      { key: "apoyo_direccion_estrategica", pregunta: "¿Cómo apoya esta política la dirección estratégica de la organización?" },
    ],
  },
  {
    grupo: "Compromiso con el Cliente",
    campos: [
      { key: "compromiso_satisfaccion", pregunta: "¿Qué compromiso asume la empresa con la satisfacción del cliente?" },
      { key: "requisitos_cumplir", pregunta: "¿Qué requisitos se comprometen a cumplir (legales, normativos, del cliente, de la norma ISO)?" },
    ],
  },
  {
    grupo: "Mejora Continua",
    campos: [
      { key: "compromiso_mejora", pregunta: "¿Cómo se comprometen a mejorar continuamente el Sistema de Gestión de Calidad?" },
      { key: "recursos_mejora", pregunta: "¿Qué recursos o acciones van a destinar para sostener esa mejora?" },
    ],
  },
  {
    grupo: "Marco para los Objetivos",
    campos: [
      { key: "marco_objetivos", pregunta: "¿Cómo va a servir esta política como marco para establecer y revisar los objetivos de calidad?" },
    ],
  },
  {
    grupo: "Comunicación y Vigencia",
    campos: [
      { key: "como_comunicar", pregunta: "¿Cómo se va a comunicar esta política a todo el personal y a que la entiendan?" },
      { key: "revision_periodica", pregunta: "¿Cada cuánto y cómo se va a revisar para mantenerla vigente?" },
    ],
  },
];

export function estructuraVacia(): Record<string, string> {
  const obj: Record<string, string> = {};
  ESTRUCTURA_POLITICA.forEach((g) => g.campos.forEach((c) => (obj[c.key] = "")));
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
