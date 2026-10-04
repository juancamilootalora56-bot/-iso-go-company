"use client";

import { useParams } from "next/navigation";
import GestionDocumentos from "@/components/dashboard/GestionDocumentos";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";

export default function GestionGerenciaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  return (
    <GestionDocumentos
      modulo="gerencia"
      titulo="Gestión de la Gerencia"
      descripcion="Completá cada actividad del direccionamiento estratégico de tu sistema de gestión."
      items={ITEMS_GERENCIA}
      userId={user?.id ?? null}
      basePath={`/${locale}/dashboard/gestion-gerencia`}
    />
  );
}
