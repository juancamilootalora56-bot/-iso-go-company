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

export const ETAPAS: { value: Etapa; label: string }[] = [
  { value: "lead_nuevo", label: "Lead nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "reunion", label: "Reunión" },
  { value: "presentacion", label: "Presentación" },
  { value: "demo", label: "Demo" },
  { value: "negociacion", label: "Negociación" },
  { value: "ganado", label: "Ganado" },
  { value: "perdido", label: "Perdido" },
];

export type Lead = {
  id: string;
  created_by: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  norma_interes: string | null;
  etapa: Etapa;
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

  return { leads, loading, create, update, setEtapa, refetch: fetchAll };
}
