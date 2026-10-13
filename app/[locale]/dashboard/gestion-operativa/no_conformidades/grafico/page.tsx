"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseNoConformidades,
  resumenPorEtapaNC,
  resumenPorSeveridadNC,
  resumenPorEstadoNC,
  resumenPorCausaNC,
  costoPorMesNC,
  rankingPorProducto,
  costoTotalNoCalidad,
  estaAbiertaNC,
  formatoMontoNC,
} from "@/lib/noConformidades";

const ITEM_KEY = "no_conformidades_lista";
const NARANJA = "#F5A623";

function etiquetaMes(mes: string) {
  try {
    return new Date(mes + "-01T00:00:00").toLocaleDateString("es", { month: "short", year: "2-digit" });
  } catch {
    return mes;
  }
}

function BarraHorizontal({
  datos,
}: {
  datos: { etiqueta: string; valor: number; color: string; sufijo?: string }[];
}) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="space-y-2.5">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex items-center gap-3">
          <p className="text-xs text-gray-500 w-40 flex-shrink-0 truncate" title={d.etiqueta}>{d.etiqueta}</p>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${(d.valor / max) * 100}%`, backgroundColor: d.color, minWidth: d.valor > 0 ? "28px" : "0px" }}
              title={`${d.etiqueta}: ${d.valor}${d.sufijo ?? ""}`}
            >
              <span className="text-[10px] font-bold text-white whitespace-nowrap">{d.valor}{d.sufijo ?? ""}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarrasVerticales({
  datos,
  formatoValor,
}: {
  datos: { etiqueta: string; valor: number }[];
  formatoValor: (v: number) => string;
}) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-2 h-44 overflow-x-auto pb-1">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-14" title={`${d.etiqueta}: ${formatoValor(d.valor)}`}>
          <span className="text-[10px] font-bold text-[#1A1A1A] whitespace-nowrap">{d.valor > 0 ? formatoValor(d.valor) : ""}</span>
          <div className="w-7 bg-gray-100 rounded-t-md flex items-end" style={{ height: "120px" }}>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)}%`, backgroundColor: NARANJA }} />
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ datos }: { datos: { etiqueta: string; valor: number; color: string }[] }) {
  const total = datos.reduce((acc, d) => acc + d.valor, 0);
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-6">Sin datos.</p>;
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={radio} fill="none" stroke="#F3F4F6" strokeWidth="20" />
        {datos.map((d) => {
          const frac = d.valor / total;
          const largo = frac * circunferencia;
          const offset = acumulado;
          acumulado += largo;
          return (
            <circle
              key={d.etiqueta}
              cx="80"
              cy="80"
              r={radio}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${largo} ${circunferencia - largo}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            >
              <title>{`${d.etiqueta}: ${d.valor} (${Math.round(frac * 100)}%)`}</title>
            </circle>
          );
        })}
        <circle cx="80" cy="80" r={radio - 20} fill="white" />
      </svg>
      <div className="space-y-1.5">
        {datos.map((d) => (
          <div key={d.etiqueta} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.etiqueta}</span>
            <span className="font-bold text-[#1A1A1A]">{d.valor}</span>
            <span className="text-gray-400">({Math.round((d.valor / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GraficoNoConformidadesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const casos = parseNoConformidades(docs[ITEM_KEY] ?? "");
  const porEtapa = resumenPorEtapaNC(casos);
  const porSeveridad = resumenPorSeveridadNC(casos);
  const porEstado = resumenPorEstadoNC(casos);
  const porCausa = resumenPorCausaNC(casos);
  const porMes = costoPorMesNC(casos);
  const ranking = rankingPorProducto(casos, 8);
  const costoTotal = costoTotalNoCalidad(casos);
  const abiertos = casos.filter((c) => estaAbiertaNC(c.estado)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`${basePath}/no_conformidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← No Conformidades
        </Link>
        <Link href={`${basePath}/no_conformidades/matriz`} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F5A623]/50">
          📊 Ver Matriz →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gráfico de No Conformidades</h1>
        <p className="text-gray-500 text-sm mt-1">Análisis visual de todos los casos registrados.</p>
      </div>

      {casos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay no conformidades registradas para graficar.</p>
          <Link href={`${basePath}/no_conformidades`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Registrar la primera →
          </Link>
        </div>
      ) : (
        <>
          {/* KPIs resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">📋</p>
              <p className="text-lg font-bold text-[#1A1A1A]">{casos.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Casos totales</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">🔴</p>
              <p className="text-lg font-bold text-[#1A1A1A]">{abiertos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Abiertos</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">💰</p>
              <p className="text-lg font-bold text-[#1A1A1A] truncate">{costoTotal > 0 ? formatoMontoNC(costoTotal) : "—"}</p>
              <p className="text-xs text-gray-500 mt-0.5">Costo de no calidad</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono="📍" titulo="Por Etapa de Detección">
              <BarraHorizontal datos={porEtapa.map((r) => ({ etiqueta: r.etapa, valor: r.cantidad, color: NARANJA }))} />
            </Seccion>

            <Seccion icono="🚦" titulo="Por Severidad">
              <BarraHorizontal datos={porSeveridad.map((r) => ({ etiqueta: r.severidad, valor: r.cantidad, color: r.color }))} />
            </Seccion>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono="📌" titulo="Por Estado">
              <DonutChart datos={porEstado.map((r) => ({ etiqueta: r.estado, valor: r.cantidad, color: r.color }))} />
            </Seccion>

            <Seccion icono="🔧" titulo="Por Causa Aparente">
              {porCausa.length > 0 ? (
                <BarraHorizontal datos={porCausa.map((r) => ({ etiqueta: r.causa, valor: r.cantidad, color: NARANJA }))} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Sin datos de causa aparente cargados.</p>
              )}
            </Seccion>
          </div>

          <Seccion icono="💰" titulo="Costo de No Calidad por Mes">
            {porMes.length > 0 ? (
              <BarrasVerticales datos={porMes.map((m) => ({ etiqueta: etiquetaMes(m.mes), valor: m.costo }))} formatoValor={(v) => formatoMontoNC(v)} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Sin costos registrados todavía.</p>
            )}
          </Seccion>

          <Seccion icono="🏆" titulo="Productos con Más No Conformidades">
            <BarraHorizontal datos={ranking.map((r) => ({ etiqueta: r.productoNombre, valor: r.cantidad, color: NARANJA, sufijo: "" }))} />
          </Seccion>
        </>
      )}
    </div>
  );
}
