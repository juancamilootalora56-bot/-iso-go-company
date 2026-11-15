"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { ClipboardList, Plus, Users } from "lucide-react";
import {
  parseTests,
  testVacio,
  testCompleto,
  preguntasRespondidas,
  calcularResultados,
  PREGUNTAS,
  type TestHabilidades,
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

export default function TestHabilidadesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const tests = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);
  const [filtro, setFiltro] = useState<"todos" | "completos" | "pendientes">("todos");

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  async function nuevoTest() {
    const nuevo = testVacio();
    await save(ITEM_KEY, JSON.stringify([...tests, nuevo]));
    router.push(`${basePath}/test_habilidades/${nuevo.id}`);
  }

  const completos = tests.filter((t) => testCompleto(t));
  const pendientes = tests.filter((t) => !testCompleto(t));
  const promedioCumplimiento =
    completos.length > 0
      ? Math.round(completos.reduce((acc, t) => acc + calcularResultados(t).cumplimiento, 0) / completos.length)
      : 0;

  const filtrados = filtro === "completos" ? completos : filtro === "pendientes" ? pendientes : tests;
  const ordenados = [...filtrados].sort((a, b) => (b.fechaCreacion || "").localeCompare(a.fechaCreacion || ""));

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${NARANJA}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Test de Habilidades</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Cuestionario de {PREGUNTAS.length} afirmaciones que mide 18 competencias blandas, con calificación e
              interpretación automática por competencia.
            </p>
          </div>
          <button
            onClick={nuevoTest}
            className="flex items-center gap-1.5 text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm flex-shrink-0"
            style={{ backgroundColor: NARANJA, color: "white" }}
          >
            <Plus size={16} strokeWidth={2.5} /> Nuevo test
          </button>
        </div>

        {tests.length > 0 && (
          <div className="relative z-10 flex items-center gap-5 mt-5 pt-5 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{tests.length}</span>
              <span className="text-xs text-gray-400">tests aplicados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-400">{completos.length}</span>
              <span className="text-xs text-gray-400">completos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: NARANJA }}>{pendientes.length}</span>
              <span className="text-xs text-gray-400">en curso</span>
            </div>
            {completos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: colorCumplimiento(promedioCumplimiento) }}>
                  {promedioCumplimiento}%
                </span>
                <span className="text-xs text-gray-400">cumplimiento promedio</span>
              </div>
            )}
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {([
            ["todos", `Todos (${tests.length})`],
            ["completos", `Completos (${completos.length})`],
            ["pendientes", `En curso (${pendientes.length})`],
          ] as const).map(([valor, label]) => (
            <button
              key={valor}
              onClick={() => setFiltro(valor)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                filtro === valor ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-gray-200 text-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <ClipboardList size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-2">Todavía no hay tests de habilidades aplicados.</p>
          <button onClick={nuevoTest} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Aplicar el primero →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ordenados.map((t) => (
            <TarjetaTest key={t.id} test={t} href={`${basePath}/test_habilidades/${t.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaTest({ test, href }: { test: TestHabilidades; href: string }) {
  const completo = testCompleto(test);
  const respondidas = preguntasRespondidas(test);
  const { cumplimiento, habilidadesAdecuadas } = completo ? calcularResultados(test) : { cumplimiento: 0, habilidadesAdecuadas: 0 };
  const color = completo ? colorCumplimiento(cumplimiento) : NARANJA;

  return (
    <Link href={href} className="group bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between gap-2">
        <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: `${color}18` }}>
          <ClipboardList size={18} style={{ color }} strokeWidth={2} />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
          {completo ? `${cumplimiento}%` : `${respondidas}/${PREGUNTAS.length}`}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A] mt-2.5">{test.nombre || "Sin nombre"}</p>
      <p className="text-xs text-gray-400">{test.cargo || "Sin cargo"} · {fechaLegible(test.fecha)}</p>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {completo ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
            <Users size={11} strokeWidth={2.5} /> {habilidadesAdecuadas}/18 habilidades adecuadas
          </span>
        ) : (
          <span className="text-[10px] text-gray-300">Cuestionario en curso</span>
        )}
      </div>
    </Link>
  );
}
