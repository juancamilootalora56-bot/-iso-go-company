"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLeads, ETAPAS, type Etapa } from "@/hooks/useLeads";

function formatGs(n: number) {
  return `${Math.round(n).toLocaleString("es")}Gs.`;
}

export default function LeadsPage() {
  const { leads, loading, setEtapa, remove } = useLeads();
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function handleEtapaChange(id: string, etapa: Etapa) {
    setUpdating(id);
    try {
      await setEtapa(id, etapa);
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este lead?")) return;
    await remove(id);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.nombre.toLowerCase().includes(q) ||
        (l.empresa ?? "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  const stats = useMemo(() => {
    const activos = leads.filter((l) => l.etapa !== "ganado" && l.etapa !== "perdido");
    const ganados = leads.filter((l) => l.etapa === "ganado");
    const perdidos = leads.filter((l) => l.etapa === "perdido");
    return {
      pipelineTotal: activos.reduce((s, l) => s + (l.valor_estimado || 0), 0),
      pipelineCount: activos.length,
      ganadosTotal: ganados.reduce((s, l) => s + (l.valor_estimado || 0), 0),
      ganadosCount: ganados.length,
      perdidosCount: perdidos.length,
    };
  }, [leads]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pipeline de Ventas</h1>
          <p className="text-[#8A8478] text-sm">
            {leads.length} leads · {formatGs(stats.pipelineTotal)} activo
          </p>
        </div>
        <Link
          href="/crm/leads/nuevo"
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] text-center"
        >
          + Nuevo lead
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 mb-6">
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#8A8478] flex items-center gap-1.5">📈 PIPELINE</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{formatGs(stats.pipelineTotal)}</p>
          <p className="text-xs text-[#8A8478]">{stats.pipelineCount} activos</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5">🎯 GANADOS</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{formatGs(stats.ganadosTotal)}</p>
          <p className="text-xs text-[#8A8478]">{stats.ganadosCount} leads</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">🎯 PERDIDOS</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{stats.perdidosCount}</p>
          <p className="text-xs text-[#8A8478]">leads</p>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Buscar prospecto, empresa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white border border-[#E8E2D8] rounded-xl px-4 py-3 text-sm text-[#2D2A26] placeholder-[#B5AEA0] focus:outline-none focus:border-[#F5A623] mb-6"
      />

      {loading ? (
        <p className="text-[#8A8478] text-sm">Cargando...</p>
      ) : leads.length === 0 ? (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-8 text-center text-[#8A8478] text-sm">
          Todavía no hay leads cargados. Click en &quot;+ Nuevo lead&quot; para empezar.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((etapa) => {
            const leadsEtapa = filtered.filter((l) => l.etapa === etapa.value);
            const totalEtapa = leadsEtapa.reduce((s, l) => s + (l.valor_estimado || 0), 0);
            return (
              <div key={etapa.value} className="flex-shrink-0 w-64">
                <div
                  className="rounded-xl px-3 py-2 mb-3"
                  style={{ backgroundColor: `${etapa.color}1A`, borderLeft: `3px solid ${etapa.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold" style={{ color: etapa.color }}>{etapa.label}</h2>
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-[#1A1A1A]"
                      style={{ backgroundColor: etapa.color }}
                    >
                      {leadsEtapa.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8478] mt-0.5">{formatGs(totalEtapa)}</p>
                </div>

                <div className="space-y-2">
                  {leadsEtapa.length === 0 && (
                    <div className="border border-dashed border-[#E8E2D8] rounded-xl p-4 text-center text-xs text-[#A8A194]">
                      Sin leads
                    </div>
                  )}
                  {leadsEtapa.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white border border-[#E8E2D8] rounded-xl p-3 hover:border-[#F5A623]/30 transition-colors"
                    >
                      <Link href={`/crm/leads/${lead.id}`} className="block mb-2">
                        <p className="text-sm font-semibold text-[#2D2A26] truncate">{lead.empresa || lead.nombre}</p>
                        {lead.empresa && (
                          <p className="text-xs text-[#8A8478] truncate">{lead.nombre}</p>
                        )}
                      </Link>

                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-green-600">{formatGs(lead.valor_estimado || 0)}</p>
                        <p className="text-xs text-[#8A8478]">{etapa.probabilidad}%</p>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${etapa.probabilidad}%`, backgroundColor: etapa.color }}
                        />
                      </div>

                      <select
                        value={lead.etapa}
                        disabled={updating === lead.id}
                        onChange={(e) => handleEtapaChange(lead.id, e.target.value as Etapa)}
                        className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-md px-2 py-1 text-xs text-[#5C564C] focus:outline-none focus:border-[#F5A623] mb-2"
                      >
                        {ETAPAS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="text-xs text-[#8A8478] hover:text-[#F5A623]"
                        >
                          ✎ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-xs text-[#8A8478] hover:text-red-500"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
