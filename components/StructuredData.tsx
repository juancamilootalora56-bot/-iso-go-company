export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Iso Go Company",
    url: "https://isogo.company",
    logo: "https://isogo.company/logo.jpg",
    description: "Consultora líder en certificaciones ISO y Kosher. Implementamos tu sistema de gestión y te acompañamos hasta el certificado.",
    email: "info@isogo.company",
    telephone: "+595982859051",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+595982859051",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English", "Portuguese"],
    },
    areaServed: ["PY", "CO", "MX", "AR", "CL", "PE", "BR", "UY"],
    sameAs: [
      "https://instagram.com/isogocompany",
      "https://tiktok.com/@iso.go.company",
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@type": "Organization", name: "Iso Go Company" },
    serviceType: "Consultoría de Certificación ISO y Kosher",
    name: "Certificación ISO, Kosher y Consultoría Empresarial",
    description: "Implementación de normas ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 22000, certificación Kosher y más, con software de gestión integrado.",
    areaServed: "América Latina",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Certificaciones y Consultoría",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 9001 - Gestión de Calidad" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 14001 - Gestión Ambiental" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 45001 - Seguridad Ocupacional" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO/IEC 27001 - Seguridad de la Información" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ISO 22000 - Inocuidad Alimentaria" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Certificación Kosher" } },
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
