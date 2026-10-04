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
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span>🧭</span> FODA
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Marcá los ítems más comunes en cada categoría, o agregá los tuyos.
          </p>
        </div>
        {totalSeleccionados > 0 && (
          <Link
            href={`${basePath}/foda/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver matriz actual →
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {FODA_CATEGORIAS.map((cat) => (
          <div key={cat.key} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: cat.color }}
            >
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <span>{cat.icono}</span> {cat.label}
              </h2>
              <span className="text-white/90 text-xs font-semibold">
                {seleccion[cat.key].length} seleccionadas
              </span>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {FODA_ITEMS_COMUNES[cat.key].map((item) => (
                <label key={item} className="flex items-start gap-2 py-1 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={seleccion[cat.key].includes(item)}
                    onChange={() => toggle(cat.key, item)}
                    className="mt-0.5 accent-[#F5A623]"
                  />
                  {item}
                </label>
              ))}
            </div>

            <div className="px-4 pb-4 flex gap-2">
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
                className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]"
              />
              <button
                type="button"
                onClick={() => agregarPersonalizado(cat.key)}
                className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] px-2"
              >
                + Agregar
              </button>
            </div>

            {seleccion[cat.key].some((i) => !FODA_ITEMS_COMUNES[cat.key].includes(i)) && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {seleccion[cat.key]
                  .filter((i) => !FODA_ITEMS_COMUNES[cat.key].includes(i))
                  .map((i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {i}
                      <button onClick={() => toggle(cat.key, i)} className="text-gray-400 hover:text-red-500">
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar y ver matriz →"}
        </button>
      </div>
    </div>
  );
}
