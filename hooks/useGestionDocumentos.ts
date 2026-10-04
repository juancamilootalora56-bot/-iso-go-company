"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGestionDocumentos(modulo: string, userId: string | null) {
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("gestion_documentos")
      .select("item_key, contenido")
      .eq("profile_id", userId)
      .eq("modulo", modulo);

    const map: Record<string, string> = {};
    (data ?? []).forEach((row) => {
      map[row.item_key] = row.contenido ?? "";
    });
    setDocs(map);
    setLoading(false);
  }, [modulo, userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function save(itemKey: string, contenido: string) {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("gestion_documentos")
      .upsert(
        { profile_id: userId, modulo, item_key: itemKey, contenido },
        { onConflict: "profile_id,modulo,item_key" }
      );
    setDocs((prev) => ({ ...prev, [itemKey]: contenido }));
  }

  return { docs, loading, save };
}
