// Módulos y actividades del portal que se le pueden habilitar a un colaborador.
// `modulo` es la misma clave que `modulo` en gestion_documentos (para RLS, a nivel
// de módulo completo). `actividad` es la clave de ruta de cada pantalla dentro del
// módulo (ej. "requisicion_pedidos"), usada solo en la aplicación — no hay RLS por
// actividad, ver nota en supabase/schema-colaboradores-permisos-granulares.sql.

export type ActividadCatalogo = { actividad: string; label: string };

export const MODULOS_PERMISOS = [
  { modulo: "gerencia", label: "Gestión de la Gerencia", icon: "🏛️" },
  { modulo: "talento_humano", label: "Gestión del Talento Humano", icon: "👥" },
  { modulo: "compras", label: "Gestión de Compras", icon: "🛒" },
  { modulo: "comercial", label: "Gestión Comercial", icon: "📈" },
  { modulo: "operativa", label: "Gestión Operativa", icon: "⚙️" },
  { modulo: "diseno_desarrollo", label: "Gestión de Diseño y Desarrollo", icon: "🧩" },
  { modulo: "calidad", label: "Gestión de Calidad", icon: "✅" },
] as const;

export const ACTIVIDADES_POR_MODULO: Record<string, ActividadCatalogo[]> = {
  gerencia: [
    { actividad: "cronograma_general", label: "Cronograma General del Sistema" },
    { actividad: "compromiso_direccion", label: "Compromiso por la Dirección" },
    { actividad: "foda", label: "FODA" },
    { actividad: "matriz_cliente_partes_interesadas", label: "Matriz del Cliente y Partes Interesadas" },
    { actividad: "matriz_productos_estrella", label: "Matriz de Productos Estrella" },
    { actividad: "mapa_procesos", label: "Mapa de Procesos" },
    { actividad: "matriz_gestion_riesgos", label: "Matriz de la Gestión de Riesgos" },
    { actividad: "mision", label: "Misión" },
    { actividad: "vision", label: "Visión" },
    { actividad: "valores_organizacionales", label: "Valores Organizacionales" },
    { actividad: "politica_calidad", label: "Política de Calidad" },
    { actividad: "alcance_sistema", label: "Alcance del Sistema" },
    { actividad: "objetivos_calidad", label: "Objetivos de Calidad" },
    { actividad: "estructura_organizacional", label: "Estructura Organizacional" },
  ],
  talento_humano: [
    { actividad: "seleccion_personal", label: "Selección y Contratación de Personal" },
    { actividad: "alta_personal", label: "Alta de Personal" },
    { actividad: "gestion_personal", label: "Gestión del Personal" },
    { actividad: "capacitaciones_generales", label: "Capacitaciones Generales" },
    { actividad: "evaluaciones_generales", label: "Evaluaciones Generales" },
  ],
  compras: [
    { actividad: "requisicion_pedidos", label: "Requisición de Pedidos" },
    { actividad: "inscripcion_proveedores", label: "Inscripción de Proveedores" },
    { actividad: "lista_maestra_proveedores", label: "Lista Maestra de Proveedores" },
    { actividad: "indicadores_compras", label: "Indicadores de Compras" },
    { actividad: "ordenes_compra", label: "Órdenes de Compra" },
  ],
  comercial: [
    { actividad: "inscripcion_clientes", label: "Alta de Cliente" },
    { actividad: "lista_maestra_clientes", label: "Lista Maestra de Clientes" },
    { actividad: "satisfaccion_clientes", label: "Satisfacción del Cliente" },
    { actividad: "pqrsf", label: "Sistema PQRSF" },
    { actividad: "seguimiento_ventas", label: "Seguimiento de Ventas" },
  ],
  operativa: [
    { actividad: "inscripcion_productos", label: "Alta de Producto" },
    { actividad: "lista_maestra_productos", label: "Operaciones (Productos)" },
    { actividad: "inscripcion_servicios", label: "Alta de Servicio" },
    { actividad: "lista_maestra_servicios", label: "Servicios" },
    { actividad: "inscripcion_inventario", label: "Alta de Inventario" },
    { actividad: "lista_maestra_inventario", label: "Inventario" },
    { actividad: "programa_mantenimiento", label: "Programa de Mantenimiento" },
    { actividad: "no_conformidades", label: "No Conformidades" },
    { actividad: "relacion_actividades", label: "Relación de Actividades" },
  ],
  diseno_desarrollo: [
    { actividad: "inscripcion_proyecto", label: "Alta de Proyecto" },
    { actividad: "proyectos", label: "Proyectos de Diseño" },
    { actividad: "control_cambios", label: "Control de Cambios" },
    { actividad: "planes_calidad", label: "Planes de Calidad" },
    { actividad: "indicadores", label: "Indicadores de Diseño" },
  ],
  calidad: [
    { actividad: "procedimientos", label: "Gestión de Procedimientos" },
    { actividad: "oportunidades_mejora", label: "Gestión de Oportunidades de Mejora" },
    { actividad: "lecciones_aprendidas", label: "Gestión de Lecciones Aprendidas" },
    { actividad: "matrices", label: "Matrices" },
    { actividad: "caracterizaciones", label: "Caracterizaciones de Procesos" },
    { actividad: "control_documentos", label: "Gestión de Control de Documentos" },
  ],
};

