"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function AdvisorBar() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <div className="bg-[#1A1A1A] text-white py-2 text-center text-sm">
      <span className="text-gray-300 mr-3">¿Necesitas orientación sobre qué norma aplicar a tu empresa?</span>
      <Link
        href={`/${locale}/contacto`}
        className="bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-1 rounded-full hover:bg-[#e09410] transition-colors"
      >
        {t("asesor")} →
      </Link>
    </div>
  );
}
