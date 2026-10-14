"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProyectosDiseno, proyectoDisenoAbierto, proyectoDisenoVencido } from "@/lib/disenoDesarrollo";
import { parseCambiosDiseno, cambioDisenoAbierto } from "@/lib/cambiosDiseno";

export default function GestionDisenoDesarrolloPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);
  const proyectos = parseProyectosDiseno(docs["proyectos_diseno_lista"] ?? "");
  const cambios = parseCambiosDiseno(docs["cambios_diseno_lista"] ?? "");
  const activos = proyectos.filter((p) => proyectoDisenoAbierto(p.estado)).length;
  const vencidos = proyectos.filter((p) => proyectoDisenoVencido(p)).length;
  const cambiosAbiertos = cambios.filter((c) => cambioDisenoAbierto(c.estado)).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Diseño y Desarrollo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Planificación, entradas, salidas, revisión, verificación, validación y control de cambios — ISO 9001 cláusula 8.3.
        </p>
      </div>

      {!loading && proyectos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-[#1A1A1A]">{activos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Proyectos activos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold" style={{ color: vencidos > 0 ? "#EF4444" : "#1A1A1A" }}>{vencidos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Vencidos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-[#1A1A1A]">{cambiosAbiertos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cambios en curso</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Link
          href={`${basePath}/inscripcion_proyecto`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#14B8A6]/40 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#0d9488] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-diseno-desarrollo/proyectos_diseno.jpg" alt="Alta de Proyecto" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Proyecto</h2>
            <p className="text-xs text-gray-500 mt-0.5">Formulario de alta de un nuevo proyecto de diseño y desarrollo.</p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#14B8A6] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/proyectos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#14B8A6]/40 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#0d9488] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#E6FFFB] to-[#CCFBF1] text-xl">
              🧪
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Proyectos de Diseño</h2>
              {!loading && proyectos.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {proyectos.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil de cada proyecto: planificación, entradas, salidas y controles de diseño.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#14B8A6] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/control_cambios`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#14B8A6]/40 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#0d9488] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-diseno-desarrollo/control_cambios.jpg" alt="Control de Cambios" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Control de Cambios</h2>
              {!loading && cambios.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cambios.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Vista consolidada de las solicitudes de cambio de todos tus proyectos de diseño.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#14B8A6] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/indicadores`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#14B8A6]/40 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#0d9488] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#E6FFFB] to-[#CCFBF1] text-xl">
              📊
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Indicadores de Diseño</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Panorama general de proyectos, controles pendientes y cambios.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#14B8A6] transition-colors">›</span>
        </Link>
      </div>

      <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#14B8A6] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
        <p className="text-gray-400 text-sm mb-4">
          Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
        </p>
        <a
          href={`/${locale}/contacto`}
          className="inline-block bg-[#14B8A6] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#0d9488] transition-colors text-sm"
        >
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}
