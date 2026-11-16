// Test de Atención, Concentración y Discriminación de Detalles — estilo
// Toulouse-Piéron / d2 de Brickenkamp. El objetivo es la letra "d" con
// exactamente 2 marcas (arriba + abajo combinadas); todo lo demás (la "p" en
// cualquier combinación, o la "d" con 0, 1, 3 o 4 marcas) es distractor.
// Orientado a puestos que exigen precisión: control de calidad, contabilidad,
// operación de maquinaria.

export type Letra = "d" | "p";

export type ItemAtencion = {
  id: number;
  letra: Letra;
  marcasArriba: 0 | 1 | 2;
  marcasAbajo: 0 | 1 | 2;
  esObjetivo: boolean;
};

export const FILAS = 10;
export const COLUMNAS = 20;
export const TOTAL_ITEMS = FILAS * COLUMNAS;

export const DURACIONES_MINUTOS = [3, 4, 5] as const;
export type DuracionMinutos = (typeof DURACIONES_MINUTOS)[number];
export const DURACION_DEFECTO: DuracionMinutos = 4;

function aleatorio02(): 0 | 1 | 2 {
  const v = Math.floor(Math.random() * 3);
  return v as 0 | 1 | 2;
}

// ~30% de los ítems se fuerzan a ser objetivo para que la prueba tenga una
// densidad de blancos razonable (si se generaran todas las combinaciones de
// manera uniforme, el objetivo exacto saldría solo ~1 de cada 6 ítems).
function generarItem(id: number): ItemAtencion {
  const esObjetivo = Math.random() < 0.3;

  if (esObjetivo) {
    const combos: [0 | 1 | 2, 0 | 1 | 2][] = [
      [2, 0],
      [1, 1],
      [0, 2],
    ];
    const [arriba, abajo] = combos[Math.floor(Math.random() * combos.length)];
    return { id, letra: "d", marcasArriba: arriba, marcasAbajo: abajo, esObjetivo: true };
  }

  let letra: Letra;
  let arriba: 0 | 1 | 2;
  let abajo: 0 | 1 | 2;
  do {
    letra = Math.random() < 0.5 ? "d" : "p";
    arriba = aleatorio02();
    abajo = aleatorio02();
  } while (letra === "d" && arriba + abajo === 2);

  return { id, letra, marcasArriba: arriba, marcasAbajo: abajo, esObjetivo: false };
}

export function generarGrilla(): ItemAtencion[] {
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => generarItem(i));
}

// --- Test (una aplicación a una persona) ---

export type TestAtencion = {
  id: string;
  nombre: string;
  cargo: string;
  edad: string;
  profesion: string;
  sexo: "M" | "F" | "";
  evaluador: string;
  fecha: string;
  duracionMinutos: DuracionMinutos;
  grilla: ItemAtencion[];
  marcadas: number[]; // ids de ítems marcados por el evaluado
  iniciadoEn: string | null; // ISO, se fija al presionar "Comenzar"
  finalizado: boolean;
  observaciones: string;
  fechaCreacion: string;
};

export function testVacio(): TestAtencion {
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
    duracionMinutos: DURACION_DEFECTO,
    grilla: generarGrilla(),
    marcadas: [],
    iniciadoEn: null,
    finalizado: false,
    observaciones: "",
    fechaCreacion: hoy,
  };
}

export function parseTests(contenido: string): TestAtencion[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t: TestAtencion) => ({
      ...testVacio(),
      ...t,
      grilla: Array.isArray(t.grilla) && t.grilla.length > 0 ? t.grilla : generarGrilla(),
      marcadas: t.marcadas ?? [],
    }));
  } catch {
    return [];
  }
}

export function deadlineMs(test: TestAtencion): number | null {
  if (!test.iniciadoEn) return null;
  return new Date(test.iniciadoEn).getTime() + test.duracionMinutos * 60_000;
}

export function tiempoAgotado(test: TestAtencion): boolean {
  const dl = deadlineMs(test);
  if (dl === null) return false;
  return Date.now() >= dl;
}

export function testAplicado(test: TestAtencion): boolean {
  return test.finalizado || tiempoAgotado(test);
}

// --- Calificación ---

export type NivelAtencion = "Alto" | "Medio" | "Bajo";

export type ResultadosAtencion = {
  totalObjetivos: number;
  aciertos: number; // TA
  omisiones: number; // O
  comisiones: number; // C
  erroresTotales: number; // E = O + C
  totalRespuestas: number; // TR = TA + C
  concentracion: number; // CON = TA - C
  precision: number; // % de objetivos correctamente marcados
  tasaComision: number; // % de respuestas que fueron error
  velocidad: number; // respuestas por minuto
  nivel: NivelAtencion;
};

export function calcularResultados(test: TestAtencion): ResultadosAtencion {
  const objetivos = test.grilla.filter((i) => i.esObjetivo);
  const objetivoIds = new Set(objetivos.map((i) => i.id));
  const marcadasSet = new Set(test.marcadas);

  const aciertos = objetivos.filter((i) => marcadasSet.has(i.id)).length;
  const omisiones = objetivos.length - aciertos;
  const comisiones = test.marcadas.filter((id) => !objetivoIds.has(id)).length;
  const erroresTotales = omisiones + comisiones;
  const totalRespuestas = aciertos + comisiones;
  const concentracion = aciertos - comisiones;
  const precision = objetivos.length > 0 ? (aciertos / objetivos.length) * 100 : 0;
  const tasaComision = totalRespuestas > 0 ? (comisiones / totalRespuestas) * 100 : 0;
  const velocidad = test.duracionMinutos > 0 ? totalRespuestas / test.duracionMinutos : 0;

  const ratioConcentracion = objetivos.length > 0 ? concentracion / objetivos.length : 0;
  let nivel: NivelAtencion;
  if (ratioConcentracion >= 0.85 && tasaComision <= 10) {
    nivel = "Alto";
  } else if (ratioConcentracion >= 0.55) {
    nivel = "Medio";
  } else {
    nivel = "Bajo";
  }

  return {
    totalObjetivos: objetivos.length,
    aciertos,
    omisiones,
    comisiones,
    erroresTotales,
    totalRespuestas,
    concentracion,
    precision,
    tasaComision,
    velocidad,
    nivel,
  };
}

export function colorNivelAtencion(nivel: NivelAtencion): string {
  switch (nivel) {
    case "Alto":
      return "#22C55E";
    case "Medio":
      return "#F59E0B";
    case "Bajo":
      return "#EF4444";
  }
}

export function interpretacionNivel(nivel: NivelAtencion): string {
  switch (nivel) {
    case "Alto":
      return "Mantiene un nivel de atención sostenida y discriminación de detalles muy alto, con bajo nivel de impulsividad (pocos errores por comisión). Es compatible con puestos que exigen alta precisión sostenida en el tiempo, como control de calidad, contabilidad u operación de maquinaria.";
    case "Medio":
      return "Mantiene un nivel de atención y discriminación de detalles aceptable, aunque con una proporción de errores (por fatiga o impulsividad) a tener en cuenta. Para puestos de alta precisión se recomienda complementar con una entrevista por competencias o un período de inducción supervisado.";
    case "Bajo":
      return "Presenta dificultades para sostener la atención y discriminar detalles similares durante la prueba, con una proporción relevante de omisiones y/o comisiones. No se recomienda para puestos donde un descuido tenga consecuencias críticas de calidad o seguridad, salvo que se profundice la evaluación.";
  }
}
