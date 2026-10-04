"use client";

import { useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import CompromisoDireccionCard from "./CompromisoDireccionCard";

export type ItemGestion = {
  key: string;
  titulo: string;
  icono: string;
  descripcion: string;
  placeholder: string;
};

function ItemCard({
  item,
  contenido,
  onSave,
}: {
  item: ItemGestion;
  contenido: string;
  onSave: (key: string, valor: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(contenido);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await onSave(item.key, valor);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const completo = contenido.trim().length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl flex-shrink-0">{item.icono}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">{item.titulo}</h2>
            <span
              className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                completo ? "text-green-700 bg-green-100" : "text-[#F5A623] bg-[#F5A623]/10"
              }`}
            >
              {completo ? "Completo" : "Pendiente"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{item.descripcion}</p>
        </div>
        <span className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="p-4 border-t border-gray-100">
          <textarea
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={item.placeholder}
            rows={6}
            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] resize-y"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
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

export default function GestionDocumentos({
  modulo,
  titulo,
  descripcion,
  items,
  userId,
  empresa,
}: {
  modulo: string;
  titulo: string;
  descripcion: string;
  items: ItemGestion[];
  userId: string | null;
  empresa?: string;
}) {
  const { docs, loading, save } = useGestionDocumentos(modulo, userId);

  const completados = items.filter((i) => (docs[i.key] ?? "").trim().length > 0).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-1">{descripcion}</p>
      </div>

      {!loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{completados} de {items.length} completadas</span>
            <span>{Math.round((completados / items.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5A623] rounded-full transition-all"
              style={{ width: `${(completados / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) =>
            item.key === "compromiso_direccion" ? (
              <CompromisoDireccionCard
                key={item.key}
                empresa={empresa ?? ""}
                contenido={docs[item.key] ?? ""}
                onSave={(valor) => save(item.key, valor)}
              />
            ) : (
              <ItemCard key={item.key} item={item} contenido={docs[item.key] ?? ""} onSave={save} />
            )
          )}
        </div>
      )}
    </div>
  );
}
