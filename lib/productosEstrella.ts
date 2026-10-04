export type ProductoEstrella = {
  id: string;
  foto: string | null; // data URL (base64)
  nombre: string;
  descripcion: string;
  caracteristicas: string;
  ventajas: string;
  beneficios: string;
};

export function productoVacio(): ProductoEstrella {
  return {
    id: crypto.randomUUID(),
    foto: null,
    nombre: "",
    descripcion: "",
    caracteristicas: "",
    ventajas: "",
    beneficios: "",
  };
}

export function parseProductos(contenido: string): ProductoEstrella[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
