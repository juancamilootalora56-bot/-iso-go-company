"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseNodos, construirArbol, type NodoOrganigrama } from "@/lib/estructuraOrganizacional";

const ITEM_KEY = "estructura_organizacional";

function TarjetaNodo({ nodo }: { nodo: NodoOrganigrama }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-gray-100 overflow-hidden flex items-center justify-center z-10">
        {nodo.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nodo.foto} alt={nodo.nombre} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <div className="bg-[#E7DDD0] rounded-lg px-3 py-1.5 -mt-2 text-center min-w-[120px] max-w-[160px] shadow-sm">
        <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">{nodo.nombre}</p>
        <p className="text-[9px] uppercase tracking-wide text-gray-600 leading-tight mt-0.5">{nodo.cargo}</p>
      </div>
    </div>
  );
}

function RamaArbol({
  nodo,
  hijosDe,
}: {
  nodo: NodoOrganigrama;
  hijosDe: Map<string, NodoOrganigrama[]>;
}) {
  const hijos = hijosDe.get(nodo.id) ?? [];

  return (
    <div className="flex flex-col items-center">
      <TarjetaNodo nodo={nodo} />

      {hijos.length > 0 && (
        <>
          {/* Tronco que baja del nodo padre */}
          <div className="w-px h-5 bg-gray-300" />

          <div className="flex items-start">
            {hijos.map((hijo, idx) => (
              <div key={hijo.id} className="flex flex-col items-center px-4 relative">
                {/* Línea horizontal que conecta a los hermanos */}
                {hijos.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-gray-300"
                    style={{
                      left: idx === 0 ? "50%" : 0,
                      right: idx === hijos.length - 1 ? "50%" : 0,
                    }}
                  />
                )}
                {/* Línea vertical que baja a la tarjeta del hijo */}
                <div className="w-px h-5 bg-gray-300" />
                <RamaArbol nodo={hijo} hijosDe={hijosDe} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function EstructuraOrganizacionalResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const nodos = parseNodos(docs[ITEM_KEY] ?? "");
  const { raices, hijosDe } = construirArbol(nodos);

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Organigrama</h1>
          <p className="text-gray-500 text-sm mt-1">Estructura Organizacional de tu empresa.</p>
        </div>
        <Link
          href={`${basePath}/estructura_organizacional`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar cargos
        </Link>
      </div>

      {nodos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún cargo.</p>
          <Link
            href={`${basePath}/estructura_organizacional`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar cargo
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8 overflow-x-auto">
          <div className="flex gap-16 justify-center w-fit min-w-full">
            {raices.map((raiz) => (
              <RamaArbol key={raiz.id} nodo={raiz} hijosDe={hijosDe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
