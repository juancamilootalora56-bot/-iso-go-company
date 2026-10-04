"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { itemKeyFoda as itemKeyFodaSeleccion, parseFodaItems } from "@/lib/fodaItems";
import {
  IMPACTO_OPCIONES,
  PROBABILIDAD_OPCIONES,
  calcularNivelRiesgo,
  parseFilasRiesgo,
  DOFA_LABEL,
  DOFA_TIPO,
  DOFA_EFECTO,
  type RiesgoFila,
} from "@/lib/riesgos";

const CATS_GERENCIA = ["debilidades", "amenazas"] as const;

type FilaConFuente = RiesgoFila & { _sourceKey: string };

export default function MatrizRiesgosResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [filas, setFilas] = useState<FilaConFuente[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (loading || inicializado) return;

    const todas: FilaConFuente[] = [];
    Object.keys(docs)
      .filter((k) => k.startsWith("riesgos_matriz_"))
      .forEach((k) => {
        parseFilasRiesgo(docs[k] ?? "").forEach((f) => todas.push({ ...f, _sourceKey: k }));
      });

    // Si Gerencia todavía no generó sus filas, armarlas ahora desde el FODA general.
    if (!docs["riesgos_matriz_gerencia"]) {
      CATS_GERENCIA.forEach((cat) => {
        const items = parseFodaItems(docs[itemKeyFodaSeleccion(cat)] ?? "");
        items.forEach((texto) => {
          todas.push({
            id: crypto.randomUUID(),
            riesgo: texto,
            proceso: "Gerencia / Dueños",
            tipo: DOFA_TIPO[cat],
            dofa: DOFA_LABEL[cat],
            descripcion: "",
            efecto: DOFA_EFECTO[cat],
            impacto: "",
            probabilidad: "",
            control: "",
            porcentaje: 0,
            estado: "",
            _sourceKey: "riesgos_matriz_gerencia",
          });
        });
      });
    }

    setFilas(todas);
    setInicializado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, inicializado]);

  function update(id: string, campo: keyof RiesgoFila, valor: string | number) {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
    setSaved(false);
  }

  async function handleGuardar() {
    setSaving(true);
    const porFuente = new Map<string, RiesgoFila[]>();
    filas.forEach((f) => {
      const { _sourceKey, ...resto } = f;
      if (!porFuente.has(_sourceKey)) porFuente.set(_sourceKey, []);
      porFuente.get(_sourceKey)!.push(resto);
    });
    await Promise.all(
      Array.from(porFuente.entries()).map(([key, arr]) => save(key, JSON.stringify(arr)))
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !inicializado) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`${basePath}/matriz_gestion_riesgos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Matriz de la Gestión de Riesgos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Riesgos</h1>
        <p className="text-gray-500 text-sm mt-1">Todos los riesgos de todos los procesos, en una sola matriz.</p>
      </div>

      {filas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste riesgos de ningún proceso.</p>
          <Link
            href={`${basePath}/matriz_gestion_riesgos`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Elegir un proceso
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-xs min-w-[1500px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-2 font-semibold border-b border-gray-100 w-8">#</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-40">Proceso</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-48">Riesgo</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-24">Tipo</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-24">DOFA</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-56">Descripción</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-24">Efecto</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-32">Impacto</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-32">Probabilidad</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-32">Nivel de riesgo</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-56">Control</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-20">% impl.</th>
                  <th className="p-2 font-semibold border-b border-gray-100 w-32">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, idx) => {
                  const nivel = calcularNivelRiesgo(f.impacto, f.probabilidad);
                  return (
                    <tr key={f.id} className="border-b border-gray-50 align-top">
                      <td className="p-2 text-gray-400">{idx + 1}</td>
                      <td className="p-2 text-gray-600 font-medium">{f.proceso}</td>
                      <td className="p-2 font-medium text-[#1A1A1A]">{f.riesgo}</td>
                      <td className="p-2 text-gray-600">{f.tipo}</td>
                      <td className="p-2 text-gray-600">{f.dofa}</td>
                      <td className="p-2">
                        <textarea
                          value={f.descripcion}
                          onChange={(e) => update(f.id, "descripcion", e.target.value)}
                          rows={2}
                          placeholder="Describí el riesgo..."
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                        />
                      </td>
                      <td className="p-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${f.efecto === "Negativo" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                          {f.efecto}
                        </span>
                      </td>
                      <td className="p-2">
                        <select
                          value={f.impacto}
                          onChange={(e) => update(f.id, "impacto", e.target.value)}
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                        >
                          <option value="">Seleccionar</option>
                          {IMPACTO_OPCIONES.map((o) => (
                            <option key={o.key} value={o.key}>{o.key}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={f.probabilidad}
                          onChange={(e) => update(f.id, "probabilidad", e.target.value)}
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                        >
                          <option value="">Seleccionar</option>
                          {PROBABILIDAD_OPCIONES.map((o) => (
                            <option key={o.key} value={o.key}>{o.key}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        {nivel.label ? (
                          <span
                            className="block text-center text-[10px] font-bold px-2 py-1.5 rounded text-white"
                            style={{ backgroundColor: nivel.color }}
                          >
                            {nivel.label}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <textarea
                          value={f.control}
                          onChange={(e) => update(f.id, "control", e.target.value)}
                          rows={2}
                          placeholder="Acción de control..."
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623] resize-y"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={f.porcentaje}
                          onChange={(e) => update(f.id, "porcentaje", Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={f.estado}
                          onChange={(e) => update(f.id, "estado", e.target.value)}
                          placeholder="Ej: En proceso"
                          className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#F5A623]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
            <Link
              href={`${basePath}/matriz_gestion_riesgos`}
              className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410] ml-auto"
            >
              + Agregar riesgos de otro proceso
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
