"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { PROCESOS_COMUNES, parseLista } from "@/lib/mapaProcesos";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";

export default function MapaProcesosSeleccionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nuevoProceso, setNuevoProceso] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSeleccion(parseLista(docs[ITEM_KEY_SELECCION] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function toggle(proceso: string) {
    setSeleccion((prev) =>
      prev.includes(proceso) ? prev.filter((p) => p !== proceso) : [...prev, proceso]
    );
  }

  function agregarPersonalizado() {
    const texto = nuevoProceso.trim();
    if (!texto) return;
    setSeleccion((prev) => (prev.includes(texto) ? prev : [...prev, texto]));
    setNuevoProceso("");
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_SELECCION, JSON.stringify(seleccion));
    setSaving(false);
    router.push(`${basePath}/mapa_procesos/clasificar`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const personalizados = seleccion.filter((p) => !PROCESOS_COMUNES.includes(p));

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span>🗺️</span> Mapa de Procesos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Paso 1 de 3 — Seleccioná los procesos de tu empresa.</p>
        </div>
        {seleccion.length > 0 && (
          <Link
            href={`${basePath}/mapa_procesos/resultado`}
            className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            Ver mapa actual →
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-4">
          {PROCESOS_COMUNES.map((p) => (
            <label key={p} className="flex items-center gap-2 py-1.5 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={seleccion.includes(p)}
                onChange={() => toggle(p)}
                className="accent-[#F5A623]"
              />
              {p}
            </label>
          ))}
        </div>

        {personalizados.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {personalizados.map((p) => (
              <span key={p} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                {p}
                <button onClick={() => toggle(p)} className="text-gray-400 hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={nuevoProceso}
            onChange={(e) => setNuevoProceso(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarPersonalizado();
              }
            }}
            placeholder="Agregar otro proceso..."
            className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]"
          />
          <button
            type="button"
            onClick={agregarPersonalizado}
            className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410] px-2"
          >
            + Agregar
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving || seleccion.length === 0}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
