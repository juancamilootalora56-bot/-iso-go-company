// Test de Juicio Situacional (SJT) Comercial con Clasificación por
// Arquetipos — para evaluar candidatos a puestos de ventas B2B o
// consultivas. Cada uno de los 10 escenarios ofrece 4 opciones: una refleja
// la inclinación natural del "Cazador / Hunter", otra del "Cultivador /
// Farmer", otra del "Cerrador / Closer", y una cuarta es una respuesta de
// riesgo/inadecuada para la toma de decisiones comerciales.

export type ArquetipoComercial = "hunter" | "farmer" | "closer";
export type TipoOpcion = ArquetipoComercial | "riesgo";

export const ARQUETIPOS: Record<ArquetipoComercial, { label: string; descripcion: string; color: string }> = {
  hunter: {
    label: "Cazador / Hunter",
    descripcion: "Enfoque en prospección, apertura de nuevos mercados y velocidad de cierre.",
    color: "#F97316",
  },
  farmer: {
    label: "Cultivador / Farmer",
    descripcion: "Enfoque en fidelización, gestión de cuentas clave (Key Accounts) y relaciones a largo plazo.",
    color: "#16A34A",
  },
  closer: {
    label: "Cerrador / Closer",
    descripcion: "Enfoque en negociaciones complejas, manejo avanzado de objeciones y destrabe de contratos.",
    color: "#2563EB",
  },
};

export type OpcionEscenario = { id: string; texto: string; tipo: TipoOpcion };
export type EscenarioSJT = { id: number; titulo: string; contexto: string; opciones: OpcionEscenario[] };

