import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CrmShell from "@/components/crm/CrmShell";

export const metadata: Metadata = {
  title: "Iso Go | Interno",
  robots: { index: false, follow: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/es/auth/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles_internos")
    .select("nombre, rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo) {
    redirect("/es/auth/login");
  }

  return (
    <CrmShell nombre={perfil.nombre} email={user.email ?? ""} rol={perfil.rol}>
      {children}
    </CrmShell>
  );
}
