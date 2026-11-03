import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Devuelve el `plan` de cada perfil pedido. El admin no puede leer perfiles
// ajenos con su propio login (RLS de `profiles` es auth.uid() = id), así
// que esto se resuelve server-side con el service role, igual que el resto
// de las acciones de /admin.
export async function POST(request: Request) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ planes: {} });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("es_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await admin.from("profiles").select("id, plan").in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const planes: Record<string, string | null> = {};
  (data ?? []).forEach((p) => { planes[p.id] = p.plan; });

  return NextResponse.json({ planes });
}
