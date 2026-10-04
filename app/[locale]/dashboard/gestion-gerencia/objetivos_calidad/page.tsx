"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  OBJETIVOS_SUGERIDOS,
  parseObjetivos,
  objetivoDesdeSugerido,
  objetivoPersonalizadoVacio,
  type ObjetivoCalidad,
} from "@/lib/objetivosCalidad";

const ITEM_KEY = "objetivos_calidad";

export default function ObjetivosCalidadPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [areaPersonalizando, setAreaPersonalizando] = useState<string | null>(null);
  const [formPersonalizado, setFormPersonalizado] = useState<ObjetivoCalidad | null>(null);

  useEffect(() => {
    if (!loading) {
      setObjetivos(parseObjetivos(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function estaSeleccionado(id: string) {
    return objetivos.some((o) => o.id === id);
  }

  function toggleSugerido(area: string, sugerido: Parameters<typeof objetivoDesdeSugerido>[1]) {
    const o = objetivoDesdeSugerido(area, sugerido);
    setObjetivos((prev) =>
      prev.some((x) => x.id === o.id) ? prev.filter((x) => x.id !== o.id) : [...prev, o]
    );
  }

  function eliminar(id: string) {
    setObjetivos((prev) => prev.filter((o) => o.id !== id));
  }

  function abrirPersonalizado(area: string) {
    setAreaPersonalizando(area);
    setFormPersonalizado(objetivoPersonalizadoVacio(area));
  }

  function agregarPersonalizado() {
    if (!formPersonalizado || !formPersonalizado.objetivo.trim()) return;
    setObjetivos((prev) => [...prev, formPersonalizado]);
    setAreaPersonalizando(null);
    setFormPersonalizado(null);
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(objetivos));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-2 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Objetivos de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">Elegí los objetivos de cada área</p>
        </div>
        {objetivos.length > 0 && (
          <Link
            href={`${basePath}/objetivos_calidad/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver matriz ({objetivos.length}) →
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Por cada área, te sugerimos objetivos de calidad comunes con su indicador, fórmula de medición, meta
        y frecuencia. Marcá los que apliquen a tu empresa; también podés agregar objetivos propios en
        cualquier área.
      </p>

      <div className="space-y-5">
        {OBJETIVOS_SUGERIDOS.map((areaData) => (
          <div key={areaData.area} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: areaData.color }} />
              <h2 className="text-sm font-bold text-[#1A1A1A]">{areaData.area}</h2>
            </div>

            <div className="p-4 space-y-3">
              {areaData.sugeridos.map((s) => {
                const o = objetivoDesdeSugerido(areaData.area, s);
                const checked = estaSeleccionado(o.id);
                return (
                  <label
                    key={o.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked ? "border-[#F5A623] bg-[#F5A623]/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSugerido(areaData.area, s)}
                      className="mt-1 w-4 h-4 accent-[#F5A623] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{s.objetivo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium text-gray-600">{s.indicador}</span> · Meta: {s.meta} · {s.frecuencia}
                      </p>
                    </div>
                  </label>
                );
              })}

              {/* Objetivos personalizados ya agregados en esta área */}
              {objetivos
                .filter((o) => o.area === areaData.area && !areaData.sugeridos.some((s) => objetivoDesdeSugerido(areaData.area, s).id === o.id))
                .map((o) => (
                  <div key={o.id} className="flex items-start gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/40">
                    <span className="mt-1 text-blue-500 flex-shrink-0">✓</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{o.objetivo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {o.indicador && <span className="font-medium text-gray-600">{o.indicador}</span>}
                        {o.meta && <> · Meta: {o.meta}</>}
                        {o.frecuencia && <> · {o.frecuencia}</>}
                      </p>
                    </div>
                    <button onClick={() => eliminar(o.id)} className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0">
                      Eliminar
                    </button>
                  </div>
                ))}

              {areaPersonalizando === areaData.area && formPersonalizado ? (
                <div className="p-3 rounded-lg border border-dashed border-gray-300 space-y-2">
                  <input
                    value={formPersonalizado.objetivo}
                    onChange={(e) => setFormPersonalizado((f) => f && { ...f, objetivo: e.target.value })}
                    placeholder="Objetivo..."
                    className={inputClass}
                  />
                  <input
                    value={formPersonalizado.indicador}
                    onChange={(e) => setFormPersonalizado((f) => f && { ...f, indicador: e.target.value })}
                    placeholder="Indicador KPI..."
                    className={inputClass}
                  />
                  <input
                    value={formPersonalizado.formula}
                    onChange={(e) => setFormPersonalizado((f) => f && { ...f, formula: e.target.value })}
                    placeholder="Fórmula de medición..."
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={formPersonalizado.meta}
                      onChange={(e) => setFormPersonalizado((f) => f && { ...f, meta: e.target.value })}
                      placeholder="Meta..."
                      className={inputClass}
                    />
                    <input
                      value={formPersonalizado.frecuencia}
                      onChange={(e) => setFormPersonalizado((f) => f && { ...f, frecuencia: e.target.value })}
                      placeholder="Frecuencia..."
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={agregarPersonalizado}
                      className="bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e09410]"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        setAreaPersonalizando(null);
                        setFormPersonalizado(null);
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => abrirPersonalizado(areaData.area)}
                  className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]"
                >
                  + Agregar objetivo personalizado en {areaData.area}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 sticky bottom-4">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 shadow-lg"
        >
          {saving ? "Guardando..." : `Guardar (${objetivos.length} seleccionados)`}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
