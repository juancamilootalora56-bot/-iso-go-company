// Seguimiento de ventas: metas por período, registro de ventas y cumplimiento.

export type Venta = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string; // YYYY-MM-DD
  concepto: string;
  monto: number;
  moneda: string;
  observaciones: string;
};

export type MetaVenta = {
  id: string;
  periodo: string; // YYYY-MM
  monto: number;
  moneda: string;
};

export const MONEDAS_VENTA = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export function periodoDe(fecha: string): string {
  return (fecha || "").slice(0, 7);
}

export function periodoActual(): string {
  return new Date().toISOString().slice(0, 7);
}

export function etiquetaPeriodo(periodo: string): string {
  if (!periodo) return "—";
  try {
    return new Date(periodo + "-01T00:00:00").toLocaleDateString("es", { month: "long", year: "numeric" });
  } catch {
    return periodo;
  }
}

export function ventaVacia(): Venta {
  return {
    id: crypto.randomUUID(),
    clienteId: "",
    clienteNombre: "",
    fecha: new Date().toISOString().slice(0, 10),
    concepto: "",
    monto: 0,
    moneda: "Guaraníes (PYG)",
    observaciones: "",
  };
}

export function metaVacia(periodo?: string): MetaVenta {
  return {
    id: crypto.randomUUID(),
    periodo: periodo || periodoActual(),
    monto: 0,
    moneda: "Guaraníes (PYG)",
  };
}

export function parseVentas(contenido: string): Venta[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseMetas(contenido: string): MetaVenta[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatoMonto(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

export function totalPeriodo(ventas: Venta[], periodo: string): number {
  return ventas.filter((v) => periodoDe(v.fecha) === periodo).reduce((acc, v) => acc + (v.monto || 0), 0);
}

export function metaDe(metas: MetaVenta[], periodo: string): MetaVenta | undefined {
  return metas.find((m) => m.periodo === periodo);
}

export function cumplimiento(total: number, meta: number): number | null {
  if (!meta) return null;
  return Math.round((total / meta) * 100);
}

export function colorCumplimiento(pct: number | null): string {
  if (pct === null) return "#9CA3AF";
  if (pct >= 100) return "#22C55E";
  if (pct >= 70) return "#F5A623";
  return "#EF4444";
}

export function ticketPromedio(ventas: Venta[], periodo?: string): number | null {
  const filtradas = periodo ? ventas.filter((v) => periodoDe(v.fecha) === periodo) : ventas;
  if (filtradas.length === 0) return null;
  const total = filtradas.reduce((acc, v) => acc + (v.monto || 0), 0);
  return Math.round(total / filtradas.length);
}

export function periodosConDatos(ventas: Venta[], metas: MetaVenta[]): string[] {
  const set = new Set<string>();
  ventas.forEach((v) => set.add(periodoDe(v.fecha)));
  metas.forEach((m) => set.add(m.periodo));
  return Array.from(set)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
}

export function topClientes(ventas: Venta[], periodo?: string, limite = 5): { clienteId: string; clienteNombre: string; total: number; cantidad: number }[] {
  const filtradas = periodo ? ventas.filter((v) => periodoDe(v.fecha) === periodo) : ventas;
  const mapa = new Map<string, { clienteId: string; clienteNombre: string; total: number; cantidad: number }>();
  filtradas.forEach((v) => {
    const actual = mapa.get(v.clienteId) ?? { clienteId: v.clienteId, clienteNombre: v.clienteNombre, total: 0, cantidad: 0 };
    actual.total += v.monto || 0;
    actual.cantidad += 1;
    mapa.set(v.clienteId, actual);
  });
  return Array.from(mapa.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}
