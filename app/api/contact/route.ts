import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, company, phone, email, norm, message } = await req.json();

    await resend.emails.send({
      from: "Iso Go Company <onboarding@resend.dev>",
      to: "info@isogo.company",
      subject: `Nueva solicitud de cotización — ${norm}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1A1A1A; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #F5A623; margin: 0; font-size: 20px;">Nueva solicitud de cotización</h1>
            <p style="color: #999; margin: 8px 0 0; font-size: 14px;">Iso Go Company — Formulario web</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 140px;">Nombre</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1A1A;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Empresa</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1A1A;">${company}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">📱 WhatsApp / Tel.</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1A1A; font-weight: bold;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">✉️ Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1A1A;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Norma de interés</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #F5A623; font-weight: bold;">${norm}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #555; vertical-align: top;">Mensaje</td>
                <td style="padding: 10px 0; color: #1A1A1A; line-height: 1.6;">${message}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
