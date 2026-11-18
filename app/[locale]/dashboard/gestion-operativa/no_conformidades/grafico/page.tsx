"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { temaPanelDe } from "@/lib/temaPanel";
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
import { Table2, ClipboardList, Flame, DollarSign, Target, MapPin, AlertTriangle, Flag, Wrench, TrendingUp, Trophy } from "lucide-react";

const ITEM_KEY = "no_conformidades_lista";
const ACENTO = "#EA580C";

function etiquetaMes(mes: string) {
  try {
    return new Date(mes + "-01T00:00:00").toLocaleDateString("es", { month: "short", year: "2-digit" });
  } catch {
    return mes;
  }
}

function AnilloProgreso({
  valor,
  color,
  label,
  textColor = "#FFFFFF",
  trackColor = "rgba(255,255,255,0.12)",
  labelColor = "#9CA3AF",
}: {
  valor: number | null;
  color: string;
  label: string;
  textColor?: string;
  trackColor?: string;
  labelColor?: string;
}) {
  const pct = valor === null ? 0 : Math.max(0, Math.min(100, valor));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="-ml-[52px] w-11 text-center">
        <span className="text-sm font-bold" style={{ color: textColor }}>{valor !== null ? `${valor}%` : "—"}</span>
      </div>
      <p className="text-xs" style={{ color: labelColor }}>{label}</p>
    </div>
  );
}

