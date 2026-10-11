"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import { parseClientes } from "@/lib/clientes";
import {
  parseEncuestas,
  resultadoEncuesta,
  nivelSatisfaccion,
  colorNivelSatisfaccion,
  claseNPS,
  colorNPS,
  calcularNPS,
  PREGUNTAS_BASE_SATISFACCION,
  type EncuestaSatisfaccion,
} from "@/lib/satisfaccionCliente";

type FilaMatriz = EncuestaSatisfaccion & { clienteId: string; clienteNombre: string; clienteSector: string };

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function CeldaEstrellas({ valor }: { valor: number | undefined }) {
  if (valor === undefined) return <span className="text-gray-300 text-xs">—</span>;
  if (valor === 0) return <span className="text-gray-300 text-xs">Sin calif.</span>;
  return <span className="text-[#F5A623] text-xs font-bold whitespace-nowrap">{"★".repeat(valor)}{"☆".repeat(5 - valor)}</span>;
}

export default function SatisfaccionClientesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;

  const { docs, loading } = useGestionDocumentos("comercial", user?.id ?? null);

  const filas: FilaMatriz[] = useMemo(() => {
    const clientes = parseClientes(docs["clientes_lista"] ?? "");
    const todas: FilaMatriz[] = [];
    clientes.forEach((c) => {
      const encuestas = parseEncuestas(docs[`satisfaccion_cliente_${c.id}`] ?? "");
      encuestas.forEach((e) => {
        todas.push({ ...e, clienteId: c.id, clienteNombre: c.razonSocial, clienteSector: c.sector });
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
  const totalEncuestas = filas.length;
  const clientesEncuestados = new Set(filas.map((f) => f.clienteId)).size;
  const promedioGeneral =
    filas.length > 0 ? filas.reduce((acc, f) => acc + resultadoEncuesta(f).porcentaje, 0) / filas.length : 0;
  const npsGeneral = calcularNPS(filas);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión Comercial
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Satisfacción del Cliente</h1>
        <p className="text-gray-500 text-sm mt-1">
          Matriz consolidada de resultados por período — una tabla por cada ronda de encuestas realizada.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📋", valor: totalEncuestas, label: "Encuestas totales" },
          { icon: "🏢", valor: clientesEncuestados, label: "Clientes encuestados" },
          { icon: "⭐", valor: promedioGeneral > 0 ? `${promedioGeneral.toFixed(1)}%` : "—", label: "Índice de satisfacción" },
          { icon: "📈", valor: npsGeneral !== null ? npsGeneral : "—", label: "NPS consolidado" },
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
          <p className="text-gray-500 text-sm mb-2">Todavía no hay encuestas de satisfacción registradas.</p>
          <Link href={`${basePath}/lista_maestra_clientes`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
            Ir a la Lista Maestra de Clientes →
          </Link>
        </div>
      ) : (
        periodosOrdenados.map(([periodo, filasPeriodo]) => {
          // Columnas: las 13 preguntas base + las personalizadas que aparezcan en este período.
          const columnasLibres: string[] = [];
          filasPeriodo.forEach((f) => {
            f.preguntas.forEach((p) => {
              if (p.personalizada && !columnasLibres.includes(p.texto)) columnasLibres.push(p.texto);
            });
          });
          const columnas = [...PREGUNTAS_BASE_SATISFACCION, ...columnasLibres];

          const filasOrdenadas = [...filasPeriodo].sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre));
          const promedioPeriodo =
            filasPeriodo.reduce((acc, f) => acc + resultadoEncuesta(f).porcentaje, 0) / filasPeriodo.length;
          const npsPeriodo = calcularNPS(filasPeriodo);

          return (
            <Seccion key={periodo} icono="🗂️" titulo={`Matriz de Satisfacción — ${periodo}`}>
              <div className="flex items-center gap-4 mb-4 flex-wrap text-xs text-gray-500">
                <span>{filasPeriodo.length} encuesta{filasPeriodo.length !== 1 ? "s" : ""}</span>
                <span>· Índice del período: <strong className="text-[#1A1A1A]">{promedioPeriodo.toFixed(1)}%</strong></span>
                <span>· NPS: <strong className="text-[#1A1A1A]">{npsPeriodo !== null ? npsPeriodo : "—"}</strong></span>
              </div>

              <div className="overflow-x-auto">
                <table className="text-xs min-w-max border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-2.5 font-semibold border-b border-gray-100 sticky left-0 bg-gray-50 whitespace-nowrap">Cliente</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Fecha</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Canal</th>
                      {columnas.map((col) => (
                        <th key={col} className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">{col}</th>
                      ))}
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Satisf. General</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Recompra</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">NPS</th>
                      <th className="p-2.5 font-semibold border-b border-gray-100 whitespace-nowrap">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasOrdenadas.map((f) => {
                      const r = resultadoEncuesta(f);
                      const nivel = nivelSatisfaccion(r.porcentaje);
                      const nps = claseNPS(f.nps);
                      return (
                        <tr key={f.id} className="border-b border-gray-50 align-middle hover:bg-[#FAFAFA]">
                          <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap sticky left-0 bg-white">
                            <Link href={`${basePath}/lista_maestra_clientes/${f.clienteId}`} className="hover:text-[#F5A623]">
                              {f.clienteNombre}
                            </Link>
                            {f.clienteSector && <p className="text-[10px] text-gray-400 font-normal">{f.clienteSector}</p>}
                          </td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaLegible(f.fecha)}</td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">{f.canal}</td>
                          {columnas.map((col) => (
                            <td key={col} className="p-2.5">
                              <CeldaEstrellas valor={f.preguntas.find((p) => p.texto === col)?.calificacion} />
                            </td>
                          ))}
                          <td className="p-2.5"><CeldaEstrellas valor={f.satisfaccionGeneral} /></td>
                          <td className="p-2.5"><CeldaEstrellas valor={f.probabilidadRecompra} /></td>
                          <td className="p-2.5">
                            {f.nps >= 0 ? (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                                style={{ backgroundColor: colorNPS(nps) }}
                              >
                                {f.nps} · {nps}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                              style={{ backgroundColor: colorNivelSatisfaccion(nivel) }}
                            >
                              {nivel} · {r.porcentaje.toFixed(0)}%
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
