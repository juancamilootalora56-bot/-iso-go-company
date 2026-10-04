export const IMPACTO_OPCIONES = [
  { key: "Insignificante", score: 1 },
  { key: "Menor", score: 2 },
  { key: "Moderado", score: 3 },
  { key: "Mayor", score: 4 },
  { key: "Catastrófico", score: 5 },
] as const;

export const PROBABILIDAD_OPCIONES = [
  { key: "Raro", score: 1 },
  { key: "Posible", score: 2 },
  { key: "Probable", score: 3 },
  { key: "Casi Cierto", score: 4 },
] as const;

export function calcularNivelRiesgo(impacto: string, probabilidad: string) {
  const i = IMPACTO_OPCIONES.find((o) => o.key === impacto)?.score ?? 0;
  const p = PROBABILIDAD_OPCIONES.find((o) => o.key === probabilidad)?.score ?? 0;
  const score = i * p;
  if (!i || !p) return { label: "", color: "" };
  if (score >= 12) return { label: "Riesgo Extremo", color: "#EF4444" };
  if (score >= 6) return { label: "Alto Riesgo", color: "#F97316" };
  if (score >= 3) return { label: "Riesgo Moderado", color: "#F2CB4E" };
  return { label: "Riesgo Inferior", color: "#3B82F6" };
}

export type DofaCat = "fortalezas" | "debilidades" | "oportunidades" | "amenazas";

export const DOFA_LABEL: Record<DofaCat, string> = {
  fortalezas: "Fortaleza",
  debilidades: "Debilidad",
  oportunidades: "Oportunidad",
  amenazas: "Amenaza",
};

export const DOFA_TIPO: Record<DofaCat, "Interno" | "Externo"> = {
  fortalezas: "Interno",
  debilidades: "Interno",
  oportunidades: "Externo",
  amenazas: "Externo",
};

export const DOFA_EFECTO: Record<DofaCat, "Positivo" | "Negativo"> = {
  fortalezas: "Positivo",
  debilidades: "Negativo",
  oportunidades: "Positivo",
  amenazas: "Negativo",
};

export type FodaLibre = Record<DofaCat, string>;

export function fodaLibreVacio(): FodaLibre {
  return { fortalezas: "", debilidades: "", oportunidades: "", amenazas: "" };
}

export function parseFodaLibre(contenido: string): FodaLibre {
  const base = fodaLibreVacio();
  if (!contenido) return base;
  try {
    const parsed = JSON.parse(contenido);
    (Object.keys(base) as DofaCat[]).forEach((k) => {
      if (typeof parsed?.[k] === "string") base[k] = parsed[k];
    });
  } catch {
    // ignore
  }
  return base;
}

export type RiesgoFila = {
  id: string;
  riesgo: string;
  proceso: string;
  tipo: "Interno" | "Externo";
  dofa: string;
  descripcion: string;
  efecto: "Positivo" | "Negativo";
  impacto: string;
  probabilidad: string;
  control: string;
  porcentaje: number;
  estado: string;
};

export function parseFilasRiesgo(contenido: string): RiesgoFila[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
