"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ETAPAS, type Lead, type Etapa } from "@/hooks/useLeads";
import { PRODUCTOS } from "@/lib/productos";

export default function LeadDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setLead(data as Lead | null);
        setForm((data as Lead) ?? {});
        setLoading(false);
      });
  }, [id]);

  function set<K extends keyof Lead>(key: K, value: Lead[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toLocalInput(iso: string | null | undefined) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fromLocalInput(value: string): string | null {
    return value ? new Date(value).toISOString() : null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("leads")
      .update({
        nombre: form.nombre,
        empresa: form.empresa,
        representante: form.representante,
        rubro: form.rubro,
        cargo: form.cargo,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        num_colaboradores: form.num_colaboradores,
        norma_interes: form.norma_interes,
        valor_estimado: form.valor_estimado,
        etapa: form.etapa,
        notas: form.notas,
        reunion_fecha: form.reunion_fecha,
        reunion_lugar: form.reunion_lugar,
        reunion_participantes: form.reunion_participantes,
        reunion_modalidad: form.reunion_modalidad,
        reunion_proximos_pasos: form.reunion_proximos_pasos,
        presentacion_fecha: form.presentacion_fecha,
        presentacion_lugar: form.presentacion_lugar,
        presentacion_participantes: form.presentacion_participantes,
        presentacion_modalidad: form.presentacion_modalidad,
        presentacion_norma: form.presentacion_norma,
        presentacion_proximos_pasos: form.presentacion_proximos_pasos,
        demo_fecha_entrega: form.demo_fecha_entrega,
        demo_dias_acceso: form.demo_dias_acceso,
        demo_proximos_pasos: form.demo_proximos_pasos,
        forma_pago: form.forma_pago,
        cuotas: form.cuotas,
        tipo_producto: form.tipo_producto,
        fecha_inicio_servicio: form.fecha_inicio_servicio,
      })
      .eq("id", id);

    // Si este lead ya se graduó a cliente, mantenemos su ficha sincronizada.
    await supabase
      .from("clientes")
      .update({
        nombre: form.nombre,
        empresa: form.empresa,
        representante: form.representante,
        rubro: form.rubro,
        cargo: form.cargo,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        num_colaboradores: form.num_colaboradores,
        norma_interes: form.norma_interes,
        valor: form.valor_estimado,
        notas: form.notas,
      })
      .eq("lead_id", id);

    setSaving(false);
    router.push("/crm/leads");
  }

  if (loading) return <p className="text-[#8A8478] text-sm">Cargando...</p>;
  if (!lead) return <p className="text-[#8A8478] text-sm">Lead no encontrado.</p>;

  return (
    <div className="max-w-xl">
      <Link href="/crm/leads" className="text-sm text-[#8A8478] hover:text-[#2D2A26] mb-4 inline-block">
        ← Volver a Leads
      </Link>
      <h1 className="text-2xl font-bold mb-6">{lead.nombre}</h1>

      <form onSubmit={handleSave} className="space-y-4 bg-white border border-[#E8E2D8] rounded-2xl p-6">
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Nombre</label>
          <input
            value={form.nombre ?? ""}
            onChange={(e) => set("nombre", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Empresa</label>
          <input
            value={form.empresa ?? ""}
            onChange={(e) => set("empresa", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Dueño o representante</label>
          <input
            value={form.representante ?? ""}
            onChange={(e) => set("representante", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Rubro de la empresa</label>
            <input
              value={form.rubro ?? ""}
              onChange={(e) => set("rubro", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Cargo</label>
            <input
              value={form.cargo ?? ""}
              onChange={(e) => set("cargo", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Email</label>
            <input
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8478] mb-1">Teléfono</label>
            <input
              value={form.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Dirección</label>
          <input
            value={form.direccion ?? ""}
            onChange={(e) => set("direccion", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">N° de colaboradores</label>
          <input
            type="number"
            min="0"
            value={form.num_colaboradores ?? ""}
            onChange={(e) => set("num_colaboradores", e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Norma de interés</label>
          <select
            value={form.norma_interes ?? ""}
            onChange={(e) => set("norma_interes", e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          >
            <option value="">Seleccionar...</option>
            {PRODUCTOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Valor estimado (Gs.)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.valor_estimado ?? 0}
            onChange={(e) => set("valor_estimado", parseFloat(e.target.value) || 0)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Etapa</label>
          <select
            value={form.etapa ?? "lead_nuevo"}
            onChange={(e) => set("etapa", e.target.value as Etapa)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          >
            {ETAPAS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reunión */}
        {form.etapa === "reunion" && (
          <div className="border-t border-[#E8E2D8] pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#2D2A26]">Detalles de la reunión</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.reunion_fecha)}
                  onChange={(e) => set("reunion_fecha", fromLocalInput(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Modalidad</label>
                <select
                  value={form.reunion_modalidad ?? ""}
                  onChange={(e) => set("reunion_modalidad", (e.target.value || null) as Lead["reunion_modalidad"])}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Lugar</label>
              <input
                value={form.reunion_lugar ?? ""}
                onChange={(e) => set("reunion_lugar", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Participantes</label>
              <input
                value={form.reunion_participantes ?? ""}
                onChange={(e) => set("reunion_participantes", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Próximos pasos</label>
              <textarea
                rows={2}
                value={form.reunion_proximos_pasos ?? ""}
                onChange={(e) => set("reunion_proximos_pasos", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        )}

        {/* Presentación */}
        {form.etapa === "presentacion" && (
          <div className="border-t border-[#E8E2D8] pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#2D2A26]">Detalles de la presentación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.presentacion_fecha)}
                  onChange={(e) => set("presentacion_fecha", fromLocalInput(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Modalidad</label>
                <select
                  value={form.presentacion_modalidad ?? ""}
                  onChange={(e) => set("presentacion_modalidad", (e.target.value || null) as Lead["presentacion_modalidad"])}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Lugar</label>
              <input
                value={form.presentacion_lugar ?? ""}
                onChange={(e) => set("presentacion_lugar", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Participantes</label>
              <input
                value={form.presentacion_participantes ?? ""}
                onChange={(e) => set("presentacion_participantes", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Norma / proyecto presentado</label>
              <select
                value={form.presentacion_norma ?? ""}
                onChange={(e) => set("presentacion_norma", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              >
                <option value="">Seleccionar...</option>
                {PRODUCTOS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Próximos pasos</label>
              <textarea
                rows={2}
                value={form.presentacion_proximos_pasos ?? ""}
                onChange={(e) => set("presentacion_proximos_pasos", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        )}

        {/* Demo */}
        {form.etapa === "demo" && (
          <div className="border-t border-[#E8E2D8] pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#2D2A26]">Detalles de la demo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Fecha de entrega</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.demo_fecha_entrega)}
                  onChange={(e) => set("demo_fecha_entrega", fromLocalInput(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Días de acceso</label>
                <input
                  type="number"
                  min="0"
                  value={form.demo_dias_acceso ?? ""}
                  onChange={(e) => set("demo_dias_acceso", e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Próximos pasos</label>
              <textarea
                rows={2}
                value={form.demo_proximos_pasos ?? ""}
                onChange={(e) => set("demo_proximos_pasos", e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        )}

        {/* Negociación / Ganado */}
        {(form.etapa === "negociacion" || form.etapa === "ganado") && (
          <div className="border-t border-[#E8E2D8] pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#2D2A26]">
              {form.etapa === "ganado" ? "Condiciones del servicio" : "Condiciones comerciales"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Forma de pago</label>
                <select
                  value={form.forma_pago ?? ""}
                  onChange={(e) => set("forma_pago", (e.target.value || null) as Lead["forma_pago"])}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="contado">Contado</option>
                  <option value="cuotas">Cuotas</option>
                </select>
              </div>
              {form.forma_pago === "cuotas" && (
                <div>
                  <label className="block text-xs font-medium text-[#8A8478] mb-1">N° de cuotas (máx. 6)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={form.cuotas ?? ""}
                    onChange={(e) => set("cuotas", e.target.value ? Math.min(6, parseInt(e.target.value, 10)) : null)}
                    className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8478] mb-1">Tipo</label>
              <select
                value={form.tipo_producto ?? ""}
                onChange={(e) => set("tipo_producto", (e.target.value || null) as Lead["tipo_producto"])}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              >
                <option value="">Seleccionar...</option>
                <option value="solo_software">Solo software</option>
                <option value="software_coordinacion">Software + coordinación</option>
              </select>
            </div>
            {form.etapa === "ganado" && (
              <div>
                <label className="block text-xs font-medium text-[#8A8478] mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  value={form.fecha_inicio_servicio ?? ""}
                  onChange={(e) => set("fecha_inicio_servicio", e.target.value || null)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8A8478] mb-1">Notas</label>
          <textarea
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            rows={4}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-2.5 rounded-lg hover:bg-[#e09410] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
