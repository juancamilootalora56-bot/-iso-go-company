// Historial de Compras de un proveedor — registro de todo lo comprado,
// con Orden de Compra y Factura adjuntas, y verificación del producto o servicio recibido.

export type TipoCompraProveedor = "Producto" | "Servicio";
export const TIPOS_COMPRA_PROVEEDOR: TipoCompraProveedor[] = ["Producto", "Servicio"];

export const ESTADOS_COMPRA_PROVEEDOR = ["Pendiente", "En tránsito / en curso", "Recibido", "Facturado", "Pagado", "Cancelado"];

export function colorEstadoCompra(estado: string): string {
  switch (estado) {
    case "Pendiente":
      return "#9CA3AF";
    case "En tránsito / en curso":
      return "#3B82F6";
    case "Recibido":
      return "#F5A623";
    case "Facturado":
      return "#7C4DFF";
    case "Pagado":
      return "#22C55E";
    case "Cancelado":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export const MONEDAS_COMPRA_PROVEEDOR = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

// --- Verificación de lo comprado ---

export const RESULTADOS_VERIFICACION = ["Pendiente", "Conforme", "Conforme con observaciones", "No conforme"];

export function colorResultadoVerificacion(resultado: string): string {
  switch (resultado) {
    case "Conforme":
      return "#22C55E";
    case "Conforme con observaciones":
      return "#F5A623";
    case "No conforme":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export const ESTADOS_EMBALAJE = ["Bueno", "Con daños menores", "Dañado", "Incompleto"];

export type VerificacionCompra = {
  fecha: string;
  responsable: string;
  resultado: string;
  observaciones: string;
  archivoEvidencia: string | null;
  archivoEvidenciaNombre: string;
  // --- Producto ---
  cantidadRecibida: number;
  coincideConOrden: boolean;
  estadoEmbalaje: string;
  fichaTecnicaRecibida: boolean;
  certificadoCalidadRecibido: boolean;
  // --- Servicio ---
  fechaInicioServicio: string;
  fechaFinServicio: string;
  cumpleAlcanceAcordado: boolean;
  cumpleTiemposAcordados: boolean;
  satisfaccion: number; // 0-5
  informeOEvidenciaRecibida: boolean;
};

export function verificacionVacia(): VerificacionCompra {
  return {
    fecha: "",
    responsable: "",
    resultado: "Pendiente",
    observaciones: "",
    archivoEvidencia: null,
    archivoEvidenciaNombre: "",
    cantidadRecibida: 0,
    coincideConOrden: false,
    estadoEmbalaje: "Bueno",
    fichaTecnicaRecibida: false,
    certificadoCalidadRecibido: false,
    fechaInicioServicio: "",
    fechaFinServicio: "",
    cumpleAlcanceAcordado: false,
    cumpleTiemposAcordados: false,
    satisfaccion: 0,
    informeOEvidenciaRecibida: false,
  };
}

export function verificacionCompleta(v: VerificacionCompra): boolean {
  return v.resultado !== "Pendiente" && !!v.fecha && !!v.responsable;
}

// --- Compra ---

export type CompraProveedor = {
  id: string;
  tipo: TipoCompraProveedor;
  descripcion: string;
  cantidad: number;
  unidad: string;
  montoTotal: number;
  moneda: string;
  fecha: string; // fecha de la compra / de la orden
  numeroOrdenCompra: string;
  archivoOrdenCompra: string | null;
  archivoOrdenCompraNombre: string;
  numeroFactura: string;
  fechaFactura: string;
  archivoFactura: string | null;
  archivoFacturaNombre: string;
  estado: string;
  observaciones: string;
  verificacion: VerificacionCompra;
  fechaAlta: string;
};

export function compraVacia(): CompraProveedor {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    tipo: "Producto",
    descripcion: "",
    cantidad: 1,
    unidad: "unidad",
    montoTotal: 0,
    moneda: "Guaraníes (PYG)",
    fecha: hoy,
    numeroOrdenCompra: "",
    archivoOrdenCompra: null,
    archivoOrdenCompraNombre: "",
    numeroFactura: "",
    fechaFactura: "",
    archivoFactura: null,
    archivoFacturaNombre: "",
    estado: "Pendiente",
    observaciones: "",
    verificacion: verificacionVacia(),
    fechaAlta: hoy,
  };
}

export function parseComprasProveedor(contenido: string): CompraProveedor[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: CompraProveedor) => ({
      ...compraVacia(),
      ...c,
      verificacion: { ...verificacionVacia(), ...(c.verificacion ?? {}) },
    }));
  } catch {
    return [];
  }
}

export function formatoMontoCompra(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}

// --- Resumen ---

export function totalCompras(compras: CompraProveedor[]): number {
  return compras.reduce((acc, c) => acc + c.montoTotal, 0);
}

export function resumenVerificacion(compras: CompraProveedor[]): { resultado: string; cantidad: number; color: string }[] {
  return RESULTADOS_VERIFICACION.map((resultado) => ({
    resultado,
    cantidad: compras.filter((c) => c.verificacion.resultado === resultado).length,
    color: colorResultadoVerificacion(resultado),
  })).filter((r) => r.cantidad > 0);
}

// --- Indicadores: compras por mes / por año / por proveedor ---

export function mesDeCompra(fecha: string): string {
  return fecha ? fecha.slice(0, 7) : "";
}

export function anioDeCompra(fecha: string): string {
  return fecha ? fecha.slice(0, 4) : "";
}

export function resumenComprasPorMes(compras: CompraProveedor[]): { mes: string; monto: number; cantidad: number }[] {
  const mapa = new Map<string, { monto: number; cantidad: number }>();
  compras.forEach((c) => {
    const mes = mesDeCompra(c.fecha);
    if (!mes) return;
    const actual = mapa.get(mes) ?? { monto: 0, cantidad: 0 };
    mapa.set(mes, { monto: actual.monto + c.montoTotal, cantidad: actual.cantidad + 1 });
  });
  return Array.from(mapa.entries())
    .map(([mes, v]) => ({ mes, ...v }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export function resumenComprasPorAnio(compras: CompraProveedor[]): { anio: string; monto: number; cantidad: number }[] {
  const mapa = new Map<string, { monto: number; cantidad: number }>();
  compras.forEach((c) => {
    const anio = anioDeCompra(c.fecha);
    if (!anio) return;
    const actual = mapa.get(anio) ?? { monto: 0, cantidad: 0 };
    mapa.set(anio, { monto: actual.monto + c.montoTotal, cantidad: actual.cantidad + 1 });
  });
  return Array.from(mapa.entries())
    .map(([anio, v]) => ({ anio, ...v }))
    .sort((a, b) => a.anio.localeCompare(b.anio));
}
