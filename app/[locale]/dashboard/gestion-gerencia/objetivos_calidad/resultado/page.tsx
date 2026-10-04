"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { OBJETIVOS_SUGERIDOS, parseObjetivos, type ObjetivoCalidad } from "@/lib/objetivosCalidad";

const ITEM_KEY = "objetivos_calidad";

const ORDEN_AREAS = OBJETIVOS_SUGERIDOS.map((a) => a.area);
const COLOR_POR_AREA = Object.fromEntries(OBJETIVOS_SUGERIDOS.map((a) => [a.area, a.color]));

function agruparPorArea(objetivos: ObjetivoCalidad[]) {
  const grupos = new Map<string, ObjetivoCalidad[]>();
  objetivos.forEach((o) => {
    if (!grupos.has(o.area)) grupos.set(o.area, []);
    grupos.get(o.area)!.push(o);
  });
  // Ordenar las áreas según el catálogo; cualquier área no listada va al final.
  return [...grupos.entries()].sort((a, b) => {
    const ia = ORDEN_AREAS.indexOf(a[0]);
    const ib = ORDEN_AREAS.indexOf(b[0]);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

function hexConAlfa(hex: string, alfa: string) {
  return `${hex}${alfa}`;
}

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
  const grupos = agruparPorArea(objetivos);

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Objetivos de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de todos los objetivos seleccionados, por área.</p>
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
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún objetivo.</p>
          <Link
            href={`${basePath}/objetivos_calidad`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Elegir objetivos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-gray-700 text-left text-white">
                <th className="p-3 font-semibold w-10">No</th>
                <th className="p-3 font-semibold w-56">Objetivo de Calidad</th>
                <th className="p-3 font-semibold w-36">Área</th>
                <th className="p-3 font-semibold w-44">Indicador KPI</th>
                <th className="p-3 font-semibold w-56">Fórmula de Medición</th>
                <th className="p-3 font-semibold w-40">Meta</th>
                <th className="p-3 font-semibold w-28">Frecuencia de Medición</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map(([area, items], grupoIdx) => {
                const color = COLOR_POR_AREA[area] ?? "#E5E7EB";
                return items.map((o, i) => (
                  <tr key={o.id} className="border-b border-gray-50 align-top" style={{ backgroundColor: hexConAlfa(color, "33") }}>
                    {i === 0 && (
                      <td className="p-3 font-bold text-[#1A1A1A] text-center" rowSpan={items.length}>
                        {grupoIdx + 1}
                      </td>
                    )}
                    <td className="p-3 font-semibold text-[#1A1A1A] whitespace-pre-wrap">{o.objetivo}</td>
                    {i === 0 && (
                      <td className="p-3 font-semibold text-[#1A1A1A]" rowSpan={items.length}>
                        {area}
                      </td>
                    )}
                    <td className="p-3 text-gray-700 whitespace-pre-wrap">{o.indicador || "—"}</td>
                    <td className="p-3 text-gray-700 whitespace-pre-wrap">{o.formula || "—"}</td>
                    <td className="p-3 text-gray-700 whitespace-pre-wrap">{o.meta || "—"}</td>
                    <td className="p-3 text-gray-700 whitespace-pre-wrap">{o.frecuencia || "—"}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
