"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import {
  parseLeccionesAprendidas,
  colorTipoLA,
  iconoTipoLA,
  colorEstadoDifusionLA,
  CATEGORIAS_LA,
  type LeccionAprendida,
} from "@/lib/leccionesAprendidas";

const ITEM_KEY = "lecciones_aprendidas_lista";
const NARANJA = "#F97316";

export default function BibliotecaLeccionesPage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-calidad`;

  const { docs, loading } = useGestionDocumentos("calidad", user?.id ?? null);
  const [busqueda, setBusqueda] = useState("");

  const lecciones = parseLeccionesAprendidas(docs[ITEM_KEY] ?? "");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lecciones;
    return lecciones.filter((l) =>
      [l.titulo, l.leccion, l.contexto, l.recomendaciones, l.aplicabilidad, l.procesoArea].join(" ").toLowerCase().includes(q)
    );
  }, [lecciones, busqueda]);

  const porCategoria = CATEGORIAS_LA.map((categoria) => ({
    categoria,
    items: filtradas.filter((l) => l.categoria === categoria),
  })).filter((g) => g.items.length > 0);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href={`${basePath}/lecciones_aprendidas`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Lecciones Aprendidas
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Biblioteca de Conocimiento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Consultá rápido lo que ya aprendimos antes de empezar algo nuevo — agrupado por categoría.
        </p>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por palabra clave, proceso, recomendación..."
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F97316] shadow-sm"
      />

      {lecciones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Todavía no hay lecciones registradas.</p>
          <Link href={`${basePath}/lecciones_aprendidas`} className="text-sm font-semibold hover:opacity-80" style={{ color: NARANJA }}>
            Registrar la primera →
          </Link>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">Ninguna lección coincide con "{busqueda}".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {porCategoria.map((grupo) => (
            <div key={grupo.categoria}>
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                {grupo.categoria}
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{grupo.items.length}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {grupo.items.map((l: LeccionAprendida) => (
                  <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorTipoLA(l.tipo) }}>
                        {iconoTipoLA(l.tipo)} {l.tipo}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstadoDifusionLA(l.estadoDifusion) }}>
                        {l.estadoDifusion}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono ml-auto">{l.radicado}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{l.titulo}</p>
                    {l.leccion && <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-wrap">{l.leccion}</p>}
                    {l.aplicabilidad && (
                      <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        <span className="font-semibold text-gray-500">Aplica a:</span> {l.aplicabilidad}
                      </p>
                    )}
                    {l.procesoArea && <p className="text-[11px] text-gray-400 mt-0.5">📍 {l.procesoArea}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
