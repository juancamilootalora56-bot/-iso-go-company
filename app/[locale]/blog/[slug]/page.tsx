import { getLocale } from "next-intl/server";
import Link from "next/link";
import CTABand from "@/components/CTABand";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();

  return (
    <>
      <section className="bg-[#F4F4F4] py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link href={`/${locale}/blog`} className="text-[#F5A623] font-semibold text-sm hover:underline">
            ← Volver al Blog
          </Link>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-[#F5A623] text-xs font-bold uppercase tracking-wider">Artículo</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-2 mb-6 leading-tight">
            Artículo en construcción
          </h1>
          <p className="text-gray-600 leading-relaxed">
            El artículo <strong>{slug}</strong> estará disponible próximamente. Mientras tanto, te invitamos a explorar
            nuestras certificaciones o contactarnos para una asesoría personalizada.
          </p>
          <div className="mt-8">
            <Link href={`/${locale}/contacto`} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-6 py-3 rounded-lg hover:bg-[#e09410] transition-colors inline-block">
              Habla con un asesor →
            </Link>
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
