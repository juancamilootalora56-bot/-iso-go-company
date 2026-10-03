"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type TipoVisita = "reunion" | "demo" | "llamada" | "otro";

export const TIPOS: { value: TipoVisita; label: string; color: string }[] = [
  { value: "reunion", label: "Reunión", color: "#F5A623" },
  { value: "demo", label: "Demo", color: "#3B82F6" },
  { value: "llamada", label: "Llamada", color: "#22C55E" },
  { value: "otro", label: "Otro", color: "#A855F7" },
];

export function tipoInfo(tipo: string) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[3];
}

export type Visita = {
  id: string;
  created_by: string;
  titulo: string;
  descripcion: string | null;
  ubicacion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  lead_id: string | null;
  cliente_id: string | null;
  tipo: TipoVisita;
  created_at: string;
};

export function useVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("visitas")
      .select("*")
      .order("fecha_inicio", { ascending: true });
    setVisitas((data as Visita[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function create(input: Partial<Visita>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { error } = await supabase.from("visitas").insert({ ...input, created_by: user.id });
    if (error) throw error;
    await fetchAll();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("visitas").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
  }

  return { visitas, loading, create, remove, refetch: fetchAll };
}
