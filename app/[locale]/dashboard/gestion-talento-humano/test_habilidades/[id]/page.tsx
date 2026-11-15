"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Trash2, BarChart3 } from "lucide-react";
import {
  parseTests,
  testCompleto,
  preguntasRespondidas,
  ESCALA_LIKERT,
  PREGUNTAS,
  PUNTAJE_REQUERIDO,
  type TestHabilidades,
} from "@/lib/testHabilidades";

const ITEM_KEY = "test_habilidades_lista";
const NARANJA = "#D97706";

const inputClass =
  "w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D97706] transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const BLOQUES = [
  { desde: 1, hasta: 18, titulo: "Bloque 1" },
  { desde: 19, hasta: 36, titulo: "Bloque 2" },
  { desde: 37, hasta: 54, titulo: "Bloque 3" },
];

export default function TestHabilidadesDetallePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const testId = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading, save } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const testsGuardados = useMemo(() => parseTests(docs[ITEM_KEY] ?? ""), [docs]);

  const [draft, setDraft] = useState<TestHabilidades | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const test = draft ?? testsGuardados.find((t) => t.id === testId) ?? null;

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

  function actualizar(cambios: Partial<TestHabilidades>) {
    setDraft({ ...test!, ...cambios });
  }

  function responder(numPregunta: number, valor: number) {
    actualizar({ respuestas: { ...test!.respuestas, [numPregunta]: valor } });
  }

  async function guardar() {
    setGuardando(true);
    const actualizados = testsGuardados.some((t) => t.id === test!.id)
      ? testsGuardados.map((t) => (t.id === test!.id ? test! : t))
      : [...testsGuardados, test!];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    setDraft(null);
    setGuardando(false);
    setMensaje("Guardado ✓");
    setTimeout(() => setMensaje(""), 2000);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar el test de "${test!.nombre || "esta persona"}"? Esta acción no se puede deshacer.`)) return;
    setGuardando(true);
    await save(ITEM_KEY, JSON.stringify(testsGuardados.filter((t) => t.id !== test!.id)));
    router.push(`${basePath}/test_habilidades`);
  }

  const respondidas = preguntasRespondidas(test);
  const completo = testCompleto(test);
  const porcentaje = Math.round((respondidas / PREGUNTAS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link href={`${basePath}/test_habilidades`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Test de Habilidades
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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${NARANJA}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
            Test de Habilidades
          </p>
          <input
            value={test.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            placeholder="Nombre de la persona evaluada"
            className="text-xl sm:text-2xl font-bold text-white mt-1 bg-transparent focus:outline-none placeholder-gray-500 w-full"
          />
          <p className="text-xs text-gray-400 mt-1">{test.cargo || "Sin cargo asignado"}</p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>{respondidas} de {PREGUNTAS.length} respondidas</span>
              <span className="font-bold" style={{ color: NARANJA }}>{porcentaje}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${porcentaje}%`, backgroundColor: NARANJA }} />
            </div>
          </div>
        </div>
      </div>

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
            <select value={test.sexo} onChange={(e) => actualizar({ sexo: e.target.value as TestHabilidades["sexo"] })} className={inputClass}>
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
            <label className={labelClass}>Puntaje requerido para el cargo</label>
            <select
              value={test.puntajeRequerido}
              onChange={(e) => actualizar({ puntajeRequerido: Number(e.target.value) })}
              className={inputClass}
            >
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => (
                <option key={v} value={v}>
                  {v.toFixed(1)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Por defecto {PUNTAJE_REQUERIDO.toFixed(1)}. Ajustalo según la exigencia del cargo evaluado.</p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Instrucciones</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Lea cuidadosamente cada pregunta y señale la opción que usted escoja según el grado de aceptación:
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-3">
          {ESCALA_LIKERT.map((e) => (
            <span key={e.valor} className="text-xs text-gray-500">
              <strong className="text-[#1A1A1A]">{e.valor}</strong> = {e.label}
            </span>
          ))}
        </div>

        <p className="text-sm text-[#1A1A1A] font-bold leading-relaxed mt-4">
          Si tiene duda de alguna información procure preguntar cualquier inquietud al evaluador, pues solo se le
          permitirá contestar con la opción número 3 no más de tres veces.
        </p>
      </div>

      {/* Preguntas por bloque */}
      {BLOQUES.map((bloque) => (
        <div key={bloque.titulo} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <h3 className="text-white text-xs font-bold uppercase tracking-wide">
              {bloque.titulo} · Preguntas {bloque.desde}-{bloque.hasta}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {PREGUNTAS.slice(bloque.desde - 1, bloque.hasta).map((texto, idx) => {
              const numPregunta = bloque.desde + idx;
              const respuesta = test.respuestas[numPregunta];
              return (
                <div key={numPregunta} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-[#1A1A1A] flex-1 min-w-0">
                    <span className="text-gray-400 font-semibold mr-1.5">{numPregunta}.</span>
                    {texto}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {ESCALA_LIKERT.map((e) => (
                      <button
                        key={e.valor}
                        onClick={() => responder(numPregunta, e.valor)}
                        title={e.label}
                        className={`w-8 h-8 rounded-full text-xs font-bold border-2 transition-all flex-shrink-0 ${
                          respuesta === e.valor
                            ? "text-white border-transparent"
                            : "text-gray-400 border-gray-200 hover:border-gray-300"
                        }`}
                        style={respuesta === e.valor ? { backgroundColor: NARANJA } : {}}
                      >
                        {e.valor}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end gap-3">
        {mensaje && <span className="text-xs text-green-600 font-semibold">{mensaje}</span>}
        {completo && (
          <Link
            href={`${basePath}/test_habilidades/${test.id}/resultado`}
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
            style={{ color: NARANJA }}
          >
            <BarChart3 size={15} /> Ver resultados
          </Link>
        )}
        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
