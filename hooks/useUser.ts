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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
