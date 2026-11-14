"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { OBJETIVOS_SUGERIDOS, parseObjetivos, type ObjetivoCalidad } from "@/lib/objetivosCalidad";
import { Search, Trash2, Target } from "lucide-react";

const ITEM_KEY = "objetivos_calidad";

const AREAS = OBJETIVOS_SUGERIDOS.map((a) => a.area);
const COLOR_POR_AREA = Object.fromEntries(OBJETIVOS_SUGERIDOS.map((a) => [a.area, a.color]));

// Input que se adapta: para "Meta" y "Frecuencia" alcanza con una línea; acá
// usamos un textarea de una fila que crece si el texto es largo, así nunca
// se corta sin tener que arrastrar el recuadro.
function CampoEditable({
  value,
  onChange,
  color,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--ac)]/15 focus:border-[color:var(--ac)] resize-none overflow-hidden transition-colors"
      style={{ "--ac": color } as React.CSSProperties}
    />
  );
}

export default function ObjetivosCalidadResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [inicializado, setInicializado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filtroArea, setFiltroArea] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!loading && !inicializado) {
      setObjetivos(parseObjetivos(docs[ITEM_KEY] ?? ""));
      setInicializado(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, inicializado]);

  function update(id: string, campo: keyof ObjetivoCalidad, valor: string) {
    setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, [campo]: valor } : o)));
    setSaved(false);
  }

  function eliminar(id: string) {
    setObjetivos((prev) => prev.filter((o) => o.id !== id));
    setSaved(false);
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(objetivos));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !inicializado) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const areasPresentes = AREAS.filter((a) => objetivos.some((o) => o.area === a));
  const busquedaNorm = busqueda.trim().toLowerCase();

  const filtrados = objetivos.filter((o) => {
    if (filtroArea !== "todas" && o.area !== filtroArea) return false;
    if (busquedaNorm && !`${o.objetivo} ${o.indicador}`.toLowerCase().includes(busquedaNorm)) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16">
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
              <Target size={20} style={{ color: "#F5A623" }} /> Matriz de Objetivos de Calidad
            </h1>
            <p className="text-gray-400 text-sm mt-1">Resumen editable de todos los objetivos seleccionados, por área.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{objetivos.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Objetivos</p>
            </div>
            <Link
              href={`${basePath}/objetivos_calidad`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0 whitespace-nowrap"
            >
              + Agregar / editar
            </Link>
          </div>
        </div>
      </div>

      {objetivos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún objetivo.</p>
          <Link
            href={`${basePath}/objetivos_calidad`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Elegir objetivos
          </Link>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setFiltroArea("todas")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                filtroArea === "todas" ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Todas ({objetivos.length})
            </button>
            {areasPresentes.map((area) => {
              const activo = filtroArea === area;
              const color = COLOR_POR_AREA[area] ?? "#9CA3AF";
              const cant = objetivos.filter((o) => o.area === area).length;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => setFiltroArea(activo ? "todas" : area)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                  style={activo ? { background: color, borderColor: color, color: "#1A1A1A" } : { borderColor: "#E5E7EB", color: "#6B7280" }}
                >
                  {area} ({cant})
                </button>
              );
            })}

            <div className="relative ml-auto w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar objetivo o indicador..."
                className="w-full bg-white border border-gray-200 rounded-full pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors"
              />
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              Ningún objetivo coincide con el filtro.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-auto max-h-[75vh]">
              <table className="w-full text-xs min-w-[1100px] border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#FAFAFA] text-left text-gray-500">
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-8 bg-[#FAFAFA]">#</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Área</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-56 bg-[#FAFAFA]">Objetivo de Calidad</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-44 bg-[#FAFAFA]">Indicador KPI</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-56 bg-[#FAFAFA]">Fórmula de Medición</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Meta</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Frecuencia</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-8 bg-[#FAFAFA]" />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((o, idx) => {
                    const color = COLOR_POR_AREA[o.area] ?? "#9CA3AF";
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-gray-100 align-top transition-colors hover:brightness-[0.98]"
                        style={{ background: `${color}14` }}
                      >
                        <td className="p-2 text-gray-400">{idx + 1}</td>
                        <td className="p-2">
                          <span
                            className="inline-block text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ background: `${color}33`, color: "#1A1A1A" }}
                          >
                            {o.area}
                          </span>
                        </td>
                        <td className="p-2 font-semibold text-[#1A1A1A]">{o.objetivo}</td>
                        <td className="p-2">
                          <CampoEditable value={o.indicador} onChange={(v) => update(o.id, "indicador", v)} color={color} placeholder="Indicador..." />
                        </td>
                        <td className="p-2">
                          <CampoEditable value={o.formula} onChange={(v) => update(o.id, "formula", v)} color={color} placeholder="Fórmula..." />
                        </td>
                        <td className="p-2">
                          <CampoEditable value={o.meta} onChange={(v) => update(o.id, "meta", v)} color={color} placeholder="Meta..." />
                        </td>
                        <td className="p-2">
                          <CampoEditable value={o.frecuencia} onChange={(v) => update(o.id, "frecuencia", v)} color={color} placeholder="Frecuencia..." />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => eliminar(o.id)}
                            title="Eliminar"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="sticky bottom-4 mt-4 flex items-center gap-3 bg-white/95 backdrop-blur border border-gray-100 rounded-xl p-3 shadow-lg w-fit">
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {saved && <span className="text-green-600 text-sm font-semibold">✓ Guardado</span>}
          </div>
        </>
      )}
    </div>
  );
}
