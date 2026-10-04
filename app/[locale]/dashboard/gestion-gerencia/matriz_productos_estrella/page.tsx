"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseFilas, filaVacia, type FilaProductoEstrella } from "@/lib/productosEstrella";

const ITEM_KEY = "matriz_productos_estrella";

const BADGE_COLOR: Record<string, string> = {
  Alta: "text-green-700 bg-green-100",
  Media: "text-[#F5A623] bg-[#F5A623]/10",
  Baja: "text-red-600 bg-red-50",
};

export default function MatrizProductosEstrellaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [filas, setFilas] = useState<FilaProductoEstrella[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      const existentes = parseFilas(docs[ITEM_KEY] ?? "");
      setFilas(existentes.length > 0 ? existentes : [filaVacia()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function update(idx: number, campo: keyof FilaProductoEstrella, valor: string) {
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f)));
    setSaved(false);
  }

  function agregarFila() {
    setFilas((prev) => [...prev, filaVacia()]);
  }

  function eliminarFila(idx: number) {
    setFilas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleGuardar() {
    setSaving(true);
    const limpio = filas.filter((f) => f.producto.trim().length > 0);
    await save(ITEM_KEY, JSON.stringify(limpio));
    setFilas(limpio.length > 0 ? limpio : [filaVacia()]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <span>⭐</span> Matriz de Productos Estrella
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Cargá tus productos o servicios clave y su relevancia estratégica.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs">
              <th className="p-3 font-semibold border-b border-gray-100">Producto / Servicio</th>
              <th className="p-3 font-semibold border-b border-gray-100 w-36">Participación</th>
              <th className="p-3 font-semibold border-b border-gray-100 w-40">Importancia estratégica</th>
              <th className="p-3 font-semibold border-b border-gray-100">Comentario</th>
              <th className="p-3 border-b border-gray-100 w-10" />
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, idx) => (
              <tr key={idx} className="border-b border-gray-50 align-top">
                <td className="p-2">
                  <input
                    value={fila.producto}
                    onChange={(e) => update(idx, "producto", e.target.value)}
                    placeholder="Ej: Certificación ISO 9001"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#F5A623]"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={fila.participacion}
                    onChange={(e) => update(idx, "participacion", e.target.value)}
                    className={`w-full border-0 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none ${
                      fila.participacion ? BADGE_COLOR[fila.participacion] : "bg-[#FAFAFA] text-gray-500"
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={fila.importancia}
                    onChange={(e) => update(idx, "importancia", e.target.value)}
                    className={`w-full border-0 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none ${
                      fila.importancia ? BADGE_COLOR[fila.importancia] : "bg-[#FAFAFA] text-gray-500"
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    value={fila.comentario}
                    onChange={(e) => update(idx, "comentario", e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#F5A623]"
                  />
                </td>
                <td className="p-2 text-center">
                  {filas.length > 1 && (
                    <button
                      onClick={() => eliminarFila(idx)}
                      className="text-gray-300 hover:text-red-500"
                      title="Eliminar fila"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={agregarFila}
        className="mt-3 text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
      >
        + Agregar producto
      </button>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
