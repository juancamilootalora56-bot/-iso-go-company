"use client";

import Link from "next/link";
import { useClientes } from "@/hooks/useClientes";

export default function ClientesPage() {
  const { clientes, loading } = useClientes();

  const totalValor = clientes.reduce((s, c) => s + (c.valor || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      <p className="text-[#8A8478] text-sm mb-6">
        {clientes.length} clientes · ${totalValor.toLocaleString("es")} en valor total
      </p>

      {loading ? (
        <p className="text-[#8A8478] text-sm">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-8 text-center text-[#8A8478] text-sm">
          Todavía no hay clientes. Se crean automáticamente cuando un lead pasa a la etapa
          &quot;Ganado&quot; en Leads.
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Rubro</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Norma</th>
                <th className="px-4 py-3 font-medium text-right">Costo</th>
                <th className="px-4 py-3 font-medium">Cliente desde</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-[#E8E2D8] last:border-0 hover:bg-[#F0EBE2]">
                  <td className="px-4 py-3">
                    <Link href={`/crm/clientes/${c.id}`} className="font-semibold text-[#2D2A26] hover:text-[#F5A623]">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.empresa || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.rubro || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.cargo || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.telefono || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.norma_interes || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#2D2A26]">
                    ${(c.valor || 0).toLocaleString("es")}
                  </td>
                  <td className="px-4 py-3 text-[#8A8478]">
                    {new Date(c.created_at).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
