"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

const navItems = [
  { href: "", label: "Inicio", icon: "🏠" },
  { href: "/mi-certificacion", label: "Mi Certificación", icon: "📋" },
  { href: "/demos", label: "Demos disponibles", icon: "🎮" },
  { href: "/documentos", label: "Mis documentos", icon: "📄" },
  { href: "/progreso", label: "Mi progreso", icon: "📊" },
  { href: "/perfil", label: "Mi perfil", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, loading, locale, router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
    router.refresh();
  }

  // PLATAFORMA EN CONSTRUCCIÓN — bloquear acceso al dashboard temporalmente
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#242424] rounded-2xl p-10 shadow-2xl border border-white/5 text-center">
        <div className="w-20 h-20 bg-[#F5A623]/10 border-2 border-[#F5A623]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#F5A623]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Plataforma en construcción
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Nuestro equipo está estructurando el software para ofrecerte la mejor experiencia. Pronto tendrás acceso completo a tu dashboard de certificaciones.
        </p>

        <div className="bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-xl p-4 mb-8">
          <p className="text-[#F5A623] font-semibold text-sm">🚀 Lanzamiento próximo</p>
          <p className="text-gray-500 text-xs mt-1">Te avisaremos cuando esté listo.</p>
        </div>

        <Link
          href={`/${locale}/contacto`}
          className="block w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors mb-3"
        >
          Cotiza tu certificación →
        </Link>
        <Link
          href={`/${locale}`}
          className="block w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#1A1A1A] z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Iso Go" width={40} height={44} className="rounded" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Iso Go</p>
              <p className="text-gray-500 text-xs">Company</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const href = `/${locale}/dashboard${item.href}`;
            const isActive = pathname === href || (item.href === "" && pathname === `/${locale}/dashboard`);
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#F5A623] text-[#1A1A1A]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A1A1A] font-bold text-sm flex-shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500">
              Bienvenido de vuelta, <span className="text-[#1A1A1A] font-semibold">{displayName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A1A1A] font-bold text-sm">
              {displayName[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
