"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import CambiosDisenoForm from "@/components/dashboard/CambiosDisenoForm";

export default function ControlCambiosDisenoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Diseño y Desarrollo
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Control de Cambios de Diseño</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vista consolidada de todas las solicitudes de cambio (ISO 9001, cláusula 8.3.6) de todos tus proyectos de diseño.
        </p>
      </div>

      <CambiosDisenoForm userId={user?.id ?? null} />
    </div>
  );
}
