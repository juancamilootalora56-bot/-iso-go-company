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
  const { email, nombre, apellido, cargo, identificacion, foto, permisos, password: passwordInput } =
    await request.json();

  if (!email || !nombre || !apellido) {
    return NextResponse.json({ error: "Email, nombre y apellido son obligatorios" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Un colaborador no puede crear otros colaboradores — solo el dueño de la empresa.
  const { data: soyColaborador } = await supabase
    .from("client_colaboradores")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (soyColaborador) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const password = (passwordInput && String(passwordInput).length >= 8) ? passwordInput : generarPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${nombre} ${apellido}` },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "No se pudo crear el usuario" },
      { status: 400 }
    );
  }

  const { error: insertError } = await admin.from("client_colaboradores").insert({
    id: created.user.id,
    owner_id: user.id,
    nombre,
    apellido,
    cargo: cargo || null,
    identificacion: identificacion || null,
    email,
    foto: foto || null,
    permisos: Array.isArray(permisos) ? permisos : [],
    activo: true,
  });

  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, password });
}

export async function PATCH(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Solo el dueño de ese colaborador puede restablecer su contraseña.
  const { data: colaborador } = await admin
    .from("client_colaboradores")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!colaborador || colaborador.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const password = generarPassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, password });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Solo el dueño de ese colaborador puede eliminarlo.
  const { data: colaborador } = await admin
    .from("client_colaboradores")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!colaborador || colaborador.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await admin.from("client_colaboradores").delete().eq("id", id);
  const { error: deleteError } = await admin.auth.admin.deleteUser(id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
