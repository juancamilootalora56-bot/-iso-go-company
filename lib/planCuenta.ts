// Plan de la cuenta (perfil dueño de la empresa) — reutiliza la columna
// `plan` de `profiles`, que ya existía pero no se usaba.
//
// "diagnostico": acceso recién aprobado, antes de cerrar el acuerdo
// comercial. Solo puede ver Inicio y Mi Perfil (sin la sección de
// colaboradores) — el resto de los módulos de gestión quedan bloqueados
// con un mensaje para hablar con un asesor.
// "completo" (o null, por compatibilidad con cuentas ya existentes antes
// de este cambio): acceso normal a todo.
export type PlanCuenta = "diagnostico" | "completo";

export function esPlanDiagnostico(plan: string | null | undefined): boolean {
  return plan === "diagnostico";
}
