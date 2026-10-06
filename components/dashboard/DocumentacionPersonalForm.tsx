"use client";

import { useEffect, useRef, useState } from "react";
import { useGestionDocumentos } from "@/hooks/useGestionDocumentos";
import { Seccion } from "@/components/dashboard/SeccionDocumento";
import type { Empleado } from "@/lib/personal";
import { CATEGORIAS_DOCUMENTOS, parseDocumentos, nombreCategoria, type DocumentoArchivo } from "@/lib/documentacionPersonal";

const MAX_DOC_BYTES = 2_500_000; // ~2.5MB

function fechaLegible(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function DocumentacionPersonalForm({ userId, empleado }: { userId: string | null; empleado: Empleado }) {
  const itemKey = `documentacion_${empleado.id}`;
  const { docs, loading, save } = useGestionDocumentos("talento_humano", userId);

  const [documentos, setDocumentos] = useState<DocumentoArchivo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombreOtroNuevo, setNombreOtroNuevo] = useState("");

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fileInputOtroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) setDocumentos(parseDocumentos(docs[itemKey] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function persistir(actualizados: DocumentoArchivo[]) {
    setSaving(true);
    await save(itemKey, JSON.stringify(actualizados));
    setDocumentos(actualizados);
    setSaving(false);
  }

  function docDeCategoria(categoria: string) {
    return documentos.find((d) => d.categoria === categoria);
  }

  function handleArchivo(categoria: string, nombreOtro: string, file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setError(`"${file.name}" pesa demasiado. Usá un archivo de menos de 2.5MB.`);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const existente = documentos.find((d) => d.categoria === categoria);
      const nuevo: DocumentoArchivo = {
        id: existente?.id ?? crypto.randomUUID(),
        categoria,
        nombreOtro,
        nombreArchivo: file.name,
        tipoMime: file.type,
        dataUrl: reader.result as string,
        fechaCarga: new Date().toISOString(),
      };
      const actualizados = existente
        ? documentos.map((d) => (d.id === existente.id ? nuevo : d))
        : [...documentos, nuevo];
      persistir(actualizados);
    };
    reader.readAsDataURL(file);
  }

  async function eliminarDocumento(id: string) {
    await persistir(documentos.filter((d) => d.id !== id));
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-6 text-center">Cargando...</p>;
  }

  const obligatoriosFaltantes = CATEGORIAS_DOCUMENTOS.filter((c) => c.obligatorio && !docDeCategoria(c.clave));
  const otros = documentos.filter((d) => d.categoria === "otro");

  return (
    <div className="space-y-4">
      <Seccion icono="🗂️" titulo="Documentación del Colaborador">
        <p className="text-xs text-gray-500 mb-4">
          Expediente documental de {empleado.nombre}. Los archivos se guardan de forma privada, asociados solo a su
          perfil.
        </p>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>
        )}

        {obligatoriosFaltantes.length > 0 && (
          <div className="mb-4 p-3 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-lg">
            <p className="text-xs font-semibold text-[#1A1A1A]">
              Faltan {obligatoriosFaltantes.length} documento{obligatoriosFaltantes.length !== 1 ? "s" : ""} obligatorio{obligatoriosFaltantes.length !== 1 ? "s" : ""}:
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {obligatoriosFaltantes.map((c) => c.nombre).join(" · ")}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {CATEGORIAS_DOCUMENTOS.map((cat) => {
            const doc = docDeCategoria(cat.clave);
            return (
              <div
                key={cat.clave}
                className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl border border-gray-100 p-3"
              >
                <span className="text-xl flex-shrink-0">{cat.icono}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {cat.nombre}
                    {cat.obligatorio && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {doc ? (
                    <a
                      href={doc.dataUrl}
                      download={doc.nombreArchivo}
                      className="text-xs text-[#F5A623] hover:text-[#e09410] truncate block"
                    >
                      📎 {doc.nombreArchivo} · {fechaLegible(doc.fechaCarga)}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">Sin cargar</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => fileInputRefs.current[cat.clave]?.click()}
                    className="text-xs font-semibold text-[#F5A623] hover:text-[#e09410]"
                  >
                    {doc ? "Reemplazar" : "Subir"}
                  </button>
                  {doc && (
                    <button onClick={() => eliminarDocumento(doc.id)} className="text-xs text-gray-300 hover:text-red-500">
                      ✕
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[cat.clave] = el; }}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleArchivo(cat.clave, "", e.target.files?.[0])}
                />
              </div>
            );
          })}
        </div>
      </Seccion>

      {/* Otros documentos */}
      <Seccion icono="➕" titulo="Otros documentos">
        {otros.length > 0 && (
          <div className="space-y-2 mb-4">
            {otros.map((d) => (
              <div key={d.id} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl border border-gray-100 p-3">
                <span className="text-xl flex-shrink-0">📁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{d.nombreOtro || "Documento"}</p>
                  <a href={d.dataUrl} download={d.nombreArchivo} className="text-xs text-[#F5A623] hover:text-[#e09410] truncate block">
                    📎 {d.nombreArchivo} · {fechaLegible(d.fechaCarga)}
                  </a>
                </div>
                <button onClick={() => eliminarDocumento(d.id)} className="text-xs text-gray-300 hover:text-red-500 flex-shrink-0">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            value={nombreOtroNuevo}
            onChange={(e) => setNombreOtroNuevo(e.target.value)}
            placeholder="Nombre del documento (ej: Constancia de estudios)"
            className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#F5A623]"
          />
          <button
            onClick={() => {
              if (!nombreOtroNuevo.trim()) {
                setError("Escribí un nombre para el documento antes de subirlo.");
                return;
              }
              fileInputOtroRef.current?.click();
            }}
            className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#e09410]"
          >
            + Subir
          </button>
          <input
            ref={fileInputOtroRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              handleArchivo("otro", nombreOtroNuevo, e.target.files?.[0]);
              setNombreOtroNuevo("");
            }}
          />
        </div>
        {saving && <p className="text-xs text-gray-400 mt-2">Guardando...</p>}
      </Seccion>
    </div>
  );
}
