"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseCompetencias,
  competenciaVacia,
  renumerar,
  resumenPorBrecha,
  porcentajeCobertura,
  agruparPorColaborador,
  calcularBrecha,
  colorBrecha,
  TIPOS_COMPETENCIA,
  NIVELES_COMPETENCIA,
  NIVELES_ACTUAL,
  type CompetenciaItem,
} from "@/lib/competencias";
import { parseNodos } from "@/lib/estructuraOrganizacional";

const ITEM_KEY = "matriz_competencias";
const NARANJA = "#F97316";

const celdaInput =
  "w-full bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] rounded px-1.5 py-1 text-xs text-[#1A1A1A] placeholder-gray-300";
const celdaTextarea = celdaInput + " resize-none";
const th = "text-[10px] font-bold uppercase tracking-wide text-gray-500 px-2 py-2.5 text-left whitespace-nowrap border-b border-gray-200 bg-[#FAFAFA]";

type Vista = "tabla" | "mapa";

export default function MatrizCompetenciasPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const guardados = useMemo(() => parseCompetencias(docs[ITEM_KEY] ?? ""), [docs]);
  const nodos = useMemo(() => parseNodos(docsGerencia["estructura_organizacional"] ?? ""), [docsGerencia]);

  const cargos = useMemo(() => Array.from(new Set(nodos.map((n) => n.cargo).filter(Boolean))), [nodos]);
  const colaboradores = useMemo(() => nodos.filter((n) => n.nombre), [nodos]);

  const [items, setItems] = useState<CompetenciaItem[] | null>(null);
  const [vista, setVista] = useState<Vista>("tabla");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroBrecha, setFiltroBrecha] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const actuales = items ?? guardados;

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const filtrados = actuales.filter(
    (c) => (!filtroCargo || c.cargo === filtroCargo) && (!filtroBrecha || calcularBrecha(c.nivelRequerido, c.nivelActual) === filtroBrecha)
  );

  const resumen = resumenPorBrecha(actuales);
  const cobertura = porcentajeCobertura(actuales);

  function actualizarFila(id: string, cambios: Partial<CompetenciaItem>) {
    setItems(actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
    setGuardado(false);
  }

  function agregarFila() {
    setItems([...actuales, competenciaVacia(actuales.length + 1)]);
    setGuardado(false);
  }

  function eliminarFila(id: string) {
    if (!confirm("¿Eliminar esta fila de la matriz?")) return;
    setItems(renumerar(actuales.filter((c) => c.id !== id)));
    setGuardado(false);
  }

  async function guardarTodo() {
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(actuales));
    setItems(null);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="space-y-4 pb-16">
      <Link href={`${basePath}/matrices`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Matrices
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Competencias</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Competencias requeridas por cargo (educación, formación, experiencia y habilidades) frente al nivel real de
          cada colaborador — la brecha se calcula sola (ISO 9001, cl. 7.2).
        </p>
      </div>

      {nodos.length === 0 && (
        <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
          Todavía no cargaste el <strong>Organigrama</strong>. Podés crear filas igual escribiendo el cargo y el
          colaborador a mano — cuando cargues el organigrama vas a poder elegirlos de una lista.
        </div>
      )}

      {actuales.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{actuales.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">competencias evaluadas</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold" style={{ color: cobertura >= 80 ? "#22C55E" : cobertura >= 50 ? "#F5A623" : "#EF4444" }}>
              {cobertura}%
            </span>
            <span className="text-xs text-gray-500 ml-1.5">cobertura (de lo evaluado)</span>
          </div>
          {resumen.map((r) => (
            <div key={r.estado} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-bold text-[#1A1A1A]">{r.cantidad}</span>
              <span className="text-xs text-gray-500">{r.estado}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
          <button
            onClick={() => setVista("tabla")}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${vista === "tabla" ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            📊 Tabla
          </button>
          <button
            onClick={() => setVista("mapa")}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${vista === "mapa" ? "bg-[#1A1A1A] text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            🗺️ Mapa de calor
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todos los cargos</option>
            {Array.from(new Set(actuales.map((c) => c.cargo).filter(Boolean))).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={filtroBrecha} onChange={(e) => setFiltroBrecha(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]">
            <option value="">Todos los estados</option>
            <option value="Cumple">Cumple</option>
            <option value="Brecha leve">Brecha leve</option>
            <option value="Brecha crítica">Brecha crítica</option>
            <option value="Pendiente evaluar">Pendiente evaluar</option>
          </select>
          {(filtroCargo || filtroBrecha) && (
            <button
              onClick={() => {
                setFiltroCargo("");
                setFiltroBrecha("");
              }}
              className="text-xs text-gray-400 hover:text-[#1A1A1A]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {vista === "tabla" ? (
        <VistaTabla
          filtrados={filtrados}
          actuales={actuales}
          cargos={cargos}
          colaboradores={colaboradores}
          onActualizar={actualizarFila}
          onEliminar={eliminarFila}
        />
      ) : (
        <VistaMapaCalor filtrados={filtrados} actuales={actuales} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={agregarFila} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
          + Agregar competencia
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

function VistaTabla({
  filtrados,
  actuales,
  cargos,
  colaboradores,
  onActualizar,
  onEliminar,
}: {
  filtrados: CompetenciaItem[];
  actuales: CompetenciaItem[];
  cargos: string[];
  colaboradores: { id: string; nombre: string; cargo: string }[];
  onActualizar: (id: string, cambios: Partial<CompetenciaItem>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className={th + " sticky left-0 z-10 bg-[#FAFAFA]"} style={{ minWidth: 40 }}>N°</th>
            <th className={th} style={{ minWidth: 160 }}>Cargo</th>
            <th className={th} style={{ minWidth: 160 }}>Colaborador</th>
            <th className={th} style={{ minWidth: 170 }}>Tipo</th>
            <th className={th} style={{ minWidth: 220 }}>Competencia / requisito</th>
            <th className={th} style={{ minWidth: 130 }}>Nivel requerido</th>
            <th className={th} style={{ minWidth: 130 }}>Nivel actual</th>
            <th className={th} style={{ minWidth: 130 }}>Brecha</th>
            <th className={th} style={{ minWidth: 200 }}>Evidencia</th>
            <th className={th} style={{ minWidth: 220 }}>Acción para cerrar brecha</th>
            <th className={th} style={{ minWidth: 150 }}>Responsable seguimiento</th>
            <th className={th} style={{ minWidth: 130 }}>Fecha evaluación</th>
            <th className={th} style={{ minWidth: 130 }}>Próxima evaluación</th>
            <th className={th} style={{ minWidth: 200 }}>Observaciones</th>
            <th className={th} style={{ minWidth: 40 }} />
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center text-sm text-gray-400 py-10">
                {actuales.length === 0 ? "Todavía no hay competencias cargadas en la matriz." : "Ninguna fila coincide con los filtros."}
              </td>
            </tr>
          ) : (
            filtrados.map((c) => {
              const brecha = calcularBrecha(c.nivelRequerido, c.nivelActual);
              const colaboradoresDelCargo = c.cargo ? colaboradores.filter((col) => col.cargo === c.cargo) : colaboradores;
              return (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FAFAFA]/60 align-top">
                  <td className="sticky left-0 bg-white text-center text-xs font-bold text-gray-400 py-1.5 border-r border-gray-50">{c.numero}</td>
                  <td>
                    {cargos.length > 0 ? (
                      <select value={cargos.includes(c.cargo) ? c.cargo : ""} onChange={(e) => onActualizar(c.id, { cargo: e.target.value, colaborador: "" })} className={celdaInput}>
                        <option value="">—</option>
                        {cargos.map((cg) => (
                          <option key={cg} value={cg}>
                            {cg}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input value={c.cargo} onChange={(e) => onActualizar(c.id, { cargo: e.target.value })} placeholder="Cargo" className={celdaInput} />
                    )}
                  </td>
                  <td>
                    {colaboradores.length > 0 ? (
                      <select value={colaboradoresDelCargo.some((col) => col.nombre === c.colaborador) ? c.colaborador : ""} onChange={(e) => onActualizar(c.id, { colaborador: e.target.value })} className={celdaInput}>
                        <option value="">—</option>
                        {colaboradoresDelCargo.map((col) => (
                          <option key={col.id} value={col.nombre}>
                            {col.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input value={c.colaborador} onChange={(e) => onActualizar(c.id, { colaborador: e.target.value })} placeholder="Colaborador" className={celdaInput} />
                    )}
                  </td>
                  <td>
                    <select value={c.tipoCompetencia} onChange={(e) => onActualizar(c.id, { tipoCompetencia: e.target.value })} className={celdaInput}>
                      <option value="">—</option>
                      {TIPOS_COMPETENCIA.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <textarea rows={2} value={c.competencia} onChange={(e) => onActualizar(c.id, { competencia: e.target.value })} placeholder="Ej: Manejo de Excel avanzado" className={celdaTextarea} />
                  </td>
                  <td>
                    <select value={c.nivelRequerido} onChange={(e) => onActualizar(c.id, { nivelRequerido: e.target.value as CompetenciaItem["nivelRequerido"] })} className={celdaInput}>
                      {NIVELES_COMPETENCIA.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={c.nivelActual} onChange={(e) => onActualizar(c.id, { nivelActual: e.target.value as CompetenciaItem["nivelActual"] })} className={celdaInput}>
                      {NIVELES_ACTUAL.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colorBrecha(brecha) }}>
                      {brecha}
                    </span>
                  </td>
                  <td>
                    <textarea rows={2} value={c.evidencia} onChange={(e) => onActualizar(c.id, { evidencia: e.target.value })} placeholder="Diploma, certificado, prueba..." className={celdaTextarea} />
                  </td>
                  <td>
                    <textarea rows={2} value={c.accionCierre} onChange={(e) => onActualizar(c.id, { accionCierre: e.target.value })} placeholder="Capacitación, mentoring..." className={celdaTextarea} />
                  </td>
                  <td>
                    <input value={c.responsableSeguimiento} onChange={(e) => onActualizar(c.id, { responsableSeguimiento: e.target.value })} placeholder="Cargo" className={celdaInput} />
                  </td>
                  <td>
                    <input type="date" value={c.fechaEvaluacion} onChange={(e) => onActualizar(c.id, { fechaEvaluacion: e.target.value })} className={celdaInput} />
                  </td>
                  <td>
                    <input type="date" value={c.fechaProximaEvaluacion} onChange={(e) => onActualizar(c.id, { fechaProximaEvaluacion: e.target.value })} className={celdaInput} />
                  </td>
                  <td>
                    <textarea rows={2} value={c.observaciones} onChange={(e) => onActualizar(c.id, { observaciones: e.target.value })} className={celdaTextarea} />
                  </td>
                  <td className="text-center">
                    <button onClick={() => onEliminar(c.id)} className="text-red-300 hover:text-red-600 text-sm px-1">
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function VistaMapaCalor({ filtrados, actuales }: { filtrados: CompetenciaItem[]; actuales: CompetenciaItem[] }) {
  if (actuales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-sm">Todavía no hay competencias cargadas. Agregá la primera para ver el mapa.</p>
      </div>
    );
  }
  if (filtrados.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-sm">Ninguna fila coincide con los filtros.</p>
      </div>
    );
  }

  const grupos = agruparPorColaborador(filtrados);

  return (
    <div className="space-y-3">
      {grupos.map((g) => {
        const brechas = g.items.map((it) => calcularBrecha(it.nivelRequerido, it.nivelActual));
        const criticas = brechas.filter((b) => b === "Brecha crítica").length;
        const leves = brechas.filter((b) => b === "Brecha leve").length;
        return (
          <div key={g.colaborador} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">{g.colaborador}</p>
                {g.cargo && <p className="text-xs text-gray-400">{g.cargo}</p>}
              </div>
              {(criticas > 0 || leves > 0) && (
                <div className="flex items-center gap-1.5">
                  {criticas > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorBrecha("Brecha crítica") }}>
                      {criticas} crítica{criticas !== 1 ? "s" : ""}
                    </span>
                  )}
                  {leves > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorBrecha("Brecha leve") }}>
                      {leves} leve{leves !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => {
                const brecha = calcularBrecha(it.nivelRequerido, it.nivelActual);
                const color = colorBrecha(brecha);
                return (
                  <div
                    key={it.id}
                    title={`Requerido: ${it.nivelRequerido} · Actual: ${it.nivelActual}`}
                    className="rounded-xl px-3 py-2 min-w-[140px]"
                    style={{ backgroundColor: `${color}14`, border: `1px solid ${color}40` }}
                  >
                    <p className="text-[11px] font-semibold text-[#1A1A1A] truncate max-w-[180px]">{it.competencia || "Sin nombre"}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-[9px] text-gray-400">{it.nivelActual === "No evaluado" ? "Sin evaluar" : `${it.nivelActual} / ${it.nivelRequerido}`}</span>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
