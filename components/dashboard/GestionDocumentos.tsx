"use client";

import Link from "next/link";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import type { ItemGestion } from "@/lib/gestionGerenciaItems";
import { FODA_CATEGORIAS, itemKeyFoda } from "@/lib/fodaItems";
import { parseSeleccion } from "@/lib/partesInteresadasItems";
import { parseProductos } from "@/lib/productosEstrella";
import { parseLista as parseListaProcesos } from "@/lib/mapaProcesos";
import { parseValores } from "@/lib/valoresEstructura";

export type { ItemGestion };

function estaCompleto(itemKey: string, docs: Record<string, string>) {
  if (itemKey === "foda") {
    return FODA_CATEGORIAS.some((c) => (docs[itemKeyFoda(c.key)] ?? "").trim().length > 0);
  }
  if (itemKey === "matriz_cliente_partes_interesadas") {
    const seleccion = parseSeleccion(docs["matriz_cliente_partes_interesadas_seleccion"] ?? "");
    return Object.values(seleccion).some((arr) => arr.length > 0);
  }
  if (itemKey === "matriz_productos_estrella") {
    return parseProductos(docs[itemKey] ?? "").length > 0;
  }
  if (itemKey === "mapa_procesos") {
    return parseListaProcesos(docs["mapa_procesos_seleccion"] ?? "").length > 0;
  }
  if (itemKey === "matriz_gestion_riesgos") {
    return Object.keys(docs).some(
      (k) => k.startsWith("riesgos_matriz_") && docs[k] && docs[k] !== "[]"
    );
  }
  if (itemKey === "valores_organizacionales") {
    return parseValores(docs["valores_lista"] ?? "").some((v) => v.trim().length > 0);
  }
  return (docs[itemKey] ?? "").trim().length > 0;
}

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
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F5A623]/40 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{item.icono}</span>
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
                <span className="text-gray-300 flex-shrink-0">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
