"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Target, Award, CheckCircle2, XCircle, EyeOff, Gauge, Zap } from "lucide-react";
import {
  parseTests,
  testAplicado,
  calcularResultados,
  colorNivelAtencion,
  interpretacionNivel,
  FILAS,
  COLUMNAS,
} from "@/lib/testAtencion";

const ITEM_KEY = "test_atencion_lista";
const ACENTO = "#7C3AED";

function fechaLegible(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function Stat({ icono: Icono, valor, label, color }: { icono: typeof Target; valor: string | number; label: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
      <Icono size={15} style={{ color }} className="mb-1.5" />
      <p className="text-xl font-bold text-white">{valor}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function ResultadoTestAtencionPage() {
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
        <Link href={`${basePath}/test_atencion`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Atención y Concentración
        </Link>
        <p className="text-gray-500 text-sm">No se encontró este test.</p>
      </div>
    );
  }

  if (!testAplicado(test)) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <Link href={`${basePath}/test_atencion/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Volver a la prueba
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">
            Esta prueba todavía no está finalizada. Completala (o esperá a que se agote el tiempo) para ver los resultados.
          </p>
        </div>
      </div>
    );
  }

  const r = calcularResultados(test);
  const color = colorNivelAtencion(r.nivel);
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
      <Link href={`${basePath}/test_atencion/${test.id}`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Volver a la prueba
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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${color}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
            Resultados e interpretación
          </p>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{test.nombre || "Sin nombre"}</h1>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
              Nivel {r.nivel}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {test.cargo || "Sin cargo"} · {fechaLegible(test.fecha)} · prueba de {test.duracionMinutos} minutos ·{" "}
            {FILAS * COLUMNAS} ítems ({r.totalObjetivos} objetivos)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Stat icono={CheckCircle2} valor={r.aciertos} label="Aciertos (TA)" color="#22C55E" />
            <Stat icono={EyeOff} valor={r.omisiones} label="Omisiones (O)" color="#F59E0B" />
            <Stat icono={XCircle} valor={r.comisiones} label="Comisiones (C)" color="#EF4444" />
            <Stat icono={Gauge} valor={r.concentracion} label="Concentración (TA-C)" color="#2563EB" />
            <Stat icono={Target} valor={`${r.precision.toFixed(0)}%`} label="Precisión" color="#14B8A6" />
            <Stat icono={Zap} valor={r.velocidad.toFixed(0)} label="Respuestas / minuto" color="#F97316" />
            <Stat icono={XCircle} valor={`${r.tasaComision.toFixed(0)}%`} label="Tasa de comisión" color="#EF4444" />
            <Stat icono={Target} valor={r.totalRespuestas} label="Total respuestas (TR)" color="#7C3AED" />
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] flex items-center gap-2">
          <Target size={14} className="text-white" />
          <h2 className="text-white text-xs font-bold uppercase tracking-wide">Interpretación</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold" style={{ color }}>Nivel {r.nivel}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{interpretacionNivel(r.nivel)}</p>
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
          placeholder="Observaciones generales sobre la aplicación de la prueba, el contexto de la evaluación o recomendaciones..."
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] resize-y transition-colors"
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
