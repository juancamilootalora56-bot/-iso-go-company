"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Etapa =
  | "lead_nuevo"
  | "contactado"
  | "reunion"
  | "presentacion"
  | "demo"
  | "negociacion"
  | "ganado"
  | "perdido";

export const ETAPAS: { value: Etapa; label: string; probabilidad: number; color: string }[] = [
  { value: "lead_nuevo", label: "Lead nuevo", probabilidad: 10, color: "#60A5FA" },
  { value: "contactado", label: "Contactado", probabilidad: 25, color: "#FBBF24" },
  { value: "reunion", label: "Reunión", probabilidad: 40, color: "#22D3EE" },
  { value: "presentacion", label: "Presentación", probabilidad: 55, color: "#2DD4BF" },
  { value: "demo", label: "Demo", probabilidad: 70, color: "#A78BFA" },
  { value: "negociacion", label: "Negociación", probabilidad: 85, color: "#F5A623" },
  { value: "ganado", label: "Ganado", probabilidad: 100, color: "#4ADE80" },
  { value: "perdido", label: "Perdido", probabilidad: 0, color: "#F87171" },
];

export function etapaInfo(etapa: string) {
  return ETAPAS.find((e) => e.value === etapa) ?? ETAPAS[0];
}

export type Lead = {
  id: string;
  created_by: string;
  nombre: string;
  empresa: string | null;
  rubro: string | null;
  cargo: string | null;
  email: string | null;
  telefono: string | null;
  norma_interes: string | null;
  etapa: Etapa;
  valor_estimado: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function create(input: Partial<Lead>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    const { error } = await supabase.from("leads").insert({ ...input, created_by: user.id });
    if (error) throw error;
    await fetchAll();
  }

  async function update(id: string, input: Partial<Lead>) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").update(input).eq("id", id);
    if (error) throw error;
    await fetchAll();
  }

  async function setEtapa(id: string, etapa: Etapa) {
    await update(id, { etapa });
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
  }

  return { leads, loading, create, update, setEtapa, remove, refetch: fetchAll };
}
