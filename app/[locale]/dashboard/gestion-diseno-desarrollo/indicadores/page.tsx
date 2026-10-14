"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseProyectosDiseno,
  parseControlDiseno,
  resumenPorEstadoProyectoDiseno,
  proyectoDisenoAbierto,
  proyectoDisenoVencido,
} from "@/lib/disenoDesarrollo";
import { parseCambiosDiseno, resumenPorEstadoCD, resumenPorMotivoCD, cambiosPorMesCD, cambioDisenoAbierto } from "@/lib/cambiosDiseno";

const TEAL = "#14B8A6";

function etiquetaMes(mes: string) {
  try {
    return new Date(mes + "-01T00:00:00").toLocaleDateString("es", { month: "short", year: "2-digit" });
  } catch {
    return mes;
  }
}

function BarraHorizontal({ datos }: { datos: { etiqueta: string; valor: number; color: string }[] }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="space-y-2.5">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex items-center gap-3">
          <p className="text-xs text-gray-500 w-44 flex-shrink-0 truncate" title={d.etiqueta}>{d.etiqueta}</p>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${(d.valor / max) * 100}%`, backgroundColor: d.color, minWidth: d.valor > 0 ? "28px" : "0px" }}
            >
              <span className="text-[10px] font-bold text-white whitespace-nowrap">{d.valor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarrasVerticales({ datos }: { datos: { etiqueta: string; valor: number }[] }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-2 h-44 overflow-x-auto pb-1">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-14">
          <span className="text-[10px] font-bold text-[#1A1A1A] whitespace-nowrap">{d.valor > 0 ? d.valor : ""}</span>
          <div className="w-7 bg-gray-100 rounded-t-md flex items-end" style={{ height: "120px" }}>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)}%`, backgroundColor: TEAL }} />
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

export default function IndicadoresDisenoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const proyectos = parseProyectosDiseno(docs["proyectos_diseno_lista"] ?? "");
  const cambios = parseCambiosDiseno(docs["cambios_diseno_lista"] ?? "");

  const activos = proyectos.filter((p) => proyectoDisenoAbierto(p.estado)).length;
  const vencidos = proyectos.filter((p) => proyectoDisenoVencido(p)).length;
  const porEstadoProyecto = resumenPorEstadoProyectoDiseno(proyectos);

  let verificacionesPendientes = 0;
  let validacionesPendientes = 0;
  proyectos.forEach((p) => {
    const control = parseControlDiseno(docs[`control_diseno_${p.id}`] ?? "");
    verificacionesPendientes += control.verificaciones.filter((v) => v.resultado === "Pendiente").length;
    validacionesPendientes += control.validaciones.filter((v) => v.resultado === "Pendiente").length;
  });

  const porEstadoCambio = resumenPorEstadoCD(cambios);
  const porMotivoCambio = resumenPorMotivoCD(cambios);
  const porMesCambio = cambiosPorMesCD(cambios);
  const cambiosAbiertos = cambios.filter((c) => cambioDisenoAbierto(c.estado)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Diseño y Desarrollo
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Indicadores de Diseño y Desarrollo</h1>
        <p className="text-gray-500 text-sm mt-1">Panorama general de todos tus proyectos de diseño (ISO 9001, cláusula 8.3).</p>
      </div>

      {proyectos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay proyectos de diseño registrados para graficar.</p>
          <Link href={`${basePath}/inscripcion_proyecto`} className="text-sm text-[#14B8A6] font-semibold hover:text-[#0d9488]">
            Registrar el primero →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">🧪</p>
              <p className="text-lg font-bold text-[#1A1A1A]">{proyectos.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Proyectos totales</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">🔵</p>
              <p className="text-lg font-bold text-[#1A1A1A]">{activos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Activos</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">⏰</p>
              <p className="text-lg font-bold" style={{ color: vencidos > 0 ? "#EF4444" : "#1A1A1A" }}>{vencidos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Vencidos</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">✅</p>
              <p className="text-lg font-bold" style={{ color: verificacionesPendientes + validacionesPendientes > 0 ? "#F5A623" : "#1A1A1A" }}>
                {verificacionesPendientes + validacionesPendientes}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Controles pendientes</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">🔧</p>
              <p className="text-lg font-bold text-[#1A1A1A]">{cambiosAbiertos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cambios en curso</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono="📌" titulo="Proyectos por Estado">
              <DonutChart datos={porEstadoProyecto.map((r) => ({ etiqueta: r.estado, valor: r.cantidad, color: r.color }))} />
            </Seccion>

            <Seccion icono="🔎" titulo="Controles Pendientes">
              <BarraHorizontal
                datos={[
                  { etiqueta: "Verificaciones pendientes", valor: verificacionesPendientes, color: "#F5A623" },
                  { etiqueta: "Validaciones pendientes", valor: validacionesPendientes, color: TEAL },
                ]}
              />
            </Seccion>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Seccion icono="📌" titulo="Cambios por Estado">
              {porEstadoCambio.length > 0 ? (
                <DonutChart datos={porEstadoCambio.map((r) => ({ etiqueta: r.estado, valor: r.cantidad, color: r.color }))} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Sin cambios registrados todavía.</p>
              )}
            </Seccion>

            <Seccion icono="🔧" titulo="Cambios por Motivo">
              {porMotivoCambio.length > 0 ? (
                <BarraHorizontal datos={porMotivoCambio.map((r) => ({ etiqueta: r.motivo, valor: r.cantidad, color: TEAL }))} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Sin datos de motivo cargados.</p>
              )}
            </Seccion>
          </div>

          <Seccion icono="📅" titulo="Cambios Solicitados por Mes">
            {porMesCambio.length > 0 ? (
              <BarrasVerticales datos={porMesCambio.map((m) => ({ etiqueta: etiquetaMes(m.mes), valor: m.cantidad }))} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Sin cambios registrados todavía.</p>
            )}
          </Seccion>
        </>
      )}
    </div>
  );
}
