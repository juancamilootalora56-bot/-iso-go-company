"use client";

import { useDashboardUser } from "./DashboardUserContext";
import { temaPanelDe } from "@/lib/temaPanel";

export default function EncabezadoDocumento({ centrado = false }: { centrado?: boolean }) {
  const { profile } = useDashboardUser();
  const tema = temaPanelDe(profile?.tema_panel);

  if (!profile?.logo_url && !profile?.company_name) return null;

  return (
    <div
      className={`flex items-center gap-3.5 mb-4 ${centrado ? "flex-col text-center" : "pb-4 border-b border-gray-100"}`}
    >
      {profile?.logo_url && (
        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.logo_url}
            alt={profile.company_name || "Logo"}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      {profile?.company_name && (
        <p
          className="text-base font-bold"
          style={centrado ? { color: tema.textPrimary } : { color: "#1A1A1A" }}
        >
          {profile.company_name}
        </p>
      )}
    </div>
  );
}
