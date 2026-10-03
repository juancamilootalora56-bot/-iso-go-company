"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ESTADOS, estadoInfo, type Cotizacion, type CotizacionItem, type EstadoCotizacion } from "@/hooks/useCotizaciones";

export default function CotizacionDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [items, setItems] = useState<CotizacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const supabase = createClient();
    const [{ data: cot }, { data: its }] = await Promise.all([
      supabase.from("cotizaciones").select("*").eq("id", id).maybeSingle(),
      supabase.from("cotizacion_items").select("*").eq("cotizacion_id", id).order("orden"),
    ]);
    setCotizacion(cot as Cotizacion | null);
    setItems((its as CotizacionItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEstado(estado: EstadoCotizacion) {
    setUpdating(true);
    const supabase = createClient();
    await supabase.from("cotizaciones").update({ estado }).eq("id", id);
    await load();
    setUpdating(false);
  }

  if (loading) return <p className="text-[#8A8478] text-sm">Cargando...</p>;
  if (!cotizacion) return <p className="text-[#8A8478] text-sm">Cotización no encontrada.</p>;

  const info = estadoInfo(cotizacion.estado);

  return (
    <div className="max-w-2xl">
      <Link href="/crm/cotizaciones" className="text-sm text-[#8A8478] hover:text-[#2D2A26] mb-4 inline-block">
        ← Volver a Cotizaciones
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{cotizacion.numero}</h1>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${info.color}22`, color: info.color }}
        >
          {info.label}
        </span>
      </div>

      {(cotizacion.empresa || cotizacion.representante || cotizacion.producto) && (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#8A8478] mb-3">Datos de la empresa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {cotizacion.empresa && (
              <div><p className="text-xs text-[#8A8478]">Empresa</p><p className="text-[#2D2A26]">{cotizacion.empresa}</p></div>
            )}
            {cotizacion.representante && (
              <div><p className="text-xs text-[#8A8478]">Representante</p><p className="text-[#2D2A26]">{cotizacion.representante}</p></div>
            )}
            {cotizacion.telefono && (
              <div><p className="text-xs text-[#8A8478]">Teléfono</p><p className="text-[#2D2A26]">{cotizacion.telefono}</p></div>
            )}
            {cotizacion.email && (
              <div><p className="text-xs text-[#8A8478]">Correo</p><p className="text-[#2D2A26]">{cotizacion.email}</p></div>
            )}
            {cotizacion.num_colaboradores != null && (
              <div><p className="text-xs text-[#8A8478]">N° colaboradores</p><p className="text-[#2D2A26]">{cotizacion.num_colaboradores}</p></div>
            )}
            {cotizacion.num_procesos != null && (
              <div><p className="text-xs text-[#8A8478]">N° procesos</p><p className="text-[#2D2A26]">{cotizacion.num_procesos}</p></div>
            )}
            {cotizacion.producto && (
              <div className="col-span-2"><p className="text-xs text-[#8A8478]">Producto / Servicio</p><p className="text-[#2D2A26]">{cotizacion.producto}</p></div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#8A8478] mb-3">Ítems</h2>
        <div className="overflow-x-auto">
        <table className="w-full text-sm mb-4 min-w-[420px]">
          <thead>
            <tr className="border-b border-[#E8E2D8] text-left text-[#8A8478] text-xs">
              <th className="pb-2 font-medium">Descripción</th>
              <th className="pb-2 font-medium text-right">Cant.</th>
              <th className="pb-2 font-medium text-right">Precio</th>
              <th className="pb-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[#E8E2D8] last:border-0">
                <td className="py-2">{it.descripcion}</td>
                <td className="py-2 text-right text-[#8A8478]">{it.cantidad}</td>
                <td className="py-2 text-right text-[#8A8478]">${it.precio_unitario.toLocaleString("es")}</td>
                <td className="py-2 text-right font-medium">
                  ${(it.cantidad * it.precio_unitario).toLocaleString("es")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="flex items-center justify-end border-t border-[#E8E2D8] pt-4">
          <p className="text-sm text-[#8A8478] mr-3">Total:</p>
          <p className="text-xl font-bold text-[#2D2A26]">${cotizacion.total.toLocaleString("es")}</p>
        </div>
        {cotizacion.notas && (
          <div className="mt-4 pt-4 border-t border-[#E8E2D8]">
            <p className="text-xs text-[#8A8478] mb-1">Notas</p>
            <p className="text-sm text-[#5C564C]">{cotizacion.notas}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[#8A8478] mb-3">Cambiar estado</h2>
        <div className="flex gap-2 flex-wrap">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              disabled={updating || cotizacion.estado === e.value}
              onClick={() => handleEstado(e.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border transition-colors disabled:opacity-40"
              style={{
                borderColor: e.color,
                color: cotizacion.estado === e.value ? "#1A1A1A" : e.color,
                backgroundColor: cotizacion.estado === e.value ? e.color : "transparent",
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
