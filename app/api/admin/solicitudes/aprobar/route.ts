import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

function emailInvitacion(nombre: string, empresa: string, link: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A1A1A; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #F5A623; margin: 0; font-size: 20px;">¡Bienvenido a Iso Go Company!</h1>
        <p style="color: #999; margin: 8px 0 0; font-size: 14px;">Tu acceso ya está listo</p>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
        <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">Hola ${nombre},</p>
        <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">
          Tu solicitud de inscripción para <strong>${empresa}</strong> fue aprobada. Hacé clic en el siguiente
          botón para definir tu contraseña y entrar a la plataforma:
        </p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="background: #F5A623; color: #1A1A1A; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
            Configurar mi acceso →
          </a>
        </p>
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br />
          <a href="${link}" style="color: #F5A623; word-break: break-all;">${link}</a>
        </p>
      </div>
    </div>
  `;
}

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

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/es/auth/update-password`;

  let userId: string;
  let actionLink: string;

  const { data: generated, error: generateError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: solicitud.email,
    options: { data: { full_name: solicitud.nombre }, redirectTo },
  });

  if (generated?.user) {
    userId = generated.user.id;
    actionLink = generated.properties.action_link;
  } else if (generateError && /already.*registered|already.*exists/i.test(generateError.message)) {
    // Ya tiene cuenta (p. ej. solicitó antes y fue aprobada) — le generamos un enlace
    // para que (re)defina su contraseña, en vez de intentar crear un usuario nuevo.
    const { data: recovered, error: recoverError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: solicitud.email,
      options: { redirectTo },
    });
    if (!recovered?.user || recoverError) {
      return NextResponse.json({ error: recoverError?.message || "El email ya está registrado, pero no se pudo generar el acceso." }, { status: 400 });
    }
    userId = recovered.user.id;
    actionLink = recovered.properties.action_link;
  } else {
    return NextResponse.json({ error: generateError?.message || "No se pudo generar el acceso" }, { status: 400 });
  }

  // Nueva cuenta: arranca en período de diagnóstico (solo Inicio + Mi
  // Perfil) hasta que se cierre el acuerdo comercial y se active el acceso
  // completo desde este mismo panel. Si ya tenía un perfil con `plan`
  // cargado (ej. ya es cliente activo y se le está regenerando el enlace
  // de acceso), no lo tocamos — nunca se debe "bajar de categoría" a un
  // cliente ya aprobado.
  const { data: perfilExistente } = await admin.from("profiles").select("plan").eq("id", userId).maybeSingle();

  const datosPerfil: Record<string, unknown> = {
    id: userId,
    full_name: solicitud.nombre,
    company_name: solicitud.empresa,
    sector: solicitud.sector,
    country: solicitud.pais,
    phone: solicitud.telefono,
    interested_norms: solicitud.normas_interes,
  };
  if (!perfilExistente?.plan) {
    datosPerfil.plan = "diagnostico";
  }

  const { error: profileError } = await admin.from("profiles").upsert(datosPerfil);

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

  const { error: emailError } = await resend.emails.send({
    from: "Iso Go Company <acceso@isogo.company>",
    to: solicitud.email,
    subject: "Tu acceso a Iso Go Company está listo",
    html: emailInvitacion(solicitud.nombre, solicitud.empresa, actionLink),
  });

  return NextResponse.json({
    ok: true,
    userId,
    emailSent: !emailError,
    emailError: emailError?.message ?? null,
    actionLink,
  });
}
