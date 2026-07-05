"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  company: z.string().min(1, "Empresa requerida"),
  norm: z.string().min(1, "Selecciona una norma"),
  message: z.string().min(10, "Mensaje muy corto"),
});

type FormData = z.infer<typeof schema>;

const NORMS = [
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "ISO/IEC 27001",
  "ISO 22000",
  "ISO 13485",
  "ISO 50001",
  "ISO 22301",
  "ISO/IEC 27701",
  "ISO/IEC 42001",
  "ISO/IEC 17025",
  "Kosher",
  "Otra / No sé cuál necesito",
];

export default function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        reset();
        setTimeout(() => setStatus("idle"), 6000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 font-semibold text-lg mb-2">Error al enviar</p>
        <p className="text-red-600 text-sm mb-4">Intenta de nuevo o escríbenos directo a info@isogocompany.com</p>
        <button onClick={() => setStatus("idle")} className="text-sm text-red-500 underline">Intentar de nuevo</button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-800 font-semibold text-lg">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t("name")}</label>
          <input
            {...register("name")}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
            placeholder="Juan García"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t("company")}</label>
          <input
            {...register("company")}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
            placeholder="Mi Empresa S.A."
          />
          {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("norm")}</label>
        <select
          {...register("norm")}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent bg-white"
        >
          <option value="">{t("selectNorm")}</option>
          {NORMS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {errors.norm && <p className="text-red-500 text-xs mt-1">{errors.norm.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("message")}</label>
        <textarea
          {...register("message")}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent resize-none"
          placeholder="Cuéntanos sobre tu empresa, sector, y qué quieres lograr con la certificación..."
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-4 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60 text-base"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
