"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ETAPAS, type Lead, type Etapa } from "@/hooks/useLeads";
import { PRODUCTOS } from "@/lib/productos";

export default function LeadDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setLead(data as Lead | null);
        setForm((data as Lead) ?? {});
        setLoading(false);
      });
  }, [id]);

  function set<K extends keyof Lead>(key: K, value: Lead[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("leads")
      .update({
        nombre: form.nombre,
        empresa: form.empresa,
        rubro: form.rubro,
        cargo: form.cargo,
        email: form.email,
        telefono: form.telefono,
        norma_interes: form.norma_interes,
        valor_estimado: form.valor_estimado,
        etapa: form.etapa,
        notas: form.notas,
      })
      .eq("id", id);

    // Si este lead ya se graduó a cliente, mantenemos su ficha sincronizada.
    await supabase
      .from("clientes")
      .update({
        nombre: form.nombre,
        empresa: form.empresa,
        rubro: form.rubro,
        cargo: form.cargo,
        email: form.email,
        telefono: form.telefono,
        norma_interes: form.norma_interes,
        valor: form.valor_estimado,
        notas: form.notas,
      })
      .eq("lead_id", id);

    setSaving(false);
    router.push("/crm/leads");
  }

  if (loading) return <p className="text-[#8A8478] text-sm">Cargando...</p>;
  if (!lead) return <p className="text-[#8A8478] text-sm">Lead no encontrado.</p>;

  return (
    <div className="max-w-xl">
      <Link href="/crm/leads" className="text-sm text-[#8A8478] hover:text-[#2D2A26] mb-4 inline-block">
        ← Volver a Leads
      </Link>
      <h1 className="text-2xl font-bold mb-6">{lead.nombre}</h1>

      <form onSubmit={handleSave} className="space-y-4 bg-white border border-[#E8E2D8] rounded-2xl p-6">
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Nombre</label>
          <input
            value={form.nombre ?? ""}
            onChange={(e) => set("nombre", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Empresa</label>
          <input
            value={form.empresa ?? ""}
            onChange={(e) => set("empresa", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Rubro de la empresa</label>
            <input
              value={form.rubro ?? ""}
              onChange={(e) => set("rubro", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Cargo</label>
            <input
              value={form.cargo ?? ""}
              onChange={(e) => set("cargo", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Email</label>
            <input
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Teléfono</label>
            <input
              value={form.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Norma de interés</label>
          <select
            value={form.norma_interes ?? ""}
            onChange={(e) => set("norma_interes", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          >
            <option value="">Seleccionar...</option>
            {PRODUCTOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Valor estimado (Gs.)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.valor_estimado ?? 0}
            onChange={(e) => set("valor_estimado", parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Etapa</label>
          <select
            value={form.etapa ?? "lead_nuevo"}
            onChange={(e) => set("etapa", e.target.value as Etapa)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          >
            {ETAPAS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Notas</label>
          <textarea
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            rows={4}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
