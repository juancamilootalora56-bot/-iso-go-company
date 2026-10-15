"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseRequisitosLegales, porcentajeCumplimiento } from "@/lib/requisitosLegales";

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

export default function MatricesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);
  const requisitos = parseRequisitosLegales(docs["matriz_requisitos_legales"] ?? "");
  const cumplimiento = porcentajeCumplimiento(requisitos);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block mb-4">
        ← Gestión de Calidad
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matrices</h1>
        <p className="text-gray-500 text-sm mt-1">Matrices de gestión transversales a los procesos de la organización.</p>
      </div>

      <div className="space-y-2">
        <Link
          href={`${basePath}/matrices/requisitos_legales`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316]/40 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#C2410C] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE4CC] text-xl">
              ⚖️
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Matriz de Requisitos Legales</h2>
              {!loading && requisitos.length > 0 && (
                <span
                  className="text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ color: cumplimiento >= 80 ? "#15803D" : "#92400E", backgroundColor: cumplimiento >= 80 ? "#DCFCE7" : "#FEF3C7" }}
                >
                  {requisitos.length} · {cumplimiento}% cumple
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Identificación y seguimiento del cumplimiento legal y reglamentario aplicable (ISO 9001 cl. 4.2 / 8.2.2).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
        </Link>

        <TarjetaBloqueada icono="⚠️" titulo="Matriz de Riesgos y Oportunidades por Proceso" descripcion="Identificación de riesgos del SGC a nivel de cada proceso." />
        <TarjetaBloqueada icono="🎯" titulo="Matriz de Competencias" descripcion="Competencias requeridas vs. competencias del personal por cargo." />
        <TarjetaBloqueada icono="📡" titulo="Matriz de Comunicaciones" descripcion="Qué, a quién, cuándo y cómo se comunica dentro del SGC." />
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
