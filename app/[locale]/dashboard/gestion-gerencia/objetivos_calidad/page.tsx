"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseObjetivos, objetivoVacio, type ObjetivoCalidad } from "@/lib/objetivosCalidad";

const ITEM_KEY = "objetivos_calidad";

export default function ObjetivosCalidadPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [objetivos, setObjetivos] = useState<ObjetivoCalidad[]>([]);
  const [form, setForm] = useState<ObjetivoCalidad>(objetivoVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setObjetivos(parseObjetivos(docs[ITEM_KEY] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleLimpiar() {
    setForm(objetivoVacio());
    setError(null);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.objetivo.trim() || !form.indicador.trim() || !form.meta.trim()) {
      setError("Objetivo, Indicador y Meta son obligatorios.");
      return;
    }
    setSaving(true);
    const actualizados = [...objetivos.filter((o) => o.id !== form.id), form];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setObjetivos(actualizados);
    setForm(objetivoVacio());
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function editar(o: ObjetivoCalidad) {
    setForm(o);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id: string) {
    const actualizados = objetivos.filter((o) => o.id !== id);
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setObjetivos(actualizados);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Alta de Objetivos de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">Carga de datos del objetivo</p>
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

      <p className="text-sm text-gray-500 mb-6">
        Cargá cada objetivo de calidad con su indicador de medición, la meta a alcanzar, el responsable y el
        plazo. Recordá que deben ser medibles y coherentes con la Política de Calidad.
      </p>

      <form onSubmit={handleGuardar} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Objetivo guardado
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <span className="text-red-500">*</span> Objetivo
          </label>
          <textarea
            value={form.objetivo}
            onChange={(e) => setForm((f) => ({ ...f, objetivo: e.target.value }))}
            placeholder="Ej: Reducir el tiempo de respuesta a reclamos de clientes"
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <span className="text-red-500">*</span> Indicador
          </label>
          <input
            value={form.indicador}
            onChange={(e) => setForm((f) => ({ ...f, indicador: e.target.value }))}
            placeholder="Ej: Tiempo promedio de respuesta (días)"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <span className="text-red-500">*</span> Meta
          </label>
          <input
            value={form.meta}
            onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
            placeholder="Ej: Menos de 2 días"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Responsable</label>
            <input
              value={form.responsable}
              onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))}
              placeholder="Ej: Gerente Comercial"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plazo</label>
            <input
              value={form.plazo}
              onChange={(e) => setForm((f) => ({ ...f, plazo: e.target.value }))}
              placeholder="Ej: Diciembre 2026"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Limpiar
          </button>
        </div>
      </form>

      {objetivos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Objetivos cargados ({objetivos.length})</h2>
          <div className="space-y-2">
            {objetivos.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{o.objetivo}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {o.indicador} · Meta: {o.meta}
                  </p>
                </div>
                <button onClick={() => editar(o)} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
                  Editar
                </button>
                <button onClick={() => eliminar(o.id)} className="text-xs text-gray-400 hover:text-red-500">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
