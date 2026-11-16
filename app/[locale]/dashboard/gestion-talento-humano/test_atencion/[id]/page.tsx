"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Trash2, BarChart3, Play, AlertTriangle } from "lucide-react";
import {
  parseTests,
  testAplicado,
  deadlineMs,
  DURACIONES_MINUTOS,
  DURACION_DEFECTO,
  FILAS,
  COLUMNAS,
  type TestAtencion,
  type ItemAtencion,
  type DuracionMinutos,
} from "@/lib/testAtencion";

const ITEM_KEY = "test_atencion_lista";
const ACENTO = "#7C3AED";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const EJEMPLO_OBJETIVO: ItemAtencion = { id: -1, letra: "d", marcasArriba: 1, marcasAbajo: 1, esObjetivo: true };
const EJEMPLOS_DISTRACTOR: ItemAtencion[] = [
  { id: -2, letra: "d", marcasArriba: 2, marcasAbajo: 1, esObjetivo: false },
  { id: -3, letra: "p", marcasArriba: 1, marcasAbajo: 1, esObjetivo: false },
  { id: -4, letra: "d", marcasArriba: 0, marcasAbajo: 1, esObjetivo: false },
];

function Simbolo({
  item,
  marcado,
  interactivo,
  onToggle,
  mostrarCorreccion,
}: {
  item: ItemAtencion;
  marcado: boolean;
  interactivo: boolean;
  onToggle?: (id: number) => void;
  mostrarCorreccion?: boolean;
}) {
  let estiloCorreccion = "";
  if (mostrarCorreccion) {
    if (item.esObjetivo && marcado) estiloCorreccion = "ring-2 ring-green-500";
    else if (item.esObjetivo && !marcado) estiloCorreccion = "ring-2 ring-amber-400";
    else if (!item.esObjetivo && marcado) estiloCorreccion = "ring-2 ring-red-500";
  }

  return (
    <button
      type="button"
      disabled={!interactivo}
      onClick={() => onToggle?.(item.id)}
      className={`relative w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center rounded border text-xs sm:text-sm font-bold font-mono select-none flex-shrink-0 ${estiloCorreccion} ${
        marcado ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-[#1A1A1A] border-gray-200 hover:border-gray-400"
      } ${interactivo ? "cursor-pointer" : "cursor-default"}`}
    >
      <span className="absolute top-0.5 flex gap-0.5">
        {Array.from({ length: item.marcasArriba }).map((_, i) => (
          <span key={i} className="w-[3px] h-[3px] rounded-full bg-current" />
        ))}
      </span>
      {item.letra}
      <span className="absolute bottom-0.5 flex gap-0.5">
        {Array.from({ length: item.marcasAbajo }).map((_, i) => (
          <span key={i} className="w-[3px] h-[3px] rounded-full bg-current" />
        ))}
      </span>
    </button>
  );
}

