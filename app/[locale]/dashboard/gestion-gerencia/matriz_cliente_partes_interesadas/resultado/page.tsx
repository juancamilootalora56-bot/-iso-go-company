"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  GRUPOS_INTERESADOS,
  parseSeleccion,
  parseDetalles,
  detalleKey,
  type DetalleRequisito,
} from "@/lib/partesInteresadasItems";

const ITEM_KEY_SELECCION = "matriz_cliente_partes_interesadas_seleccion";
const ITEM_KEY_DETALLES = "matriz_cliente_partes_interesadas_detalles";

export default function MatrizPartesInteresadasResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [detalles, setDetalles] = useState<Record<string, DetalleRequisito>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDetalles(parseDetalles(docs[ITEM_KEY_DETALLES] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const seleccion = parseSeleccion(docs[ITEM_KEY_SELECCION] ?? "");

  const filas = GRUPOS_INTERESADOS.flatMap((g) =>
    seleccion[g.key].map((requisito) => ({ grupo: g, requisito }))
  );

  function updateDetalle(key: string, campo: keyof DetalleRequisito, valor: string) {
    setDetalles((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { definicion: "", expectativas: "", registros: "" }), [campo]: valor },
    }));
    setSaved(false);
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_DETALLES, JSON.stringify(detalles));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Clientes y Partes Interesadas</h1>
          <p className="text-gray-500 text-sm mt-1">Completá la definición, expectativas y registros de cada requisito.</p>
        </div>
        <Link
          href={`${basePath}/matriz_cliente_partes_interesadas`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          ✎ Editar selección
        </Link>
      </div>

      {filas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún requisito.</p>
          <Link
            href={`${basePath}/matriz_cliente_partes_interesadas`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Completar matriz
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-xs min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-3 font-semibold border-b border-gray-100 w-10">#</th>
                  <th className="p-3 font-semibold border-b border-gray-100 w-32">Partes de interés</th>
                  <th className="p-3 font-semibold border-b border-gray-100 w-36">Requisito</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Definición</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Expectativas</th>
                  <th className="p-3 font-semibold border-b border-gray-100 w-40">Registros</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, idx) => {
                  const key = detalleKey(fila.grupo.key, fila.requisito);
                  const detalle = detalles[key] ?? { definicion: "", expectativas: "", registros: "" };
                  return (
                    <tr key={key} className="border-b border-gray-50 align-top">
                      <td className="p-3 text-gray-400">{idx + 1}</td>
                      <td className="p-3">
                        <span
                          className="text-[10px] font-bold text-white px-2 py-1 rounded-full"
                          style={{ backgroundColor: fila.grupo.color }}
                        >
                          {fila.grupo.label}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-[#1A1A1A]">{fila.requisito}</td>
                      <td className="p-2">
                        <textarea
                          value={detalle.definicion}
                          onChange={(e) => updateDetalle(key, "definicion", e.target.value)}
                          rows={2}
                          placeholder="¿Qué significa este requisito?"
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={detalle.expectativas}
                          onChange={(e) => updateDetalle(key, "expectativas", e.target.value)}
                          rows={2}
                          placeholder="¿Qué espera esta parte interesada?"
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={detalle.registros}
                          onChange={(e) => updateDetalle(key, "registros", e.target.value)}
                          placeholder="Ej: Estados financieros"
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
          </div>
        </>
      )}
    </div>
  );
}
