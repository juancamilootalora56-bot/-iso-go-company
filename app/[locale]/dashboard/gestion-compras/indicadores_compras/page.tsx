"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseProveedores } from "@/lib/proveedores";
import {
  parseEvaluacionesProveedor,
  criteriosEfectivos,
  resultadoEvaluacionProveedor,
  nivelResultado,
  colorNivel,
  esProveedorPotencial,
  puntosDeNivel,
  CRITERIOS_BASE_PROVEEDOR,
  type EvaluacionProveedor,
  type NivelCalificacion,
} from "@/lib/evaluacionProveedor";
import {
  parseComprasProveedor,
  formatoMontoCompra,
  totalCompras,
  resumenComprasPorMes,
  resumenComprasPorAnio,
  type CompraProveedor,
} from "@/lib/comprasProveedor";

const NARANJA = "#F5A623";

type FilaMatriz = EvaluacionProveedor & { proveedorId: string; proveedorNombre: string; proveedorRubro: string };
type CompraConProveedor = CompraProveedor & { proveedorId: string; proveedorNombre: string };

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function etiquetaMes(mes: string) {
  try {
    return new Date(mes + "-01T00:00:00").toLocaleDateString("es", { month: "short", year: "2-digit" });
  } catch {
    return mes;
  }
}

function CeldaNivel({ nivel }: { nivel: NivelCalificacion | undefined }) {
  if (!nivel) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
      style={{ backgroundColor: colorNivel(nivel) }}
    >
      {nivel.slice(0, 3)} · {puntosDeNivel(nivel)}
    </span>
  );
}

