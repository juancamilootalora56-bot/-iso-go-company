// Test de Personalidad Comercial basado en los principios del Inventario de
// Personalidad para Vendedores (IPV). Evalúa 3 grandes áreas con 5 ítems
// cada una, en escala Likert de 1 a 5, y clasifica la aptitud comercial
// general del candidato en Alto / Medio / Bajo.

export type AreaIPV = "dgv" | "receptividad" | "agresividad";

export const AREAS_IPV: Record<AreaIPV, { label: string; descripcion: string; color: string }> = {
  dgv: {
    label: "Disposición General para la Venta (DGV)",
    descripcion: "Motivación intrínseca por la venta, orientación a resultados y tolerancia a la incertidumbre del ingreso variable.",
    color: "#F59E0B",
  },
  receptividad: {
    label: "Receptividad",
    descripcion: "Empatía, escucha activa, orientación genuina al cliente y tolerancia a la frustración.",
    color: "#16A34A",
  },
  agresividad: {
    label: "Agresividad Comercial",
    descripcion: "Empuje, iniciativa de cierre, persuasión y ambición por superar metas.",
    color: "#DC2626",
  },
};

export type ItemIPV = { id: number; area: AreaIPV; texto: string };

// Los ítems se presentan intercalados entre las 3 áreas (no agrupados) para
// reducir el sesgo de respuesta por patrón, tal como en los inventarios
// psicométricos estandarizados.
export const ITEMS_IPV: ItemIPV[] = [
  { id: 1, area: "dgv", texto: "Disfruto genuinamente el proceso de buscar y conseguir nuevos clientes, más allá de la comisión que eso represente." },
  { id: 2, area: "receptividad", texto: "Antes de ofrecer una solución, dedico tiempo genuino a entender las necesidades reales del cliente, aunque eso alargue la conversación." },
  { id: 3, area: "agresividad", texto: "No dejo que una reunión comercial termine sin proponer explícitamente un siguiente paso concreto." },
  { id: 4, area: "dgv", texto: "Cuando un mes no alcanzo mi cuota de ventas, lo vivo como un estímulo para esforzarme más, no como un fracaso personal." },
  { id: 5, area: "receptividad", texto: "Cuando un cliente me grita o se muestra agresivo por un problema, logro mantener la calma y escuchar sin tomármelo como algo personal." },
  { id: 6, area: "agresividad", texto: "Cuando identifico una oportunidad de cierre, actúo de inmediato en lugar de esperar a que el cliente decida por su cuenta." },
  { id: 7, area: "dgv", texto: "Prefiero un trabajo donde mis ingresos dependan de mis resultados, antes que un salario fijo sin variables." },
  { id: 8, area: "receptividad", texto: "Me resulta fácil identificar cuándo un cliente no está listo para comprar y necesita más tiempo, sin presionarlo." },
  { id: 9, area: "agresividad", texto: "Me fijo metas de venta más altas que las que me exige la empresa, porque quiero superarme constantemente." },
  { id: 10, area: "dgv", texto: "Me resulta natural iniciar conversaciones comerciales con desconocidos en cualquier contexto." },
  { id: 11, area: "receptividad", texto: "Disfruto construir relaciones de confianza a largo plazo con mis clientes, incluso cuando no generan una venta inmediata." },
  { id: 12, area: "agresividad", texto: "Soy capaz de insistir varias veces con un prospecto difícil sin sentir que estoy siendo inoportuno." },
  { id: 13, area: "dgv", texto: "Considero que vender es una de las profesiones más desafiantes y gratificantes que existen." },
  { id: 14, area: "receptividad", texto: "Cuando pierdo una venta importante, puedo analizar con calma qué pasó sin frustrarme por días." },
  { id: 15, area: "agresividad", texto: "Cuando un cliente pone objeciones, las veo como una oportunidad para argumentar mejor, no como una señal para retirarme." },
];

export const ESCALA_IPV = [
  { valor: 1, label: "Totalmente en desacuerdo" },
  { valor: 2, label: "En desacuerdo" },
  { valor: 3, label: "Ni de acuerdo ni en desacuerdo" },
  { valor: 4, label: "De acuerdo" },
  { valor: 5, label: "Totalmente de acuerdo" },
] as const;

// --- Test (una aplicación a una persona) ---

export type TestIPV = {
  id: string;
  nombre: string;
  cargo: string;
  evaluador: string;
  fecha: string;
  respuestas: Record<number, number>; // itemId -> valor 1 a 5
  finalizado: boolean;
  observaciones: string;
  fechaCreacion: string;
};

export function testVacio(): TestIPV {
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

export function parseTests(contenido: string): TestIPV[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t: TestIPV) => ({
      ...testVacio(),
      ...t,
      respuestas: t.respuestas ?? {},
    }));
  } catch {
    return [];
  }
}

export function totalRespondidas(test: TestIPV): number {
  return Object.keys(test.respuestas).length;
}

