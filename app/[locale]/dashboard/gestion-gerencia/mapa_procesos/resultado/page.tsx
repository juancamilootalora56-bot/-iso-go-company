"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista, parseClasificacion } from "@/lib/mapaProcesos";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";

export default function MapaProcesosResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const procesos = parseLista(docs[ITEM_KEY_SELECCION] ?? "");
  const clasificacion = parseClasificacion(docs[ITEM_KEY_CLASIFICACION] ?? "");

  const estrategicos = procesos.filter((p) => clasificacion[p] === "estrategicos");
  const misionales = procesos.filter((p) => clasificacion[p] === "misionales");
  const apoyo = procesos.filter((p) => clasificacion[p] === "apoyo");

  const vacio = procesos.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mapa de Procesos</h1>
          <p className="text-gray-500 text-sm mt-1">Paso 3 de 3 — Tu mapa de procesos.</p>
        </div>
        <Link
          href={`${basePath}/mapa_procesos/clasificar`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          ✎ Editar clasificación
        </Link>
      </div>

      {vacio ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no armaste tu mapa de procesos.</p>
          <Link
            href={`${basePath}/mapa_procesos`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Empezar
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-center font-bold text-[#1A1A1A] mb-6 text-lg">MAPA DE PROCESOS</h2>

          <div className="flex items-stretch gap-2">
            {/* Necesidades del cliente */}
            <div
              className="bg-[#F5A623] rounded-lg flex items-center justify-center px-2 py-4 flex-shrink-0"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              <span className="text-white text-xs font-bold whitespace-nowrap">Necesidades del cliente</span>
            </div>

            {/* Centro */}
            <div className="flex-1 flex flex-col gap-1">
              {/* Estratégicos */}
              <div className="bg-[#2EA3F2] rounded-lg p-3">
                <p className="text-white text-xs font-bold text-center mb-2">Procesos Estratégicos</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {estrategicos.length === 0 ? (
                    <span className="text-white/70 text-xs italic">Sin procesos asignados</span>
                  ) : (
                    estrategicos.map((p) => (
                      <span key={p} className="bg-white text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
                        {p}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-center text-[#F5A623] text-lg leading-none py-1">▾ ▾ ▾</div>

              {/* Misionales */}
              <div className="bg-[#2EA3F2] rounded-lg p-3">
                <p className="text-white text-xs font-bold text-center mb-2">Procesos Misionales (cadena de valor)</p>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {misionales.length === 0 ? (
                    <span className="text-white/70 text-xs italic">Sin procesos asignados</span>
                  ) : (
                    misionales.map((p, i) => (
                      <span key={p} className="flex items-center gap-1">
                        <span className="bg-white text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
                          {p}
                        </span>
                        {i < misionales.length - 1 && <span className="text-white text-sm">›</span>}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-center text-[#F5A623] text-lg leading-none py-1">▴ ▴ ▴</div>

              {/* Apoyo */}
              <div className="bg-[#2EA3F2] rounded-lg p-3">
                <p className="text-white text-xs font-bold text-center mb-2">Procesos de Apoyo</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {apoyo.length === 0 ? (
                    <span className="text-white/70 text-xs italic">Sin procesos asignados</span>
                  ) : (
                    apoyo.map((p) => (
                      <span key={p} className="bg-white text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
                        {p}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Satisfacción del cliente */}
            <div
              className="bg-[#F9C48A] rounded-lg flex items-center justify-center px-2 py-4 flex-shrink-0"
            >
              <span
                className="text-[#1A1A1A] text-xs font-bold whitespace-nowrap"
                style={{ writingMode: "vertical-rl" }}
              >
                Satisfacción del cliente
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
