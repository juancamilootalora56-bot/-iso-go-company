"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  CLAUSULAS_DIAGNOSTICO,
  OPCIONES_DIAGNOSTICO,
  TOTAL_ITEMS_DIAGNOSTICO,
  calcularResultados,
  cantidadRespondidas,
  colorAccion,
  colorCalificacionGlobal,
  parseRespuestasDiagnostico,
  parseHistorialDiagnostico,
} from "@/lib/diagnosticoISO9001";

const MODULO = "diagnostico";
const ITEM_KEY_RESPUESTAS = "respuestas_iso9001";
const ITEM_KEY_HISTORIAL = "historial_iso9001";

function fechaLegible(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function DiagnosticoPage() {
  const { user, profile } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard`;

  const { docs, loading, save } = useGestionDocumentos(MODULO, user?.id ?? null);

  const [clausulaIdx, setClausulaIdx] = useState(0);
  const [verResultados, setVerResultados] = useState<boolean | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const respuestas = parseRespuestasDiagnostico(docs[ITEM_KEY_RESPUESTAS] ?? "");
  const historial = parseHistorialDiagnostico(docs[ITEM_KEY_HISTORIAL] ?? "");
  const respondidas = cantidadRespondidas(respuestas);
  const completo = respondidas === TOTAL_ITEMS_DIAGNOSTICO;
  const mostrandoResultados = verResultados ?? completo;

  async function responder(itemId: string, valor: number) {
    const actualizadas = { ...respuestas, [itemId]: valor };
    await save(ITEM_KEY_RESPUESTAS, JSON.stringify(actualizadas));
  }

  // Archiva el resultado actual en el historial (para que sirva de
  // auditoría / mejora continua a lo largo del tiempo) y arranca un
  // diagnóstico nuevo desde cero.
  async function nuevoDiagnostico() {
    if (!confirm("Esto guarda tu diagnóstico actual en el historial y empieza uno nuevo en blanco. ¿Continuar?")) return;
    setReiniciando(true);
    const resultadoActual = calcularResultados(respuestas);
    const nuevaEntrada = { fecha: new Date().toISOString(), resultado: resultadoActual };
    await save(ITEM_KEY_HISTORIAL, JSON.stringify([nuevaEntrada, ...historial]));
    await save(ITEM_KEY_RESPUESTAS, JSON.stringify({}));
    setClausulaIdx(0);
    setVerResultados(false);
    setReiniciando(false);
  }

  const clausula = CLAUSULAS_DIAGNOSTICO[clausulaIdx];
  const esPrimera = clausulaIdx === 0;
  const esUltima = clausulaIdx === CLAUSULAS_DIAGNOSTICO.length - 1;

  const itemsClausula = clausula.subclausulas.flatMap((s) => s.items);
  const respondidasClausula = itemsClausula.filter((i) => i.id in respuestas).length;

  if (mostrandoResultados && completo) {
    const resultado = calcularResultados(respuestas);
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
          ← Inicio
        </Link>

        {/* Encabezado */}
        <div className="relative bg-[#1A1A1A] rounded-2xl p-8 sm:p-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl" />
          {profile?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt=""
              className="absolute right-6 bottom-0 w-48 h-48 object-contain opacity-[0.06] pointer-events-none select-none"
            />
          )}
          <div className="relative z-10">
            <p className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wide">Resultado del diagnóstico</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold mt-1">Sistema de Gestión de Calidad — ISO 9001:2015</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
              Evaluación de {TOTAL_ITEMS_DIAGNOSTICO} criterios distribuidos en las 7 cláusulas de la norma, sobre la
              situación actual de {profile?.company_name || "tu empresa"}.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 flex-shrink-0" style={{ borderColor: colorCalificacionGlobal(resultado.calificacion) }}>
                <span className="text-3xl font-extrabold text-white">{resultado.porcentajeGlobal}%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Implementación</span>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold">Calificación global</p>
                <p className="text-2xl font-extrabold mt-0.5" style={{ color: colorCalificacionGlobal(resultado.calificacion) }}>
                  {resultado.calificacion}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {resultado.puntajeObtenido} / {resultado.puntajeMaximo} puntos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resultado por cláusula */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h2 className="font-bold text-[#1A1A1A] mb-1">Resultado por cláusula</h2>
          <p className="text-xs text-gray-500 mb-6">% de implementación obtenido y acción recomendada para cada cláusula de la norma.</p>
          <div className="space-y-4">
            {resultado.clausulas.map((c) => (
              <div key={c.numero}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {c.numero}. {c.titulo}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">{c.porcentaje}%</span>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: colorAccion(c.accion) }}
                    >
                      {c.accion}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 bg-[#FAFAFA] rounded-full overflow-hidden border border-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.porcentaje}%`, backgroundColor: colorAccion(c.accion) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-center gap-5">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex-1 text-center sm:text-left">
            <p className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wide">Próximo paso</p>
            <h2 className="text-white text-lg font-bold mt-0.5">Hablemos de cómo cerrar estas brechas</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Un asesor de Iso Go Company va a revisar tu resultado y armar el plan para llevar tu sistema de gestión
              al siguiente nivel — con nuestro software incluido.
            </p>
          </div>
          <a
            href="https://wa.me/595982859051"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm flex-shrink-0 whitespace-nowrap"
          >
            Hablar con un asesor →
          </a>
        </div>

        <div className="flex items-center justify-center gap-5 flex-wrap">
          <button onClick={() => setVerResultados(false)} className="text-sm text-gray-400 hover:text-[#1A1A1A] font-semibold">
            ✎ Revisar mis respuestas
          </button>
          <button
            onClick={nuevoDiagnostico}
            disabled={reiniciando}
            className="text-sm text-gray-400 hover:text-[#1A1A1A] font-semibold disabled:opacity-50"
          >
            🔄 Hacer un nuevo diagnóstico
          </button>
          {historial.length > 0 && (
            <button onClick={() => setVerHistorial((v) => !v)} className="text-sm text-gray-400 hover:text-[#1A1A1A] font-semibold">
              📋 Historial ({historial.length})
            </button>
          )}
        </div>

        {verHistorial && historial.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Diagnósticos anteriores</h2>
            <div className="space-y-3">
              {historial.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] capitalize">{fechaLegible(h.fecha)}</p>
                    <p className="text-xs text-gray-500">{h.resultado.puntajeObtenido} / {h.resultado.puntajeMaximo} puntos</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-500">{h.resultado.porcentajeGlobal}%</span>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: colorCalificacionGlobal(h.resultado.calificacion) }}
                    >
                      {h.resultado.calificacion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Inicio
      </Link>

      {/* Encabezado + progreso */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8">
        <p className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wide">Diagnóstico ISO 9001:2015</p>
        <h1 className="text-white text-xl sm:text-2xl font-bold mt-1">Evaluación del Sistema de Gestión de Calidad</h1>
        <p className="text-gray-400 text-sm mt-1">
          Respondé con sinceridad sobre la situación actual de {profile?.company_name || "tu empresa"}. Tus
          respuestas se guardan automáticamente — podés continuar cuando quieras.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-semibold">
              {respondidas} de {TOTAL_ITEMS_DIAGNOSTICO} criterios respondidos
            </span>
            <span className="text-[#F5A623] font-bold">{Math.round((respondidas / TOTAL_ITEMS_DIAGNOSTICO) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5A623] rounded-full transition-all"
              style={{ width: `${(respondidas / TOTAL_ITEMS_DIAGNOSTICO) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper de cláusulas */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1">
          {CLAUSULAS_DIAGNOSTICO.map((c, i) => {
            const items = c.subclausulas.flatMap((s) => s.items);
            const hechos = items.filter((it) => it.id in respuestas).length;
            const activa = i === clausulaIdx;
            return (
              <button
                key={c.numero}
                onClick={() => setClausulaIdx(i)}
                title={`${c.numero}. ${c.titulo}`}
                className={`flex-shrink-0 w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  activa
                    ? "bg-[#F5A623] text-[#1A1A1A]"
                    : hechos === items.length
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {c.numero}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cláusula actual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Cláusula {clausula.numero} de {CLAUSULAS_DIAGNOSTICO[CLAUSULAS_DIAGNOSTICO.length - 1].numero}
            </p>
            <h2 className="text-lg font-bold text-[#1A1A1A]">{clausula.titulo}</h2>
          </div>
          <span className="text-xs font-bold text-gray-400 flex-shrink-0">
            {respondidasClausula}/{itemsClausula.length}
          </span>
        </div>

        <div className="space-y-8">
          {clausula.subclausulas.map((sub) => (
            <div key={sub.numeral}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#F5A623" }}>
                {sub.numeral} — {sub.titulo}
              </p>
              <div className="space-y-5">
                {sub.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                    <p className="text-sm text-[#1A1A1A] mb-3 leading-relaxed">{item.texto}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OPCIONES_DIAGNOSTICO.map((op) => {
                        const seleccionada = respuestas[item.id] === op.valor;
                        return (
                          <button
                            key={op.letra}
                            onClick={() => responder(item.id, op.valor)}
                            title={op.descripcion}
                            className={`text-left rounded-lg px-3 py-2 text-xs font-medium border transition-colors ${
                              seleccionada
                                ? "border-[#F5A623] bg-[#FFF6E5] text-[#1A1A1A]"
                                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-[#FAFAFA]"
                            }`}
                          >
                            <span className="font-bold">{op.letra}.</span> {op.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso de cláusulas incompletas */}
      {esUltima && !completo && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">
            Te faltan {TOTAL_ITEMS_DIAGNOSTICO - respondidas} criterios por responder para ver tu resultado:
          </p>
          <div className="flex flex-wrap gap-2">
            {CLAUSULAS_DIAGNOSTICO.map((c, i) => {
              const items = c.subclausulas.flatMap((s) => s.items);
              const faltan = items.filter((it) => !(it.id in respuestas)).length;
              if (faltan === 0) return null;
              return (
                <button
                  key={c.numero}
                  onClick={() => setClausulaIdx(i)}
                  className="text-xs font-semibold bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                >
                  {c.numero}. {c.titulo} — faltan {faltan}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-4 sticky bottom-4">
        <button
          onClick={() => setClausulaIdx((i) => Math.max(0, i - 1))}
          disabled={esPrimera}
          className="text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40"
        >
          ← Anterior
        </button>

        {esUltima ? (
          <button
            onClick={() => setVerResultados(true)}
            disabled={!completo}
            title={!completo ? "Respondé todos los criterios para ver tu resultado" : undefined}
            className="text-sm font-bold px-6 py-2.5 rounded-lg text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ver resultado del diagnóstico →
          </button>
        ) : (
          <button
            onClick={() => setClausulaIdx((i) => Math.min(CLAUSULAS_DIAGNOSTICO.length - 1, i + 1))}
            className="text-sm font-bold px-6 py-2.5 rounded-lg text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410]"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
