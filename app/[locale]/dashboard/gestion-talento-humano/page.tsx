"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { parsePersonal } from "@/lib/personal";
import { parseVacantes } from "@/lib/seleccionPersonal";
import { parseTests } from "@/lib/testHabilidades";
import {
  Briefcase,
  UserPlus,
  Users,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  ClipboardList,
  DoorOpen,
} from "lucide-react";

const ACENTO = "#F5A623";

export default function GestionTalentoHumanoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;
  const puedeVer = usePuedeVerActividad("talento_humano");

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const cantidadPersonal = parsePersonal(docs["personal_lista"] ?? "").length;
  const cantidadVacantes = parseVacantes(docs["seleccion_vacantes_lista"] ?? "").length;
  const cantidadTests = parseTests(docs["test_habilidades_lista"] ?? "").length;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gestión del Talento Humano</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">Perfiles de cargo, capacitaciones y desarrollo de tu equipo.</p>
        </div>
      </div>

      <div className="space-y-2">
        {puedeVer("seleccion_personal") && (
        <Link
          href={`${basePath}/seleccion_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#2563EB" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#2563EB18" }}>
            <Briefcase size={22} style={{ color: "#2563EB" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Selección y Contratación de Personal</h2>
              {!loading && cantidadVacantes > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadVacantes}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Pipeline de reclutamiento: requerimiento, búsqueda, entrevistas, test de habilidades y contratación.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("alta_personal") && (
        <Link
          href={`${basePath}/alta_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#16A34A" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#16A34A18" }}>
            <UserPlus size={22} style={{ color: "#16A34A" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Personal</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cargá los datos completos de cada colaborador, con foto.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("gestion_personal") && (
        <Link
          href={`${basePath}/gestion_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#0891B2" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#0891B218" }}>
            <Users size={22} style={{ color: "#0891B2" }} strokeWidth={2} />
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
        )}

        {puedeVer("calendario_personal") && (
        <Link
          href={`${basePath}/calendario_personal`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#F5A623" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#F5A62318" }}>
            <CalendarDays size={22} style={{ color: "#F5A623" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Calendario de Colaboradores</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tu planificación personal, organizada por proceso. Cada colaborador tiene el suyo.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("capacitaciones_generales") && (
        <Link
          href={`${basePath}/capacitaciones_generales`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#7C4DFF" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#7C4DFF18" }}>
            <GraduationCap size={22} style={{ color: "#7C4DFF" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Capacitaciones Generales</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriz y gráficos de todas las capacitaciones del personal.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("evaluaciones_generales") && (
        <Link
          href={`${basePath}/evaluaciones_generales`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#E8366B" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#E8366B18" }}>
            <ClipboardCheck size={22} style={{ color: "#E8366B" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Evaluaciones Generales</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriz y gráficos del desempeño de todo el personal.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("test_habilidades") && (
        <Link
          href={`${basePath}/test_habilidades`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#D97706" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#D9770618" }}>
            <ClipboardList size={22} style={{ color: "#D97706" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Test de Habilidades</h2>
              {!loading && cantidadTests > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadTests}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Cuestionario de 18 competencias con calificación e interpretación automática.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 opacity-70" style={{ borderLeftColor: "#D1D5DB" }}>
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
            <DoorOpen size={22} className="text-gray-400" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Inducción de personal</h2>
              <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Próximamente
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Proceso de incorporación de nuevos integrantes.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F5A623] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
        <p className="text-gray-400 text-sm mb-4">
          Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
        </p>
        <a
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#C9790A] transition-colors text-sm"
        >
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}
