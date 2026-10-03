"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PRODUCTOS } from "@/lib/productos";
import { estadoInfo, type Cotizacion } from "@/hooks/useCotizaciones";

type Cliente = {
  id: string;
  lead_id: string | null;
  nombre: string;
  empresa: string | null;
  rubro: string | null;
  cargo: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  norma_interes: string | null;
  num_colaboradores: number | null;
  num_procesos: number | null;
  notas: string | null;
  created_at: string;
};

type Visita = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  tipo: string;
};

export default function ClienteDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>({});
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: cli } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
    setCliente(cli as Cliente | null);
    setForm((cli as Cliente) ?? {});

    if (cli) {
      const orFilter = cli.lead_id
        ? `cliente_id.eq.${id},lead_id.eq.${cli.lead_id}`
        : `cliente_id.eq.${id}`;
      const { data: cots } = await supabase
        .from("cotizaciones")
        .select("*")
        .or(orFilter)
        .order("created_at", { ascending: false });
      setCotizaciones((cots as Cotizacion[]) ?? []);

      if (cli.lead_id) {
        const { data: vis } = await supabase
          .from("visitas")
          .select("id, titulo, fecha_inicio, tipo")
          .eq("lead_id", cli.lead_id)
          .order("fecha_inicio", { ascending: false });
        setVisitas((vis as Visita[]) ?? []);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set<K extends keyof Cliente>(key: K, value: Cliente[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("clientes")
      .update({
        nombre: form.nombre,
        empresa: form.empresa,
        rubro: form.rubro,
        cargo: form.cargo,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        norma_interes: form.norma_interes,
        num_colaboradores: form.num_colaboradores,
        num_procesos: form.num_procesos,
        notas: form.notas,
      })
      .eq("id", id);
    setSaving(false);
    setSaved(true);
    await load();
  }

  const inputClass =
    "w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]";
  const labelClass = "block text-xs font-medium text-[#8A8478] mb-1";

  if (loading) return <p className="text-[#8A8478] text-sm">Cargando...</p>;
  if (!cliente) return <p className="text-[#8A8478] text-sm">Cliente no encontrado.</p>;

  const totalCotizado = cotizaciones.reduce((s, c) => s + (c.total || 0), 0);
  const totalAceptado = cotizaciones
    .filter((c) => c.estado === "aceptada")
    .reduce((s, c) => s + (c.total || 0), 0);

  return (
    <div className="max-w-3xl">
      <Link href="/crm/clientes" className="text-sm text-[#8A8478] hover:text-[#2D2A26] mb-4 inline-block">
        ← Volver a Clientes
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
        <p className="text-xs text-[#8A8478]">
          Cliente desde {new Date(cliente.created_at).toLocaleDateString("es")}
        </p>
      </div>
      {cliente.empresa && <p className="text-[#8A8478] text-sm mb-6">{cliente.empresa}</p>}

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-4">
          <p className="text-xs text-[#8A8478]">Cotizaciones</p>
          <p className="text-xl font-bold text-[#2D2A26]">{cotizaciones.length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-4">
          <p className="text-xs text-[#8A8478]">Total cotizado</p>
          <p className="text-xl font-bold text-[#2D2A26]">${totalCotizado.toLocaleString("es")}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-700">Total aceptado</p>
          <p className="text-xl font-bold text-green-700">${totalAceptado.toLocaleString("es")}</p>
        </div>
      </div>

      {/* Ficha editable */}
      <form onSubmit={handleSave} className="space-y-4 bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-[#2D2A26]">Datos del cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input value={form.nombre ?? ""} onChange={(e) => set("nombre", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Empresa</label>
            <input value={form.empresa ?? ""} onChange={(e) => set("empresa", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Rubro de la empresa</label>
            <input value={form.rubro ?? ""} onChange={(e) => set("rubro", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cargo del contacto</label>
            <input value={form.cargo ?? ""} onChange={(e) => set("cargo", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input value={form.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input value={form.direccion ?? ""} onChange={(e) => set("direccion", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>N° de colaboradores</label>
            <input
              type="number"
              min="0"
              value={form.num_colaboradores ?? ""}
              onChange={(e) => set("num_colaboradores", e.target.value ? parseInt(e.target.value, 10) : null)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>N° de procesos</label>
            <input
              type="number"
              min="0"
              value={form.num_procesos ?? ""}
              onChange={(e) => set("num_procesos", e.target.value ? parseInt(e.target.value, 10) : null)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Norma / Servicio contratado</label>
          <select
            value={form.norma_interes ?? ""}
            onChange={(e) => set("norma_interes", e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccionar...</option>
            {PRODUCTOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            rows={3}
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        </div>
      </form>

      {/* Historial de cotizaciones */}
      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-[#2D2A26] mb-3">Cotizaciones</h2>
        {cotizaciones.length === 0 ? (
          <p className="text-[#8A8478] text-sm">Sin cotizaciones asociadas todavía.</p>
        ) : (
          <div className="space-y-2">
            {cotizaciones.map((c) => {
              const info = estadoInfo(c.estado);
              return (
                <Link
                  key={c.id}
                  href={`/crm/cotizaciones/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F0EBE2] border border-[#E8E2D8]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2D2A26]">{c.numero}</p>
                    <p className="text-xs text-[#8A8478]">{new Date(c.created_at).toLocaleDateString("es")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${info.color}22`, color: info.color }}
                    >
                      {info.label}
                    </span>
                    <span className="text-sm font-bold text-[#2D2A26]">${c.total.toLocaleString("es")}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de visitas */}
      {visitas.length > 0 && (
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#2D2A26] mb-3">Visitas y reuniones</h2>
          <div className="space-y-2">
            {visitas.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-2 text-sm">
                <span className="text-[#2D2A26]">{v.titulo}</span>
                <span className="text-[#8A8478] text-xs">
                  {new Date(v.fecha_inicio).toLocaleDateString("es")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
