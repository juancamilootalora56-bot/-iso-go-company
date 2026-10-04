"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { COLORES_VALORES, parseValores } from "@/lib/valoresEstructura";

const ITEM_KEY_VALORES = "valores_lista";

// Filas de la pirámide, de arriba (vértice) hacia abajo (base): 1, 2, 4 = 7 valores.
const FILAS = [1, 2, 4];

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

  let cursor = 0;
  const filasConValores = FILAS.map((cantidad) => {
    const items = valores.slice(cursor, cursor + cantidad).map((texto, i) => ({
      texto,
      color: COLORES_VALORES[cursor + i],
    }));
    cursor += cantidad;
    return items;
  });

  const anchos = ["w-[30%]", "w-[60%]", "w-[90%]"];

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
        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center gap-2">
            {filasConValores.map((fila, filaIdx) => (
              <div key={filaIdx} className={`flex items-center justify-center gap-2 ${anchos[filaIdx]}`}>
                {fila.map((item, i) =>
                  item.texto.trim() ? (
                    <div
                      key={i}
                      className="flex-1 text-white text-xs sm:text-sm font-bold text-center px-3 py-3 rounded-lg shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.texto}
                    </div>
                  ) : (
                    <div key={i} className="flex-1 border border-dashed border-gray-200 text-gray-300 text-xs text-center px-3 py-3 rounded-lg">
                      —
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
