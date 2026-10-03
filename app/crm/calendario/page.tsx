"use client";

import { useEffect, useMemo, useState } from "react";
import { useVisitas, TIPOS, tipoInfo, type TipoVisita } from "@/hooks/useVisitas";
import { createClient } from "@/lib/supabase/client";

const DIAS = ["D", "L", "M", "M", "J", "V", "S"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MESES_LARGO = [
  "de enero", "de febrero", "de marzo", "de abril", "de mayo", "de junio",
  "de julio", "de agosto", "de septiembre", "de octubre", "de noviembre", "de diciembre",
];

function toLocalDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayHeader(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MESES_LARGO[m - 1]} ${y}`;
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
    tipo: "reunion" as TipoVisita,
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
  const visitasDelDia = (visitasPorDia[selectedDay] ?? [])
    .slice()
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));

  const conteoPorTipo = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of visitas) {
      if (v.fecha_inicio.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)) {
        counts[v.tipo] = (counts[v.tipo] ?? 0) + 1;
      }
    }
    return counts;
  }, [visitas, year, month]);

  function goToday() {
    const now = new Date();
    setCursor(now);
    setSelectedDay(toLocalDateKey(now));
  }

  function openFormFor(day: string) {
    setSelectedDay(day);
    setShowForm(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fecha_inicio = new Date(`${selectedDay}T${form.hora}:00`).toISOString();
    await create({
      titulo: form.titulo,
      ubicacion: form.ubicacion || null,
      descripcion: form.descripcion || null,
      fecha_inicio,
      lead_id: form.lead_id || null,
      tipo: form.tipo,
    });
    setForm({ titulo: "", hora: "10:00", ubicacion: "", descripcion: "", lead_id: "", tipo: "reunion" });
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Calendario</h1>
          <p className="text-[#8A8478] text-sm">Visitas, reuniones y llamadas comerciales.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="border border-[#E8E2D8] text-[#5C564C] text-sm px-3 py-2 rounded-lg hover:bg-[#F0EBE2]"
          >
            Hoy
          </button>
          <button
            onClick={() => openFormFor(selectedDay)}
            className="flex-1 sm:flex-none bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410]"
          >
            + Nueva visita
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6">
        {/* Left: month grid + legend */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="text-[#8A8478] hover:text-[#2D2A26] px-2 text-lg"
            >
              ‹
            </button>
            <h2 className="font-bold text-sm">{MESES[month]} {year}</h2>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="text-[#8A8478] hover:text-[#2D2A26] px-2 text-lg"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#8A8478] mb-2">
            {DIAS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-5">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = toLocalDateKey(date);
              const dayEvents = visitasPorDia[key] ?? [];
              const isSelected = key === selectedDay;
              const isToday = key === todayKey;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(key)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-1 transition-colors relative ${
                    isSelected
                      ? "bg-[#F5A623] text-[#1A1A1A] font-bold"
                      : isToday
                      ? "border border-[#F5A623] text-[#2D2A26]"
                      : "text-[#5C564C] hover:bg-[#F0EBE2]"
                  }`}
                >
                  {date.getDate()}
                  {dayEvents.length > 0 && (
                    <span className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((v, idx) => (
                        <span
                          key={idx}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? "#1A1A1A" : tipoInfo(v.tipo).color }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="border-t border-[#E8E2D8] pt-4">
            <p className="text-xs font-semibold text-[#8A8478] mb-2 uppercase tracking-wider">Leyenda</p>
            <div className="space-y-1.5">
              {TIPOS.map((t) => (
                <div key={t.value} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#5C564C]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </span>
                  <span className="text-[#8A8478] text-xs">{conteoPorTipo[t.value] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: day panel */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm capitalize">{formatDayHeader(selectedDay)}</h3>
            <button
              onClick={() => openFormFor(selectedDay)}
              className="text-[#F5A623] text-xs font-semibold hover:text-[#e09410]"
            >
              + Agregar
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="space-y-3 mb-5 pb-5 border-b border-[#E8E2D8]">
              <input
                required
                placeholder="Título"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  required
                  value={form.hora}
                  onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                />
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoVisita }))}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Ubicación (opcional)"
                value={form.ubicacion}
                onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
              <select
                value={form.lead_id}
                onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
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
                className="w-full bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#F5A623]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#E8E2D8] text-[#5C564C] text-xs py-2 rounded-lg hover:bg-[#F0EBE2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs py-2 rounded-lg hover:bg-[#e09410]"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-[#8A8478] text-xs">Cargando...</p>
          ) : visitasDelDia.length === 0 ? (
            <p className="text-[#8A8478] text-xs">Sin visitas este día.</p>
          ) : (
            <div className="space-y-2">
              {visitasDelDia.map((v) => {
                const info = tipoInfo(v.tipo);
                return (
                  <div
                    key={v.id}
                    className="bg-[#FAF7F2] rounded-lg p-3 border-l-2"
                    style={{ borderLeftColor: info.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2D2A26] truncate">
                          {new Date(v.fecha_inicio).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                          {" — "}{v.titulo}
                        </p>
                        <span
                          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
                          style={{ backgroundColor: `${info.color}22`, color: info.color }}
                        >
                          {info.label}
                        </span>
                        {v.ubicacion && <p className="text-xs text-[#8A8478] mt-1.5">{v.ubicacion}</p>}
                        {v.descripcion && <p className="text-xs text-[#8A8478] mt-1">{v.descripcion}</p>}
                      </div>
                      <button
                        onClick={() => remove(v.id)}
                        className="text-[#A8A194] hover:text-red-500 text-xs flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
