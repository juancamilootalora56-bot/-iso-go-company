"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { parseProductos } from "@/lib/productosFabricados";
import { parseServicios } from "@/lib/servicios";
import { parseInventario, todosLosMantenimientos, todasLasCalibraciones } from "@/lib/inventario";
import { parseNoConformidades } from "@/lib/noConformidades";

export default function GestionOperativaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;
  const puedeVer = usePuedeVerActividad("operativa");

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);
  const cantidadProductos = parseProductos(docs["productos_lista"] ?? "").length;
  const cantidadServicios = parseServicios(docs["servicios_lista"] ?? "").length;
  const inventario = parseInventario(docs["inventario_lista"] ?? "");
  const cantidadInventario = inventario.length;
  const cantidadMantenimientos = todosLosMantenimientos(inventario).length + todasLasCalibraciones(inventario).length;
  const cantidadNoConformidades = parseNoConformidades(docs["no_conformidades_lista"] ?? "").length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión Operativa</h1>
        <p className="text-gray-500 text-sm mt-1">Procesos, indicadores y mejora continua de tu operación.</p>
      </div>

      <div className="space-y-2">
        {puedeVer("inscripcion_productos") && (
        <Link
          href={`${basePath}/inscripcion_productos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-operativa/mapa_procesos.jpg" alt="Alta de Producto" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Producto</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Formulario de alta de los productos que fabricás.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("lista_maestra_productos") && (
        <Link
          href={`${basePath}/lista_maestra_productos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🏭
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Operaciones</h2>
              {!loading && cantidadProductos > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadProductos}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil de cada producto y su diagrama de proceso operativo paso a paso.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("inscripcion_servicios") && (
        <Link
          href={`${basePath}/inscripcion_servicios`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🧰
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Servicio</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Formulario de alta de los servicios que prestás (para empresas sin productos físicos).
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("lista_maestra_servicios") && (
        <Link
          href={`${basePath}/lista_maestra_servicios`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🗂️
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Servicios</h2>
              {!loading && cantidadServicios > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadServicios}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil de cada servicio y su diagrama de proceso operativo paso a paso.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("inscripcion_inventario") && (
        <Link
          href={`${basePath}/inscripcion_inventario`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-operativa/indicadores_proceso.jpg" alt="Alta de Inventario" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Inventario</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Carga de máquinas, equipos, herramientas e instrumentos.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("lista_maestra_inventario") && (
        <Link
          href={`${basePath}/lista_maestra_inventario`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              📋
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Inventario</h2>
              {!loading && cantidadInventario > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadInventario}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Hoja de vida de cada máquina, equipo o herramienta.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("programa_mantenimiento") && (
        <Link
          href={`${basePath}/programa_mantenimiento`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🛠️
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Programa de Mantenimiento</h2>
              {!loading && cantidadMantenimientos > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadMantenimientos}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Vista consolidada de mantenimientos y calibraciones de todas las máquinas y equipos, con indicadores.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("no_conformidades") && (
        <Link
          href={`${basePath}/no_conformidades`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-operativa/no_conformidades.jpg" alt="No Conformidades" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">No Conformidades</h2>
              {!loading && cantidadNoConformidades > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadNoConformidades}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Control de producto no conforme: disposición, verificación y acción correctiva.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {/* Relación de Actividades: siempre visible, cada colaborador ve solo la suya. */}
        <Link
          href={`${basePath}/relacion_actividades`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🕒
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Relación de Actividades</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bitácora diaria por franjas horarias de cada colaborador, acumulada mes a mes.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
            <span className="text-2xl">🔒</span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Manufacturing Execution System</h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                🔒 Restringido
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Acceso restringido.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F5A623] font-semibold mb-2">¿Necesitás ayuda con esta área?</p>
        <p className="text-gray-400 text-sm mb-4">
          Un asesor de Iso Go puede acompañarte a implementarla dentro de tu sistema de gestión.
        </p>
        <a
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#C9790A] transition-colors text-sm"
        >
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}
