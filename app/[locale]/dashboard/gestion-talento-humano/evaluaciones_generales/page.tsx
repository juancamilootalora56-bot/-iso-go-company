"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import LineChartSimple from "@/components/dashboard/LineChartSimple";
import { parsePersonal } from "@/lib/personal";
import {
  parseEvaluaciones,
  promedioEvaluacion,
  resultadoEvaluacion,
  colorResultado,
  type EvaluacionDesempeno,
} from "@/lib/evaluacionDesempeno";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const RESULTADOS = ["Excelente", "Bueno", "Regular", "Deficiente"];

type FilaMatriz = EvaluacionDesempeno & { empleadoId: string; empleadoNombre: string; empleadoCargo: string };

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function EvaluacionesGeneralesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const [anioVista, setAnioVista] = useState(new Date().getFullYear());
  const [filtroResultado, setFiltroResultado] = useState("");

  const filas: FilaMatriz[] = useMemo(() => {
    const personal = parsePersonal(docs["personal_lista"] ?? "");
    const todas: FilaMatriz[] = [];
    personal.forEach((p) => {
      const evals = parseEvaluaciones(docs[`evaluacion_${p.id}`] ?? "");
      evals.forEach((e) => {
        todas.push({ ...e, empleadoId: p.id, empleadoNombre: `${p.nombre} ${p.apellido}`, empleadoCargo: p.cargo });
      });
    });
    return todas;
  }, [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filasConResultado = filas.map((f) => ({
    ...f,
    promedio: promedioEvaluacion(f),
    resultado: resultadoEvaluacion(promedioEvaluacion(f)),
  }));

  const filasFiltradas = filtroResultado ? filasConResultado.filter((f) => f.resultado === filtroResultado) : filasConResultado;
  const filasOrdenadas = [...filasFiltradas].sort((a, b) => (b.periodoFin || "").localeCompare(a.periodoFin || ""));

  const evaluadas = filasConResultado.filter((f) => f.promedio > 0);
  const promedioGeneral = evaluadas.length > 0 ? evaluadas.reduce((acc, f) => acc + f.promedio, 0) / evaluadas.length : 0;
  const colaboradoresEvaluados = new Set(filas.map((f) => f.empleadoId)).size;
  const excelentesBuenos = filasConResultado.filter((f) => f.resultado === "Excelente" || f.resultado === "Bueno").length;

  const porMesPromedio = MESES_CORTOS.map((label, idx) => {
    const delMes = filasConResultado.filter((f) => {
      if (!f.periodoFin) return false;
      const d = new Date(f.periodoFin + "T00:00:00");
      return d.getFullYear() === anioVista && d.getMonth() === idx && f.promedio > 0;
    });
    const promedio = delMes.length > 0 ? delMes.reduce((acc, f) => acc + f.promedio, 0) / delMes.length : 0;
    return { label, valor: Math.round(promedio * 10) / 10 };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Evaluaciones Generales</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen consolidado de las evaluaciones de desempeño de todo el personal.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📋", valor: filas.length, label: "Evaluaciones totales" },
          { icon: "⭐", valor: promedioGeneral > 0 ? `${promedioGeneral.toFixed(1)}/5` : "—", label: "Promedio general" },
          { icon: "✅", valor: excelentesBuenos, label: "Excelente / Bueno" },
          { icon: "👥", valor: colaboradoresEvaluados, label: "Colaboradores evaluados" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl mb-1">{k.icon}</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{k.valor}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <Seccion icono="📈" titulo="Informe: promedio de desempeño por mes">
        <div className="flex items-center justify-center gap-2 mb-2">
          <button onClick={() => setAnioVista((a) => a - 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">‹</button>
          <span className="text-sm font-bold text-[#1A1A1A] w-14 text-center">{anioVista}</span>
          <button onClick={() => setAnioVista((a) => a + 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">›</button>
        </div>
        <LineChartSimple puntos={porMesPromedio} color="#22C55E" gradientId="evalGeneralesPromedio" />
      </Seccion>

      <Seccion icono="🗂️" titulo="Matriz de Evaluaciones">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroResultado("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroResultado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todas ({filas.length})
          </button>
          {RESULTADOS.map((r) => (
            <button
              key={r}
              onClick={() => setFiltroResultado(r)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroResultado === r ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroResultado === r ? { backgroundColor: colorResultado(r) } : {}}
            >
              {r} ({filasConResultado.filter((f) => f.resultado === r).length})
            </button>
          ))}
        </div>

        {filasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Todavía no hay evaluaciones cargadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Colaborador</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Cargo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Período</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Evaluador</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Promedio</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {filasOrdenadas.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 align-top">
                    <td className="p-2.5 font-semibold text-[#1A1A1A] whitespace-nowrap">
                      <Link href={`${basePath}/gestion_personal/${f.empleadoId}`} className="hover:text-[#F5A623]">
                        {f.empleadoNombre}
                      </Link>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{f.empleadoCargo || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">
                      {fechaLegible(f.periodoInicio)} — {fechaLegible(f.periodoFin)}
                    </td>
                    <td className="p-2.5 text-gray-600">{f.tipoEvaluacion}</td>
                    <td className="p-2.5 text-gray-600">{f.evaluador || "—"}</td>
                    <td className="p-2.5 text-gray-600">{f.promedio > 0 ? `${f.promedio.toFixed(1)}/5` : "—"}</td>
                    <td className="p-2.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                        style={{ backgroundColor: colorResultado(f.resultado) }}
                      >
                        {f.resultado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
}
