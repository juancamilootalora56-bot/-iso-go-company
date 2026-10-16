"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseServicios, colorEstadoServicio } from "@/lib/servicios";

const ITEM_KEY = "servicios_lista";

export default function ListaMaestraServiciosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const servicios = parseServicios(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión Operativa
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lista Maestra de Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">Perfil y proceso operativo de cada servicio prestado.</p>
        </div>
        <Link href={`${basePath}/inscripcion_servicios`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
          + Agregar / editar servicio
        </Link>
      </div>

      {servicios.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no diste de alta ningún servicio.</p>
          <Link href={`${basePath}/inscripcion_servicios`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Dar de alta un servicio
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((s) => (
            <Link
              key={s.id}
              href={`${basePath}/lista_maestra_servicios/${s.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {s.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">🧰</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{s.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{s.categoria || "—"}</p>
                  {s.estado && (
                    <span
                      className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: colorEstadoServicio(s.estado) }}
                    >
                      {s.estado}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
