import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = "https://www.isogo.company";
const NEGRO = "#1A1A1A";
const NARANJA = "#F5A623";
const NARANJA_OSCURO = "#C9790A";

function emailBienvenida(nombre: string) {
  const primerNombre = nombre.trim().split(" ")[0] || nombre;

  return `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

      <!-- Header -->
      <div style="background: ${NEGRO}; padding: 36px 40px; text-align: center; border-radius: 14px 14px 0 0;">
        <img src="${SITE_URL}/logo.jpg" alt="Iso Go Company" width="52" height="58" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
        <p style="color: #ffffff; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.01em;">ISO GO COMPANY</p>
        <p style="color: ${NARANJA}; margin: 6px 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">
          Certificación ISO · Kosher · Consultoría
        </p>
      </div>

      <!-- Franja de acento -->
      <div style="height: 4px; background: linear-gradient(to right, ${NARANJA}, ${NARANJA_OSCURO});"></div>

      <!-- Body -->
      <div style="background: #ffffff; padding: 40px; border: 1px solid #eee; border-top: none;">
        <p style="color: ${NEGRO}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px;">
          Solicitud recibida
        </p>
        <h1 style="color: ${NEGRO}; font-size: 24px; font-weight: 800; margin: 0 0 20px; line-height: 1.3;">
          Gracias por tu interés, ${primerNombre}
        </h1>

        <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Recibimos tu solicitud correctamente. Un asesor de Iso Go Company la va a revisar y se va a poner en
          contacto con vos a la brevedad para coordinar una reunión y conversar sobre los próximos pasos.
        </p>

        <!-- Presentación de la empresa -->
        <div style="background: #FAFAFA; border-left: 3px solid ${NARANJA}; border-radius: 0 10px 10px 0; padding: 20px 24px; margin-bottom: 28px;">
          <p style="color: ${NEGRO}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;">
            ¿Quiénes somos?
          </p>
          <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0;">
            Somos una consultora especializada en certificaciones <strong>ISO 9001, ISO 14001, ISO 45001, ISO 22000,
            ISO/IEC 27001 y Kosher</strong>, entre otras. A diferencia de una consultora tradicional, no te dejamos
            con un manual en un cajón: implementamos tu sistema de gestión de punta a punta y lo acompañamos con
            <strong>nuestro propio software</strong> — dashboards, control documental y trazabilidad — para que
            siga funcionando después del certificado.
          </p>
        </div>

        <p style="color: ${NEGRO}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px;">
          Cómo trabajamos
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <tr>
            <td style="width: 32px; padding: 9px 0; vertical-align: top;">
              <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: ${NARANJA}; color: ${NEGRO}; font-size: 11px; font-weight: 800; text-align: center; line-height: 22px;">1</span>
            </td>
            <td style="padding: 9px 0; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">
              <strong style="color: ${NEGRO};">Diagnóstico</strong> — identificamos las brechas frente a la norma
            </td>
          </tr>
          <tr>
            <td style="width: 32px; padding: 9px 0; vertical-align: top;">
              <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: ${NARANJA}; color: ${NEGRO}; font-size: 11px; font-weight: 800; text-align: center; line-height: 22px;">2</span>
            </td>
            <td style="padding: 9px 0; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">
              <strong style="color: ${NEGRO};">Implementación</strong> — documentamos procesos y capacitamos a tu equipo
            </td>
          </tr>
          <tr>
            <td style="width: 32px; padding: 9px 0; vertical-align: top;">
              <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: ${NARANJA}; color: ${NEGRO}; font-size: 11px; font-weight: 800; text-align: center; line-height: 22px;">3</span>
            </td>
            <td style="padding: 9px 0; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">
              <strong style="color: ${NEGRO};">Software de gestión</strong> — desplegamos tu plataforma a medida
            </td>
          </tr>
          <tr>
            <td style="width: 32px; padding: 9px 0; vertical-align: top;">
              <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: ${NARANJA}; color: ${NEGRO}; font-size: 11px; font-weight: 800; text-align: center; line-height: 22px;">4</span>
            </td>
            <td style="padding: 9px 0; color: #333; font-size: 14px;">
              <strong style="color: ${NEGRO};">Certificación</strong> — te acompañamos hasta el día de la auditoría
            </td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="${SITE_URL}" style="background: ${NARANJA}; color: ${NEGRO}; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 8px; display: inline-block; font-size: 14px;">
            Conocer Iso Go Company →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: ${NEGRO}; padding: 26px 40px; border-radius: 0 0 14px 14px; text-align: center;">
        <p style="color: #ccc; font-size: 12px; margin: 0 0 8px;">
          ¿Consulta urgente? Escribinos por WhatsApp
          <a href="https://wa.me/595982859051" style="color: ${NARANJA}; font-weight: 700; text-decoration: none;">+595 982 859 051</a>
        </p>
        <p style="color: #777; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} Iso Go Company · Este correo se envió porque solicitaste información en isogo.company
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  const { nombre, email } = await request.json();

  if (!nombre || !email) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Iso Go Company <acceso@isogo.company>",
    to: email,
    subject: "Recibimos tu solicitud — Iso Go Company",
    html: emailBienvenida(nombre),
  });

  return NextResponse.json({ ok: !error, error: error?.message ?? null });
}
