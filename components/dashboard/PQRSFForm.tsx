"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Cliente } from "@/lib/clientes";
import {
  parseCasos,
  casoVacio,
  siguienteRadicado,
  numeroDeRadicado,
  eventoBitacoraVacio,
  infoTipo,
  colorTipo,
  colorPrioridad,
  colorEstado,
  estadoSLA,
  colorEstadoSLA,
  etiquetaEstadoSLA,
  diasRestantes,
  diasTranscurridos,
  TIPOS_PQRSF,
  CATEGORIAS_PQRSF,
  CANALES_PQRSF,
  PRIORIDADES_PQRSF,
  ESTADOS_PQRSF,
  type CasoPQRSF,
} from "@/lib/pqrsf";

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
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fechaHoraLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function Estrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className={`text-lg leading-none ${n <= valor ? "text-[#F5A623]" : "text-gray-200"}`}>★</button>
      ))}
      {valor > 0 && <span className="text-xs text-gray-400 ml-1">{valor}/5</span>}
    </div>
  );
}

function BadgeSLA({ caso }: { caso: CasoPQRSF }) {
  const estado = estadoSLA(caso);
  if (estado === "no_aplica") return null;
  const restantes = diasRestantes(caso);
  let texto = etiquetaEstadoSLA(estado);
  if (estado === "en_plazo" || estado === "por_vencer") texto += ` · ${restantes} día${restantes === 1 ? "" : "s"} restantes`;
  if (estado === "vencido" && restantes !== null) texto += ` · ${Math.abs(restantes)} día${Math.abs(restantes) === 1 ? "" : "s"} de atraso`;
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
      style={{ backgroundColor: colorEstadoSLA(estado) }}
    >
      {texto}
    </span>
  );
}

