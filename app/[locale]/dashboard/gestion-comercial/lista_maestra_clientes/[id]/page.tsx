"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { parseClientes, colorEstadoCliente } from "@/lib/clientes";
import { Seccion, Dato } from "@/components/dashboard/SeccionDocumento";

const ITEM_KEY = "clientes_lista";

function fechaLegible(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function PerfilClientePage() {
  const { user } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const basePath = `/${locale}/dashboard/gestion-comercial`;

  const { docs, loading } = useGestionDocumentos("comercial", user?.id ?? null);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const clientes = parseClientes(docs[ITEM_KEY] ?? "");
  const c = clientes.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`${basePath}/lista_maestra_clientes`} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
          ← Lista Maestra de Clientes
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">No se encontró este cliente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href={`${basePath}/lista_maestra_clientes`} className="text-sm text-gray-500 hover:text-[#1A1A1A] inline-block">
        ← Lista Maestra de Clientes
      </Link>

      {/* Encabezado */}
      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A623]/20 rounded-full blur-3xl" />

        <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0 z-10 flex items-center justify-center">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo} alt={c.razonSocial} className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-3xl">🏢</span>
          )}
        </div>
        <div className="relative flex-1 min-w-0 text-center sm:text-left z-10">
          <h1 className="text-xl font-bold text-white">{c.razonSocial}</h1>
          {c.nombreComercial && <p className="text-[#F5A623] font-semibold text-sm">{c.nombreComercial}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400 mt-2">
            {c.sector && <span>🏷️ {c.sector}</span>}
            {c.ruc && <span>🪪 RUC {c.ruc}</span>}
            {c.ciudad && <span>📍 {c.ciudad}{c.pais ? `, ${c.pais}` : ""}</span>}
            {c.email && <span>✉️ {c.email}</span>}
          </div>
          {c.estado && (
            <span
              className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colorEstadoCliente(c.estado) }}
            >
              {c.estado}
            </span>
          )}
        </div>
        <Link
          href={`${basePath}/inscripcion_clientes`}
          className="relative z-10 text-xs font-semibold text-[#F5A623] hover:text-[#e09410] flex-shrink-0 self-center sm:self-start bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          ✎ Editar datos
        </Link>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        <Seccion icono="🏢" titulo="Datos de la empresa">
          <div className="grid sm:grid-cols-3 gap-3">
            <Dato icono="🪪" label="RUC" valor={c.ruc} />
            <Dato icono="🏷️" label="Sector" valor={c.sector} />
            <Dato icono="🏳️" label="País" valor={c.pais} />
            <Dato icono="📍" label="Ciudad" valor={c.ciudad} />
            <Dato icono="📍" label="Dirección" valor={c.direccion} />
            <Dato icono="📞" label="Teléfono" valor={c.telefono} />
            <Dato icono="✉️" label="Email" valor={c.email} />
            <Dato icono="🌐" label="Sitio web" valor={c.sitioWeb} />
          </div>
        </Seccion>

        {(c.contactoNombre || c.contactoTelefono || c.contactoEmail) && (
          <Seccion icono="🧑‍💼" titulo="Persona de contacto">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato label="Nombre" valor={c.contactoNombre} />
              <Dato label="Cargo" valor={c.contactoCargo} />
              <Dato label="Teléfono" valor={c.contactoTelefono} />
              <Dato label="Email" valor={c.contactoEmail} />
            </div>
          </Seccion>
        )}

        {(c.formaPago || c.moneda || c.limiteCredito || c.descuentoHabitual) && (
          <Seccion icono="📄" titulo="Condiciones comerciales">
            <div className="grid sm:grid-cols-3 gap-3">
              <Dato label="Forma de pago" valor={c.formaPago} />
              <Dato label="Moneda" valor={c.moneda} />
              <Dato label="Límite de crédito" valor={c.limiteCredito} />
              <Dato label="Descuento habitual" valor={c.descuentoHabitual} />
            </div>
          </Seccion>
        )}

        <Seccion icono="📝" titulo="Registro">
          <div className="grid sm:grid-cols-3 gap-3">
            <Dato icono="📅" label="Fecha de registro" valor={fechaLegible(c.fechaRegistro)} />
          </div>
          {c.observaciones && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3 pt-3 border-t border-gray-100">{c.observaciones}</p>
          )}
        </Seccion>
      </div>
    </div>
  );
}
