export type FilaProductoEstrella = {
  producto: string;
  participacion: "" | "Alta" | "Media" | "Baja";
  importancia: "" | "Alta" | "Media" | "Baja";
  comentario: string;
};

export function filaVacia(): FilaProductoEstrella {
  return { producto: "", participacion: "", importancia: "", comentario: "" };
}

export function parseFilas(contenido: string): FilaProductoEstrella[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