export const ESCENARIOS: EscenarioSJT[] = [
  {
    id: 1,
    titulo: "Objeción agresiva de precio frente a la competencia",
    contexto:
      "Estás en la etapa final de negociación con un prospecto corporativo. En la videollamada te dice: \"Ya tengo una cotización de su competidor que es 20% más barata. Si no bajan el precio ahora, cerramos con ellos esta semana.\"",
    opciones: [
      { id: "a", texto: "Igualás el precio del competidor de inmediato, sin consultar márgenes, para no perder el negocio en el momento.", tipo: "riesgo" },
      { id: "b", texto: "Reencuadrás la conversación hacia el costo total de propiedad y el riesgo de cambio de proveedor, destrabando las objeciones de precio una por una antes de volver a hablar de números.", tipo: "closer" },
      { id: "c", texto: "Ofrecés cerrar hoy mismo con una condición especial de cierre inmediato, priorizando asegurar la venta antes de que el prospecto siga comparando.", tipo: "hunter" },
      { id: "d", texto: "Proponés una reunión para entender a fondo qué otros servicios de valor agregado podés ofrecerle a largo plazo que la competencia no tiene.", tipo: "farmer" },
    ],
  },
  {
    id: 2,
    titulo: "Cliente clave insatisfecho, a punto de cancelar",
    contexto:
      "Un cliente de cuenta clave te llama molesto: el producto falló por segunda vez este trimestre y amenaza con no renovar el contrato anual que vence en 30 días.",
    opciones: [
      { id: "a", texto: "Le decís que vas a escalar el problema a soporte técnico y que lo van a contactar en los próximos días.", tipo: "riesgo" },
      { id: "b", texto: "Agendás una visita presencial con el equipo técnico para auditar la causa raíz y construir junto a él un plan de mejora continua documentado.", tipo: "farmer" },
      { id: "c", texto: "Negociás en esa misma llamada una compensación concreta (crédito o extensión de garantía) a cambio de que no cancele, cerrando el conflicto ahí mismo.", tipo: "closer" },
      { id: "d", texto: "Aprovechás la llamada para ofrecerle un producto adicional con descuento, buscando abrir una nueva línea de ingresos en la cuenta.", tipo: "hunter" },
    ],
  },
  {
    id: 3,
    titulo: "Negociación estancada con el área de Compras",
    contexto:
      "Llevás tres meses negociando un contrato grande. El área de Compras del cliente exige condiciones de pago a 90 días y una cláusula de penalidad que tu empresa normalmente no acepta. El proceso está trabado.",
    opciones: [
      { id: "a", texto: "Aceptás las condiciones tal cual las pide Compras para destrabar el contrato antes de que se enfríe.", tipo: "riesgo" },
      { id: "b", texto: "Armás una contrapropuesta estructurada (plazos escalonados, tope a la penalidad) y agendás una reunión conjunta con Compras y el sponsor del proyecto para negociarla punto por punto.", tipo: "closer" },
      { id: "c", texto: "Buscás otro interlocutor dentro de la misma empresa para abrir una segunda vía de entrada mientras se resuelve el trabamiento con Compras.", tipo: "hunter" },
      { id: "d", texto: "Proponés empezar con un contrato piloto más chico para generar confianza y negociar las condiciones completas en la renovación.", tipo: "farmer" },
    ],
  },
  {
    id: 4,
    titulo: "Prospecto frío que no responde",
    contexto:
      "Identificaste una empresa con alto potencial para tu producto, pero llevás cuatro intentos de contacto (llamadas y correos) sin respuesta del decisor.",
    opciones: [
      { id: "a", texto: "Dejás de insistir y pasás directamente a otro prospecto, asumiendo que esta cuenta no está interesada.", tipo: "riesgo" },
      { id: "b", texto: "Cambiás el canal y el ángulo de abordaje (ej. un mensaje directo con un caso de éxito de su mismo sector) para abrir una puerta distinta a la misma cuenta.", tipo: "hunter" },
      { id: "c", texto: "Buscás un contacto de más bajo nivel dentro de la empresa para construir una relación progresiva que eventualmente te lleve al decisor.", tipo: "farmer" },
      { id: "d", texto: "Preparás una propuesta de valor muy específica anticipando las objeciones típicas de ese sector, para tener lista una negociación sólida en el primer contacto real.", tipo: "closer" },
    ],
  },
  {
    id: 5,
    titulo: "Oportunidad de upsell en cliente actual",
    contexto:
      "Un cliente con el que trabajás hace dos años te comenta, casi de paso, que están evaluando ampliar sus operaciones a una nueva planta.",
    opciones: [
      { id: "a", texto: "Anotás el dato pero no hacés nada hasta que el cliente te pida formalmente una cotización.", tipo: "riesgo" },
      { id: "b", texto: "Profundizás en la conversación para entender el proyecto completo y armás una propuesta de expansión del contrato alineada a sus plazos.", tipo: "farmer" },
      { id: "c", texto: "Aprovechás la noticia para también presentarle un producto nuevo de tu portafolio que todavía no conoce, buscando abrir esa línea en paralelo.", tipo: "hunter" },
      { id: "d", texto: "Preparás una propuesta con condiciones comerciales especiales por ampliación de volumen, lista para negociar en cuanto el proyecto se confirme.", tipo: "closer" },
    ],
  },
  {
    id: 6,
    titulo: "La competencia ofrece un bono agresivo a tu cliente",
    contexto:
      "Te entra un comentario de un cliente activo: un competidor le ofreció un descuento de bienvenida muy agresivo por migrarse, válido solo por esta semana.",
    opciones: [
      { id: "a", texto: "Le decís que esperás que la relación de largo plazo pese más que un descuento puntual, sin ofrecer nada concreto.", tipo: "riesgo" },
      { id: "b", texto: "Armás en el momento una contraoferta temporal competitiva, negociando directamente los términos para neutralizar la propuesta del competidor antes de que vence el plazo.", tipo: "closer" },
      { id: "c", texto: "Reforzás la relación recordándole los resultados conjuntos logrados hasta ahora y proponés una revisión del contrato a mediano plazo, más allá del descuento puntual.", tipo: "farmer" },
      { id: "d", texto: "Usás la señal de alerta para salir a buscar nuevos clientes similares antes de perder tiempo reteniendo a este, asumiendo que ya está decidido.", tipo: "hunter" },
    ],
  },
  {
    id: 7,
    titulo: "Contrato grande atascado en el área legal",
    contexto:
      "Un contrato de alto valor está firmado comercialmente hace semanas, pero sigue trabado en revisión legal de ambas partes por una cláusula de confidencialidad.",
    opciones: [
      { id: "a", texto: "Esperás a que los equipos legales de ambas empresas resuelvan el tema entre ellos, sin intervenir.", tipo: "riesgo" },
      { id: "b", texto: "Coordinás una llamada entre los dos equipos legales, con una propuesta de cláusula alternativa ya redactada, para destrabar el punto específico de desacuerdo.", tipo: "closer" },
      { id: "c", texto: "Mientras se resuelve, usás el tiempo para avanzar en paralelo con otras oportunidades nuevas en tu pipeline.", tipo: "hunter" },
      { id: "d", texto: "Aprovechás el tiempo de espera para seguir construyendo la relación con el sponsor del proyecto, entendiendo sus próximas necesidades.", tipo: "farmer" },
    ],
  },
  {
    id: 8,
    titulo: "Pedido de descuento por volumen fuera de política",
    contexto:
      "Un cliente de cuenta clave pide un descuento por volumen que supera lo que permite la política comercial vigente, y lo plantea como condición para seguir comprando.",
    opciones: [
      { id: "a", texto: "Le otorgás el descuento solicitado sin escalarlo internamente, para no arriesgar la relación.", tipo: "riesgo" },
      { id: "b", texto: "Armás una negociación por tramos: descuento parcial inmediato más condiciones adicionales (volumen garantizado, plazo mayor) que compensen el margen, y la escalás para aprobación.", tipo: "closer" },
      { id: "c", texto: "Le proponés en cambio sumar servicios adicionales sin costo que refuercen la relación a largo plazo, en lugar de tocar el precio.", tipo: "farmer" },
      { id: "d", texto: "Usás el pedido como excusa para ofrecerle otro producto de tu portafolio con mejor margen, cambiando el eje de la conversación.", tipo: "hunter" },
    ],
  },
  {
    id: 9,
    titulo: "Prospecto de alto potencial con ciclo de venta largo",
    contexto:
      "Identificaste una cuenta de muy alto potencial, pero su proceso de decisión interno es largo (6 a 9 meses) y tenés objetivos de cierre este trimestre.",
    opciones: [
      { id: "a", texto: "Dejás de priorizar esta cuenta porque no va a cerrar en el trimestre, y te enfocás solo en lo que cierra rápido.", tipo: "riesgo" },
      { id: "b", texto: "Mapeás a todos los decisores e influenciadores del proceso y armás un plan de acompañamiento de varios meses, sabiendo que es una inversión a largo plazo.", tipo: "farmer" },
      { id: "c", texto: "Buscás en paralelo otras cuentas similares de ciclo más corto para asegurar el objetivo del trimestre sin abandonar esta oportunidad.", tipo: "hunter" },
      { id: "d", texto: "Identificás el punto de mayor resistencia dentro del comité de decisión y armás una estrategia específica de argumentación para acelerar esa etapa puntual.", tipo: "closer" },
    ],
  },
  {
    id: 10,
    titulo: "Cliente leal, oportunidad de pedir referidos",
    contexto:
      "Un cliente de varios años te dice espontáneamente que está muy conforme con el servicio y que lo recomendaría sin dudarlo.",
    opciones: [
      { id: "a", texto: "Le agradecés el comentario y seguís la conversación sin pedirle nada concreto.", tipo: "riesgo" },
      { id: "b", texto: "Le pedís una referencia o testimonio formal, y aprovechás para preguntarle si conoce otras empresas de su sector a las que les podría interesar lo mismo.", tipo: "hunter" },
      { id: "c", texto: "Usás el momento para profundizar la relación: le propones un espacio de feedback trimestral y explorar nuevas necesidades futuras de su cuenta.", tipo: "farmer" },
      { id: "d", texto: "Aprovechás la buena predisposición para proponerle de una vez una ampliación o renovación anticipada del contrato actual.", tipo: "closer" },
    ],
  },
];

