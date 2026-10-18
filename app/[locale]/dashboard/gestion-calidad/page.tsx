"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { parseOportunidadesMejora, estaAbiertaOM } from "@/lib/oportunidadesMejora";
import { parseLeccionesAprendidas } from "@/lib/leccionesAprendidas";
import { parseProcedimientos, parseInstructivos, parseFormatos } from "@/lib/procedimientos";
import { parseCaracterizaciones } from "@/lib/caracterizacionProcesos";
import { parseOtrosDocumentos } from "@/lib/controlDocumentos";

const NARANJA = "#F97316";

function TarjetaBloqueada({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
      <span className="relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
        <span className="text-2xl">🔒</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-[#1A1A1A]">{titulo}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
            🔒 Restringido
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
  const puedeVer = usePuedeVerActividad("calidad");

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);
  const oportunidades = parseOportunidadesMejora(docs["oportunidades_mejora_lista"] ?? "");
  const lecciones = parseLeccionesAprendidas(docs["lecciones_aprendidas_lista"] ?? "");
  const procedimientos = parseProcedimientos(docs["procedimientos_lista"] ?? "");
  const caracterizaciones = parseCaracterizaciones(docs["caracterizaciones_lista"] ?? "");
  const instructivosCount = parseInstructivos(docs["instructivos_lista"] ?? "").length;
  const formatosCount = parseFormatos(docs["formatos_lista"] ?? "").length;
  const otrosDocumentos = parseOtrosDocumentos(docs["control_documentos_otros"] ?? "").length;
  const totalDocumentosControlados = procedimientos.length + instructivosCount + formatosCount + otrosDocumentos;
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
        {puedeVer("procedimientos") && (
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
        )}

        {puedeVer("oportunidades_mejora") && (
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
        )}

        {puedeVer("lecciones_aprendidas") && (
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
        )}

        {puedeVer("matrices") && (
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
        )}
        {puedeVer("caracterizaciones") && (
        <Link
          href={`${basePath}/caracterizaciones`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              🧩
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Caracterizaciones de Procesos</h2>
              {!loading && caracterizaciones.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {caracterizaciones.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Diagrama SIPOC + ciclo PHVA de cada proceso: entradas, salidas, recursos, indicadores y riesgos (ISO 9001 cl. 4.4).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>
        )}
        {puedeVer("control_documentos") && (
        <Link
          href={`${basePath}/control_documentos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              🗄️
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Gestión de Control de Documentos</h2>
              {!loading && totalDocumentosControlados > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {totalDocumentosControlados}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Listado maestro, control de versiones y aprobaciones de todos los documentos del SGC (ISO 9001 cl. 7.5.3).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>
        )}
        <TarjetaBloqueada titulo="Gestión de Auditoría" descripcion="Acceso restringido." />
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
