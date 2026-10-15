// Caracterización de Procesos — ISO 9001:2015, cláusula 4.4 (enfoque a procesos).
// Modelo tipo SIPOC (Proveedores-Entradas-Proceso-Salidas-Clientes) + ciclo PHVA,
// un registro por proceso del Mapa de Procesos.

export type ItemLista = { id: string; texto: string };

export function itemVacio(texto = ""): ItemLista {
  return { id: crypto.randomUUID(), texto };
}

export type IndicadorProceso = {
  id: string;
  nombre: string;
  formula: string;
  meta: string;
  frecuencia: string;
  responsable: string;
};

export function indicadorVacio(): IndicadorProceso {
  return { id: crypto.randomUUID(), nombre: "", formula: "", meta: "", frecuencia: "Mensual", responsable: "" };
}

export const FRECUENCIAS_INDICADOR = ["Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"] as const;

export type CaracterizacionProceso = {
  id: string;
  proceso: string; // nombre del proceso (clave, viene del Mapa de Procesos)
  categoriaProceso: string; // estrategicos | misionales | apoyo | ""

  codigo: string;
  version: string;
  fechaVigencia: string;
  responsable: string;

  objetivo: string;
  alcance: string;

  // SIPOC
  proveedores: ItemLista[];
  entradas: ItemLista[];
  actividades: ItemLista[]; // sub-pasos clave del proceso
  salidas: ItemLista[];
  clientes: ItemLista[];

  // PHVA
  planificar: string; // qué se planifica (recursos, metas)
  hacer: string; // cómo se ejecuta (resumen, complementa actividades)
  verificar: string; // cómo se verifica (controles, supervisión)
  actuar: string; // mejora continua / acciones correctivas

  // Recursos
  recursosHumanos: string;
  recursosInfraestructura: string;
  recursosAmbiente: string;

  indicadores: IndicadorProceso[];
  riesgos: ItemLista[];
  normatividad: ItemLista[];

  observaciones: string;
  fechaAlta: string;
};

export function caracterizacionVacia(proceso: string, categoriaProceso: string, codigo: string): CaracterizacionProceso {
  return {
    id: crypto.randomUUID(),
    proceso,
    categoriaProceso,
    codigo,
    version: "01",
    fechaVigencia: "",
    responsable: "",
    objetivo: "",
    alcance: "",
    proveedores: [],
    entradas: [],
    actividades: [],
    salidas: [],
    clientes: [],
    planificar: "",
    hacer: "",
    verificar: "",
    actuar: "",
    recursosHumanos: "",
    recursosInfraestructura: "",
    recursosAmbiente: "",
    indicadores: [],
    riesgos: [],
    normatividad: [],
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function siguienteCodigo(numerosUsados: number[]): string {
  const siguiente = (numerosUsados.length > 0 ? Math.max(...numerosUsados) : 0) + 1;
  return `CP-${String(siguiente).padStart(4, "0")}`;
}

export function numeroDeCodigo(codigo: string): number {
  const m = codigo.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function parseCaracterizaciones(contenido: string): CaracterizacionProceso[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: CaracterizacionProceso) => ({
      ...caracterizacionVacia(c.proceso ?? "", c.categoriaProceso ?? "", c.codigo ?? ""),
      ...c,
    }));
  } catch {
    return [];
  }
}

export function completitud(c: CaracterizacionProceso): number {
  const campos = [
    c.objetivo,
    c.alcance,
    c.responsable,
    c.proveedores.length > 0 ? "x" : "",
    c.entradas.length > 0 ? "x" : "",
    c.actividades.length > 0 ? "x" : "",
    c.salidas.length > 0 ? "x" : "",
    c.clientes.length > 0 ? "x" : "",
    c.planificar,
    c.hacer,
    c.verificar,
    c.actuar,
    c.recursosHumanos,
    c.indicadores.length > 0 ? "x" : "",
  ];
  const llenos = campos.filter((v) => v && v.trim().length > 0).length;
  return Math.round((llenos / campos.length) * 100);
}
