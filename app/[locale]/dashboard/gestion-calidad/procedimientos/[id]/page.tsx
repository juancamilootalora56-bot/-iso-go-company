"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseProcedimientos,
  parseInstructivos,
  parseFormatos,
  siguienteCodigo,
  numeroDeCodigo,
  actividadVacia,
  reordenarActividades,
  definicionVacia,
  registroVacio,
  instructivoVacio,
  pasoInstructivoVacio,
  reordenarPasos,
  formatoVacio,
  ESTADOS_DOCUMENTO,
  colorEstadoDocumento,
  type Procedimiento,
  type Instructivo,
  type Formato,
} from "@/lib/procedimientos";
import { parseLista } from "@/lib/mapaProcesos";

const ITEM_KEY_PROC = "procedimientos_lista";
const ITEM_KEY_INS = "instructivos_lista";
const ITEM_KEY_FOR = "formatos_lista";
const NARANJA = "#F97316";
const MAX_ARCHIVO_BYTES = 4_000_000;

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const textareaClass = inputClass + " resize-y";

type Tab = "documento" | "instructivos" | "formatos";

export default function ProcedimientoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const todosProcedimientos = useMemo(() => parseProcedimientos(docs[ITEM_KEY_PROC] ?? ""), [docs]);
  const todosInstructivos = useMemo(() => parseInstructivos(docs[ITEM_KEY_INS] ?? ""), [docs]);
  const todosFormatos = useMemo(() => parseFormatos(docs[ITEM_KEY_FOR] ?? ""), [docs]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);

  const [tab, setTab] = useState<Tab>("documento");
  const [plan, setPlan] = useState<Procedimiento | null>(null);
  const [instructivos, setInstructivos] = useState<Instructivo[] | null>(null);
  const [formatos, setFormatos] = useState<Formato[] | null>(null);
  const [guardado, setGuardado] = useState(false);

  const original = todosProcedimientos.find((p) => p.id === id);
  const actual = plan ?? original ?? null;
  const instructivosActuales = instructivos ?? todosInstructivos.filter((i) => i.procedimientoId === id);
  const formatosActuales = formatos ?? todosFormatos.filter((f) => f.procedimientoId === id);

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!actual) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/procedimientos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Procedimientos
        </Link>
        <p className="text-gray-500 text-sm">Este procedimiento no existe o fue eliminado.</p>
      </div>
    );
  }

  function actualizar(cambios: Partial<Procedimiento>) {
    setPlan({ ...actual!, ...cambios });
    setGuardado(false);
  }

  async function guardarProcedimiento() {
    const lista = todosProcedimientos.some((p) => p.id === actual!.id)
      ? todosProcedimientos.map((p) => (p.id === actual!.id ? actual! : p))
      : [...todosProcedimientos, actual!];
    await save(ITEM_KEY_PROC, JSON.stringify(lista));
    setPlan(null);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  async function eliminarProcedimiento() {
    if (!confirm(`¿Eliminar el procedimiento "${actual!.nombre || actual!.codigo}"? También se eliminarán sus instructivos y formatos asociados.`)) return;
    await save(ITEM_KEY_PROC, JSON.stringify(todosProcedimientos.filter((p) => p.id !== actual!.id)));
    await save(ITEM_KEY_INS, JSON.stringify(todosInstructivos.filter((i) => i.procedimientoId !== actual!.id)));
    await save(ITEM_KEY_FOR, JSON.stringify(todosFormatos.filter((f) => f.procedimientoId !== actual!.id)));
    router.push(`${basePath}/procedimientos`);
  }

  // --- Instructivos ---

  function actualizarInstructivo(i: Instructivo) {
    setInstructivos(instructivosActuales.map((x) => (x.id === i.id ? i : x)));
  }

  function nuevoInstructivo() {
    const codigo = siguienteCodigo("INS", todosInstructivos.map((i) => numeroDeCodigo(i.codigo)));
    setInstructivos([...instructivosActuales, instructivoVacio(codigo, actual!.id)]);
  }

  function eliminarInstructivo(iid: string) {
    setInstructivos(instructivosActuales.filter((x) => x.id !== iid));
  }

  async function guardarInstructivos() {
    const otros = todosInstructivos.filter((i) => i.procedimientoId !== actual!.id);
    await save(ITEM_KEY_INS, JSON.stringify([...otros, ...instructivosActuales]));
    setInstructivos(null);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  // --- Formatos ---

  function actualizarFormato(f: Formato) {
    setFormatos(formatosActuales.map((x) => (x.id === f.id ? f : x)));
  }

  function nuevoFormato() {
    const codigo = siguienteCodigo("FOR", todosFormatos.map((f) => numeroDeCodigo(f.codigo)));
    setFormatos([...formatosActuales, formatoVacio(codigo, actual!.id)]);
  }

  function eliminarFormato(fid: string) {
    setFormatos(formatosActuales.filter((x) => x.id !== fid));
  }

  async function guardarFormatos() {
    const otros = todosFormatos.filter((f) => f.procedimientoId !== actual!.id);
    await save(ITEM_KEY_FOR, JSON.stringify([...otros, ...formatosActuales]));
    setFormatos(null);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href={`${basePath}/procedimientos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Procedimientos
        </Link>
        <button onClick={eliminarProcedimiento} className="text-xs text-red-500 hover:text-red-700">
          Eliminar procedimiento
        </button>
      </div>

      {/* Encabezado del documento */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-[220px]">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
              Procedimiento · {actual.codigo}
            </p>
            <input
              value={actual.nombre}
              onChange={(e) => actualizar({ nombre: e.target.value })}
              placeholder="Nombre del procedimiento"
              className="text-2xl font-bold text-[#1A1A1A] mt-1 w-full bg-transparent focus:outline-none focus:border-b focus:border-[#F5A623] placeholder-gray-300"
            />
          </div>
          <select
            value={actual.estado}
            onChange={(e) => actualizar({ estado: e.target.value as Procedimiento["estado"] })}
            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white border-none focus:outline-none"
            style={{ backgroundColor: colorEstadoDocumento(actual.estado) }}
          >
            {ESTADOS_DOCUMENTO.map((e) => (
              <option key={e} value={e} className="text-black">
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Versión</label>
            <input value={actual.version} onChange={(e) => actualizar({ version: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Vigencia</label>
            <input type="date" value={actual.fechaVigencia} onChange={(e) => actualizar({ fechaVigencia: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Proceso</label>
            {procesosMapa.length > 0 ? (
              <select
                value={procesosMapa.includes(actual.proceso) ? actual.proceso : "__otro__"}
                onChange={(e) => actualizar({ proceso: e.target.value === "__otro__" ? "" : e.target.value })}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {procesosMapa.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="__otro__">Otro (especificar)</option>
              </select>
            ) : null}
            {(procesosMapa.length === 0 || !procesosMapa.includes(actual.proceso)) && (
              <input
                value={actual.proceso}
                onChange={(e) => actualizar({ proceso: e.target.value })}
                placeholder="Nombre del proceso"
                className={inputClass + (procesosMapa.length > 0 ? " mt-1.5" : "")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
        {[
          { key: "documento" as Tab, label: "📄 Documento" },
          { key: "instructivos" as Tab, label: `📝 Instructivos${instructivosActuales.length > 0 ? ` (${instructivosActuales.length})` : ""}` },
          { key: "formatos" as Tab, label: `📎 Formatos${formatosActuales.length > 0 ? ` (${formatosActuales.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${
              tab === t.key ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "documento" && (
        <div className="space-y-4">
          <Seccion numero="1" icono="🎯" titulo="Objetivo">
            <textarea
              value={actual.objetivo}
              onChange={(e) => actualizar({ objetivo: e.target.value })}
              rows={3}
              placeholder="¿Para qué existe este procedimiento?"
              className={textareaClass}
            />
          </Seccion>

          <Seccion numero="2" icono="🗺️" titulo="Alcance">
            <textarea
              value={actual.alcance}
              onChange={(e) => actualizar({ alcance: e.target.value })}
              rows={3}
              placeholder="¿Desde dónde hasta dónde aplica? ¿A qué áreas, procesos o cargos cubre?"
              className={textareaClass}
            />
          </Seccion>

          <Seccion numero="3" icono="👥" titulo="Responsables">
            <textarea
              value={actual.responsables}
              onChange={(e) => actualizar({ responsables: e.target.value })}
              rows={3}
              placeholder="Cargos responsables de ejecutar, supervisar y aprobar lo descrito en este procedimiento."
              className={textareaClass}
            />
          </Seccion>

          <Seccion numero="4" icono="📖" titulo="Definiciones">
            <ListaDefiniciones
              definiciones={actual.definiciones}
              onChange={(definiciones) => actualizar({ definiciones })}
            />
          </Seccion>

          <Seccion numero="5" icono="🧰" titulo="Recursos">
            <textarea
              value={actual.recursos}
              onChange={(e) => actualizar({ recursos: e.target.value })}
              rows={3}
              placeholder="Personal, infraestructura, equipos, software o materiales necesarios para ejecutar el procedimiento."
              className={textareaClass}
            />
          </Seccion>

          <Seccion numero="6" icono="🔄" titulo="Desarrollo de las Actividades">
            <TablaActividades
              actividades={actual.desarrollo}
              onChange={(desarrollo) => actualizar({ desarrollo })}
            />
          </Seccion>

          <Seccion numero="7" icono="🗂️" titulo="Registros">
            <ListaRegistros
              registros={actual.registros}
              formatos={formatosActuales}
              onChange={(registros) => actualizar({ registros })}
            />
          </Seccion>

          <Seccion numero="8" icono="✅" titulo="Control del Documento">
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className={labelClass}>Elaborado por</label>
                <input value={actual.elaboradoPor} onChange={(e) => actualizar({ elaboradoPor: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Revisado por</label>
                <input value={actual.revisadoPor} onChange={(e) => actualizar({ revisadoPor: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Aprobado por</label>
                <input value={actual.aprobadoPor} onChange={(e) => actualizar({ aprobadoPor: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha de elaboración</label>
                <input type="date" value={actual.fechaElaboracion} onChange={(e) => actualizar({ fechaElaboracion: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha de aprobación</label>
                <input type="date" value={actual.fechaAprobacion} onChange={(e) => actualizar({ fechaAprobacion: e.target.value })} className={inputClass} />
              </div>
            </div>
            <label className={labelClass}>Observaciones</label>
            <textarea
              value={actual.observaciones}
              onChange={(e) => actualizar({ observaciones: e.target.value })}
              rows={2}
              className={textareaClass}
            />
          </Seccion>

          <div className="flex items-center gap-3 justify-end">
            {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
            <button
              onClick={guardarProcedimiento}
              className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {tab === "instructivos" && (
        <div className="space-y-4">
          <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
            Los instructivos se desprenden de este procedimiento: describen, paso a paso, <strong>cómo</strong> se
            ejecuta una tarea puntual mencionada en el desarrollo de actividades.
          </div>

          {instructivosActuales.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Este procedimiento todavía no tiene instructivos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {instructivosActuales.map((ins) => (
                <TarjetaInstructivo
                  key={ins.id}
                  instructivo={ins}
                  onChange={actualizarInstructivo}
                  onDelete={() => eliminarInstructivo(ins.id)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 justify-between flex-wrap">
            <button onClick={nuevoInstructivo} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
              + Agregar instructivo
            </button>
            <div className="flex items-center gap-3">
              {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
              <button
                onClick={guardarInstructivos}
                className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm"
              >
                Guardar instructivos
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "formatos" && (
        <div className="space-y-4">
          <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
            Los formatos se desprenden de este procedimiento: son las plantillas o registros que se diligencian al
            ejecutarlo. Acá solo se sube el archivo de la plantilla vigente.
          </div>

          {formatosActuales.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Este procedimiento todavía no tiene formatos.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {formatosActuales.map((f) => (
                <TarjetaFormato key={f.id} formato={f} onChange={actualizarFormato} onDelete={() => eliminarFormato(f.id)} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 justify-between flex-wrap">
            <button onClick={nuevoFormato} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
              + Agregar formato
            </button>
            <div className="flex items-center gap-3">
              {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
              <button
                onClick={guardarFormatos}
                className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm"
              >
                Guardar formatos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Definiciones ---

function ListaDefiniciones({
  definiciones,
  onChange,
}: {
  definiciones: Procedimiento["definiciones"];
  onChange: (d: Procedimiento["definiciones"]) => void;
}) {
  return (
    <div className="space-y-2">
      {definiciones.map((d) => (
        <div key={d.id} className="grid sm:grid-cols-4 gap-2 items-start">
          <input
            value={d.termino}
            onChange={(e) => onChange(definiciones.map((x) => (x.id === d.id ? { ...x, termino: e.target.value } : x)))}
            placeholder="Término"
            className={inputClass + " sm:col-span-1 font-semibold"}
          />
          <input
            value={d.definicion}
            onChange={(e) => onChange(definiciones.map((x) => (x.id === d.id ? { ...x, definicion: e.target.value } : x)))}
            placeholder="Definición"
            className={inputClass + " sm:col-span-3"}
          />
          <button
            onClick={() => onChange(definiciones.filter((x) => x.id !== d.id))}
            className="text-xs text-red-400 hover:text-red-600 sm:col-span-4 text-left -mt-1"
          >
            Eliminar término
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...definiciones, definicionVacia()])} className="text-xs font-semibold hover:opacity-80" style={{ color: NARANJA }}>
        + Agregar término
      </button>
    </div>
  );
}

// --- Desarrollo de actividades ---

function TablaActividades({
  actividades,
  onChange,
}: {
  actividades: Procedimiento["desarrollo"];
  onChange: (a: Procedimiento["desarrollo"]) => void;
}) {
  const ordenadas = [...actividades].sort((a, b) => a.numero - b.numero);
  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[2rem_1fr_2fr_1.2fr_auto] gap-2 px-1">
        <span className="text-[10px] font-bold uppercase text-gray-400">N°</span>
        <span className="text-[10px] font-bold uppercase text-gray-400">Etapa</span>
        <span className="text-[10px] font-bold uppercase text-gray-400">Descripción</span>
        <span className="text-[10px] font-bold uppercase text-gray-400">Responsable</span>
        <span />
      </div>
      {ordenadas.map((a, idx) => (
        <div key={a.id} className="grid sm:grid-cols-[2rem_1fr_2fr_1.2fr_auto] gap-2 items-start bg-[#FAFAFA] rounded-lg p-2">
          <div className="flex sm:items-center justify-center text-sm font-bold text-gray-400 pt-2 sm:pt-0">{a.numero}</div>
          <input
            value={a.etapa}
            onChange={(e) => onChange(ordenadas.map((x) => (x.id === a.id ? { ...x, etapa: e.target.value } : x)))}
            placeholder="Etapa"
            className={inputClass}
          />
          <textarea
            value={a.descripcion}
            onChange={(e) => onChange(ordenadas.map((x) => (x.id === a.id ? { ...x, descripcion: e.target.value } : x)))}
            placeholder="¿Qué se hace?"
            rows={2}
            className={textareaClass}
          />
          <input
            value={a.responsable}
            onChange={(e) => onChange(ordenadas.map((x) => (x.id === a.id ? { ...x, responsable: e.target.value } : x)))}
            placeholder="Responsable"
            className={inputClass}
          />
          <div className="flex sm:flex-col gap-1 items-center justify-center">
            <button disabled={idx === 0} onClick={() => onChange(reordenarActividades(ordenadas, a.id, "arriba"))} className="text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
              ↑
            </button>
            <button disabled={idx === ordenadas.length - 1} onClick={() => onChange(reordenarActividades(ordenadas, a.id, "abajo"))} className="text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
              ↓
            </button>
            <button onClick={() => onChange(ordenadas.filter((x) => x.id !== a.id).map((x, i) => ({ ...x, numero: i + 1 })))} className="text-red-400 hover:text-red-600 text-xs">
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...ordenadas, actividadVacia(ordenadas.length + 1)])}
        className="text-xs font-semibold hover:opacity-80"
        style={{ color: NARANJA }}
      >
        + Agregar actividad
      </button>
    </div>
  );
}

// --- Registros ---

function ListaRegistros({
  registros,
  formatos,
  onChange,
}: {
  registros: Procedimiento["registros"];
  formatos: Formato[];
  onChange: (r: Procedimiento["registros"]) => void;
}) {
  return (
    <div className="space-y-2">
      {registros.map((r) => (
        <div key={r.id} className="grid sm:grid-cols-[2fr_1.5fr_auto] gap-2 items-center">
          <input
            value={r.nombre}
            onChange={(e) => onChange(registros.map((x) => (x.id === r.id ? { ...x, nombre: e.target.value } : x)))}
            placeholder="Nombre del registro (ej: Acta de entrega)"
            className={inputClass}
          />
          <select
            value={r.formatoId}
            onChange={(e) => onChange(registros.map((x) => (x.id === r.id ? { ...x, formatoId: e.target.value } : x)))}
            className={inputClass}
          >
            <option value="">Sin formato vinculado</option>
            {formatos.map((f) => (
              <option key={f.id} value={f.id}>
                {f.codigo} — {f.nombre || "Sin nombre"}
              </option>
            ))}
          </select>
          <button onClick={() => onChange(registros.filter((x) => x.id !== r.id))} className="text-red-400 hover:text-red-600 text-xs">
            ✕
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...registros, registroVacio()])} className="text-xs font-semibold hover:opacity-80" style={{ color: NARANJA }}>
        + Agregar registro
      </button>
    </div>
  );
}

// --- Instructivo ---

function TarjetaInstructivo({
  instructivo,
  onChange,
  onDelete,
}: {
  instructivo: Instructivo;
  onChange: (i: Instructivo) => void;
  onDelete: () => void;
}) {
  const [abierto, setAbierto] = useState(!instructivo.nombre);
  const ordenados = [...instructivo.pasos].sort((a, b) => a.numero - b.numero);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[10px] text-gray-400 flex-shrink-0">{instructivo.codigo}</span>
          <span className="text-white text-xs font-bold truncate">{instructivo.nombre || "Instructivo sin nombre"}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoDocumento(instructivo.estado) }}>
            {instructivo.estado}
          </span>
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre</label>
              <input value={instructivo.nombre} onChange={(e) => onChange({ ...instructivo, nombre: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Versión</label>
              <input value={instructivo.version} onChange={(e) => onChange({ ...instructivo, version: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vigencia</label>
              <input type="date" value={instructivo.fechaVigencia} onChange={(e) => onChange({ ...instructivo, fechaVigencia: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Estado</label>
              <select value={instructivo.estado} onChange={(e) => onChange({ ...instructivo, estado: e.target.value as Instructivo["estado"] })} className={inputClass}>
                {ESTADOS_DOCUMENTO.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Elaborado por</label>
              <input value={instructivo.elaboradoPor} onChange={(e) => onChange({ ...instructivo, elaboradoPor: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Objetivo</label>
            <textarea value={instructivo.objetivo} onChange={(e) => onChange({ ...instructivo, objetivo: e.target.value })} rows={2} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>Alcance</label>
            <textarea value={instructivo.alcance} onChange={(e) => onChange({ ...instructivo, alcance: e.target.value })} rows={2} className={textareaClass} />
          </div>

          <div>
            <label className={labelClass}>Pasos</label>
            <div className="space-y-2">
              {ordenados.map((p, idx) => (
                <div key={p.id} className="grid sm:grid-cols-[2rem_1fr_1fr_auto] gap-2 items-start bg-[#FAFAFA] rounded-lg p-2">
                  <div className="flex sm:items-center justify-center text-sm font-bold text-gray-400 pt-2 sm:pt-0">{p.numero}</div>
                  <textarea
                    value={p.descripcion}
                    onChange={(e) =>
                      onChange({ ...instructivo, pasos: ordenados.map((x) => (x.id === p.id ? { ...x, descripcion: e.target.value } : x)) })
                    }
                    placeholder="Descripción del paso"
                    rows={2}
                    className={textareaClass}
                  />
                  <input
                    value={p.responsable}
                    onChange={(e) => onChange({ ...instructivo, pasos: ordenados.map((x) => (x.id === p.id ? { ...x, responsable: e.target.value } : x)) })}
                    placeholder="Responsable"
                    className={inputClass}
                  />
                  <div className="flex sm:flex-col gap-1 items-center justify-center">
                    <button disabled={idx === 0} onClick={() => onChange({ ...instructivo, pasos: reordenarPasos(ordenados, p.id, "arriba") })} className="text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
                      ↑
                    </button>
                    <button disabled={idx === ordenados.length - 1} onClick={() => onChange({ ...instructivo, pasos: reordenarPasos(ordenados, p.id, "abajo") })} className="text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
                      ↓
                    </button>
                    <button
                      onClick={() => onChange({ ...instructivo, pasos: ordenados.filter((x) => x.id !== p.id).map((x, i) => ({ ...x, numero: i + 1 })) })}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => onChange({ ...instructivo, pasos: [...ordenados, pasoInstructivoVacio(ordenados.length + 1)] })}
                className="text-xs font-semibold hover:opacity-80"
                style={{ color: NARANJA }}
              >
                + Agregar paso
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
              Eliminar instructivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Formato ---

function TarjetaFormato({
  formato,
  onChange,
  onDelete,
}: {
  formato: Formato;
  onChange: (f: Formato) => void;
  onDelete: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      alert("El archivo es demasiado grande (máximo 4 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...formato, archivo: reader.result as string, archivoNombre: file.name, archivoTipo: file.type });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-gray-400">{formato.codigo}</span>
        <select
          value={formato.estado}
          onChange={(e) => onChange({ ...formato, estado: e.target.value as Formato["estado"] })}
          className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white border-none focus:outline-none"
          style={{ backgroundColor: colorEstadoDocumento(formato.estado) }}
        >
          {ESTADOS_DOCUMENTO.map((e) => (
            <option key={e} value={e} className="text-black">
              {e}
            </option>
          ))}
        </select>
      </div>

      <input value={formato.nombre} onChange={(e) => onChange({ ...formato, nombre: e.target.value })} placeholder="Nombre del formato" className={inputClass + " font-semibold"} />

      <div className="grid grid-cols-2 gap-2">
        <input value={formato.version} onChange={(e) => onChange({ ...formato, version: e.target.value })} placeholder="Versión" className={inputClass} />
        <input type="date" value={formato.fechaCarga} onChange={(e) => onChange({ ...formato, fechaCarga: e.target.value })} className={inputClass} />
      </div>

      <textarea
        value={formato.descripcion}
        onChange={(e) => onChange({ ...formato, descripcion: e.target.value })}
        placeholder="¿Para qué se usa este formato?"
        rows={2}
        className={textareaClass}
      />

      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" onChange={handleArchivo} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#F5A623] transition-colors"
        >
          📎 {formato.archivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
        </button>
        {formato.archivoNombre && (
          <a href={formato.archivo ?? "#"} download={formato.archivoNombre} className="text-xs hover:opacity-80 truncate" style={{ color: NARANJA }}>
            {formato.archivoNombre}
          </a>
        )}
      </div>

      <div className="flex justify-end pt-1 border-t border-gray-100">
        <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
          Eliminar formato
        </button>
      </div>
    </div>
  );
}
