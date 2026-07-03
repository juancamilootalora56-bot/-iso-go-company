"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const certLinks = [
    { label: "ISO 9001", href: `/${locale}/certificaciones#iso-9001` },
    { label: "ISO 14001", href: `/${locale}/certificaciones#iso-14001` },
    { label: "ISO 45001", href: `/${locale}/certificaciones#iso-45001` },
    { label: "ISO/IEC 27001", href: `/${locale}/certificaciones#iso-27001` },
    { label: "ISO 22000", href: `/${locale}/certificaciones#iso-22000` },
    { label: "Kosher", href: `/${locale}/kosher` },
  ];

  const specialtyLinks = [
    "Planificación Estratégica",
    "Gestión del Riesgo",
    "Gestión Comercial",
    "Gestión Operativa",
    "Talento Humano",
    "Empresas Familiares",
  ];

  const companyLinks = [
    { label: "Nosotros", href: `/${locale}/nosotros` },
    { label: "Software", href: `/${locale}/software` },
    { label: "Casos de Éxito", href: `/${locale}/casos-de-exito` },
    { label: "Blog", href: `/${locale}/blog` },
    { label: "Contacto", href: `/${locale}/contacto` },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`}>
              <Image src="/logo.jpg" alt="Iso Go Company" width={88} height={98} />
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">{t("desc")}</p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#F5A623] hover:border-[#F5A623] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#F5A623] hover:border-[#F5A623] transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5A623] mb-4">{t("certifications")}</h3>
            <ul className="space-y-2">
              {certLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5A623] mb-4">{t("specialties")}</h3>
            <ul className="space-y-2">
              {specialtyLinks.map((label) => (
                <li key={label}>
                  <Link href={`/${locale}/especialidades`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5A623] mb-4">{t("company")}</h3>
            <ul className="space-y-2">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-500">info@isogocompany.com</p>
              <p className="text-xs text-gray-500 mt-1">+1 (555) 000-0000</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Iso Go Company. {t("rights")}
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href={`/${locale}/contacto`} className="hover:text-white transition-colors">{t("privacy")}</Link>
            <Link href={`/${locale}/contacto`} className="hover:text-white transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
