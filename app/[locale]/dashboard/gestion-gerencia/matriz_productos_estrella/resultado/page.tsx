"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProductos } from "@/lib/productosEstrella";

const ITEM_KEY = "matriz_productos_estrella";

export default function MatrizProductosEstrellaResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const productos = parseProductos(docs[ITEM_KEY] ?? "");

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Matriz de Productos Estrella</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de todos los productos cargados.</p>
        </div>
        <Link
          href={`${basePath}/matriz_productos_estrella`}
          className="text-sm text-[#F5A623] font-semibold hover:text-[#e09410]"
        >
          + Agregar / editar productos
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún producto.</p>
          <Link
            href={`${basePath}/matriz_productos_estrella`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="p-3 font-semibold border-b border-gray-100 w-14">Foto</th>
                <th className="p-3 font-semibold border-b border-gray-100 w-36">Nombre</th>
                <th className="p-3 font-semibold border-b border-gray-100">Descripción</th>
                <th className="p-3 font-semibold border-b border-gray-100">Características</th>
                <th className="p-3 font-semibold border-b border-gray-100">Ventajas</th>
                <th className="p-3 font-semibold border-b border-gray-100">Beneficios</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 align-top">
                  <td className="p-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative">
                      {p.foto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-[#1A1A1A]">{p.nombre}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{p.descripcion}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{p.caracteristicas || "—"}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{p.ventajas || "—"}</td>
                  <td className="p-3 text-gray-600 whitespace-pre-wrap">{p.beneficios || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
