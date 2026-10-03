import { createClient } from "@/lib/supabase/server";

export default async function CrmHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles_internos")
    .select("nombre, rol")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Hola, {perfil?.nombre || "colaborador"} 👋
      </h1>
      <p className="text-[#8A8478] text-sm mb-8">
        Panel interno de Iso Go Company — rol: <span className="text-[#F5A623] font-semibold">{perfil?.rol}</span>
      </p>

      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-8 text-center">
        <p className="text-[#8A8478] text-sm">
          El CRM está en construcción. Las secciones de Leads, Pipeline, Clientes, Cotizaciones
          y Calendario se van a ir habilitando acá en las próximas fases.
        </p>
      </div>
    </div>
  );
}
