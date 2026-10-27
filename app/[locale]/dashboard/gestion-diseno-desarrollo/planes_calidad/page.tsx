"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parsePlanesCalidad,
  planCalidadVacio,
  siguienteRadicadoPC,
  numeroDeRadicadoPC,
  colorEstadoPlanCalidad,
  cumplimientoPlan,
  type PlanCalidad,
} from "@/lib/planesCalidad";

const ITEM_KEY = "planes_calidad_lista";

export default function PlanesCalidadListaPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-diseno-desarrollo`;

  const { docs, loading, save } = useGestionDocumentos("diseno_desarrollo", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const todos = parsePlanesCalidad(docs[ITEM_KEY] ?? "");
  // Un colaborador solo ve los planes de calidad puntuales que se le
  // compartieron desde el selector del propio plan.
  const planes = colaborador
    ? todos.filter((p) => p.colaboradoresConAcceso?.includes(colaborador.empleadoId ?? ""))
    : todos;

  async function nuevoPlan() {
    const nuevo = planCalidadVacio(siguienteRadicadoPC(planes.map((p) => numeroDeRadicadoPC(p.codigo))));
    const actualizados = [...planes, nuevo];
    await save(ITEM_KEY, JSON.stringify(actualizados));
    router.push(`${basePath}/planes_calidad/${nuevo.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de Diseño y Desarrollo
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Planes de Calidad</h1>
          <p className="text-gray-500 text-sm mt-1">Un plan de calidad por cada producto, proyecto o contrato (ISO 9001 / guía ISO 10005).</p>
        </div>
        {!colaborador && (
          <button
            type="button"
            onClick={nuevoPlan}
            className="text-sm text-[#14B8A6] font-semibold hover:text-[#0d9488]"
          >
            + Nuevo plan de calidad
          </button>
        )}
      </div>

      {planes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {colaborador ? "Todavía no te compartieron ningún plan de calidad." : "Todavía no creaste ningún plan de calidad."}
          </p>
          {!colaborador && (
            <button
              type="button"
              onClick={nuevoPlan}
              className="inline-block bg-[#14B8A6] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#0d9488] text-sm"
            >
              Crear el primer plan de calidad
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planes.map((p: PlanCalidad) => {
            const cumplimiento = cumplimientoPlan(p);
            return (
              <Link
                key={p.id}
                href={`${basePath}/planes_calidad/${p.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#14B8A6]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E6FFFB] to-[#CCFBF1] flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                    {p.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.foto} alt={p.nombreProyecto} className="w-full h-full object-cover" />
                    ) : (
                      "📑"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A] truncate">{p.nombreProyecto || "Sin nombre"}</p>
                    <p className="text-xs text-gray-500 truncate font-mono">{p.codigo}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: colorEstadoPlanCalidad(p.estado) }}
                      >
                        {p.estado}
                      </span>
                      {cumplimiento !== null && (
                        <span className="text-[10px] font-bold text-gray-400">{cumplimiento}% completado</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