// --- Test (una aplicación a una persona) ---

export type TestSJT = {
  id: string;
  nombre: string;
  cargo: string;
  evaluador: string;
  fecha: string;
  respuestas: Record<number, string>; // escenarioId -> opcionId elegida
  finalizado: boolean;
  observaciones: string;
  fechaCreacion: string;
};

export function testVacio(): TestSJT {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cargo: "",
    evaluador: "",
    fecha: hoy,
    respuestas: {},
    finalizado: false,
    observaciones: "",
    fechaCreacion: hoy,
  };
}

export function parseTests(contenido: string): TestSJT[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t: TestSJT) => ({
      ...testVacio(),
      ...t,
      respuestas: t.respuestas ?? {},
    }));
  } catch {
    return [];
  }
}

export function totalRespondidas(test: TestSJT): number {
  return Object.keys(test.respuestas).length;
}

export function testCompleto(test: TestSJT): boolean {
  return totalRespondidas(test) === ESCENARIOS.length;
}

export function testAplicado(test: TestSJT): boolean {
  return test.finalizado;
}

// --- Calificación ---

export type ResultadosSJT = {
  puntajeHunter: number;
  puntajeFarmer: number;
  puntajeCloser: number;
  puntajeRiesgo: number;
  totalRespondidas: number;
  dominante: ArquetipoComercial | "mixto" | null;
  secundario: ArquetipoComercial | null;
  efectividad: number; // % de decisiones sin opción de riesgo
};

