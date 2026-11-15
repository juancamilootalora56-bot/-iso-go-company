"use client";

import Link from "next/link";
import { useCotizaciones, estadoInfo, ESTADOS } from "@/hooks/useCotizaciones";
import { Plus, Receipt } from "lucide-react";

const ACENTO = "#D97706";

export default function CotizacionesPage() {
  const { cotizaciones, loading } = useCotizaciones();

  const totalPendiente = cotizaciones
    .filter((c) => c.estado === "borrador" || c.estado === "enviada")
    .reduce((s, c) => s + c.total, 0);

  return (
    <div>
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
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
              Cotizaciones
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Cotizaciones</h1>
            <p className="text-gray-400 text-sm mt-1">
              {cotizaciones.length} cotizaciones · ${totalPendiente.toLocaleString("es")} pendiente de cerrar
            </p>
          </div>
          <Link
            href="/crm/cotizaciones/nueva"
            className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors flex-shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} /> Nueva cotización
          </Link>
        </div>

        {cotizaciones.length > 0 && (
          <div className="relative z-10 flex items-center gap-5 mt-5 pt-5 border-t border-white/10 flex-wrap">
            {ESTADOS.map((e) => {
              const cantidad = cotizaciones.filter((c) => c.estado === e.value).length;
              return (
                <div key={e.value} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-lg font-bold text-white">{cantidad}</span>
                  <span className="text-xs text-gray-400">{e.label.toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : cotizaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          <Receipt size={28} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          Todavía no hay cotizaciones. Click en &quot;+ Nueva cotización&quot; para crear la primera.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Persona de contacto</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => {
                const info = estadoInfo(c.estado);
                return (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/crm/cotizaciones/${c.id}`} className="font-semibold text-[#1A1A1A] hover:text-[#F5A623]">
                        {c.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.empresa || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{c.contacto || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{c.cargo || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${info.color}22`, color: info.color }}
                      >
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      ${c.total.toLocaleString("es")}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("es")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
