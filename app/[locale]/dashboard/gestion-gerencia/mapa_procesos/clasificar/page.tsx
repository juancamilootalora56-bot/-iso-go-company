"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseLista, parseClasificacion, type CategoriaProceso } from "@/lib/mapaProcesos";
import { Target, Workflow, ShieldCheck, type LucideIcon } from "lucide-react";

const ITEM_KEY_SELECCION = "mapa_procesos_seleccion";
const ITEM_KEY_CLASIFICACION = "mapa_procesos_clasificacion";

const CATEGORIAS: { key: CategoriaProceso; label: string; color: string; colorHasta: string; icono: LucideIcon }[] = [
  { key: "estrategicos", label: "Estratégicos", color: "#6366F1", colorHasta: "#4338CA", icono: Target },
  { key: "misionales", label: "Misionales", color: "#F5A623", colorHasta: "#e09410", icono: Workflow },
  { key: "apoyo", label: "de Apoyo", color: "#2DD4CF", colorHasta: "#0d8f8e", icono: ShieldCheck },
];

// Cada proceso es una ficha con 3 puntos de color — clickear uno lo asigna
// (o reasigna) a esa categoría al instante, y la ficha "salta" visualmente
// a su columna. Así clasificar se siente como ordenar, no como completar
// un formulario.
function FichaProceso({
  proceso,
  categoriaActual,
  onAsignar,
}: {
  proceso: string;
  categoriaActual: CategoriaProceso | "";
  onAsignar: (categoria: CategoriaProceso) => void;
}) {
  const cat = CATEGORIAS.find((c) => c.key === categoriaActual);
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
        cat ? "bg-white shadow-sm" : "bg-gray-50 border-dashed"
      }`}
      style={{ borderColor: cat ? cat.color : "#E5E7EB" }}
    >
      <span className="text-[13px] font-semibold text-[#1A1A1A] flex-1 min-w-0 truncate">{proceso}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {CATEGORIAS.map((c) => {
          const activo = categoriaActual === c.key;
          const Icono = c.icono;
          return (
            <button
              key={c.key}
              type="button"
              title={c.label}
              onClick={() => onAsignar(c.key)}
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                activo ? "scale-110" : "opacity-40 hover:opacity-80"
              }`}
              style={{ borderColor: c.color, background: activo ? c.color : "transparent" }}
            >
              <Icono size={11} className={activo ? "text-white" : "text-gray-400"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MapaProcesosClasificarPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading, save } = useGestionDocumentos("gerencia", user?.id ?? null);

  const [clasificacion, setClasificacion] = useState<Record<string, CategoriaProceso | "">>({});
  const [saving, setSaving] = useState(false);

  const procesos = parseLista(docs[ITEM_KEY_SELECCION] ?? "");

  useEffect(() => {
    if (!loading) {
      const existente = parseClasificacion(docs[ITEM_KEY_CLASIFICACION] ?? "");
      const next: Record<string, CategoriaProceso | ""> = {};
      procesos.forEach((p) => {
        next[p] = existente[p] ?? "";
      });
      setClasificacion(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function asignar(proceso: string, categoria: CategoriaProceso) {
    setClasificacion((prev) => ({ ...prev, [proceso]: prev[proceso] === categoria ? "" : categoria }));
  }

  const clasificados = procesos.filter((p) => clasificacion[p]);
  const sinClasificar = procesos.filter((p) => !clasificacion[p]);
  const todosClasificados = procesos.length > 0 && sinClasificar.length === 0;

  async function handleGuardar() {
    setSaving(true);
    await save(ITEM_KEY_CLASIFICACION, JSON.stringify(clasificacion));
    setSaving(false);
    router.push(`${basePath}/mapa_procesos/resultado`);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (procesos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Gestión de la Gerencia
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Primero seleccioná los procesos de tu empresa.</p>
          <Link
            href={`${basePath}/mapa_procesos`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Seleccionar procesos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Link href={`${basePath}/mapa_procesos`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Volver a selección
      </Link>

      {/* Encabezado — mismo lenguaje visual que el Paso 1 */}
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
              Paso 2 de 3
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Mapa de Procesos</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Clickeá el punto de color para asignar cada proceso a su categoría — se ordena solo, al instante.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-white text-2xl font-extrabold">
              {clasificados.length}/{procesos.length}
            </p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide">Clasificados</p>
          </div>
        </div>
      </div>

      {/* Bandeja de procesos sin clasificar todavía */}
      {sinClasificar.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 border-dashed rounded-xl p-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-3">
            Sin clasificar ({sinClasificar.length})
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sinClasificar.map((p) => (
              <FichaProceso
                key={p}
                proceso={p}
                categoriaActual={clasificacion[p] ?? ""}
                onAsignar={(c) => asignar(p, c)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Las 3 categorías — cada proceso clasificado aparece acá, en vivo */}
      <div className="grid md:grid-cols-3 gap-4">
        {CATEGORIAS.map((c) => {
          const propios = procesos.filter((p) => clasificacion[p] === c.key);
          const Icono = c.icono;
          return (
            <div key={c.key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ background: `linear-gradient(to right, ${c.color}, ${c.colorHasta})` }}
              >
                <Icono size={16} className="text-white flex-shrink-0" />
                <span className="text-white text-xs font-bold uppercase tracking-wide flex-1">{c.label}</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {propios.length}
                </span>
              </div>
              <div className="p-3 flex-1 space-y-2 min-h-[72px]">
                {propios.length === 0 ? (
                  <p className="text-gray-300 text-xs italic text-center py-4">Todavía no hay procesos acá</p>
                ) : (
                  propios.map((p) => (
                    <FichaProceso
                      key={p}
                      proceso={p}
                      categoriaActual={clasificacion[p] ?? ""}
                      onAsignar={(cat) => asignar(p, cat)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {!todosClasificados && <p className="text-xs text-gray-400">Clasificá todos los procesos para continuar.</p>}
        <button
          onClick={handleGuardar}
          disabled={saving || !todosClasificados}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-40 transition-colors flex-shrink-0"
        >
          {saving ? "Guardando..." : "Guardar y ver mapa →"}
        </button>
      </div>
    </div>
  );
}
