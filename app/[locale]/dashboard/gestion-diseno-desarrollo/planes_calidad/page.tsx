"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProyectosDiseno } from "@/lib/disenoDesarrollo";
import {
  parsePlanesCalidad,
  planCalidadVacio,
  siguienteRadicadoPC,
  numeroDeRadicadoPC,
  resumenPorEstadoPC,
  colorEstadoPlanCalidad,
  ESTADOS_PLAN_CALIDAD,
  type PlanCalidad,
} from "@/lib/planesCalidad";

const ITEM_KEY = "planes_calidad_lista";

const cellInput =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:bg-[#FFF6E5] px-2 py-1.5 text-xs text-[#1A1A1A] placeholder-gray-300 rounded transition-colors";
const cellSelect =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:bg-[#FFF6E5] px-2 py-1.5 text-xs text-[#1A1A1A] rounded transition-colors cursor-pointer";

const COLUMNAS: { key: keyof PlanCalidad; label: string; width: string }[] = [
  { key: "codigo", label: "Código", width: "90px" },
  { key: "nombre", label: "Nombre / Alcance", width: "200px" },
  { key: "objetivo", label: "Objetivo", width: "220px" },
  { key: "requisitosEspecificos", label: "Requisitos específicos", width: "220px" },
  { key: "responsable", label: "Responsable", width: "150px" },
  { key: "recursos", label: "Recursos", width: "180px" },
  { key: "actividadesControl", label: "Actividades de control", width: "240px" },
  { key: "criteriosAceptacion", label: "Criterios de aceptación", width: "220px" },
  { key: "documentosGenerados", label: "Documentos / evidencia", width: "200px" },
  { key: "observaciones", label: "Observaciones", width: "200px" },
];

export default function PlanesCalidadPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);

  const [planes, setPlanes] = useState<PlanCalidad[]>([]);
  const [saving, setSaving] = useState(false);
  const planesRef = useRef<PlanCalidad[]>([]);

  useEffect(() => {
    if (!loading) {
      const cargados = parsePlanesCalidad(docs[ITEM_KEY] ?? "");
      setPlanes(cargados);
      planesRef.current = cargados;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    planesRef.current = planes;
  }, [planes]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const proyectos = parseProyectosDiseno(docs["proyectos_diseno_lista"] ?? "");
  const porEstado = resumenPorEstadoPC(planes);

  async function persistir(actualizados: PlanCalidad[]) {
    setSaving(true);
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setSaving(false);
  }

  function actualizarCelda(id: string, key: keyof PlanCalidad, value: string) {
    setPlanes((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }

  function guardarAlSalir() {
    persistir(planesRef.current);
  }

  async function agregarFila() {
    const nueva = planCalidadVacio(siguienteRadicadoPC(planes.map((p) => numeroDeRadicadoPC(p.codigo))));
    const actualizados = [...planes, nueva];
    setPlanes(actualizados);
    await persistir(actualizados);
  }

  async function eliminarFila(id: string) {
    const actualizados = planes.filter((p) => p.id !== id);
    setPlanes(actualizados);
    await persistir(actualizados);
  }

  return (
    <div className="max-w-full space-y-4">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Diseño y Desarrollo
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Planes de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">
            Plan específico de calidad por producto, proyecto o contrato (ISO 9001 / guía ISO 10005). Editá directamente sobre la planilla.
          </p>
        </div>
        <span className="text-xs text-gray-400">{saving ? "Guardando..." : "✓ Guardado"}</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">📋</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{planes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Planes totales</p>
        </div>
        {porEstado.map((r) => (
          <div key={r.estado} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold" style={{ color: r.color }}>{r.cantidad}</p>
            <p className="text-xs text-gray-500 mt-0.5">{r.estado}</p>
          </div>
        ))}
      </div>

      {/* Planilla tipo Excel */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
          <h3 className="text-white text-xs font-bold uppercase tracking-wide">🗒️ Planilla de Planes de Calidad</h3>
          <button
            type="button"
            onClick={agregarFila}
            className="text-xs font-bold text-[#1A1A1A] bg-[#14B8A6] px-3 py-1.5 rounded-lg hover:bg-[#0d9488] hover:text-white transition-colors"
          >
            + Agregar fila
          </button>
        </div>

        {planes.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm mb-4">Todavía no hay planes de calidad cargados.</p>
            <button
              type="button"
              onClick={agregarFila}
              className="bg-[#14B8A6] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#0d9488] text-sm"
            >
              + Agregar la primera fila
            </button>
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
            <table className="border-collapse text-xs" style={{ minWidth: "2200px" }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50">
                  {COLUMNAS.map((c) => (
                    <th
                      key={c.key}
                      className="p-2 text-left font-semibold text-gray-500 border-b border-r border-gray-100 whitespace-nowrap"
                      style={{ width: c.width, minWidth: c.width }}
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="p-2 text-left font-semibold text-gray-500 border-b border-r border-gray-100 whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>
                    Proyecto relacionado
                  </th>
                  <th className="p-2 text-left font-semibold text-gray-500 border-b border-r border-gray-100 whitespace-nowrap" style={{ width: "130px", minWidth: "130px" }}>
                    Fecha inicio
                  </th>
                  <th className="p-2 text-left font-semibold text-gray-500 border-b border-r border-gray-100 whitespace-nowrap" style={{ width: "130px", minWidth: "130px" }}>
                    Fecha fin
                  </th>
                  <th className="p-2 text-left font-semibold text-gray-500 border-b border-r border-gray-100 whitespace-nowrap" style={{ width: "140px", minWidth: "140px" }}>
                    Estado
                  </th>
                  <th className="p-2 border-b border-gray-100" style={{ width: "40px", minWidth: "40px" }} />
                </tr>
              </thead>
              <tbody>
                {planes.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAFA] group">
                    {COLUMNAS.map((c) => (
                      <td key={c.key} className="border-b border-r border-gray-100">
                        <input
                          value={(p[c.key] as string) ?? ""}
                          onChange={(e) => actualizarCelda(p.id, c.key, e.target.value)}
                          onBlur={guardarAlSalir}
                          className={cellInput}
                          placeholder={c.key === "codigo" ? "PC-0001" : "—"}
                        />
                      </td>
                    ))}
                    <td className="border-b border-r border-gray-100">
                      <select
                        value={p.proyectoRelacionadoId}
                        onChange={(e) => {
                          const proy = proyectos.find((x) => x.id === e.target.value);
                          setPlanes((prev) =>
                            prev.map((x) =>
                              x.id === p.id
                                ? { ...x, proyectoRelacionadoId: e.target.value, proyectoRelacionadoNombre: proy?.nombre ?? "" }
                                : x
                            )
                          );
                        }}
                        onBlur={guardarAlSalir}
                        className={cellSelect}
                      >
                        <option value="">Sin vincular</option>
                        {proyectos.map((proy) => (
                          <option key={proy.id} value={proy.id}>{proy.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-r border-gray-100">
                      <input
                        type="date"
                        value={p.fechaInicio}
                        onChange={(e) => actualizarCelda(p.id, "fechaInicio", e.target.value)}
                        onBlur={guardarAlSalir}
                        className={cellInput}
                      />
                    </td>
                    <td className="border-b border-r border-gray-100">
                      <input
                        type="date"
                        value={p.fechaFin}
                        onChange={(e) => actualizarCelda(p.id, "fechaFin", e.target.value)}
                        onBlur={guardarAlSalir}
                        className={cellInput}
                      />
                    </td>
                    <td className="border-b border-r border-gray-100">
                      <select
                        value={p.estado}
                        onChange={(e) => actualizarCelda(p.id, "estado", e.target.value)}
                        onBlur={guardarAlSalir}
                        className={cellSelect}
                        style={{ color: colorEstadoPlanCalidad(p.estado), fontWeight: 700 }}
                      >
                        {ESTADOS_PLAN_CALIDAD.map((e) => (
                          <option key={e} value={e} style={{ color: "#1A1A1A", fontWeight: 400 }}>{e}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-gray-100 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarFila(p.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
