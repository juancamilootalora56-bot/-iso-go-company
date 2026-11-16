"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Info, CheckCircle2, Trash2 } from "lucide-react";
import { parseTests, testAplicado, testCompleto, totalRespondidas, ITEMS_IPV, ESCALA_IPV, type TestIPV } from "@/lib/testIPV";

const ITEM_KEY = "test_ipv_lista";
const ACENTO = "#4F46E5";

export default function TestIPVDetallePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const testId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const testsGuardados = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);
  const testGuardado = testsGuardados.find((t) => t.id === testId) ?? null;

  const [draft, setDraft] = useState<TestIPV | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const test = draft ?? testGuardado;

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_ipv`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Personalidad Comercial (IPV)
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  const aplicado = testAplicado(test);
  const respondidas = totalRespondidas(test);

  function actualizar(cambios: Partial<TestIPV>) {
    setDraft({ ...test!, ...cambios });
  }

  async function guardarEnDB(actualizado: TestIPV) {
    const lista = testsGuardados.some((t) => t.id === actualizado.id)
      ? testsGuardados.map((t) => (t.id === actualizado.id ? actualizado : t))
      : [...testsGuardados, actualizado];
    await save(ITEM_KEY, JSON.stringify(lista));
  }

  function elegirValor(itemId: number, valor: number) {
    if (aplicado) return;
    actualizar({ respuestas: { ...test!.respuestas, [itemId]: valor } });
  }

  async function finalizar() {
    if (!testCompleto(test!)) return;
    setGuardando(true);
    const actualizado: TestIPV = { ...test!, finalizado: true };
    setDraft(actualizado);
    await guardarEnDB(actualizado);
    setGuardando(false);
    setMensaje("Evaluación finalizada ✓");
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la evaluación de "${test!.nombre || "esta persona"}"? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(testsGuardados.filter((t) => t.id !== test!.id)));
    router.push(`${basePath}/test_ipv`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/test_ipv`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Personalidad Comercial (IPV)
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
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Test de Personalidad Comercial (IPV)</h1>

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
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          A continuación se presentan 15 afirmaciones sobre situaciones de venta. Para cada una, indique qué tan de
          acuerdo está, según su forma habitual de pensar y actuar — no según lo que considere "deseable". No hay
          respuestas correctas o incorrectas.
        </p>
        <div className="flex flex-wrap gap-2">
          {ESCALA_IPV.map((e) => (
            <span key={e.valor} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {e.valor} = {e.label}
            </span>
          ))}
        </div>
      </div>

      {/* Progreso */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          {respondidas} de {ITEMS_IPV.length} afirmaciones respondidas
        </span>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(respondidas / ITEMS_IPV.length) * 100}%`, backgroundColor: ACENTO }}
          />
        </div>
      </div>

      {/* Ítems */}
      <div className="space-y-2">
        {ITEMS_IPV.map((item, idx) => {
          const seleccionado = test.respuestas[item.id];
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: seleccionado ? "#22C55E" : ACENTO }}
                >
                  {seleccionado ? <CheckCircle2 size={12} /> : idx + 1}
                </span>
                <p className="text-sm text-[#1A1A1A] flex-1">{item.texto}</p>
              </div>

              <div className="flex items-center gap-1.5 mt-3 pl-9">
                {ESCALA_IPV.map((e) => {
                  const activa = seleccionado === e.valor;
                  return (
                    <button
                      key={e.valor}
                      disabled={aplicado}
                      title={e.label}
                      onClick={() => elegirValor(item.id, e.valor)}
                      className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${
                        activa
                          ? "border-transparent text-white"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      } ${aplicado ? "cursor-default" : ""}`}
                      style={activa ? { backgroundColor: ACENTO } : undefined}
                    >
                      {e.valor}
                    </button>
                  );
                })}
                <span className="text-[11px] text-gray-400 ml-2 hidden sm:inline">
                  {seleccionado ? ESCALA_IPV.find((e) => e.valor === seleccionado)?.label : "Sin responder"}
                </span>
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
              href={`${basePath}/test_ipv/${test.id}/resultado`}
              className="text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
              style={{ backgroundColor: ACENTO }}
            >
              Ver resultados →
            </Link>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400">
              {mensaje || (testCompleto(test) ? "Todas las afirmaciones respondidas." : "Responda todas las afirmaciones para poder finalizar.")}
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
