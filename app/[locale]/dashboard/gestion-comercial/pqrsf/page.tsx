"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseClientes } from "@/lib/clientes";
import {
  parseCasos,
  infoTipo,
  colorTipo,
  colorPrioridad,
  colorEstado,
  estadoSLA,
  colorEstadoSLA,
  etiquetaEstadoSLA,
  diasRestantes,
  estaAbierto,
  cumplimientoSLA,
  tiempoPromedioResolucion,
  TIPOS_PQRSF,
  ESTADOS_PQRSF,
  type CasoPQRSF,
} from "@/lib/pqrsf";

type FilaPQRSF = CasoPQRSF & { clienteId: string; clienteNombre: string };

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PQRSFGeneralPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;

  const { docs, loading } = useGestionDocumentos("comercial", user?.id ?? null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [soloVencidos, setSoloVencidos] = useState(false);

  const filas: FilaPQRSF[] = useMemo(() => {
    const clientes = parseClientes(docs["clientes_lista"] ?? "");
    const todas: FilaPQRSF[] = [];
    clientes.forEach((c) => {
      const casos = parseCasos(docs[`pqrsf_cliente_${c.id}`] ?? "");
      casos.forEach((caso) => {
        todas.push({ ...caso, clienteId: c.id, clienteNombre: c.razonSocial });
      });
    });
    return todas;
  }, [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const totalCasos = filas.length;
  const abiertos = filas.filter((f) => estaAbierto(f.estado)).length;
  const vencidos = filas.filter((f) => estadoSLA(f) === "vencido").length;
  const cumplimiento = cumplimientoSLA(filas);
  const tiempoPromedio = tiempoPromedioResolucion(filas);

  const filasFiltradas = filas.filter((f) => {
    if (filtroTipo && f.tipo !== filtroTipo) return false;
    if (filtroEstado && f.estado !== filtroEstado) return false;
    if (soloVencidos && estadoSLA(f) !== "vencido") return false;
    return true;
  });
  const filasOrdenadas = [...filasFiltradas].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Comercial
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Sistema PQRSF</h1>
        <p className="text-gray-500 text-sm mt-1">
          Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones — registro consolidado de todos los clientes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📋", valor: totalCasos, label: "Casos totales" },
          { icon: "🔵", valor: abiertos, label: "Casos abiertos" },
          { icon: "⏰", valor: vencidos, label: "SLA vencido" },
          { icon: "✅", valor: cumplimiento !== null ? `${cumplimiento}%` : "—", label: "Cumplimiento de SLA" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl mb-1">{k.icon}</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{k.valor}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Distribución por tipo */}
      <Seccion icono="🏷️" titulo="Distribución por Tipo">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TIPOS_PQRSF.map((t) => {
            const cantidad = filas.filter((f) => f.tipo === t.tipo).length;
            return (
              <button
                key={t.tipo}
                onClick={() => setFiltroTipo(filtroTipo === t.tipo ? "" : t.tipo)}
                className={`rounded-xl p-3 border text-center transition-colors ${
                  filtroTipo === t.tipo ? "border-transparent text-white" : "bg-[#FAFAFA] border-gray-100 text-[#1A1A1A] hover:border-gray-200"
                }`}
                style={filtroTipo === t.tipo ? { backgroundColor: t.color } : {}}
              >
                <p className="text-lg mb-1">{t.icono}</p>
                <p className="text-xl font-bold">{cantidad}</p>
                <p className={`text-[10px] uppercase tracking-wide font-bold mt-0.5 ${filtroTipo === t.tipo ? "text-white/90" : "text-gray-400"}`}>{t.tipo}</p>
              </button>
            );
          })}
        </div>
        {tiempoPromedio !== null && (
          <p className="text-xs text-gray-500 mt-3">⏱️ Tiempo promedio de resolución: <strong className="text-[#1A1A1A]">{tiempoPromedio} día(s)</strong></p>
        )}
      </Seccion>

      {/* Registro */}
      <Seccion icono="🗂️" titulo="Registro de Casos">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroEstado("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todos los estados
          </button>
          {ESTADOS_PQRSF.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroEstado === e ? { backgroundColor: colorEstado(e) } : {}}
            >
              {e}
            </button>
          ))}
          <button
            onClick={() => setSoloVencidos((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${soloVencidos ? "bg-red-500 text-white border-transparent" : "border-gray-200 text-gray-500"}`}
          >
            ⏰ Solo vencidos
          </button>
          {filtroTipo && (
            <button onClick={() => setFiltroTipo("")} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500">
              ✕ Tipo: {filtroTipo}
            </button>
          )}
        </div>

        {filasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay casos que coincidan con el filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Radicado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Cliente</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Descripción</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Prioridad</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">SLA</th>
                </tr>
              </thead>
              <tbody>
                {filasOrdenadas.map((f) => {
                  const t = infoTipo(f.tipo);
                  const sla = estadoSLA(f);
                  const restantes = diasRestantes(f);
                  return (
                    <tr key={f.id} className="border-b border-gray-50 align-top hover:bg-[#FAFAFA]">
                      <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">{f.radicado}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>
                          {t.icono} {f.tipo}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">
                        <Link href={`${basePath}/lista_maestra_clientes/${f.clienteId}`} className="hover:text-[#F5A623] font-medium text-[#1A1A1A]">
                          {f.clienteNombre}
                        </Link>
                      </td>
                      <td className="p-2.5 text-gray-600 max-w-[260px] truncate">{f.descripcion || "—"}</td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(f.fecha)}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorPrioridad(f.prioridad) }}>
                          {f.prioridad}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorEstado(f.estado) }}>
                          {f.estado}
                        </span>
                      </td>
                      <td className="p-2.5">
                        {sla === "no_aplica" ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorEstadoSLA(sla) }}>
                            {etiquetaEstadoSLA(sla)}{(sla === "en_plazo" || sla === "por_vencer") && restantes !== null ? ` · ${restantes}d` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
}
