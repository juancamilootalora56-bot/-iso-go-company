"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseInventario,
  colorEstadoItem,
  colorCriticidadItem,
  estadoMantenimiento,
  estadoCalibracion,
  colorEstadoAlerta,
} from "@/lib/inventario";

const ITEM_KEY = "inventario_lista";

export default function ListaMaestraInventarioPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const items = parseInventario(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión Operativa
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lista Maestra de Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">Hoja de vida de cada máquina, equipo, herramienta o instrumento.</p>
        </div>
        <Link href={`${basePath}/inscripcion_inventario`} className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]">
          + Agregar / editar ítem
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún ítem de inventario.</p>
          <Link href={`${basePath}/inscripcion_inventario`} className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm">
            Agregar ítem
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((i) => {
            const alertaMant = estadoMantenimiento(i);
            const alertaCal = estadoCalibracion(i);
            return (
              <Link
                key={i.id}
                href={`${basePath}/lista_maestra_inventario/${i.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#F5A623]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {i.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imagen} alt={i.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">⚙️</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A] truncate">{i.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{i.tipo} {i.codigo && <>· {i.codigo}</>}</p>
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      {i.estado && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoItem(i.estado) }}>
                          {i.estado}
                        </span>
                      )}
                      {i.criticidad && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorCriticidadItem(i.criticidad) }}>
                          {i.criticidad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {(alertaMant === "vencido" || alertaMant === "proximo" || alertaCal === "vencido" || alertaCal === "proximo") && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-gray-50">
                    {(alertaMant === "vencido" || alertaMant === "proximo") && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: colorEstadoAlerta(alertaMant), backgroundColor: `${colorEstadoAlerta(alertaMant)}1A` }}>
                        🛠️ Mantenimiento {alertaMant === "vencido" ? "vencido" : "próximo"}
                      </span>
                    )}
                    {(alertaCal === "vencido" || alertaCal === "proximo") && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: colorEstadoAlerta(alertaCal), backgroundColor: `${colorEstadoAlerta(alertaCal)}1A` }}>
                        📏 Calibración {alertaCal === "vencido" ? "vencida" : "próxima"}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
