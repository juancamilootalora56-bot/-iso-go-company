import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import CTABand from "@/components/CTABand";
import HexagonDecor from "@/components/HexagonDecor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog y Recursos ISO | Iso Go Company",
  description: "Artículos y guías sobre certificación ISO, gestión de calidad y automatización de procesos.",
};

const articles = [
  {
    slug: "como-prepararte-para-auditoria-iso-9001",
    title: "Cómo prepararte para una auditoría ISO 9001 sin el estrés de siempre",
    excerpt: "La mayoría de las empresas pasan semanas frenéticas antes de cada auditoría porque su sistema ISO solo existe en papel. Te mostramos cómo cambiar eso de raíz y llegar a la auditoría con 0 sorpresas.",
    category: "ISO 9001",
    readTime: 8,
    date: "2024-12-15",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop",
    featured: true,
  },
  {
    slug: "diferencia-iso-9001-iso-14001-iso-45001",
    title: "ISO 9001, ISO 14001 e ISO 45001: ¿cuál necesita tu empresa primero?",
    excerpt: "Tres de las normas ISO más demandadas, pero cada una con un propósito distinto. Esta guía te ayuda a decidir cuál es la prioridad para tu negocio y cuándo tiene sentido implementarlas juntas.",
    category: "Guías",
    readTime: 12,
    date: "2024-12-05",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
    featured: true,
  },
  {
    slug: "sistema-gestion-automatizado-vs-manual",
    title: "Sistema de gestión manual vs. automatizado: el costo real de no actualizar",
    excerpt: "Calculamos el costo real de mantener un sistema ISO en papel: horas de preparación para auditorías, errores humanos, no conformidades perdidas y tiempo del equipo. Los números sorprenden.",
    category: "Software de Gestión",
    readTime: 10,
    date: "2024-11-28",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    featured: false,
  },
  {
    slug: "iso-22000-exportar-alimentos",
    title: "ISO 22000: la llave para exportar alimentos a Europa y EE.UU.",
    excerpt: "Requisitos concretos que exigen los mercados de la UE y Estados Unidos para importar alimentos. Cómo ISO 22000 te da el marco para cumplirlos y la diferencia entre tenerlo en papel y tenerlo activo.",
    category: "ISO 22000",
    readTime: 9,
    date: "2024-11-20",
    image: "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=500&h=300&fit=crop",
    featured: false,
  },
  {
    slug: "iso-27001-proteccion-datos-empresa",
    title: "ISO/IEC 27001: protege los datos de tu empresa y abre mercados tech",
    excerpt: "Los ataques de ciberseguridad cuestan en promedio USD 4.5 millones por incidente. ISO 27001 no es solo cumplimiento — es la diferencia entre ser auditable por un cliente enterprise o no.",
    category: "ISO 27001",
    readTime: 11,
    date: "2024-11-12",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=300&fit=crop",
    featured: false,
  },
  {
    slug: "implementacion-iso-tiempo-costo",
    title: "¿Cuánto cuesta y cuánto tarda implementar una certificación ISO?",
    excerpt: "La pregunta que todo el mundo hace y nadie responde claramente. Aquí van los rangos reales para empresas de distintos tamaños, más los factores que más impactan el tiempo y el costo total.",
    category: "Guías",
    readTime: 7,
    date: "2024-11-05",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=300&fit=crop",
    featured: false,
  },
];

const categories = ["Todos", "ISO 9001", "ISO 22000", "ISO 27001", "Software de Gestión", "Guías"];

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const locale = await getLocale();

  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-10 top-0 bottom-0 w-40 opacity-20" style={{ background: "#F5A623", transform: "skewX(-8deg)" }} />
          <HexagonDecor size={300} color="#F5A623" className="absolute -right-16 -bottom-16 opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[#F5A623] text-sm font-bold uppercase tracking-widest">Conocimiento aplicado</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">{t("title")}</h1>
            <p className="text-xl text-gray-300">{t("sub")}</p>
          </div>
        </div>
      </section>

      {/* Featured articles */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">Artículos destacados</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {featured.map((article) => (
              <Link key={article.slug} href={`/${locale}/blog/${article.slug}`} className="group">
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={500}
                    height={300}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 bg-[#F5A623] text-[#1A1A1A] text-xs font-bold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <time>{article.date}</time>
                  <span>·</span>
                  <span>{article.readTime} {t("minutes")}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#F5A623] transition-colors leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                <span className="text-[#F5A623] font-semibold text-sm">{t("readMore")} →</span>
              </Link>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat === "Todos"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F4F4F4] text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* All articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rest.map((article) => (
              <Link key={article.slug} href={`/${locale}/blog/${article.slug}`} className="group">
                <div className="rounded-xl overflow-hidden mb-3">
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">{article.category}</span>
                <h3 className="text-sm font-bold text-[#1A1A1A] mt-1 mb-2 leading-tight group-hover:text-[#F5A623] transition-colors">
                  {article.title}
                </h3>
                <div className="text-xs text-gray-500">{article.readTime} {t("minutes")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#F4F4F4] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Recibe nuestros artículos en tu correo</h2>
          <p className="text-gray-600 mb-6">Cada semana, una guía práctica sobre certificación ISO y gestión empresarial. Sin spam.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@empresa.com"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
            <button className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-3 rounded-lg hover:bg-[#e09410] transition-colors whitespace-nowrap">
              Suscribirme
            </button>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
