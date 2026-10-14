"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import {
  parseLeccionesAprendidas,
  leccionAprendidaVacia,
  eventoLAVacio,
  siguienteRadicadoLA,
  numeroDeRadicadoLA,
  colorTipoLA,
  iconoTipoLA,
  colorEstadoDifusionLA,
  tasaIncorporacionLA,
  TIPOS_LA,
  CATEGORIAS_LA,
  FUENTES_LA,
  ESTADOS_DIFUSION_LA,
  type LeccionAprendida,
  type EventoLA,
} from "@/lib/leccionesAprendidas";

const ITEM_KEY = "lecciones_aprendidas_lista";
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

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fechaHoraLegible(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function LeccionesAprendidasPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const evidFileInputRef = useRef<HTMLInputElement>(null);

  const [lecciones, setLecciones] = useState<LeccionAprendida[]>([]);
  const [leccion, setLeccion] = useState<LeccionAprendida>(leccionAprendidaVacia("LA-0001"));
  const [notaNueva, setNotaNueva] = useState("");
  const [autorNota, setAutorNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    if (!loading) {
      const cargadas = parseLeccionesAprendidas(docs[ITEM_KEY] ?? "");
      setLecciones(cargadas);
      setLeccion(leccionAprendidaVacia(siguienteRadicadoLA(cargadas.map((l) => numeroDeRadicadoLA(l.radicado)))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const editando = lecciones.some((l) => l.id === leccion.id);
  const tasaIncorporacion = tasaIncorporacionLA(lecciones);
  const exitos = lecciones.filter((l) => l.tipo === "Éxito a replicar").length;
  const errores = lecciones.filter((l) => l.tipo === "Error a evitar").length;

  const filtradas = lecciones.filter((l) => (filtroTipo ? l.tipo === filtroTipo : true));

  function campo<K extends keyof LeccionAprendida>(key: K, value: LeccionAprendida[K]) {
    setLeccion((l) => ({ ...l, [key]: value }));
  }

  function limpiar() {
    setLeccion(leccionAprendidaVacia(siguienteRadicadoLA(lecciones.map((l) => numeroDeRadicadoLA(l.radicado)))));
    setError(null);
    if (evidFileInputRef.current) evidFileInputRef.current.value = "";
  }

  function editar(l: LeccionAprendida) {
    setLeccion({ ...l, bitacora: l.bitacora.map((b) => ({ ...b })) });
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
    reader.onload = () => setLeccion((l) => ({ ...l, evidencia: reader.result as string, evidenciaNombre: file.name }));
    reader.readAsDataURL(file);
  }

  function agregarNota() {
    if (!notaNueva.trim()) return;
    setLeccion((l) => ({ ...l, bitacora: [...l.bitacora, eventoLAVacio(notaNueva.trim(), autorNota.trim() || "Sin especificar")] }));
    setNotaNueva("");
  }

  function quitarNota(id: string) {
    setLeccion((l) => ({ ...l, bitacora: l.bitacora.filter((b) => b.id !== id) }));
  }

  async function guardar() {
    if (!leccion.titulo.trim() || !leccion.leccion.trim()) {
      setError("Título y la lección aprendida en sí son obligatorios.");
      return;
    }
    setError(null);
    setSaving(true);
    const actualizadas = [...lecciones.filter((l) => l.id !== leccion.id), leccion];
    await save(ITEM_KEY, JSON.stringify(actualizadas));
    setLecciones(actualizadas);
    limpiar();
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function eliminar(id: string) {
    setSaving(true);
    const restantes = lecciones.filter((l) => l.id !== id);
    await save(ITEM_KEY, JSON.stringify(restantes));
    setLecciones(restantes);
    if (leccion.id === id) limpiar();
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Gestión de Calidad
        </Link>
        <Link href={`${basePath}/lecciones_aprendidas/biblioteca`} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F97316]/50">
          📚 Ver biblioteca de conocimiento →
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Lecciones Aprendidas</h1>
        <p className="text-gray-500 text-sm mt-1">Conocimiento organizacional capturado de la experiencia — ISO 9001, cláusula 7.1.6.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">🧠</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{lecciones.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Lecciones registradas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">✅</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{exitos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Éxitos a replicar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xl mb-1">⚠️</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{errores}</p>
          <p className="text-xs text-gray-500 mt-0.5">Errores a evitar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-lg font-bold" style={{ color: tasaIncorporacion === null ? "#9CA3AF" : tasaIncorporacion >= 60 ? "#22C55E" : tasaIncorporacion >= 30 ? "#F5A623" : "#EF4444" }}>
            {tasaIncorporacion !== null ? `${tasaIncorporacion}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Incorporadas al SGC</p>
        </div>
      </div>

      <Seccion icono="🧠" titulo={editando ? `Editando ${leccion.radicado}` : `Nueva lección · ${leccion.radicado}`}>
        <div className="space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">✓ Lección guardada</div>}

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Título</label>
            <input value={leccion.titulo} onChange={(e) => campo("titulo", e.target.value)} className={inputClass} placeholder="Ej: Validar stock de insumos antes de confirmar fecha de entrega" />
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={leccion.tipo} onChange={(e) => campo("tipo", e.target.value)} className={inputClass}>
                {TIPOS_LA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={leccion.categoria} onChange={(e) => campo("categoria", e.target.value)} className={inputClass}>
                {CATEGORIAS_LA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fuente</label>
              <select value={leccion.fuente} onChange={(e) => campo("fuente", e.target.value)} className={inputClass}>
                {FUENTES_LA.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>Proceso / área</label>
              <input value={leccion.procesoArea} onChange={(e) => campo("procesoArea", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={leccion.fecha} onChange={(e) => campo("fecha", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Registrado por</label>
              <input value={leccion.registradoPor} onChange={(e) => campo("registradoPor", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contexto (qué pasó)</label>
            <textarea value={leccion.contexto} onChange={(e) => campo("contexto", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}>Causa raíz</label>
            <textarea value={leccion.causaRaiz} onChange={(e) => campo("causaRaiz", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}><span className="text-red-500">*</span> Lección aprendida</label>
            <textarea
              value={leccion.leccion}
              onChange={(e) => campo("leccion", e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="Redactada como conocimiento reutilizable: 'Cuando ocurra X, hacer/evitar Y porque...'"
            />
          </div>

          <div>
            <label className={labelClass}>Recomendaciones</label>
            <textarea value={leccion.recomendaciones} onChange={(e) => campo("recomendaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}>Aplicabilidad (a qué procesos/proyectos futuros aplica)</label>
            <input value={leccion.aplicabilidad} onChange={(e) => campo("aplicabilidad", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Estado de difusión</label>
            <select value={leccion.estadoDifusion} onChange={(e) => campo("estadoDifusion", e.target.value)} className={inputClass}>
              {ESTADOS_DIFUSION_LA.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Archivo de evidencia</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => evidFileInputRef.current?.click()} className="text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-[#F97316]/50">
                📎 {leccion.evidenciaNombre ? "Cambiar archivo" : "Adjuntar archivo"}
              </button>
              {leccion.evidenciaNombre && <p className="text-xs text-gray-500 truncate">{leccion.evidenciaNombre}</p>}
            </div>
            <input ref={evidFileInputRef} type="file" accept="image/*,.pdf" onChange={handleEvidencia} className="hidden" />
          </div>

          {/* Bitácora */}
          <div>
            <SubHeader icono="🧾" titulo="Bitácora de Seguimiento" />
            {leccion.bitacora.length > 0 ? (
              <div className="space-y-0 mb-3 border-l-2 border-gray-100 ml-1.5 pl-4">
                {[...leccion.bitacora].reverse().map((b: EventoLA) => (
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
            <textarea value={leccion.observaciones} onChange={(e) => campo("observaciones", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={guardar} disabled={saving} className="text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 text-sm" style={{ backgroundColor: NARANJA }}>
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Guardar lección"}
            </button>
            <button onClick={limpiar} className="text-sm text-gray-400 hover:text-gray-600 bg-white px-3 py-2.5 rounded-lg border border-gray-100">
              {editando ? "Nueva lección en blanco" : "Limpiar"}
            </button>
          </div>
        </div>
      </Seccion>

      {/* Registro */}
      <Seccion icono="🗂️" titulo="Registro de Lecciones">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltroTipo("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroTipo === "" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"}`}
          >
            Todos los tipos
          </button>
          {TIPOS_LA.map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(filtroTipo === t ? "" : t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filtroTipo === t ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
              style={filtroTipo === t ? { backgroundColor: colorTipoLA(t) } : {}}
            >
              {iconoTipoLA(t)} {t}
            </button>
          ))}
        </div>

        {filtradas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay lecciones que coincidan con el filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[880px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2.5 font-semibold border-b border-gray-100">Radicado</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Título</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Categoría</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Difusión</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100">Fecha</th>
                  <th className="p-2.5 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]">
                    <td className="p-2.5 font-mono font-semibold text-[#1A1A1A] whitespace-nowrap">{l.radicado}</td>
                    <td className="p-2.5 text-gray-600 max-w-[220px] truncate">{l.titulo}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoLA(l.tipo) }}>
                        {iconoTipoLA(l.tipo)} {l.tipo}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{l.categoria}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoDifusionLA(l.estadoDifusion) }}>
                        {l.estadoDifusion}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{fechaCorta(l.fecha)}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => editar(l)} className="font-semibold mr-2" style={{ color: NARANJA }}>Editar</button>
                      <button onClick={() => eliminar(l.id)} className="text-gray-300 hover:text-red-500">Eliminar</button>
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
