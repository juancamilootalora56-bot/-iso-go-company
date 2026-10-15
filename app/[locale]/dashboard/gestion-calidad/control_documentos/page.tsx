"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseProcedimientos,
  parseInstructivos,
  parseFormatos,
  ESTADOS_DOCUMENTO,
  colorEstadoDocumento,
  type EstadoDocumento,
} from "@/lib/procedimientos";
import {
  parseOtrosDocumentos,
  otroDocumentoVacio,
  parseCambios,
  cambioVacio,
  siguienteCodigo,
  numeroDeCodigo,
  resumenPorEstado,
  resumenPorTipo,
  vencenEn30Dias,
  ORIGENES_DOCUMENTO,
  CATEGORIAS_OTRO_DOCUMENTO,
  TIPOS_CAMBIO,
  TIPOS_DOCUMENTO_CONTROLADO,
  type OtroDocumento,
  type CambioDocumento,
  type FilaMaestra,
  type TipoDocumentoControlado,
} from "@/lib/controlDocumentos";
import { parseLista } from "@/lib/mapaProcesos";

const ITEM_KEY_PROC = "procedimientos_lista";
const ITEM_KEY_INS = "instructivos_lista";
const ITEM_KEY_FOR = "formatos_lista";
const ITEM_KEY_OTROS = "control_documentos_otros";
const ITEM_KEY_CAMBIOS = "control_documentos_cambios";
const NARANJA = "#F97316";
const MAX_ARCHIVO_BYTES = 4_000_000;

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const textareaClass = inputClass + " resize-y";

type Tab = "maestro" | "cambios" | "otros";

const ICONO_TIPO: Record<TipoDocumentoControlado, string> = {
  Procedimiento: "📋",
  Instructivo: "📝",
  Formato: "📎",
  Otro: "🗂️",
};

