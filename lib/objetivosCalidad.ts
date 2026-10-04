export type ObjetivoSugerido = {
  objetivo: string;
  indicador: string;
  formula: string;
  meta: string;
  frecuencia: string;
};

export type AreaObjetivos = {
  area: string;
  color: string;
  sugeridos: ObjetivoSugerido[];
};

// Catálogo de objetivos de calidad sugeridos por área, con indicador KPI,
// fórmula de medición, meta de referencia y frecuencia de medición.
export const OBJETIVOS_SUGERIDOS: AreaObjetivos[] = [
  {
    area: "Gerencia",
    color: "#9CA3AF",
    sugeridos: [
      {
        objetivo: "Maximizar la rentabilidad del negocio.",
        indicador: "Margen de Utilidad Neta (%)",
        formula: "(Utilidad Neta / Ingresos Totales) * 100",
        meta: "Alcanzar un margen > 18%.",
        frecuencia: "Semestral-Anual",
      },
      {
        objetivo: "Asegurar el crecimiento sostenible de la empresa.",
        indicador: "Tasa de Crecimiento Anual (%)",
        formula: "((Ingresos Año Actual - Ingresos Año Anterior) / Ingresos Año Anterior) * 100",
        meta: "Lograr un crecimiento del 20% anual.",
        frecuencia: "Anual",
      },
      {
        objetivo: "Incrementar el valor de la marca en el mercado.",
        indicador: "Puntuación neta del promotor (NPS)",
        formula: "% Promotores - % Detractores",
        meta: ">= 50.",
        frecuencia: "Semestral",
      },
      {
        objetivo: "Garantizar el cumplimiento de los objetivos estratégicos.",
        indicador: "% de Cumplimiento del Plan Estratégico",
        formula: "(Objetivos Cumplidos / Objetivos Planificados) * 100",
        meta: "> 90%.",
        frecuencia: "Anual",
      },
    ],
  },
  {
    area: "Gestión Comercial",
    color: "#F3A6B8",
    sugeridos: [
      {
        objetivo: "Superar las expectativas del cliente con soluciones personalizadas y un servicio excepcional.",
        indicador: "Índice de Satisfacción del Cliente",
        formula: "Promedio de las encuestas de satisfacción del cliente",
        meta: "> 90%.",
        frecuencia: "Semestral",
      },
      {
        objetivo: "Fidelizar a los clientes actuales.",
        indicador: "Tasa de Retención de Clientes",
        formula: "((Clientes al Final del Período - Nuevos Clientes) / Clientes al Inicio del Período) x 100",
        meta: "> 95%.",
        frecuencia: "Anual",
      },
      {
        objetivo: "Mejorar la efectividad del proceso de ventas.",
        indicador: "Tasa de conversión de cotizaciones",
        formula: "(Número de cotizaciones aprobadas / Número de Cotizaciones enviadas) x 100",
        meta: "> 50%.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Aumentar las ventas de la empresa.",
        indicador: "Crecimiento de Ventas (%)",
        formula: "((Ventas Actuales - Ventas Anteriores) / Ventas Anteriores) * 100",
        meta: "> 15%.",
        frecuencia: "Mensual",
      },
    ],
  },
  {
    area: "Gestión de Diseño y Desarrollo",
    color: "#F5DEA8",
    sugeridos: [
      {
        objetivo: "Garantizar la entrega puntual de los diseños y proyectos.",
        indicador: "Índice de Cumplimiento de Plazos (%)",
        formula: "(Nº de Proyectos Entregados a Tiempo / Nº Total de Proyectos) * 100",
        meta: "Cumplimiento del 95% de las fechas de entrega.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Asegurar la calidad técnica y minimizar los errores.",
        indicador: "Tasa de Rediseño por Peticiones (%)",
        formula: "(Nº de Diseños con Ajustes Mayores / Nº Total de Diseños) * 100",
        meta: "< 10%.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Fomentar la innovación en productos y servicios.",
        indicador: "Nuevos diseños o desarrollos lanzados",
        formula: "Conteo de diseños nuevos presentados en el período",
        meta: ">= 2 por trimestre.",
        frecuencia: "Trimestral",
      },
    ],
  },
  {
    area: "Gestión Operativa",
    color: "#F2C14E",
    sugeridos: [
      {
        objetivo: "Maximizar la tasa de ocupación de las propiedades gestionadas.",
        indicador: "Tasa de Ocupación (%)",
        formula: "(Unidades o Noches Ocupadas / Unidades o Noches Disponibles) * 100",
        meta: "Dptos: > 95% · Airbnb: > 80%.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Garantizar la máxima satisfacción de los clientes operativos.",
        indicador: "Índice de Satisfacción del Cliente (CSAT)",
        formula: "(Nº de Clientes Satisfechos / Nº Total de Encuestados) * 100",
        meta: "CSAT > 90% en todas las áreas.",
        frecuencia: "Mensual/Trimestral",
      },
      {
        objetivo: "Optimizar los tiempos de respuesta ante incidencias.",
        indicador: "Tiempo Medio de Resolución (TMR)",
        formula: "Suma del tiempo de resolución de todas las incidencias / Nº total de incidencias",
        meta: "TMR < 48 horas para incidencias no críticas.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Asegurar la disponibilidad y operatividad de los activos.",
        indicador: "Cumplimiento del Plan de Mantenimiento Preventivo (%)",
        formula: "(Nº Tareas Preventivas Ejecutadas / Nº Tareas Preventivas Programadas) * 100",
        meta: "Cumplimiento > 98%.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Minimizar las fallas imprevistas mediante la prevención.",
        indicador: "Tiempo Medio Entre Fallas (MTBF)",
        formula: "Horas Operativas Totales / Nº de Fallas Correctivas",
        meta: "Aumentar el MTBF en un 10% anual.",
        frecuencia: "Trimestral",
      },
      {
        objetivo: "Garantizar el correcto desempeño de los proveedores críticos.",
        indicador: "Cumplimiento de Proveedores Críticos",
        formula: "(Nº de Proveedores evaluados con calificación > 85 puntos / Nº Total de Proveedores Críticos) * 100",
        meta: "> 85 puntos.",
        frecuencia: "Trimestral",
      },
    ],
  },
  {
    area: "Gestión del Talento Humano",
    color: "#A9C7E8",
    sugeridos: [
      {
        objetivo: "Potenciar las competencias y habilidades del personal.",
        indicador: "Eficacia de la Capacitación (%)",
        formula: "(Nº Colaboradores con Evaluación Aprobatoria Post-Capacitación / Nº Colaboradores Evaluados) * 100",
        meta: "Eficacia > 85% en todas las capacitaciones.",
        frecuencia: "Trimestral",
      },
      {
        objetivo: "Asegurar la ejecución del plan de formación anual.",
        indicador: "Cobertura del Plan de Capacitación (%)",
        formula: "(Nº de colaboradores capacitados / Nº Total programado) * 100",
        meta: "Cobertura del 100% del personal programado.",
        frecuencia: "Semestral",
      },
      {
        objetivo: "Medir objetivamente el rendimiento del personal.",
        indicador: "Cumplimiento de Evaluaciones de Desempeño (%)",
        formula: "(Nº de Evaluaciones Realizadas / Nº de Evaluaciones Programadas) * 100",
        meta: "100% de cumplimiento en cada ciclo.",
        frecuencia: "Semestral",
      },
      {
        objetivo: "Garantizar la retroalimentación para el desarrollo profesional.",
        indicador: "Promedio de Calificación de Desempeño",
        formula: "Suma de todas las calificaciones / Nº de empleados evaluados",
        meta: "Promedio de calificación general > 8.5 sobre 10.",
        frecuencia: "Semestral/Anual",
      },
      {
        objetivo: "Fomentar un ambiente laboral positivo y reducir la rotación.",
        indicador: "Tasa de Rotación de Personal (%)",
        formula: "(Nº de Bajas / Nº Promedio de Empleados) * 100",
        meta: "Mantener la tasa de rotación anual < 8%.",
        frecuencia: "Trimestral",
      },
    ],
  },
  {
    area: "Gestión Contable",
    color: "#D9D9D9",
    sugeridos: [
      {
        objetivo: "Asegurar la precisión y puntualidad de la información financiera.",
        indicador: "Porcentaje de Cierres Contables a Tiempo",
        formula: "(Nº de Cierres a Tiempo / Nº Total de Cierres) * 100",
        meta: "100% de los cierres mensuales realizados en los primeros 5 días.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Minimizar los errores en los registros contables.",
        indicador: "Índice de Exactitud en Registros",
        formula: "(Nº de Registros con Error / Nº Total de Registros) * 100",
        meta: "Exactitud > 99.5%.",
        frecuencia: "Mensual",
      },
    ],
  },
  {
    area: "Gestión de Tesorería",
    color: "#C9B8E0",
    sugeridos: [
      {
        objetivo: "Garantizar la liquidez para la operación.",
        indicador: "Ratio de Liquidez",
        formula: "Activo Corriente / Pasivo Corriente",
        meta: "Mantener un ratio de liquidez > 1.5.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Cumplir puntualmente con las obligaciones de pago.",
        indicador: "Porcentaje de Pagos a Proveedores a Tiempo",
        formula: "(Pagos a Tiempo / Total Pagos Realizados) * 100",
        meta: "Cumplimiento del 98% de pagos a tiempo.",
        frecuencia: "Mensual",
      },
    ],
  },
  {
    area: "Gestión de Finanzas",
    color: "#D97A5B",
    sugeridos: [
      {
        objetivo: "Optimizar la gestión del presupuesto.",
        indicador: "Desviación Presupuestaria (%)",
        formula: "((Gasto Real - Gasto Presupuestado) / Gasto Presupuestado) * 100",
        meta: "Desviación < 5% sobre el presupuesto.",
        frecuencia: "Trimestral",
      },
      {
        objetivo: "Cumplir puntualmente con las obligaciones de cobro.",
        indicador: "Período Promedio de Cobro (Días)",
        formula: "(Cuentas por Cobrar Promedio / Ventas a Crédito) * 365",
        meta: "Reducir el período de cobro.",
        frecuencia: "Mensual",
      },
    ],
  },
  {
    area: "Gestión de Compras",
    color: "#E5E7EB",
    sugeridos: [
      {
        objetivo: "Garantizar la trazabilidad de las compras.",
        indicador: "Porcentaje de Compras realizadas",
        formula: "(Nº de Compras realizadas / Nº Total de Órdenes de Compra) * 100",
        meta: "Cumplimiento del 98%.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Evaluar periódicamente a los proveedores.",
        indicador: "Cumplimiento de Proveedores",
        formula: "(Nº de Proveedores evaluados con calificación > 85 puntos / Nº Total de Proveedores Críticos) * 100",
        meta: "Cumplimiento del 85%.",
        frecuencia: "Trimestral",
      },
      {
        objetivo: "Auditar el cumplimiento de requisitos de los proveedores.",
        indicador: "Cumplimiento de los requisitos de los proveedores",
        formula: "(Nº de requisitos conformes por el Proveedor / Nº Total de requisitos) * 100",
        meta: "Cumplimiento del 85%.",
        frecuencia: "Trimestral",
      },
    ],
  },
  {
    area: "Gestión de Marketing",
    color: "#A3CFA0",
    sugeridos: [
      {
        objetivo: "Aumentar la generación de oportunidades de venta calificadas.",
        indicador: "Costo por Lead Calificado (CPL)",
        formula: "Inversión Total en Marketing / Nº de Leads Calificados Generados",
        meta: "Reducir el CPL en un 10% semestralmente.",
        frecuencia: "Mensual",
      },
      {
        objetivo: "Incrementar el alcance y reconocimiento de la marca.",
        indicador: "Tasa de Engagement en Redes (%)",
        formula: "(Interacciones / Alcance Total) * 100",
        meta: "> 5%.",
        frecuencia: "Mensual",
      },
    ],
  },
];

export type ObjetivoCalidad = {
  id: string;
  area: string;
  objetivo: string;
  indicador: string;
  formula: string;
  meta: string;
  frecuencia: string;
};

function slugId(area: string, objetivo: string): string {
  return `${area}__${objetivo}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 120);
}

export function objetivoDesdeSugerido(area: string, s: ObjetivoSugerido): ObjetivoCalidad {
  return { id: slugId(area, s.objetivo), area, ...s };
}

export function objetivoPersonalizadoVacio(area: string): ObjetivoCalidad {
  return {
    id: crypto.randomUUID(),
    area,
    objetivo: "",
    indicador: "",
    formula: "",
    meta: "",
    frecuencia: "",
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
