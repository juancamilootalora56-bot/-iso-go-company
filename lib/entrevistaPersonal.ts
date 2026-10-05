export type ExperienciaLaboral = {
  id: string;
  empresa: string;
  tiempo: string;
  cargo: string;
  motivoRetiro: string;
};

export type FormacionAcademica = {
  id: string;
  institucion: string;
  anioFinalizacion: string;
  titulo: string;
  logros: string;
};

export type PreguntaEntrevista = { key: string; pregunta: string };
export type GrupoPreguntas = { grupo: string; preguntas: PreguntaEntrevista[] };

export const GRUPOS_PREGUNTAS: GrupoPreguntas[] = [
  {
    grupo: "Características de la Historia Familiar",
    preguntas: [
      { key: "familia", pregunta: "Háblame sobre tu familia. (Con quién vives actualmente, contacto ante una emergencia)" },
    ],
  },
  {
    grupo: "Generales",
    preguntas: [
      { key: "g1", pregunta: "Háblame sobre ti. (Hobbies, valores personales, qué te hace feliz, qué te hace enojar, qué no permites en tu vida)" },
      { key: "g2", pregunta: "¿Por qué te interesó trabajar en la organización?" },
      { key: "g3", pregunta: "¿Cuánto llevas trabajando en la Organización?" },
      { key: "g4", pregunta: "¿Cuál crees que es tu mayor fortaleza y por qué?" },
      { key: "g5", pregunta: "¿Cuál crees que es tu mayor debilidad y cómo crees que la podrías mejorar?" },
      { key: "g6", pregunta: "¿En qué te gustaría mejorar personal y profesionalmente?" },
      { key: "g7", pregunta: "¿Cómo te ves en tres años? (Aspiraciones y planes a futuro)" },
      { key: "g8", pregunta: "¿Cómo te ves ahora?" },
      { key: "g9", pregunta: "¿Cuál es tu mayor logro fuera del trabajo?" },
    ],
  },
  {
    grupo: "De desafío y adaptación",
    preguntas: [
      { key: "d10", pregunta: "¿Me podrías dar un ejemplo de una situación en la cual te encuentras ante un desafío y cómo lo superaste?" },
      { key: "d11", pregunta: "¿Alguna vez te han dado un plazo que no hayas podido cumplir? ¿Qué pasó? ¿Cómo lo resolviste?" },
      { key: "d12", pregunta: "La Organización trabaja con varios clientes con varias necesidades, y el objetivo es ofrecer un servicio excelente a todos ellos. ¿Cómo priorizas las necesidades de cada cliente o de cada área? ¿Manejas algún tipo de herramienta?" },
      { key: "d13", pregunta: "Describe una ocasión en la que hayas tenido que cambiar tu estrategia en el último momento. ¿Cómo manejaste esta situación?" },
      { key: "d14", pregunta: "¿Cómo abordas las situaciones en las que no puedes encontrar una solución para un problema?" },
      { key: "d15", pregunta: "¿Qué es lo mejor y lo peor de trabajar en equipo?" },
    ],
  },
  {
    grupo: "De resolución",
    preguntas: [
      { key: "r16", pregunta: "¿Dime 2 formas de usar un lápiz que no sea para lo que fue diseñado?" },
    ],
  },
  {
    grupo: "De mejoramiento y aprendizaje",
    preguntas: [
      { key: "m17", pregunta: "¿Conoces la misión, visión y los valores de la organización?" },
      { key: "m18", pregunta: "¿Qué mejorarías o cambiarías de tu puesto de trabajo?" },
      { key: "m19", pregunta: "¿Tus actividades están estandarizadas o las realizas de diferentes maneras?" },
      { key: "m20", pregunta: "¿Qué entiendes por Calidad? ¿Cómo la asocias con tu trabajo?" },
      { key: "m21", pregunta: "¿En qué te gustaría que la Organización te capacitara, o qué te gustaría aprender con relación a tu cargo?" },
    ],
  },
];

export type EntrevistaPersonal = {
  fecha: string;
  conociaOrganizacion: string;
  experiencias: ExperienciaLaboral[];
  formaciones: FormacionAcademica[];
  hablaIdiomas: "si" | "no" | "";
  idiomaCual: string;
  respuestas: Record<string, string>;
  observaciones: string;
};

export function experienciaVacia(): ExperienciaLaboral {
  return { id: crypto.randomUUID(), empresa: "", tiempo: "", cargo: "", motivoRetiro: "" };
}

export function formacionVacia(): FormacionAcademica {
  return { id: crypto.randomUUID(), institucion: "", anioFinalizacion: "", titulo: "", logros: "" };
}

export function entrevistaVacia(): EntrevistaPersonal {
  const respuestas: Record<string, string> = {};
  GRUPOS_PREGUNTAS.forEach((g) => g.preguntas.forEach((p) => (respuestas[p.key] = "")));
  return {
    fecha: "",
    conociaOrganizacion: "",
    experiencias: [experienciaVacia(), experienciaVacia(), experienciaVacia()],
    formaciones: [formacionVacia(), formacionVacia(), formacionVacia()],
    hablaIdiomas: "",
    idiomaCual: "",
    respuestas,
    observaciones: "",
  };
}

export function parseEntrevista(contenido: string): EntrevistaPersonal {
  const base = entrevistaVacia();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    return {
      fecha: parsed.fecha ?? base.fecha,
      conociaOrganizacion: parsed.conociaOrganizacion ?? base.conociaOrganizacion,
      experiencias: Array.isArray(parsed.experiencias) && parsed.experiencias.length > 0 ? parsed.experiencias : base.experiencias,
      formaciones: Array.isArray(parsed.formaciones) && parsed.formaciones.length > 0 ? parsed.formaciones : base.formaciones,
      hablaIdiomas: parsed.hablaIdiomas ?? base.hablaIdiomas,
      idiomaCual: parsed.idiomaCual ?? base.idiomaCual,
      respuestas: { ...base.respuestas, ...(parsed.respuestas ?? {}) },
      observaciones: parsed.observaciones ?? base.observaciones,
    };
  } catch {
    return base;
  }
}

export function entrevistaCompleta(e: EntrevistaPersonal): boolean {
  return Object.values(e.respuestas).some((v) => v.trim().length > 0);
}
