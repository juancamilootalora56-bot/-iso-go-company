"use client";

import { useDashboardUser } from "./DashboardUserContext";

export default function EncabezadoDocumento() {
  const { profile } = useDashboardUser();

  if (!profile?.logo_url && !profile?.company_name) return null;

  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
      {profile?.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.logo_url}
          alt={profile.company_name || "Logo"}
          className="w-11 h-11 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0"
        />
      )}
      {profile?.company_name && (
        <p className="text-sm font-bold text-[#1A1A1A]">{profile.company_name}</p>
      )}
    </div>
  );
}
