// Módulos del portal que se le pueden habilitar a un colaborador.
// El campo `modulo` es el valor que se guarda en permisos[] y es el mismo
// que se usa como `modulo` en gestion_documentos (para las políticas RLS).
export const MODULOS_PERMISOS = [
  { modulo: "gerencia", label: "Gestión de la Gerencia", icon: "🏛️" },
  { modulo: "talento_humano", label: "Gestión del Talento Humano", icon: "👥" },
  { modulo: "compras", label: "Gestión de Compras", icon: "🛒" },
  { modulo: "comercial", label: "Gestión Comercial", icon: "📈" },
  { modulo: "operativa", label: "Gestión Operativa", icon: "⚙️" },
  { modulo: "diseno_desarrollo", label: "Gestión de Diseño y Desarrollo", icon: "🧩" },
] as const;

export type Colaborador = {
  id: string;
  owner_id: string;
  nombre: string;
  apellido: string;
  cargo: string | null;
  identificacion: string | null;
  email: string | null;
  foto: string | null;
  permisos: string[];
  activo: boolean;
  created_at: string;
};
