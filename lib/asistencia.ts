// Control de Asistencia — marcación de entrada/salida geolocalizada.
// Cada marcación es una fila de registro_asistencia (tabla dedicada, no el
// patrón JSON de gestion_documentos: acá necesitamos inserts atómicos y
// filtrar por fecha en SQL).

export type TipoMarcacion = "entrada" | "salida";

export type RegistroAsistencia = {
  id: string;
  profile_id: string;
  empleado_id: string;
  sede_id: string | null;
  fecha: string; // YYYY-MM-DD
  tipo: TipoMarcacion;
  marcado_en: string; // timestamptz ISO
  lat: number;
  lng: number;
  distancia_metros: number;
  dentro_de_radio: boolean;
  created_at: string;
};

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function horaDeMarca(marcadoEn: string): string {
  return new Date(marcadoEn).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export function fechaLegible(fechaISO: string): string {
  return new Date(fechaISO + "T00:00:00").toLocaleDateString("es", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

// Último par entrada/salida del día para un colaborador: si el último
// registro es una entrada sin salida posterior, hoy sigue "adentro".
export function ultimaMarcaDelDia(registros: RegistroAsistencia[]): RegistroAsistencia | null {
  if (registros.length === 0) return null;
  return [...registros].sort((a, b) => a.marcado_en.localeCompare(b.marcado_en)).at(-1) ?? null;
}

export function siguienteTipo(registrosDelDia: RegistroAsistencia[]): TipoMarcacion {
  const ultima = ultimaMarcaDelDia(registrosDelDia);
  return ultima?.tipo === "entrada" ? "salida" : "entrada";
}

// Agrupa los registros de un colaborador por fecha, con su entrada y salida
// (si las tiene) para mostrar el historial tipo planilla.
export type DiaAsistencia = { fecha: string; entrada: RegistroAsistencia | null; salida: RegistroAsistencia | null };

export function agruparPorDia(registros: RegistroAsistencia[]): DiaAsistencia[] {
  const porFecha = new Map<string, RegistroAsistencia[]>();
  for (const r of registros) {
    (porFecha.get(r.fecha) ?? porFecha.set(r.fecha, []).get(r.fecha)!).push(r);
  }
  return Array.from(porFecha.entries())
    .map(([fecha, regs]) => ({
      fecha,
      entrada: regs.find((r) => r.tipo === "entrada") ?? null,
      salida: regs.find((r) => r.tipo === "salida") ?? null,
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}
