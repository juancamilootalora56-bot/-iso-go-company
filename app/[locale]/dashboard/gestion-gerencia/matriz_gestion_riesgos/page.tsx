"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista } from "@/lib/mapaProcesos";
import { slugify, parseFilasRiesgo } from "@/lib/riesgos";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

const ITEM_KEY_PROCESOS = "mapa_procesos_seleccion";

export default function MatrizGestionRiesgosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const procesosMapa = parseLista(docs[ITEM_KEY_PROCESOS] ?? "");

  const botones = [
    { slug: "gerencia", label: "Gerencia / Dueños" },
    ...procesosMapa.map((p) => ({ slug: slugify(p), label: p })),
  ];

  const totalRiesgos = Object.keys(docs)
    .filter((k) => k.startsWith("riesgos_matriz_"))
    .reduce((s, k) => s + parseFilasRiesgo(docs[k] ?? "").length, 0);

  const procesosConRiesgos = botones.filter((b) => parseFilasRiesgo(docs[`riesgos_matriz_${b.slug}`] ?? "").length > 0).length;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Matriz de la Gestión de Riesgos</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Elegí un proceso para cargar sus debilidades y amenazas. Todo se junta en una sola matriz.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">
                {procesosConRiesgos}/{botones.length}
              </p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Procesos</p>
            </div>
            {totalRiesgos > 0 && (
              <Link
                href={`${basePath}/matriz_gestion_riesgos/resultado`}
                className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0 whitespace-nowrap"
              >
                Ver matriz ({totalRiesgos}) →
              </Link>
            )}
          </div>
        </div>
      </div>

      {procesosMapa.length === 0 && (
        <div className="bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-lg p-4 mb-4 text-sm text-[#8A6214]">
          Todavía no cargaste procesos en{" "}
          <Link href={`${basePath}/mapa_procesos`} className="underline font-semibold">
            Mapa de Procesos
          </Link>
          . Podés completar igual el de Gerencia / Dueños, o volver a cargar tus procesos primero.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {botones.map((b) => {
          const filas = parseFilasRiesgo(docs[`riesgos_matriz_${b.slug}`] ?? "");
          const completo = filas.length > 0;
          return (
            <Link
              key={b.slug}
              href={
                b.slug === "gerencia"
                  ? `${basePath}/matriz_gestion_riesgos/resultado`
                  : `${basePath}/matriz_gestion_riesgos/${b.slug}/foda`
              }
              className={`group flex items-center gap-3 bg-white rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                completo ? "border-[#F5A623]/25" : "border-gray-100 border-dashed hover:border-gray-200"
              }`}
            >
              {completo ? (
                <CheckCircle2 size={20} className="text-[#F5A623] flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1A1A1A] truncate">{b.label}</p>
                <p className={`text-xs mt-0.5 ${completo ? "text-[#8A6214] font-semibold" : "text-gray-400"}`}>
                  {completo ? `${filas.length} riesgos cargados` : "Sin riesgos todavía"}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
