// Test de Habilidades — cuestionario de 54 afirmaciones (escala Likert 1-5) que
// mide 18 competencias blandas, 3 preguntas por competencia. Replica fielmente
// el cuestionario, la plantilla de calificación y la interpretación del formato
// original de la empresa (GTH-P01-F06 / GTH-P01-F03), solo que autocalculado.

export const ESCALA_LIKERT = [
  { valor: 1, label: "Totalmente en desacuerdo" },
  { valor: 2, label: "Parcialmente en desacuerdo" },
  { valor: 3, label: "Quizá o inseguro" },
  { valor: 4, label: "Parcialmente de acuerdo" },
  { valor: 5, label: "Totalmente de acuerdo" },
];

export const PREGUNTAS: string[] = [
  "Da juicios solo después de ver los pros y los contras.",
  "Generalmente lleva a cabo encargos rápida y sistemáticamente.",
  "Siento que debo mejorar mi ortografía y pensar en más palabras claves cuando estoy redactando un documento.",
  "Siempre tomo la opción que más me conviene aunque, esta pueda afectar a otros.",
  "Toma precauciones razonables para evitar accidentes.",
  "A veces, me gusta dejar que el más inteligente del grupo haga el trabajo porque habrá menos posibilidad de error.",
  "Generalmente trato a otros como me gustaría ser tratado.",
  "Generalmente cuando he fallado, me detengo a encontrar las causas de mi error y las reconozco.",
  "Puede terminar un determinado trabajo, a pesar de ser consciente de que no está bien hecho en su totalidad.",
  "Le es fácil relajarse.",
  "Se puede adaptar rápidamente a situaciones nuevas aunque puedan ser incómodas.",
  "Suelo ser muy ingenioso en la manera de organizar mi trabajo pero generalmente nunca logro ejecutarlo.",
  "Prefiero que se cumplan mis órdenes en vez de motivar a mi grupo para lograr mis objetivos.",
  "Se propone salir de todas las tareas pendientes, así no sean urgentes.",
  "Me gusta más leer teorías que comprobarlas.",
  "Mis conocimientos son el resultado de aprender la teoría más que la práctica.",
  "Generalmente las normas nos desvían de ser más libres y espontáneos.",
  "Normalmente intento enseñar lo que he aprendido para que me reconozcan como una persona inteligente sin importar el aprendizaje de los demás.",
  "Si me piden mi opinión, es mejor guardarme mis comentarios, así yo sea consciente del error que ya había observado.",
  "Hace planes de un evento con buena anticipación y después lo lleva a cabo.",
  "Piensa que a veces habla demasiado.",
  "Es mejor no correr riesgos y elegir lo que sea más fácil para lograr lo que quiero.",
  "Es consciente cuando una situación que no es favorable en el momento, puede llegar a convertirse en un gran problema.",
  "No me preocupa llegar tarde a una reunión cuando sé que el tema inicial no me compete.",
  "Es fácil adaptarme a un grupo de trabajo y lograr conversaciones y relaciones con las personas.",
  "Siempre está dispuesto a recibir explicaciones antes de emitir cualquier juicio.",
  "Suele contar alguna novedad sólo cuando lo han descubierto.",
  "Generalmente puedo entender los momentos de tensión de mis superiores.",
  "Frecuentemente cambio de amistades, pues algunas me resultan aburridas.",
  "No me atrevo a opinar sobre un tema que conozco bien, porque seguramente hay otros que saben más que yo.",
  "Preferiría mejor seguir un grupo que guiar un grupo.",
  "Aprovecha el tiempo libre para sacar adelantes sus tareas pendientes.",
  "Cuando no entiendo un tema procuro evitarlo y pasar al siguiente porque suele ser más interesante.",
  "Suelo olvidar la información que aprendí de los cursos que he tomado, por que no he tenido la oportunidad de ponerlos en práctica.",
  "En materia de disciplina es usted más estricto que laxo (permisivo).",
  "Cuando expongo un tema que solo yo conozco, acomodo mi lenguaje sólo para impresionar a los demás.",
  "Procuro extenderme en mis explicaciones, por si acaso alguien no entiende lo que intento argumentar.",
  "Tiende a posponer las cosas, pues por lo general no tiene bastante tiempo para hacerlas.",
  "Considero que debo moderar mi lenguaje según la situación y las personas con las que esté hablando.",
  "Mis decisiones se apoyan más en los sentimientos que en la razón.",
  "Generalmente tomo acciones que permitan cubrir los errores encontrados.",
  "Considera el bien de todos los involucrados más que sus propias ventajas personales.",
  "Suelo ver las cosas desde el punto de vista de otra persona en todas las situaciones.",
  "Acepta la crítica fácilmente sin resentimiento.",
  "Frecuentemente lleva a cabo acciones, aunque sabe conscientemente que le indicaría lo contrario.",
  "A veces no me siento de humor para recibir instrucciones.",
  'El "ruido externo" rara vez interfiere con su concentración.',
  "La sensibilidad y la creatividad son propios de las personas con dotes artísticas.",
  "Busca salirse con la suya más que lograr los objetivos propuestos.",
  "Usualmente logra que sus ideas sean puestas en marcha.",
  "Usualmente quedo satisfecho cuando responden a mis preguntas, a pesar de no tener la certeza sobre la veracidad de información que recibí.",
  "No me molesta que me digan como hacer las cosas cuando estoy seguro de que las estaba haciendo bien.",
  "Siempre estoy dispuesto a ayudar a alguien a esconder sus errores.",
  "Frecuentemente guarda sus opiniones para usted mismo porque no le parecen lo suficientemente importantes para decirlas a otros.",
];

