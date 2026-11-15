"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import TestHabilidadesComparativoChart from "@/components/dashboard/TestHabilidadesComparativoChart";
import { Target, Award, ChevronDown, ListChecks, TriangleAlert, CircleCheck } from "lucide-react";
import {
  parseTests,
  testCompleto,
  calcularResultados,
  interpretacionCompetencia,
  colorNivel,
  type ResultadoCompetencia,
} from "@/lib/testHabilidades";

const ITEM_KEY = "test_habilidades_lista";
const NARANJA = "#D97706";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function colorCumplimiento(valor: number): string {
  if (valor >= 80) return "#22C55E";
  if (valor >= 60) return "#2563EB";
  if (valor >= 40) return "#F59E0B";
  return "#EF4444";
}

export default function ResultadoTestHabilidadesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const testId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const tests = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);
  const test = tests.find((t) => t.id === testId) ?? null;

  const [observaciones, setObservaciones] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_habilidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Habilidades
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  if (!testCompleto(test)) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_habilidades/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Volver al cuestionario
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">Este test todavía no está completo. Respondé las 54 preguntas para ver los resultados.</p>
        </div>
      </div>
    );
  }

  const { porCompetencia, cumplimiento, habilidadesAdecuadas, puntajeRequerido } = calcularResultados(test);
  const colorGeneral = colorCumplimiento(cumplimiento);
  const valorObservaciones = observaciones ?? test.observaciones;

  async function guardarObservaciones() {
    setGuardando(true);
    const actualizados = tests.map((t) => (t.id === test!.id ? { ...t, observaciones: valorObservaciones } : t));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <Link href={`${basePath}/test_habilidades/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Volver al cuestionario
      </Link>

      {/* Encabezado de resultados */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${colorGeneral}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
            Resultados e interpretación
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{test.nombre || "Sin nombre"}</h1>
          <p className="text-xs text-gray-400 mt-1">
            {test.cargo || "Sin cargo"} {test.profesion && <>· {test.profesion}</>} · {fechaLegible(test.fecha)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <p className="text-2xl font-bold" style={{ color: colorGeneral }}>{cumplimiento}%</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Cumplimiento general</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <p className="text-2xl font-bold text-white">{habilidadesAdecuadas}<span className="text-sm text-gray-400">/18</span></p>
              <p className="text-[11px] text-gray-400 mt-0.5">Habilidades adecuadas</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <p className="text-2xl font-bold text-white">{puntajeRequerido.toFixed(1)}<span className="text-sm text-gray-400">/5</span></p>
              <p className="text-[11px] text-gray-400 mt-0.5">Puntaje requerido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de puntajes por habilidad */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center gap-2">
          <ListChecks size={14} className="text-white" />
          <h2 className="text-white text-xs font-bold uppercase tracking-wide">Puntaje requerido vs. obtenido por habilidad</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-[11px] uppercase tracking-wide border-b border-gray-100">
                <th className="py-2.5 pl-5 pr-2 font-semibold w-8">#</th>
                <th className="py-2.5 px-2 font-semibold">Habilidad</th>
                <th className="py-2.5 px-2 font-semibold text-center">Puntaje requerido</th>
                <th className="py-2.5 px-2 font-semibold text-center w-10"></th>
                <th className="py-2.5 pr-5 pl-2 font-semibold text-right">Puntaje obtenido</th>
              </tr>
            </thead>
            <tbody>
              {porCompetencia.map((r, i) => (
                <tr key={r.competencia.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pl-5 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-2.5 px-2 font-medium text-[#1A1A1A]">{r.competencia.nombreCorto}</td>
                  <td className="py-2.5 px-2 text-center text-gray-500">{puntajeRequerido.toFixed(1)}</td>
                  <td className="py-2.5 px-2 text-center">
                    {r.aptoParaElCargo ? (
                      <CircleCheck size={16} className="inline text-green-500" />
                    ) : (
                      <TriangleAlert size={16} className="inline text-red-400" />
                    )}
                  </td>
                  <td className="py-2.5 pr-5 pl-2 text-right font-bold" style={{ color: colorNivel(r.nivel) }}>
                    {r.puntaje.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="py-3 pl-5 pr-2 font-bold text-[#1A1A1A] text-xs uppercase tracking-wide">
                  % Cumplimiento
                </td>
                <td className="py-3 pr-5 pl-2 text-right font-extrabold text-base" style={{ color: colorCumplimiento(cumplimiento) }}>
                  {cumplimiento}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Comparativo por competencia */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Puntaje obtenido vs. requerido por competencia</h2>
        <TestHabilidadesComparativoChart resultados={porCompetencia} puntajeRequerido={puntajeRequerido} />
      </div>

      {/* Detalle e interpretación por competencia */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center gap-2">
          <Target size={14} className="text-white" />
          <h2 className="text-white text-xs font-bold uppercase tracking-wide">Interpretación por competencia</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {porCompetencia.map((r) => (
            <FilaCompetencia key={r.competencia.id} resultado={r} />
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-gray-400" />
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Observaciones del evaluador</h2>
        </div>
        <textarea
          value={valorObservaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={4}
          placeholder="Observaciones generales sobre la aplicación del test, el contexto de la evaluación o recomendaciones..."
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D97706] resize-y transition-colors"
        />
        <div className="flex items-center justify-end gap-3 mt-3">
          {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
          <button
            onClick={guardarObservaciones}
            disabled={guardando}
            className="bg-[#1A1A1A] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar observaciones"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilaCompetencia({ resultado }: { resultado: ResultadoCompetencia }) {
  const [abierto, setAbierto] = useState(false);
  const color = colorNivel(resultado.nivel);

  return (
    <div>
      <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/60 transition-colors">
        <span className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <span className="text-xs font-bold" style={{ color }}>{resultado.puntaje.toFixed(1)}</span>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A]">{resultado.competencia.nombre}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
          {resultado.nivel}
        </span>
        <ChevronDown size={14} className={`text-gray-300 flex-shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && (
        <div className="px-4 pb-4 pl-16">
          <p className="text-xs text-gray-500 leading-relaxed">{interpretacionCompetencia(resultado)}</p>
        </div>
      )}
    </div>
  );
}
