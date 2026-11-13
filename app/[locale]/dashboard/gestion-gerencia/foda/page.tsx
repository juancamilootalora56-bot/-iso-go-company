"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  FODA_CATEGORIAS,
  FODA_ITEMS_COMUNES,
  itemKeyFoda,
  parseFodaItems,
  type FodaCategoria,
} from "@/lib/fodaItems";
import { Check, Plus, X } from "lucide-react";

// Variante más oscura de cada color de categoría, solo para el degradé del
// encabezado — los colores base siguen siendo los de lib/fodaItems.ts (los
// mismos que usa el resultado final), no se tocan acá.
const COLOR_HASTA: Record<FodaCategoria, string> = {
  debilidades: "#e09410",
  oportunidades: "#c42554",
  fortalezas: "#1c7fc2",
  amenazas: "#5b35cc",
};

export default function FodaSeleccionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [seleccion, setSeleccion] = useState<Record<FodaCategoria, string[]>>({
    debilidades: [],
    oportunidades: [],
    fortalezas: [],
    amenazas: [],
  });
  const [nuevoItem, setNuevoItem] = useState<Record<FodaCategoria, string>>({
    debilidades: "",
    oportunidades: "",
    fortalezas: "",
    amenazas: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      const next = {} as Record<FodaCategoria, string[]>;
      FODA_CATEGORIAS.forEach((c) => {
        next[c.key] = parseFodaItems(docs[itemKeyFoda(c.key)] ?? "");
      });
      setSeleccion(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function toggle(categoria: FodaCategoria, item: string) {
    setSeleccion((prev) => {
      const actual = prev[categoria];
      const yaEsta = actual.includes(item);
      return {
        ...prev,
        [categoria]: yaEsta ? actual.filter((i) => i !== item) : [...actual, item],
      };
    });
  }

  function agregarPersonalizado(categoria: FodaCategoria) {
    const texto = nuevoItem[categoria].trim();
    if (!texto) return;
    setSeleccion((prev) => ({
      ...prev,
      [categoria]: prev[categoria].includes(texto) ? prev[categoria] : [...prev[categoria], texto],
    }));
    setNuevoItem((prev) => ({ ...prev, [categoria]: "" }));
  }

  async function handleGuardar() {
    setSaving(true);
    await Promise.all(
      FODA_CATEGORIAS.map((c) => save(itemKeyFoda(c.key), JSON.stringify(seleccion[c.key])))
    );
    setSaving(false);
    router.push(`${basePath}/foda/resultado`);
  }

  const totalSeleccionados = Object.values(seleccion).reduce((s, arr) => s + arr.length, 0);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado — mismo lenguaje visual que el resto de las actividades
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
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Análisis estratégico
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">FODA</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Marcá los ítems más comunes en cada categoría, o agregá los tuyos propios.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{totalSeleccionados}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Seleccionados</p>
            </div>
            {totalSeleccionados > 0 && (
              <Link
                href={`${basePath}/foda/resultado`}
                className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
              >
                Ver matriz actual →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {FODA_CATEGORIAS.map((cat) => {
          const personalizados = seleccion[cat.key].filter((i) => !FODA_ITEMS_COMUNES[cat.key].includes(i));
          return (
            <div key={cat.key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div
                className="px-4 py-3 flex items-center gap-2.5"
                style={{ background: `linear-gradient(to right, ${cat.color}, ${COLOR_HASTA[cat.key]})` }}
              >
                <span className="text-base flex-shrink-0">{cat.icono}</span>
                <h2 className="text-white font-bold text-xs uppercase tracking-wide flex-1">{cat.label}</h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {seleccion[cat.key].length} seleccionadas
                </span>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                  {FODA_ITEMS_COMUNES[cat.key].map((item) => {
                    const activo = seleccion[cat.key].includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggle(cat.key, item)}
                        aria-pressed={activo}
                        className={`relative text-left rounded-lg border-2 pl-3 pr-6 py-2 text-[12.5px] leading-snug transition-all ${
                          activo
                            ? "shadow-sm font-semibold text-[#1A1A1A]"
                            : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                        style={activo ? { borderColor: cat.color, background: `${cat.color}0D` } : undefined}
                      >
                        {activo && (
                          <span
                            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: cat.color }}
                          >
                            <Check size={9} strokeWidth={3.5} className="text-white" />
                          </span>
                        )}
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    value={nuevoItem[cat.key]}
                    onChange={(e) => setNuevoItem((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarPersonalizado(cat.key);
                      }
                    }}
                    placeholder="Agregar otro ítem..."
                    className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors focus:ring-[color:var(--cat-color)]/15 focus:border-[color:var(--cat-color)]"
                    style={{ "--cat-color": cat.color } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => agregarPersonalizado(cat.key)}
                    disabled={!nuevoItem[cat.key].trim()}
                    className="flex items-center gap-1.5 text-sm font-bold text-white disabled:opacity-40 px-4 rounded-lg transition-colors flex-shrink-0"
                    style={{ background: cat.color }}
                  >
                    <Plus size={15} strokeWidth={3} />
                    Agregar
                  </button>
                </div>

                {personalizados.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {personalizados.map((i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full flex items-center gap-1.5 border"
                        style={{ background: `${cat.color}14`, borderColor: `${cat.color}33`, color: "#1A1A1A" }}
                      >
                        {i}
                        <button
                          onClick={() => toggle(cat.key, i)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-400 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
        >
          {saving ? "Guardando..." : `Guardar ${totalSeleccionados > 0 ? `(${totalSeleccionados})` : ""} y ver matriz →`}
        </button>
      </div>
    </div>
  );
}
