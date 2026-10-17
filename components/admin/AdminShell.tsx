"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminShell({
  children,
  nombre,
  email,
}: {
  children: React.ReactNode;
  nombre: string | null;
  email: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/es/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <header className="bg-[#1A1A1A] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="Iso Go Company" width={30} height={34} />
            <div>
              <span className="font-bold text-sm text-white block leading-tight">Iso Go Admin</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Solicitudes de inscripción</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:inline">{nombre || email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
