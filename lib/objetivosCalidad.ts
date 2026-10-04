export type ObjetivoCalidad = {
  id: string;
  objetivo: string;
  indicador: string;
  meta: string;
  responsable: string;
  plazo: string;
};

export function objetivoVacio(): ObjetivoCalidad {
  return {
    id: crypto.randomUUID(),
    objetivo: "",
    indicador: "",
    meta: "",
    responsable: "",
    plazo: "",
  };
}

export function parseObjetivos(contenido: string): ObjetivoCalidad[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
