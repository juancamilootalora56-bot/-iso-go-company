"use client";

import Link from "next/link";
import { useCotizaciones, estadoInfo } from "@/hooks/useCotizaciones";

export default function CotizacionesPage() {
  const { cotizaciones, loading } = useCotizaciones();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Link
          href="/crm/cotizaciones/nueva"
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410]"
        >
          + Nueva cotización
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : cotizaciones.length === 0 ? (
        <div className="bg-[#242424] border border-white/5 rounded-2xl p-8 text-center text-gray-400 text-sm">
          Todavía no hay cotizaciones. Click en &quot;+ Nueva cotización&quot; para crear la primera.
        </div>
      ) : (
        <div className="bg-[#242424] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => {
                const info = estadoInfo(c.estado);
                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link href={`/crm/cotizaciones/${c.id}`} className="font-semibold text-white hover:text-[#F5A623]">
                        {c.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.empresa || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${info.color}22`, color: info.color }}
                      >
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      ${c.total.toLocaleString("es")}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
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
