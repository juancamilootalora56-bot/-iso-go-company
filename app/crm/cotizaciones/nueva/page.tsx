"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCotizaciones } from "@/hooks/useCotizaciones";

type ItemForm = { descripcion: string; cantidad: string; precio_unitario: string };

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const { create } = useCotizaciones();
  const [leads, setLeads] = useState<{ id: string; nombre: string }[]>([]);
  const [leadId, setLeadId] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemForm[]>([
    { descripcion: "", cantidad: "1", precio_unitario: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("leads").select("id, nombre").then(({ data }) => {
      if (data) setLeads(data as { id: string; nombre: string }[]);
    });
  }, []);

  function updateItem(i: number, field: keyof ItemForm, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { descripcion: "", cantidad: "1", precio_unitario: "" }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = items.reduce(
    (sum, it) => sum + (parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validItems = items.filter((it) => it.descripcion.trim());
      const id = await create(
        { lead_id: leadId || null, notas: notas || null, estado: "borrador" },
        validItems.map((it, idx) => ({
          orden: idx + 1,
          descripcion: it.descripcion,
          cantidad: parseFloat(it.cantidad) || 1,
          precio_unitario: parseFloat(it.precio_unitario) || 0,
        }))
      );
      router.push(`/crm/cotizaciones/${id}`);
    } catch {
      setError("No se pudo guardar la cotización. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/crm/cotizaciones" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← Volver a Cotizaciones
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nueva cotización</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-[#242424] border border-white/5 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Lead asociado (opcional)</label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          >
            <option value="">Sin lead asociado</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Ítems</label>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_90px_28px] gap-2 items-center">
                <input
                  placeholder="Descripción"
                  value={it.descripcion}
                  onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                  className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Cant."
                  value={it.cantidad}
                  onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                  className="bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={it.precio_unitario}
                  onChange={(e) => updateItem(i, "precio_unitario", e.target.value)}
                  className="bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-gray-600 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-xs text-[#F5A623] font-semibold hover:text-[#e09410]"
          >
            + Agregar ítem
          </button>
        </div>

        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <p className="text-sm text-gray-400 mr-3">Total:</p>
          <p className="text-xl font-bold text-white">${total.toLocaleString("es")}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Notas (opcional)</label>
          <textarea
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Crear cotización"}
        </button>
      </form>
    </div>
  );
}
