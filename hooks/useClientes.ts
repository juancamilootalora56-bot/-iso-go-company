"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Cliente = {
  id: string;
  created_by: string;
  lead_id: string | null;
  nombre: string;
  empresa: string | null;
  representante: string | null;
  rubro: string | null;
  cargo: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  norma_interes: string | null;
  num_colaboradores: number | null;
  num_procesos: number | null;
  valor: number;
  notas: string | null;
  created_at: string;
};

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });
    setClientes((data as Cliente[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function update(id: string, input: Partial<Cliente>) {
    const supabase = createClient();
    const { error } = await supabase.from("clientes").update(input).eq("id", id);
    if (error) throw error;
    await fetchAll();
  }

  return { clientes, loading, update, refetch: fetchAll };
}
