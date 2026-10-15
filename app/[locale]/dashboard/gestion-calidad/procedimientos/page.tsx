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

const ITEM_KEY = "procedimientos_lista";
const NARANJA = "#F97316";

export default function ProcedimientosPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading, save } = useGestionDocumentos("calidad", user?.id ?? null);
  const { docs: docsGerencia, loading: loadingGerencia } = useGestionDocumentos("gerencia", user?.id ?? null);

  const procedimientos = useMemo(() => parseProcedimientos(docs[ITEM_KEY] ?? ""), [docs]);
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Procedimientos</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Listado maestro de procedimientos, organizado según el Mapa de Procesos (ISO 9001, cl. 7.5). Cada
            procedimiento puede tener instructivos y formatos asociados.
          </p>
        </div>
        <button
          onClick={nuevoProcedimiento}
          className="bg-[#F97316] text-white font-bold px-4 py-2.5 rounded-lg hover:bg-[#C2410C] transition-colors text-sm flex-shrink-0"
        >
          + Nuevo procedimiento
        </button>
      </div>

      {procedimientos.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
            <span className="text-lg font-bold text-[#1A1A1A]">{procedimientos.length}</span>
            <span className="text-xs text-gray-500 ml-1.5">procedimientos</span>
          </div>
          {resumen.map((r) => (
            <div key={r.estado} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-bold text-[#1A1A1A]">{r.cantidad}</span>
              <span className="text-xs text-gray-500">{r.estado}</span>
            </div>
          ))}
        </div>
      )}

      {procesosMapa.length === 0 && (
        <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl p-4 text-sm text-gray-600">
          Todavía no cargaste el <strong>Mapa de Procesos</strong>. Podés crear procedimientos de todas formas —
          vas a poder escribir el nombre del proceso manualmente, y cuando cargues el mapa quedarán agrupados
          automáticamente.
        </div>
      )}

      {procedimientos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay procedimientos registrados.</p>
          <button onClick={nuevoProcedimiento} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <div key={grupo.label}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">{grupo.label}</h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-4">
                {grupo.items.map(({ proceso, procedimientos: items }) => (
                  <div key={proceso}>
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      {proceso} <span className="text-gray-300">· {items.length}</span>
                    </p>
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-300 italic pl-1">Sin procedimientos todavía.</p>
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
          ))}

          {sinProceso.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Sin proceso asignado</h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
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
  return (
    <Link
      href={`${basePath}/procedimientos/${procedimiento.id}`}
      className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#F97316]/40 hover:shadow-[0_4px_16px_-4px_rgba(249,115,22,0.2)] transition-all"
    >
      <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFF3E8] text-[#F97316] flex items-center justify-center text-base font-bold">
        📋
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-gray-400">{procedimiento.codigo}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: colorEstadoDocumento(procedimiento.estado) }}>
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
