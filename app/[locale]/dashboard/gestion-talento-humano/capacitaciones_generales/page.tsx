"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import LineChartSimple from "@/components/dashboard/LineChartSimple";
import { parsePersonal } from "@/lib/personal";
import { parsePrograma, colorEstado, MESES, MESES_CORTOS, ESTADOS_CAPACITACION, type CapacitacionItem } from "@/lib/capacitacionPersonal";

type FilaMatriz = CapacitacionItem & { empleadoId: string; empleadoNombre: string; empleadoCargo: string };

export default function CapacitacionesGeneralesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const [anioVista, setAnioVista] = useState(new Date().getFullYear());
  const [filtroEstado, setFiltroEstado] = useState("");

  const filas: FilaMatriz[] = useMemo(() => {
    const personal = parsePersonal(docs["personal_lista"] ?? "");
    const todas: FilaMatriz[] = [];
    personal.forEach((p) => {
      const programa = parsePrograma(docs[`capacitacion_${p.id}`] ?? "");
      programa.capacitaciones.forEach((c) => {
        todas.push({ ...c, empleadoId: p.id, empleadoNombre: `${p.nombre} ${p.apellido}`, empleadoCargo: p.cargo });
      });
    });
    return todas;
  }, [docs]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filasFiltradas = filtroEstado ? filas.filter((f) => f.estado === filtroEstado) : filas;
  const filasOrdenadas = [...filasFiltradas].sort((a, b) => (b.fechaProgramada || "").localeCompare(a.fechaProgramada || ""));

  const totalHoras = filas.reduce((acc, f) => acc + (parseFloat(f.duracionHoras) || 0), 0);
  const completadas = filas.filter((f) => f.estado === "Completada").length;
  const colaboradoresConCapacitacion = new Set(filas.map((f) => f.empleadoId)).size;

  const porMesCantidad = MESES_CORTOS.map((label, idx) => ({
    label,
    valor: filas.filter((f) => {
      if (!f.fechaProgramada) return false;
      const d = new Date(f.fechaProgramada + "T00:00:00");
      return d.getFullYear() === anioVista && d.getMonth() === idx;
    }).length,
  }));

  const porMesCronograma = MESES.map((_, idx) =>
    filas.filter((f) => {
      if (!f.fechaProgramada) return false;
      const d = new Date(f.fechaProgramada + "T00:00:00");
      return d.getFullYear() === anioVista && d.getMonth() === idx;
    })
  );

  const porMesHoras = MESES_CORTOS.map((label, idx) => ({
    label,
    valor: Math.round(
      filas
        .filter((f) => {
          if (!f.fechaProgramada) return false;
          const d = new Date(f.fechaProgramada + "T00:00:00");
          return d.getFullYear() === anioVista && d.getMonth() === idx;
        })
        .reduce((acc, f) => acc + (parseFloat(f.duracionHoras) || 0), 0)
    ),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Capacitaciones Generales</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen consolidado de las capacitaciones de todo el personal.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📋", valor: filas.length, label: "Capacitaciones totales" },
          { icon: "✅", valor: completadas, label: "Completadas" },
          { icon: "⏱️", valor: `${totalHoras} h`, label: "Horas totales" },
          { icon: "👥", valor: colaboradoresConCapacitacion, label: "Colaboradores alcanzados" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl mb-1">{k.icon}</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{k.valor}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Cronograma general */}
      <Seccion icono="📅" titulo="Cronograma General de Capacitación">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button onClick={() => setAnioVista((a) => a - 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">‹</button>
          <span className="text-sm font-bold text-[#1A1A1A] w-14 text-center">{anioVista}</span>
          <button onClick={() => setAnioVista((a) => a + 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">›</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {MESES.map((mes, idx) => (
            <div key={mes} className="bg-[#FAFAFA] rounded-xl border border-gray-100 p-3 min-h-[92px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{mes}</p>
              <div className="space-y-1.5">
                {porMesCronograma[idx].map((c) => (
                  <Link
                    key={c.id}
                    href={`${basePath}/gestion_personal/${c.empleadoId}`}
                    className="block text-[11px] font-semibold text-white rounded-md px-2 py-1 truncate"
                    style={{ backgroundColor: colorEstado(c.estado) }}
                    title={`${c.tema} — ${c.empleadoNombre}`}
                  >
                    {c.tema} <span className="opacity-80">· {c.empleadoNombre.split(" ")[0]}</span>
                  </Link>
                ))}
                {porMesCronograma[idx].length === 0 && <p className="text-[11px] text-gray-300">—</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-4 text-[11px] text-gray-500">
          {ESTADOS_CAPACITACION.map((e) => (
            <span key={e} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorEstado(e) }} />
              {e}
            </span>
          ))}
        </div>
      </Seccion>

      {/* Informes */}
      <Seccion icono="📈" titulo="Informe: capacitaciones por mes">
        <div className="flex items-center justify-center gap-2 mb-2">
          <button onClick={() => setAnioVista((a) => a - 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">‹</button>
          <span className="text-sm font-bold text-[#1A1A1A] w-14 text-center">{anioVista}</span>
          <button onClick={() => setAnioVista((a) => a + 1)} className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">›</button>
        </div>
        <LineChartSimple puntos={porMesCantidad} color="#F5A623" gradientId="capGeneralesCantidad" />
      </Seccion>

      <Seccion icono="⏱️" titulo="Informe: horas de capacitación por mes">
        <LineChartSimple puntos={porMesHoras} color="#3B82F6" gradientId="capGeneralesHoras" />
      </Seccion>

      {/* Matriz */}
      <Seccion icono="🗂️" titulo="Matriz de Capacitaciones">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroEstado("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todas ({filas.length})
          </button>
          {ESTADOS_CAPACITACION.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroEstado === e ? { backgroundColor: colorEstado(e) } : {}}
            >
              {e} ({filas.filter((f) => f.estado === e).length})
            </button>
          ))}
        </div>

        {filasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Todavía no hay capacitaciones cargadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Colaborador</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Cargo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tema</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Modalidad</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Duración</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
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
                    <td className="p-2.5 text-gray-600">{f.tema}</td>
                    <td className="p-2.5 text-gray-600">{f.tipo || "—"}</td>
                    <td className="p-2.5 text-gray-600">{f.modalidad || "—"}</td>
                    <td className="p-2.5 text-gray-600">{f.responsable || "—"}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">
                      {f.fechaProgramada ? new Date(f.fechaProgramada + "T00:00:00").toLocaleDateString("es") : "—"}
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{f.duracionHoras ? `${f.duracionHoras} h` : "—"}</td>
                    <td className="p-2.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                        style={{ backgroundColor: colorEstado(f.estado) }}
                      >
                        {f.estado}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 max-w-[160px]">
                      {f.calificacion || f.evaluacionEficacia ? (
                        <>
                          {f.calificacion && <span className="font-semibold text-[#1A1A1A]">{f.calificacion}</span>}
                          {f.calificacion && f.evaluacionEficacia && " · "}
                          <span className="line-clamp-2">{f.evaluacionEficacia}</span>
                        </>
                      ) : (
                        "—"
                      )}
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
