"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <section className="bg-white min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-[#F5A623] mb-4">404</div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">{t("title")}</h1>
        <p className="text-gray-600 mb-8">{t("sub")}</p>
        <Link
          href={`/${locale}`}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-3 rounded-lg hover:bg-[#e09410] transition-colors inline-block"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
