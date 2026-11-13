"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { FODA_CATEGORIAS, itemKeyFoda, parseFodaItems, type FodaCategoria } from "@/lib/fodaItems";

// Misma variante oscura por categoría que usa la página de selección —
// solo para el degradé del encabezado de cada tarjeta.
const COLOR_HASTA: Record<FodaCategoria, string> = {
  debilidades: "#e09410",
  oportunidades: "#c42554",
  fortalezas: "#1c7fc2",
  amenazas: "#5b35cc",
};

export default function FodaResultadoPage() {
  const { user, profile } = useDashboardUser();
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
    <div className="max-w-5xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado — mismo lenguaje visual que el resto de los resultados
          de Gestión de la Gerencia (fondo oscuro, grilla sutil, glow dorado). */}
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
        {profile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo_url}
            alt=""
            className="absolute right-6 bottom-0 w-32 h-32 object-contain opacity-[0.06] pointer-events-none select-none"
          />
        )}
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Análisis estratégico
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Matriz FODA</h1>
            <p className="text-gray-400 text-sm mt-1">Resultado de las categorías seleccionadas.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{totalSeleccionados}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Ítems</p>
            </div>
            <Link
              href={`${basePath}/foda`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
            >
              ✎ Editar selección
            </Link>
          </div>
        </div>
      </div>

      {totalSeleccionados === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún ítem.</p>
          <Link
            href={`${basePath}/foda`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Completar FODA
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {FODA_CATEGORIAS.map((cat) => {
            const items = parseFodaItems(docs[itemKeyFoda(cat.key)] ?? "");
            return (
              <div key={cat.key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div
                  className="px-4 py-3.5 flex items-center gap-2.5"
                  style={{ background: `linear-gradient(to right, ${cat.color}, ${COLOR_HASTA[cat.key]})` }}
                >
                  <span className="text-lg flex-shrink-0">{cat.icono}</span>
                  <h2 className="text-white font-bold text-sm uppercase tracking-wide flex-1">{cat.label}</h2>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {items.length}
                  </span>
                </div>
                <div className="p-4 flex-1">
                  {items.length === 0 ? (
                    <p className="text-gray-300 text-xs italic text-center py-6">Sin ítems seleccionados.</p>
                  ) : (
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li
                          key={item}
                          className="text-[13px] text-gray-700 flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: cat.color }}
                          />
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
