"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseNoConformidades,
  colorSeveridadNC,
  colorEstadoNC,
  colorResultadoVerificacionNC,
  estaAbiertaNC,
  costoTotalNC,
  diasAbiertaNC,
  formatoMontoNC,
} from "@/lib/noConformidades";

const ITEM_KEY = "no_conformidades_lista";

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function MatrizNoConformidadesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const casos = parseNoConformidades(docs[ITEM_KEY] ?? "");
  const ordenados = [...casos].sort((a, b) => (b.fechaDeteccion || "").localeCompare(a.fechaDeteccion || ""));

  return (
    <div className="max-w-full mx-auto space-y-4 px-2">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`${basePath}/no_conformidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← No Conformidades
        </Link>
        <Link href={`${basePath}/no_conformidades/grafico`} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F5A623]/50">
          📈 Ver Gráfico →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de No Conformidades</h1>
        <p className="text-gray-500 text-sm mt-1">Detalle completo de todos los casos registrados, tipo planilla.</p>
      </div>

      {ordenados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay no conformidades registradas.</p>
          <Link href={`${basePath}/no_conformidades`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Registrar la primera →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs min-w-max border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100 sticky left-0 bg-gray-50 whitespace-nowrap z-10">Radicado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Producto</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Cant.</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Unidad</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Lote / Nº Serie</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Etapa Detección</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Cliente</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Fecha Detección</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Detectado Por</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Severidad</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Causa Aparente</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 min-w-[220px]">Descripción</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 min-w-[180px]">Requisito Incumplido</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 min-w-[220px]">Disposición(es)</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Concesión Autorizada Por</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Verificación</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Resultado Verif.</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Costo Reproceso</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Costo Desperdicio</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Costo Devolución</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Costo Total</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Acción Correctiva</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Responsable Acción</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Fecha Compromiso</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Responsable Caso</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Fecha Cierre</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Días Abierta</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA] align-top">
                    <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap sticky left-0 bg-white">
                      <Link href={`${basePath}/no_conformidades`} className="hover:text-[#F5A623]">{c.radicado}</Link>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.productoNombre || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.cantidadAfectada || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.unidadMedida || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.loteONumeroSerie || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.etapaDeteccion || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.clienteNombre || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaDeteccion)}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.detectadoPor || "—"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorSeveridadNC(c.severidad) }}>
                        {c.severidad}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.causaAparente || "—"}</td>
                    <td className="p-2.5 text-gray-600 max-w-[260px]">{c.descripcion || "—"}</td>
                    <td className="p-2.5 text-gray-600 max-w-[220px]">{c.requisitoIncumplido || "—"}</td>
                    <td className="p-2.5 text-gray-600 max-w-[260px]">{c.disposiciones.length > 0 ? c.disposiciones.join(" · ") : "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.concesionAutorizadoPor || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.requiereVerificacion ? "Sí" : "No"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      {c.requiereVerificacion ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoVerificacionNC(c.resultadoVerificacion) }}>
                          {c.resultadoVerificacion}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.costoReproceso > 0 ? formatoMontoNC(c.costoReproceso) : "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.costoDesperdicio > 0 ? formatoMontoNC(c.costoDesperdicio) : "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.costoDevolucion > 0 ? formatoMontoNC(c.costoDevolucion) : "—"}</td>
                    <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">{costoTotalNC(c) > 0 ? formatoMontoNC(costoTotalNC(c)) : "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.requiereAccionCorrectiva ? "Sí" : "No"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.responsableAccion || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaCompromiso)}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{c.responsableCaso || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(c.fechaCierre)}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{estaAbiertaNC(c.estado) ? `${diasAbiertaNC(c)}d` : "—"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoNC(c.estado) }}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