type ClaveRespuesta = [number, number, number, number, number]; // puntaje según respuesta 1..5

export type Competencia = {
  id: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string; // termina en "es", se concatena con el nivel obtenido
  preguntas: [number, number, number]; // números de pregunta 1-based
  claves: [ClaveRespuesta, ClaveRespuesta, ClaveRespuesta];
};

export const COMPETENCIAS: Competencia[] = [
  {
    id: "analisis_sintesis",
    nombre: "Análisis y síntesis",
    nombreCorto: "An. y Síntesis",
    descripcion:
      "Su capacidad para observar y evaluar una situación, argumentando sus resultados de manera específica y concreta es",
    preguntas: [1, 19, 37],
    claves: [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "planificacion_organizacion",
    nombre: "Planificación y organización",
    nombreCorto: "Planif/Org",
    descripcion:
      "Su capacidad para establecer eficazmente un orden apropiado de las actividades, programando su ejecución para alcanzar un objetivo es",
    preguntas: [2, 20, 38],
    claves: [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "comunicacion",
    nombre: "Comunicación oral y escrita",
    nombreCorto: "Comunicación",
    descripcion:
      "Su habilidad para expresar verbalmente y/o redactar ideas o hechos de manera clara, coherente y eficaz, con el fin de informar o persuadir es",
    preguntas: [3, 21, 39],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "toma_decisiones",
    nombre: "Toma de decisiones",
    nombreCorto: "Toma deci.",
    descripcion:
      "Su capacidad para seleccionar una alternativa entre varias con el objetivo de conseguir un propósito es",
    preguntas: [4, 22, 40],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "solucion_problemas",
    nombre: "Solución de problemas",
    nombreCorto: "Sol. Prob.",
    descripcion:
      "Su capacidad de identificar estrategias o alternativas que permitan evaluar situaciones conflictivas o amenazantes teniendo en cuenta las implicaciones y efectos implícitos que lo subyacen, adecuándolos a favor de la situación es",
    preguntas: [5, 23, 41],
    claves: [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "trabajo_equipo",
    nombre: "Trabajo en equipo",
    nombreCorto: "Trab. Equipo",
    descripcion:
      "Su capacidad para trabajar de manera coordinada y participativa con un grupo de personas, para la consecución de objetivos comunes es",
    preguntas: [6, 24, 42],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "relaciones_interpersonales",
    nombre: "Relaciones interpersonales",
    nombreCorto: "Rel. Interp.",
    descripcion:
      "Su capacidad para establecer y mantener contactos personales que permitan un adecuado intercambio de opiniones, intereses y necesidades, durante la realización de cualquier actividad es",
    preguntas: [7, 25, 43],
    claves: [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "critica_autocritica",
    nombre: "Crítica y autocrítica",
    nombreCorto: "Crít. y Auto.",
    descripcion:
      "Su capacidad para ser imparcial con las opiniones o juicios que se hacen de su propio trabajo o el de los demás es",
    preguntas: [8, 26, 44],
    claves: [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "integridad",
    nombre: "Integridad",
    nombreCorto: "Integridad",
    descripcion: "Su capacidad para cumplir con honestidad y rectitud los deberes de un cargo o posición es",
    preguntas: [9, 27, 45],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "trabajo_presion",
    nombre: "Trabajo bajo presión",
    nombreCorto: "Trab. Presión",
    descripcion:
      "Su capacidad para mantener la calma en situaciones de apremio o tensión en el trabajo y sin descuidar su precisión es",
    preguntas: [10, 28, 46],
    claves: [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "adaptabilidad",
    nombre: "Adaptación",
    nombreCorto: "Adaptación",
    descripcion:
      "Su capacidad para permanecer eficaz dentro de un entorno cambiante, como a la hora de enfrentarse con nuevas tareas, responsabilidades o personas, modificando su comportamiento hacia estos si es necesario, es",
    preguntas: [11, 29, 47],
    claves: [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "creatividad",
    nombre: "Creatividad",
    nombreCorto: "Creatividad",
    descripcion: "Su habilidad para presentar recursos, ideas y métodos novedosos y concretarlos en acciones es",
    preguntas: [12, 30, 48],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "liderazgo",
    nombre: "Liderazgo",
    nombreCorto: "Liderazgo",
    descripcion:
      "Su capacidad para motivar y dirigir a otras personas al logro de los objetivos tanto del trabajo como de la empresa es",
    preguntas: [13, 31, 49],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "iniciativa",
    nombre: "Iniciativa",
    nombreCorto: "Iniciativa",
    descripcion: "Su capacidad para impulsar una idea que permita adelantar y llevar a cabo una tarea es",
    preguntas: [14, 32, 50],
    claves: [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "busqueda_informacion",
    nombre: "Búsqueda de información",
    nombreCorto: "Búsq. Info.",
    descripcion:
      "Su capacidad para indagar y explorar un tema particular que contribuya a la obtención de nuevos conocimientos que se puedan aplicar al trabajo es",
    preguntas: [15, 33, 51],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "aprendizaje_autonomo",
    nombre: "Aprendizaje autónomo",
    nombreCorto: "Aprend. Aut.",
    descripcion:
      "Su capacidad para adquirir y asimilar nuevos conocimientos y destrezas sin necesidad de orientación o apoyo docente, y utilizarlos en la práctica laboral es",
    preguntas: [16, 34, 52],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
  },
  {
    id: "cumplimiento_normas",
    nombre: "Cumplimiento de las normas",
    nombreCorto: "Cump. Normas",
    descripcion:
      "Su capacidad de responder bajo los parámetros establecidos por la organización, asegurando la calidad del trabajo es",
    preguntas: [17, 35, 53],
    claves: [
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
    ],
  },
  {
    id: "transmision_conocimientos",
    nombre: "Transmisión de conocimientos",
    nombreCorto: "Trans. Conoc.",
    descripcion:
      "Su capacidad para exponer y explicar temas relacionados con el trabajo, que permitan desarrollar ideas que aporten al conocimiento de otros es",
    preguntas: [18, 36, 54],
    claves: [
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
      [5, 4, 3, 2, 1],
    ],
  },
];

export const PUNTAJE_REQUERIDO = 4;

export type NivelCompetencia = "Inadecuada" | "Deficiente" | "Aceptable" | "Adecuada";

export function nivelCompetencia(puntaje: number): NivelCompetencia {
  if (puntaje >= 1 && puntaje <= 2) return "Inadecuada";
  if (puntaje > 2 && puntaje <= 3) return "Deficiente";
  if (puntaje > 3 && puntaje <= 4) return "Aceptable";
  return "Adecuada";
}

export function colorNivel(nivel: NivelCompetencia): string {
  switch (nivel) {
    case "Inadecuada":
      return "#EF4444";
    case "Deficiente":
      return "#F59E0B";
    case "Aceptable":
      return "#2563EB";
    case "Adecuada":
      return "#22C55E";
  }
}

// --- Test (una aplicación del cuestionario a una persona) ---

export type TestHabilidades = {
  id: string;
  nombre: string;
  cargo: string;
  edad: string;
  profesion: string;
  sexo: "M" | "F" | "";
  evaluador: string;
  fecha: string;
  respuestas: Record<number, number>; // pregunta (1-54) -> respuesta (1-5)
  puntajeRequerido: number; // 1-5, varía según la exigencia del cargo evaluado
  observaciones: string;
  fechaCreacion: string;
};

export function testVacio(): TestHabilidades {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cargo: "",
    edad: "",
    profesion: "",
    sexo: "",
    evaluador: "",
    fecha: hoy,
    respuestas: {},
    puntajeRequerido: PUNTAJE_REQUERIDO,
    observaciones: "",
    fechaCreacion: hoy,
  };
}

export function parseTests(contenido: string): TestHabilidades[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t: TestHabilidades) => ({ ...testVacio(), ...t, respuestas: t.respuestas ?? {} }));
  } catch {
    return [];
  }
}

export function preguntasRespondidas(test: TestHabilidades): number {
  return Object.keys(test.respuestas).length;
}

export function testCompleto(test: TestHabilidades): boolean {
  return preguntasRespondidas(test) === PREGUNTAS.length;
}

export type ResultadoCompetencia = {
  competencia: Competencia;
  puntaje: number; // 0-5 (promedio de las 3 preguntas), 0 si no hay respuestas
  nivel: NivelCompetencia;
  aptoParaElCargo: boolean;
};

export function calcularCompetencia(test: TestHabilidades, competencia: Competencia): ResultadoCompetencia {
  const puntajeRequerido = test.puntajeRequerido || PUNTAJE_REQUERIDO;
  const puntajes = competencia.preguntas.map((numPregunta, idx) => {
    const respuesta = test.respuestas[numPregunta];
    if (!respuesta || respuesta < 1 || respuesta > 5) return null;
    return competencia.claves[idx][respuesta - 1];
  });
  const validos = puntajes.filter((p): p is number => p !== null);
  const puntaje = validos.length > 0 ? validos.reduce((a, b) => a + b, 0) / 3 : 0;
  const nivel = nivelCompetencia(puntaje || 1);
  return { competencia, puntaje, nivel, aptoParaElCargo: puntaje >= puntajeRequerido };
}

export type ResultadosTest = {
  porCompetencia: ResultadoCompetencia[];
  cumplimiento: number; // 0-100
  habilidadesAdecuadas: number; // de 18
  puntajeRequerido: number;
};

export function calcularResultados(test: TestHabilidades): ResultadosTest {
  const puntajeRequerido = test.puntajeRequerido || PUNTAJE_REQUERIDO;
  const porCompetencia = COMPETENCIAS.map((c) => calcularCompetencia(test, c));
  const ratios = porCompetencia.map((r) => Math.min(r.puntaje / puntajeRequerido, 1));
  const cumplimiento = ratios.length > 0 ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) : 0;
  const habilidadesAdecuadas = porCompetencia.filter((r) => r.aptoParaElCargo).length;
  return { porCompetencia, cumplimiento, habilidadesAdecuadas, puntajeRequerido };
}

export function interpretacionCompetencia(resultado: ResultadoCompetencia): string {
  const aptitud = resultado.aptoParaElCargo ? "es aceptable" : "requiere mejorarse";
  return `${resultado.competencia.descripcion} ${resultado.nivel}. La habilidad para el cargo ${aptitud}.`;
}
