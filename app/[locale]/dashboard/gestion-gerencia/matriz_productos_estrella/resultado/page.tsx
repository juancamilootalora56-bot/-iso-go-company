"use client";

import { Fragment, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProductos } from "@/lib/productosEstrella";
import { ChevronDown, Search, Sparkles, ShieldCheck, Gift } from "lucide-react";

const ITEM_KEY = "matriz_productos_estrella";

export default function MatrizProductosEstrellaResultadoPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-gerencia`;

  const { docs, loading } = useGestionDocumentos("gerencia", user?.id ?? null);
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const todos = parseProductos(docs[ITEM_KEY] ?? "");
  const busquedaNorm = busqueda.trim().toLowerCase();
  const productos = busquedaNorm
    ? todos.filter((p) => `${p.nombre} ${p.descripcion}`.toLowerCase().includes(busquedaNorm))
    : todos;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión de la Gerencia
      </Link>

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
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#F5A623" }}>
              Gestión de la Gerencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Matriz de Productos Estrella</h1>
            <p className="text-gray-400 text-sm mt-1">Resumen de todos los productos cargados.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white text-2xl font-extrabold">{todos.length}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wide">Productos</p>
            </div>
            <Link
              href={`${basePath}/matriz_productos_estrella`}
              className="text-xs font-bold text-[#1A1A1A] bg-[#F5A623] hover:bg-[#e09410] transition-colors px-4 py-2.5 rounded-lg flex-shrink-0"
            >
              + Agregar / editar
            </Link>
          </div>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Todavía no cargaste ningún producto.</p>
          <Link
            href={`${basePath}/matriz_productos_estrella`}
            className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] text-sm"
          >
            Cargar producto
          </Link>
        </div>
      ) : (
        <>
          <div className="relative mb-3 w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/15 transition-colors"
            />
          </div>

          {productos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              Ningún producto coincide con la búsqueda.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="p-3 font-semibold border-b border-gray-100 w-16">Foto</th>
                    <th className="p-3 font-semibold border-b border-gray-100 w-48">Nombre</th>
                    <th className="p-3 font-semibold border-b border-gray-100">Descripción</th>
                    <th className="p-3 font-semibold border-b border-gray-100 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => {
                    const abierto = expandido === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr
                          onClick={() => setExpandido(abierto ? null : p.id)}
                          className={`border-b border-gray-50 cursor-pointer transition-colors ${
                            abierto ? "bg-[#F5A623]/5" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="p-2">
                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden relative flex items-center justify-center">
                              {p.foto && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.foto} alt={p.nombre} className="max-w-full max-h-full object-contain" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-[#1A1A1A] align-middle">{p.nombre}</td>
                          <td className="p-3 text-gray-500 align-middle">
                            <p className="line-clamp-1">{p.descripcion}</p>
                          </td>
                          <td className="p-3 align-middle">
                            <ChevronDown
                              size={15}
                              className={`text-gray-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                            />
                          </td>
                        </tr>
                        {abierto && (
                          <tr key={`${p.id}-detalle`} className="border-b border-gray-100 bg-[#FAFAFA]">
                            <td colSpan={4} className="p-5">
                              <div className="grid sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                                    Descripción
                                  </p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.descripcion || "—"}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-3.5">
                                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-500 mb-1.5">
                                    <Sparkles size={12} /> Características
                                  </p>
                                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{p.caracteristicas || "—"}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-3.5">
                                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#F5A623] mb-1.5">
                                    <ShieldCheck size={12} /> Ventajas
                                  </p>
                                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{p.ventajas || "—"}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-3.5">
                                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-600 mb-1.5">
                                    <Gift size={12} /> Beneficios
                                  </p>
                                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{p.beneficios || "—"}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