function BarraHorizontalPro({ datos }: { datos: { etiqueta: string; valor: number; color: string; sufijo?: string }[] }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="space-y-3">
      {datos.map((d) => (
        <div key={d.etiqueta}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 font-medium truncate pr-2" title={d.etiqueta}>{d.etiqueta}</span>
            <span className="font-bold flex-shrink-0" style={{ color: d.color }}>{d.valor}{d.sufijo ?? ""}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.valor / max) * 100, d.valor > 0 ? 3 : 0)}%`, background: `linear-gradient(to right, ${d.color}99, ${d.color})` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarraProporcional({ datos, total }: { datos: { etiqueta: string; valor: number; color: string }[]; total: number }) {
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-6">Sin datos.</p>;
  return (
    <div>
      <div className="flex w-full h-4 rounded-full overflow-hidden bg-gray-100">
        {datos.filter((d) => d.valor > 0).map((d) => (
          <div key={d.etiqueta} style={{ width: `${(d.valor / total) * 100}%`, backgroundColor: d.color }} title={`${d.etiqueta}: ${d.valor}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
        {datos.filter((d) => d.valor > 0).map((d) => (
          <div key={d.etiqueta} className="flex items-center gap-1.5 text-xs">
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

function DonutChart({ datos }: { datos: { etiqueta: string; valor: number; color: string }[] }) {
  const total = datos.reduce((acc, d) => acc + d.valor, 0);
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-6">Sin datos.</p>;
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
          <circle cx="80" cy="80" r={radio} fill="none" stroke="#F3F4F6" strokeWidth="20" />
          {datos.map((d) => {
            const frac = d.valor / total;
            const largo = frac * circunferencia;
            const offset = acumulado;
            acumulado += largo;
            return (
              <circle
                key={d.etiqueta} cx="80" cy="80" r={radio} fill="none" stroke={d.color} strokeWidth="20"
                strokeDasharray={`${largo} ${circunferencia - largo}`} strokeDashoffset={-offset} strokeLinecap="butt"
              >
                <title>{`${d.etiqueta}: ${d.valor} (${Math.round(frac * 100)}%)`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-[#1A1A1A]">{total}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">casos</span>
        </div>
      </div>
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

function GraficoLineaCosto({ datos, formatoValor }: { datos: { etiqueta: string; valor: number }[]; formatoValor: (v: number) => string }) {
  if (datos.length === 0) return null;
  const w = 640;
  const h = 180;
  const padX = 28;
  const padY = 20;
  const max = Math.max(...datos.map((d) => d.valor), 1);
  const paso = datos.length > 1 ? (w - padX * 2) / (datos.length - 1) : 0;
  const puntos = datos.map((d, i) => ({
    x: padX + i * paso,
    y: padY + (1 - d.valor / max) * (h - padY * 2),
    ...d,
  }));
  const linea = puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${linea} L ${puntos[puntos.length - 1].x} ${h - padY} L ${puntos[0].x} ${h - padY} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: Math.max(w, datos.length * 70) }}>
        <defs>
          <linearGradient id="costoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACENTO} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ACENTO} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={padX} x2={w - padX} y1={padY + f * (h - padY * 2)} y2={padY + f * (h - padY * 2)} stroke="#F3F4F6" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#costoFill)" />
        <path d={linea} fill="none" stroke={ACENTO} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p) => (
          <g key={p.etiqueta}>
            <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={ACENTO} strokeWidth="2.5" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">
              {p.valor > 0 ? formatoValor(p.valor) : ""}
            </text>
            <text x={p.x} y={h - 4} textAnchor="middle" fontSize="10" fill="#9CA3AF">
              {p.etiqueta}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function GraficoNoConformidadesPage() {
  const { user, profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);
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
  const cerrados = casos.length - abiertos;
  const tasaCierre = casos.length > 0 ? Math.round((cerrados / casos.length) * 100) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`${basePath}/no_conformidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← No Conformidades
        </Link>
        <Link
          href={`${basePath}/no_conformidades/matriz`}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg hover:opacity-90"
          style={{ backgroundColor: ACENTO }}
        >
          <Table2 size={14} /> Ver matriz →
        </Link>
      </div>

      {/* Hero */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
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
            Análisis visual · todos los casos
          </p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: tema.textPrimary }}>Gráfico de No Conformidades</h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: tema.textMuted }}>
            Tendencias, distribución y costo de no calidad de punta a punta.
          </p>

          {casos.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
                  <ClipboardList size={16} style={{ color: tema.isLight ? ACENTO : "#FDBA74" }} className="mb-1.5" />
                  <p className="text-xl font-bold" style={{ color: tema.textPrimary }}>{casos.length}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Casos totales</p>
                </div>
                <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
                  <Flame size={16} style={{ color: "#EF4444" }} className="mb-1.5" />
                  <p className="text-xl font-bold" style={{ color: abiertos > 0 ? "#EF4444" : tema.textPrimary }}>{abiertos}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Abiertos</p>
                </div>
                <div className="rounded-xl p-3.5" style={{ backgroundColor: tema.cardBg, border: `1px solid ${tema.cardBorder}` }}>
                  <DollarSign size={16} style={{ color: "#22C55E" }} className="mb-1.5" />
                  <p className="text-xl font-bold truncate" style={{ color: tema.textPrimary }}>{costoTotal > 0 ? formatoMontoNC(costoTotal) : "—"}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: tema.textMuted }}>Costo de no calidad</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${tema.cardBorder}` }}>
                <Target size={14} style={{ color: tasaCierre === null ? "#9CA3AF" : tasaCierre >= 70 ? "#22C55E" : tasaCierre >= 40 ? "#F5A623" : "#EF4444" }} />
                <AnilloProgreso
                  valor={tasaCierre}
                  color={tasaCierre === null ? "#9CA3AF" : tasaCierre >= 70 ? "#22C55E" : tasaCierre >= 40 ? "#F5A623" : "#EF4444"}
                  label="Casos cerrados sobre el total"
                  textColor={tema.textPrimary}
                  trackColor={tema.cardBorder}
                  labelColor={tema.textMuted}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {casos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <TrendingUp size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-2">Todavía no hay no conformidades registradas para graficar.</p>
          <Link href={`${basePath}/no_conformidades`} className="text-sm font-semibold hover:opacity-80" style={{ color: ACENTO }}>
            Registrar la primera →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono={<MapPin size={14} />} titulo="Por Etapa de Detección">
              <BarraHorizontalPro datos={porEtapa.map((r) => ({ etiqueta: r.etapa, valor: r.cantidad, color: ACENTO }))} />
            </Seccion>

            <Seccion icono={<AlertTriangle size={14} />} titulo="Por Severidad">
              <BarraProporcional datos={porSeveridad.map((r) => ({ etiqueta: r.severidad, valor: r.cantidad, color: r.color }))} total={casos.length} />
            </Seccion>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono={<Flag size={14} />} titulo="Por Estado">
              <DonutChart datos={porEstado.map((r) => ({ etiqueta: r.estado, valor: r.cantidad, color: r.color }))} />
            </Seccion>

            <Seccion icono={<Wrench size={14} />} titulo="Por Causa Aparente">
              {porCausa.length > 0 ? (
                <BarraHorizontalPro datos={porCausa.map((r) => ({ etiqueta: r.causa, valor: r.cantidad, color: ACENTO }))} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Sin datos de causa aparente cargados.</p>
              )}
            </Seccion>
          </div>

          <Seccion icono={<DollarSign size={14} />} titulo="Costo de No Calidad por Mes">
            {porMes.length > 0 ? (
              <GraficoLineaCosto datos={porMes.map((m) => ({ etiqueta: etiquetaMes(m.mes), valor: m.costo }))} formatoValor={(v) => formatoMontoNC(v)} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Sin costos registrados todavía.</p>
            )}
          </Seccion>

          <Seccion icono={<Trophy size={14} />} titulo="Productos con Más No Conformidades">
            <BarraHorizontalPro datos={ranking.map((r) => ({ etiqueta: r.productoNombre, valor: r.cantidad, color: ACENTO }))} />
          </Seccion>
        </>
      )}
    </div>
  );
}
