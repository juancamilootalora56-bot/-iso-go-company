"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { parsePersonal } from "@/lib/personal";
import {
  parseEventos,
  itemKeyCalendario,
  colorTipoEvento,
  personasVisiblesCalendario,
  mesActual,
  mesSiguiente,
  type EventoCalendario,
} from "@/lib/calendarioPersonal";

type Props = {
  docs: Record<string, string>;
  loading: boolean;
};

const PALETA_PERSONAS = ["#4F46E5", "#F5A623", "#0EA5A4", "#EC4899", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"];

function etiquetaFecha(fecha: string, hoyISO: string) {
  const manana = new Date(hoyISO + "T00:00:00");
  manana.setDate(manana.getDate() + 1);
  const mananaISO = manana.toISOString().slice(0, 10);
  if (fecha === hoyISO) return "Hoy";
  if (fecha === mananaISO) return "Mañana";
  return new Date(fecha + "T00:00:00").toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });
}

export default function CalendarioResumenWidget({ docs, loading }: Props) {
  const { colaborador } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano/calendario_personal`;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <p className="text-gray-400 text-sm">Cargando calendario...</p>
      </div>
    );
  }

  const personal = parsePersonal(docs["personal_lista"] ?? "");
  const esOwner = !colaborador;
  const empleadoPropioId = colaborador?.empleadoId ?? null;
  const personasVisibles = personasVisiblesCalendario(personal, empleadoPropioId, esOwner);
  const mostrarPersona = personasVisibles.length > 1;

  const colorPorPersona: Record<string, string> = {};
  personasVisibles.forEach((p, i) => {
    colorPorPersona[p.id] = PALETA_PERSONAS[i % PALETA_PERSONAS.length];
  });

  const hoy = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);

  // Próximos 7 días, para la tira semanal.
  const tira: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    tira.push(d.toISOString().slice(0, 10));
  }

  // Eventos de hoy en adelante, de este mes y el siguiente, de las personas visibles.
  const todosEventos: { persona: (typeof personasVisibles)[number]; evento: EventoCalendario }[] = [];
  personasVisibles.forEach((p) => {
    [mesActual(), mesSiguiente(mesActual())].forEach((mes) => {
      parseEventos(docs[itemKeyCalendario(p.id, mes)] ?? "").forEach((evento) => {
        if (evento.fecha >= hoyISO) todosEventos.push({ persona: p, evento });
      });
    });
  });
  todosEventos.sort((a, b) => (a.evento.fecha + a.evento.horaInicio).localeCompare(b.evento.fecha + b.evento.horaInicio));
  const proximosEventos = todosEventos.slice(0, 5);

  const eventosPorDia: Record<string, number> = {};
  todosEventos.forEach(({ evento }) => {
    eventosPorDia[evento.fecha] = (eventosPorDia[evento.fecha] ?? 0) + 1;
  });

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <span>🗓️</span> {esOwner ? "Calendario de Colaboradores" : "Mi Calendario"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Próximos 7 días</p>
        </div>
        <Link href={basePath} className="text-sm text-[#F5A623] font-medium hover:text-[#e09410] whitespace-nowrap">
          Ver completo →
        </Link>
      </div>

      {personasVisibles.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Tu cuenta todavía no está vinculada a una ficha de personal.
        </p>
      ) : (
        <>
          {/* Tira semanal */}
          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {tira.map((fecha) => {
              const d = new Date(fecha + "T00:00:00");
              const cantidad = eventosPorDia[fecha] ?? 0;
              const esHoy = fecha === hoyISO;
              return (
                <Link
                  key={fecha}
                  href={basePath}
                  className={`rounded-lg p-2 text-center transition-colors ${
                    esHoy ? "bg-[#1A1A1A]" : "bg-[#FAFAFA] hover:bg-gray-100"
                  }`}
                >
                  <p className={`text-[9px] font-bold uppercase ${esHoy ? "text-[#F5A623]" : "text-gray-400"}`}>
                    {d.toLocaleDateString("es", { weekday: "short" }).slice(0, 3)}
                  </p>
                  <p className={`text-sm font-bold mt-0.5 ${esHoy ? "text-white" : "text-[#1A1A1A]"}`}>
                    {d.getDate()}
                  </p>
                  <div className="flex items-center justify-center gap-0.5 mt-1 h-1.5">
                    {cantidad > 0 &&
                      Array.from({ length: Math.min(cantidad, 3) }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-[#F5A623]" />
                      ))}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Próximos eventos */}
          {proximosEventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border-t border-gray-100">
              <p className="text-sm text-gray-400 mt-3">Sin eventos programados en los próximos días.</p>
              <Link href={basePath} className="text-xs text-[#F5A623] font-semibold hover:text-[#e09410] mt-2">
                + Agregar evento
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              {proximosEventos.map(({ persona, evento }) => (
                <Link
                  key={evento.id}
                  href={basePath}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#FAFAFA] transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: mostrarPersona ? colorPorPersona[persona.id] : colorTipoEvento(evento.tipo) }}
                  />
                  <span className="text-[11px] font-bold text-gray-400 w-20 flex-shrink-0 capitalize">
                    {etiquetaFecha(evento.fecha, hoyISO)}
                  </span>
                  <span className="text-xs font-semibold text-[#1A1A1A] truncate flex-1">
                    {evento.titulo || evento.tipo}
                  </span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {evento.horaInicio}
                    {mostrarPersona && ` · ${persona.nombre}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
