"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cliente = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  norma_interes: string | null;
  created_at: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClientes((data as Cliente[]) ?? []);
        setLoading(false);
      });
  }, []);

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
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478]">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Norma</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-[#E8E2D8] last:border-0">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.empresa || "—"}</td>
                  <td className="px-4 py-3 text-[#8A8478]">
                    {c.email || c.telefono || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#8A8478]">{c.norma_interes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
