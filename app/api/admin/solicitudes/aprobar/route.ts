import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { solicitudId } = await request.json();

  if (!solicitudId) {
    return NextResponse.json({ error: "Falta el id de la solicitud" }, { status: 400 });
  }

  // Verificar que quien llama está logueado Y es admin.
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("es_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data: solicitud, error: solicitudError } = await supabase
    .from("solicitudes_inscripcion")
    .select("*")
    .eq("id", solicitudId)
    .maybeSingle();

  if (solicitudError || !solicitud) {
    return NextResponse.json({ error: "No se encontró la solicitud" }, { status: 404 });
  }

  // Cliente admin (service_role) — solo se usa server-side, nunca llega al navegador.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let userId: string;

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(solicitud.email, {
    data: { full_name: solicitud.nombre },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/es/auth/update-password`,
  });

  if (invited?.user) {
    userId = invited.user.id;
  } else if (inviteError && /already.*registered|already.*exists/i.test(inviteError.message)) {
    // Ya tiene cuenta (p. ej. solicitó antes y fue invitado) — reutilizamos ese usuario.
    let found: { id: string } | undefined;
    let page = 1;
    while (!found) {
      const { data: listed } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      found = listed.users.find((u) => u.email === solicitud.email);
      if (found || listed.users.length < 200) break;
      page++;
    }
    if (!found) {
      return NextResponse.json({ error: "El email ya está registrado, pero no se pudo recuperar la cuenta." }, { status: 400 });
    }
    userId = found.id;
  } else {
    return NextResponse.json({ error: inviteError?.message || "No se pudo invitar al usuario" }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: solicitud.nombre,
    company_name: solicitud.empresa,
    sector: solicitud.sector,
    country: solicitud.pais,
    phone: solicitud.telefono,
    interested_norms: solicitud.normas_interes,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: updateError } = await admin
    .from("solicitudes_inscripcion")
    .update({
      estado: "aprobada",
      fecha_resolucion: new Date().toISOString(),
      resuelto_por: user.id,
      usuario_creado_id: userId,
    })
    .eq("id", solicitudId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId });
}
