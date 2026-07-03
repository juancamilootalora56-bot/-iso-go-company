"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface CTABandProps {
  variant?: "dark" | "gold";
}

export default function CTABand({ variant = "dark" }: CTABandProps) {
  const t = useTranslations("cta");
  const locale = useLocale();

  if (variant === "gold") {
    return (
      <section className="bg-[#F5A623] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">{t("band")}</h2>
          <p className="text-[#1A1A1A] text-lg mb-8 opacity-80">{t("sub")}</p>
          <Link
            href={`/${locale}/contacto`}
            className="bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#333] transition-colors text-lg inline-block"
          >
            {t("button")} →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1A1A1A] py-16 relative overflow-hidden">
      {/* Decorative diagonal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -left-10 top-0 bottom-0 w-32 opacity-20"
          style={{
            background: "#F5A623",
            transform: "skewX(-12deg)",
          }}
        />
        <div
          className="absolute right-20 top-0 bottom-0 w-16 opacity-10"
          style={{
            background: "#F5A623",
            transform: "skewX(-12deg)",
          }}
        />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t("band")}</h2>
        <p className="text-gray-400 text-lg mb-8">{t("sub")}</p>
        <Link
          href={`/${locale}/contacto`}
          className="bg-[#F5A623] text-[#1A1A1A] font-bold px-8 py-4 rounded-lg hover:bg-[#e09410] transition-colors text-lg inline-block"
        >
          {t("button")} →
        </Link>
      </div>
    </section>
  );
}
