"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseProcedimientos,
  procedimientoVacio,
  siguienteCodigo,
  numeroDeCodigo,
  colorEstadoDocumento,
  resumenPorEstado,
  type Procedimiento,
} from "@/lib/procedimientos";
import { parseLista, parseClasificacion, CATEGORIAS_PROCESO } from "@/lib/mapaProcesos";
import { FileText, Plus, Compass, Target, Layers, FolderOpen, Info } from "lucide-react";

const ITEM_KEY = "procedimientos_lista";
const NARANJA = "#F97316";

const ESTILO_CATEGORIA: Record<string, { icono: typeof Compass; color: string }> = {
  estrategicos: { icono: Compass, color: "#7C3AED" },
  misionales: { icono: Target, color: "#2563EB" },
  apoyo: { icono: Layers, color: "#16A34A" },
  "": { icono: FolderOpen, color: "#6B7280" },
};

export default function ProcedimientosPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const todos = useMemo(() => parseProcedimientos(docs[ITEM_KEY] ?? ""), [docs]);
  // Un colaborador solo ve los procedimientos puntuales que se le compartieron
  // desde el selector del propio registro (independiente de tener o no el
  // módulo Gestión de Calidad asignado completo desde su perfil).
  const procedimientos = useMemo(
    () => (colaborador ? todos.filter((p) => p.colaboradoresConAcceso?.includes(colaborador.empleadoId ?? "")) : todos),
    [todos, colaborador]
  );
  const procesosMapa = useMemo(() => parseLista(docsGerencia["mapa_procesos_seleccion"] ?? ""), [docsGerencia]);
  const clasificacion = useMemo(() => parseClasificacion(docsGerencia["mapa_procesos_clasificacion"] ?? ""), [docsGerencia]);

  const resumen = resumenPorEstado(procedimientos);

  async function nuevoProcedimiento() {
    const codigo = siguienteCodigo("PRO", procedimientos.map((p) => numeroDeCodigo(p.codigo)));
    const nuevo = procedimientoVacio(codigo);
    await save(ITEM_KEY, JSON.stringify([...procedimientos, nuevo]));
    router.push(`${basePath}/procedimientos/${nuevo.id}`);
  }

  // Agrupar: primero por categoría del mapa de procesos, luego por proceso dentro de cada categoría.
  const grupos = useMemo(() => {
    const categorias = CATEGORIAS_PROCESO.map((c) => ({
      ...c,
      procesos: procesosMapa.filter((p) => (clasificacion[p] ?? "") === c.key),
    }));
    const sinClasificar = procesosMapa.filter((p) => !clasificacion[p]);
    if (sinClasificar.length > 0) {
      categorias.push({ key: "" as "estrategicos" | "misionales" | "apoyo", label: "Sin clasificar", procesos: sinClasificar });
    }

    // Procesos que tienen procedimientos pero ya no están en el mapa (o el mapa no se ha cargado).
    const procesosConDocs = Array.from(new Set(procedimientos.map((p) => p.proceso).filter(Boolean)));
    const procesosConocidos = new Set(procesosMapa);
    const huerfanos = procesosConDocs.filter((p) => !procesosConocidos.has(p));
    if (huerfanos.length > 0) {
      categorias.push({ key: "" as "estrategicos" | "misionales" | "apoyo", label: "Otros procesos", procesos: huerfanos });
    }

    return categorias
      .map((cat) => ({
        ...cat,
        items: cat.procesos.map((proceso) => ({
          proceso,
          procedimientos: procedimientos.filter((p) => p.proceso === proceso),
        })),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [procesosMapa, clasificacion, procedimientos]);

  const sinProceso = procedimientos.filter((p) => !p.proceso);

  if (loading || loadingGerencia) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Gestión de Calidad
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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${NARANJA}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NARANJA }}>
              Gestión de Calidad · ISO 9001 cl. 7.5
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Gestión de Procedimientos</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Listado maestro organizado según el Mapa de Procesos. Cada procedimiento puede tener instructivos y
              formatos asociados.
            </p>
          </div>
          {!colaborador && (
            <button
              onClick={nuevoProcedimiento}
              className="flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm flex-shrink-0"
              style={{ backgroundColor: NARANJA }}
            >
              <Plus size={16} strokeWidth={2.5} /> Nuevo procedimiento
            </button>
          )}
        </div>

        {procedimientos.length > 0 && (
          <div className="relative z-10 flex items-center gap-5 mt-5 pt-5 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{procedimientos.length}</span>
              <span className="text-xs text-gray-400">procedimientos</span>
            </div>
            {resumen.map((r) => (
              <div key={r.estado} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-sm font-bold text-white">{r.cantidad}</span>
                <span className="text-xs text-gray-400">{r.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {procesosMapa.length === 0 && (
        <div className="flex items-start gap-3 bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
          <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#F5A623" }} />
          <p>
            Todavía no cargaste el <strong>Mapa de Procesos</strong>. Podés crear procedimientos de todas formas —
            vas a poder escribir el nombre del proceso manualmente, y cuando cargues el mapa quedarán agrupados
            automáticamente.
          </p>
        </div>
      )}

      {procedimientos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <FileText size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-gray-500 text-sm mb-2">
            {colaborador ? "Todavía no te compartieron ningún procedimiento." : "Todavía no hay procedimientos registrados."}
          </p>
          {!colaborador && (
            <button onClick={nuevoProcedimiento} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
              Crear el primero →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => {
            const estilo = ESTILO_CATEGORIA[grupo.key] ?? ESTILO_CATEGORIA[""];
            const Icono = estilo.icono;
            return (
              <div key={grupo.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100" style={{ background: `${estilo.color}0A` }}>
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${estilo.color}18` }}>
                    <Icono size={14} style={{ color: estilo.color }} strokeWidth={2.25} />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: estilo.color }}>
                    {grupo.label}
                  </h2>
                </div>
                <div className="p-5 space-y-5">
                  {grupo.items.map(({ proceso, procedimientos: items }) => (
                    <div key={proceso}>
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {proceso} <span className="text-gray-300 font-normal">· {items.length}</span>
                      </p>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-300 italic pl-1 border border-dashed border-gray-200 rounded-lg py-2.5 px-3">
                          Sin procedimientos todavía.
                        </p>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {items.map((p) => (
                            <TarjetaProcedimiento key={p.id} procedimiento={p} basePath={basePath} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {sinProceso.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gray-200">
                  <FolderOpen size={14} className="text-gray-500" strokeWidth={2.25} />
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Sin proceso asignado</h2>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-2.5">
                {sinProceso.map((p) => (
                  <TarjetaProcedimiento key={p.id} procedimiento={p} basePath={basePath} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TarjetaProcedimiento({ procedimiento, basePath }: { procedimiento: Procedimiento; basePath: string }) {
  const color = colorEstadoDocumento(procedimiento.estado);
  return (
    <Link
      href={`${basePath}/procedimientos/${procedimiento.id}`}
      className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 border-l-4 p-3.5 hover:shadow-md transition-all"
      style={{ borderLeftColor: color }}
    >
      <span className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: `${NARANJA}18` }}>
        <FileText size={18} style={{ color: NARANJA }} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-gray-400">{procedimiento.codigo}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
            {procedimiento.estado}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#1A1A1A] truncate mt-0.5">{procedimiento.nombre || "Sin nombre"}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">v{procedimiento.version}</p>
      </div>
      <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F97316] transition-colors">›</span>
    </Link>
  );
}
