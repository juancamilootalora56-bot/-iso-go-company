"use client";

import Link from "next/link";
import { useClientes } from "@/hooks/useClientes";
import { Handshake, Wallet } from "lucide-react";

const ACENTO = "#7C4DFF";

export default function ClientesPage() {
  const { clientes, loading } = useClientes();

  const totalValor = clientes.reduce((s, c) => s + (c.valor || 0), 0);

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
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
            Cartera
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {clientes.length} clientes · ${totalValor.toLocaleString("es")} en valor total
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5 max-w-sm">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center gap-2.5">
              <Handshake size={17} style={{ color: ACENTO }} />
              <div>
                <p className="text-lg font-bold text-white leading-none">{clientes.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">clientes</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center gap-2.5">
              <Wallet size={17} className="text-green-400" />
              <div>
                <p className="text-lg font-bold text-white leading-none">${totalValor.toLocaleString("es")}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">en cartera</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          Todavía no hay clientes. Se crean automáticamente cuando un lead pasa a la etapa
          &quot;Ganado&quot; en Leads.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Representante</th>
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
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/crm/clientes/${c.id}`} className="font-semibold text-[#1A1A1A] hover:text-[#F5A623]">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.empresa || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.representante || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.rubro || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.cargo || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.norma_interes || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">
                    ${(c.valor || 0).toLocaleString("es")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
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