export function calcularResultados(test: TestSJT): ResultadosSJT {
  let puntajeHunter = 0;
  let puntajeFarmer = 0;
  let puntajeCloser = 0;
  let puntajeRiesgo = 0;

  for (const escenario of ESCENARIOS) {
    const opcionId = test.respuestas[escenario.id];
    if (!opcionId) continue;
    const opcion = escenario.opciones.find((o) => o.id === opcionId);
    if (!opcion) continue;
    if (opcion.tipo === "hunter") puntajeHunter++;
    else if (opcion.tipo === "farmer") puntajeFarmer++;
    else if (opcion.tipo === "closer") puntajeCloser++;
    else puntajeRiesgo++;
  }

  const total = totalRespondidas(test);
  const puntajes: [ArquetipoComercial, number][] = [
    ["hunter", puntajeHunter],
    ["farmer", puntajeFarmer],
    ["closer", puntajeCloser],
  ];
  puntajes.sort((a, b) => b[1] - a[1]);

  let dominante: ArquetipoComercial | "mixto" | null = null;
  let secundario: ArquetipoComercial | null = null;
  if (total > 0) {
    const [top1, top2] = puntajes;
    dominante = top1[1] > 0 && top1[1] === top2[1] ? "mixto" : top1[0];
    secundario = top2[1] > 0 ? top2[0] : null;
  }

  const efectividad = total > 0 ? ((total - puntajeRiesgo) / total) * 100 : 0;

  return {
    puntajeHunter,
    puntajeFarmer,
    puntajeCloser,
    puntajeRiesgo,
    totalRespondidas: total,
    dominante,
    secundario,
    efectividad,
  };
}

export function colorArquetipo(a: ArquetipoComercial | "mixto" | null): string {
  if (a === "hunter") return ARQUETIPOS.hunter.color;
  if (a === "farmer") return ARQUETIPOS.farmer.color;
  if (a === "closer") return ARQUETIPOS.closer.color;
  if (a === "mixto") return "#6B7280";
  return "#9CA3AF";
}

export function labelArquetipo(a: ArquetipoComercial | "mixto" | null): string {
  if (a === "hunter") return ARQUETIPOS.hunter.label;
  if (a === "farmer") return ARQUETIPOS.farmer.label;
  if (a === "closer") return ARQUETIPOS.closer.label;
  if (a === "mixto") return "Perfil mixto";
  return "Sin datos";
}

export function interpretacionArquetipo(a: ArquetipoComercial | "mixto" | null): string {
  switch (a) {
    case "hunter":
      return "Perfil con marcada inclinación a la prospección y la apertura de nuevas cuentas. Tiende a priorizar la velocidad de cierre y la generación constante de nuevas oportunidades. Es un perfil ideal para roles de desarrollo de nuevo negocio, expansión territorial o apertura de mercados, donde el volumen de prospección y la capacidad de generar pipeline nuevo son críticos. Requiere procesos claros de traspaso de cuentas a un equipo de gestión una vez cerrado el negocio, ya que el seguimiento de largo plazo no es su fortaleza natural.";
    case "farmer":
      return "Perfil orientado a la construcción de relaciones de largo plazo y la fidelización de cuentas existentes. Prioriza la comprensión profunda de las necesidades del cliente y la generación de confianza sostenida en el tiempo. Es ideal para roles de Key Account Management, postventa estratégica o gestión de cuentas de alto valor, donde la retención y el crecimiento orgánico de la cuenta son el objetivo principal. Puede requerir acompañamiento en situaciones de negociación agresiva o de cierre bajo presión.";
    case "closer":
      return "Perfil con fuerte orientación a la negociación compleja y el manejo de objeciones. Tiende a tomar control activo en situaciones de conflicto comercial, trabando negociaciones o decisiones estancadas, y busca destrabar activamente los puntos de fricción. Es ideal para roles de negociación de contratos de alto valor, recuperación de cuentas en riesgo o cierre de oportunidades complejas con múltiples interlocutores. Conviene combinarlo con un perfil Farmer en el seguimiento posterior al cierre, para asegurar la continuidad de la relación.";
    case "mixto":
      return "El candidato no muestra una inclinación dominante clara entre los tres arquetipos, sino una distribución equilibrada de respuestas entre al menos dos de ellos. Esto puede indicar versatilidad conductual (capacidad de adaptar el enfoque según la situación) o, alternativamente, falta de un criterio comercial consolidado. Se recomienda profundizar con una entrevista por competencias para distinguir entre ambos escenarios antes de asignar el rol.";
    default:
      return "Sin respuestas suficientes para determinar un perfil.";
  }
}

export function interpretacionEfectividad(pct: number): string {
  if (pct >= 90) {
    return "Toma de decisiones comerciales de alta efectividad: evita de forma consistente las respuestas de riesgo (pasividad, concesiones sin análisis, falta de seguimiento) frente a situaciones de presión.";
  }
  if (pct >= 70) {
    return "Toma de decisiones comerciales efectiva, con algunas respuestas de riesgo puntuales. Se recomienda reforzar criterio comercial en escenarios de alta presión (objeciones de precio, clientes en riesgo de cancelación).";
  }
  return "Tendencia relevante a respuestas de riesgo (pasividad, concesiones sin respaldo, falta de seguimiento) frente a situaciones comerciales complejas. No se recomienda para roles de alta exposición sin acompañamiento y entrenamiento adicional.";
}
