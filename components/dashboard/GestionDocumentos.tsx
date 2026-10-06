"use client";

import Link from "next/link";
import Image from "next/image";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import type { ItemGestion } from "@/lib/gestionGerenciaItems";
import { estaCompletoActividad as estaCompleto } from "@/lib/gestionGerenciaCompletitud";

export type { ItemGestion };

export default function GestionDocumentos({
  modulo,
  titulo,
  descripcion,
  items,
  userId,
  basePath,
}: {
  modulo: string;
  titulo: string;
  descripcion: string;
  items: ItemGestion[];
  userId: string | null;
  basePath: string;
}) {
  const { docs, loading } = useGestionDocumentos(modulo, userId);

  const completados = items.filter((i) => estaCompleto(i.key, docs)).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-1">{descripcion}</p>
      </div>

      {!loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{completados} de {items.length} completadas</span>
            <span>{Math.round((completados / items.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5A623] rounded-full transition-all"
              style={{ width: `${(completados / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const completo = estaCompleto(item.key, docs);
            return (
              <Link
                key={item.key}
                href={`${basePath}/${item.key}`}
                className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 hover:shadow-[0_4px_20px_-4px_rgba(245,166,35,0.25)] transition-all"
              >
                <span className="relative flex-shrink-0 w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#F9D57C] via-[#F5A623] to-[#C9790A] shadow-sm">
                  <span className="flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.titulo}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-xl bg-gradient-to-br from-[#FFF6E5] to-[#FDEBC8] w-full h-full rounded-full flex items-center justify-center">
                        {item.icono}
                      </span>
                    )}
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-[#1A1A1A]">{item.titulo}</h2>
                    <span
                      className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        completo ? "text-green-700 bg-green-100" : "text-[#F5A623] bg-[#F5A623]/10"
                      }`}
                    >
                      {completo ? "Completo" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.descripcion}</p>
                </div>
                <span className="text-gray-300 flex-shrink-0 group-hover:text-[#F5A623] transition-colors">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
