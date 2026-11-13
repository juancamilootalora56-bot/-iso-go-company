"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  GRUPOS_INTERESADOS,
  parseSeleccion,
  parseDetalles,
  detalleKey,
  type DetalleRequisito,
  type GrupoInteresado,
} from "@/lib/partesInteresadasItems";
import { Search } from "lucide-react";

const ITEM_KEY_SELECCION = "matriz_cliente_partes_interesadas_seleccion";
const ITEM_KEY_DETALLES = "matriz_cliente_partes_interesadas_detalles";

export default function MatrizPartesInteresadasResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [detalles, setDetalles] = useState<Record<string, DetalleRequisito>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState<GrupoInteresado | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!loading) {
      setDetalles(parseDetalles(docs[ITEM_KEY_DETALLES] ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const seleccion = parseSeleccion(docs[ITEM_KEY_SELECCION] ?? "");

  const filasTotales = GRUPOS_INTERESADOS.flatMap((g) =>
    seleccion[g.key].map((requisito) => ({ grupo: g, requisito }))
  );

  const conteoPorGrupo = Object.fromEntries(
    GRUPOS_INTERESADOS.map((g) => [g.key, seleccion[g.key].length])
  ) as Record<GrupoInteresado, number>;

  const completas = filasTotales.filter((f) => {
    const d = detalles[detalleKey(f.grupo.key, f.requisito)];
    return d && d.definicion.trim() && d.expectativas.trim() && d.registros.trim();
  }).length;

  const busquedaNorm = busqueda.trim().toLowerCase();
  const filas = filasTotales.filter((f) => {
    if (filtroGrupo !== "todos" && f.grupo.key !== filtroGrupo) return false;
    if (!busquedaNorm) return true;
    const d = detalles[detalleKey(f.grupo.key, f.requisito)] ?? { definicion: "", expectativas: "", registros: "" };
    const texto = `${f.requisito} ${d.definicion} ${d.expectativas} ${d.registros}`.toLowerCase();
    return texto.includes(busquedaNorm);
  });

  function updateDetalle(key: string, campo: keyof DetalleRequisito, valor: string) {
    setDetalles((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { definicion: "", expectativas: "", registros: "" }), [campo]: valor },
    }));
    setSaved(false);
  }

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_DETALLES, JSON.stringify(detalles));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Análisis estratégico
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Matriz de Clientes y Partes Interesadas</h1>
            <p className="text-gray-400 text-sm mt-1">Completá la definición, expectativas y registros de cada requisito.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">
                {completas}/{filasTotales.length}
              </p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Completos</p>
            </div>
            <Link
              href={`${basePath}/matriz_cliente_partes_interesadas`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
            >
              ✎ Editar selección
            </Link>
          </div>
        </div>
      </div>

      {filasTotales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no seleccionaste ningún requisito.</p>
          <Link
            href={`${basePath}/matriz_cliente_partes_interesadas`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Completar matriz
          </Link>
        </div>
      ) : (
        <>
          {/* Filtros: por grupo + búsqueda libre */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setFiltroGrupo("todos")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                filtroGrupo === "todos"
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Todos ({filasTotales.length})
            </button>
            {GRUPOS_INTERESADOS.filter((g) => conteoPorGrupo[g.key] > 0).map((g) => {
              const activo = filtroGrupo === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setFiltroGrupo(activo ? "todos" : g.key)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                  style={
                    activo
                      ? { background: g.color, borderColor: g.color, color: "#fff" }
                      : { borderColor: "#E5E7EB", color: "#6B7280" }
                  }
                >
                  {g.label} ({conteoPorGrupo[g.key]})
                </button>
              );
            })}

            <div className="relative ml-auto w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar requisito o texto..."
                className="w-full bg-white border border-gray-200 rounded-full pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors"
              />
            </div>
          </div>

          {filas.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              Ningún requisito coincide con el filtro.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-auto max-h-[70vh]">
              <table className="w-full text-xs min-w-[900px] border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="p-3 font-semibold border-b border-gray-100 w-10 bg-gray-50">#</th>
                    <th className="p-3 font-semibold border-b border-gray-100 w-32 bg-gray-50">Partes de interés</th>
                    <th className="p-3 font-semibold border-b border-gray-100 w-36 bg-gray-50">Requisito</th>
                    <th className="p-3 font-semibold border-b border-gray-100 bg-gray-50">Definición</th>
                    <th className="p-3 font-semibold border-b border-gray-100 bg-gray-50">Expectativas</th>
                    <th className="p-3 font-semibold border-b border-gray-100 w-40 bg-gray-50">Registros</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, idx) => {
                    const key = detalleKey(fila.grupo.key, fila.requisito);
                    const detalle = detalles[key] ?? { definicion: "", expectativas: "", registros: "" };
                    const completa = detalle.definicion.trim() && detalle.expectativas.trim() && detalle.registros.trim();
                    return (
                      <tr
                        key={key}
                        className="border-b border-gray-50 align-top hover:bg-[#FAFAFA] transition-colors"
                        style={{ borderLeft: `3px solid ${completa ? fila.grupo.color : "transparent"}` }}
                      >
                        <td className="p-3 text-gray-400">{idx + 1}</td>
                        <td className="p-3">
                          <span
                            className="text-[10px] font-bold text-white px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: fila.grupo.color }}
                          >
                            {fila.grupo.label}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-[#1A1A1A]">{fila.requisito}</td>
                        <td className="p-2">
                          <textarea
                            value={detalle.definicion}
                            onChange={(e) => updateDetalle(key, "definicion", e.target.value)}
                            rows={2}
                            placeholder="¿Qué significa este requisito?"
                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            value={detalle.expectativas}
                            onChange={(e) => updateDetalle(key, "expectativas", e.target.value)}
                            rows={2}
                            placeholder="¿Qué espera esta parte interesada?"
                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={detalle.registros}
                            onChange={(e) => updateDetalle(key, "registros", e.target.value)}
                            placeholder="Ej: Estados financieros"
                            className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Barra de guardar — fija abajo para no tener que scrollear toda la tabla */}
          <div className="sticky bottom-4 mt-4 flex items-center gap-3 bg-white/95 backdrop-blur border border-gray-100 rounded-xl p-3 shadow-lg w-fit">
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {saved && <span className="text-green-600 text-sm font-semibold">✓ Guardado</span>}
          </div>
        </>
      )}
    </div>
  );
}
