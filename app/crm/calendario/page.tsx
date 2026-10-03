"use client";

import { useEffect, useMemo, useState } from "react";
import { useVisitas } from "@/hooks/useVisitas";
import { createClient } from "@/lib/supabase/client";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toLocalDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarioPage() {
  const { visitas, loading, create, remove } = useVisitas();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => toLocalDateKey(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("leads").select("id, nombre").then(({ data }) => {
      if (data) setLeads(data as { id: string; nombre: string }[]);
    });
  }, []);

  const [form, setForm] = useState({
    titulo: "",
    hora: "10:00",
    ubicacion: "",
    descripcion: "",
    lead_id: "",
  });

  const visitasPorDia = useMemo(() => {
    const map: Record<string, typeof visitas> = {};
    for (const v of visitas) {
      const key = toLocalDateKey(new Date(v.fecha_inicio));
      if (!map[key]) map[key] = [];
      map[key].push(v);
    }
    return map;
  }, [visitas]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const todayKey = toLocalDateKey(new Date());
  const visitasDelDia = visitasPorDia[selectedDay] ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fecha_inicio = new Date(`${selectedDay}T${form.hora}:00`).toISOString();
    await create({
      titulo: form.titulo,
      ubicacion: form.ubicacion || null,
      descripcion: form.descripcion || null,
      fecha_inicio,
      lead_id: form.lead_id || null,
    });
    setForm({ titulo: "", hora: "10:00", ubicacion: "", descripcion: "", lead_id: "" });
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410]"
        >
          + Nueva visita
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Month grid */}
        <div className="bg-[#242424] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="text-gray-400 hover:text-white px-2"
            >
              ←
            </button>
            <h2 className="font-bold text-sm">{MESES[month]} {year}</h2>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="text-gray-400 hover:text-white px-2"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {DIAS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = toLocalDateKey(date);
              const hasEvents = !!visitasPorDia[key]?.length;
              const isSelected = key === selectedDay;
              const isToday = key === todayKey;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(key)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isSelected
                      ? "bg-[#F5A623] text-[#1A1A1A] font-bold"
                      : isToday
                      ? "border border-[#F5A623] text-white"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {date.getDate()}
                  {hasEvents && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-[#1A1A1A]" : "bg-[#F5A623]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="bg-[#242424] border border-white/5 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4">{selectedDay}</h3>

          {showForm && (
            <form onSubmit={handleCreate} className="space-y-3 mb-5 pb-5 border-b border-white/10">
              <input
                required
                placeholder="Título"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
              />
              <input
                type="time"
                required
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
              />
              <input
                placeholder="Ubicación (opcional)"
                value={form.ubicacion}
                onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
              />
              <select
                value={form.lead_id}
                onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
              >
                <option value="">Sin lead asociado</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
              <textarea
                placeholder="Notas (opcional)"
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
              />
              <button
                type="submit"
                className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold text-xs py-2 rounded-lg hover:bg-[#e09410]"
              >
                Guardar visita
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-gray-500 text-xs">Cargando...</p>
          ) : visitasDelDia.length === 0 ? (
            <p className="text-gray-500 text-xs">Sin visitas este día.</p>
          ) : (
            <div className="space-y-2">
              {visitasDelDia.map((v) => (
                <div key={v.id} className="bg-[#1A1A1A] rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {new Date(v.fecha_inicio).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                        {" — "}{v.titulo}
                      </p>
                      {v.ubicacion && <p className="text-xs text-gray-500 mt-0.5">{v.ubicacion}</p>}
                      {v.descripcion && <p className="text-xs text-gray-400 mt-1">{v.descripcion}</p>}
                    </div>
                    <button
                      onClick={() => remove(v.id)}
                      className="text-gray-600 hover:text-red-400 text-xs flex-shrink-0 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
