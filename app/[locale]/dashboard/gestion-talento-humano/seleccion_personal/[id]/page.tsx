"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { empleadoVacio, parsePersonal } from "@/lib/personal";
import {
  parseVacantes,
  parseCandidatos,
  candidatoVacio,
  moverEtapa,
  diasEnEtapa,
  resumenPorEtapa,
  tasaConversion,
  tiempoPromedioContratacion,
  colorEstadoVacante,
  colorEtapa,
  ICONO_ETAPA,
  ETAPAS_PIPELINE,
  FUENTES_CANDIDATO,
  TIPOS_CONTRATO,
  JORNADAS,
  MODALIDADES_TRABAJO,
  MOTIVOS_VACANTE,
  ESTADOS_VACANTE,
  type Vacante,
  type Candidato,
  type EtapaCandidato,
} from "@/lib/seleccionPersonal";

const ITEM_KEY_VACANTES = "seleccion_vacantes_lista";
const ITEM_KEY_CANDIDATOS = "seleccion_candidatos_lista";
const ITEM_KEY_PERSONAL = "personal_lista";
const NARANJA = "#F5A623";
const MAX_CV_BYTES = 2_500_000;
const MAX_FOTO_BYTES = 600_000;

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

export default function PipelineVacantePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const vacanteId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);

  const vacantesGuardadas = useMemo(() => parseVacantes(docs[ITEM_KEY_VACANTES] ?? ""), [docs]);
  const candidatosGuardados = useMemo(() => parseCandidatos(docs[ITEM_KEY_CANDIDATOS] ?? "").filter((c) => c.vacanteId === vacanteId), [docs, vacanteId]);
  const personalExistente = useMemo(() => parsePersonal(docs[ITEM_KEY_PERSONAL] ?? ""), [docs]);
  const todosCandidatos = useMemo(() => parseCandidatos(docs[ITEM_KEY_CANDIDATOS] ?? ""), [docs]);

  const [vacanteDraft, setVacanteDraft] = useState<Vacante | null>(null);
  const [candidatosDraft, setCandidatosDraft] = useState<Candidato[] | null>(null);
  const [mostrarRequerimiento, setMostrarRequerimiento] = useState(false);
  const [mostrarDescartados, setMostrarDescartados] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const vacante = vacanteDraft ?? vacantesGuardadas.find((v) => v.id === vacanteId) ?? null;
  const candidatos = candidatosDraft ?? candidatosGuardados;

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!vacante) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/seleccion_personal`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Selección y Contratación
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este requerimiento.</p>
      </div>
    );
  }

  function mostrarMensaje(texto: string) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  }

  async function persistir(nuevaVacante: Vacante, nuevosCandidatos: Candidato[]) {
    setGuardando(true);
    const vacantesActualizadas = vacantesGuardadas.some((v) => v.id === nuevaVacante.id)
      ? vacantesGuardadas.map((v) => (v.id === nuevaVacante.id ? nuevaVacante : v))
      : [...vacantesGuardadas, nuevaVacante];
    const otrosCandidatos = todosCandidatos.filter((c) => c.vacanteId !== vacanteId);
    await save(ITEM_KEY_VACANTES, JSON.stringify(vacantesActualizadas));
    await save(ITEM_KEY_CANDIDATOS, JSON.stringify([...otrosCandidatos, ...nuevosCandidatos]));
    setVacanteDraft(null);
    setCandidatosDraft(null);
    setGuardando(false);
    mostrarMensaje("Guardado ✓");
  }

  function actualizarVacante(cambios: Partial<Vacante>) {
    setVacanteDraft({ ...vacante!, ...cambios });
  }

  function actualizarCandidato(id: string, cambios: Partial<Candidato>) {
    setCandidatosDraft(candidatos.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function agregarCandidato() {
    const nuevo = candidatoVacio(vacanteId);
    setCandidatosDraft([...candidatos, nuevo]);
    setExpandidoId(nuevo.id);
  }

  function eliminarCandidato(id: string) {
    if (!confirm("¿Eliminar este candidato del pipeline?")) return;
    setCandidatosDraft(candidatos.filter((c) => c.id !== id));
  }

  async function mover(id: string, nuevaEtapa: EtapaCandidato) {
    const actualizados = candidatos.map((c) => (c.id === id ? moverEtapa(c, nuevaEtapa) : c));
    setCandidatosDraft(actualizados);
    await persistir(vacante!, actualizados);
  }

  function descartar(id: string) {
    const motivo = prompt("¿Motivo del descarte?") ?? "";
    const actualizados = candidatos.map((c) => (c.id === id ? { ...moverEtapa(c, "Descartado", `Descartado: ${motivo}`), motivoDescarte: motivo } : c));
    setCandidatosDraft(actualizados);
  }

  async function contratarYDarDeAlta(candidato: Candidato) {
    if (!confirm(`¿Dar de alta a "${candidato.nombre}" en Gestión del Personal? Se creará su ficha con los datos del cargo de esta vacante.`)) return;
    const vActual = vacante!;
    const partes = candidato.nombre.trim().split(" ");
    const nuevoEmpleado = {
      ...empleadoVacio(),
      nombre: partes[0] ?? candidato.nombre,
      apellido: partes.slice(1).join(" "),
      email: candidato.email,
      telefono: candidato.telefono,
      foto: candidato.foto,
      cargo: vActual.cargo,
      area: vActual.area,
      tipoContrato: vActual.tipoContrato,
      jornada: vActual.jornada,
      fechaIngreso: new Date().toISOString().slice(0, 10),
    };

    const candidatoContratado = moverEtapa({ ...candidato, etapa: candidato.etapa === "Contratado" ? "Selección" : candidato.etapa }, "Contratado", `Contratado y dado de alta como ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}`);
    const candidatosActualizados = candidatos.map((c) => (c.id === candidato.id ? candidatoContratado : c));

    setGuardando(true);
    const vacantesActualizadas = vacantesGuardadas.some((v) => v.id === vActual.id) ? vacantesGuardadas.map((v) => (v.id === vActual.id ? vActual : v)) : [...vacantesGuardadas, vActual];
    const otrosCandidatos = todosCandidatos.filter((c) => c.vacanteId !== vacanteId);
    await save(ITEM_KEY_VACANTES, JSON.stringify(vacantesActualizadas));
    await save(ITEM_KEY_CANDIDATOS, JSON.stringify([...otrosCandidatos, ...candidatosActualizados]));
    await save(ITEM_KEY_PERSONAL, JSON.stringify([...personalExistente, nuevoEmpleado]));
    setGuardando(false);
    router.push(`${basePath}/gestion_personal/${nuevoEmpleado.id}`);
  }

  async function guardarTodo() {
    await persistir(vacante!, candidatos);
  }

  async function eliminarVacante() {
    const vActual = vacante!;
    if (!confirm(`¿Eliminar el requerimiento "${vActual.cargo || vActual.codigo}" y todos sus candidatos? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY_VACANTES, JSON.stringify(vacantesGuardadas.filter((v) => v.id !== vActual.id)));
    await save(ITEM_KEY_CANDIDATOS, JSON.stringify(todosCandidatos.filter((c) => c.vacanteId !== vActual.id)));
    setGuardando(false);
    router.push(`${basePath}/seleccion_personal`);
  }

  const activos = candidatos.filter((c) => c.etapa !== "Descartado");
  const descartados = candidatos.filter((c) => c.etapa === "Descartado");
  const resumen = resumenPorEtapa(activos);
  const conversion = tasaConversion(candidatos);
  const tiempoProm = tiempoPromedioContratacion(candidatos);

  function onDragStart(id: string) {
    setDraggedId(id);
  }
  function onDropColumna(etapa: EtapaCandidato) {
    if (draggedId) {
      mover(draggedId, etapa);
      setDraggedId(null);
    }
  }

  return (
    <div className="max-w-full space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/seleccion_personal`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Selección y Contratación
        </Link>
        <button onClick={eliminarVacante} className="text-xs text-red-400 hover:text-red-600">
          Eliminar requerimiento
        </button>
      </div>

      {/* Encabezado de la vacante */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
              Requerimiento · {vacante.codigo}
            </p>
            <input
              value={vacante.cargo}
              onChange={(e) => actualizarVacante({ cargo: e.target.value })}
              placeholder="Nombre del cargo"
              className="text-2xl font-bold text-[#1A1A1A] mt-1 bg-transparent focus:outline-none placeholder-gray-300 w-full"
            />
            <p className="text-xs text-gray-400 mt-1">{vacante.area || "Sin área asignada"}</p>
          </div>
          <select
            value={vacante.estado}
            onChange={(e) => actualizarVacante({ estado: e.target.value })}
            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white border-none focus:outline-none flex-shrink-0"
            style={{ backgroundColor: colorEstadoVacante(vacante.estado) }}
          >
            {ESTADOS_VACANTE.map((e) => (
              <option key={e} value={e} className="text-black">
                {e}
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => setMostrarRequerimiento(!mostrarRequerimiento)} className="text-xs font-semibold mt-3 hover:opacity-80" style={{ color: NARANJA }}>
          {mostrarRequerimiento ? "▲ Ocultar detalles del requerimiento" : "▼ Ver / editar detalles del requerimiento"}
        </button>

        {mostrarRequerimiento && (
          <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className={labelClass}>Tipo de contrato</label>
              <select value={vacante.tipoContrato} onChange={(e) => actualizarVacante({ tipoContrato: e.target.value })} className={inputClass}>
                {TIPOS_CONTRATO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jornada</label>
              <select value={vacante.jornada} onChange={(e) => actualizarVacante({ jornada: e.target.value })} className={inputClass}>
                {JORNADAS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Modalidad</label>
              <select value={vacante.modalidad} onChange={(e) => actualizarVacante({ modalidad: e.target.value })} className={inputClass}>
                {MODALIDADES_TRABAJO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Área</label>
              <input value={vacante.area} onChange={(e) => actualizarVacante({ area: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}># Vacantes</label>
              <input
                type="number"
                min={1}
                value={vacante.numeroVacantes}
                onChange={(e) => actualizarVacante({ numeroVacantes: Math.max(1, Number(e.target.value) || 1) })}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Salario</label>
              <input value={vacante.salario} onChange={(e) => actualizarVacante({ salario: e.target.value })} placeholder="Ej: $2.500.000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Motivo</label>
              <select value={vacante.motivo} onChange={(e) => actualizarVacante({ motivo: e.target.value })} className={inputClass}>
                {MOTIVOS_VACANTE.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Solicitante / responsable</label>
              <input value={vacante.responsableSolicitante} onChange={(e) => actualizarVacante({ responsableSolicitante: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha límite</label>
              <input type="date" value={vacante.fechaLimite} onChange={(e) => actualizarVacante({ fechaLimite: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>Perfil requerido</label>
              <textarea
                value={vacante.perfilRequerido}
                onChange={(e) => actualizarVacante({ perfilRequerido: e.target.value })}
                rows={2}
                placeholder="Educación, experiencia, competencias clave..."
                className={inputClass + " resize-y"}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
          <span className="text-lg font-bold text-[#1A1A1A]">{candidatos.length}</span>
          <span className="text-xs text-gray-500 ml-1.5">candidatos</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
          <span className="text-lg font-bold" style={{ color: conversion >= 20 ? "#22C55E" : "#F5A623" }}>
            {conversion}%
          </span>
          <span className="text-xs text-gray-500 ml-1.5">tasa de conversión</span>
        </div>
        {tiempoProm !== null && (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{tiempoProm}</span>
            <span className="text-xs text-gray-500 ml-1.5">días promedio de contratación</span>
          </div>
        )}
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: ETAPAS_PIPELINE.length * 270 }}>
          {ETAPAS_PIPELINE.map((etapa) => {
            const columnaCandidatos = activos.filter((c) => c.etapa === etapa);
            const color = colorEtapa(etapa);
            return (
              <div
                key={etapa}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropColumna(etapa)}
                className="flex-1 min-w-[260px] bg-[#FAFAFA] rounded-2xl border border-gray-100 flex flex-col"
              >
                <div className="px-3 py-3 flex items-center gap-2 rounded-t-2xl" style={{ backgroundColor: `${color}18`, borderBottom: `2px solid ${color}` }}>
                  <span>{ICONO_ETAPA[etapa]}</span>
                  <span className="text-xs font-bold uppercase tracking-wide flex-1" style={{ color }}>
                    {etapa}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                    {columnaCandidatos.length}
                  </span>
                </div>

                <div className="p-2.5 space-y-2.5 flex-1 min-h-[120px]">
                  {columnaCandidatos.map((c) => (
                    <TarjetaCandidato
                      key={c.id}
                      candidato={c}
                      color={color}
                      expandido={expandidoId === c.id}
                      onToggleExpandir={() => setExpandidoId(expandidoId === c.id ? null : c.id)}
                      onDragStart={() => onDragStart(c.id)}
                      onActualizar={(cambios) => actualizarCandidato(c.id, cambios)}
                      onMoverAnterior={ETAPAS_PIPELINE.indexOf(etapa) > 0 ? () => mover(c.id, ETAPAS_PIPELINE[ETAPAS_PIPELINE.indexOf(etapa) - 1]) : undefined}
                      onMoverSiguiente={ETAPAS_PIPELINE.indexOf(etapa) < ETAPAS_PIPELINE.length - 1 ? () => mover(c.id, ETAPAS_PIPELINE[ETAPAS_PIPELINE.indexOf(etapa) + 1]) : undefined}
                      onDescartar={() => descartar(c.id)}
                      onEliminar={() => eliminarCandidato(c.id)}
                      onContratar={etapa === "Contratado" ? () => contratarYDarDeAlta(c) : undefined}
                    />
                  ))}
                  {columnaCandidatos.length === 0 && <p className="text-[11px] text-gray-300 text-center py-4">Sin candidatos</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={agregarCandidato} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
        + Agregar candidato
      </button>

      {/* Descartados */}
      {descartados.length > 0 && (
        <div>
          <button onClick={() => setMostrarDescartados(!mostrarDescartados)} className="text-xs font-semibold text-gray-400 hover:text-[#1A1A1A]">
            {mostrarDescartados ? "▲" : "▼"} Descartados ({descartados.length})
          </button>
          {mostrarDescartados && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
              {descartados.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 opacity-70">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{c.nombre || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.motivoDescarte || "Sin motivo registrado"}</p>
                  <button onClick={() => mover(c.id, "Búsqueda")} className="text-[11px] font-semibold mt-2 hover:opacity-80" style={{ color: NARANJA }}>
                    ↺ Readmitir a Búsqueda
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
        <button onClick={guardarTodo} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function Estrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n === valor ? 0 : n)} className="text-xs leading-none">
          {n <= valor ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

function TarjetaCandidato({
  candidato,
  color,
  expandido,
  onToggleExpandir,
  onDragStart,
  onActualizar,
  onMoverAnterior,
  onMoverSiguiente,
  onDescartar,
  onEliminar,
  onContratar,
}: {
  candidato: Candidato;
  color: string;
  expandido: boolean;
  onToggleExpandir: () => void;
  onDragStart: () => void;
  onActualizar: (cambios: Partial<Candidato>) => void;
  onMoverAnterior?: () => void;
  onMoverSiguiente?: () => void;
  onDescartar: () => void;
  onEliminar: () => void;
  onContratar?: () => void;
}) {
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const dias = diasEnEtapa(candidato);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      alert("La foto es muy pesada (máx. 600KB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onActualizar({ foto: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CV_BYTES) {
      alert("El archivo es muy pesado (máx. 2.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onActualizar({ cv: reader.result as string, cvNombre: file.name });
    reader.readAsDataURL(file);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="p-3 cursor-pointer" onClick={onToggleExpandir}>
        <div className="flex items-center gap-2.5">
          <button onClick={(e) => { e.stopPropagation(); fotoInputRef.current?.click(); }} className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-400">
            {candidato.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={candidato.foto} alt={candidato.nombre} className="w-full h-full object-cover" />
            ) : (
              candidato.nombre.slice(0, 1).toUpperCase() || "?"
            )}
          </button>
          <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          <div className="min-w-0 flex-1">
            <input
              value={candidato.nombre}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onActualizar({ nombre: e.target.value })}
              placeholder="Nombre del candidato"
              className="text-xs font-semibold text-[#1A1A1A] w-full bg-transparent focus:outline-none placeholder-gray-300"
            />
            <p className="text-[10px] text-gray-400">{candidato.fuente || "Sin fuente"} · {dias}d en esta etapa</p>
          </div>
        </div>
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <Estrellas valor={candidato.calificacion} onChange={(v) => onActualizar({ calificacion: v })} />
        </div>
      </div>

      {expandido && (
        <div className="p-3 pt-0 space-y-2.5 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2">
            <input value={candidato.email} onChange={(e) => onActualizar({ email: e.target.value })} placeholder="Email" className="text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#F5A623]" />
            <input value={candidato.telefono} onChange={(e) => onActualizar({ telefono: e.target.value })} placeholder="Teléfono" className="text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#F5A623]" />
          </div>
          <select value={candidato.fuente} onChange={(e) => onActualizar({ fuente: e.target.value })} className="w-full text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#F5A623]">
            <option value="">Fuente del candidato</option>
            {FUENTES_CANDIDATO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input ref={cvInputRef} type="file" onChange={handleCv} className="hidden" />
            <button onClick={() => cvInputRef.current?.click()} className="text-[10px] font-semibold px-2 py-1 rounded border border-gray-200 hover:border-[#F5A623]">
              📎 {candidato.cvNombre ? "Cambiar CV" : "Adjuntar CV"}
            </button>
            {candidato.cvNombre && (
              <a href={candidato.cv ?? "#"} download={candidato.cvNombre} className="text-[10px] hover:opacity-80 truncate" style={{ color: NARANJA }}>
                {candidato.cvNombre}
              </a>
            )}
          </div>

          <textarea
            value={candidato.notasEntrevista}
            onChange={(e) => onActualizar({ notasEntrevista: e.target.value })}
            placeholder="Notas de entrevista..."
            rows={2}
            className="w-full text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 resize-y focus:outline-none focus:border-[#F5A623]"
          />

          <div className="grid grid-cols-[1fr_80px] gap-2">
            <textarea
              value={candidato.notasTest}
              onChange={(e) => onActualizar({ notasTest: e.target.value })}
              placeholder="Notas del test de habilidades..."
              rows={2}
              className="text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 resize-y focus:outline-none focus:border-[#F5A623]"
            />
            <div>
              <label className="text-[9px] text-gray-400 block mb-0.5">Puntaje</label>
              <input
                type="number"
                min={0}
                max={100}
                value={candidato.puntajeTest}
                onChange={(e) => onActualizar({ puntajeTest: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full text-[11px] bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 text-center focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>

          {candidato.bitacora.length > 0 && (
            <div className="bg-[#FAFAFA] rounded-lg p-2 max-h-24 overflow-y-auto space-y-1">
              {[...candidato.bitacora].reverse().map((ev) => (
                <p key={ev.id} className="text-[10px] text-gray-500">
                  <span className="text-gray-300">{ev.fecha}</span> — {ev.nota}
                </p>
              ))}
            </div>
          )}

          {onContratar && (
            <button onClick={onContratar} className="w-full bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors text-xs">
              ✓ Dar de alta en Gestión de Personal
            </button>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {onMoverAnterior && (
                <button onClick={onMoverAnterior} className="text-[10px] text-gray-400 hover:text-[#1A1A1A]">
                  ← Atrás
                </button>
              )}
              {onMoverSiguiente && (
                <button onClick={onMoverSiguiente} className="text-[10px] font-semibold hover:opacity-80" style={{ color }}>
                  Avanzar →
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onDescartar} className="text-[10px] text-red-400 hover:text-red-600">
                Descartar
              </button>
              <button onClick={onEliminar} className="text-[10px] text-gray-300 hover:text-red-500">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
