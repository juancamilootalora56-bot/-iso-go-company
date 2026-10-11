"use client";

import { useEffect, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Cliente } from "@/lib/clientes";
import {
  parseEncuestas,
  encuestaVacia,
  preguntaVacia,
  resultadoEncuesta,
  nivelSatisfaccion,
  colorNivelSatisfaccion,
  claseNPS,
  colorNPS,
  CATEGORIAS_SATISFACCION,
  CANALES_ENCUESTA,
  type EncuestaSatisfaccion,
} from "@/lib/satisfaccionCliente";

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

function Estrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg leading-none ${n <= valor ? "text-[#F5A623]" : "text-gray-200"}`}
        >
          ★
        </button>
      ))}
      {valor > 0 && <span className="text-xs text-gray-400 ml-1">{valor}/5</span>}
    </div>
  );
}

function PreguntaRow({
  texto,
  valor,
  onChange,
  onQuitar,
}: {
  texto: string;
  valor: number;
  onChange: (v: number) => void;
  onQuitar?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3 flex-wrap">
      <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5 min-w-0">
        {texto}
        {onQuitar && (
          <button type="button" onClick={onQuitar} className="text-gray-300 hover:text-red-500 text-xs flex-shrink-0">✕</button>
        )}
      </p>
      <Estrellas valor={valor} onChange={onChange} />
    </div>
  );
}

function SelectorNPS({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: 11 }, (_, n) => n).map((n) => {
        const activo = valor === n;
        const color = n >= 9 ? "#22C55E" : n >= 7 ? "#F5A623" : "#EF4444";
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
              activo ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-300 bg-white"
            }`}
            style={activo ? { backgroundColor: color } : {}}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export default function EncuestaSatisfaccionForm({ userId, cliente }: { userId: string | null; cliente: Cliente }) {
  const itemKey = `satisfaccion_cliente_${cliente.id}`;
  const { docs, loading, save } = useGestionDocumentos("comercial", userId);

  const [encuestas, setEncuestas] = useState<EncuestaSatisfaccion[]>([]);
  const [form, setForm] = useState<EncuestaSatisfaccion>(encuestaVacia());
  const [viendo, setViendo] = useState<EncuestaSatisfaccion | null>(null);
  const [nombrePreguntaNueva, setNombrePreguntaNueva] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading) setEncuestas(parseEncuestas(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizadas: EncuestaSatisfaccion[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizadas));
    setEncuestas(actualizadas);
    setSaving(false);
  }

  function limpiar() {
    setForm(encuestaVacia());
    setError(null);
  }

  function editar(e: EncuestaSatisfaccion) {
    setViendo(null);
    setForm({ ...e, preguntas: e.preguntas.map((p) => ({ ...p })) });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setCalificacionPregunta(id: string, calificacion: number) {
    setForm((f) => ({ ...f, preguntas: f.preguntas.map((p) => (p.id === id ? { ...p, calificacion } : p)) }));
  }

  function agregarPreguntaLibre() {
    if (!nombrePreguntaNueva.trim()) return;
    setForm((f) => ({ ...f, preguntas: [...f.preguntas, preguntaVacia("Otros aspectos", nombrePreguntaNueva.trim(), true)] }));
    setNombrePreguntaNueva("");
  }

  function quitarPregunta(id: string) {
    setForm((f) => ({ ...f, preguntas: f.preguntas.filter((p) => p.id !== id) }));
  }

  async function guardar() {
    if (!form.fecha) {
      setError("La fecha de la encuesta es obligatoria.");
      return;
    }
    if (!form.periodo.trim()) {
      setError('El período es obligatorio (ej: "1er Semestre 2026"), para agruparla con las de otros clientes.');
      return;
    }
    setError(null);
    const existe = encuestas.some((e) => e.id === form.id);
    const actualizadas = existe ? encuestas.map((e) => (e.id === form.id ? form : e)) : [...encuestas, form];
    await persistir(actualizadas);
    setForm(encuestaVacia());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    await persistir(encuestas.filter((e) => e.id !== id));
    if (form.id === id) limpiar();
    if (viendo?.id === id) setViendo(null);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const encuestasOrdenadas = [...encuestas].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const preguntasLibres = form.preguntas.filter((p) => p.personalizada);
  const resultadoForm = resultadoEncuesta(form);
  const editando = encuestas.some((e) => e.id === form.id);

  return (
    <div className="space-y-4">
      {/* Formulario permanente */}
      <Seccion icono="😊" titulo="Encuesta de Satisfacción del Cliente">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">
              {editando ? `Editando encuesta del ${fechaLegible(form.fecha)}.` : `Nueva encuesta para ${cliente.razonSocial}.`}
            </p>
            {editando && (
              <button onClick={limpiar} className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410] whitespace-nowrap">
                + Nueva encuesta en blanco
              </button>
            )}
          </div>

          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Encuesta guardada</div>}

          <div>
            <SubHeader icono="🗓️" titulo="Datos de la encuesta" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  <span className="text-red-500">*</span> Período
                </label>
                <input
                  value={form.periodo}
                  onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value }))}
                  placeholder="Ej: 1er Semestre 2026"
                  className={inputClass}
                  list="periodos-satisfaccion"
                />
                <datalist id="periodos-satisfaccion">
                  <option value={`1er Semestre ${new Date().getFullYear()}`} />
                  <option value={`2do Semestre ${new Date().getFullYear()}`} />
                  <option value={`Evaluación Anual ${new Date().getFullYear()}`} />
                </datalist>
                <p className="text-[11px] text-gray-400 mt-1">
                  Las encuestas con el mismo período se agrupan con las de otros clientes en la matriz general de satisfacción.
                </p>
              </div>
              <div>
                <label className={labelClass}><span className="text-red-500">*</span> Fecha</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Canal de la encuesta</label>
                <select value={form.canal} onChange={(e) => setForm((f) => ({ ...f, canal: e.target.value }))} className={inputClass}>
                  {CANALES_ENCUESTA.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nombre del encuestado</label>
                <input value={form.encuestadoNombre} onChange={(e) => setForm((f) => ({ ...f, encuestadoNombre: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cargo del encuestado</label>
                <input value={form.encuestadoCargo} onChange={(e) => setForm((f) => ({ ...f, encuestadoCargo: e.target.value }))} className={inputClass} />
              </div>
            </div>
          </div>

          {CATEGORIAS_SATISFACCION.map((cat) => (
            <div key={cat.categoria}>
              <SubHeader icono={cat.icono} titulo={cat.categoria} />
              <div className="space-y-2">
                {form.preguntas.filter((p) => p.categoria === cat.categoria).map((p) => (
                  <PreguntaRow key={p.id} texto={p.texto} valor={p.calificacion} onChange={(v) => setCalificacionPregunta(p.id, v)} />
                ))}
              </div>
            </div>
          ))}

          <div>
            <SubHeader icono="➕" titulo="Otros aspectos a evaluar (opcional)" />
            <p className="text-[11px] text-gray-500 mb-3">
              Agregá preguntas propias si necesitás evaluar algo adicional y específico de este cliente.
            </p>
            {preguntasLibres.length > 0 && (
              <div className="space-y-2 mb-3">
                {preguntasLibres.map((p) => (
                  <PreguntaRow key={p.id} texto={p.texto} valor={p.calificacion} onChange={(v) => setCalificacionPregunta(p.id, v)} onQuitar={() => quitarPregunta(p.id)} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={nombrePreguntaNueva}
                onChange={(e) => setNombrePreguntaNueva(e.target.value)}
                placeholder="Nueva pregunta"
                className={inputClass}
              />
              <button onClick={agregarPreguntaLibre} className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410]">
                + Agregar
              </button>
            </div>
          </div>

          <div>
            <SubHeader icono="🌟" titulo="Satisfacción general" />
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3 flex-wrap">
                <p className="text-sm font-semibold text-[#1A1A1A]">Satisfacción general con la empresa</p>
                <Estrellas valor={form.satisfaccionGeneral} onChange={(v) => setForm((f) => ({ ...f, satisfaccionGeneral: v }))} />
              </div>
              <div className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3 flex-wrap">
                <p className="text-sm font-semibold text-[#1A1A1A]">Probabilidad de volver a contratar/comprar</p>
                <Estrellas valor={form.probabilidadRecompra} onChange={(v) => setForm((f) => ({ ...f, probabilidadRecompra: v }))} />
              </div>
            </div>
          </div>

          <div>
            <SubHeader icono="📈" titulo="Net Promoter Score (NPS)" />
            <p className="text-[11px] text-gray-500 mb-3">
              Del 0 al 10, ¿qué tan probable es que nos recomiende a otra empresa? (0 = Nada probable, 10 = Muy probable)
            </p>
            <SelectorNPS valor={form.nps} onChange={(v) => setForm((f) => ({ ...f, nps: v }))} />
            {form.nps >= 0 && (
              <span
                className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: colorNPS(claseNPS(form.nps)) }}
              >
                {claseNPS(form.nps)}
              </span>
            )}
          </div>

          {/* Resultado en vivo */}
          <div className="bg-[#1A1A1A] rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Índice de satisfacción</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {resultadoForm.calificadas}/{resultadoForm.total} preguntas calificadas
              </p>
            </div>
            <span
              className="text-lg font-extrabold px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: colorNivelSatisfaccion(nivelSatisfaccion(resultadoForm.porcentaje)),
                color: "#fff",
              }}
            >
              {resultadoForm.porcentaje.toFixed(1)}%
            </span>
          </div>

          <div>
            <SubHeader icono="📝" titulo="Preguntas abiertas" />
            <div className="space-y-2.5">
              <div>
                <label className={labelClass}>¿Qué aspectos destacaría de nuestro servicio?</label>
                <textarea value={form.fortalezas} onChange={(e) => setForm((f) => ({ ...f, fortalezas: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>¿Qué podríamos mejorar?</label>
                <textarea value={form.mejoras} onChange={(e) => setForm((f) => ({ ...f, mejoras: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Comentarios adicionales</label>
                <textarea value={form.comentarios} onChange={(e) => setForm((f) => ({ ...f, comentarios: e.target.value }))} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-3">
              <button onClick={guardar} disabled={saving} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 text-sm">
                {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar encuesta"}
              </button>
              <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                Limpiar
              </button>
            </div>
            {editando && (
              <button onClick={() => eliminar(form.id)} className="text-xs text-red-400 hover:text-red-600">
                Eliminar esta encuesta
              </button>
            )}
          </div>
        </div>
      </Seccion>

      {/* Historial */}
      <Seccion icono="🗂️" titulo="Historial de Encuestas">
        {encuestasOrdenadas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Todavía no se registró ninguna encuesta.</p>
        ) : (
          <div className="space-y-2.5">
            {encuestasOrdenadas.map((e) => {
              const r = resultadoEncuesta(e);
              const nivel = nivelSatisfaccion(r.porcentaje);
              return (
                <button
                  key={e.id}
                  onClick={() => setViendo(e)}
                  className="w-full text-left bg-[#FAFAFA] rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {fechaLegible(e.fecha)} · {e.canal}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        <span className="text-[#F5A623] font-semibold">{e.periodo}</span>
                        {e.encuestadoNombre && <> · {e.encuestadoNombre}</>}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: colorNivelSatisfaccion(nivel) }}
                    >
                      {nivel} · {r.porcentaje.toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Seccion>

      {/* Informe de lectura */}
      {viendo && (() => {
        const r = resultadoEncuesta(viendo);
        const nivel = nivelSatisfaccion(r.porcentaje);
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
                    {viendo.periodo}
                  </span>
                  <h2 className="text-white text-xl font-extrabold">{fechaLegible(viendo.fecha)}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {viendo.canal}
                    {viendo.encuestadoNombre && <> · {viendo.encuestadoNombre}</>}
                    {viendo.encuestadoCargo && <> ({viendo.encuestadoCargo})</>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1.5">
                  <div
                    className="text-2xl font-extrabold px-4 py-2 rounded-xl"
                    style={{ backgroundColor: colorNivelSatisfaccion(nivel), color: "#fff" }}
                  >
                    {r.porcentaje.toFixed(1)}%
                  </div>
                  <p className="text-gray-400 text-[11px] uppercase tracking-wide font-bold">{nivel}</p>
                  {viendo.nps >= 0 && (
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: colorNPS(claseNPS(viendo.nps)) }}
                    >
                      NPS {viendo.nps} · {claseNPS(viendo.nps)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {CATEGORIAS_SATISFACCION.map((cat) => {
                const preguntas = viendo.preguntas.filter((p) => p.categoria === cat.categoria);
                if (preguntas.length === 0) return null;
                return (
                  <div key={cat.categoria}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat.icono} {cat.categoria}</h3>
                    <div className="space-y-2">
                      {preguntas.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3">
                          <p className="text-sm font-semibold text-[#1A1A1A]">{p.texto}</p>
                          <span className="text-sm font-bold text-[#F5A623] flex-shrink-0">
                            {p.calificacion > 0 ? `${"★".repeat(p.calificacion)}${"☆".repeat(5 - p.calificacion)}` : "Sin calificar"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {viendo.preguntas.some((p) => p.personalizada) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">➕ Otros aspectos</h3>
                  <div className="space-y-2">
                    {viendo.preguntas.filter((p) => p.personalizada).map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg p-3">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{p.texto}</p>
                        <span className="text-sm font-bold text-[#F5A623] flex-shrink-0">
                          {p.calificacion > 0 ? `${"★".repeat(p.calificacion)}${"☆".repeat(5 - p.calificacion)}` : "Sin calificar"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Satisfacción general</p>
                  <p className="text-sm font-bold text-[#F5A623] mt-1">
                    {viendo.satisfaccionGeneral > 0 ? `${"★".repeat(viendo.satisfaccionGeneral)}${"☆".repeat(5 - viendo.satisfaccionGeneral)}` : "Sin calificar"}
                  </p>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Probabilidad de recompra</p>
                  <p className="text-sm font-bold text-[#F5A623] mt-1">
                    {viendo.probabilidadRecompra > 0 ? `${"★".repeat(viendo.probabilidadRecompra)}${"☆".repeat(5 - viendo.probabilidadRecompra)}` : "Sin calificar"}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-1 gap-3">
                {viendo.fortalezas && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Aspectos destacados</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendo.fortalezas}</p>
                  </div>
                )}
                {viendo.mejoras && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Aspectos a mejorar</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendo.mejoras}</p>
                  </div>
                )}
                {viendo.comentarios && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Comentarios adicionales</p>
                    <p className="text-sm text-[#1A1A1A] mt-1 whitespace-pre-wrap">{viendo.comentarios}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => editar(viendo)} className="text-sm font-semibold text-[#F5A623] hover:text-[#e09410]">
                ✎ Editar encuesta
              </button>
              <button onClick={() => setViendo(null)} className="text-sm text-gray-400 hover:text-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
