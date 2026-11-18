"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { temaPanelDe } from "@/lib/temaPanel";
import {
  parseNoConformidades,
  colorSeveridadNC,
  colorEstadoNC,
  colorResultadoVerificacionNC,
  estaAbiertaNC,
  costoTotalNC,
  costoTotalNoCalidad,
  diasAbiertaNC,
  formatoMontoNC,
} from "@/lib/noConformidades";
import { LineChart, Search, Table2, ClipboardList, Flame, DollarSign } from "lucide-react";

const ITEM_KEY = "no_conformidades_lista";
const ACENTO = "#EA580C";

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const th = "px-3 py-2.5 font-bold uppercase tracking-wide text-[10px] border-b border-gray-200 whitespace-nowrap";
const td = "px-3 py-2 text-gray-600 whitespace-nowrap";

export default function MatrizNoConformidadesPage() {
  const { user, profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);
  const [busqueda, setBusqueda] = useState("");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const casos = parseNoConformidades(docs[ITEM_KEY] ?? "");
  const ordenados = [...casos].sort((a, b) => (b.fechaDeteccion || "").localeCompare(a.fechaDeteccion || ""));

  const filtrados = busqueda.trim()
    ? ordenados.filter((c) => {
        const q = busqueda.trim().toLowerCase();
        return [c.radicado, c.productoNombre, c.descripcion, c.detectadoPor, c.responsableCaso, c.causaAparente, c.estado, c.severidad]
          .some((campo) => (campo || "").toLowerCase().includes(q));
      })
    : ordenados;

  const abiertos = casos.filter((c) => estaAbiertaNC(c.estado)).length;
  const costoTotal = costoTotalNoCalidad(casos);

  return (
    <div className="max-w-full mx-auto space-y-4 px-2 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`${basePath}/no_conformidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← No Conformidades
        </Link>
        <Link
          href={`${basePath}/no_conformidades/grafico`}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
          style={{ backgroundColor: "#1A1A1A" }}
        >
          <LineChart size={14} /> Ver gráfico →
        </Link>
      </div>

      {/* Hero */}
      <div
        className="relative rounded-2xl p-6 sm:p-7 overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${tema.bgFrom}, ${tema.bgTo})`, border: `1px solid ${tema.cardBorder}` }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, ${tema.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${tema.gridColor} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}40` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: tema.isLight ? ACENTO : "#FDBA74" }}>
            Vista planilla · todos los campos
          </p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: tema.textPrimary }}>Matriz de No Conformidades</h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: tema.textMuted }}>
            Detalle completo de todos los casos registrados, con formato condicional por severidad y estado.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5 max-w-lg">
            <div className="rounded-xl p-3" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <ClipboardList size={14} style={{ color: tema.isLight ? ACENTO : "#FDBA74" }} className="mb-1" />
              <p className="text-lg font-bold" style={{ color: tema.textPrimary }}>{casos.length}</p>
              <p className="text-[10px]" style={{ color: tema.textMuted }}>Casos totales</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <Flame size={14} style={{ color: "#EF4444" }} className="mb-1" />
              <p className="text-lg font-bold" style={{ color: abiertos > 0 ? "#EF4444" : tema.textPrimary }}>{abiertos}</p>
              <p className="text-[10px]" style={{ color: tema.textMuted }}>Abiertos</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
              <DollarSign size={14} style={{ color: "#22C55E" }} className="mb-1" />
              <p className="text-lg font-bold truncate" style={{ color: tema.textPrimary }}>{costoTotal > 0 ? formatoMontoNC(costoTotal) : "—"}</p>
              <p className="text-[10px]" style={{ color: tema.textMuted }}>Costo de no calidad</p>
            </div>
          </div>
        </div>
      </div>

      {casos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Table2 size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-2">Todavía no hay no conformidades registradas.</p>
          <Link href={`${basePath}/no_conformidades`} className="text-sm font-semibold hover:opacity-80" style={{ color: ACENTO }}>
            Registrar la primera →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-[#FAFAFA]">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por radicado, producto, descripción, responsable, causa, estado..."
              className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none"
            />
            <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">{filtrados.length} / {casos.length}</span>
          </div>

          <div className="overflow-auto max-h-[75vh]">
            <table className="text-xs min-w-max border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] text-left text-white sticky top-0 z-20">
                  <th className={`${th} sticky left-0 bg-[#1A1A1A] z-30`}>Radicado</th>
                  <th className={th}>Producto</th>
                  <th className={th}>Cant.</th>
                  <th className={th}>Unidad</th>
                  <th className={th}>Lote / Nº Serie</th>
                  <th className={th}>Etapa Detección</th>
                  <th className={th}>Cliente</th>
                  <th className={th}>Fecha Detección</th>
                  <th className={th}>Detectado Por</th>
                  <th className={th}>Severidad</th>
                  <th className={th}>Causa Aparente</th>
                  <th className={`${th} min-w-[220px]`}>Descripción</th>
                  <th className={`${th} min-w-[180px]`}>Requisito Incumplido</th>
                  <th className={`${th} min-w-[220px]`}>Disposición(es)</th>
                  <th className={th}>Concesión Autorizada Por</th>
                  <th className={th}>Verificación</th>
                  <th className={th}>Resultado Verif.</th>
                  <th className={`${th} text-right`}>Costo Reproceso</th>
                  <th className={`${th} text-right`}>Costo Desperdicio</th>
                  <th className={`${th} text-right`}>Costo Devolución</th>
                  <th className={`${th} text-right`}>Costo Total</th>
                  <th className={th}>Acción Correctiva</th>
                  <th className={th}>Responsable Acción</th>
                  <th className={th}>Fecha Compromiso</th>
                  <th className={th}>Responsable Caso</th>
                  <th className={th}>Fecha Cierre</th>
                  <th className={`${th} text-right`}>Días Abierta</th>
                  <th className={th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-[#FFF7ED] align-top transition-colors ${i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                    <td
                      className={`${td} font-mono font-semibold text-[#1A1A1A] sticky left-0 z-10 ${i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
                      style={{ borderLeft: `4px solid ${colorSeveridadNC(c.severidad)}` }}
                    >
                      <Link href={`${basePath}/no_conformidades`} className="hover:underline" style={{ color: ACENTO }}>{c.radicado}</Link>
                    </td>
                    <td className={`${td} font-medium text-[#1A1A1A]`}>{c.productoNombre || "—"}</td>
                    <td className={`${td} text-right font-mono`}>{c.cantidadAfectada || "—"}</td>
                    <td className={td}>{c.unidadMedida || "—"}</td>
                    <td className={`${td} font-mono`}>{c.loteONumeroSerie || "—"}</td>
                    <td className={td}>{c.etapaDeteccion || "—"}</td>
                    <td className={td}>{c.clienteNombre || "—"}</td>
                    <td className={td}>{fechaCorta(c.fechaDeteccion)}</td>
                    <td className={td}>{c.detectadoPor || "—"}</td>
                    <td className={td}>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorSeveridadNC(c.severidad) }}>
                        {c.severidad}
                      </span>
                    </td>
                    <td className={td}>{c.causaAparente || "—"}</td>
                    <td className={`${td} max-w-[260px] whitespace-normal`}>{c.descripcion || "—"}</td>
                    <td className={`${td} max-w-[220px] whitespace-normal`}>{c.requisitoIncumplido || "—"}</td>
                    <td className={`${td} max-w-[260px] whitespace-normal`}>{c.disposiciones.length > 0 ? c.disposiciones.join(" · ") : "—"}</td>
                    <td className={td}>{c.concesionAutorizadoPor || "—"}</td>
                    <td className={td}>{c.requiereVerificacion ? "Sí" : "No"}</td>
                    <td className={td}>
                      {c.requiereVerificacion ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoVerificacionNC(c.resultadoVerificacion) }}>
                          {c.resultadoVerificacion}
                        </span>
                      ) : "—"}
                    </td>
                    <td className={`${td} text-right font-mono`}>{c.costoReproceso > 0 ? formatoMontoNC(c.costoReproceso) : "—"}</td>
                    <td className={`${td} text-right font-mono`}>{c.costoDesperdicio > 0 ? formatoMontoNC(c.costoDesperdicio) : "—"}</td>
                    <td className={`${td} text-right font-mono`}>{c.costoDevolucion > 0 ? formatoMontoNC(c.costoDevolucion) : "—"}</td>
                    <td className={`${td} text-right font-mono font-bold text-[#1A1A1A]`}>{costoTotalNC(c) > 0 ? formatoMontoNC(costoTotalNC(c)) : "—"}</td>
                    <td className={td}>{c.requiereAccionCorrectiva ? "Sí" : "No"}</td>
                    <td className={td}>{c.responsableAccion || "—"}</td>
                    <td className={td}>{fechaCorta(c.fechaCompromiso)}</td>
                    <td className={td}>{c.responsableCaso || "—"}</td>
                    <td className={td}>{fechaCorta(c.fechaCierre)}</td>
                    <td className={`${td} text-right font-mono`}>{estaAbiertaNC(c.estado) ? `${diasAbiertaNC(c)}d` : "—"}</td>
                    <td className={td}>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoNC(c.estado) }}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Ningún caso coincide con la búsqueda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
