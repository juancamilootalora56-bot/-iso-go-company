"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CronogramaGeneralRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  useEffect(() => {
    router.replace(`/${locale}/dashboard/gestion-gerencia/cronograma_general/resultado`);
  }, [locale, router]);

  return <p className="text-gray-400 text-sm">Cargando...</p>;
}
