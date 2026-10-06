"use client";

import { useParams } from "next/navigation";
import GestionSection from "@/components/dashboard/GestionSection";

export default function GestionComprasPage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <GestionSection
      locale={locale}
      titulo="Gestión de Compras"
      descripcion="Proveedores, evaluaciones y control de tus adquisiciones."
      subsecciones={[
        { icon: "🏭", imagen: "/gestion-compras/proveedores.jpg", titulo: "Proveedores", descripcion: "Listado y datos de contacto de tus proveedores." },
        { icon: "✅", imagen: "/gestion-compras/evaluacion_proveedores.jpg", titulo: "Evaluación de proveedores", descripcion: "Criterios de selección y desempeño de cada proveedor." },
        { icon: "🧾", imagen: "/gestion-compras/ordenes_compra.jpg", titulo: "Órdenes de compra", descripcion: "Registro y seguimiento de las compras realizadas." },
        { icon: "📦", imagen: "/gestion-compras/control_recepcion.jpg", titulo: "Control de recepción", descripcion: "Verificación de productos y servicios recibidos." },
      ]}
    />
  );
}
