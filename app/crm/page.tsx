import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { etapaInfo } from "@/hooks/useLeads";
import { tipoInfo } from "@/hooks/useVisitas";

function formatGs(n: number) {
  return `${Math.round(n).toLocaleString("es")}Gs.`;
}

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
      <h1 className="text-2xl font-bold mb-2">
        Hola, {perfil?.nombre || "colaborador"} 👋
      </h1>
      <p className="text-[#8A8478] text-sm mb-6">
        Panel interno de Iso Go Company — rol: <span className="text-[#F5A623] font-semibold">{perfil?.rol}</span>
      </p>

      {/* Accesos rápidos */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/crm/leads/nuevo"
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410]"
        >
          + Nuevo lead
        </Link>
        <Link
          href="/crm/cotizaciones/nueva"
          className="bg-white border border-[#E8E2D8] text-[#2D2A26] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#F0EBE2]"
        >
          + Nueva cotización
        </Link>
        <Link
          href="/crm/calendario"
          className="bg-white border border-[#E8E2D8] text-[#2D2A26] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#F0EBE2]"
        >
          + Agendar visita
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Link href="/crm/leads" className="bg-white border border-[#E8E2D8] rounded-2xl p-4 hover:border-[#F5A623]/40 transition-colors">
          <p className="text-xs font-semibold text-[#8A8478]">📈 PIPELINE ACTIVO</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{formatGs(pipelineTotal)}</p>
          <p className="text-xs text-[#8A8478]">{activos.length} leads en curso</p>
        </Link>
        <Link href="/crm/leads" className="bg-green-50 border border-green-200 rounded-2xl p-4 hover:border-green-400 transition-colors">
          <p className="text-xs font-semibold text-green-600">🎯 GANADOS ESTE MES</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{formatGs(ganadosMesTotal)}</p>
          <p className="text-xs text-[#8A8478]">{ganadosMes.length} leads</p>
        </Link>
        <Link href="/crm/clientes" className="bg-white border border-[#E8E2D8] rounded-2xl p-4 hover:border-[#F5A623]/40 transition-colors">
          <p className="text-xs font-semibold text-[#8A8478]">🤝 CLIENTES</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{clientesTotal}</p>
          <p className="text-xs text-[#8A8478]">{formatGs(clientesValor)} en cartera</p>
        </Link>
        <Link href="/crm/cotizaciones" className="bg-white border border-[#E8E2D8] rounded-2xl p-4 hover:border-[#F5A623]/40 transition-colors">
          <p className="text-xs font-semibold text-[#8A8478]">🧾 COTIZACIONES PENDIENTES</p>
          <p className="text-xl font-bold text-[#2D2A26] mt-1">{cotizacionesPendientes.length}</p>
          <p className="text-xs text-[#8A8478]">borrador / enviadas</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas visitas */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#2D2A26]">Próximas visitas</h2>
            <Link href="/crm/calendario" className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
              Ver calendario
            </Link>
          </div>
          {!proximasVisitas || proximasVisitas.length === 0 ? (
            <p className="text-[#8A8478] text-sm">No hay visitas agendadas próximamente.</p>
          ) : (
            <div className="space-y-2">
              {proximasVisitas.map((v) => {
                const info = tipoInfo(v.tipo);
                return (
                  <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0EBE2]">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: info.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2D2A26] font-medium truncate">{v.titulo}</p>
                      <p className="text-xs text-[#8A8478] truncate">
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

        {/* Leads recientes */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#2D2A26]">Actividad reciente en Leads</h2>
            <Link href="/crm/leads" className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
              Ver pipeline
            </Link>
          </div>
          {leadsRecientes.length === 0 ? (
            <p className="text-[#8A8478] text-sm">Todavía no hay leads cargados.</p>
          ) : (
            <div className="space-y-2">
              {leadsRecientes.map((l) => {
                const info = etapaInfo(l.etapa);
                return (
                  <Link
                    key={l.id}
                    href={`/crm/leads/${l.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F0EBE2]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#2D2A26] font-medium truncate">{l.empresa || l.nombre}</p>
                      <p className="text-xs text-[#8A8478] truncate">{formatGs(l.valor_estimado || 0)}</p>
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
  );
}
