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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión del Talento Humano</h1>
        <p className="text-gray-500 text-sm mt-1">Perfiles de cargo, capacitaciones y desarrollo de tu equipo.</p>
      </div>

      <div className="space-y-2">
        <Link
          href={`${basePath}/alta_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🧾
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Personal</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cargá los datos completos de cada colaborador, con foto.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/gestion_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🪪
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión del Personal</h2>
              {!loading && cantidadPersonal > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadPersonal}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil individual de cada colaborador cargado.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/capacitaciones_generales`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🎓
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Capacitaciones Generales</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriz y gráficos de todas las capacitaciones del personal.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/evaluaciones_generales`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              📊
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Evaluaciones Generales</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriz y gráficos del desempeño de todo el personal.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        {[
          { icon: "🚪", titulo: "Inducción de personal", descripcion: "Proceso de incorporación de nuevos integrantes." },
        ].map((s) => (
          <div key={s.titulo} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
            <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
              <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
                {s.icon}
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-[#1A1A1A]">{s.titulo}</h2>
                <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
