export type NodoOrganigrama = {
  id: string;
  nombre: string;
  cargo: string;
  foto: string | null; // data URL (base64)
  parentId: string | null;
  esExterno: boolean; // true = personal externo (contratista, consultor, etc.)
  orden: number; // orden entre hermanos (para poder subir/bajar un cargo)
};

export function nodoVacio(parentId: string | null = null, orden = 0): NodoOrganigrama {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cargo: "",
    foto: null,
    parentId,
    esExterno: false,
    orden,
  };
}

export function parseNodos(contenido: string): NodoOrganigrama[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n, i) => ({
      esExterno: false,
      orden: i,
      ...n,
    }));
  } catch {
    return [];
  }
}

export function construirArbol(nodos: NodoOrganigrama[]) {
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const hijosDe = new Map<string, NodoOrganigrama[]>();
  const raices: NodoOrganigrama[] = [];

  nodos.forEach((n) => {
    if (n.parentId && porId.has(n.parentId) && n.parentId !== n.id) {
      if (!hijosDe.has(n.parentId)) hijosDe.set(n.parentId, []);
      hijosDe.get(n.parentId)!.push(n);
    } else {
      raices.push(n);
    }
  });

  const porOrden = (a: NodoOrganigrama, b: NodoOrganigrama) => a.orden - b.orden;
  raices.sort(porOrden);
  hijosDe.forEach((arr) => arr.sort(porOrden));

  return { raices, hijosDe };
}

// Conexiones adicionales entre cargos (fuera de la línea jerárquica normal),
// por ejemplo líneas punteadas a personal externo o reportes cruzados.
export type ConexionExtra = {
  id: string;
  origenId: string;
  destinoId: string;
  tipo: "interna" | "externa";
};

export function conexionVacia(origenId: string): ConexionExtra {
  return { id: crypto.randomUUID(), origenId, destinoId: "", tipo: "externa" };
}

export function parseConexiones(contenido: string): ConexionExtra[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
