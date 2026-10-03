"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase's password-recovery links return the session as a URL hash
 * fragment (#access_token=...&type=recovery&refresh_token=...), which never
 * reaches the server. If the confirmation link's redirect_to isn't on
 * Supabase's allowed list it falls back to the bare Site URL, so this hash
 * can show up on any page. Catch it here, establish the session, and send
 * the user to the "set a new password" form instead of leaving them stuck.
 */
export default function RecoveryRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "es";

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("type=recovery")) return;

    const query = new URLSearchParams(hash.slice(1));
    const access_token = query.get("access_token");
    const refresh_token = query.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(() => {
      window.history.replaceState(null, "", window.location.pathname);
      router.replace(`/${locale}/auth/update-password`);
    });
  }, [router, locale]);

  return null;
}
