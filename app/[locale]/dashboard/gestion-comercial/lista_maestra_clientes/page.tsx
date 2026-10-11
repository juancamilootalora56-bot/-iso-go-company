"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseClientes, colorEstadoCliente } from "@/lib/clientes";

const ITEM_KEY = "clientes_lista";

export default function ListaMaestraClientesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;

  const { docs, loading } = useGestionDocumentos("comercial", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const clientes = parseClientes(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión Comercial
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lista Maestra de Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">Perfil de cada cliente registrado.</p>
        </div>
        <Link
          href={`${basePath}/inscripcion_clientes`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no registraste ningún cliente.</p>
          <Link
            href={`${basePath}/inscripcion_clientes`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Registrar cliente
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((c) => (
            <Link
              key={c.id}
              href={`${basePath}/lista_maestra_clientes/${c.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt={c.razonSocial} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-lg">🏢</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{c.razonSocial}</p>
                  <p className="text-xs text-gray-500 truncate">{c.sector || "—"}</p>
                  {c.estado && (
                    <span
                      className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: colorEstadoCliente(c.estado) }}
                    >
                      {c.estado}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
