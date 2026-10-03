"use client";

import Link from "next/link";
import { useCotizaciones, estadoInfo } from "@/hooks/useCotizaciones";

export default function CotizacionesPage() {
  const { cotizaciones, loading } = useCotizaciones();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Cotizaciones</h1>
        <Link
          href="/crm/cotizaciones/nueva"
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] text-center"
        >
          + Nueva cotización
        </Link>
      </div>

      {loading ? (
        <p className="text-[#8A8478] text-sm">Cargando...</p>
      ) : cotizaciones.length === 0 ? (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-8 text-center text-[#8A8478] text-sm">
          Todavía no hay cotizaciones. Click en &quot;+ Nueva cotización&quot; para crear la primera.
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
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
                  <tr key={c.id} className="border-b border-[#E8E2D8] last:border-0 hover:bg-[#F0EBE2]">
                    <td className="px-4 py-3">
                      <Link href={`/crm/cotizaciones/${c.id}`} className="font-semibold text-[#2D2A26] hover:text-[#F5A623]">
                        {c.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#5C564C]">{c.empresa || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${info.color}22`, color: info.color }}
                      >
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5C564C]">
                      ${c.total.toLocaleString("es")}
                    </td>
                    <td className="px-4 py-3 text-[#8A8478]">
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
