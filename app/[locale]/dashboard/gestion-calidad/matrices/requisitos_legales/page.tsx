"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseRequisitosLegales,
  requisitoVacio,
  renumerar,
  resumenPorNivel,
  porcentajeCumplimiento,
  vencenEn30Dias,
  CATEGORIAS_LEGALES,
  AMBITOS_LEGALES,
  TIPOS_NORMA,
  PERIODICIDADES_VERIFICACION,
  NIVELES_CUMPLIMIENTO,
  colorNivelCumplimiento,
  type RequisitoLegal,
} from "@/lib/requisitosLegales";
import { parseLista } from "@/lib/mapaProcesos";

const ITEM_KEY = "matriz_requisitos_legales";
const NARANJA = "#F97316";

const celdaInput =
  "w-full bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] rounded px-1.5 py-1 text-xs text-[#1A1A1A] placeholder-gray-300";
const celdaTextarea = celdaInput + " resize-none";
const th = "text-[10px] font-bold uppercase tracking-wide text-gray-500 px-2 py-2.5 text-left whitespace-nowrap border-b border-gray-200 bg-[#FAFAFA]";

export default function MatrizRequisitosLegalesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const guardados = useMemo(() => parseRequisitosLegales(docs[ITEM_KEY] ?? ""), [docs]);
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);

  const [requisitos, setRequisitos] = useState<RequisitoLegal[] | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const actuales = requisitos ?? guardados;

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filtrados = actuales.filter((r) => (!filtroCategoria || r.categoria === filtroCategoria) && (!filtroNivel || r.nivelCumplimiento === filtroNivel));

  const resumen = resumenPorNivel(actuales);
  const cumplimiento = porcentajeCumplimiento(actuales);
  const porVencer = vencenEn30Dias(actuales);

  function actualizarFila(id: string, cambios: Partial<RequisitoLegal>) {
    setRequisitos(actuales.map((r) => (r.id === id ? { ...r, ...cambios } : r)));
    setGuardado(false);
  }

  function agregarFila() {
    setRequisitos([...actuales, requisitoVacio(actuales.length + 1)]);
    setGuardado(false);
  }

  function eliminarFila(id: string) {
    if (!confirm("¿Eliminar esta fila de la matriz?")) return;
    setRequisitos(renumerar(actuales.filter((r) => r.id !== id)));
    setGuardado(false);
  }

  async function guardarTodo() {
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(actuales));
    setRequisitos(null);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="space-y-4 pb-16">
      <Link href={`${basePath}/matrices`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Matrices
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Requisitos Legales</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Identificación y seguimiento del cumplimiento de la normatividad legal y reglamentaria aplicable a la
            organización (ISO 9001, cl. 4.2 y 8.2.2). Editá directamente sobre la tabla, como en una hoja de cálculo.
          </p>
        </div>
      </div>

      {actuales.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{actuales.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">requisitos</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold" style={{ color: cumplimiento >= 80 ? "#22C55E" : cumplimiento >= 50 ? "#F5A623" : "#EF4444" }}>
              {cumplimiento}%
            </span>
            <span className="text-xs text-gray-500 ml-1.5">cumplimiento global</span>
          </div>
          {resumen.map((r) => (
            <div key={r.nivel} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-bold text-[#1A1A1A]">{r.cantidad}</span>
              <span className="text-xs text-gray-500">{r.nivel}</span>
            </div>
          ))}
          {porVencer.length > 0 && (
            <div className="bg-[#FFF6E5] border border-[#F5A623]/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: NARANJA }}>⏰ {porVencer.length}</span>
              <span className="text-xs text-gray-600">por verificar en 30 días</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
          <option value="">Todas las categorías</option>
          {CATEGORIAS_LEGALES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
          <option value="">Todos los niveles</option>
          {NIVELES_CUMPLIMIENTO.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {(filtroCategoria || filtroNivel) && (
          <button
            onClick={() => {
              setFiltroCategoria("");
              setFiltroNivel("");
            }}
            className="text-xs text-gray-400 hover:text-[#1A1A1A]"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className={th + " sticky left-0 z-10 bg-[#FAFAFA]"} style={{ minWidth: 40 }}>N°</th>
              <th className={th} style={{ minWidth: 170 }}>Categoría</th>
              <th className={th} style={{ minWidth: 140 }}>Ámbito</th>
              <th className={th} style={{ minWidth: 150 }}>Tipo de norma</th>
              <th className={th} style={{ minWidth: 180 }}>Norma</th>
              <th className={th} style={{ minWidth: 160 }}>Entidad emisora</th>
              <th className={th} style={{ minWidth: 120 }}>Fecha expedición</th>
              <th className={th} style={{ minWidth: 150 }}>Artículo / requisito específico</th>
              <th className={th} style={{ minWidth: 240 }}>Descripción del requisito</th>
              <th className={th} style={{ minWidth: 170 }}>Proceso al que aplica</th>
              <th className={th} style={{ minWidth: 240 }}>Cómo se cumple (evidencia)</th>
              <th className={th} style={{ minWidth: 150 }}>Nivel de cumplimiento</th>
              <th className={th} style={{ minWidth: 140 }}>Responsable</th>
              <th className={th} style={{ minWidth: 150 }}>Periodicidad verificación</th>
              <th className={th} style={{ minWidth: 130 }}>Última verificación</th>
              <th className={th} style={{ minWidth: 130 }}>Próxima verificación</th>
              <th className={th} style={{ minWidth: 200 }}>Observaciones</th>
              <th className={th} style={{ minWidth: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={18} className="text-center text-sm text-gray-400 py-10">
                  {actuales.length === 0 ? "Todavía no hay requisitos cargados en la matriz." : "Ningún requisito coincide con los filtros."}
                </td>
              </tr>
            ) : (
              filtrados.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]/60 align-top">
                  <td className="sticky left-0 bg-white text-center text-xs font-bold text-gray-400 py-1.5 border-r border-gray-50">{r.numero}</td>
                  <td>
                    <select value={r.categoria} onChange={(e) => actualizarFila(r.id, { categoria: e.target.value })} className={celdaInput}>
                      <option value="">—</option>
                      {CATEGORIAS_LEGALES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={r.ambito} onChange={(e) => actualizarFila(r.id, { ambito: e.target.value })} className={celdaInput}>
                      {AMBITOS_LEGALES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={r.tipoNorma} onChange={(e) => actualizarFila(r.id, { tipoNorma: e.target.value })} className={celdaInput}>
                      <option value="">—</option>
                      {TIPOS_NORMA.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={r.norma} onChange={(e) => actualizarFila(r.id, { norma: e.target.value })} placeholder="Ej: Ley 1581 de 2012" className={celdaInput} />
                  </td>
                  <td>
                    <input value={r.entidadEmisora} onChange={(e) => actualizarFila(r.id, { entidadEmisora: e.target.value })} placeholder="Ej: Congreso de la República" className={celdaInput} />
                  </td>
                  <td>
                    <input type="date" value={r.fechaExpedicion} onChange={(e) => actualizarFila(r.id, { fechaExpedicion: e.target.value })} className={celdaInput} />
                  </td>
                  <td>
                    <textarea rows={2} value={r.articuloRequisito} onChange={(e) => actualizarFila(r.id, { articuloRequisito: e.target.value })} placeholder="Ej: Art. 17" className={celdaTextarea} />
                  </td>
                  <td>
                    <textarea rows={2} value={r.descripcionRequisito} onChange={(e) => actualizarFila(r.id, { descripcionRequisito: e.target.value })} placeholder="¿Qué exige puntualmente?" className={celdaTextarea} />
                  </td>
                  <td>
                    {procesosMapa.length > 0 ? (
                      <select value={procesosMapa.includes(r.procesoAplica) ? r.procesoAplica : ""} onChange={(e) => actualizarFila(r.id, { procesoAplica: e.target.value })} className={celdaInput}>
                        <option value="">—</option>
                        {procesosMapa.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input value={r.procesoAplica} onChange={(e) => actualizarFila(r.id, { procesoAplica: e.target.value })} placeholder="Proceso" className={celdaInput} />
                    )}
                  </td>
                  <td>
                    <textarea rows={2} value={r.comoSeCumple} onChange={(e) => actualizarFila(r.id, { comoSeCumple: e.target.value })} placeholder="Evidencia o mecanismo" className={celdaTextarea} />
                  </td>
                  <td>
                    <select
                      value={r.nivelCumplimiento}
                      onChange={(e) => actualizarFila(r.id, { nivelCumplimiento: e.target.value as RequisitoLegal["nivelCumplimiento"] })}
                      className={celdaInput + " font-semibold"}
                      style={{ color: colorNivelCumplimiento(r.nivelCumplimiento) }}
                    >
                      {NIVELES_CUMPLIMIENTO.map((n) => (
                        <option key={n} value={n} style={{ color: "#1A1A1A" }}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={r.responsable} onChange={(e) => actualizarFila(r.id, { responsable: e.target.value })} placeholder="Cargo" className={celdaInput} />
                  </td>
                  <td>
                    <select value={r.periodicidadVerificacion} onChange={(e) => actualizarFila(r.id, { periodicidadVerificacion: e.target.value })} className={celdaInput}>
                      {PERIODICIDADES_VERIFICACION.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="date" value={r.fechaUltimaVerificacion} onChange={(e) => actualizarFila(r.id, { fechaUltimaVerificacion: e.target.value })} className={celdaInput} />
                  </td>
                  <td>
                    <input type="date" value={r.fechaProximaVerificacion} onChange={(e) => actualizarFila(r.id, { fechaProximaVerificacion: e.target.value })} className={celdaInput} />
                  </td>
                  <td>
                    <textarea rows={2} value={r.observaciones} onChange={(e) => actualizarFila(r.id, { observaciones: e.target.value })} className={celdaTextarea} />
                  </td>
                  <td className="text-center">
                    <button onClick={() => eliminarFila(r.id)} className="text-red-300 hover:text-red-600 text-sm px-1">
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={agregarFila} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Agregar requisito
        </button>
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
          <button
            onClick={guardarTodo}
            disabled={guardando}
            className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar matriz"}
          </button>
        </div>
      </div>
    </div>
  );
}
