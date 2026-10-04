"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista } from "@/lib/mapaProcesos";
import { slugify, parseFilasRiesgo } from "@/lib/riesgos";

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

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span>⚠️</span> Matriz de la Gestión de Riesgos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Elegí un proceso para cargar sus debilidades y amenazas. Todo se junta en una sola matriz.
          </p>
        </div>
        {totalRiesgos > 0 && (
          <Link
            href={`${basePath}/matriz_gestion_riesgos/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver matriz completa ({totalRiesgos}) →
          </Link>
        )}
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
          return (
            <Link
              key={b.slug}
              href={
                b.slug === "gerencia"
                  ? `${basePath}/matriz_gestion_riesgos/resultado`
                  : `${basePath}/matriz_gestion_riesgos/${b.slug}/foda`
              }
              className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{b.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filas.length > 0 ? `${filas.length} riesgos cargados` : "Sin riesgos todavía"}
                </p>
              </div>
              <span className="text-gray-300">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
