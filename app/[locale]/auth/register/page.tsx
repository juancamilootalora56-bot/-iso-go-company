"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const step1Schema = z.object({
  full_name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

const step2Schema = z.object({
  company_name: z.string().min(2, "Nombre requerido"),
  sector: z.string().min(1, "Selecciona un sector"),
  country: z.string().min(2, "País requerido"),
  phone: z.string().optional(),
});

const step3Schema = z.object({
  interested_norms: z.array(z.string()).min(1, "Selecciona al menos una norma"),
  how_heard: z.string().optional(),
  terms: z.literal(true, { error: "Debes aceptar los términos" }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const SECTORS = [
  "Manufactura",
  "Alimentos y Bebidas",
  "Salud y Farmacia",
  "Tecnología",
  "Construcción",
  "Servicios",
  "Otro",
];

const NORMS = [
  { value: "ISO 9001", label: "ISO 9001 — Gestión de Calidad" },
  { value: "ISO 14001", label: "ISO 14001 — Ambiental" },
  { value: "ISO 45001", label: "ISO 45001 — Seguridad Laboral" },
  { value: "ISO/IEC 27001", label: "ISO/IEC 27001 — Seguridad de Información" },
  { value: "ISO 22000", label: "ISO 22000 — Inocuidad Alimentaria" },
  { value: "ISO 13485", label: "ISO 13485 — Dispositivos Médicos" },
  { value: "Kosher", label: "Kosher" },
  { value: "Otro", label: "Otro" },
];

const HOW_HEARD = [
  "Google / Buscador",
  "Redes sociales",
  "Recomendación de un colega",
  "LinkedIn",
  "Evento o conferencia",
  "Otro",
];

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });

  async function onStep1(data: Step1Data) {
    setStep1Data(data);
    setStep(2);
  }

  async function onStep2(data: Step2Data) {
    setStep2Data(data);
    setStep(3);
  }

  async function onStep3(data: Step3Data) {
    if (!step1Data || !step2Data) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: { full_name: step1Data.full_name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (authData.user) {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          full_name: step1Data.full_name,
          company_name: step2Data.company_name,
          sector: step2Data.sector,
          country: step2Data.country,
          phone: step2Data.phone || null,
          interested_norms: data.interested_norms,
        });
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError("Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const steps = ["Tu información", "Tu empresa", "¿Qué buscas?"];

  return (
    <div className="bg-[#242424] rounded-2xl p-8 shadow-2xl border border-white/5">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Crea tu cuenta gratis
      </h1>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8 mt-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 transition-colors ${
                i + 1 < step
                  ? "bg-[#F5A623] text-[#1A1A1A]"
                  : i + 1 === step
                  ? "bg-[#F5A623] text-[#1A1A1A] ring-4 ring-[#F5A623]/20"
                  : "bg-white/10 text-gray-500"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i + 1 < step ? "bg-[#F5A623]" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-sm mb-6">
        Paso {step} de 3 — <span className="text-white">{steps[step - 1]}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre completo
            </label>
            <input
              {...form1.register("full_name")}
              placeholder="Juan García"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            {form1.formState.errors.full_name && (
              <p className="text-red-400 text-xs mt-1">{form1.formState.errors.full_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              {...form1.register("email")}
              type="email"
              placeholder="tu@empresa.com"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            {form1.formState.errors.email && (
              <p className="text-red-400 text-xs mt-1">{form1.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                {...form1.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
            {form1.formState.errors.password && (
              <p className="text-red-400 text-xs mt-1">{form1.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <input
                {...form1.register("confirm_password")}
                type={showConfirm ? "text" : "password"}
                placeholder="Repite tu contraseña"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            {form1.formState.errors.confirm_password && (
              <p className="text-red-400 text-xs mt-1">{form1.formState.errors.confirm_password.message}</p>
            )}
          </div>
          <button type="submit" className="w-full bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors mt-2">
            Continuar →
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre de empresa</label>
            <input
              {...form2.register("company_name")}
              placeholder="Empresa S.A."
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            {form2.formState.errors.company_name && (
              <p className="text-red-400 text-xs mt-1">{form2.formState.errors.company_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Sector</label>
            <select
              {...form2.register("sector")}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F5A623] transition-colors"
            >
              <option value="">Selecciona tu sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {form2.formState.errors.sector && (
              <p className="text-red-400 text-xs mt-1">{form2.formState.errors.sector.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">País</label>
            <input
              {...form2.register("country")}
              placeholder="México"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
            />
            {form2.formState.errors.country && (
              <p className="text-red-400 text-xs mt-1">{form2.formState.errors.country.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Teléfono <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              {...form2.register("phone")}
              placeholder="+52 55 1234 5678"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/10 text-gray-300 font-medium py-3 rounded-lg hover:bg-white/5 transition-colors">
              ← Atrás
            </button>
            <button type="submit" className="flex-1 bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors">
              Continuar →
            </button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              ¿Qué normas te interesan?
            </label>
            <div className="space-y-2">
              {NORMS.map((norm) => (
                <label key={norm.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={norm.value}
                    {...form3.register("interested_norms")}
                    className="w-4 h-4 rounded border-white/10 bg-[#1A1A1A] accent-[#F5A623]"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {norm.label}
                  </span>
                </label>
              ))}
            </div>
            {form3.formState.errors.interested_norms && (
              <p className="text-red-400 text-xs mt-2">{form3.formState.errors.interested_norms.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              ¿Cómo nos conociste?
            </label>
            <select
              {...form3.register("how_heard")}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F5A623] transition-colors"
            >
              <option value="">Selecciona una opción</option>
              {HOW_HEARD.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...form3.register("terms")}
              className="w-4 h-4 rounded border-white/10 bg-[#1A1A1A] accent-[#F5A623] mt-0.5 flex-shrink-0"
            />
            <span className="text-sm text-gray-400">
              Acepto los{" "}
              <span className="text-[#F5A623]">términos y condiciones</span> y la{" "}
              <span className="text-[#F5A623]">política de privacidad</span>
            </span>
          </label>
          {form3.formState.errors.terms && (
            <p className="text-red-400 text-xs -mt-3">{form3.formState.errors.terms.message}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 border border-white/10 text-gray-300 font-medium py-3 rounded-lg hover:bg-white/5 transition-colors">
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#F5A623] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#e09410] transition-colors disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-gray-500 text-sm mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/${locale}/auth/login`} className="text-[#F5A623] hover:text-[#e09410] font-medium">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
