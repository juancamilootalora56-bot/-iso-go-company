// Productos fabricados: alta y perfil, base para el Proceso Operativo.

export type ProductoFabricado = {
  id: string;
  imagen: string | null; // data URL (base64)

  nombre: string;
  descripcion: string;
  codigo: string; // SKU / código interno
  categoria: string;
  unidadMedida: string;

  estado: string;
  fechaAlta: string;
  observaciones: string;
};

export const CATEGORIAS_PRODUCTO = [
  "Alimentos y bebidas",
  "Textil y confección",
  "Metalmecánica",
  "Madera y muebles",
  "Plástico y caucho",
  "Químico y cosmético",
  "Construcción",
  "Electrónico",
  "Artesanal",
  "Servicios",
  "Otro",
];

export const UNIDADES_MEDIDA_PRODUCTO = ["Unidad", "Kg", "Litro", "Metro", "Metro²", "Metro³", "Caja", "Lote", "Par", "Otro"];

export const ESTADOS_PRODUCTO = ["Activo", "En desarrollo", "Descontinuado"];

export function colorEstadoProducto(estado: string): string {
  switch (estado) {
    case "Activo":
      return "#22C55E";
    case "En desarrollo":
      return "#F5A623";
    case "Descontinuado":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function productoVacio(): ProductoFabricado {
  return {
    id: crypto.randomUUID(),
    imagen: null,
    nombre: "",
    descripcion: "",
    codigo: "",
    categoria: "",
    unidadMedida: "Unidad",
    estado: "Activo",
    fechaAlta: new Date().toISOString().slice(0, 10),
    observaciones: "",
  };
}

export function parseProductos(contenido: string): ProductoFabricado[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
