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
