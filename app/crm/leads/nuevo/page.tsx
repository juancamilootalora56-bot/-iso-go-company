"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLeads } from "@/hooks/useLeads";
import { PRODUCTOS } from "@/lib/productos";

export default function NuevoLeadPage() {
  const router = useRouter();
  const { create } = useLeads();
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    rubro: "",
    cargo: "",
    email: "",
    telefono: "",
    norma_interes: "",
    valor_estimado: "",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await create({ ...form, valor_estimado: parseFloat(form.valor_estimado) || 0 });
      router.push("/crm/leads");
    } catch {
      setError("No se pudo guardar el lead. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/crm/leads" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← Volver a Leads
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nuevo lead</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#242424] border border-white/5 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Nombre *</label>
          <input
            required
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Empresa</label>
          <input
            value={form.empresa}
            onChange={(e) => set("empresa", e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Rubro de la empresa</label>
            <input
              value={form.rubro}
              onChange={(e) => set("rubro", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Cargo</label>
            <input
              value={form.cargo}
              onChange={(e) => set("cargo", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Norma de interés</label>
          <select
            value={form.norma_interes}
            onChange={(e) => set("norma_interes", e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          >
            <option value="">Seleccionar...</option>
            {PRODUCTOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Valor estimado (Gs.)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.valor_estimado}
            onChange={(e) => set("valor_estimado", e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Notas</label>
          <textarea
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
            rows={3}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Crear lead"}
        </button>
      </form>
    </div>
  );
}
