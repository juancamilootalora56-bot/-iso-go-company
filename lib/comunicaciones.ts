// Matriz de Comunicaciones — ISO 9001:2015, cláusula 7.4 (Comunicación interna y externa).
// Modelo genérico: qué se comunica, por qué, quién la emite, a quién, por qué canal,
// con qué frecuencia y qué queda como evidencia — amoldable a cualquier organización.

import type { GrupoInteresado } from "./partesInteresadasItems";
import { GRUPOS_INTERESADOS } from "./partesInteresadasItems";

export type TipoComunicacion = "Interna" | "Externa";
export const TIPOS_COMUNICACION: TipoComunicacion[] = ["Interna", "Externa"];

export type EstadoComunicacion = "Activa" | "En revisión" | "Discontinuada";
export const ESTADOS_COMUNICACION: EstadoComunicacion[] = ["Activa", "En revisión", "Discontinuada"];

export function colorEstadoComunicacion(estado: string): string {
  switch (estado) {
    case "Activa":
      return "#22C55E";
    case "En revisión":
      return "#F5A623";
    case "Discontinuada":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export const MEDIOS_COMUNICACION = [
  { nombre: "Correo electrónico", icono: "📧" },
  { nombre: "Reunión presencial", icono: "🧑‍🤝‍🧑" },
  { nombre: "Reunión virtual / videollamada", icono: "💻" },
  { nombre: "Cartelera / mural informativo", icono: "📌" },
  { nombre: "Intranet / plataforma interna", icono: "🖥️" },
  { nombre: "Boletín informativo", icono: "📰" },
  { nombre: "Mensajería instantánea", icono: "💬" },
  { nombre: "Redes sociales", icono: "📱" },
  { nombre: "Página web", icono: "🌐" },
  { nombre: "Correspondencia física", icono: "✉️" },
  { nombre: "Llamada telefónica", icono: "📞" },
  { nombre: "Capacitación / inducción", icono: "🎓" },
  { nombre: "Informe escrito", icono: "📄" },
  { nombre: "Otro", icono: "🔹" },
] as const;

export function iconoMedio(nombre: string): string {
  return MEDIOS_COMUNICACION.find((m) => m.nombre === nombre)?.icono ?? "🔹";
}

export const FRECUENCIAS_COMUNICACION = [
  "Diaria",
  "Semanal",
  "Quincenal",
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Semestral",
  "Anual",
  "Según se requiera",
] as const;

export type ComunicacionItem = {
  id: string;
  numero: number;

  tipo: TipoComunicacion;
  grupoInteresado: GrupoInteresado | "";
  proceso: string;

  contenido: string; // qué se comunica
  objetivo: string; // para qué se comunica

  emisor: string; // quién comunica
  destinatario: string; // a quién (complemento en texto libre)

  medio: string; // canal
  frecuencia: string;
  evidencia: string; // qué registro queda

  fechaProximaComunicacion: string;
  estado: EstadoComunicacion;
  observaciones: string;
  fechaAlta: string;
};

export function comunicacionVacia(numero: number): ComunicacionItem {
  return {
    id: crypto.randomUUID(),
    numero,
    tipo: "Interna",
    grupoInteresado: "",
    proceso: "",
    contenido: "",
    objetivo: "",
    emisor: "",
    destinatario: "",
    medio: "",
    frecuencia: "Mensual",
    evidencia: "",
    fechaProximaComunicacion: "",
    estado: "Activa",
    observaciones: "",
    fechaAlta: new Date().toISOString().slice(0, 10),
  };
}

export function parseComunicaciones(contenido: string): ComunicacionItem[] {
  if (!contenido) return [];
  try {
    const parsed = JSON.parse(contenido);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: ComunicacionItem, i: number) => ({ ...comunicacionVacia(i + 1), ...c }));
  } catch {
    return [];
  }
}

export function renumerar(items: ComunicacionItem[]): ComunicacionItem[] {
  return items.map((c, i) => ({ ...c, numero: i + 1 }));
}

export function resumenPorTipo(items: ComunicacionItem[]): { tipo: TipoComunicacion; cantidad: number }[] {
  return TIPOS_COMUNICACION.map((tipo) => ({ tipo, cantidad: items.filter((c) => c.tipo === tipo).length }));
}

export function resumenPorMedio(items: ComunicacionItem[]): { medio: string; cantidad: number; icono: string }[] {
  const conteo = new Map<string, number>();
  items.forEach((c) => {
    if (!c.medio) return;
    conteo.set(c.medio, (conteo.get(c.medio) ?? 0) + 1);
  });
  return Array.from(conteo.entries())
    .map(([medio, cantidad]) => ({ medio, cantidad, icono: iconoMedio(medio) }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export function resumenPorGrupo(items: ComunicacionItem[]): { grupo: GrupoInteresado; label: string; color: string; cantidad: number }[] {
  return GRUPOS_INTERESADOS.map((g) => ({
    grupo: g.key,
    label: g.label,
    color: g.color,
    cantidad: items.filter((c) => c.grupoInteresado === g.key).length,
  })).filter((g) => g.cantidad > 0);
}

export function proximasComunicaciones(items: ComunicacionItem[], dias = 7): ComunicacionItem[] {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + dias);
  return items
    .filter((c) => {
      if (!c.fechaProximaComunicacion || c.estado !== "Activa") return false;
      const fecha = new Date(c.fechaProximaComunicacion + "T00:00:00");
      return fecha >= hoy && fecha <= limite;
    })
    .sort((a, b) => a.fechaProximaComunicacion.localeCompare(b.fechaProximaComunicacion));
}
