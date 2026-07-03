import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdvisorBar from "@/components/AdvisorBar";
import StructuredData from "@/components/StructuredData";
import type { Metadata } from "next";

type Locale = "es" | "en" | "pt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    es: "Iso Go Company | Certificación ISO + Automatización",
    en: "Iso Go Company | ISO Certification + Automation",
    pt: "Iso Go Company | Certificação ISO + Automação",
  };
  const descriptions: Record<Locale, string> = {
    es: "Convertimos tu certificación ISO en un sistema de gestión automatizado que impulsa el crecimiento real de tu empresa.",
    en: "We turn your ISO certification into an automated management system that drives real growth for your company.",
    pt: "Transformamos sua certificação ISO em um sistema de gestão automatizado que impulsiona o crescimento real da sua empresa.",
  };
  const l = (locale as Locale) in titles ? (locale as Locale) : "es";
  return {
    title: { default: titles[l], template: `%s | Iso Go Company` },
    description: descriptions[l],
    openGraph: {
      type: "website",
      siteName: "Iso Go Company",
      title: titles[l],
      description: descriptions[l],
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <StructuredData />
      <Header />
      <AdvisorBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
