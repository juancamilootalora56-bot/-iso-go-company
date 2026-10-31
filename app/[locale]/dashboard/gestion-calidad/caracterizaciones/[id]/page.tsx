"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import EncabezadoDocumento from "@/components/dashboard/EncabezadoDocumento";
import {
  parseCaracterizaciones,
  itemVacio,
  indicadorVacio,
  completitud,
  FRECUENCIAS_INDICADOR,
  type CaracterizacionProceso,
  type ItemLista,
  type IndicadorProceso,
} from "@/lib/caracterizacionProcesos";
import { parseProcedimientos } from "@/lib/procedimientos";
import { parseRequisitosLegales } from "@/lib/requisitosLegales";

const ITEM_KEY = "caracterizaciones_lista";
const NARANJA = "#F97316";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const textareaClass = inputClass + " resize-y";

export default function CaracterizacionPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  // Si se llegó acá haciendo clic en un proceso del Mapa de Procesos
  // (Gestión de la Gerencia), "atrás" vuelve al mapa en vez de al listado
  // de Caracterizaciones.
  const vieneDelMapa = searchParams.get("origen") === "mapa";
  const volverHref = vieneDelMapa
    ? `/${locale}/dashboard/gestion-gerencia/mapa_procesos/resultado`
    : `${basePath}/caracterizaciones`;
  const volverLabel = vieneDelMapa ? "← Mapa de Procesos" : "← Caracterizaciones";

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);

  const todas = useMemo(() => parseCaracterizaciones(docs[ITEM_KEY] ?? ""), [docs]);
  const procedimientos = useMemo(() => parseProcedimientos(docs["procedimientos_lista"] ?? ""), [docs]);
  const requisitosLegales = useMemo(() => parseRequisitosLegales(docs["matriz_requisitos_legales"] ?? ""), [docs]);

  const [draft, setDraft] = useState<CaracterizacionProceso | null>(null);
  const [guardado, setGuardado] = useState(false);

  const original = todas.find((c) => c.id === id);
  const actual = draft ?? original ?? null;

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!actual) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={volverHref} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          {volverLabel}
        </Link>
        <p className="text-gray-500 text-sm">Esta caracterización no existe o fue eliminada.</p>
      </div>
    );
  }

  function actualizar(cambios: Partial<CaracterizacionProceso>) {
    setDraft({ ...actual!, ...cambios });
    setGuardado(false);
  }

  async function guardar() {
    const lista = todas.some((c) => c.id === actual!.id) ? todas.map((c) => (c.id === actual!.id ? actual! : c)) : [...todas, actual!];
    await save(ITEM_KEY, JSON.stringify(lista));
    setDraft(null);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la caracterización de "${actual!.proceso}"?`)) return;
    await save(ITEM_KEY, JSON.stringify(todas.filter((c) => c.id !== actual!.id)));
    router.push(volverHref);
  }

  const pct = completitud(actual);
  const procedimientosDelProceso = procedimientos.filter((p) => p.proceso === actual.proceso);
  const legalesDelProceso = requisitosLegales.filter((r) => r.procesoAplica === actual.proceso);

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href={volverHref} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          {volverLabel}
        </Link>
        <button onClick={eliminar} className="text-xs text-red-500 hover:text-red-700">
          Eliminar caracterización
        </button>
      </div>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <EncabezadoDocumento />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
              Caracterización de Proceso · {actual.codigo}
            </p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mt-1">{actual.proceso}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">Completitud</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#22C55E" : pct >= 40 ? "#F5A623" : "#D1D5DB" }} />
              </div>
              <span className="text-xs font-bold text-[#1A1A1A]">{pct}%</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Responsable del proceso</label>
            <input value={actual.responsable} onChange={(e) => actualizar({ responsable: e.target.value })} placeholder="Cargo" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Versión</label>
            <input value={actual.version} onChange={(e) => actualizar({ version: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Vigencia</label>
            <input type="date" value={actual.fechaVigencia} onChange={(e) => actualizar({ fechaVigencia: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className={labelClass}>Objetivo del proceso</label>
            <textarea rows={2} value={actual.objetivo} onChange={(e) => actualizar({ objetivo: e.target.value })} placeholder="¿Para qué existe este proceso?" className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>Alcance</label>
            <textarea rows={2} value={actual.alcance} onChange={(e) => actualizar({ alcance: e.target.value })} placeholder="¿Dónde inicia y dónde termina?" className={textareaClass} />
          </div>
        </div>
      </div>

      {/* Diagrama SIPOC */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Diagrama SIPOC</p>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          <ColumnaSipoc titulo="Proveedores" icono="🧑‍🏭" color="#22C55E" items={actual.proveedores} onChange={(v) => actualizar({ proveedores: v })} placeholder="Ej: Proveedor de materia prima" />
          <Flecha />
          <ColumnaSipoc titulo="Entradas" icono="📥" color="#3B82F6" items={actual.entradas} onChange={(v) => actualizar({ entradas: v })} placeholder="Ej: Orden de compra" />
          <Flecha />
          <ColumnaProceso nombre={actual.proceso} items={actual.actividades} onChange={(v) => actualizar({ actividades: v })} />
          <Flecha />
          <ColumnaSipoc titulo="Salidas" icono="📤" color="#F5A623" items={actual.salidas} onChange={(v) => actualizar({ salidas: v })} placeholder="Ej: Producto terminado" />
          <Flecha />
          <ColumnaSipoc titulo="Clientes" icono="🎯" color="#E8366B" items={actual.clientes} onChange={(v) => actualizar({ clientes: v })} placeholder="Ej: Cliente final" />
        </div>
      </div>

      {/* Ciclo PHVA */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Ciclo PHVA</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <CuadrantePhva letra="P" titulo="Planificar" icono="📘" color="#3B82F6" valor={actual.planificar} onChange={(v) => actualizar({ planificar: v })} placeholder="Metas, recursos y condiciones que se planifican antes de ejecutar el proceso." />
          <CuadrantePhva letra="H" titulo="Hacer" icono="🔧" color={NARANJA} valor={actual.hacer} onChange={(v) => actualizar({ hacer: v })} placeholder="Cómo se ejecuta el proceso en el día a día (resumen; el detalle está en el Procedimiento)." />
          <CuadrantePhva letra="V" titulo="Verificar" icono="🔍" color="#7C4DFF" valor={actual.verificar} onChange={(v) => actualizar({ verificar: v })} placeholder="Controles, supervisión y seguimiento a los indicadores del proceso." />
          <CuadrantePhva letra="A" titulo="Actuar" icono="🔄" color="#22C55E" valor={actual.actuar} onChange={(v) => actualizar({ actuar: v })} placeholder="Acciones correctivas y de mejora continua sobre el proceso." />
        </div>
      </div>

      {/* Recursos */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Recursos</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-[#1A1A1A] mb-2">👥 Humanos</p>
            <textarea rows={3} value={actual.recursosHumanos} onChange={(e) => actualizar({ recursosHumanos: e.target.value })} placeholder="Cargos y roles involucrados" className={textareaClass} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-[#1A1A1A] mb-2">🏭 Infraestructura</p>
            <textarea rows={3} value={actual.recursosInfraestructura} onChange={(e) => actualizar({ recursosInfraestructura: e.target.value })} placeholder="Equipos, software, instalaciones" className={textareaClass} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-[#1A1A1A] mb-2">🌡️ Ambiente de trabajo</p>
            <textarea rows={3} value={actual.recursosAmbiente} onChange={(e) => actualizar({ recursosAmbiente: e.target.value })} placeholder="Condiciones físicas, sociales o psicológicas" className={textareaClass} />
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Indicadores de Gestión</p>
        <div className="space-y-2">
          {actual.indicadores.map((ind) => (
            <TarjetaIndicador
              key={ind.id}
              indicador={ind}
              onChange={(nuevo) => actualizar({ indicadores: actual.indicadores.map((i) => (i.id === nuevo.id ? nuevo : i)) })}
              onDelete={() => actualizar({ indicadores: actual.indicadores.filter((i) => i.id !== ind.id) })}
            />
          ))}
          <button onClick={() => actualizar({ indicadores: [...actual.indicadores, indicadorVacio()] })} className="text-xs font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            + Agregar indicador
          </button>
        </div>
      </div>

      {/* Riesgos */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-[#1A1A1A] mb-2">⚠️ Riesgos asociados</p>
          <ListaChipsEditable items={actual.riesgos} onChange={(v) => actualizar({ riesgos: v })} placeholder="Ej: Incumplimiento de plazos de entrega" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-[#1A1A1A] mb-2">📚 Normatividad aplicable (adicional)</p>
          <ListaChipsEditable items={actual.normatividad} onChange={(v) => actualizar({ normatividad: v })} placeholder="Ej: Norma técnica sectorial" />
        </div>
      </div>

      {/* Documentos relacionados — auto, de otros módulos */}
      {(procedimientosDelProceso.length > 0 || legalesDelProceso.length > 0) && (
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Documentos relacionados</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {procedimientosDelProceso.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-[#1A1A1A] mb-2">📋 Procedimientos de este proceso</p>
                <div className="space-y-1.5">
                  {procedimientosDelProceso.map((p) => (
                    <Link key={p.id} href={`${basePath}/procedimientos/${p.id}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#1A1A1A] group">
                      <span className="font-mono text-gray-300">{p.codigo}</span>
                      <span className="truncate group-hover:underline">{p.nombre || "Sin nombre"}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {legalesDelProceso.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-[#1A1A1A] mb-2">⚖️ Requisitos legales aplicables</p>
                <div className="space-y-1.5">
                  {legalesDelProceso.map((r) => (
                    <Link key={r.id} href={`${basePath}/matrices/requisitos_legales`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#1A1A1A] group">
                      <span className="truncate group-hover:underline">{r.norma || "Sin nombre"}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea rows={2} value={actual.observaciones} onChange={(e) => actualizar({ observaciones: e.target.value })} className={textareaClass} />
      </div>

      <div className="flex items-center gap-3 justify-end">
        {guardado && <span className="text-xs text-green-600 font-semibold">Guardado ✓</span>}
        <button onClick={guardar} className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm">
          Guardar
        </button>
      </div>
    </div>
  );
}

function Flecha() {
  return (
    <div className="flex items-center justify-center flex-shrink-0 w-6 text-gray-300 text-xl">
      ›
    </div>
  );
}

function ListaChipsEditable({ items, onChange, placeholder }: { items: ItemLista[]; onChange: (v: ItemLista[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-1 bg-[#FAFAFA] rounded-lg">
          <input
            value={it.texto}
            onChange={(e) => onChange(items.map((x) => (x.id === it.id ? { ...x, texto: e.target.value } : x)))}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-xs px-2.5 py-1.5 focus:outline-none text-[#1A1A1A] placeholder-gray-400"
          />
          <button onClick={() => onChange(items.filter((x) => x.id !== it.id))} className="text-gray-300 hover:text-red-500 text-xs px-2">
            ✕
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, itemVacio()])} className="text-[11px] font-semibold hover:opacity-80" style={{ color: NARANJA }}>
        + agregar
      </button>
    </div>
  );
}

function ColumnaSipoc({
  titulo,
  icono,
  color,
  items,
  onChange,
  placeholder,
}: {
  titulo: string;
  icono: string;
  color: string;
  items: ItemLista[];
  onChange: (v: ItemLista[]) => void;
  placeholder: string;
}) {
  return (
    <div className="flex-shrink-0 w-[190px] rounded-2xl overflow-hidden border" style={{ borderColor: `${color}30` }}>
      <div className="px-3 py-2.5 flex items-center gap-1.5" style={{ backgroundColor: color }}>
        <span className="text-sm">{icono}</span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-white">{titulo}</p>
      </div>
      <div className="p-2.5" style={{ backgroundColor: `${color}0D`, minHeight: 160 }}>
        <ListaChipsEditable items={items} onChange={onChange} placeholder={placeholder} />
      </div>
    </div>
  );
}

function ColumnaProceso({ nombre, items, onChange }: { nombre: string; items: ItemLista[]; onChange: (v: ItemLista[]) => void }) {
  return (
    <div className="flex-shrink-0 w-[220px] rounded-2xl overflow-hidden border border-[#1A1A1A]">
      <div className="px-3 py-2.5 flex items-center gap-1.5 bg-[#1A1A1A]">
        <span className="text-sm">⚙️</span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-white truncate">{nombre || "Proceso"}</p>
      </div>
      <div className="p-2.5 bg-[#1A1A1A]" style={{ minHeight: 160 }}>
        <div className="space-y-1.5">
          {items
            .slice()
            .map((it, i) => (
              <div key={it.id} className="flex items-center gap-1.5 bg-white/10 rounded-lg">
                <span className="text-[10px] font-bold text-white/50 pl-2">{i + 1}</span>
                <input
                  value={it.texto}
                  onChange={(e) => onChange(items.map((x) => (x.id === it.id ? { ...x, texto: e.target.value } : x)))}
                  placeholder="Ej: Recepción de solicitud"
                  className="flex-1 bg-transparent text-xs px-1.5 py-1.5 focus:outline-none text-white placeholder-white/30"
                />
                <button onClick={() => onChange(items.filter((x) => x.id !== it.id))} className="text-white/30 hover:text-red-400 text-xs px-2">
                  ✕
                </button>
              </div>
            ))}
          <button onClick={() => onChange([...items, itemVacio()])} className="text-[11px] font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            + agregar paso
          </button>
        </div>
      </div>
    </div>
  );
}

function CuadrantePhva({
  letra,
  titulo,
  icono,
  color,
  valor,
  onChange,
  placeholder,
}: {
  letra: string;
  titulo: string;
  icono: string;
  color: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${color}14` }}>
        <span
          className="w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {letra}
        </span>
        <span className="text-sm">{icono}</span>
        <p className="text-xs font-bold text-[#1A1A1A]">{titulo}</p>
      </div>
      <div className="p-4">
        <textarea rows={3} value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={textareaClass} />
      </div>
    </div>
  );
}

function TarjetaIndicador({ indicador, onChange, onDelete }: { indicador: IndicadorProceso; onChange: (i: IndicadorProceso) => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      <div className="grid sm:grid-cols-[2fr_2fr_1fr_1.2fr_1.3fr_auto] gap-2 items-center">
        <input value={indicador.nombre} onChange={(e) => onChange({ ...indicador, nombre: e.target.value })} placeholder="Nombre del indicador" className={inputClass + " text-xs py-2"} />
        <input value={indicador.formula} onChange={(e) => onChange({ ...indicador, formula: e.target.value })} placeholder="Fórmula de cálculo" className={inputClass + " text-xs py-2"} />
        <input value={indicador.meta} onChange={(e) => onChange({ ...indicador, meta: e.target.value })} placeholder="Meta" className={inputClass + " text-xs py-2"} />
        <select value={indicador.frecuencia} onChange={(e) => onChange({ ...indicador, frecuencia: e.target.value })} className={inputClass + " text-xs py-2"}>
          {FRECUENCIAS_INDICADOR.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input value={indicador.responsable} onChange={(e) => onChange({ ...indicador, responsable: e.target.value })} placeholder="Responsable" className={inputClass + " text-xs py-2"} />
        <button onClick={onDelete} className="text-red-300 hover:text-red-600 text-sm justify-self-center">
          ✕
        </button>
      </div>
    </div>
  );
}
