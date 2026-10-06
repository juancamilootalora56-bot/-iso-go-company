"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionComercialPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión Comercial"
      descripcion="Clientes, satisfacción y seguimiento de ventas."
      subsecciones={[
        { icon: "🤝", imagen: "/gestion-comercial/clientes.jpg", titulo: "Clientes", descripcion: "Base de clientes y seguimiento comercial." },
        { icon: "😊", imagen: "/gestion-comercial/satisfaccion_cliente.jpg", titulo: "Satisfacción del cliente", descripcion: "Encuestas y resultados de satisfacción." },
        { icon: "📣", imagen: "/gestion-comercial/reclamos_sugerencias.jpg", titulo: "Reclamos y sugerencias", descripcion: "Registro y gestión de reclamos de clientes." },
        { icon: "💹", imagen: "/gestion-comercial/seguimiento_ventas.jpg", titulo: "Seguimiento de ventas", descripcion: "Indicadores comerciales y cumplimiento de metas." },
      ]}
    />
  );
}
