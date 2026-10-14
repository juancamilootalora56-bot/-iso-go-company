"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseOportunidadesMejora,
  oportunidadMejoraVacia,
  eventoOMVacio,
  siguienteRadicadoOM,
  numeroDeRadicadoOM,
  colorEstadoOM,
  colorResultadoVerificacionOM,
  estaAbiertaOM,
  prioridadOM,
  diasAbiertaOM,
  tiempoPromedioCicloOM,
  tasaEfectividadOM,
  ORIGENES_OM,
  NIVELES_OM,
  RESULTADOS_VERIFICACION_OM,
  ESTADOS_OM,
  type OportunidadMejora,
  type EventoOM,
} from "@/lib/oportunidadesMejora";

const ITEM_KEY = "oportunidades_mejora_lista";
const MAX_EVID_BYTES = 1_500_000; // ~1.5MB
const NARANJA = "#F97316";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

function SubHeader({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-lg mb-3">
      <span>{icono}</span>
      {titulo}
    </div>
  );
}

function fechaHoraLegible(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function OportunidadesMejoraPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const evidFileInputRef = useRef<HTMLInputElement>(null);

  const [casos, setCasos] = useState<OportunidadMejora[]>([]);
  const [caso, setCaso] = useState<OportunidadMejora>(oportunidadMejoraVacia("OM-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    if (!loading) {
      const cargados = parseOportunidadesMejora(docs[ITEM_KEY] ?? "");
      setCasos(cargados);
      setCaso(oportunidadMejoraVacia(siguienteRadicadoOM(cargados.map((c) => numeroDeRadicadoOM(c.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = casos.some((c) => c.id === caso.id);
  const abiertas = casos.filter((c) => estaAbiertaOM(c.estado)).length;
  const cicloPromedio = tiempoPromedioCicloOM(casos);
  const efectividad = tasaEfectividadOM(casos);
  const victoriasRapidas = casos.filter((c) => prioridadOM(c.impacto, c.esfuerzo).orden === 1 && estaAbiertaOM(c.estado)).length;

  const ordenados = [...casos]
    .filter((c) => (filtroEstado ? c.estado === filtroEstado : true))
    .sort((a, b) => prioridadOM(a.impacto, a.esfuerzo).orden - prioridadOM(b.impacto, b.esfuerzo).orden);

  function campo<K extends keyof OportunidadMejora>(key: K, value: OportunidadMejora[K]) {
    setCaso((c) => ({ ...c, [key]: value }));
  }

  function limpiar() {
    setCaso(oportunidadMejoraVacia(siguienteRadicadoOM(casos.map((c) => numeroDeRadicadoOM(c.radicado)))));
    setError(null);
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(c: OportunidadMejora) {
    setCaso({ ...c, bitacora: c.bitacora.map((b) => ({ ...b })) });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEvidencia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_EVID_BYTES) {
      setError("El archivo es muy pesado. Usá uno de menos de 1.5MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setCaso((c) => ({ ...c, evidenciaArchivo: reader.result as string, evidenciaArchivoNombre: file.name }));
    reader.readAsDataURL(file);
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setCaso((c) => ({ ...c, bitacora: [...c.bitacora, eventoOMVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setCaso((c) => ({ ...c, bitacora: c.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!caso.titulo.trim() || !caso.descripcion.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizados = [...casos.filter((c) => c.id !== caso.id), caso];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setCasos(actualizados);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = casos.filter((c) => c.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setCasos(restantes);
    if (caso.id === id) limpiar();
    setSaving(false);
  }

  const prioridadActual = prioridadOM(caso.impacto, caso.esfuerzo);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Gestión de Calidad
        </Link>
        <Link href={`${basePath}/oportunidades_mejora/matriz`} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F97316]/50">
          🧭 Ver matriz de priorización →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Oportunidades de Mejora</h1>
        <p className="text-gray-500 text-sm mt-1">Ciclo PHVA (Planificar–Hacer–Verificar–Actuar) — ISO 9001, cláusulas 10.1 y 10.3.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">💡</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{casos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Oportunidades totales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🟠</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{abiertas}</p>
          <p className="text-xs text-gray-500 mt-0.5">En curso</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⚡</p>
          <p className="text-lg font-bold" style={{ color: victoriasRapidas > 0 ? "#22C55E" : "#1A1A1A" }}>{victoriasRapidas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Victorias rápidas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-lg font-bold text-[#1A1A1A]">{cicloPromedio !== null ? `${cicloPromedio}d` : "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ciclo promedio</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-lg font-bold" style={{ color: efectividad === null ? "#9CA3AF" : efectividad >= 70 ? "#22C55E" : efectividad >= 40 ? "#F5A623" : "#EF4444" }}>
            {efectividad !== null ? `${efectividad}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Tasa de efectividad</p>
        </div>
      </div>

      <Seccion icono="💡" titulo={editando ? `Editando ${caso.radicado}` : `Nueva oportunidad · ${caso.radicado}`}>
        <div className="space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Oportunidad guardada</div>}

          {/* Identificación */}
          <div>
            <SubHeader icono="🔎" titulo="1. Identificación" />
            <div className="space-y-2.5">
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Título</label>
                <input value={caso.titulo} onChange={(e) => campo("titulo", e.target.value)} className={inputClass} placeholder="Ej: Reducir tiempo de respuesta a reclamos" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Origen</label>
                  <select value={caso.origen} onChange={(e) => campo("origen", e.target.value)} className={inputClass}>
                    {ORIGENES_OM.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Proceso / área</label>
                  <input value={caso.procesoArea} onChange={(e) => campo("procesoArea", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Descripción</label>
                <textarea value={caso.descripcion} onChange={(e) => campo("descripcion", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Beneficio esperado</label>
                <textarea value={caso.beneficioEsperado} onChange={(e) => campo("beneficioEsperado", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Cualitativo y/o cuantitativo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Fecha de identificación</label>
                  <input type="date" value={caso.fechaIdentificacion} onChange={(e) => campo("fechaIdentificacion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Identificado por</label>
                  <input value={caso.identificadoPor} onChange={(e) => campo("identificadoPor", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Priorización */}
          <div>
            <SubHeader icono="🧭" titulo="2. Priorización (impacto × esfuerzo)" />
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>Impacto</label>
                <select value={caso.impacto} onChange={(e) => campo("impacto", e.target.value)} className={inputClass}>
                  {NIVELES_OM.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Esfuerzo</label>
                <select value={caso.esfuerzo} onChange={(e) => campo("esfuerzo", e.target.value)} className={inputClass}>
                  {NIVELES_OM.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: prioridadActual.color }}>
              {prioridadActual.etiqueta}
            </span>
          </div>

          {/* Planificar */}
          <div>
            <SubHeader icono="📝" titulo="3. Planificar" />
            <div className="space-y-2.5">
              <div>
                <label className={labelClass}>Acción propuesta</label>
                <textarea value={caso.accionPropuesta} onChange={(e) => campo("accionPropuesta", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div className="grid sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelClass}>Responsable</label>
                  <input value={caso.responsable} onChange={(e) => campo("responsable", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Recursos necesarios</label>
                  <input value={caso.recursosNecesarios} onChange={(e) => campo("recursosNecesarios", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha planeada</label>
                  <input type="date" value={caso.fechaPlaneada} onChange={(e) => campo("fechaPlaneada", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Hacer */}
          <div>
            <SubHeader icono="🚀" titulo="4. Hacer" />
            <div className="space-y-2.5">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Fecha de ejecución</label>
                  <input type="date" value={caso.fechaEjecucion} onChange={(e) => campo("fechaEjecucion", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Evidencia (texto)</label>
                  <input value={caso.evidenciaEjecucion} onChange={(e) => campo("evidenciaEjecucion", e.target.value)} className={inputClass} placeholder="Qué se hizo concretamente" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Archivo de evidencia</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => evidFileInputRef.current?.click()} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F97316]/50">
                    📎 {caso.evidenciaArchivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
                  </button>
                  {caso.evidenciaArchivoNombre && <p className="text-xs text-gray-500 truncate">{caso.evidenciaArchivoNombre}</p>}
                </div>
                <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" onChange={handleEvidencia} className="hidden" />
              </div>
            </div>
          </div>

          {/* Verificar */}
          <div>
            <SubHeader icono="✅" titulo="5. Verificar" />
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>Fecha de verificación</label>
                <input type="date" value={caso.fechaVerificacion} onChange={(e) => campo("fechaVerificacion", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Indicador de verificación</label>
                <input value={caso.indicadorVerificacion} onChange={(e) => campo("indicadorVerificacion", e.target.value)} className={inputClass} placeholder="Qué se midió para confirmar el resultado" />
              </div>
            </div>
            <label className={labelClass}>Resultado</label>
            <select value={caso.resultadoVerificacion} onChange={(e) => campo("resultadoVerificacion", e.target.value)} className={inputClass}>
              {RESULTADOS_VERIFICACION_OM.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Actuar */}
          <div>
            <SubHeader icono="📌" titulo="6. Actuar" />
            <label className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <input type="checkbox" checked={caso.seEstandarizo} onChange={(e) => campo("seEstandarizo", e.target.checked)} className="accent-[#F97316]" />
              Se estandarizó (quedó incorporado a un procedimiento/instructivo)
            </label>
            <textarea value={caso.comoSeEstandarizo} onChange={(e) => campo("comoSeEstandarizo", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Cómo se estandarizó / dónde quedó documentado" />
          </div>

          {/* Estado */}
          <div>
            <SubHeader icono="📍" titulo="Estado y seguimiento" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass}>Estado</label>
                <select value={caso.estado} onChange={(e) => campo("estado", e.target.value)} className={inputClass}>
                  {ESTADOS_OM.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha de cierre</label>
                <input type="date" value={caso.fechaCierre} onChange={(e) => campo("fechaCierre", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Bitácora */}
          <div>
            <SubHeader icono="🧾" titulo="Bitácora de Seguimiento" />
            {caso.bitacora.length > 0 ? (
              <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                {[...caso.bitacora].reverse().map((b: EventoOM) => (
                  <div key={b.id} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NARANJA }} />
                    <p className="text-sm text-[#1A1A1A]">{b.nota}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                      {fechaHoraLegible(b.fecha)} · {b.autor}
                      <button type="button" onClick={() => quitarNota(b.id)} className="text-gray-300 hover:text-red-500">✕</button>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">Todavía no hay entradas en la bitácora.</p>
            )}
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <input value={notaNueva} onChange={(e) => setNotaNueva(e.target.value)} placeholder="Nueva entrada de seguimiento..." className={inputClass} />
              <div className="flex gap-2">
                <input value={autorNota} onChange={(e) => setAutorNota(e.target.value)} placeholder="Autor" className={`${inputClass} sm:w-32`} />
                <button type="button" onClick={agregarNota} className="flex-shrink-0 text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: NARANJA }}>
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={caso.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 text-sm" style={{ backgroundColor: NARANJA }}>
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar oportunidad"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva oportunidad en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      {/* Registro */}
      <Seccion icono="🗂️" titulo="Registro de Oportunidades">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroEstado("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todos los estados
          </button>
          {ESTADOS_OM.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroEstado === e ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroEstado === e ? { backgroundColor: colorEstadoOM(e) } : {}}
            >
              {e}
            </button>
          ))}
        </div>

        {ordenados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay oportunidades que coincidan con el filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[920px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Radicado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Título</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Prioridad</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Verificación</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Días abierta</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((c) => {
                  const prioridad = prioridadOM(c.impacto, c.esfuerzo);
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                      <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">{c.radicado}</td>
                      <td className="p-2.5 text-gray-600 max-w-[200px] truncate">{c.titulo}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: prioridad.color }}>
                          {prioridad.etiqueta}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoOM(c.estado) }}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorResultadoVerificacionOM(c.resultadoVerificacion) }}>
                          {c.resultadoVerificacion}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{estaAbiertaOM(c.estado) ? `${diasAbiertaOM(c)}d` : "—"}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <button onClick={() => editar(c)} className="font-semibold mr-2" style={{ color: NARANJA }}>Editar</button>
                        <button onClick={() => eliminar(c.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
}
