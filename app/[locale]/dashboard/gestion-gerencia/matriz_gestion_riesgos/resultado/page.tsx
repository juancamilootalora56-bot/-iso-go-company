"use client";

import { useEffect, useRef, useState } from "react";
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
import { Search } from "lucide-react";

const CATS_GERENCIA = ["debilidades", "amenazas"] as const;

type FilaConFuente = RiesgoFila & { _sourceKey: string };

const NIVELES = ["Riesgo Extremo", "Alto Riesgo", "Riesgo Moderado", "Riesgo Inferior"];

// Paleta sutil para distinguir procesos de un vistazo en la columna
// "Proceso" — cada nombre de proceso siempre cae en el mismo color (hash
// simple), sin depender de un catálogo fijo de procesos.
const PALETA_PROCESO = [
  "#6366F1", "#0EA5A4", "#E8366B", "#2EA3F2", "#7C4DFF",
  "#22C55E", "#F97316", "#06B6D4", "#D946EF", "#64748B",
];
function colorDeProceso(nombre: string) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0;
  return PALETA_PROCESO[hash % PALETA_PROCESO.length];
}

// Textarea que crece solo con el contenido — para poder leer todo el texto
// sin tener que arrastrar manualmente el recuadro.
function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-[#FAFAFA] border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#F5A623] resize-none overflow-hidden min-h-[30px]"
    />
  );
}

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
  const [filtroProceso, setFiltroProceso] = useState("todos");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

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

  const procesos = Array.from(new Set(filas.map((f) => f.proceso)));
  const busquedaNorm = busqueda.trim().toLowerCase();

  const filasFiltradas = filas.filter((f) => {
    if (filtroProceso !== "todos" && f.proceso !== filtroProceso) return false;
    if (filtroNivel !== "todos" && calcularNivelRiesgo(f.impacto, f.probabilidad).label !== filtroNivel) return false;
    if (busquedaNorm && !`${f.riesgo} ${f.descripcion}`.toLowerCase().includes(busquedaNorm)) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <Link href={`${basePath}/matriz_gestion_riesgos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Matriz de la Gestión de Riesgos
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
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Matriz de Riesgos</h1>
            <p className="text-gray-400 text-sm mt-1">Todos los riesgos de todos los procesos, en una sola matriz.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{filas.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Riesgos</p>
            </div>
            <Link
              href={`${basePath}/matriz_gestion_riesgos`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0 whitespace-nowrap"
            >
              + Agregar riesgos
            </Link>
          </div>
        </div>
      </div>

      {filas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
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
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select
              value={filtroProceso}
              onChange={(e) => setFiltroProceso(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#F5A623] text-gray-600"
            >
              <option value="todos">Todos los procesos ({filas.length})</option>
              {procesos.map((p) => (
                <option key={p} value={p}>
                  {p} ({filas.filter((f) => f.proceso === p).length})
                </option>
              ))}
            </select>

            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#F5A623] text-gray-600"
            >
              <option value="todos">Todos los niveles</option>
              {NIVELES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <div className="relative ml-auto w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar riesgo o descripción..."
                className="w-full bg-white border border-gray-200 rounded-full pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors"
              />
            </div>
          </div>

          {filasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              Ningún riesgo coincide con el filtro.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-auto max-h-[75vh]">
              <table className="w-full text-xs min-w-[1500px] border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#FAFAFA] text-left text-gray-500">
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-8 bg-[#FAFAFA]">#</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-40 bg-[#FAFAFA]">Proceso</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-48 bg-[#FAFAFA]">Riesgo</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-24 bg-[#FAFAFA]">Tipo</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-24 bg-[#FAFAFA]">DOFA</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-64 bg-[#FAFAFA]">Descripción</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-24 bg-[#FAFAFA]">Efecto</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Impacto</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Probabilidad</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Nivel de riesgo</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-64 bg-[#FAFAFA]">Control</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-20 bg-[#FAFAFA]">% impl.</th>
                    <th className="p-2.5 font-bold uppercase tracking-wide text-[10px] border-b-2 border-[#F5A623]/40 w-32 bg-[#FAFAFA]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filasFiltradas.map((f, idx) => {
                    const nivel = calcularNivelRiesgo(f.impacto, f.probabilidad);
                    const colorProceso = colorDeProceso(f.proceso);
                    return (
                      <tr key={f.id} className="border-b border-gray-50 align-top hover:bg-[#FAFAFA]/60 transition-colors">
                        <td className="p-2 text-gray-400">{idx + 1}</td>
                        <td className="p-2">
                          <span
                            className="inline-block text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ background: `${colorProceso}18`, color: colorProceso }}
                          >
                            {f.proceso}
                          </span>
                        </td>
                        <td className="p-2 font-medium text-[#1A1A1A]">{f.riesgo}</td>
                        <td className="p-2 text-gray-600">{f.tipo}</td>
                        <td className="p-2 text-gray-600">{f.dofa}</td>
                        <td className="p-2">
                          <AutoTextarea
                            value={f.descripcion}
                            onChange={(v) => update(f.id, "descripcion", v)}
                            placeholder="Describí el riesgo..."
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
                          <AutoTextarea
                            value={f.control}
                            onChange={(v) => update(f.id, "control", v)}
                            placeholder="Acción de control..."
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
          )}

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
