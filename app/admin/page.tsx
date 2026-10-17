"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Solicitud = {
  id: string;
  nombre: string;
  email: string;
  empresa: string;
  sector: string | null;
  pais: string | null;
  telefono: string | null;
  normas_interes: string[];
  como_nos_conocio: string | null;
  estado: "pendiente" | "en_conversacion" | "aprobada" | "rechazada";
  notas_admin: string | null;
  fecha_solicitud: string;
  fecha_resolucion: string | null;
  usuario_creado_id: string | null;
};

const ESTADOS: { valor: Solicitud["estado"]; label: string; color: string }[] = [
  { valor: "pendiente", label: "Pendiente", color: "#9CA3AF" },
  { valor: "en_conversacion", label: "En conversación", color: "#3B82F6" },
  { valor: "aprobada", label: "Aprobada", color: "#22C55E" },
  { valor: "rechazada", label: "Rechazada", color: "#EF4444" },
];

function colorEstado(estado: string) {
  return ESTADOS.find((e) => e.valor === estado)?.color ?? "#9CA3AF";
}
function labelEstado(estado: string) {
  return ESTADOS.find((e) => e.valor === estado)?.label ?? estado;
}

function fechaLegible(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Solicitud["estado"] | "todas">("pendiente");
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [notasBorrador, setNotasBorrador] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("solicitudes_inscripcion")
      .select("*")
      .order("fecha_solicitud", { ascending: false });
    setSolicitudes((data as Solicitud[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: string, estado: Solicitud["estado"], notas?: string) {
    const supabase = createClient();
    const cambios: Record<string, unknown> = { estado, notas_admin: notas ?? null };
    if (estado === "rechazada" || estado === "aprobada") cambios.fecha_resolucion = new Date().toISOString();
    await supabase.from("solicitudes_inscripcion").update(cambios).eq("id", id);
    await cargar();
  }

  async function guardarNotas(id: string, notas: string) {
    const supabase = createClient();
    await supabase.from("solicitudes_inscripcion").update({ notas_admin: notas }).eq("id", id);
    await cargar();
  }

  async function aprobarYDarAcceso(s: Solicitud) {
    if (!confirm(`¿Crear el acceso para ${s.nombre} (${s.email}) de ${s.empresa}? Se le va a enviar un correo para que configure su contraseña.`)) return;
    setProcesando(s.id);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/solicitudes/aprobar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId: s.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje(`✕ ${data.error || "No se pudo aprobar la solicitud."}`);
      } else {
        setMensaje(`✓ Acceso creado para ${s.email}. Se le envió un correo de invitación.`);
        await cargar();
      }
    } catch {
      setMensaje("✕ Error de conexión al aprobar.");
    } finally {
      setProcesando(null);
    }
  }

  const filtradas = filtro === "todas" ? solicitudes : solicitudes.filter((s) => s.estado === filtro);

  const conteos = ESTADOS.map((e) => ({ ...e, cantidad: solicitudes.filter((s) => s.estado === e.valor).length }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Solicitudes de Inscripción</h1>
        <p className="text-gray-500 text-sm mt-1">
          Revisá cada solicitud, coordiná la reunión/acuerdo por fuera del sistema y, cuando esté cerrado, aprobala
          para crear el acceso real del cliente.
        </p>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-lg text-sm font-medium ${mensaje.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {mensaje}
        </div>
      )}

      {/* Filtros por estado */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFiltro("todas")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${filtro === "todas" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
        >
          Todas ({solicitudes.length})
        </button>
        {conteos.map((e) => (
          <button
            key={e.valor}
            onClick={() => setFiltro(e.valor)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${filtro === e.valor ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
            style={filtro === e.valor ? { backgroundColor: e.color } : {}}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: filtro === e.valor ? "#fff" : e.color }} />
            {e.label} ({e.cantidad})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Cargando...</p>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">No hay solicitudes {filtro !== "todas" ? `en estado "${labelEstado(filtro)}"` : "registradas"}.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtradas.map((s) => {
            const expandido = expandidoId === s.id;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ borderTop: `3px solid ${colorEstado(s.estado)}` }}>
                <div className="p-4 cursor-pointer" onClick={() => setExpandidoId(expandido ? null : s.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colorEstado(s.estado) }}>
                          {labelEstado(s.estado)}
                        </span>
                        <span className="text-[11px] text-gray-400">{fechaLegible(s.fecha_solicitud)}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{s.empresa}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.nombre} · {s.email}</p>
                      {s.normas_interes.length > 0 && (
                        <p className="text-xs text-[#F5A623] font-semibold mt-1">{s.normas_interes.join(" · ")}</p>
                      )}
                    </div>
                    <span className="text-gray-300 flex-shrink-0">{expandido ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expandido && (
                  <div className="p-4 pt-0 border-t border-gray-50 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="grid sm:grid-cols-2 gap-3 pt-3 text-xs">
                      <div className="bg-[#FAFAFA] rounded-lg p-3">
                        <p className="text-gray-400 uppercase tracking-wide font-bold text-[10px] mb-1">Contacto</p>
                        <p className="text-[#1A1A1A] font-semibold">{s.nombre}</p>
                        <p className="text-gray-600">{s.email}</p>
                        {s.telefono && <p className="text-gray-600">{s.telefono}</p>}
                      </div>
                      <div className="bg-[#FAFAFA] rounded-lg p-3">
                        <p className="text-gray-400 uppercase tracking-wide font-bold text-[10px] mb-1">Empresa</p>
                        <p className="text-[#1A1A1A] font-semibold">{s.empresa}</p>
                        <p className="text-gray-600">{s.sector || "—"} {s.pais ? `· ${s.pais}` : ""}</p>
                        {s.como_nos_conocio && <p className="text-gray-400 mt-0.5">Se enteró por: {s.como_nos_conocio}</p>}
                      </div>
                    </div>

                    {s.normas_interes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.normas_interes.map((n) => (
                          <span key={n} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5A623]/10 text-[#F5A623]">{n}</span>
                        ))}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Notas internas (reunión, acuerdo, seguimiento...)</label>
                      <textarea
                        value={notasBorrador[s.id] ?? s.notas_admin ?? ""}
                        onChange={(e) => setNotasBorrador((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        rows={2}
                        className="w-full text-xs bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623] resize-y"
                        placeholder="Ej: reunión agendada 20/10, propuesta enviada..."
                      />
                    </div>

                    {s.usuario_creado_id && (
                      <p className="text-[11px] text-green-600 font-semibold">✓ Ya tiene una cuenta creada en la plataforma.</p>
                    )}

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => cambiarEstado(s.id, "en_conversacion", notasBorrador[s.id] ?? s.notas_admin ?? undefined)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#3B82F6] text-gray-600 hover:text-[#3B82F6]"
                        >
                          💬 En conversación
                        </button>
                        <button
                          onClick={() => guardarNotas(s.id, notasBorrador[s.id] ?? s.notas_admin ?? "")}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-500"
                        >
                          Guardar notas
                        </button>
                        <button
                          onClick={() => cambiarEstado(s.id, "rechazada", notasBorrador[s.id] ?? s.notas_admin ?? undefined)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                      {!s.usuario_creado_id && (
                        <button
                          onClick={() => aprobarYDarAcceso(s)}
                          disabled={procesando === s.id}
                          className="text-xs font-bold px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: "#22C55E" }}
                        >
                          {procesando === s.id ? "Creando acceso..." : "✓ Aprobar y dar acceso"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
