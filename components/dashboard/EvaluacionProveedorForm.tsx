"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Proveedor } from "@/lib/proveedores";
import {
  parseEvaluacionesProveedor,
  evaluacionProveedorVacia,
  criterioProveedorVacio,
  criteriosEfectivos,
  resultadoEvaluacionProveedor,
  nivelResultado,
  colorNivel,
  esProveedorPotencial,
  puntosDeNivel,
  TIPOS_ACTIVIDAD_PROVEEDOR,
  NIVELES_CALIFICACION,
  type EvaluacionProveedor,
  type NivelCalificacion,
} from "@/lib/evaluacionProveedor";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function SubHeader({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
      <span>{icono}</span>
      {titulo}
    </div>
  );
}

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function SelectorNivel({
  valor,
  onChange,
  disabled,
}: {
  valor: NivelCalificacion;
  onChange: (n: NivelCalificacion) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {NIVELES_CALIFICACION.map((n) => {
        const activo = valor === n.nivel;
        return (
          <button
            key={n.nivel}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n.nivel)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              activo ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-300 bg-white"
            }`}
            style={activo ? { backgroundColor: n.color, color: n.textoOscuro ? "#1A1A1A" : "#fff" } : {}}
          >
            {n.nivel}
          </button>
        );
      })}
    </div>
  );
}

function CriterioRow({
  nombre,
  nivel,
  onChange,
  onQuitar,
  disabled,
  puntos,
}: {
  nombre: string;
  nivel: NivelCalificacion;
  onChange: (n: NivelCalificacion) => void;
  onQuitar?: () => void;
  disabled?: boolean;
  puntos: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3 flex-wrap">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
          {nombre}
          {onQuitar && (
            <button type="button" onClick={onQuitar} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
          )}
        </p>
        {disabled && <p className="text-[11px] text-gray-400">No aplica — calificado Excelente automáticamente</p>}
      </div>
      <div className="flex items-center gap-3">
        <SelectorNivel valor={nivel} onChange={onChange} disabled={disabled} />
        <span className="text-xs font-bold text-gray-400 w-10 text-right flex-shrink-0">{puntos}/10</span>
      </div>
    </div>
  );
}

export default function EvaluacionProveedorForm({ userId, proveedor }: { userId: string | null; proveedor: Proveedor }) {
  const itemKey = `evaluacion_proveedor_${proveedor.id}`;
  const { docs, loading, save } = useGestionDocumentos("compras", userId);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionProveedor[]>([]);
  const [formEval, setFormEval] = useState<EvaluacionProveedor>(evaluacionProveedorVacia());
  const [viendoEval, setViendoEval] = useState<EvaluacionProveedor | null>(null);
  const [nombreCriterioNuevo, setNombreCriterioNuevo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setEvaluaciones(parseEvaluacionesProveedor(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizadas: EvaluacionProveedor[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizadas));
    setEvaluaciones(actualizadas);
    setSaving(false);
  }

  function limpiarFormulario() {
    setError(null);
    setFormEval(evaluacionProveedorVacia());
  }

  function abrirEditar(e: EvaluacionProveedor) {
    setError(null);
    setViendoEval(null);
    setFormEval({ ...e, criterios: e.criterios.map((c) => ({ ...c })) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirInforme(e: EvaluacionProveedor) {
    setViendoEval(e);
  }

  function setNivelCriterio(id: string, nivel: NivelCalificacion) {
    setFormEval((f) => ({ ...f, criterios: f.criterios.map((c) => (c.id === id ? { ...c, nivel } : c)) }));
  }

  function agregarCriterioLibre() {
    if (!nombreCriterioNuevo.trim()) return;
    setFormEval((f) => ({ ...f, criterios: [...f.criterios, criterioProveedorVacio(nombreCriterioNuevo.trim(), true)] }));
    setNombreCriterioNuevo("");
  }

  function quitarCriterio(id: string) {
    setFormEval((f) => ({ ...f, criterios: f.criterios.filter((c) => c.id !== id) }));
  }

  async function guardarEvaluacion() {
    if (!formEval.fecha) {
      setError("La fecha de evaluación es obligatoria.");
      return;
    }
    setError(null);
    const existe = evaluaciones.some((e) => e.id === formEval.id);
    const actualizadas = existe
      ? evaluaciones.map((e) => (e.id === formEval.id ? formEval : e))
      : [...evaluaciones, formEval];
    await persistir(actualizadas);
    setFormEval(evaluacionProveedorVacia());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminarEvaluacion(id: string) {
    await persistir(evaluaciones.filter((e) => e.id !== id));
    if (formEval.id === id) limpiarFormulario();
    if (viendoEval?.id === id) setViendoEval(null);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const evaluacionesOrdenadas = [...evaluaciones].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const criteriosBase = formEval.criterios.filter((c) => !c.personalizado);
  const criteriosLibres = formEval.criterios.filter((c) => c.personalizado);
  const resultadoForm = resultadoEvaluacionProveedor(formEval);
  const editando = evaluaciones.some((e) => e.id === formEval.id);

  return (
    <div className="space-y-4">
      {/* Formulario permanente */}
      <Seccion icono="📊" titulo="Selección, Evaluación y Reevaluación de Proveedores">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">
              {editando ? `Editando evaluación de ${fechaLegible(formEval.fecha)}.` : `Nueva evaluación para ${proveedor.razonSocial}.`}
            </p>
            {editando && (
              <button onClick={limpiarFormulario} className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] whitespace-nowrap">
                + Nueva evaluación en blanco
              </button>
            )}
          </div>

          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Evaluación guardada</div>}

          <div>
            <SubHeader icono="🗓️" titulo="Datos de la evaluación" />
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Producto o servicio</label>
                <input value={formEval.productoServicio} onChange={(e) => setFormEval((f) => ({ ...f, productoServicio: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Fecha</label>
                <input type="date" value={formEval.fecha} onChange={(e) => setFormEval((f) => ({ ...f, fecha: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Actividad</label>
                <select value={formEval.tipoActividad} onChange={(e) => setFormEval((f) => ({ ...f, tipoActividad: e.target.value }))} className={inputClass}>
                  {TIPOS_ACTIVIDAD_PROVEEDOR.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Evaluador</label>
                <input value={formEval.evaluador} onChange={(e) => setFormEval((f) => ({ ...f, evaluador: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-[#FAFAFA] rounded-lg p-2.5 border border-gray-100">
              <input
                type="checkbox"
                checked={formEval.incluyeServicioTecnico}
                onChange={(e) => setFormEval((f) => ({ ...f, incluyeServicioTecnico: e.target.checked }))}
                className="accent-[#F5A623]"
              />
              Incluye servicio técnico
            </label>
          </div>

          <div>
            <SubHeader icono="⭐" titulo="Criterios de evaluación" />
            <div className="space-y-2">
              {criteriosBase.map((c) => {
                const esServicioTecnico = c.nombre === "Servicio técnico";
                const deshabilitado = esServicioTecnico && !formEval.incluyeServicioTecnico;
                const nivelEfectivo = deshabilitado ? "Excelente" : c.nivel;
                return (
                  <CriterioRow
                    key={c.id}
                    nombre={c.nombre}
                    nivel={nivelEfectivo}
                    onChange={(n) => setNivelCriterio(c.id, n)}
                    disabled={deshabilitado}
                    puntos={puntosDeNivel(nivelEfectivo)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <SubHeader icono="➕" titulo="Evaluar otras características (opcional)" />
            <p className="text-[11px] text-gray-500 mb-3">
              Agregá criterios propios si tu empresa necesita evaluar algo adicional (ej: &quot;Capacidad de producción&quot;, &quot;Sostenibilidad&quot;).
            </p>
            {criteriosLibres.length > 0 && (
              <div className="space-y-2 mb-3">
                {criteriosLibres.map((c) => (
                  <CriterioRow
                    key={c.id}
                    nombre={c.nombre}
                    nivel={c.nivel}
                    onChange={(n) => setNivelCriterio(c.id, n)}
                    onQuitar={() => quitarCriterio(c.id)}
                    puntos={puntosDeNivel(c.nivel)}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={nombreCriterioNuevo}
                onChange={(e) => setNombreCriterioNuevo(e.target.value)}
                placeholder="Nombre del criterio nuevo"
                className={inputClass}
              />
              <button onClick={agregarCriterioLibre} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410]">
                + Agregar
              </button>
            </div>
          </div>

          {/* Resultado en vivo */}
          <div className="bg-[#1A1A1A] rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Calificación total</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {resultadoForm.calificados}/{resultadoForm.total} criterios calificados · {resultadoForm.puntosObtenidos}/{resultadoForm.puntosMaximos} pts
              </p>
            </div>
            <span
              className="text-lg font-extrabold px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: colorNivel(nivelResultado(resultadoForm.porcentaje)),
                color: nivelResultado(resultadoForm.porcentaje) === "Regular" ? "#1A1A1A" : "#fff",
              }}
            >
              {resultadoForm.porcentaje.toFixed(2)}%
            </span>
          </div>

          <div>
            <SubHeader icono="📝" titulo="Observaciones" />
            <textarea value={formEval.observaciones} onChange={(e) => setFormEval((f) => ({ ...f, observaciones: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-3">
              <button onClick={guardarEvaluacion} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar evaluación"}
              </button>
              <button onClick={limpiarFormulario} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                Limpiar
              </button>
            </div>
            {editando && (
              <button onClick={() => eliminarEvaluacion(formEval.id)} className="text-xs text-red-400 hover:text-red-600">
                Eliminar esta evaluación
              </button>
            )}
          </div>
        </div>
      </Seccion>

      {/* Historial */}
      <Seccion icono="🗂️" titulo="Historial de Evaluaciones">
        {evaluacionesOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no se registró ninguna evaluación.</p>
        ) : (
          <div className="space-y-2.5">
            {evaluacionesOrdenadas.map((e) => {
              const r = resultadoEvaluacionProveedor(e);
              const nivel = nivelResultado(r.porcentaje);
              return (
                <button
                  key={e.id}
                  onClick={() => abrirInforme(e)}
                  className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {fechaLegible(e.fecha)} · {e.tipoActividad}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {e.productoServicio || "—"}
                        {e.evaluador && <> · {e.evaluador}</>}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: colorNivel(nivel) }}
                    >
                      {nivel} · {r.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Seccion>

      {/* Informe de lectura */}
      {viendoEval && (() => {
        const r = resultadoEvaluacionProveedor(viendoEval);
        const nivel = nivelResultado(r.porcentaje);
        const potencial = esProveedorPotencial(r.porcentaje);
        return (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-[#1A1A1A] p-6 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="relative flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="inline-block bg-[#F5A623] text-[#1A1A1A] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
                    Informe de Evaluación de Proveedor
                  </span>
                  <h2 className="text-white text-xl font-extrabold">{fechaLegible(viendoEval.fecha)}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {viendoEval.tipoActividad}
                    {viendoEval.productoServicio && <> · {viendoEval.productoServicio}</>}
                    {viendoEval.evaluador && <> · Evaluado por {viendoEval.evaluador}</>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-2xl font-extrabold px-4 py-2 rounded-xl"
                    style={{ backgroundColor: colorNivel(nivel), color: nivel === "Regular" ? "#1A1A1A" : "#fff" }}
                  >
                    {r.porcentaje.toFixed(2)}%
                  </div>
                  <p className="text-gray-400 text-[11px] mt-1 uppercase tracking-wide font-bold">{nivel}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className={`p-3 rounded-lg text-xs font-semibold ${potencial ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {potencial
                  ? "✓ Resultado igual o superior a 70% — se puede considerar como proveedor potencial."
                  : "✕ Resultado inferior a 70% — no se puede considerar como proveedor potencial."}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Criterios evaluados</h3>
                <div className="space-y-2">
                  {criteriosEfectivos(viendoEval).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {c.nombre}
                        {c.personalizado && <span className="text-[10px] text-[#F5A623] font-bold ml-1.5">· personalizado</span>}
                      </p>
                      <span
                        className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: colorNivel(c.nivel || "—"), color: c.nivel === "Regular" ? "#1A1A1A" : "#fff" }}
                      >
                        {c.nivel || "Sin calificar"} · {puntosDeNivel(c.nivel)}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {viendoEval.observaciones && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Observaciones</p>
                  <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendoEval.observaciones}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => abrirEditar(viendoEval)} className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]">
                ✎ Editar evaluación
              </button>
              <button onClick={() => setViendoEval(null)} className="text-sm text-gray-400 hover:text-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
