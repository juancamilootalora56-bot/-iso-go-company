"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { FODA_CATEGORIAS, itemKeyFoda, parseFodaItems } from "@/lib/fodaItems";

export default function FodaResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const totalSeleccionados = FODA_CATEGORIAS.reduce(
    (s, c) => s + parseFodaItems(docs[itemKeyFoda(c.key)] ?? "").length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz FODA</h1>
          <p className="text-gray-500 text-sm mt-1">Resultado de las categorías seleccionadas.</p>
        </div>
        <Link
          href={`${basePath}/foda`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          ✎ Editar selección
        </Link>
      </div>

      {totalSeleccionados === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún ítem.</p>
          <Link
            href={`${basePath}/foda`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Completar FODA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FODA_CATEGORIAS.map((cat) => {
            const items = parseFodaItems(docs[itemKeyFoda(cat.key)] ?? "");
            return (
              <div key={cat.key} className="rounded-xl overflow-hidden" style={{ backgroundColor: cat.color }}>
                <div className="p-4">
                  <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Matriz FODA</p>
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>{cat.icono}</span> {cat.label}
                  </h2>
                </div>
                <div className="bg-white mx-3 mb-3 rounded-lg p-3 max-h-72 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-gray-400 text-xs italic">Sin ítems seleccionados.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span className="text-gray-300 mt-0.5">⠿</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
