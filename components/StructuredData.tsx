export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Iso Go Company",
    url: "https://www.isogocompany.com",
    logo: "https://www.isogocompany.com/logo.svg",
    description:
      "Expertos en certificación ISO y automatización de sistemas de gestión empresarial.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-000-0000",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English", "Portuguese"],
    },
    areaServed: ["CO", "MX", "AR", "CL", "PE", "BR"],
    sameAs: ["https://linkedin.com/company/iso-go-company"],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@type": "Organization", name: "Iso Go Company" },
    serviceType: "ISO Certification Consulting",
    name: "Certificación ISO y Automatización de Sistemas de Gestión",
    description:
      "Implementación de normas ISO 9001, 14001, 45001, 27001, 22000, 13485 y más, con software de gestión a medida.",
    areaServed: "América Latina",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Certificaciones ISO",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 9001 - Gestión de Calidad" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 14001 - Gestión Ambiental" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 45001 - Seguridad Ocupacional" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO/IEC 27001 - Seguridad de la Información" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 22000 - Inocuidad Alimentaria" } },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
