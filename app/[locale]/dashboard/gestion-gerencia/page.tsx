"use client";

import { useParams } from "next/navigation";
import GestionDocumentos from "@/components/dashboard/GestionDocumentos";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { ITEMS_GERENCIA } from "@/lib/gestionGerenciaItems";

export default function GestionGerenciaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const puedeVer = usePuedeVerActividad("gerencia");
  const itemsVisibles = ITEMS_GERENCIA.filter((item) => puedeVer(item.key));
  return (
    <GestionDocumentos
      modulo="gerencia"
      titulo="Gestión de la Gerencia"
      descripcion="Completá cada actividad del direccionamiento estratégico de tu sistema de gestión."
      items={itemsVisibles}
      userId={user?.id ?? null}
      basePath={`/${locale}/dashboard/gestion-gerencia`}
      locale={locale}
    />
  );
}
