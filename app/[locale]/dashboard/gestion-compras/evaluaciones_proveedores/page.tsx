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

type FilaMatriz = EvaluacionProveedor & { proveedorId: string; proveedorNombre: string; proveedorRubro: string };

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
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

export default function EvaluacionesProveedoresPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;

  const { docs, loading } = useGestionDocumentos("compras", user?.id ?? null);

  const filas: FilaMatriz[] = useMemo(() => {
    const proveedores = parseProveedores(docs["proveedores_lista"] ?? "");
    const todas: FilaMatriz[] = [];
    proveedores.forEach((p) => {
      const evals = parseEvaluacionesProveedor(docs[`evaluacion_proveedor_${p.id}`] ?? "");
      evals.forEach((e) => {
        todas.push({ ...e, proveedorId: p.id, proveedorNombre: p.razonSocial, proveedorRubro: p.rubro });
      });
    });
    return todas;
  }, [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  // Agrupar por período — cada período forma su propia matriz.
  const grupos = new Map<string, FilaMatriz[]>();
  filas.forEach((f) => {
    const clave = f.periodo?.trim() || "Sin período asignado";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(f);
  });

  const periodosOrdenados = [...grupos.entries()].sort((a, b) => {
    const fechaMaxA = Math.max(...a[1].map((f) => new Date(f.fecha || "1970-01-01").getTime()));
    const fechaMaxB = Math.max(...b[1].map((f) => new Date(f.fecha || "1970-01-01").getTime()));
    return fechaMaxB - fechaMaxA;
  });

  // KPIs generales
  const totalEvaluaciones = filas.length;
  const proveedoresEvaluados = new Set(filas.map((f) => f.proveedorId)).size;
  const promedioGeneral =
    filas.length > 0 ? filas.reduce((acc, f) => acc + resultadoEvaluacionProveedor(f).porcentaje, 0) / filas.length : 0;
  const potenciales = filas.filter((f) => esProveedorPotencial(resultadoEvaluacionProveedor(f).porcentaje)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Compras
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Evaluación de Proveedores</h1>
        <p className="text-gray-500 text-sm mt-1">
          Matriz consolidada de resultados por período — una tabla por cada ronda de evaluación realizada.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        periodosOrdenados.map(([periodo, filasPeriodo]) => {
          // Columnas: los 11 criterios base + los personalizados que aparezcan en este período.
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
        })
      )}
    </div>
  );
}
