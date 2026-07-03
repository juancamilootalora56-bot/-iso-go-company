"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const locales = ["es", "en", "pt"] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setAuthLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch {
      setAuthLoading(false);
    }
  }, []);

  const navLinks = [
    { key: "nosotros", href: `/${locale}/nosotros` },
    { key: "certificaciones", href: `/${locale}/certificaciones` },
    { key: "kosher", href: `/${locale}/kosher` },
    { key: "especialidades", href: `/${locale}/especialidades` },
    { key: "software", href: `/${locale}/software` },
    { key: "casos", href: `/${locale}/casos-de-exito` },
    { key: "blog", href: `/${locale}/blog` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0">
            <Image src="/logo.jpg" alt="Iso Go Company" width={52} height={58} priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-sm font-medium text-gray-700 hover:text-[#F5A623] transition-colors"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold">
              {locales.map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span className="text-gray-300 mx-1">|</span>}
                  <Link
                    href={`/${l}`}
                    className={`uppercase ${
                      l === locale
                        ? "text-[#F5A623] font-bold"
                        : "text-gray-500 hover:text-[#F5A623]"
                    }`}
                  >
                    {l}
                  </Link>
                </span>
              ))}
            </div>

            {/* Auth-aware CTA */}
            {!authLoading && (
              <>
                {user ? (
                  <Link
                    href={`/${locale}/dashboard`}
                    className="hidden md:inline-block bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors"
                  >
                    Mi Dashboard →
                  </Link>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      href={`/${locale}/auth/login`}
                      className="text-sm font-medium text-gray-700 hover:text-[#F5A623] transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href={`/${locale}/contacto`}
                      className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors"
                    >
                      {t("cotiza")}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700 hover:text-[#F5A623]"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`text-xs font-bold uppercase ${
                    l === locale ? "text-[#F5A623]" : "text-gray-500"
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>
            {user ? (
              <Link
                href={`/${locale}/dashboard`}
                onClick={() => setMenuOpen(false)}
                className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg text-center hover:bg-[#e09410]"
              >
                Mi Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700 hover:text-[#F5A623] text-center py-1"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href={`/${locale}/contacto`}
                  onClick={() => setMenuOpen(false)}
                  className="bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg text-center hover:bg-[#e09410]"
                >
                  {t("cotiza")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
