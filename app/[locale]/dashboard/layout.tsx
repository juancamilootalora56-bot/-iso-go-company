"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { DashboardUserProvider } from "@/components/dashboard/DashboardUserContext";

const navItems = [
  { href: "", label: "Inicio", icon: "🏠", modulo: null as string | null, soloOwner: false },
  { href: "/gestion-gerencia", label: "Gestión de la Gerencia", icon: "🏛️", modulo: "gerencia", soloOwner: false },
  { href: "/gestion-talento-humano", label: "Gestión del Talento Humano", icon: "👥", modulo: "talento_humano", soloOwner: false },
  { href: "/gestion-compras", label: "Gestión de Compras", icon: "🛒", modulo: "compras", soloOwner: false },
  { href: "/gestion-comercial", label: "Gestión Comercial", icon: "📈", modulo: "comercial", soloOwner: false },
  { href: "/gestion-operativa", label: "Gestión Operativa", icon: "⚙️", modulo: "operativa", soloOwner: false },
  { href: "/gestion-diseno-desarrollo", label: "Gestión de Diseño y Desarrollo", icon: "🧩", modulo: "diseno_desarrollo", soloOwner: false },
  { href: "/perfil", label: "Perfil", icon: "👤", modulo: null, soloOwner: true },
];

// Portal del cliente todavía en desarrollo (sistema ISO 9001 en construcción).
// Mientras tanto, solo esta cuenta puede entrar a probarlo. No tiene relación
// con los colaboradores internos del CRM (esos se manejan aparte).
const ALLOWED_CLIENT_EMAILS = ["juan@isogo.company"];

type ColaboradorInfo = { ownerId: string; permisos: string[]; activo: boolean };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();
  const { user: rawUser, profile: rawProfile, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [colaboradorInfo, setColaboradorInfo] = useState<ColaboradorInfo | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<typeof rawProfile>(null);
  const [resolviendoColaborador, setResolviendoColaborador] = useState(true);

  useEffect(() => {
    if (!loading && !rawUser) {
      router.push(`/${locale}/auth/login`);
    }
  }, [rawUser, loading, locale, router]);

  useEffect(() => {
    if (loading || !rawUser) {
      setResolviendoColaborador(false);
      return;
    }
    const emailAutorizadoDirecto = rawUser.email && ALLOWED_CLIENT_EMAILS.includes(rawUser.email.toLowerCase());
    if (emailAutorizadoDirecto) {
      setResolviendoColaborador(false);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_colaboradores")
        .select("owner_id, permisos, activo")
        .eq("id", rawUser.id)
        .maybeSingle();

      if (data) {
        setColaboradorInfo({ ownerId: data.owner_id, permisos: data.permisos ?? [], activo: data.activo });
        const { data: ownerProf } = await supabase.from("profiles").select("*").eq("id", data.owner_id).maybeSingle();
        setOwnerProfile(ownerProf);
      }
      setResolviendoColaborador(false);
    })();
  }, [loading, rawUser]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
    router.refresh();
  }

  if (loading || resolviendoColaborador) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const esColaborador = !!colaboradorInfo;
  const emailAutorizado = rawUser?.email && ALLOWED_CLIENT_EMAILS.includes(rawUser.email.toLowerCase());
  const accesoPermitido = emailAutorizado || (esColaborador && colaboradorInfo!.activo);

  if (rawUser && !accesoPermitido) {
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
            {esColaborador ? "Acceso desactivado" : "Plataforma en construcción"}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {esColaborador
              ? "Tu acceso a este sistema fue desactivado. Contactá al administrador de tu empresa."
              : "Estamos terminando de armar tu sistema de gestión ISO 9001. Pronto vas a tener acceso completo a tu panel."}
          </p>

          {!esColaborador && (
            <div className="bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-xl p-4 mb-8">
              <p className="text-[#F5A623] font-semibold text-sm">🚀 Lanzamiento próximo</p>
              <p className="text-gray-500 text-xs mt-1">Te vamos a avisar apenas esté listo.</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="block w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Para colaboradores, los datos de gestión (gestion_documentos) y la marca
  // (logo, nombre de empresa) son los del dueño — solo el nombre/email que se
  // muestran en el panel siguen siendo los propios del colaborador.
  const effectiveUser = esColaborador && rawUser ? { ...rawUser, id: colaboradorInfo!.ownerId } : rawUser;
  const effectiveProfile =
    esColaborador && ownerProfile
      ? { ...ownerProfile, full_name: rawProfile?.full_name ?? ownerProfile.full_name }
      : rawProfile;

  const itemsVisibles = navItems.filter((item) => {
    if (!esColaborador) return true;
    if (item.soloOwner) return false;
    if (!item.modulo) return true;
    return colaboradorInfo!.permisos.includes(item.modulo);
  });

  const displayName = rawProfile?.full_name || rawUser?.email?.split("@")[0] || "Usuario";

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
        className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo: el del cliente si ya lo subió en Perfil, si no el de Iso Go por defecto */}
        <div className="p-5 border-b border-gray-100">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            {effectiveProfile?.logo_url ? (
              <>
                <div className="h-14 flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={effectiveProfile.logo_url}
                    alt={effectiveProfile.company_name || "Logo"}
                    className="max-h-14 max-w-[150px] object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[#1A1A1A] font-bold text-sm leading-tight truncate">
                    {effectiveProfile.company_name || "Mi empresa"}
                  </p>
                  <p className="text-gray-400 text-xs">Sistema de Gestión</p>
                </div>
              </>
            ) : (
              <>
                <Image src="/logo.jpg" alt="Iso Go" width={40} height={44} className="rounded-lg border border-gray-200" />
                <div>
                  <p className="text-[#1A1A1A] font-bold text-sm leading-tight">Iso Go</p>
                  <p className="text-gray-400 text-xs">Company</p>
                </div>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {itemsVisibles.map((item) => {
            const href = `/${locale}/dashboard${item.href}`;
            const isActive = pathname === href || (item.href === "" && pathname === `/${locale}/dashboard`);
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1A1A1A] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]"
                }`}
              >
                <span className={isActive ? "" : "opacity-80"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#1A1A1A] font-bold text-sm flex-shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[#1A1A1A] text-sm font-semibold truncate">{displayName}</p>
              <p className="text-gray-400 text-xs truncate">{rawUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A] transition-colors"
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
        <main className="flex-1 p-6">
          <DashboardUserProvider value={{ user: effectiveUser, profile: effectiveProfile }}>{children}</DashboardUserProvider>
        </main>
      </div>
    </div>
  );
}
