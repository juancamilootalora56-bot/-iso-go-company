"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCotizaciones, PRODUCTOS } from "@/hooks/useCotizaciones";

type ItemForm = { descripcion: string; cantidad: string; precio_unitario: string };

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const { create } = useCotizaciones();
  const [leads, setLeads] = useState<{ id: string; nombre: string }[]>([]);
  const [leadId, setLeadId] = useState("");

  const [empresa, setEmpresa] = useState("");
  const [representante, setRepresentante] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [numColaboradores, setNumColaboradores] = useState("");
  const [numProcesos, setNumProcesos] = useState("");
  const [producto, setProducto] = useState("");

  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemForm[]>([
    { descripcion: "", cantidad: "1", precio_unitario: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("leads").select("id, nombre").then(({ data }) => {
      if (data) setLeads(data as { id: string; nombre: string }[]);
    });
  }, []);

  function updateItem(i: number, field: keyof ItemForm, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { descripcion: "", cantidad: "1", precio_unitario: "" }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = items.reduce(
    (sum, it) => sum + (parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validItems = items.filter((it) => it.descripcion.trim());
      const id = await create(
        {
          lead_id: leadId || null,
          notas: notas || null,
          estado: "borrador",
          empresa: empresa || null,
          representante: representante || null,
          telefono: telefono || null,
          email: email || null,
          num_colaboradores: numColaboradores ? parseInt(numColaboradores, 10) : null,
          num_procesos: numProcesos ? parseInt(numProcesos, 10) : null,
          producto: producto || null,
        },
        validItems.map((it, idx) => ({
          orden: idx + 1,
          descripcion: it.descripcion,
          cantidad: parseFloat(it.cantidad) || 1,
          precio_unitario: parseFloat(it.precio_unitario) || 0,
        }))
      );
      router.push(`/crm/cotizaciones/${id}`);
    } catch {
      setError("No se pudo guardar la cotización. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]";
  const labelClass = "block text-xs font-medium text-[#8A8478] mb-1";

  return (
    <div className="max-w-2xl">
      <Link href="/crm/cotizaciones" className="text-sm text-[#8A8478] hover:text-[#2D2A26] mb-4 inline-block">
        ← Volver a Cotizaciones
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nueva cotización</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-[#E8E2D8] rounded-2xl p-6">
        {/* Datos de la empresa */}
        <div>
          <h2 className="text-sm font-bold text-[#2D2A26] mb-3">Datos de la empresa</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Empresa</label>
              <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dueño o representante</label>
              <input value={representante} onChange={(e) => setRepresentante(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Correo</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>N° de colaboradores</label>
                <input
                  type="number"
                  min="0"
                  value={numColaboradores}
                  onChange={(e) => setNumColaboradores(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>N° de procesos</label>
                <input
                  type="number"
                  min="0"
                  value={numProcesos}
                  onChange={(e) => setNumProcesos(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Producto / Servicio</label>
              <select value={producto} onChange={(e) => setProducto(e.target.value)} className={inputClass}>
                <option value="">Seleccionar...</option>
                {PRODUCTOS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lead asociado (opcional)</label>
              <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className={inputClass}>
                <option value="">Sin lead asociado</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ítems */}
        <div className="border-t border-[#E8E2D8] pt-5">
          <h2 className="text-sm font-bold text-[#2D2A26] mb-3">Ítems de la cotización</h2>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-2 sm:grid-cols-[1fr_70px_90px_28px] gap-2 items-center bg-white/[0.02] sm:bg-transparent p-2 sm:p-0 rounded-lg"
              >
                <input
                  placeholder="Descripción"
                  value={it.descripcion}
                  onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Cant."
                  value={it.cantidad}
                  onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-2 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={it.precio_unitario}
                  onChange={(e) => updateItem(i, "precio_unitario", e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-2 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-[#A8A194] hover:text-red-500 text-sm justify-self-end sm:justify-self-auto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-2 text-xs text-[#F5A623] font-semibold hover:text-[#e09410]">
            + Agregar ítem
          </button>
        </div>

        <div className="flex items-center justify-end border-t border-[#E8E2D8] pt-4">
          <p className="text-sm text-[#8A8478] mr-3">Total:</p>
          <p className="text-xl font-bold text-[#2D2A26]">${total.toLocaleString("es")}</p>
        </div>

        <div>
          <label className={labelClass}>Notas (opcional)</label>
          <textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Crear cotización"}
        </button>
      </form>
    </div>
  );
}
