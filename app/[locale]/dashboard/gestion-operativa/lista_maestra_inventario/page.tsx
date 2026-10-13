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
    <div className="max-w-6xl mx-auto">
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
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-3 font-semibold border-b border-gray-100 w-12 text-center">#</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Ítem</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Tipo</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Código</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Ubicación</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Estado</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Criticidad</th>
                  <th className="p-3 font-semibold border-b border-gray-100">Alertas</th>
                  <th className="p-3 font-semibold border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => {
                  const alertaMant = estadoMantenimiento(i);
                  const alertaCal = estadoCalibracion(i);
                  const hayAlerta =
                    alertaMant === "vencido" || alertaMant === "proximo" || alertaCal === "vencido" || alertaCal === "proximo";
                  return (
                    <tr key={i.id} className="border-b border-gray-50 hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-3 text-center text-gray-400 font-bold">{idx + 1}</td>
                      <td className="p-3">
                        <Link href={`${basePath}/lista_maestra_inventario/${i.id}`} className="flex items-center gap-3 group min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {i.imagen ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={i.imagen} alt={i.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base">⚙️</span>
                            )}
                          </div>
                          <span className="font-semibold text-[#1A1A1A] group-hover:text-[#F5A623] transition-colors truncate">{i.nombre}</span>
                        </Link>
                      </td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{i.tipo || "—"}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{i.codigo || "—"}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap max-w-[180px] truncate">{i.ubicacion || "—"}</td>
                      <td className="p-3 whitespace-nowrap">
                        {i.estado ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoItem(i.estado) }}>
                            {i.estado}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {i.criticidad ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorCriticidadItem(i.criticidad) }}>
                            {i.criticidad}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3">
                        {hayAlerta ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(alertaMant === "vencido" || alertaMant === "proximo") && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{ color: colorEstadoAlerta(alertaMant), backgroundColor: `${colorEstadoAlerta(alertaMant)}1A` }}
                              >
                                🛠️ {alertaMant === "vencido" ? "Vencido" : "Próximo"}
                              </span>
                            )}
                            {(alertaCal === "vencido" || alertaCal === "proximo") && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{ color: colorEstadoAlerta(alertaCal), backgroundColor: `${colorEstadoAlerta(alertaCal)}1A` }}
                              >
                                📏 {alertaCal === "vencido" ? "Vencida" : "Próxima"}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link href={`${basePath}/lista_maestra_inventario/${i.id}`} className="text-[#F5A623] font-semibold hover:text-[#e09410] text-xs">
                          Ver hoja de vida →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
