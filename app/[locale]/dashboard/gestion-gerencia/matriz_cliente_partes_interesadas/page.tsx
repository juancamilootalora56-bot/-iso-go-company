"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  GRUPOS_INTERESADOS,
  REQUISITOS_COMUNES,
  parseSeleccion,
  seleccionVacia,
  type GrupoInteresado,
  type SeleccionPartesInteresadas,
} from "@/lib/partesInteresadasItems";

const ITEM_KEY_SELECCION = "matriz_cliente_partes_interesadas_seleccion";

export default function MatrizPartesInteresadasSeleccionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [seleccion, setSeleccion] = useState<SeleccionPartesInteresadas>(seleccionVacia());
  const [nuevoItem, setNuevoItem] = useState<Record<GrupoInteresado, string>>({
    accionistas: "",
    colaboradores: "",
    clientes: "",
    proveedores: "",
    comunidad: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSeleccion(parseSeleccion(docs[ITEM_KEY_SELECCION] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function toggle(grupo: GrupoInteresado, item: string) {
    setSeleccion((prev) => {
      const actual = prev[grupo];
      const yaEsta = actual.includes(item);
      return { ...prev, [grupo]: yaEsta ? actual.filter((i) => i !== item) : [...actual, item] };
    });
  }

  function agregarPersonalizado(grupo: GrupoInteresado) {
    const texto = nuevoItem[grupo].trim();
    if (!texto) return;
    setSeleccion((prev) => ({
      ...prev,
      [grupo]: prev[grupo].includes(texto) ? prev[grupo] : [...prev[grupo], texto],
    }));
    setNuevoItem((prev) => ({ ...prev, [grupo]: "" }));
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_SELECCION, JSON.stringify(seleccion));
    setSaving(false);
    router.push(`${basePath}/matriz_cliente_partes_interesadas/resultado`);
  }

  const totalSeleccionados = Object.values(seleccion).reduce((s, arr) => s + arr.length, 0);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span>🧑‍🤝‍🧑</span> Matriz del Cliente y Partes Interesadas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Marcá los requisitos que aplican a cada parte interesada, o agregá los tuyos.
          </p>
        </div>
        {totalSeleccionados > 0 && (
          <Link
            href={`${basePath}/matriz_cliente_partes_interesadas/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver matriz actual →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {GRUPOS_INTERESADOS.map((g) => (
          <div key={g.key} className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-3 py-3" style={{ backgroundColor: g.color }}>
              <h2 className="text-white font-bold text-sm">{g.label}</h2>
            </div>
            <div className="p-3 flex-1 space-y-2">
              {REQUISITOS_COMUNES[g.key].map((item) => (
                <label key={item} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer border-b border-dotted border-gray-200 pb-1.5">
                  <input
                    type="checkbox"
                    checked={seleccion[g.key].includes(item)}
                    onChange={() => toggle(g.key, item)}
                    className="mt-0.5 accent-[#F5A623] flex-shrink-0"
                  />
                  <span>{item}</span>
                </label>
              ))}
              {seleccion[g.key]
                .filter((i) => !REQUISITOS_COMUNES[g.key].includes(i))
                .map((i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-700 border-b border-dotted border-gray-200 pb-1.5">
                    <span>{i}</span>
                    <button onClick={() => toggle(g.key, i)} className="text-gray-400 hover:text-red-500">✕</button>
                  </div>
                ))}
            </div>
            <div className="p-3 pt-0">
              <input
                value={nuevoItem[g.key]}
                onChange={(e) => setNuevoItem((prev) => ({ ...prev, [g.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    agregarPersonalizado(g.key);
                  }
                }}
                placeholder="Otros..."
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]"
              />
            </div>
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
