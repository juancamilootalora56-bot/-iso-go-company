"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";

const NARANJA = "#F5A623";

export default function RelacionActividadesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personal = parsePersonal(docs["personal_lista"] ?? "");

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Relación de Actividades</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Bitácora diaria de cada colaborador, por franjas horarias, acumulada mes a mes. Elegí un colaborador para
          ver o registrar su jornada.
        </p>
      </div>

      {personal.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Todavía no hay colaboradores registrados en <strong>Gestión del Talento Humano</strong>.
          </p>
          <Link href={`/${locale}/dashboard/gestion-talento-humano/alta_personal`} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Dar de alta un colaborador →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personal.map((p) => (
            <Link
              key={p.id}
              href={`${basePath}/relacion_actividades/${p.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-[#F5A623]/40 hover:shadow-[0_4px_16px_-4px_rgba(245,166,35,0.2)] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {p.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.foto} alt={`${p.nombre} ${p.apellido}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                  {p.nombre} {p.apellido}
                </p>
                <p className="text-xs text-gray-500 truncate">{p.cargo || "Sin cargo"}</p>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
