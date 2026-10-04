"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useGestionDocumentos(modulo: string, userId: string | null) {
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    console.log("[gestionDocs] fetchAll start, userId=", userId, "modulo=", modulo);
    if (!userId) {
      console.log("[gestionDocs] no userId, bailing");
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      console.log("[gestionDocs] client created, querying...");
      const { data, error } = await supabase
        .from("gestion_documentos")
        .select("item_key, contenido")
        .eq("profile_id", userId)
        .eq("modulo", modulo);
      console.log("[gestionDocs] query resolved", { data, error });

      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        map[row.item_key] = row.contenido ?? "";
      });
      setDocs(map);
    } catch (e) {
      console.log("[gestionDocs] threw", e);
    } finally {
      console.log("[gestionDocs] finally, loading=false");
      setLoading(false);
    }
  }, [modulo, userId]);

  useEffect(() => {
    console.log("[gestionDocs] effect fired, calling fetchAll");
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
