"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parsePersonal } from "@/lib/personal";

export default function GestionTalentoHumanoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const cantidadPersonal = parsePersonal(docs["personal_lista"] ?? "").length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión del Talento Humano</h1>
        <p className="text-gray-500 text-sm mt-1">Perfiles de cargo, capacitaciones y desarrollo de tu equipo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`${basePath}/alta_personal`}
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#F5A623]/40 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🧾</span>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-[#1A1A1A] mb-1">Alta de Personal</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cargá los datos completos de cada colaborador, con foto.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`${basePath}/gestion_personal`}
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#F5A623]/40 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🪪</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión del Personal</h2>
                {!loading && cantidadPersonal > 0 && (
                  <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {cantidadPersonal}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Perfil individual de cada colaborador cargado.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`${basePath}/capacitaciones_generales`}
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#F5A623]/40 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🎓</span>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-[#1A1A1A] mb-1">Capacitaciones Generales</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Matriz y gráficos de todas las capacitaciones del personal.
              </p>
            </div>
          </div>
        </Link>

        {[
          { icon: "📝", titulo: "Evaluación de desempeño", descripcion: "Seguimiento periódico del desempeño de cada colaborador." },
          { icon: "🚪", titulo: "Inducción de personal", descripcion: "Proceso de incorporación de nuevos integrantes." },
        ].map((s) => (
          <div key={s.titulo} className="bg-white rounded-xl p-5 border border-gray-100 opacity-70">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-sm text-[#1A1A1A]">{s.titulo}</h2>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Próximamente
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
