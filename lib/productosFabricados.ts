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

  // IDs de Empleado (lib/personal.ts) de los colaboradores con acceso de
  // solo lectura a este producto puntual, sin importar si tienen el
  // módulo Gestión Operativa asignado desde su perfil.
  colaboradoresConAcceso: string[];
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
    colaboradoresConAcceso: [],
  };
}

export function parseProductos(contenido: string): ProductoFabricado[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: ProductoFabricado) => ({ ...p, colaboradoresConAcceso: p.colaboradoresConAcceso ?? [] }));
  } catch {
    return [];
  }
}
