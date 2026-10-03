import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmpresasClient from "./EmpresasClient";

export default async function EmpresasPage() {
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

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, empresa, representante, nombre, cargo, rubro, telefono, email, direccion, num_colaboradores, etapa, created_by, created_at"
    )
    .order("created_at", { ascending: false });

  const { data: perfiles } = await supabase
    .from("perfiles_internos")
    .select("id, nombre, email");

  return (
    <EmpresasClient
      initialLeads={leads ?? []}
      perfiles={perfiles ?? []}
    />
  );
}