export default function ControlDocumentosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const procedimientos = useMemo(() => parseProcedimientos(docs[ITEM_KEY_PROC] ?? ""), [docs]);
  const instructivos = useMemo(() => parseInstructivos(docs[ITEM_KEY_INS] ?? ""), [docs]);
  const formatos = useMemo(() => parseFormatos(docs[ITEM_KEY_FOR] ?? ""), [docs]);
  const otrosGuardados = useMemo(() => parseOtrosDocumentos(docs[ITEM_KEY_OTROS] ?? ""), [docs]);
  const cambiosGuardados = useMemo(() => parseCambios(docs[ITEM_KEY_CAMBIOS] ?? ""), [docs]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);

  const [otros, setOtros] = useState<OtroDocumento[] | null>(null);
  const [cambios, setCambios] = useState<CambioDocumento[] | null>(null);
  const [tab, setTab] = useState<Tab>("maestro");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const otrosActuales = otros ?? otrosGuardados;
  const cambiosActuales = cambios ?? cambiosGuardados;

  // --- Listado maestro: agrega procedimientos + instructivos + formatos + otros documentos ---
  const filasMaestras: FilaMaestra[] = useMemo(() => {
    const deProcedimientos: FilaMaestra[] = procedimientos.map((p) => ({
      tipo: "Procedimiento",
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      proceso: p.proceso,
      version: p.version,
      estado: p.estado,
      fechaVigencia: p.fechaVigencia,
      responsable: p.aprobadoPor || p.revisadoPor || p.elaboradoPor,
    }));
    const deInstructivos: FilaMaestra[] = instructivos.map((i) => ({
      tipo: "Instructivo",
      id: i.id,
      codigo: i.codigo,
      nombre: i.nombre,
      proceso: procedimientos.find((p) => p.id === i.procedimientoId)?.proceso ?? "",
      version: i.version,
      estado: i.estado,
      fechaVigencia: i.fechaVigencia,
      responsable: i.elaboradoPor,
    }));
    const deFormatos: FilaMaestra[] = formatos.map((f) => ({
      tipo: "Formato",
      id: f.id,
      codigo: f.codigo,
      nombre: f.nombre,
      proceso: procedimientos.find((p) => p.id === f.procedimientoId)?.proceso ?? "",
      version: f.version,
      estado: f.estado,
      fechaVigencia: "",
      responsable: "",
    }));
    const deOtros: FilaMaestra[] = otrosActuales.map((d) => ({
      tipo: "Otro",
      id: d.id,
      codigo: d.codigo,
      nombre: d.nombre,
      proceso: d.proceso,
      version: d.version,
      estado: d.estado,
      fechaVigencia: d.fechaVigencia,
      responsable: d.aprobadoPor || d.revisadoPor || d.elaboradoPor,
    }));
    return [...deProcedimientos, ...deInstructivos, ...deFormatos, ...deOtros];
  }, [procedimientos, instructivos, formatos, otrosActuales]);

  function hrefDeFila(f: FilaMaestra): string | null {
    if (f.tipo === "Procedimiento") return `${basePath}/procedimientos/${f.id}`;
    if (f.tipo === "Instructivo") {
      const padre = instructivos.find((i) => i.id === f.id)?.procedimientoId;
      return padre ? `${basePath}/procedimientos/${padre}` : null;
    }
    if (f.tipo === "Formato") {
      const padre = formatos.find((fm) => fm.id === f.id)?.procedimientoId;
      return padre ? `${basePath}/procedimientos/${padre}` : null;
    }
    return null;
  }

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filtradas = filasMaestras.filter((f) => (!filtroTipo || f.tipo === filtroTipo) && (!filtroEstado || f.estado === filtroEstado));
  const resumenEstado = resumenPorEstado(filasMaestras);
  const resumenTipo = resumenPorTipo(filasMaestras);
  const proximasAVencer = vencenEn30Dias(filasMaestras);

  function mostrarMensaje(texto: string) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  }

  // --- Control de cambios: registrar + escribir de vuelta la versión/estado en el documento origen ---

  async function registrarCambio(cambio: CambioDocumento) {
    setGuardando(true);
    const nuevaLista = [...cambiosActuales, cambio];
    await save(ITEM_KEY_CAMBIOS, JSON.stringify(nuevaLista));
    setCambios(null);

    if (cambio.documentoTipo === "Procedimiento") {
      const actualizados = procedimientos.map((p) => (p.id === cambio.documentoId ? { ...p, version: cambio.versionNueva, estado: cambio.nuevoEstado } : p));
      await save(ITEM_KEY_PROC, JSON.stringify(actualizados));
    } else if (cambio.documentoTipo === "Instructivo") {
      const actualizados = instructivos.map((i) => (i.id === cambio.documentoId ? { ...i, version: cambio.versionNueva, estado: cambio.nuevoEstado } : i));
      await save(ITEM_KEY_INS, JSON.stringify(actualizados));
    } else if (cambio.documentoTipo === "Formato") {
      const actualizados = formatos.map((f) => (f.id === cambio.documentoId ? { ...f, version: cambio.versionNueva, estado: cambio.nuevoEstado } : f));
      await save(ITEM_KEY_FOR, JSON.stringify(actualizados));
    } else {
      const actualizados = otrosActuales.map((d) => (d.id === cambio.documentoId ? { ...d, version: cambio.versionNueva, estado: cambio.nuevoEstado } : d));
      await save(ITEM_KEY_OTROS, JSON.stringify(actualizados));
    }

    setGuardando(false);
    mostrarMensaje("Cambio registrado — versión y estado del documento actualizados ✓");
  }

  async function eliminarCambio(id: string) {
    if (!confirm("¿Eliminar este registro del historial de cambios? Esto no revierte la versión del documento.")) return;
    await save(ITEM_KEY_CAMBIOS, JSON.stringify(cambiosActuales.filter((c) => c.id !== id)));
    setCambios(null);
  }

  // --- Otros documentos ---

  function nuevoOtroDocumento() {
    const codigo = siguienteCodigo("OD", otrosActuales.map((d) => numeroDeCodigo(d.codigo)));
    setOtros([...otrosActuales, otroDocumentoVacio(codigo)]);
  }

  function actualizarOtro(d: OtroDocumento) {
    setOtros(otrosActuales.map((x) => (x.id === d.id ? d : x)));
  }

  async function eliminarOtro(id: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    await save(ITEM_KEY_OTROS, JSON.stringify(otrosActuales.filter((d) => d.id !== id)));
    setOtros(null);
  }

  async function guardarOtros() {
    setGuardando(true);
    await save(ITEM_KEY_OTROS, JSON.stringify(otrosActuales));
    setOtros(null);
    setGuardando(false);
    mostrarMensaje("Guardado ✓");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Calidad
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Control de Documentos</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Gobierno documental del sistema de gestión: listado maestro, control de versiones y aprobaciones (ISO
          9001, cl. 7.5.3). Los Procedimientos, Instructivos y Formatos se siguen editando en su módulo — acá se
          controla su ciclo de vida.
        </p>
      </div>

      {filasMaestras.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{filasMaestras.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">documentos controlados</span>
          </div>
          {resumenEstado.map((r) => (
            <div key={r.estado} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorEstadoDocumento(r.estado) }} />
              <span className="text-sm font-bold text-[#1A1A1A]">{r.cantidad}</span>
              <span className="text-xs text-gray-500">{r.estado}</span>
            </div>
          ))}
          {proximasAVencer.length > 0 && (
            <div className="bg-[#FFF6E5] border border-[#F5A623]/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: NARANJA }}>
                ⏰ {proximasAVencer.length}
              </span>
              <span className="text-xs text-gray-600">vigencia vence en 30 días</span>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{cambiosActuales.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">cambios registrados</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
        {[
          { key: "maestro" as Tab, label: "🗂️ Listado Maestro" },
          { key: "cambios" as Tab, label: `🔄 Control de Cambios${cambiosActuales.length > 0 ? ` (${cambiosActuales.length})` : ""}` },
          { key: "otros" as Tab, label: `📄 Otros Documentos${otrosActuales.length > 0 ? ` (${otrosActuales.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${tab === t.key ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mensaje && <p className="text-xs text-green-600 font-semibold">{mensaje}</p>}

      {tab === "maestro" && (
        <TabMaestro
          filasMaestras={filtradas}
          total={filasMaestras.length}
          resumenTipo={resumenTipo}
          filtroTipo={filtroTipo}
          filtroEstado={filtroEstado}
          onFiltroTipo={setFiltroTipo}
          onFiltroEstado={setFiltroEstado}
          hrefDeFila={hrefDeFila}
          onIrADocumento={(href) => router.push(href)}
          onIrAOtros={() => setTab("otros")}
        />
      )}

      {tab === "cambios" && (
        <TabCambios
          cambios={cambiosActuales}
          filasMaestras={filasMaestras}
          guardando={guardando}
          onRegistrar={registrarCambio}
          onEliminar={eliminarCambio}
        />
      )}

      {tab === "otros" && (
        <TabOtros
          otros={otrosActuales}
          procesosMapa={procesosMapa}
          guardando={guardando}
          onNuevo={nuevoOtroDocumento}
          onActualizar={actualizarOtro}
          onEliminar={eliminarOtro}
          onGuardar={guardarOtros}
        />
      )}
    </div>
  );
}

// ============== Tab: Listado Maestro ==============

function TabMaestro({
  filasMaestras,
  total,
  resumenTipo,
  filtroTipo,
  filtroEstado,
  onFiltroTipo,
  onFiltroEstado,
  hrefDeFila,
  onIrADocumento,
  onIrAOtros,
}: {
  filasMaestras: FilaMaestra[];
  total: number;
  resumenTipo: { tipo: TipoDocumentoControlado; cantidad: number }[];
  filtroTipo: string;
  filtroEstado: string;
  onFiltroTipo: (v: string) => void;
  onFiltroEstado: (v: string) => void;
  hrefDeFila: (f: FilaMaestra) => string | null;
  onIrADocumento: (href: string) => void;
  onIrAOtros: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filtroTipo} onChange={(e) => onFiltroTipo(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todos los tipos</option>
            {TIPOS_DOCUMENTO_CONTROLADO.map((t) => (
              <option key={t} value={t}>
                {ICONO_TIPO[t]} {t}
              </option>
            ))}
          </select>
          <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todos los estados</option>
            {ESTADOS_DOCUMENTO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        {resumenTipo.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {resumenTipo.map((r) => (
              <span key={r.tipo} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                {ICONO_TIPO[r.tipo]} {r.tipo} · {r.cantidad}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Código</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Nombre</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Proceso</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Versión</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Estado</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Responsable</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {filasMaestras.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-10">
                  {total === 0 ? (
                    <>
                      Todavía no hay documentos controlados. Creá Procedimientos en{" "}
                      <span className="font-semibold text-[#1A1A1A]">Gestión de Procedimientos</span>, o agregá uno en{" "}
                      <button onClick={onIrAOtros} className="font-semibold hover:opacity-80" style={{ color: NARANJA }}>
                        Otros Documentos
                      </button>
                      .
                    </>
                  ) : (
                    "Ningún documento coincide con los filtros."
                  )}
                </td>
              </tr>
            ) : (
              filasMaestras.map((f) => {
                const href = hrefDeFila(f);
                return (
                  <tr
                    key={`${f.tipo}-${f.id}`}
                    onClick={href ? () => onIrADocumento(href) : undefined}
                    className={`border-b border-gray-50 hover:bg-[#FAFAFA] ${href ? "cursor-pointer" : ""}`}
                  >
                    <td className="p-2.5 whitespace-nowrap">
                      {ICONO_TIPO[f.tipo]} {f.tipo}
                    </td>
                    <td className="p-2.5 font-mono text-gray-400 whitespace-nowrap">{f.codigo}</td>
                    <td className="p-2.5 text-[#1A1A1A] font-medium">{f.nombre || "Sin nombre"}</td>
                    <td className="p-2.5 text-gray-500">{f.proceso || "—"}</td>
                    <td className="p-2.5 text-gray-500">v{f.version}</td>
                    <td className="p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorEstadoDocumento(f.estado) }}>
                        {f.estado}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-500">{f.responsable || "—"}</td>
                    <td className="p-2.5 text-gray-500 whitespace-nowrap">{f.fechaVigencia || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Tab: Control de Cambios ==============

function TabCambios({
  cambios,
  filasMaestras,
  guardando,
  onRegistrar,
  onEliminar,
}: {
  cambios: CambioDocumento[];
  filasMaestras: FilaMaestra[];
  guardando: boolean;
  onRegistrar: (c: CambioDocumento) => void;
  onEliminar: (id: string) => void;
}) {
  const [formulario, setFormulario] = useState<CambioDocumento | null>(null);

  function iniciar() {
    setFormulario(cambioVacio(cambios.length + 1));
  }

  function seleccionarDocumento(clave: string) {
    const [tipo, id] = clave.split("::");
    const fila = filasMaestras.find((f) => f.tipo === tipo && f.id === id);
    if (!fila || !formulario) return;
    setFormulario({
      ...formulario,
      documentoTipo: fila.tipo,
      documentoId: fila.id,
      documentoCodigo: fila.codigo,
      documentoNombre: fila.nombre,
      versionAnterior: fila.version,
      versionNueva: fila.version,
      nuevoEstado: fila.estado,
    });
  }

  function enviar() {
    if (!formulario) return;
    if (!formulario.documentoId) {
      alert("Seleccioná el documento sobre el que se registra el cambio.");
      return;
    }
    if (!formulario.versionNueva.trim()) {
      alert("Indicá la nueva versión.");
      return;
    }
    onRegistrar(formulario);
    setFormulario(null);
  }

  const ordenados = [...cambios].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-4">
      <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
        Cada cambio registrado acá queda en el historial <strong>y</strong> actualiza automáticamente la versión y el
        estado del documento en su módulo de origen — así la versión del Procedimiento/Instructivo/Formato nunca
        queda desincronizada de su historial de control de cambios.
      </div>

      {!formulario ? (
        <button onClick={iniciar} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Registrar cambio
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div>
            <label className={labelClass}>Documento</label>
            <select
              value={formulario.documentoId ? `${formulario.documentoTipo}::${formulario.documentoId}` : ""}
              onChange={(e) => seleccionarDocumento(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar documento...</option>
              {filasMaestras.map((f) => (
                <option key={`${f.tipo}::${f.id}`} value={`${f.tipo}::${f.id}`}>
                  {ICONO_TIPO[f.tipo]} {f.codigo} — {f.nombre || "Sin nombre"} (v{f.version})
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Versión anterior</label>
              <input value={formulario.versionAnterior} disabled className={inputClass + " opacity-60"} />
            </div>
            <div>
              <label className={labelClass}>Versión nueva</label>
              <input value={formulario.versionNueva} onChange={(e) => setFormulario({ ...formulario, versionNueva: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nuevo estado</label>
              <select value={formulario.nuevoEstado} onChange={(e) => setFormulario({ ...formulario, nuevoEstado: e.target.value as EstadoDocumento })} className={inputClass}>
                {ESTADOS_DOCUMENTO.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo de cambio</label>
              <select value={formulario.tipoCambio} onChange={(e) => setFormulario({ ...formulario, tipoCambio: e.target.value })} className={inputClass}>
                {TIPOS_CAMBIO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={formulario.fecha} onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>¿Qué cambió?</label>
            <textarea rows={2} value={formulario.descripcionCambio} onChange={(e) => setFormulario({ ...formulario, descripcionCambio: e.target.value })} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>Motivo del cambio</label>
            <textarea rows={2} value={formulario.motivoCambio} onChange={(e) => setFormulario({ ...formulario, motivoCambio: e.target.value })} className={textareaClass} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Solicitado por</label>
              <input value={formulario.solicitadoPor} onChange={(e) => setFormulario({ ...formulario, solicitadoPor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aprobado por</label>
              <input value={formulario.aprobadoPor} onChange={(e) => setFormulario({ ...formulario, aprobadoPor: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={() => setFormulario(null)} className="text-xs text-gray-400 hover:text-[#1A1A1A]">
              Cancelar
            </button>
            <button onClick={enviar} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar cambio"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Documento</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Versión</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Tipo de cambio</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Descripción</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Solicitado por</th>
              <th className="p-2.5 font-semibold border-b border-gray-100">Aprobado por</th>
              <th className="p-2.5 font-semibold border-b border-gray-100" />
            </tr>
          </thead>
          <tbody>
            {ordenados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-10">
                  Todavía no hay cambios registrados.
                </td>
              </tr>
            ) : (
              ordenados.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">{c.fecha}</td>
                  <td className="p-2.5 text-[#1A1A1A] font-medium whitespace-nowrap">
                    {ICONO_TIPO[c.documentoTipo]} {c.documentoCodigo} — {c.documentoNombre}
                  </td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">
                    {c.versionAnterior} → <span className="font-semibold text-[#1A1A1A]">{c.versionNueva}</span>
                  </td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">{c.tipoCambio}</td>
                  <td className="p-2.5 text-gray-500 max-w-[220px] truncate" title={c.descripcionCambio}>
                    {c.descripcionCambio || "—"}
                  </td>
                  <td className="p-2.5 text-gray-500">{c.solicitadoPor || "—"}</td>
                  <td className="p-2.5 text-gray-500">{c.aprobadoPor || "—"}</td>
                  <td className="p-2.5 text-center">
                    <button onClick={() => onEliminar(c.id)} className="text-red-300 hover:text-red-600">
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Tab: Otros Documentos ==============

function TabOtros({
  otros,
  procesosMapa,
  guardando,
  onNuevo,
  onActualizar,
  onEliminar,
  onGuardar,
}: {
  otros: OtroDocumento[];
  procesosMapa: string[];
  guardando: boolean;
  onNuevo: () => void;
  onActualizar: (d: OtroDocumento) => void;
  onEliminar: (id: string) => void;
  onGuardar: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
        Documentos controlados que no se desprenden de un Procedimiento: manuales, políticas, normas técnicas o
        legales, documentos de origen externo, planos, especificaciones, etc.
      </div>

      {otros.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay otros documentos registrados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {otros.map((d) => (
            <TarjetaOtroDocumento key={d.id} documento={d} procesosMapa={procesosMapa} onChange={onActualizar} onDelete={() => onEliminar(d.id)} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onNuevo} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Agregar documento
        </button>
        <button onClick={onGuardar} disabled={guardando} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50">
          {guardando ? "Guardando..." : "Guardar documentos"}
        </button>
      </div>
    </div>
  );
}

function TarjetaOtroDocumento({
  documento,
  procesosMapa,
  onChange,
  onDelete,
}: {
  documento: OtroDocumento;
  procesosMapa: string[];
  onChange: (d: OtroDocumento) => void;
  onDelete: () => void;
}) {
  const [abierto, setAbierto] = useState(!documento.nombre);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARCHIVO_BYTES) {
      alert("El archivo es demasiado grande (máximo 4 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ ...documento, archivo: reader.result as string, archivoNombre: file.name, archivoTipo: file.type });
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[10px] text-gray-400 flex-shrink-0">{documento.codigo}</span>
          <span className="text-white text-xs font-bold truncate">{documento.nombre || "Documento sin nombre"}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoDocumento(documento.estado) }}>
            {documento.estado}
          </span>
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre del documento</label>
              <input value={documento.nombre} onChange={(e) => onChange({ ...documento, nombre: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={documento.categoria} onChange={(e) => onChange({ ...documento, categoria: e.target.value })} className={inputClass}>
                <option value="">—</option>
                {CATEGORIAS_OTRO_DOCUMENTO.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Origen</label>
              <select value={documento.origen} onChange={(e) => onChange({ ...documento, origen: e.target.value })} className={inputClass}>
                {ORIGENES_DOCUMENTO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Versión</label>
              <input value={documento.version} onChange={(e) => onChange({ ...documento, version: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={documento.estado} onChange={(e) => onChange({ ...documento, estado: e.target.value as EstadoDocumento })} className={inputClass}>
                {ESTADOS_DOCUMENTO.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Vigencia</label>
              <input type="date" value={documento.fechaVigencia} onChange={(e) => onChange({ ...documento, fechaVigencia: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Proceso relacionado</label>
            {procesosMapa.length > 0 ? (
              <select value={procesosMapa.includes(documento.proceso) ? documento.proceso : ""} onChange={(e) => onChange({ ...documento, proceso: e.target.value })} className={inputClass}>
                <option value="">—</option>
                {procesosMapa.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <input value={documento.proceso} onChange={(e) => onChange({ ...documento, proceso: e.target.value })} placeholder="Proceso" className={inputClass} />
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Elaborado por</label>
              <input value={documento.elaboradoPor} onChange={(e) => onChange({ ...documento, elaboradoPor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Revisado por</label>
              <input value={documento.revisadoPor} onChange={(e) => onChange({ ...documento, revisadoPor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aprobado por</label>
              <input value={documento.aprobadoPor} onChange={(e) => onChange({ ...documento, aprobadoPor: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Ubicación / distribución</label>
            <input
              value={documento.ubicacionDistribucion}
              onChange={(e) => onChange({ ...documento, ubicacionDistribucion: e.target.value })}
              placeholder="Ej: Intranet, carpeta compartida de Gestión Humana..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" onChange={handleArchivo} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#F5A623] transition-colors">
              📎 {documento.archivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
            </button>
            {documento.archivoNombre && (
              <a href={documento.archivo ?? "#"} download={documento.archivoNombre} className="text-xs hover:opacity-80 truncate" style={{ color: NARANJA }}>
                {documento.archivoNombre}
              </a>
            )}
          </div>

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea rows={2} value={documento.observaciones} onChange={(e) => onChange({ ...documento, observaciones: e.target.value })} className={textareaClass} />
          </div>

          <div className="flex justify-end pt-1 border-t border-gray-100">
            <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
              Eliminar documento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
