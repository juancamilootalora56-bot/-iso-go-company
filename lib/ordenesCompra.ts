export type ItemOrdenCompra = {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
};

export type OrdenCompra = {
  id: string;
  numero: string;
  proveedorId: string;
  fecha: string;
  fechaEntregaEsperada: string;
  moneda: string;
  formaPago: string;
  items: ItemOrdenCompra[];
  estado: string;
  observaciones: string;
};

export const ESTADOS_ORDEN_COMPRA = ["Pendiente", "Aprobada", "Enviada al proveedor", "Recibida", "Cancelada"];

export const MONEDAS_ORDEN = ["Guaraníes (PYG)", "Dólares (USD)", "Otro"];

export function colorEstadoOrden(estado: string): string {
  switch (estado) {
    case "Pendiente":
      return "#F5A623";
    case "Aprobada":
      return "#3B82F6";
    case "Enviada al proveedor":
      return "#8B5CF6";
    case "Recibida":
      return "#22C55E";
    case "Cancelada":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export function itemOrdenVacio(): ItemOrdenCompra {
  return { id: crypto.randomUUID(), descripcion: "", cantidad: 1, unidad: "unidad", precioUnitario: 0 };
}

export function ordenCompraVacia(): OrdenCompra {
  return {
    id: crypto.randomUUID(),
    numero: "",
    proveedorId: "",
    fecha: new Date().toISOString().slice(0, 10),
    fechaEntregaEsperada: "",
    moneda: "Guaraníes (PYG)",
    formaPago: "",
    items: [itemOrdenVacio()],
    estado: "Pendiente",
    observaciones: "",
  };
}

export function parseOrdenesCompra(contenido: string): OrdenCompra[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function totalOrden(orden: OrdenCompra): number {
  return orden.items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
}

export function formatoMonto(valor: number): string {
  return valor.toLocaleString("es-PY", { maximumFractionDigits: 2 });
}
