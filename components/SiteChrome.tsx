"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdvisorBar from "@/components/AdvisorBar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClientPortal = /^\/(es|en|pt)\/dashboard(\/|$)/.test(pathname);

  if (isClientPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <AdvisorBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