// Actividades tipo pipeline donde además se puede limitar por etapa.
// Hoy solo Requisición de Pedidos (piloto); el resto de actividades, si
// aparecen acá, son "todo o nada" dentro de la actividad.
export const ETAPAS_POR_ACTIVIDAD: Record<string, string[]> = {
  requisicion_pedidos: ["Solicitud", "Autorización", "Cotización", "Selección", "Compra"],
};

// --- Estructura de permisos ---

export type PermisoActividad = true | { etapas: string[] };

export type PermisoModulo =
  | { completo: true }
  | { actividades: Record<string, PermisoActividad> };

export type PermisosColaborador = Record<string, PermisoModulo>;

export function permisoModuloVacio(): PermisoModulo {
  return { actividades: {} };
}

export function tieneAccesoModulo(permisos: PermisosColaborador, modulo: string): boolean {
  const p = permisos[modulo];
  if (!p) return false;
  if ("completo" in p) return p.completo;
  return Object.keys(p.actividades).length > 0;
}

export function tieneAccesoActividad(permisos: PermisosColaborador, modulo: string, actividad: string): boolean {
  const p = permisos[modulo];
  if (!p) return false;
  if ("completo" in p) return p.completo;
  return actividad in p.actividades;
}

// Etapas permitidas de una actividad tipo pipeline para este colaborador.
// null = sin restricción (acceso completo a todas las etapas, porque el
// módulo es "completo" o la actividad está marcada como `true`).
export function etapasPermitidas(permisos: PermisosColaborador, modulo: string, actividad: string): string[] | null {
  const p = permisos[modulo];
  if (!p) return [];
  if ("completo" in p) return p.completo ? null : [];
  const a = p.actividades[actividad];
  if (!a) return [];
  if (a === true) return null;
  return a.etapas;
}

// Relación de Actividades queda siempre disponible para todo colaborador
// (cada uno ve solo la suya), sin necesidad de que el dueño se la asigne
// explícitamente. Como el acceso a datos (RLS de gestion_documentos) es por
// módulo completo, hay que garantizar que el módulo "operativa" quede
// presente en los permisos para que la consulta no quede bloqueada.
export function conAccesoRelacionActividades(permisos: PermisosColaborador): PermisosColaborador {
  const actual = permisos.operativa;
  if (actual && "completo" in actual && actual.completo) return permisos;
  const actividades = actual && "actividades" in actual ? actual.actividades : {};
  if ("relacion_actividades" in actividades) return permisos;
  return { ...permisos, operativa: { actividades: { ...actividades, relacion_actividades: true } } };
}

// ¿Tiene el colaborador algún acceso real más allá del acceso de base a
// Relación de Actividades que se le otorga siempre a todos? Se usa para
// decidir si al entrar ve el panel general o directamente su propia ficha.
export function tieneAccesoReal(permisos: PermisosColaborador): boolean {
  for (const modulo of Object.keys(permisos)) {
    const p = permisos[modulo];
    if (!p) continue;
    if ("completo" in p) {
      if (p.completo) return true;
      continue;
    }
    const actividades = Object.keys(p.actividades);
    if (modulo === "operativa") {
      if (actividades.some((a) => a !== "relacion_actividades")) return true;
    } else if (actividades.length > 0) {
      return true;
    }
  }
  return false;
}

export function actividadesVisibles(permisos: PermisosColaborador, modulo: string): string[] {
  const todas = (ACTIVIDADES_POR_MODULO[modulo] ?? []).map((a) => a.actividad);
  const p = permisos[modulo];
  if (!p) return [];
  if ("completo" in p) return p.completo ? todas : [];
  return todas.filter((a) => a in p.actividades);
}

export type Colaborador = {
  id: string;
  owner_id: string;
  empleado_id: string | null;
  nombre: string;
  apellido: string;
  cargo: string | null;
  identificacion: string | null;
  email: string | null;
  foto: string | null;
  permisos: PermisosColaborador;
  activo: boolean;
  created_at: string;
};
