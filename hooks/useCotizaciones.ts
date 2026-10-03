"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type EstadoCotizacion = "borrador" | "enviada" | "aceptada" | "rechazada";

export const ESTADOS: { value: EstadoCotizacion; label: string; color: string }[] = [
  { value: "borrador", label: "Borrador", color: "#9CA3AF" },
  { value: "enviada", label: "Enviada", color: "#3B82F6" },
  { value: "aceptada", label: "Aceptada", color: "#22C55E" },
  { value: "rechazada", label: "Rechazada", color: "#EF4444" },
];

export function estadoInfo(estado: string) {
  return ESTADOS.find((e) => e.value === estado) ?? ESTADOS[0];
}

export const PRODUCTOS: string[] = [
  "ISO 9001 - Gestión de Calidad",
  "ISO 14001 - Gestión Ambiental",
  "ISO 45001 - Seguridad y Salud Ocupacional",
  "ISO/IEC 27001 - Seguridad de la Información",
  "ISO 22000 - Inocuidad Alimentaria",
  "ISO 13485 - Dispositivos Médicos",
  "ISO 50001 - Gestión de la Energía",
  "ISO 22301 - Continuidad de Negocio",
  "ISO/IEC 27701 - Privacidad de Datos",
  "ISO/IEC 42001 - Gestión de Inteligencia Artificial",
  "ISO/IEC 17025 - Laboratorios de Ensayo y Calibración",
  "Certificación Kosher",
  "Plataforma de Gestión Iso Go",
  "Otro",
];

export type Cotizacion = {
  id: string;
  created_by: string;
  numero: string;
  lead_id: string | null;
  cliente_id: string | null;
  estado: EstadoCotizacion;
  notas: string | null;
  total: number;
  empresa: string | null;
  representante: string | null;
  telefono: string | null;
  email: string | null;
  num_colaboradores: number | null;
  num_procesos: number | null;
  producto: string | null;
  created_at: string;
  updated_at: string;
};

export type CotizacionItem = {
  id: string;
  cotizacion_id: string;
  orden: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
};

export function useCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("created_at", { ascending: false });
    setCotizaciones((data as Cotizacion[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function create(input: Partial<Cotizacion>, items: Omit<CotizacionItem, "id" | "cotizacion_id">[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: cotizacion, error } = await supabase
      .from("cotizaciones")
      .insert({ ...input, created_by: user.id })
      .select()
      .single();
    if (error) throw error;

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("cotizacion_items").insert(
        items.map((it) => ({ ...it, cotizacion_id: cotizacion.id }))
      );
      if (itemsError) throw itemsError;
    }

    await fetchAll();
    return cotizacion.id as string;
  }

  async function setEstado(id: string, estado: EstadoCotizacion) {
    const supabase = createClient();
    const { error } = await supabase.from("cotizaciones").update({ estado }).eq("id", id);
    if (error) throw error;
    await fetchAll();
  }

  return { cotizaciones, loading, create, setEstado, refetch: fetchAll };
}
