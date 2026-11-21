"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardUser } from "@/components/dashboard/DashboardUserContext";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { createClient } from "@/lib/supabase/client";
import { parsePersonal, personasVisiblesEquipo, type Empleado } from "@/lib/personal";
import { distanciaMetros, type Sede } from "@/lib/sedesEmpresa";
import {
  type RegistroAsistencia,
  hoyISO,
  horaDeMarca,
  fechaLegible,
  siguienteTipo,
  agruparPorDia,
} from "@/lib/asistencia";
import { Fingerprint, LogIn, LogOut, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const ITEM_KEY_PERSONAL = "personal_lista";
const ACENTO = "#16A34A";

export default function ControlAsistenciaPage() {
  const { user, colaborador } = useDashboardUser();
  const params = useParams();
  const locale = params.locale as string;
  const basePath = `/${locale}/dashboard/gestion-talento-humano`;

  const { docs, loading } = useGestionDocumentos("talento_humano", user?.id ?? null);
  const personal = parsePersonal(docs[ITEM_KEY_PERSONAL] ?? "");

  const esOwner = !colaborador;
  const empleadoPropioId = colaborador?.empleadoId ?? null;
  const propio = empleadoPropioId ? personal.find((p) => p.id === empleadoPropioId) ?? null : null;
  const esJefe = !esOwner && !!propio?.esJefeProceso && !!propio?.proceso;
  const personasVisibles = personasVisiblesEquipo(personal, empleadoPropioId, esOwner);

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [marcando, setMarcando] = useState(false);
  const [errorMarca, setErrorMarca] = useState<string | null>(null);
  const [personaHistorial, setPersonaHistorial] = useState<string>("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("sedes_empresa").select("*").eq("profile_id", user.id);
      setSedes(data ?? []);
    })();
  }, [user?.id]);

  const cargarRegistros = useCallback(async () => {
    if (!user?.id) return;
    const ids = personasVisibles.map((p) => p.id);
    if (ids.length === 0) {
      setRegistros([]);
      setLoadingRegistros(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("registro_asistencia")
      .select("*")
      .eq("profile_id", user.id)
      .in("empleado_id", ids)
      .order("marcado_en", { ascending: false })
      .limit(300);
    setRegistros(data ?? []);
    setLoadingRegistros(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, JSON.stringify(personasVisibles.map((p) => p.id))]);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  useEffect(() => {
    if (!personaHistorial && personasVisibles.length > 0) {
      setPersonaHistorial(propio?.id ?? personasVisibles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personasVisibles.length]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando...</p>;
  }

  const sedePropia = propio?.sedeId ? sedes.find((s) => s.id === propio.sedeId) ?? null : null;
  const registrosPropioHoy = propio
    ? registros.filter((r) => r.empleado_id === propio.id && r.fecha === hoyISO())
    : [];
  const proximoTipo = siguienteTipo(registrosPropioHoy);

  function marcar() {
    if (!propio || !user?.id) return;
    setErrorMarca(null);
    if (!propio.sedeId) {
      setErrorMarca("No tenés una sede asignada. Pedile a tu administrador que te la asigne en Alta de Personal.");
      return;
    }
    const sede = sedes.find((s) => s.id === propio.sedeId);
    if (!sede) {
      setErrorMarca("Tu sede asignada ya no existe. Avisale a tu administrador.");
      return;
    }
    if (!navigator.geolocation) {
      setErrorMarca("Tu navegador no soporta geolocalización.");
      return;
    }
    setMarcando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const distancia = distanciaMetros(pos.coords.latitude, pos.coords.longitude, sede.latitud, sede.longitud);
        const dentro = distancia <= sede.radio_metros;
        if (!dentro) {
          setErrorMarca(
            `Estás a ${Math.round(distancia)} m de "${sede.nombre}" (radio permitido: ${sede.radio_metros} m). Acercate para poder marcar.`
          );
          setMarcando(false);
          return;
        }
        const supabase = createClient();
        const { error } = await supabase.from("registro_asistencia").insert({
          profile_id: user.id,
          empleado_id: propio.id,
          sede_id: sede.id,
          fecha: hoyISO(),
          tipo: proximoTipo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          distancia_metros: distancia,
          dentro_de_radio: true,
        });
        setMarcando(false);
        if (error) {
          setErrorMarca("Error al guardar la marcación. Intenta de nuevo.");
          return;
        }
        await cargarRegistros();
      },
      () => {
        setErrorMarca("No se pudo obtener tu ubicación. Revisá que le hayas dado permiso al navegador.");
        setMarcando(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  const registrosHistorial = registros.filter((r) => r.empleado_id === personaHistorial);
  const dias = agruparPorDia(registrosHistorial);
  const personaSeleccionadaObj = personasVisibles.find((p) => p.id === personaHistorial) ?? null;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href={basePath} className="text-sm text-gray-500 hover:text-[#1A1A1A] mb-4 inline-block">
        ← Gestión del Talento Humano
      </Link>

      <div className="relative bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 overflow-hidden mb-6">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl" style={{ background: `${ACENTO}33` }} />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ACENTO }}>
            Talento Humano
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Control de Asistencia</h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">
            Marcación de entrada y salida validada por ubicación. Solo se puede marcar físicamente en la sede
            asignada.
          </p>
        </div>
      </div>

      {esOwner ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 text-sm text-gray-500">
          Como dueño de la cuenta no marcás asistencia — abajo podés ver el historial de tu equipo.
        </div>
      ) : !propio ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 text-sm text-gray-500">
          Tu cuenta todavía no está vinculada a una ficha de personal — pedile al administrador que te asigne una en
          Alta de Personal.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <MapPin size={14} className="flex-shrink-0" />
            {sedePropia ? (
              <span>
                Tu sede: <span className="font-semibold text-[#1A1A1A]">{sedePropia.nombre}</span> (radio{" "}
                {sedePropia.radio_metros} m)
              </span>
            ) : (
              <span className="text-amber-600 font-medium">No tenés una sede asignada todavía.</span>
            )}
          </div>

          {errorMarca && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMarca}</span>
            </div>
          )}

          <button
            onClick={marcar}
            disabled={marcando || !sedePropia}
            className="w-full flex items-center justify-center gap-2.5 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: proximoTipo === "entrada" ? "#16A34A" : "#DC2626" }}
          >
            {marcando ? (
              <Loader2 size={20} className="animate-spin" />
            ) : proximoTipo === "entrada" ? (
              <LogIn size={20} />
            ) : (
              <LogOut size={20} />
            )}
            {marcando ? "Validando tu ubicación..." : proximoTipo === "entrada" ? "Marcar entrada" : "Marcar salida"}
          </button>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Fingerprint size={14} />
              Hoy:
            </span>
            <span>
              Entrada:{" "}
              <span className="font-semibold text-[#1A1A1A]">
                {registrosPropioHoy.find((r) => r.tipo === "entrada") ? horaDeMarca(registrosPropioHoy.find((r) => r.tipo === "entrada")!.marcado_en) : "—"}
              </span>
            </span>
            <span>
              Salida:{" "}
              <span className="font-semibold text-[#1A1A1A]">
                {registrosPropioHoy.find((r) => r.tipo === "salida") ? horaDeMarca(registrosPropioHoy.find((r) => r.tipo === "salida")!.marcado_en) : "—"}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3 p-5 border-b border-gray-50">
          <h2 className="font-semibold text-sm text-[#1A1A1A]">Historial</h2>
          {(esOwner || esJefe) && personasVisibles.length > 1 && (
            <select
              value={personaHistorial}
              onChange={(e) => setPersonaHistorial(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-[#1A1A1A] focus:outline-none focus:border-[#F5A623]"
            >
              {personasVisibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                  {p.id === propio?.id ? " (yo)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {loadingRegistros ? (
          <p className="text-gray-400 text-sm p-5">Cargando...</p>
        ) : !personaSeleccionadaObj || dias.length === 0 ? (
          <p className="text-gray-400 text-sm p-10 text-center">Todavía no hay marcaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 bg-[#FAFAFA]">
                  <th className="px-5 py-2.5 font-semibold">Fecha</th>
                  <th className="px-5 py-2.5 font-semibold">Entrada</th>
                  <th className="px-5 py-2.5 font-semibold">Salida</th>
                </tr>
              </thead>
              <tbody>
                {dias.map((d) => (
                  <tr key={d.fecha} className="border-t border-gray-50">
                    <td className="px-5 py-2.5 capitalize text-[#1A1A1A]">{fechaLegible(d.fecha)}</td>
                    <td className="px-5 py-2.5">
                      {d.entrada ? (
                        <span className="flex items-center gap-1.5 text-green-700">
                          <CheckCircle2 size={13} /> {horaDeMarca(d.entrada.marcado_en)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      {d.salida ? (
                        <span className="flex items-center gap-1.5 text-red-700">
                          <CheckCircle2 size={13} /> {horaDeMarca(d.salida.marcado_en)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
