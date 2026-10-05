"use client";

import { useDashboardUser } from "./DashboardUserContext";

export default function EncabezadoDocumento() {
  const { profile } = useDashboardUser();

  if (!profile?.logo_url && !profile?.company_name) return null;

  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
      {profile?.logo_url && (
        <div className="w-11 h-11 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.logo_url}
            alt={profile.company_name || "Logo"}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      {profile?.company_name && (
        <p className="text-sm font-bold text-[#1A1A1A]">{profile.company_name}</p>
      )}
    </div>
  );
}
