"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeads, ETAPAS, type Etapa } from "@/hooks/useLeads";

export default function LeadsPage() {
  const { leads, loading, setEtapa } = useLeads();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleEtapaChange(id: string, etapa: Etapa) {
    setUpdating(id);
    try {
      await setEtapa(id, etapa);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Link
          href="/crm/leads/nuevo"
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410]"
        >
          + Nuevo lead
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : leads.length === 0 ? (
        <div className="bg-[#242424] border border-white/5 rounded-2xl p-8 text-center text-gray-400 text-sm">
          Todavía no hay leads cargados. Click en &quot;+ Nuevo lead&quot; para empezar.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((etapa) => {
            const leadsEtapa = leads.filter((l) => l.etapa === etapa.value);
            return (
              <div key={etapa.value} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-bold text-gray-300">{etapa.label}</h2>
                  <span className="text-xs text-gray-500">{leadsEtapa.length}</span>
                </div>
                <div className="space-y-2">
                  {leadsEtapa.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-[#242424] border border-white/5 rounded-xl p-3 hover:border-[#F5A623]/30 transition-colors"
                    >
                      <Link href={`/crm/leads/${lead.id}`} className="block mb-2">
                        <p className="text-sm font-semibold text-white truncate">{lead.nombre}</p>
                        {lead.empresa && (
                          <p className="text-xs text-gray-500 truncate">{lead.empresa}</p>
                        )}
                      </Link>
                      <select
                        value={lead.etapa}
                        disabled={updating === lead.id}
                        onChange={(e) => handleEtapaChange(lead.id, e.target.value as Etapa)}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-[#F5A623]"
                      >
                        {ETAPAS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
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
