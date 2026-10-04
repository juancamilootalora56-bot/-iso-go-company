export type FodaCategoria = "fortalezas" | "oportunidades" | "debilidades" | "amenazas";

export const FODA_CATEGORIAS: { key: FodaCategoria; label: string; color: string; icono: string }[] = [
  { key: "debilidades", label: "Debilidades", color: "#F5A623", icono: "⚠️" },
  { key: "oportunidades", label: "Oportunidades", color: "#E8366B", icono: "🚀" },
  { key: "fortalezas", label: "Fortalezas", color: "#2EA3F2", icono: "💪" },
  { key: "amenazas", label: "Amenazas", color: "#7C4DFF", icono: "🛑" },
];

export const FODA_ITEMS_COMUNES: Record<FodaCategoria, string[]> = {
  debilidades: [
    "Falta de financiamiento",
    "Inadecuada gestión de inventarios",
    "Falta de diversificación en productos o servicios",
    "Falta de personal",
    "Falta de motivación",
    "Mala organización",
    "Plan de marketing inexistente",
    "Políticas de la empresa poco desarrolladas",
    "Mala estrategia fiscal",
    "Falta de manuales y protocolos de procesos",
    "Alto costo de producto respecto a la competencia",
    "Insuficiente o nula investigación de mercado",
    "Deficiencias en el inventario",
    "Cultura ineficaz",
    "Falta de control de los procesos",
    "Falta de control de los riesgos",
    "Estimaciones inexactas",
    "Baja rentabilidad del capital invertido",
    "Baja diversificación de los ingresos",
    "Mercado objetivo demasiado amplio",
  ],
  oportunidades: [
    "Innovación tecnológica",
    "Cambios en las regulaciones gubernamentales",
    "Mayor demanda de productos o servicios",
    "Mayor acceso a financiamiento",
    "Implementación de la tecnología",
    "Nuevos productos que abarquen nuevos clientes",
    "Ingresar a nuevos mercados",
    "Expandir tu operación",
    "Mejorar la atención y satisfacción de clientes",
    "Optimizar la administración de tus recursos",
    "Generar nuevas estrategias",
    "Innovar productos o servicios",
    "Diversificar fuentes de ingresos",
    "Alta demanda de productos",
    "Participación en eventos de mercado",
    "Crear contenido en redes sociales",
    "Crear una tienda online",
  ],
  fortalezas: [
    "Experiencia en el mercado",
    "Equipo altamente capacitado",
    "Amplia cartera de productos o servicios",
    "Buena reputación entre los clientes",
    "Excelente servicio al cliente",
    "Capacidad de cumplir los compromisos con los clientes",
    "Capacidad para innovar",
    "Capacidad de cambio",
    "Solidez financiera",
    "Procesos certificados",
    "Tecnología propia",
    "Ubicación estratégica",
    "Equipo comprometido",
    "Marca reconocida",
  ],
  amenazas: [
    "Competencia",
    "Inestabilidad económica",
    "Pérdida de clientes",
    "Saturación del mercado",
    "Posible entrada de nuevos competidores",
    "Descenso del consumo",
    "Situación económica",
    "Cambios regulatorios adversos",
    "Aumento de costos de insumos",
    "Problemas en la cadena de suministro",
    "Avances tecnológicos de la competencia",
    "Cambios en las preferencias del consumidor",
  ],
};

export function itemKeyFoda(categoria: FodaCategoria) {
  return `foda_${categoria}`;
}

export function parseFodaItems(contenido: string): string[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
