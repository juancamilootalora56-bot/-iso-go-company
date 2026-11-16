"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Award, Brain } from "lucide-react";
import {
  parseTests,
  testAplicado,
  calcularResultados,
  colorNivelIPV,
  interpretacionArea,
  interpretacionGlobal,
  AREAS_IPV,
  type AreaIPV,
} from "@/lib/testIPV";

const ITEM_KEY = "test_ipv_lista";
const ACENTO = "#4F46E5";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ResultadoTestIPVPage() {
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
        <Link href={`${basePath}/test_ipv`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Personalidad Comercial (IPV)
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  if (!testAplicado(test)) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_ipv/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Volver a la evaluación
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">
            Esta evaluación todavía no está finalizada. Respondé las 15 afirmaciones y finalizala para ver los resultados.
          </p>
        </div>
      </div>
    );
  }

  const r = calcularResultados(test);
  const colorGlobal = colorNivelIPV(r.nivelGlobal);
  const valorObservaciones = observaciones ?? test.observaciones;

  async function guardarObservaciones() {
    setGuardando(true);
    const actualizados = tests.map((t) => (t.id === test!.id ? { ...t, observaciones: valorObservaciones } : t));
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2000);
  }

  const areas: AreaIPV[] = ["dgv", "receptividad", "agresividad"];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <Link href={`${basePath}/test_ipv/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Volver a la evaluación
      </Link>

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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${colorGlobal}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
            Resultados e interpretación
          </p>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{test.nombre || "Sin nombre"}</h1>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: colorGlobal }}>
              Aptitud comercial {r.nivelGlobal}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {test.cargo || "Sin cargo"} · {fechaLegible(test.fecha)} · 15 afirmaciones, escala 1 a 5
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Stat valor={r.puntajeTotal} max={75} label="Puntaje total" color={colorGlobal} />
            <Stat valor={r.puntajePorArea.dgv} max={25} label="DGV" color={AREAS_IPV.dgv.color} />
            <Stat valor={r.puntajePorArea.receptividad} max={25} label="Receptividad" color={AREAS_IPV.receptividad.color} />
            <Stat valor={r.puntajePorArea.agresividad} max={25} label="Agresividad Comercial" color={AREAS_IPV.agresividad.color} />
          </div>
        </div>
      </div>

      {/* Distribución por área */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center gap-2">
          <Brain size={14} className="text-white" />
          <h2 className="text-white text-xs font-bold uppercase tracking-wide">Resultado por área</h2>
        </div>
        <div className="p-5 space-y-5">
          {areas.map((area) => {
            const puntaje = r.puntajePorArea[area];
            const nivel = r.nivelPorArea[area];
            const colorNivel = colorNivelIPV(nivel);
            return (
              <div key={area}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="text-sm font-bold text-[#1A1A1A]">{AREAS_IPV[area].label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: AREAS_IPV[area].color }}>{puntaje} / 25</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorNivel }}>
                      {nivel}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(puntaje / 25) * 100}%`, backgroundColor: AREAS_IPV[area].color }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 mb-1.5">{AREAS_IPV[area].descripcion}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{interpretacionArea(area, nivel)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretación global */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center gap-2">
          <Award size={14} className="text-white" />
          <h2 className="text-white text-xs font-bold uppercase tracking-wide">Interpretación general</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold" style={{ color: colorGlobal }}>Aptitud comercial {r.nivelGlobal}</span>
            <span className="text-xs text-gray-400">· {r.porcentaje.toFixed(0)}% del puntaje máximo posible</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{interpretacionGlobal(r.nivelGlobal)}</p>
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
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#4F46E5] resize-y transition-colors"
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

function Stat({ valor, max, label, color }: { valor: number; max: number; label: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
      <p className="text-xl font-bold text-white">{valor}<span className="text-xs text-gray-400 font-normal"> / {max}</span></p>
      <p className="text-[11px] text-gray-400 mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}
