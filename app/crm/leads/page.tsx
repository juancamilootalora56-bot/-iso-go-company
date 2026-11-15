"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLeads, ETAPAS, type Etapa, type Lead } from "@/hooks/useLeads";
import {
  TrendingUp,
  Target,
  TrendingDown,
  Plus,
  Search,
  UserPlus,
  Phone,
  Users,
  Presentation,
  FlaskConical,
  Handshake,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const ACENTO = "#F5A623";

const ICONO_ETAPA: Record<Etapa, LucideIcon> = {
  lead_nuevo: UserPlus,
  contactado: Phone,
  reunion: Users,
  presentacion: Presentation,
  demo: FlaskConical,
  negociacion: Handshake,
  ganado: CheckCircle2,
  perdido: XCircle,
};

function formatGs(n: number) {
  return `${Math.round(n).toLocaleString("es")}Gs.`;
}

function formatFecha(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function modalidadLabel(m: string | null) {
  if (!m) return null;
  return m === "presencial" ? "Presencial" : "Virtual";
}

function etapaResumen(lead: Lead): string | null {
  switch (lead.etapa) {
    case "reunion": {
      const partes = [formatFecha(lead.reunion_fecha), modalidadLabel(lead.reunion_modalidad), lead.reunion_lugar].filter(Boolean);
      return partes.length ? partes.join(" · ") : null;
    }
    case "presentacion": {
      const partes = [formatFecha(lead.presentacion_fecha), modalidadLabel(lead.presentacion_modalidad), lead.presentacion_norma].filter(Boolean);
      return partes.length ? partes.join(" · ") : null;
    }
    case "demo": {
      const partes = [
        lead.demo_fecha_entrega ? `Entregada: ${formatFecha(lead.demo_fecha_entrega)}` : null,
        lead.demo_dias_acceso ? `${lead.demo_dias_acceso} días de acceso` : null,
      ].filter(Boolean);
      return partes.length ? partes.join(" · ") : null;
    }
    case "negociacion":
    case "ganado": {
      const pago = lead.forma_pago === "cuotas" ? `Cuotas x${lead.cuotas ?? "?"}` : lead.forma_pago === "contado" ? "Contado" : null;
      const tipo = lead.tipo_producto === "solo_software" ? "Solo software" : lead.tipo_producto === "software_coordinacion" ? "Software + coordinación" : null;
      const inicio = lead.etapa === "ganado" && lead.fecha_inicio_servicio
        ? `Inicio: ${new Date(lead.fecha_inicio_servicio).toLocaleDateString("es")}`
        : null;
      const partes = [pago, tipo, inicio].filter(Boolean);
      return partes.length ? partes.join(" · ") : null;
    }
    default:
      return null;
  }
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
      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
              Pipeline de Ventas
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">
              {leads.length} leads · {formatGs(stats.pipelineTotal)} activo
            </p>
          </div>
          <Link
            href="/crm/leads/nuevo"
            className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors flex-shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} /> Nuevo lead
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 p-4" style={{ borderLeftColor: "#2563EB" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#2563EB18" }}>
              <TrendingUp size={19} style={{ color: "#2563EB" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Pipeline</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{formatGs(stats.pipelineTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.pipelineCount} activos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 p-4" style={{ borderLeftColor: "#22C55E" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#22C55E18" }}>
              <Target size={19} style={{ color: "#22C55E" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Ganados</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{formatGs(stats.ganadosTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.ganadosCount} leads</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 p-4" style={{ borderLeftColor: "#EF4444" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EF444418" }}>
              <TrendingDown size={19} style={{ color: "#EF4444" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Perdidos</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{stats.perdidosCount}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">leads</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          placeholder="Buscar prospecto, empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623]"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          Todavía no hay leads cargados. Click en &quot;+ Nuevo lead&quot; para empezar.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((etapa) => {
            const leadsEtapa = filtered.filter((l) => l.etapa === etapa.value);
            const totalEtapa = leadsEtapa.reduce((s, l) => s + (l.valor_estimado || 0), 0);
            const IconoEtapa = ICONO_ETAPA[etapa.value];
            return (
              <div key={etapa.value} className="flex-shrink-0 w-64">
                <div
                  className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2"
                  style={{ backgroundColor: `${etapa.color}18`, borderLeft: `3px solid ${etapa.color}` }}
                >
                  <IconoEtapa size={14} style={{ color: etapa.color }} strokeWidth={2.25} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold truncate" style={{ color: etapa.color }}>{etapa.label}</h2>
                      <span
                        className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-[#1A1A1A] flex-shrink-0 ml-1"
                        style={{ backgroundColor: etapa.color }}
                      >
                        {leadsEtapa.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{formatGs(totalEtapa)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {leadsEtapa.length === 0 && (
                    <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-300">
                      Sin leads
                    </div>
                  )}
                  {leadsEtapa.map((lead) => {
                    const resumen = etapaResumen(lead);
                    return (
                    <div
                      key={lead.id}
                      className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all"
                    >
                      <Link href={`/crm/leads/${lead.id}`} className="block mb-2">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{lead.empresa || lead.nombre}</p>
                        {lead.empresa && (
                          <p className="text-xs text-gray-400 truncate">{lead.nombre}</p>
                        )}
                        {resumen && (
                          <p className="text-[11px] text-[#A8762C] bg-[#F5A623]/10 rounded px-1.5 py-0.5 mt-1 truncate">
                            {resumen}
                          </p>
                        )}
                      </Link>

                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-green-600">{formatGs(lead.valor_estimado || 0)}</p>
                        <p className="text-xs text-gray-400">{etapa.probabilidad}%</p>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${etapa.probabilidad}%`, backgroundColor: etapa.color }}
                        />
                      </div>

                      <select
                        value={lead.etapa}
                        disabled={updating === lead.id}
                        onChange={(e) => handleEtapaChange(lead.id, e.target.value as Etapa)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-md px-2 py-1 text-xs text-[#5C564C] focus:outline-none focus:border-[#F5A623] mb-2"
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
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F5A623]"
                        >
                          <Pencil size={11} /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
