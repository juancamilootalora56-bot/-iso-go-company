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
import { Check, Plus, X, Target } from "lucide-react";

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
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
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
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
              <Target size={20} style={{ color: "#F5A623" }} /> Objetivos de Calidad
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Marcá los objetivos sugeridos por área o agregá los tuyos — cada uno con su indicador, fórmula,
              meta y frecuencia.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{objetivos.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Seleccionados</p>
            </div>
            {objetivos.length > 0 && (
              <Link
                href={`${basePath}/objetivos_calidad/resultado`}
                className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0 whitespace-nowrap"
              >
                Ver matriz →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {OBJETIVOS_SUGERIDOS.map((areaData) => {
          const seleccionadosArea = objetivos.filter((o) => o.area === areaData.area).length;
          return (
            <div key={areaData.area} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div
                className="px-4 py-3 flex items-center gap-2.5"
                style={{ background: `linear-gradient(to right, ${areaData.color}, ${areaData.color}CC)` }}
              >
                <h2 className="text-[#1A1A1A] text-xs font-bold uppercase tracking-wide flex-1">{areaData.area}</h2>
                <span className="bg-black/10 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {seleccionadosArea} seleccionados
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {areaData.sugeridos.map((s) => {
                  const o = objetivoDesdeSugerido(areaData.area, s);
                  const checked = estaSeleccionado(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleSugerido(areaData.area, s)}
                      aria-pressed={checked}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        checked ? "shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                      style={checked ? { borderColor: areaData.color, background: `${areaData.color}1A` } : undefined}
                    >
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          checked ? "" : "border-gray-200"
                        }`}
                        style={checked ? { background: areaData.color, borderColor: areaData.color } : undefined}
                      >
                        {checked && <Check size={12} strokeWidth={3.5} className="text-[#1A1A1A]" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{s.objetivo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-600">{s.indicador}</span> · Meta: {s.meta} · {s.frecuencia}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Objetivos personalizados ya agregados en esta área */}
                {objetivos
                  .filter((o) => o.area === areaData.area && !areaData.sugeridos.some((s) => objetivoDesdeSugerido(areaData.area, s).id === o.id))
                  .map((o) => (
                    <div
                      key={o.id}
                      className="flex items-start gap-3 p-3 rounded-xl border-2"
                      style={{ borderColor: areaData.color, background: `${areaData.color}1A` }}
                    >
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: areaData.color }}
                      >
                        <Check size={12} strokeWidth={3.5} className="text-[#1A1A1A]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{o.objetivo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {o.indicador && <span className="font-medium text-gray-600">{o.indicador}</span>}
                          {o.meta && <> · Meta: {o.meta}</>}
                          {o.frecuencia && <> · {o.frecuencia}</>}
                        </p>
                      </div>
                      <button
                        onClick={() => eliminar(o.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-400 transition-colors flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                {areaPersonalizando === areaData.area && formPersonalizado ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-gray-300 space-y-2 bg-[#FAFAFA]">
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
                        className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors"
                      >
                        <Plus size={13} strokeWidth={3} /> Agregar
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
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] transition-colors"
                  >
                    <Plus size={13} strokeWidth={3} /> Agregar objetivo personalizado en {areaData.area}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-6 flex items-center gap-3 bg-white/95 backdrop-blur border border-gray-100 rounded-xl p-3 shadow-lg w-fit">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
        >
          {saving ? "Guardando..." : `Guardar (${objetivos.length} seleccionados)`}
        </button>
        {saved && <span className="text-green-600 text-sm font-semibold">✓ Guardado</span>}
      </div>
    </div>
  );
}