export default function PQRSFForm({ userId, cliente }: { userId: string | null; cliente: Cliente }) {
  const itemKey = `pqrsf_cliente_${cliente.id}`;
  const { docs, loading, save } = useGestionDocumentos("comercial", userId);

  const [casos, setCasos] = useState<CasoPQRSF[]>([]);
  const [form, setForm] = useState<CasoPQRSF>(casoVacio("PQRSF-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      const cargados = parseCasos(docs[itemKey] ?? "");
      setCasos(cargados);
      setForm(casoVacio(siguienteRadicado(cargados.map((c) => numeroDeRadicado(c.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizados: CasoPQRSF[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizados));
    setCasos(actualizados);
    setSaving(false);
  }

  function limpiar() {
    setForm(casoVacio(siguienteRadicado(casos.map((c) => numeroDeRadicado(c.radicado)))));
    setError(null);
  }

  function editar(c: CasoPQRSF) {
    setForm({ ...c, bitacora: c.bitacora.map((b) => ({ ...b })) });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cambiarTipo(tipo: string) {
    setForm((f) => ({ ...f, tipo, slaDias: infoTipo(tipo).slaDias }));
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setForm((f) => ({ ...f, bitacora: [...f.bitacora, eventoBitacoraVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setForm((f) => ({ ...f, bitacora: f.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!form.categoria.trim()) {
      setError("Seleccioná una categoría.");
      return;
    }
    if (!form.descripcion.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    setError(null);
    const existe = casos.some((c) => c.id === form.id);
    const actualizados = existe ? casos.map((c) => (c.id === form.id ? form : c)) : [...casos, form];
    await persistir(actualizados);
    setForm(casoVacio(siguienteRadicado(actualizados.map((c) => numeroDeRadicado(c.radicado)))));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    const actualizados = casos.filter((c) => c.id !== id);
    await persistir(actualizados);
    if (form.id === id) limpiar();
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const casosOrdenados = [...casos].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const editando = casos.some((c) => c.id === form.id);
  const tipoActual = infoTipo(form.tipo);

  return (
    <div className="space-y-4">
      {/* Formulario permanente */}
      <Seccion icono="🗳️" titulo="Sistema PQRSF">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">
              {editando ? `Editando caso ${form.radicado}.` : `Nuevo caso para ${cliente.razonSocial}.`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1A1A1A] bg-[#F5A623]/10 px-2.5 py-1 rounded-lg">{form.radicado}</span>
              {editando && <BadgeSLA caso={form} />}
            </div>
          </div>

          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Caso guardado</div>}

          <div>
            <SubHeader icono="🏷️" titulo="Tipo de caso" />
            <div className="grid grid-cols-5 gap-2">
              {TIPOS_PQRSF.map((t) => {
                const activo = form.tipo === t.tipo;
                return (
                  <button
                    key={t.tipo}
                    type="button"
                    onClick={() => cambiarTipo(t.tipo)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center transition-colors ${
                      activo ? "text-white border-transparent" : "bg-[#FAFAFA] text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                    style={activo ? { backgroundColor: t.color } : {}}
                  >
                    <span className="text-lg leading-none">{t.icono}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{t.letra}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{tipoActual.descripcion}</p>
          </div>

          <div>
            <SubHeader icono="🗓️" titulo="Datos del caso" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Categoría</label>
                <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className={inputClass}>
                  <option value="">Seleccioná</option>
                  {CATEGORIAS_PQRSF.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Prioridad</label>
                <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))} className={inputClass}>
                  {PRIORIDADES_PQRSF.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Canal de ingreso</label>
                <select value={form.canal} onChange={(e) => setForm((f) => ({ ...f, canal: e.target.value }))} className={inputClass}>
                  {CANALES_PQRSF.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha de recepción</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Responsable asignado</label>
                <input value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Plazo de respuesta (días)</label>
                <input type="number" min={0} value={form.slaDias} onChange={(e) => setForm((f) => ({ ...f, slaDias: Number(e.target.value) }))} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}><span className="text-red-500">*</span> Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
          </div>

          <div>
            <SubHeader icono="📍" titulo="Estado del caso" />
            <div className="flex flex-wrap gap-2">
              {ESTADOS_PQRSF.map((e) => {
                const activo = form.estado === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, estado: e }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      activo ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                    style={activo ? { backgroundColor: colorEstado(e) } : {}}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SubHeader icono="🧭" titulo="Bitácora de seguimiento" />
            {form.bitacora.length > 0 ? (
              <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                {[...form.bitacora].reverse().map((b) => (
                  <div key={b.id} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
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
                <button type="button" onClick={agregarNota} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410] whitespace-nowrap">
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <div>
            <SubHeader icono="✅" titulo="Resolución y cierre" />
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>Fecha de cierre</label>
                <input type="date" value={form.fechaCierre} onChange={(e) => setForm((f) => ({ ...f, fechaCierre: e.target.value }))} className={inputClass} />
              </div>
              <div className="flex items-end">
                <div className="bg-[#FAFAFA] rounded-lg p-2.5 border border-gray-100 w-full">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400 mb-1">Satisfacción con la resolución</p>
                  <Estrellas valor={form.satisfaccionResolucion} onChange={(v) => setForm((f) => ({ ...f, satisfaccionResolucion: v }))} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Resolución final</label>
                <textarea value={form.resolucion} onChange={(e) => setForm((f) => ({ ...f, resolucion: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
            <p className="text-[11px] text-gray-400">{diasTranscurridos(form)} día(s) transcurridos desde la recepción.</p>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-3">
              <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                {saving ? "Guardando..." : editando ? "Guardar cambios" : "Registrar caso"}
              </button>
              <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                Limpiar
              </button>
            </div>
            {editando && (
              <button onClick={() => eliminar(form.id)} className="text-xs text-red-400 hover:text-red-600">
                Eliminar este caso
              </button>
            )}
          </div>
        </div>
      </Seccion>

      {/* Historial */}
      <Seccion icono="🗂️" titulo="Casos Registrados">
        {casosOrdenados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no se registró ningún caso PQRSF para este cliente.</p>
        ) : (
          <div className="space-y-2.5">
            {casosOrdenados.map((c) => {
              const t = infoTipo(c.tipo);
              return (
                <button
                  key={c.id}
                  onClick={() => editar(c)}
                  className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 text-white font-bold" style={{ backgroundColor: t.color }}>
                        {t.letra}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {c.radicado} · {c.tipo}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{c.descripcion || "—"}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{fechaLegible(c.fecha)} · {c.categoria || "Sin categoría"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorPrioridad(c.prioridad) }}>
                        {c.prioridad}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorEstado(c.estado) }}>
                        {c.estado}
                      </span>
                      <BadgeSLA caso={c} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Seccion>
    </div>
  );
}
