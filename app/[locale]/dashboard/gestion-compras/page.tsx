"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { parseProveedores } from "@/lib/proveedores";
import { parseRequisiciones } from "@/lib/requisicionPedidos";
import {
  FileSignature,
  Truck,
  ClipboardList,
  BarChart3,
  ShoppingCart,
  PackageCheck,
} from "lucide-react";

const ACENTO = "#F5A623";

export default function GestionComprasPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-compras`;
  const puedeVer = usePuedeVerActividad("compras");

  const { docs, loading } = useGestionDocumentos("compras", user?.id ?? null);
  const cantidadProveedores = parseProveedores(docs["proveedores_lista"] ?? "").length;
  const cantidadRequisiciones = parseRequisiciones(docs["requisiciones_pedidos_lista"] ?? "").length;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gestión de Compras</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">Proveedores, evaluaciones y control de tus adquisiciones.</p>
        </div>
      </div>

      <div className="space-y-2">
        {puedeVer("requisicion_pedidos") && (
        <Link
          href={`${basePath}/requisicion_pedidos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#2563EB" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#2563EB18" }}>
            <FileSignature size={22} style={{ color: "#2563EB" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Requisición de Pedidos</h2>
              {!loading && cantidadRequisiciones > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadRequisiciones}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Pipeline de compras: solicitud, autorización, cotización, selección y compra.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("inscripcion_proveedores") && (
        <Link
          href={`${basePath}/inscripcion_proveedores`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#16A34A" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#16A34A18" }}>
            <Truck size={22} style={{ color: "#16A34A" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Inscripción de Proveedores</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Formulario completo de alta, con logo del proveedor.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("lista_maestra_proveedores") && (
        <Link
          href={`${basePath}/lista_maestra_proveedores`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#0891B2" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#0891B218" }}>
            <ClipboardList size={22} style={{ color: "#0891B2" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Lista Maestra de Proveedores</h2>
              {!loading && cantidadProveedores > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadProveedores}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil individual de cada proveedor inscripto.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("indicadores_compras") && (
        <Link
          href={`${basePath}/indicadores_compras`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#F59E0B" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#F59E0B18" }}>
            <BarChart3 size={22} style={{ color: "#F59E0B" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Indicadores de Compras</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Evaluación de proveedores y comportamiento de las compras por mes, año y proveedor.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("ordenes_compra") && (
        <Link
          href={`${basePath}/ordenes_compra`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#E8366B" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#E8366B18" }}>
            <ShoppingCart size={22} style={{ color: "#E8366B" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Órdenes de Compra</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Registro y seguimiento de las compras realizadas a tus proveedores.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 opacity-70" style={{ borderLeftColor: "#D1D5DB" }}>
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
            <PackageCheck size={22} className="text-gray-400" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Control de recepción</h2>
              <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Próximamente
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Verificación de productos y servicios recibidos.</p>
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
