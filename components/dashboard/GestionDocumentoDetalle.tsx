"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import type { ItemGestion } from "@/lib/gestionGerenciaItems";
import CompromisoDireccionCard from "./CompromisoDireccionCard";
import EncabezadoDocumento from "./EncabezadoDocumento";

export default function GestionDocumentoDetalle({
  modulo,
  item,
  userId,
  empresa,
  basePath,
  moduloTitulo,
}: {
  modulo: string;
  item: ItemGestion;
  userId: string | null;
  empresa?: string;
  basePath: string;
  moduloTitulo: string;
}) {
  const { docs, loading, save } = useGestionDocumentos(modulo, userId);
  const contenido = docs[item.key] ?? "";

  const [valor, setValor] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) setValor(contenido);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function handleSave() {
    setSaving(true);
    await save(item.key, valor);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← {moduloTitulo}
      </Link>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : item.key === "compromiso_direccion" ? (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <span>{item.icono}</span> {item.titulo}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{item.descripcion}</p>
          </div>
          <CompromisoDireccionCard
            empresa={empresa ?? ""}
            contenido={contenido}
            onSave={(v) => save(item.key, v)}
          />
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <EncabezadoDocumento />
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl flex-shrink-0">{item.icono}</span>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">{item.titulo}</h1>
              <p className="text-xs text-gray-500">{item.descripcion}</p>
            </div>
          </div>

          <textarea
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={item.placeholder}
            rows={14}
            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] resize-y"
          />

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
          </div>
        </div>
      )}
    </div>
  );
}