export function testCompleto(test: TestIPV): boolean {
  return totalRespondidas(test) === ITEMS_IPV.length;
}

export function testAplicado(test: TestIPV): boolean {
  return test.finalizado;
}

// --- Calificación ---

export type NivelIPV = "Alto" | "Medio" | "Bajo";

export type ResultadosIPV = {
  puntajePorArea: Record<AreaIPV, number>; // 5 a 25 por área
  nivelPorArea: Record<AreaIPV, NivelIPV>;
  puntajeTotal: number; // 15 a 75
  nivelGlobal: NivelIPV;
  porcentaje: number; // % sobre el máximo posible
};

function nivelPorPuntaje(puntaje: number, max: number): NivelIPV {
  const pct = (puntaje / max) * 100;
  if (pct >= 80) return "Alto";
  if (pct >= 52) return "Medio";
  return "Bajo";
}

export function calcularResultados(test: TestIPV): ResultadosIPV {
  const puntajePorArea: Record<AreaIPV, number> = { dgv: 0, receptividad: 0, agresividad: 0 };

  for (const item of ITEMS_IPV) {
    const valor = test.respuestas[item.id] ?? 0;
    puntajePorArea[item.area] += valor;
  }

  const nivelPorArea: Record<AreaIPV, NivelIPV> = {
    dgv: nivelPorPuntaje(puntajePorArea.dgv, 25),
    receptividad: nivelPorPuntaje(puntajePorArea.receptividad, 25),
    agresividad: nivelPorPuntaje(puntajePorArea.agresividad, 25),
  };

  const puntajeTotal = puntajePorArea.dgv + puntajePorArea.receptividad + puntajePorArea.agresividad;
  const nivelGlobal = nivelPorPuntaje(puntajeTotal, 75);
  const porcentaje = (puntajeTotal / 75) * 100;

  return { puntajePorArea, nivelPorArea, puntajeTotal, nivelGlobal, porcentaje };
}

export function colorNivelIPV(nivel: NivelIPV): string {
  switch (nivel) {
    case "Alto":
      return "#22C55E";
    case "Medio":
      return "#F59E0B";
    case "Bajo":
      return "#EF4444";
  }
}

export function interpretacionArea(area: AreaIPV, nivel: NivelIPV): string {
  const textos: Record<AreaIPV, Record<NivelIPV, string>> = {
    dgv: {
      Alto: "Muestra una motivación intrínseca muy marcada hacia la venta, con alta tolerancia a la incertidumbre del ingreso variable y una visión positiva del rechazo como parte del proceso.",
      Medio: "Tiene una disposición aceptable hacia la venta, aunque puede necesitar refuerzo motivacional o esquemas de acompañamiento en períodos de bajo desempeño.",
      Bajo: "Presenta baja motivación intrínseca por la actividad comercial. Es probable que un esquema 100% variable o metas agresivas generen desgaste a mediano plazo.",
    },
    receptividad: {
      Alto: "Demuestra una fuerte orientación al cliente, con empatía genuina y buena tolerancia a la frustración frente a clientes difíciles o ventas perdidas.",
      Medio: "Tiene una capacidad de escucha y empatía razonable, aunque puede beneficiarse de entrenamiento en manejo de clientes conflictivos o situaciones de alta presión emocional.",
      Bajo: "Podría tener dificultades para sostener relaciones comerciales de largo plazo o para manejar con calma los reclamos y la frustración ante objetivos no cumplidos.",
    },
    agresividad: {
      Alto: "Tiene una marcada orientación al cierre, iniciativa propia y ambición por superar metas, características clave para ciclos de venta que exigen avanzar activamente.",
      Medio: "Tiene cierta capacidad de empuje comercial, aunque puede requerir seguimiento para sostener la proactividad de cierre en el tiempo.",
      Bajo: "Tiende a ser pasivo frente a las oportunidades de cierre y puede evitar la insistencia necesaria frente a objeciones o prospectos difíciles.",
    },
  };
  return textos[area][nivel];
}

export function interpretacionGlobal(nivel: NivelIPV): string {
  switch (nivel) {
    case "Alto":
      return "Perfil con aptitud comercial general alta: combina motivación por la venta, orientación al cliente y empuje de cierre de forma equilibrada. Es un perfil recomendable para roles comerciales de responsabilidad, incluyendo nuevo negocio y cuentas clave.";
    case "Medio":
      return "Perfil con aptitud comercial general dentro de un rango aceptable. Se recomienda revisar el detalle por área para identificar fortalezas específicas y diseñar un plan de desarrollo o acompañamiento según el rol al que aplica.";
    case "Bajo":
      return "Perfil con aptitud comercial general baja según este inventario. No se recomienda para roles 100% comerciales sin una entrevista de profundización adicional, salvo que el puesto combine venta con otras funciones donde este perfil pueda compensarse.";
  }
}
