"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseInventario,
  todosLosMantenimientos,
  colorTipoMantenimiento,
  colorEstadoMantenimiento,
  estaVencidoMantenimiento,
  costoTotalMantenimientos,
  tiempoParadaTotalHoras,
  cumplimientoMantenimientos,
  estadoMantenimiento,
  diasHastaProximoMantenimiento,
  colorEstadoAlerta,
  etiquetaEstadoAlerta,
  formatoMonto,
  TIPOS_MANTENIMIENTO,
  ESTADOS_MANTENIMIENTO,
} from "@/lib/inventario";

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ProgramaMantenimientoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [soloVencidos, setSoloVencidos] = useState(false);

  const items = useMemo(() => parseInventario(docs["inventario_lista"] ?? ""), [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const mantenimientos = todosLosMantenimientos(items);
  const preventivos = mantenimientos.filter((m) => m.tipo === "Preventivo").length;
  const correctivos = mantenimientos.filter((m) => m.tipo === "Correctivo").length;
  const costoTotal = costoTotalMantenimientos(mantenimientos);
  const horasTotales = tiempoParadaTotalHoras(mantenimientos);
  const cumplimiento = cumplimientoMantenimientos(mantenimientos);
  const vencidos = mantenimientos.filter((m) => estaVencidoMantenimiento(m)).length;

  const proximoPrograma = items
    .filter((i) => i.proximoMantenimiento)
    .map((i) => ({
      item: i,
      alerta: estadoMantenimiento(i),
      dias: diasHastaProximoMantenimiento(i),
    }))
    .sort((a, b) => (a.item.proximoMantenimiento || "").localeCompare(b.item.proximoMantenimiento || ""));

  const filtrados = mantenimientos.filter((m) => {
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    if (filtroEstado && m.estado !== filtroEstado) return false;
    if (soloVencidos && !estaVencidoMantenimiento(m)) return false;
    return true;
  });
  const ordenados = [...filtrados].sort((a, b) => (b.fechaRealizada || b.fechaProgramada || "").localeCompare(a.fechaRealizada || a.fechaProgramada || ""));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Operativa
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Programa de Mantenimiento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vista consolidada de los mantenimientos de todas las máquinas, equipos y herramientas del Inventario.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📋</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{mantenimientos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total registros</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔵</p>
          <p className="text-lg font-bold text-blue-600">{preventivos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Preventivos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🔴</p>
          <p className="text-lg font-bold text-red-500">{correctivos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Correctivos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold" style={{ color: cumplimiento === null ? "#9CA3AF" : cumplimiento >= 80 ? "#22C55E" : cumplimiento >= 50 ? "#F5A623" : "#EF4444" }}>
            {cumplimiento !== null ? `${cumplimiento}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Cumplimiento</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💰</p>
          <p className="text-lg font-bold text-[#1A1A1A] truncate">{costoTotal > 0 ? formatoMonto(costoTotal) : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Costo total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⚠️</p>
          <p className={`text-lg font-bold ${vencidos > 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>{vencidos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vencidos</p>
        </div>
      </div>
      {horasTotales > 0 && (
        <p className="text-xs text-gray-500">⏱️ Tiempo de parada acumulado: <strong className="text-[#1A1A1A]">{horasTotales}h</strong></p>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no hay ítems en el Inventario.</p>
          <Link href={`${basePath}/inscripcion_inventario`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Agregar ítem al inventario
          </Link>
        </div>
      ) : (
        <>
          {/* Próximo programa */}
          {proximoPrograma.length > 0 && (
            <Seccion icono="🗓️" titulo="Próximo Programa">
              <div className="space-y-2">
                {proximoPrograma.map(({ item, alerta, dias }) => (
                  <Link
                    key={item.id}
                    href={`${basePath}/lista_maestra_inventario/${item.id}`}
                    className="flex items-center gap-3 bg-[#FAFAFA] hover:bg-gray-100 rounded-lg p-3 border border-gray-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">⚙️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.nombre}</p>
                      <p className="text-xs text-gray-500">{fechaCorta(item.proximoMantenimiento)}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap flex-shrink-0"
                      style={{ backgroundColor: colorEstadoAlerta(alerta) }}
                    >
                      {etiquetaEstadoAlerta(alerta)}{(alerta === "al_dia" || alerta === "proximo") && dias !== null ? ` · ${dias}d` : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </Seccion>
          )}

          {/* Historial consolidado */}
          <Seccion icono="🗂️" titulo="Historial de Mantenimientos">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFiltroTipo("")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroTipo === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
              >
                Todos los tipos
              </button>
              {TIPOS_MANTENIMIENTO.map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(filtroTipo === t ? "" : t)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroTipo === t ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
                  style={filtroTipo === t ? { backgroundColor: colorTipoMantenimiento(t) } : {}}
                >
                  {t}
                </button>
              ))}
              {ESTADOS_MANTENIMIENTO.map((e) => (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
                  style={filtroEstado === e ? { backgroundColor: colorEstadoMantenimiento(e) } : {}}
                >
                  {e}
                </button>
              ))}
              <button
                onClick={() => setSoloVencidos((v) => !v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${soloVencidos ? "bg-red-500 text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              >
                ⚠️ Solo vencidos
              </button>
            </div>

            {ordenados.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No hay mantenimientos que coincidan con el filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[900px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100">Equipo</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Proveedor</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100">Costo</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenados.map((m) => {
                      const vencido = estaVencidoMantenimiento(m);
                      return (
                        <tr key={m.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                          <td className="p-2.5 font-medium text-[#1A1A1A] whitespace-nowrap max-w-[180px] truncate">{m.equipoNombre}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoMantenimiento(m.tipo) }}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: vencido ? "#EF4444" : colorEstadoMantenimiento(m.estado) }}
                            >
                              {vencido ? "Vencido" : m.estado}
                            </span>
                          </td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(m.fechaRealizada || m.fechaProgramada)}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{m.responsable || "—"}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{m.proveedor || "—"}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{m.costo > 0 ? formatoMonto(m.costo) : "—"}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <Link href={`${basePath}/lista_maestra_inventario/${m.equipoId}`} className="text-[#F5A623] font-semibold hover:text-[#e09410]">
                              Ver equipo →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Seccion>
        </>
      )}
    </div>
  );
}
