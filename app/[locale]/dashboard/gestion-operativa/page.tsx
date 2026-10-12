"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseProductos } from "@/lib/productosFabricados";

export default function GestionOperativaPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-operativa`;

  const { docs, loading } = useGestionDocumentos("operativa", user?.id ?? null);
  const cantidadProductos = parseProductos(docs["productos_lista"] ?? "").length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gestión Operativa</h1>
        <p className="text-gray-500 text-sm mt-1">Procesos, indicadores y mejora continua de tu operación.</p>
      </div>

      <div className="space-y-2">
        <Link
          href={`${basePath}/inscripcion_productos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gestion-operativa/mapa_procesos.jpg" alt="Alta de Producto" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-[#1A1A1A]">Alta de Producto</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Formulario de alta de los productos que fabricás.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        <Link
          href={`${basePath}/lista_maestra_productos`}
          className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
        >
          <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] text-xl">
              🏭
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-[#1A1A1A]">Operaciones</h2>
              {!loading && cantidadProductos > 0 && (
                <span className="text-[10px] uppercase tracking-wide font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {cantidadProductos}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Perfil de cada producto y su diagrama de proceso operativo paso a paso.
            </p>
          </div>
          <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
        </Link>

        {[
          { icon: "📐", imagen: "/gestion-operativa/indicadores_proceso.jpg", titulo: "Indicadores de proceso", descripcion: "KPIs de desempeño operativo." },
          { icon: "⚠️", imagen: "/gestion-operativa/no_conformidades.jpg", titulo: "No conformidades", descripcion: "Registro y tratamiento de no conformidades." },
          { icon: "🚀", imagen: "/gestion-operativa/mejora_continua.jpg", titulo: "Mejora continua", descripcion: "Acciones de mejora y su seguimiento." },
        ].map((s) => (
          <div key={s.titulo} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 opacity-70">
            <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
              <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover rounded-full" />
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-[#1A1A1A]">{s.titulo}</h2>
                <span className="text-[10px] uppercase tracking-wide font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
