import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { email, nombre, rol } = await request.json();

  if (!email || !rol || !["admin", "comercial", "tecnico"].includes(rol)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Verificar que quien llama está logueado Y es admin interno.
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("es_admin_interno");
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Cliente admin (service_role) — solo se usa server-side, nunca llega al navegador.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { origin } = new URL(request.url);

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: nombre || null },
    redirectTo: `${origin}/es/auth/callback?next=/crm`,
  });

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message || "No se pudo invitar al usuario" },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin
    .from("perfiles_internos")
    .upsert({ id: invited.user.id, email, nombre: nombre || null, rol, activo: true });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
