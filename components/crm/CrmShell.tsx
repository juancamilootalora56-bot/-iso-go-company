"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Rol = "admin" | "comercial" | "tecnico";

const navItems: { href: string; label: string; roles: Rol[] }[] = [
  { href: "/crm", label: "Inicio", roles: ["admin", "comercial", "tecnico"] },
  { href: "/crm/leads", label: "Leads", roles: ["admin", "comercial"] },
  { href: "/crm/clientes", label: "Clientes", roles: ["admin", "comercial"] },
  { href: "/crm/cotizaciones", label: "Cotizaciones", roles: ["admin", "comercial"] },
  { href: "/crm/calendario", label: "Calendario", roles: ["admin", "comercial"] },
  { href: "/crm/admin/empresas", label: "Base de empresas", roles: ["admin"] },
  { href: "/crm/admin/colaboradores", label: "Colaboradores", roles: ["admin"] },
  { href: "/crm/perfil", label: "Mi perfil", roles: ["admin", "comercial", "tecnico"] },
];

export default function CrmShell({
  children,
  nombre,
  email,
  rol,
}: {
  children: React.ReactNode;
  nombre: string | null;
  email: string;
  rol: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/es/auth/login");
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(rol as Rol));

  const sidebarContent = (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-[#F5A623] text-[#1A1A1A]" : "text-[#5C564C] hover:bg-[#F0EBE2]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#E8E2D8]">
        <p className="text-xs text-[#8A8478] truncate">{nombre || email}</p>
        <p className="text-[10px] uppercase tracking-wider text-[#F5A623] font-bold mb-2">{rol}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-[#8A8478] hover:text-[#2D2A26] transition-colors py-1"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#E8E2D8] sticky top-0 bg-[#FAF7F2] z-30">
        <Link href="/crm" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Iso Go Company" width={28} height={32} />
          <span className="font-bold text-sm">Iso Go Interno</span>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="p-2 -mr-2 text-[#5C564C]"
        >
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-[#FAF7F2] border-l border-[#E8E2D8] z-50 flex flex-col transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#E8E2D8] flex items-center justify-between">
          <span className="font-bold text-sm">Menú</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="text-[#8A8478] p-1">
            ✕
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 border-r border-[#E8E2D8] flex-col">
        <div className="p-5 border-b border-[#E8E2D8] flex items-center gap-2">
          <Image src="/logo.jpg" alt="Iso Go Company" width={32} height={36} />
          <span className="font-bold text-sm">Iso Go Interno</span>
        </div>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">{children}</main>
    </div>
  );
}
