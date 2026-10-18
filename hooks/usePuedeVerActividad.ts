"use client";

import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { tieneAccesoActividad } from "@/lib/colaboradoresCliente";

// El dueño de la cuenta siempre ve todo. Un colaborador solo ve las
// actividades que tiene habilitadas dentro de este módulo.
export function usePuedeVerActividad(modulo: string) {
  const { colaborador } = useDashboardUser();
  return function puedeVer(actividad: string): boolean {
    if (!colaborador) return true;
    return tieneAccesoActividad(colaborador.permisos, modulo, actividad);
  };
}
