"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  sector: string | null;
  phone: string | null;
  country: string | null;
  interested_norms: string[] | null;
  plan: string | null;
  created_at: string;
  logo_url: string | null;
  razon_social: string | null;
  representante_legal: string | null;
  ruc: string | null;
  descripcion_empresa: string | null;
  procesos_empresa: string | null;
  tema_panel: string | null;
};

type DashboardUserContextValue = {
  user: User | null;
  profile: Profile | null;
};

const DashboardUserContext = createContext<DashboardUserContextValue>({ user: null, profile: null });

export const DashboardUserProvider = DashboardUserContext.Provider;

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}
