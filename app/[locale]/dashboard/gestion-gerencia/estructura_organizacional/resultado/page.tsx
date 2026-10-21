"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import OrganigramaEditor from "@/components/dashboard/OrganigramaEditor";

export default function EstructuraOrganizacionalResultadoPage() {
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Organigrama</h1>
      </div>

      <OrganigramaEditor
        modulo="gerencia"
        itemKeyNodos="estructura_organizacional"
        itemKeyConexiones="estructura_organizacional_conexiones"
      />
    </div>
  );
}
