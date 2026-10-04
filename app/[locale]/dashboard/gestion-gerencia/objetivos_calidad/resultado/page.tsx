"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseObjetivos } from "@/lib/objetivosCalidad";

const ITEM_KEY = "objetivos_calidad";

export default function ObjetivosCalidadResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const objetivos = parseObjetivos(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Objetivos de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de todos los objetivos cargados.</p>
        </div>
        <Link
          href={`${basePath}/objetivos_calidad`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar objetivos
        </Link>
      </div>

      {objetivos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún objetivo.</p>
          <Link
            href={`${basePath}/objetivos_calidad`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar objetivo
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="p-3 font-semibold border-b border-gray-100">Objetivo</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-40">Indicador</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-32">Meta</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-36">Responsable</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-28">Plazo</th>
              </tr>
            </thead>
            <tbody>
              {objetivos.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 align-top">
                  <td className="p-3 font-semibold text-[#1A1A1A] whitespace-pre-wrap">{o.objetivo}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{o.indicador}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{o.meta}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{o.responsable || "—"}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{o.plazo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
