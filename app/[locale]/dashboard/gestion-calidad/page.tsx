"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseOportunidadesMejora, estaAbiertaOM } from "@/lib/oportunidadesMejora";
import { parseLeccionesAprendidas } from "@/lib/leccionesAprendidas";
import { parseProcedimientos } from "@/lib/procedimientos";

const NARANJA = "#F97316";

function TarjetaBloqueada({ icono, titulo, descripcion }: { icono: string; titulo: string; descripcion: string }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
      <span className="relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
        <span className="text-2xl">{icono}</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-[#1A1A1A]">{titulo}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
            🔒 Próximamente
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{descripcion}</p>
      </div>
    </div>
  );
}

export default function GestionCalidadPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);
  const oportunidades = parseOportunidadesMejora(docs["oportunidades_mejora_lista"] ?? "");
  const lecciones = parseLeccionesAprendidas(docs["lecciones_aprendidas_lista"] ?? "");
  const procedimientos = parseProcedimientos(docs["procedimientos_lista"] ?? "");
  const omAbiertas = oportunidades.filter((o) => estaAbiertaOM(o.estado)).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Calidad</h1>
        <p className="text-gray-500 text-sm mt-1">
          Procedimientos, mejora continua, conocimiento organizacional y control documental — ISO 9001.
        </p>
      </div>

      {!loading && (oportunidades.length > 0 || lecciones.length > 0 || procedimientos.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-[#1A1A1A]">{procedimientos.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Procedimientos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-[#1A1A1A]">{oportunidades.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Oportunidades de mejora</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold" style={{ color: omAbiertas > 0 ? NARANJA : "#1A1A1A" }}>{omAbiertas}</p>
            <p className="text-xs text-gray-500 mt-0.5">En curso</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-[#1A1A1A]">{lecciones.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lecciones aprendidas</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Link
          href={`${basePath}/procedimientos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              📋
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión de Procedimientos</h2>
              {!loading && procedimientos.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {procedimientos.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Procedimientos, instructivos y formatos organizados según el Mapa de Procesos (ISO 9001 cl. 7.5).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/oportunidades_mejora`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              💡
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión de Oportunidades de Mejora</h2>
              {!loading && oportunidades.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {oportunidades.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Ciclo PHVA completo con priorización por impacto y esfuerzo (ISO 9001 cl. 10.1 / 10.3).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/lecciones_aprendidas`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              🧠
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión de Lecciones Aprendidas</h2>
              {!loading && lecciones.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {lecciones.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Biblioteca de conocimiento organizacional: aciertos a replicar y errores a no repetir (ISO 9001 cl. 7.1.6).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/matrices`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              📐
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Matrices</h2>
            <p className="text-xs text-gray-500 mt-0.5">Matrices de gestión transversales a los procesos, empezando por requisitos legales.</p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>
        <TarjetaBloqueada icono="🧩" titulo="Caracterizaciones de Procesos" descripcion="Ficha de entradas, salidas, recursos y controles de cada proceso." />
        <TarjetaBloqueada icono="🗄️" titulo="Gestión de Control de Documentos" descripcion="Versionado, aprobación y distribución de documentos del SGC." />
        <TarjetaBloqueada icono="🕵️" titulo="Gestión de Auditoría" descripcion="Programa, planes e informes de auditoría interna." />
      </div>

      <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F97316] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
        <p className="text-gray-400 text-sm mb-4">
          Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
        </p>
        <a
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F97316] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#C2410C] transition-colors text-sm"
        >
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}
