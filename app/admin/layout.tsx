import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Iso Go | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/es/auth/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("nombre")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/es/auth/login");
  }

  return (
    <AdminShell nombre={admin.nombre} email={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
