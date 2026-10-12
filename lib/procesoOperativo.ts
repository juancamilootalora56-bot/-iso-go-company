// Diagrama de Proceso de Operaciones (OPC) — paso a paso de fabricación,
// basado en los símbolos estándar de ingeniería industrial (ASME),
// con analítica de valor agregado (Lean) y costeo de producción.

export type RecursoPaso = {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number; // opcional, 0 si no se carga
};

export type PasoProceso = {
  id: string;
  orden: number;
  nombre: string;
  tipo: string; // ver TIPOS_PASO
  tiempo: number;
  unidadTiempo: "min" | "hrs";
  valorAgregado: boolean;
  responsable: string;
  materiasPrimas: RecursoPaso[];
  maquinarias: RecursoPaso[];
  materiales: RecursoPaso[];
  insumos: RecursoPaso[];
  observaciones: string;
};

export type InfoTipoPaso = {
  tipo: string;
  simbolo: string;
  color: string;
  descripcion: string;
};

export const TIPOS_PASO: InfoTipoPaso[] = [
  { tipo: "Operación", simbolo: "●", color: "#3B82F6", descripcion: "Se transforma, ensambla o modifica el producto." },
  { tipo: "Transporte", simbolo: "→", color: "#F5A623", descripcion: "Se traslada el producto, material o persona de un lugar a otro." },
  { tipo: "Inspección", simbolo: "■", color: "#8B5CF6", descripcion: "Se verifica calidad, cantidad o conformidad sin transformar." },
  { tipo: "Demora", simbolo: "D", color: "#EF4444", descripcion: "Espera antes de continuar (secado, curado, fraguado, enfriamiento)." },
  { tipo: "Almacenaje", simbolo: "▽", color: "#6B7280", descripcion: "Se guarda el producto o materia prima bajo control." },
  { tipo: "Combinado", simbolo: "◆", color: "#EC4899", descripcion: "Operación e inspección realizadas de forma simultánea." },
];

export function infoTipoPaso(tipo: string): InfoTipoPaso {
  return TIPOS_PASO.find((t) => t.tipo === tipo) ?? TIPOS_PASO[0];
}

export function colorTipoPaso(tipo: string): string {
  return infoTipoPaso(tipo).color;
}

export function simboloTipoPaso(tipo: string): string {
  return infoTipoPaso(tipo).simbolo;
}

export function recursoVacio(): RecursoPaso {
  return { id: crypto.randomUUID(), nombre: "", cantidad: 1, unidad: "", costoUnitario: 0 };
}

export function pasoVacio(orden: number): PasoProceso {
  return {
    id: crypto.randomUUID(),
    orden,
    nombre: "",
    tipo: "Operación",
    tiempo: 0,
    unidadTiempo: "min",
    valorAgregado: true,
    responsable: "",
    materiasPrimas: [],
    maquinarias: [],
    materiales: [],
    insumos: [],
    observaciones: "",
  };
}

export function parsePasos(contenido: string): PasoProceso[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function tiempoEnMinutos(paso: PasoProceso): number {
  return paso.unidadTiempo === "hrs" ? paso.tiempo * 60 : paso.tiempo;
}

export function tiempoTotalProceso(pasos: PasoProceso[]): number {
  return pasos.reduce((acc, p) => acc + tiempoEnMinutos(p), 0);
}

export function tiempoValorAgregado(pasos: PasoProceso[]): number {
  return pasos.filter((p) => p.valorAgregado).reduce((acc, p) => acc + tiempoEnMinutos(p), 0);
}

export function tiempoNoValorAgregado(pasos: PasoProceso[]): number {
  return pasos.filter((p) => !p.valorAgregado).reduce((acc, p) => acc + tiempoEnMinutos(p), 0);
}

export function pctValorAgregado(pasos: PasoProceso[]): number | null {
  const total = tiempoTotalProceso(pasos);
  if (!total) return null;
  return Math.round((tiempoValorAgregado(pasos) / total) * 100);
}

export function formatoTiempo(minutos: number): string {
  if (!minutos) return "0 min";
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const mins = Math.round(minutos % 60);
  const partes: string[] = [];
  if (dias > 0) partes.push(`${dias}d`);
  if (horas > 0) partes.push(`${horas}h`);
  if (mins > 0 || partes.length === 0) partes.push(`${mins}min`);
  return partes.join(" ");
}

export function costoRecursos(recursos: RecursoPaso[]): number {
  return recursos.reduce((acc, r) => acc + (r.cantidad || 0) * (r.costoUnitario || 0), 0);
}

export function costoPaso(paso: PasoProceso): number {
  return (
    costoRecursos(paso.materiasPrimas) +
    costoRecursos(paso.maquinarias) +
    costoRecursos(paso.materiales) +
    costoRecursos(paso.insumos)
  );
}

export function costoTotalProceso(pasos: PasoProceso[]): number {
  return pasos.reduce((acc, p) => acc + costoPaso(p), 0);
}

export function formatoMonto(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

export function resumenPorTipo(pasos: PasoProceso[]): { tipo: string; simbolo: string; color: string; cantidad: number; tiempoMin: number }[] {
  return TIPOS_PASO.map((t) => {
    const delTipo = pasos.filter((p) => p.tipo === t.tipo);
    return {
      tipo: t.tipo,
      simbolo: t.simbolo,
      color: t.color,
      cantidad: delTipo.length,
      tiempoMin: delTipo.reduce((acc, p) => acc + tiempoEnMinutos(p), 0),
    };
  }).filter((r) => r.cantidad > 0);
}

export function pasoMasLargo(pasos: PasoProceso[]): PasoProceso | null {
  if (pasos.length === 0) return null;
  return pasos.reduce((max, p) => (tiempoEnMinutos(p) > tiempoEnMinutos(max) ? p : max), pasos[0]);
}

export function reordenar(pasos: PasoProceso[], id: string, direccion: "arriba" | "abajo"): PasoProceso[] {
  const ordenados = [...pasos].sort((a, b) => a.orden - b.orden);
  const idx = ordenados.findIndex((p) => p.id === id);
  const destino = direccion === "arriba" ? idx - 1 : idx + 1;
  if (idx === -1 || destino < 0 || destino >= ordenados.length) return pasos;
  [ordenados[idx], ordenados[destino]] = [ordenados[destino], ordenados[idx]];
  return ordenados.map((p, i) => ({ ...p, orden: i + 1 }));
}

export function contarRecursos(paso: PasoProceso): number {
  return paso.materiasPrimas.length + paso.maquinarias.length + paso.materiales.length + paso.insumos.length;
}
