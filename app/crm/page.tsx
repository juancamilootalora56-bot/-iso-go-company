import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  Target,
  Handshake,
  Receipt,
  CalendarClock,
  Activity,
  Plus,
  FileText,
  CalendarPlus,
} from "lucide-react";

function formatGs(n: number) {
  return `${Math.round(n).toLocaleString("es")}Gs.`;
}

const ETAPA_COLORS: Record<string, { label: string; color: string }> = {
  lead_nuevo: { label: "Lead nuevo", color: "#60A5FA" },
  contactado: { label: "Contactado", color: "#FBBF24" },
  reunion: { label: "Reunión", color: "#22D3EE" },
  presentacion: { label: "Presentación", color: "#2DD4BF" },
  demo: { label: "Demo", color: "#A78BFA" },
  negociacion: { label: "Negociación", color: "#F5A623" },
  ganado: { label: "Ganado", color: "#4ADE80" },
  perdido: { label: "Perdido", color: "#F87171" },
};

function etapaInfo(etapa: string) {
  return ETAPA_COLORS[etapa] ?? ETAPA_COLORS.lead_nuevo;
}

const TIPO_COLORS: Record<string, { label: string; color: string }> = {
  reunion: { label: "Reunión", color: "#F5A623" },
  demo: { label: "Demo", color: "#3B82F6" },
  llamada: { label: "Llamada", color: "#22C55E" },
  otro: { label: "Otro", color: "#A855F7" },
};

function tipoInfo(tipo: string) {
  return TIPO_COLORS[tipo] ?? TIPO_COLORS.otro;
}

const ACENTO = "#F5A623";

export default async function CrmHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles_internos")
    .select("nombre, rol")
    .eq("id", user?.id)
    .maybeSingle();

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    { data: leads },
    { data: clientes },
    { data: cotizaciones },
    { data: proximasVisitas },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, nombre, empresa, etapa, valor_estimado, updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("clientes").select("id, valor"),
    supabase.from("cotizaciones").select("id, numero, empresa, estado, total"),
    supabase
      .from("visitas")
      .select("id, titulo, ubicacion, fecha_inicio, tipo")
      .gte("fecha_inicio", new Date().toISOString())
      .order("fecha_inicio", { ascending: true })
      .limit(5),
  ]);

  const allLeads = leads ?? [];
  const activos = allLeads.filter((l) => l.etapa !== "ganado" && l.etapa !== "perdido");
  const ganadosMes = allLeads.filter(
    (l) => l.etapa === "ganado" && new Date(l.updated_at) >= inicioMes
  );
  const pipelineTotal = activos.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const ganadosMesTotal = ganadosMes.reduce((s, l) => s + (l.valor_estimado || 0), 0);

  const clientesTotal = clientes?.length ?? 0;
  const clientesValor = (clientes ?? []).reduce((s, c) => s + (c.valor || 0), 0);

  const cotizacionesPendientes = (cotizaciones ?? []).filter(
    (c) => c.estado === "borrador" || c.estado === "enviada"
  );

  const leadsRecientes = allLeads.slice(0, 5);

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
              Panel interno · {perfil?.rol}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Hola, {perfil?.nombre || "colaborador"} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">Resumen de tu actividad comercial hoy.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/crm/leads/nuevo"
              className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} /> Nuevo lead
            </Link>
            <Link
              href="/crm/cotizaciones/nueva"
              className="flex items-center gap-1.5 bg-white/10 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <FileText size={15} strokeWidth={2.5} /> Nueva cotización
            </Link>
            <Link
              href="/crm/calendario"
              className="flex items-center gap-1.5 bg-white/10 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <CalendarPlus size={15} strokeWidth={2.5} /> Agendar visita
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Link href="/crm/leads" className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all" style={{ borderLeftColor: "#2563EB" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#2563EB18" }}>
              <TrendingUp size={19} style={{ color: "#2563EB" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Pipeline activo</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{formatGs(pipelineTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{activos.length} leads en curso</p>
        </Link>

        <Link href="/crm/leads" className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all" style={{ borderLeftColor: "#22C55E" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#22C55E18" }}>
              <Target size={19} style={{ color: "#22C55E" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Ganados este mes</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{formatGs(ganadosMesTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{ganadosMes.length} leads</p>
        </Link>

        <Link href="/crm/clientes" className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all" style={{ borderLeftColor: "#7C4DFF" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#7C4DFF18" }}>
              <Handshake size={19} style={{ color: "#7C4DFF" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Clientes</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{clientesTotal}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{formatGs(clientesValor)} en cartera</p>
        </Link>

        <Link href="/crm/cotizaciones" className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all" style={{ borderLeftColor: "#D97706" }}>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#D9770618" }}>
              <Receipt size={19} style={{ color: "#D97706" }} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide font-bold text-gray-400">Cotizaciones pendientes</p>
              <p className="text-base font-bold text-[#1A1A1A] truncate">{cotizacionesPendientes.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">borrador / enviadas</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Próximas visitas */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock size={14} className="text-white" />
              <h2 className="text-white text-xs font-bold uppercase tracking-wide">Próximas visitas</h2>
            </div>
            <Link href="/crm/calendario" className="text-xs font-semibold hover:opacity-80" style={{ color: ACENTO }}>
              Ver calendario
            </Link>
          </div>
          <div className="p-4">
            {!proximasVisitas || proximasVisitas.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay visitas agendadas próximamente.</p>
            ) : (
              <div className="space-y-2">
                {proximasVisitas.map((v) => {
                  const info = tipoInfo(v.tipo);
                  return (
                    <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] font-medium truncate">{v.titulo}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {new Date(v.fecha_inicio).toLocaleString("es", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {v.ubicacion ? ` · ${v.ubicacion}` : ""}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${info.color}22`, color: info.color }}
                      >
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Leads recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-white" />
              <h2 className="text-white text-xs font-bold uppercase tracking-wide">Actividad reciente en leads</h2>
            </div>
            <Link href="/crm/leads" className="text-xs font-semibold hover:opacity-80" style={{ color: ACENTO }}>
              Ver pipeline
            </Link>
          </div>
          <div className="p-4">
            {leadsRecientes.length === 0 ? (
              <p className="text-gray-400 text-sm">Todavía no hay leads cargados.</p>
            ) : (
              <div className="space-y-2">
                {leadsRecientes.map((l) => {
                  const info = etapaInfo(l.etapa);
                  return (
                    <Link
                      key={l.id}
                      href={`/crm/leads/${l.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#1A1A1A] font-medium truncate">{l.empresa || l.nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{formatGs(l.valor_estimado || 0)}</p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${info.color}22`, color: info.color }}
                      >
                        {info.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
