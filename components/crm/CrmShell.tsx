"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Rol = "admin" | "comercial" | "tecnico";

const navItems: { href: string; label: string; roles: Rol[] }[] = [
  { href: "/crm", label: "Inicio", roles: ["admin", "comercial", "tecnico"] },
  { href: "/crm/leads", label: "Leads", roles: ["admin", "comercial"] },
  { href: "/crm/clientes", label: "Clientes", roles: ["admin", "comercial"] },
  { href: "/crm/calendario", label: "Calendario", roles: ["admin", "comercial"] },
  { href: "/crm/admin/colaboradores", label: "Colaboradores", roles: ["admin"] },
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/es/auth/login");
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(rol as Rol));

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <Image src="/logo.jpg" alt="Iso Go Company" width={32} height={36} />
          <span className="font-bold text-sm">Iso Go Interno</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#F5A623] text-[#1A1A1A]"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-gray-500 truncate">{nombre || email}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#F5A623] font-bold mb-2">{rol}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
