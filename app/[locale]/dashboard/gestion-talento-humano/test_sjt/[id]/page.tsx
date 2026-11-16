"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Info, CheckCircle2, Trash2 } from "lucide-react";
import { parseTests, testAplicado, testCompleto, totalRespondidas, ESCENARIOS, type TestSJT } from "@/lib/testSJT";

const ITEM_KEY = "test_sjt_lista";
const ACENTO = "#0D9488";

export default function TestSJTDetallePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const testId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const testsGuardados = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);
  const testGuardado = testsGuardados.find((t) => t.id === testId) ?? null;

  const [draft, setDraft] = useState<TestSJT | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const test = draft ?? testGuardado;

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_sjt`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Juicio Situacional Comercial
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  const aplicado = testAplicado(test);
  const respondidas = totalRespondidas(test);

  function actualizar(cambios: Partial<TestSJT>) {
    setDraft({ ...test!, ...cambios });
  }

  async function guardarEnDB(actualizado: TestSJT) {
    const lista = testsGuardados.some((t) => t.id === actualizado.id)
      ? testsGuardados.map((t) => (t.id === actualizado.id ? actualizado : t))
      : [...testsGuardados, actualizado];
    await save(ITEM_KEY, JSON.stringify(lista));
  }

  function elegirOpcion(escenarioId: number, opcionId: string) {
    if (aplicado) return;
    actualizar({ respuestas: { ...test!.respuestas, [escenarioId]: opcionId } });
  }

  async function finalizar() {
    if (!testCompleto(test!)) return;
    setGuardando(true);
    const actualizado: TestSJT = { ...test!, finalizado: true };
    setDraft(actualizado);
    await guardarEnDB(actualizado);
    setGuardando(false);
    setMensaje("Evaluación finalizada ✓");
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la evaluación de "${test!.nombre || "esta persona"}"? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(testsGuardados.filter((t) => t.id !== test!.id)));
    router.push(`${basePath}/test_sjt`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/test_sjt`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Juicio Situacional Comercial
        </Link>
        <button onClick={eliminar} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
          <Trash2 size={12} /> Eliminar test
        </button>
      </div>

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
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
            Datos generales
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Evaluación de Juicio Situacional Comercial</h1>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Campo label="Nombre del candidato" value={test.nombre} onChange={(v) => actualizar({ nombre: v })} disabled={aplicado} />
            <Campo label="Cargo al que aplica" value={test.cargo} onChange={(v) => actualizar({ cargo: v })} disabled={aplicado} />
            <Campo label="Evaluador" value={test.evaluador} onChange={(v) => actualizar({ evaluador: v })} disabled={aplicado} />
            <Campo
              label="Fecha"
              value={test.fecha}
              onChange={(v) => actualizar({ fecha: v })}
              disabled={aplicado}
              type="date"
            />
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={14} style={{ color: ACENTO }} />
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: ACENTO }}>Instrucciones</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          A continuación se presentan 10 situaciones comerciales reales que puede enfrentar en un puesto de ventas
          B2B o consultiva. Para cada una, elija la opción que mejor represente <strong>cómo actuaría usted</strong> en
          la práctica, no la que considere "correcta" en teoría. No hay respuestas buenas o malas: el objetivo es
          identificar su estilo comercial natural. Responda todas las situaciones antes de finalizar.
        </p>
      </div>

      {/* Progreso */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          {respondidas} de {ESCENARIOS.length} situaciones respondidas
        </span>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(respondidas / ESCENARIOS.length) * 100}%`, backgroundColor: ACENTO }}
          />
        </div>
      </div>

      {/* Escenarios */}
      <div className="space-y-3">
        {ESCENARIOS.map((escenario, idx) => {
          const seleccionada = test.respuestas[escenario.id];
          return (
            <div key={escenario.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: seleccionada ? "#22C55E" : ACENTO }}
                >
                  {seleccionada ? <CheckCircle2 size={14} /> : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#1A1A1A]">{escenario.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{escenario.contexto}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2 pl-10">
                {escenario.opciones.map((opcion) => {
                  const activa = seleccionada === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      disabled={aplicado}
                      onClick={() => elegirOpcion(escenario.id, opcion.id)}
                      className={`w-full text-left text-sm px-3.5 py-2.5 rounded-lg border transition-colors ${
                        activa
                          ? "border-transparent text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      } ${aplicado ? "cursor-default" : ""}`}
                      style={activa ? { backgroundColor: ACENTO } : undefined}
                    >
                      {opcion.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acción final */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between flex-wrap gap-3">
        {aplicado ? (
          <>
            <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Evaluación finalizada
            </span>
            <Link
              href={`${basePath}/test_sjt/${test.id}/resultado`}
              className="text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
              style={{ backgroundColor: ACENTO }}
            >
              Ver resultados →
            </Link>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400">
              {mensaje || (testCompleto(test) ? "Todas las situaciones respondidas." : "Responda todas las situaciones para poder finalizar.")}
            </span>
            <button
              onClick={finalizar}
              disabled={!testCompleto(test) || guardando}
              className="text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40"
              style={{ backgroundColor: ACENTO }}
            >
              {guardando ? "Guardando..." : "Finalizar evaluación"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-400 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 disabled:opacity-60"
      />
    </div>
  );
}
