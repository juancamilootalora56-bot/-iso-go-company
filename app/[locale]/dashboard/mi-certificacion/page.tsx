"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMiProceso } from "@/hooks/useMiProceso";

const ETAPA_INFO: Record<string, { label: string; color: string; probabilidad: number }> = {
  lead_nuevo: { label: "Lead nuevo", color: "#60A5FA", probabilidad: 10 },
  contactado: { label: "Contactado", color: "#FBBF24", probabilidad: 25 },
  reunion: { label: "Reunión agendada", color: "#22D3EE", probabilidad: 40 },
  presentacion: { label: "Presentación", color: "#2DD4BF", probabilidad: 55 },
  demo: { label: "Demo en curso", color: "#A78BFA", probabilidad: 70 },
  negociacion: { label: "Negociación", color: "#F5A623", probabilidad: 85 },
  ganado: { label: "Cliente activo", color: "#4ADE80", probabilidad: 100 },
  perdido: { label: "Cerrado", color: "#F87171", probabilidad: 0 },
};

function fmtDate(iso: string | null, withTime = false) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es", withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function MiCertificacionPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { cliente, lead, loading } = useMiProceso();

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  if (!cliente && !lead) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 border border-gray-100 text-center">
        <p className="text-2xl mb-3">📋</p>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Todavía no tenés un proceso iniciado</h1>
        <p className="text-gray-500 text-sm mb-6">
          Agenda un diagnóstico gratuito y un asesor va a armar tu proceso de certificación.
        </p>
        <Link
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
        >
          Hablar con un asesor →
        </Link>
      </div>
    );
  }

  const etapa = lead ? (ETAPA_INFO[lead.etapa] ?? ETAPA_INFO.lead_nuevo) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mi Certificación</h1>
        <p className="text-gray-500 text-sm mt-1">
          {cliente ? "Estado de tu servicio contratado" : "Estado de tu proceso con Iso Go Company"}
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1A1A1A]">Estado actual</h2>
          {cliente ? (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
              Cliente activo
            </span>
          ) : etapa ? (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: `${etapa.color}1A`, color: etapa.color }}
            >
              {etapa.label}
            </span>
          ) : null}
        </div>

        {!cliente && etapa && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${etapa.probabilidad}%`, backgroundColor: etapa.color }}
            />
          </div>
        )}

        <dl className="space-y-3 text-sm">
          {(cliente?.norma_interes || lead?.norma_interes) && (
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">Norma / servicio</dt>
              <dd className="text-[#1A1A1A] font-medium">{cliente?.norma_interes || lead?.norma_interes}</dd>
            </div>
          )}
          {(cliente?.empresa || lead?.empresa) && (
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">Empresa</dt>
              <dd className="text-[#1A1A1A] font-medium">{cliente?.empresa || lead?.empresa}</dd>
            </div>
          )}

          {/* Cliente activo: condiciones del servicio */}
          {cliente && lead?.tipo_producto && (
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">Modalidad</dt>
              <dd className="text-[#1A1A1A] font-medium">
                {lead.tipo_producto === "solo_software" ? "Solo software" : "Software + coordinación"}
              </dd>
            </div>
          )}
          {cliente && lead?.forma_pago && (
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">Forma de pago</dt>
              <dd className="text-[#1A1A1A] font-medium">
                {lead.forma_pago === "cuotas" ? `Cuotas (${lead.cuotas ?? "-"}x)` : "Contado"}
              </dd>
            </div>
          )}
          {cliente && lead?.fecha_inicio_servicio && (
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">Fecha de inicio</dt>
              <dd className="text-[#1A1A1A] font-medium">{fmtDate(lead.fecha_inicio_servicio)}</dd>
            </div>
          )}

          {/* Pipeline: detalle por etapa */}
          {!cliente && lead?.etapa === "reunion" && (
            <>
              {lead.reunion_fecha && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Fecha de la reunión</dt>
                  <dd className="text-[#1A1A1A] font-medium">{fmtDate(lead.reunion_fecha, true)}</dd>
                </div>
              )}
              {lead.reunion_lugar && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Lugar</dt>
                  <dd className="text-[#1A1A1A] font-medium">{lead.reunion_lugar}</dd>
                </div>
              )}
              {lead.reunion_modalidad && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Modalidad</dt>
                  <dd className="text-[#1A1A1A] font-medium">
                    {lead.reunion_modalidad === "presencial" ? "Presencial" : "Virtual"}
                  </dd>
                </div>
              )}
            </>
          )}

          {!cliente && lead?.etapa === "presentacion" && (
            <>
              {lead.presentacion_fecha && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Fecha de la presentación</dt>
                  <dd className="text-[#1A1A1A] font-medium">{fmtDate(lead.presentacion_fecha, true)}</dd>
                </div>
              )}
              {lead.presentacion_lugar && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Lugar</dt>
                  <dd className="text-[#1A1A1A] font-medium">{lead.presentacion_lugar}</dd>
                </div>
              )}
              {lead.presentacion_modalidad && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Modalidad</dt>
                  <dd className="text-[#1A1A1A] font-medium">
                    {lead.presentacion_modalidad === "presencial" ? "Presencial" : "Virtual"}
                  </dd>
                </div>
              )}
            </>
          )}

          {!cliente && lead?.etapa === "demo" && (
            <>
              {lead.demo_fecha_entrega && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Demo entregada</dt>
                  <dd className="text-[#1A1A1A] font-medium">{fmtDate(lead.demo_fecha_entrega)}</dd>
                </div>
              )}
              {lead.demo_dias_acceso != null && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Días de acceso</dt>
                  <dd className="text-[#1A1A1A] font-medium">{lead.demo_dias_acceso}</dd>
                </div>
              )}
            </>
          )}

          {!cliente && (lead?.forma_pago || lead?.tipo_producto) && (
            <>
              {lead.forma_pago && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Forma de pago propuesta</dt>
                  <dd className="text-[#1A1A1A] font-medium">
                    {lead.forma_pago === "cuotas" ? `Cuotas (${lead.cuotas ?? "-"}x)` : "Contado"}
                  </dd>
                </div>
              )}
              {lead.tipo_producto && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Modalidad propuesta</dt>
                  <dd className="text-[#1A1A1A] font-medium">
                    {lead.tipo_producto === "solo_software" ? "Solo software" : "Software + coordinación"}
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>

        {!cliente && (lead?.reunion_proximos_pasos || lead?.presentacion_proximos_pasos || lead?.demo_proximos_pasos) && (
          <div className="mt-5 bg-[#F5A623]/5 border border-[#F5A623]/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-[#F5A623] mb-1">Próximos pasos</p>
            <p className="text-sm text-[#1A1A1A]">
              {lead?.reunion_proximos_pasos || lead?.presentacion_proximos_pasos || lead?.demo_proximos_pasos}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#1A1A1A] rounded-xl p-6 text-center">
        <p className="text-[#F5A623] font-semibold mb-2">¿Tenés dudas sobre tu proceso?</p>
        <p className="text-gray-400 text-sm mb-4">Escribinos y un asesor te va a responder a la brevedad.</p>
        <Link
          href={`/${locale}/contacto`}
          className="inline-block bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
        >
          Contactar asesor
        </Link>
      </div>
    </div>
  );
}
