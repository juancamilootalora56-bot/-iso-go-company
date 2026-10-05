"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";

const ITEM_KEY = "personal_lista";

export default function GestionPersonalPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión del Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Perfil de cada colaborador cargado.</p>
        </div>
        <Link
          href={`${basePath}/alta_personal`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar personal
        </Link>
      </div>

      {personal.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún colaborador.</p>
          <Link
            href={`${basePath}/alta_personal`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar personal
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personal.map((p) => (
            <Link
              key={p.id}
              href={`${basePath}/gestion_personal/${p.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-gray-500 truncate">{p.cargo || "—"}</p>
                  {p.area && <p className="text-[11px] text-gray-400 truncate">{p.area}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
