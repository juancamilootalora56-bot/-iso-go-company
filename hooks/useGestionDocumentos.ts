"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGestionDocumentos(modulo: string) {
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("gestion_documentos")
      .select("item_key, contenido")
      .eq("profile_id", uid)
      .eq("modulo", modulo);

    const map: Record<string, string> = {};
    (data ?? []).forEach((row) => {
      map[row.item_key] = row.contenido ?? "";
    });
    setDocs(map);
    setLoading(false);
  }, [modulo]);

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