function BarraHorizontal({
  datos,
}: {
  datos: { etiqueta: string; valor: number; color: string; sufijo?: string; formatoValor?: (v: number) => string }[];
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
            >
              <span className="text-[10px] font-bold text-white whitespace-nowrap">
                {d.formatoValor ? d.formatoValor(d.valor) : d.valor}
                {d.sufijo ?? ""}
              </span>
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
        <div key={d.etiqueta} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16" title={`${d.etiqueta}: ${formatoValor(d.valor)}`}>
          <span className="text-[10px] font-bold text-[#1A1A1A] whitespace-nowrap">{d.valor > 0 ? formatoValor(d.valor) : ""}</span>
          <div className="w-8 bg-gray-100 rounded-t-md flex items-end" style={{ height: "120px" }}>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)}%`, backgroundColor: NARANJA }} />
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}

export default function IndicadoresComprasPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;

  const { docs, loading } = useGestionDocumentos("compras", user?.id ?? null);

  const { filasEvaluacion, comprasConProveedor } = useMemo(() => {
    const proveedores = parseProveedores(docs["proveedores_lista"] ?? "");
    const evals: FilaMatriz[] = [];
    const compras: CompraConProveedor[] = [];
    proveedores.forEach((p) => {
      parseEvaluacionesProveedor(docs[`evaluacion_proveedor_${p.id}`] ?? "").forEach((e) => {
        evals.push({ ...e, proveedorId: p.id, proveedorNombre: p.razonSocial, proveedorRubro: p.rubro });
      });
      parseComprasProveedor(docs[`compras_proveedor_${p.id}`] ?? "").forEach((c) => {
        compras.push({ ...c, proveedorId: p.id, proveedorNombre: p.razonSocial });
      });
    });
    return { filasEvaluacion: evals, comprasConProveedor: compras };
  }, [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  // --- Evaluación de Proveedores (agrupada por período) ---
  const grupos = new Map<string, FilaMatriz[]>();
  filasEvaluacion.forEach((f) => {
    const clave = f.periodo?.trim() || "Sin período asignado";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(f);
  });
  const periodosOrdenados = [...grupos.entries()].sort((a, b) => {
    const fechaMaxA = Math.max(...a[1].map((f) => new Date(f.fecha || "1970-01-01").getTime()));
    const fechaMaxB = Math.max(...b[1].map((f) => new Date(f.fecha || "1970-01-01").getTime()));
    return fechaMaxB - fechaMaxA;
  });
  const totalEvaluaciones = filasEvaluacion.length;
  const proveedoresEvaluados = new Set(filasEvaluacion.map((f) => f.proveedorId)).size;
  const promedioGeneral =
    filasEvaluacion.length > 0 ? filasEvaluacion.reduce((acc, f) => acc + resultadoEvaluacionProveedor(f).porcentaje, 0) / filasEvaluacion.length : 0;
  const potenciales = filasEvaluacion.filter((f) => esProveedorPotencial(resultadoEvaluacionProveedor(f).porcentaje)).length;

  // --- Compras por mes y por año ---
  const porMes = resumenComprasPorMes(comprasConProveedor).slice(-12);
  const porAnio = resumenComprasPorAnio(comprasConProveedor);
  const montoTotalCompras = totalCompras(comprasConProveedor);

  // --- Comportamiento de compras por proveedor ---
  const mapaProveedor = new Map<string, { nombre: string; monto: number; cantidad: number }>();
  comprasConProveedor.forEach((c) => {
    const actual = mapaProveedor.get(c.proveedorId) ?? { nombre: c.proveedorNombre, monto: 0, cantidad: 0 };
    mapaProveedor.set(c.proveedorId, { nombre: actual.nombre, monto: actual.monto + c.montoTotal, cantidad: actual.cantidad + 1 });
  });
  const rankingProveedores = Array.from(mapaProveedor.values()).sort((a, b) => b.monto - a.monto);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Compras
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Indicadores de Compras</h1>
        <p className="text-gray-500 text-sm mt-1">
          Evaluación de proveedores y el comportamiento de todas las compras realizadas, por mes, por año y por proveedor.
        </p>
      </div>

      {/* Compras por Mes y por Año */}
      <Seccion icono="📈" titulo="Compras por Mes y por Año">
        {comprasConProveedor.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            Todavía no hay compras registradas. Cargalas desde la pestaña &quot;Compras&quot; del perfil de cada proveedor.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Monto total comprado</p>
                <p className="text-lg font-extrabold text-white mt-1">{formatoMontoCompra(montoTotalCompras)}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Compras registradas</p>
                <p className="text-lg font-extrabold text-[#1A1A1A] mt-1">{comprasConProveedor.length}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Proveedores con compras</p>
                <p className="text-lg font-extrabold text-[#1A1A1A] mt-1">{mapaProveedor.size}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Por mes (últimos 12)</p>
              <BarrasVerticales datos={porMes.map((m) => ({ etiqueta: etiquetaMes(m.mes), valor: m.monto }))} formatoValor={(v) => formatoMontoCompra(v)} />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Por año</p>
              <BarraHorizontal datos={porAnio.map((a) => ({ etiqueta: a.anio, valor: a.monto, color: NARANJA, formatoValor: formatoMontoCompra }))} />
            </div>
          </div>
        )}
      </Seccion>

      {/* Comportamiento de compras por proveedor */}
      <Seccion icono="🏢" titulo="Comportamiento de Compras por Proveedor">
        {rankingProveedores.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no hay compras asociadas a ningún proveedor.</p>
        ) : (
          <div className="space-y-4">
            <BarraHorizontal
              datos={rankingProveedores.map((r) => ({ etiqueta: r.nombre, valor: r.monto, color: NARANJA, formatoValor: formatoMontoCompra }))}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="p-2.5 font-semibold border-b border-gray-100">Proveedor</th>
                    <th className="p-2.5 font-semibold border-b border-gray-100">N° de compras</th>
                    <th className="p-2.5 font-semibold border-b border-gray-100">Monto total</th>
                    <th className="p-2.5 font-semibold border-b border-gray-100">Ticket promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingProveedores.map((r) => {
                    const id = [...mapaProveedor.entries()].find(([, v]) => v === r)?.[0];
                    return (
                      <tr key={r.nombre} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                        <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">
                          {id ? (
                            <Link href={`${basePath}/lista_maestra_proveedores/${id}`} className="hover:text-[#F5A623]">
                              {r.nombre}
                            </Link>
                          ) : (
                            r.nombre
                          )}
                        </td>
                        <td className="p-2.5 text-gray-600">{r.cantidad}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoMontoCompra(r.monto)}</td>
                        <td className="p-2.5 text-gray-600 whitespace-nowrap">{formatoMontoCompra(r.monto / r.cantidad)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Seccion>

      {/* Evaluación de Proveedores */}
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">Evaluación de Proveedores</h2>
        <p className="text-gray-500 text-xs mb-3">Matriz consolidada de resultados por período — una tabla por cada ronda de evaluación realizada.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { icon: "📋", valor: totalEvaluaciones, label: "Evaluaciones totales" },
            { icon: "🏢", valor: proveedoresEvaluados, label: "Proveedores evaluados" },
            { icon: "⭐", valor: promedioGeneral > 0 ? `${promedioGeneral.toFixed(1)}%` : "—", label: "Promedio general" },
            { icon: "✅", valor: potenciales, label: "Proveedores potenciales" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xl mb-1">{k.icon}</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{k.valor}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {periodosOrdenados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 text-sm mb-2">Todavía no hay evaluaciones de proveedores registradas.</p>
            <Link href={`${basePath}/lista_maestra_proveedores`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
              Ir a la Lista Maestra de Proveedores →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {periodosOrdenados.map(([periodo, filasPeriodo]) => {
              const columnasLibres: string[] = [];
              filasPeriodo.forEach((f) => {
                f.criterios.forEach((c) => {
                  if (c.personalizado && !columnasLibres.includes(c.nombre)) columnasLibres.push(c.nombre);
                });
              });
              const columnas = [...CRITERIOS_BASE_PROVEEDOR, ...columnasLibres];

              const filasOrdenadas = [...filasPeriodo].sort((a, b) => a.proveedorNombre.localeCompare(b.proveedorNombre));
              const promedioPeriodo =
                filasPeriodo.reduce((acc, f) => acc + resultadoEvaluacionProveedor(f).porcentaje, 0) / filasPeriodo.length;
              const potencialesPeriodo = filasPeriodo.filter((f) => esProveedorPotencial(resultadoEvaluacionProveedor(f).porcentaje)).length;

              return (
                <Seccion key={periodo} icono="🗂️" titulo={`Matriz de Evaluación — ${periodo}`}>
                  <div className="flex items-center gap-4 mb-4 flex-wrap text-xs text-gray-500">
                    <span>{filasPeriodo.length} proveedor{filasPeriodo.length !== 1 ? "es" : ""} evaluado{filasPeriodo.length !== 1 ? "s" : ""}</span>
                    <span>· Promedio del período: <strong className="text-[#1A1A1A]">{promedioPeriodo.toFixed(1)}%</strong></span>
                    <span>· {potencialesPeriodo} potencial{potencialesPeriodo !== 1 ? "es" : ""}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="text-xs min-w-max border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left text-gray-500">
                          <th className="p-2.5 font-semibold border-b border-gray-100 sticky left-0 bg-gray-50 whitespace-nowrap">Proveedor</th>
                          <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Fecha</th>
                          <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Actividad</th>
                          {columnas.map((col) => (
                            <th key={col} className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">{col}</th>
                          ))}
                          <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filasOrdenadas.map((f) => {
                          const efectivos = criteriosEfectivos(f);
                          const r = resultadoEvaluacionProveedor(f);
                          const nivel = nivelResultado(r.porcentaje);
                          return (
                            <tr key={f.id} className="border-b border-gray-50 align-middle hover:bg-[#FAFAFA]">
                              <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap sticky left-0 bg-white">
                                <Link href={`${basePath}/lista_maestra_proveedores/${f.proveedorId}`} className="hover:text-[#F5A623]">
                                  {f.proveedorNombre}
                                </Link>
                                {f.proveedorRubro && <p className="text-[10px] text-gray-400 font-normal">{f.proveedorRubro}</p>}
                              </td>
                              <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(f.fecha)}</td>
                              <td className="p-2.5 text-gray-600 whitespace-nowrap">{f.tipoActividad}</td>
                              {columnas.map((col) => (
                                <td key={col} className="p-2.5">
                                  <CeldaNivel nivel={efectivos.find((c) => c.nombre === col)?.nivel} />
                                </td>
                              ))}
                              <td className="p-2.5">
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                                  style={{ backgroundColor: colorNivel(nivel) }}
                                >
                                  {nivel} · {r.porcentaje.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Seccion>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
