"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ProcesoLead = {
  id: string;
  nombre: string;
  empresa: string | null;
  norma_interes: string | null;
  etapa: string;
  valor_estimado: number;
  reunion_fecha: string | null;
  reunion_lugar: string | null;
  reunion_modalidad: "presencial" | "virtual" | null;
  reunion_proximos_pasos: string | null;
  presentacion_fecha: string | null;
  presentacion_lugar: string | null;
  presentacion_modalidad: "presencial" | "virtual" | null;
  presentacion_norma: string | null;
  presentacion_proximos_pasos: string | null;
  demo_fecha_entrega: string | null;
  demo_dias_acceso: number | null;
  demo_proximos_pasos: string | null;
  forma_pago: "contado" | "cuotas" | null;
  cuotas: number | null;
  tipo_producto: "solo_software" | "software_coordinacion" | null;
  fecha_inicio_servicio: string | null;
};

export type ProcesoCliente = {
  id: string;
  nombre: string;
  empresa: string | null;
  norma_interes: string | null;
  valor: number;
  lead_id: string | null;
};

export function useMiProceso() {
  const [cliente, setCliente] = useState<ProcesoCliente | null>(null);
  const [lead, setLead] = useState<ProcesoLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 6000);

    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: cli } = await supabase
        .from("clientes")
        .select("id, nombre, empresa, norma_interes, valor, lead_id")
        .eq("email", email)
        .maybeSingle();

      if (cli) {
        if (!cancelled) setCliente(cli as ProcesoCliente);
        if (cli.lead_id) {
          const { data: ld } = await supabase
            .from("leads")
            .select("*")
            .eq("id", cli.lead_id)
            .maybeSingle();
          if (!cancelled) setLead(ld as ProcesoLead | null);
        }
      } else {
        const { data: ld } = await supabase
          .from("leads")
          .select("*")
          .eq("email", email)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cancelled) setLead(ld as ProcesoLead | null);
      }

      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  return { cliente, lead, loading };
}
