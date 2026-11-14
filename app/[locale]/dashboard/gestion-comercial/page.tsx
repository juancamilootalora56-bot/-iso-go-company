"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { usePuedeVerActividad } from "@/hooks/usePuedeVerActividad";
import { parseClientes } from "@/lib/clientes";
import {
  UserPlus,
  Users,
  Smile,
  MessageSquareWarning,
  TrendingUp,
} from "lucide-react";

const ACENTO = "#F5A623";

export default function GestionComercialPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;
  const puedeVer = usePuedeVerActividad("comercial");

  const { docs, loading } = useGestionDocumentos("comercial", user?.id ?? null);
  const cantidadClientes = parseClientes(docs["clientes_lista"] ?? "").length;

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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gestión Comercial</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">Clientes, satisfacción y seguimiento de ventas.</p>
        </div>
      </div>

      <div className="space-y-2">
        {puedeVer("inscripcion_clientes") && (
        <Link
          href={`${basePath}/inscripcion_clientes`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#16A34A" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#16A34A18" }}>
            <UserPlus size={22} style={{ color: "#16A34A" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Cliente</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Formulario completo de registro, con logo del cliente.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("lista_maestra_clientes") && (
        <Link
          href={`${basePath}/lista_maestra_clientes`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#0891B2" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#0891B218" }}>
            <Users size={22} style={{ color: "#0891B2" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Lista Maestra de Clientes</h2>
              {!loading && cantidadClientes > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadClientes}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil individual de cada cliente registrado.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("satisfaccion_clientes") && (
        <Link
          href={`${basePath}/satisfaccion_clientes`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#E8366B" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#E8366B18" }}>
            <Smile size={22} style={{ color: "#E8366B" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Satisfacción del Cliente</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Matriz consolidada de resultados de todos los clientes, por período.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("pqrsf") && (
        <Link
          href={`${basePath}/pqrsf`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#F59E0B" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#F59E0B18" }}>
            <MessageSquareWarning size={22} style={{ color: "#F59E0B" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Sistema PQRSF</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Peticiones, quejas, reclamos, sugerencias y felicitaciones, con radicado y SLA.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        {puedeVer("seguimiento_ventas") && (
        <Link
          href={`${basePath}/seguimiento_ventas`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 border-l-4 p-4 hover:shadow-md transition-all"
          style={{ borderLeftColor: "#2563EB" }}
        >
          <span className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "#2563EB18" }}>
            <TrendingUp size={22} style={{ color: "#2563EB" }} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Seguimiento de ventas</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Metas comerciales, ventas registradas y cumplimiento por período.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>
        )}

        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
            <span className="text-2xl">🔒</span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">CRM</h2>
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