function formatoReloj(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestAtencionDetallePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const testId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const testsGuardados = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);
  const testGuardado = testsGuardados.find((t) => t.id === testId) ?? null;

  const [draft, setDraft] = useState<TestAtencion | null>(null);
  const [marcadasLocal, setMarcadasLocal] = useState<Set<number> | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tick, setTick] = useState(0); // fuerza re-render cada segundo durante la prueba

  const test = draft ?? testGuardado;

  useEffect(() => {
    if (!test?.iniciadoEn || testAplicado(test)) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.iniciadoEn, test?.finalizado]);

  useEffect(() => {
    if (!test || !test.iniciadoEn || test.finalizado) return;
    const dl = deadlineMs(test);
    if (dl !== null && Date.now() >= dl && marcadasLocal) {
      finalizar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_atencion`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Atención y Concentración
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  function actualizar(cambios: Partial<TestAtencion>) {
    setDraft({ ...test!, ...cambios });
  }

  async function guardarEnDB(actualizado: TestAtencion) {
    const lista = testsGuardados.some((t) => t.id === actualizado.id)
      ? testsGuardados.map((t) => (t.id === actualizado.id ? actualizado : t))
      : [...testsGuardados, actualizado];
    await save(ITEM_KEY, JSON.stringify(lista));
  }

  async function comenzar() {
    setGuardando(true);
    const actualizado = { ...test!, iniciadoEn: new Date().toISOString() };
    setDraft(actualizado);
    setMarcadasLocal(new Set());
    await guardarEnDB(actualizado);
    setGuardando(false);
  }

  function toggleMarca(id: number) {
    if (!marcadasLocal) return;
    const nuevo = new Set(marcadasLocal);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setMarcadasLocal(nuevo);
  }

  async function finalizar() {
    const actualizado: TestAtencion = {
      ...test!,
      marcadas: Array.from(marcadasLocal ?? new Set<number>()),
      finalizado: true,
    };
    setDraft(actualizado);
    setGuardando(true);
    await guardarEnDB(actualizado);
    setGuardando(false);
    setMensaje("Prueba finalizada ✓");
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar el test de "${test!.nombre || "esta persona"}"? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(testsGuardados.filter((t) => t.id !== test!.id)));
    router.push(`${basePath}/test_atencion`);
  }

  const aplicado = testAplicado(test);
  const enCurso = !!test.iniciadoEn && !aplicado;
  const marcadasActuales = enCurso ? marcadasLocal ?? new Set(test.marcadas) : new Set(test.marcadas);

  let segundosRestantes = test.duracionMinutos * 60;
  if (test.iniciadoEn) {
    const dl = deadlineMs(test);
    segundosRestantes = dl ? Math.max(0, Math.round((dl - Date.now()) / 1000)) : 0;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/test_atencion`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Atención y Concentración
        </Link>
        <button onClick={eliminar} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
          <Trash2 size={12} /> Eliminar test
        </button>
      </div>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
              Test de Atención y Concentración
            </p>
            <input
              value={test.nombre}
              onChange={(e) => actualizar({ nombre: e.target.value })}
              disabled={!!test.iniciadoEn}
              placeholder="Nombre de la persona evaluada"
              className="text-xl sm:text-2xl font-bold text-white mt-1 bg-transparent focus:outline-none placeholder-gray-500 w-full disabled:opacity-80"
            />
            <p className="text-xs text-gray-400 mt-1">{test.cargo || "Sin cargo asignado"}</p>
          </div>
          {test.iniciadoEn && (
            <div className="text-center flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Tiempo restante</p>
              <p className={`text-3xl font-bold tabular-nums ${segundosRestantes <= 30 ? "text-red-400" : "text-white"}`}>
                {formatoReloj(segundosRestantes)}
              </p>
            </div>
          )}
        </div>
      </div>

      {!test.iniciadoEn && (
        <>
          {/* Datos generales */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Datos generales</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Cargo</label>
                <input value={test.cargo} onChange={(e) => actualizar({ cargo: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Profesión</label>
                <input value={test.profesion} onChange={(e) => actualizar({ profesion: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Edad</label>
                <input value={test.edad} onChange={(e) => actualizar({ edad: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sexo</label>
                <select value={test.sexo} onChange={(e) => actualizar({ sexo: e.target.value as TestAtencion["sexo"] })} className={inputClass}>
                  <option value="">Sin especificar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha</label>
                <input type="date" value={test.fecha} onChange={(e) => actualizar({ fecha: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Evaluador</label>
                <input value={test.evaluador} onChange={(e) => actualizar({ evaluador: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duración de la prueba</label>
                <select
                  value={test.duracionMinutos}
                  onChange={(e) => actualizar({ duracionMinutos: Number(e.target.value) as DuracionMinutos })}
                  className={inputClass}
                >
                  {DURACIONES_MINUTOS.map((m) => (
                    <option key={m} value={m}>{m} minutos</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Instrucciones para el evaluado</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              A continuación vas a ver una grilla con las letras <strong>&quot;d&quot;</strong> y <strong>&quot;p&quot;</strong>,
              cada una con pequeñas marcas arriba y/o abajo. Tu tarea es marcar <strong>únicamente</strong> las letras{" "}
              <strong>&quot;d&quot; que tengan exactamente 2 marcas en total</strong> (sin importar si están las 2 arriba,
              las 2 abajo, o 1 arriba y 1 abajo). Ignorá todas las letras &quot;p&quot; y cualquier &quot;d&quot; que no
              tenga exactamente 2 marcas — esos son distractores.
            </p>
            <p className="text-sm text-[#1A1A1A] font-bold leading-relaxed mt-3">
              Trabajá lo más rápido y preciso que puedas. Tenés {test.duracionMinutos} minutos en total; cuando el
              tiempo se agote, la prueba se cierra automáticamente.
            </p>

            <div className="mt-4 bg-[#FAFAFA] rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Ejemplo</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Simbolo item={EJEMPLO_OBJETIVO} marcado={false} interactivo={false} />
                  <span className="text-xs text-green-600 font-semibold">✓ Es objetivo (2 marcas, es &quot;d&quot;)</span>
                </div>
                {EJEMPLOS_DISTRACTOR.map((ej) => (
                  <div key={ej.id} className="flex items-center gap-2">
                    <Simbolo item={ej} marcado={false} interactivo={false} />
                    <span className="text-xs text-red-500 font-semibold">✕ Distractor</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={comenzar}
              disabled={guardando}
              className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              style={{ backgroundColor: ACENTO }}
            >
              <Play size={16} strokeWidth={2.5} /> {guardando ? "Iniciando..." : "Comenzar prueba"}
            </button>
          </div>
        </>
      )}

      {test.iniciadoEn && (
        <>
          {enCurso && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-2.5">
              <AlertTriangle size={15} className="flex-shrink-0" />
              Marcá todas las &quot;d&quot; con exactamente 2 marcas. El tiempo corre — no se puede pausar.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 overflow-x-auto">
            <div
              className="grid gap-1 w-fit mx-auto"
              style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}
            >
              {test.grilla.map((item) => (
                <Simbolo
                  key={item.id}
                  item={item}
                  marcado={marcadasActuales.has(item.id)}
                  interactivo={enCurso}
                  onToggle={enCurso ? toggleMarca : undefined}
                  mostrarCorreccion={aplicado}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-3">
              {FILAS} filas × {COLUMNAS} columnas — {test.grilla.length} ítems
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
            {enCurso ? (
              <button
                onClick={finalizar}
                disabled={guardando}
                className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Finalizar ahora"}
              </button>
            ) : (
              <Link
                href={`${basePath}/test_atencion/${test.id}/resultado`}
                className="flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
                style={{ backgroundColor: ACENTO }}
              >
                <BarChart3 size={15} /> Ver resultados
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
