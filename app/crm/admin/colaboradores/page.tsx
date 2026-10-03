import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ColaboradoresClient from "./ColaboradoresClient";

export default async function ColaboradoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfiles_internos")
    .select("rol")
    .eq("id", user?.id)
    .maybeSingle();

  if (perfil?.rol !== "admin") {
    redirect("/crm");
  }

  const { data: colaboradores } = await supabase
    .from("perfiles_internos")
    .select("id, email, nombre, rol, activo, created_at")
    .order("created_at", { ascending: false });

  return <ColaboradoresClient initialColaboradores={colaboradores ?? []} />;
}
