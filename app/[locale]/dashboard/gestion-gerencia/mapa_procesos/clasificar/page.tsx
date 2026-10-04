"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  CATEGORIAS_PROCESO,
  parseLista,
  parseClasificacion,
  type CategoriaProceso,
} from "@/lib/mapaProcesos";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";

export default function MapaProcesosClasificarPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [clasificacion, setClasificacion] = useState<Record<string, CategoriaProceso | "">>({});
  const [saving, setSaving] = useState(false);

  const procesos = parseLista(docs[ITEM_KEY_SELECCION] ?? "");

  useEffect(() => {
    if (!loading) {
      const existente = parseClasificacion(docs[ITEM_KEY_CLASIFICACION] ?? "");
      const next: Record<string, CategoriaProceso | ""> = {};
      procesos.forEach((p) => {
        next[p] = existente[p] ?? "";
      });
      setClasificacion(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function asignar(proceso: string, categoria: CategoriaProceso) {
    setClasificacion((prev) => ({ ...prev, [proceso]: categoria }));
  }

  const todosClasificados = procesos.length > 0 && procesos.every((p) => clasificacion[p]);

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_CLASIFICACION, JSON.stringify(clasificacion));
    setSaving(false);
    router.push(`${basePath}/mapa_procesos/resultado`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (procesos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Gestión de la Gerencia
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Primero seleccioná los procesos de tu empresa.</p>
          <Link
            href={`${basePath}/mapa_procesos`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Seleccionar procesos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`${basePath}/mapa_procesos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Volver a selección
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mapa de Procesos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Paso 2 de 3 — Clasificá cada proceso como Estratégico, Misional o de Apoyo.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs">
              <th className="p-3 font-semibold">Proceso</th>
              <th className="p-3 font-semibold">Clasificación</th>
            </tr>
          </thead>
          <tbody>
            {procesos.map((p) => (
              <tr key={p} className="border-t border-gray-50">
                <td className="p-3 font-medium text-[#1A1A1A]">{p}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS_PROCESO.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => asignar(p, c.key)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          clasificacion[p] === c.key
                            ? "bg-[#F5A623] border-[#F5A623] text-[#1A1A1A]"
                            : "border-gray-200 text-gray-500 hover:border-[#F5A623]/50"
                        }`}
                      >
                        {c.label.replace("Procesos ", "")}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving || !todosClasificados}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar y ver mapa →"}
        </button>
      </div>
      {!todosClasificados && (
        <p className="text-xs text-gray-400 text-right mt-2">Clasificá todos los procesos para continuar.</p>
      )}
    </div>
  );
}
