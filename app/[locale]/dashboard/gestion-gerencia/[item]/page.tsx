"use client";

import { useParams } from "next/navigation";
import GestionDocumentoDetalle from "@/components/dashboard/GestionDocumentoDetalle";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";

export default function GestionGerenciaItemPage() {
  const { user, profile } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const itemKey = params.item as string;

  const item = ITEMS_GERENCIA.find((i) => i.key === itemKey);

  if (!item) {
    return <p className="text-gray-400 text-sm">Actividad no encontrada.</p>;
  }

  return (
    <GestionDocumentoDetalle
      modulo="gerencia"
      item={item}
      userId={user?.id ?? null}
      empresa={profile?.company_name ?? ""}
      basePath={`/${locale}/dashboard/gestion-gerencia`}
      moduloTitulo="Gestión de la Gerencia"
    />
  );
}
