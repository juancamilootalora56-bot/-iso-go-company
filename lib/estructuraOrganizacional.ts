export type NodoOrganigrama = {
  id: string;
  nombre: string;
  cargo: string;
  foto: string | null; // data URL (base64)
  parentId: string | null;
};

export function nodoVacio(parentId: string | null = null): NodoOrganigrama {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cargo: "",
    foto: null,
    parentId,
  };
}

export function parseNodos(contenido: string): NodoOrganigrama[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
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

  return { raices, hijosDe };
}
