// Manuales de funciones puntuales de un Plan de Calidad (Gestión de Diseño y
// Desarrollo) — uno por cada persona del proyecto, versión simplificada del
// Manual de Funciones de Gestión del Personal (sin los 15 campos de RRHH,
// pensado para un rol dentro de un proyecto puntual, no un cargo permanente).

import { type ItemLista, itemVacio } from "./manualFunciones";

export type ManualProyecto = {
  id: string;
  nombre: string;
  cargo: string;
  objetivoCargo: string;
  funcionesPrincipales: ItemLista[];
  funcionesSecundarias: ItemLista[];
  requisitos: string;
};

export function manualProyectoVacio(): ManualProyecto {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cargo: "",
    objetivoCargo: "",
    funcionesPrincipales: [],
    funcionesSecundarias: [],
    requisitos: "",
  };
}

export { itemVacio };
export type { ItemLista };

export function parseManualesProyecto(contenido: string): ManualProyecto[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: ManualProyecto) => ({
      ...m,
      funcionesPrincipales: m.funcionesPrincipales ?? [],
      funcionesSecundarias: m.funcionesSecundarias ?? [],
    }));
  } catch {
    return [];
  }
}
