"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  sector: string | null;
  phone: string | null;
  country: string | null;
  interested_norms: string[] | null;
  plan: string | null;
  created_at: string;
}

interface UseUserResult {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(data);
        }
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Red de seguridad: si algo deja la llamada colgada, no te deja
    // pantalla de "Cargando..." eterna.
    const safety = setTimeout(() => setLoading(false), 6000);

    // Nota: a propósito NO nos suscribimos a onAuthStateChange acá.
    // Esa suscripción, combinada con otras consultas .from(...) hechas
    // en paralelo en otros componentes, generaba un deadlock interno
    // en el cliente de Supabase (las consultas se quedaban colgadas
    // para siempre sin error). El patrón del CRM, que tampoco se
    // suscribe, nunca tuvo este problema.
    return () => {
      clearTimeout(safety);
    };
  }, []);

  return { user, profile, loading };
}
