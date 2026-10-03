import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function generarPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export async function POST(request: Request) {
  const { email, nombre, rol, password: passwordInput } = await request.json();

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

  const password = (passwordInput && String(passwordInput).length >= 8) ? passwordInput : generarPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: nombre || null },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "No se pudo crear el usuario" },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin
    .from("perfiles_internos")
    .upsert({ id: created.user.id, email, nombre: nombre || null, rol, activo: true });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, password });
}
