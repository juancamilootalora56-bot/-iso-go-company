"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { COLORES_VALORES, parseValores } from "@/lib/valoresEstructura";

const ITEM_KEY_VALORES = "valores_lista";

// Ancho de cada nivel de la pirámide, del vértice (índice 0) a la base (índice 6),
// como porcentaje del ancho total de la columna de la pirámide.
const ANCHOS_NIVEL = [22, 35, 48, 61, 74, 87, 100];

const ANCHO_COLUMNA_PX = 220;

export default function ValoresResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const valores = parseValores(docs[ITEM_KEY_VALORES] ?? "");
  const hayValores = valores.some((v) => v.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Pirámide de Valores Organizacionales</h1>
          <p className="text-gray-500 text-sm mt-1">Tus 7 valores, de mayor a menor prioridad.</p>
        </div>
        <Link
          href={`${basePath}/valores_organizacionales/valores`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          ✎ Editar valores
        </Link>
      </div>

      {!hayValores ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no definiste tus valores organizacionales.</p>
          <Link
            href={`${basePath}/valores_organizacionales`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Empezar
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-10">
          <div className="flex flex-col gap-[3px]">
            {valores.map((texto, idx) => {
              const anchoPropio = ANCHOS_NIVEL[idx];
              const anchoPrevio = idx === 0 ? 0 : ANCHOS_NIVEL[idx - 1];
              // Recorte en forma de trapecio: el tope coincide con el ancho del nivel anterior,
              // la base coincide con el ancho propio. El primer nivel queda como un triángulo.
              const insetTopo = ((anchoPropio - anchoPrevio) / anchoPropio / 2) * 100;
              const clipPath =
                idx === 0
                  ? "polygon(50% 0, 100% 100%, 0% 100%)"
                  : `polygon(${insetTopo}% 0, ${100 - insetTopo}% 0, 100% 100%, 0% 100%)`;
              const color = COLORES_VALORES[idx];
              const tieneTexto = texto.trim().length > 0;

              return (
                <div key={idx} className="flex items-center">
                  {/* Columna fija de la pirámide: cada nivel centrado sobre el mismo eje */}
                  <div
                    className="flex-shrink-0 h-11 sm:h-12 flex justify-center"
                    style={{ width: ANCHO_COLUMNA_PX }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${anchoPropio}%`,
                        backgroundColor: tieneTexto ? color : "#E5E7EB",
                        clipPath,
                      }}
                    />
                  </div>

                  {/* Etiqueta del valor */}
                  <div
                    className={`flex-1 min-w-0 rounded-full flex items-center justify-between gap-2 pl-5 pr-2 py-2.5 shadow-sm ${
                      tieneTexto ? "bg-gray-50" : "bg-gray-50/50"
                    }`}
                  >
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        tieneTexto ? "text-[#1A1A1A]" : "text-gray-300 italic font-normal"
                      }`}
                    >
                      {tieneTexto ? texto : "Sin definir"}
                    </span>
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                      style={{ backgroundColor: tieneTexto ? color : "#D1D5DB" }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
