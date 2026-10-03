"use client";

import Link from "next/link";
import { useClientes } from "@/hooks/useClientes";

export default function ClientesPage() {
  const { clientes, loading } = useClientes();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {loading ? (
        <p className="text-[#8A8478] text-sm">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-8 text-center text-[#8A8478] text-sm">
          Todavía no hay clientes. Se crean automáticamente cuando un lead pasa a la etapa
          &quot;Ganado&quot; en Leads.
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Rubro</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Norma</th>
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
                  <td className="px-4 py-3 text-[#8A8478]">
                    {c.email || c.telefono || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.norma_interes || "—"}</td>
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
