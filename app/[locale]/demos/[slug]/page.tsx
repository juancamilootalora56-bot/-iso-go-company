"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── Demo content map ────────────────────────────────────────────────────────

type TabData = {
  label: string;
  content: React.ReactNode;
};

// Shared "plan only" tooltip button
function LockedAction({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(true)}
        className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
      >
        {label}
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#1A1A1A] text-white text-xs rounded-lg px-3 py-2 text-center shadow-lg z-10">
          Solo disponible en plan activo
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A]" />
        </div>
      )}
    </div>
  );
}

type StatusBadge = "Activo" | "En revisión" | "Alta" | "Media" | "Baja" | "Abierta" | "En proceso" | "Cerrada" | "Conforme" | "En revisión" | "Crítico" | "Aprobado" | "Pendiente" | "Vigente" | "Por renovar";

function Badge({ status }: { status: StatusBadge }) {
  const colors: Record<string, string> = {
    Activo: "bg-green-50 text-green-700 border-green-200",
    "En revisión": "bg-yellow-50 text-yellow-700 border-yellow-200",
    Alta: "bg-red-50 text-red-700 border-red-200",
    Media: "bg-orange-50 text-orange-700 border-orange-200",
    Baja: "bg-blue-50 text-blue-700 border-blue-200",
    Abierta: "bg-red-50 text-red-700 border-red-200",
    "En proceso": "bg-yellow-50 text-yellow-700 border-yellow-200",
    Cerrada: "bg-green-50 text-green-700 border-green-200",
    Conforme: "bg-green-50 text-green-700 border-green-200",
    Crítico: "bg-red-50 text-red-700 border-red-200",
    Aprobado: "bg-green-50 text-green-700 border-green-200",
    Pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Vigente: "bg-green-50 text-green-700 border-green-200",
    "Por renovar": "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

// ─── ISO 9001 Content ─────────────────────────────────────────────────────────
const iso9001Tabs: TabData[] = [
  {
    label: "Procesos",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Proceso</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Responsable</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Última actualización</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { name: "Gestión de Compras", owner: "Ana Martínez", status: "Activo", date: "12/06/2025" },
              { name: "Control de Producción", owner: "Carlos Vega", status: "Activo", date: "10/06/2025" },
              { name: "Gestión de Ventas", owner: "Luis Torres", status: "En revisión", date: "08/06/2025" },
              { name: "Recursos Humanos", owner: "María Gómez", status: "Activo", date: "05/06/2025" },
              { name: "Auditoría Interna", owner: "Pedro Ruiz", status: "En revisión", date: "01/06/2025" },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.name}</td>
                <td className="py-3 px-4 text-gray-600">{row.owner}</td>
                <td className="py-3 px-4"><Badge status={row.status as StatusBadge} /></td>
                <td className="py-3 px-4 text-gray-500">{row.date}</td>
                <td className="py-3 px-4"><LockedAction label="Ver detalle" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Documentos",
    content: (
      <div className="divide-y divide-gray-50">
        {[
          { name: "Manual de Calidad v3.1", type: "PDF", size: "2.4 MB", date: "15/05/2025" },
          { name: "Procedimiento de Auditoría Interna", type: "PDF", size: "1.1 MB", date: "10/05/2025" },
          { name: "Procedimiento de No Conformidades", type: "PDF", size: "890 KB", date: "08/05/2025" },
          { name: "Política de Calidad 2025", type: "PDF", size: "320 KB", date: "01/01/2025" },
          { name: "Mapa de Procesos", type: "PDF", size: "1.8 MB", date: "15/12/2024" },
        ].map((doc) => (
          <div key={doc.name} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                PDF
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.size} · {doc.date}</p>
              </div>
            </div>
            <LockedAction label="Descargar" />
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "No Conformidades",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Descripción</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Severidad</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Responsable</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { desc: "Registro de calibración vencido en línea 3", severity: "Alta", status: "Abierta", owner: "Carlos Vega" },
              { desc: "Proveedor sin evaluación actualizada — Aceros S.A.", severity: "Media", status: "En proceso", owner: "Ana Martínez" },
              { desc: "Producto terminado despachado sin inspección final", severity: "Alta", status: "En proceso", owner: "Luis Torres" },
              { desc: "Procedimiento de compras no aplicado en 2 órdenes", severity: "Baja", status: "Cerrada", owner: "Ana Martínez" },
            ].map((nc, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700 max-w-xs">{nc.desc}</td>
                <td className="py-3 px-4"><Badge status={nc.severity as StatusBadge} /></td>
                <td className="py-3 px-4"><Badge status={nc.status as StatusBadge} /></td>
                <td className="py-3 px-4 text-gray-600">{nc.owner}</td>
                <td className="py-3 px-4"><LockedAction label="Ver más" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Indicadores",
    content: (
      <div className="grid sm:grid-cols-3 gap-4 p-4">
        {[
          { name: "Satisfacción del cliente", value: "94%", trend: "+2% vs mes anterior", icon: "😊", color: "green" },
          { name: "Entregas a tiempo", value: "87%", trend: "-1% vs mes anterior", icon: "🚚", color: "yellow" },
          { name: "No conformidades abiertas", value: "3", trend: "↓ desde 7 el mes anterior", icon: "⚠️", color: "red" },
        ].map((kpi) => (
          <div key={kpi.name} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-2xl mb-3">{kpi.icon}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] mb-1">{kpi.value}</p>
            <p className="text-sm font-medium text-gray-700 mb-1">{kpi.name}</p>
            <p className="text-xs text-gray-500">{kpi.trend}</p>
          </div>
        ))}
      </div>
    ),
  },
];

// ─── ISO 14001 Content ────────────────────────────────────────────────────────
const iso14001Tabs: TabData[] = [
  {
    label: "Aspectos Ambientales",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aspecto</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Impacto</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Significativo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { aspect: "Generación de residuos sólidos", impact: "Contaminación del suelo", sig: "Sí", control: "Programa de reciclaje activo" },
              { aspect: "Consumo de agua en producción", impact: "Agotamiento del recurso", sig: "Sí", control: "Medidores y plan de ahorro" },
              { aspect: "Emisiones de gases (calderas)", impact: "Contaminación atmosférica", sig: "Sí", control: "Filtros certificados" },
              { aspect: "Derrame de lubricantes", impact: "Contaminación hídrica", sig: "No", control: "Bandejas de contención" },
              { aspect: "Ruido externo de operación", impact: "Contaminación acústica", sig: "No", control: "Barreras de atenuación" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.aspect}</td>
                <td className="py-3 px-4 text-gray-600">{row.impact}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${row.sig === "Sí" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {row.sig}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Objetivos",
    content: (
      <div className="divide-y divide-gray-50 p-4">
        {[
          { obj: "Reducir generación de residuos en 20%", meta: "Dic 2025", avance: 55, owner: "Jefe de Planta" },
          { obj: "Disminuir consumo de agua en 15%", meta: "Dic 2025", avance: 30, owner: "Operaciones" },
          { obj: "Cero derrames de sustancias peligrosas", meta: "Permanente", avance: 90, owner: "SSOMA" },
        ].map((o, i) => (
          <div key={i} className="py-4">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium text-[#1A1A1A] text-sm">{o.obj}</p>
              <span className="text-xs text-gray-400 ml-4 flex-shrink-0">{o.meta}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Responsable: {o.owner}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#F5A623] h-2 rounded-full"
                  style={{ width: `${o.avance}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#1A1A1A]">{o.avance}%</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Cumplimiento Legal",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Requisito Legal</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { req: "Licencia ambiental de operación", type: "Permiso", status: "Vigente", exp: "31/12/2025" },
              { req: "Registro de generador de residuos peligrosos", type: "Registro", status: "Vigente", exp: "15/08/2025" },
              { req: "Monitoreo de emisiones atmosféricas", type: "Reporte", status: "Por renovar", exp: "30/06/2025" },
              { req: "Plan de manejo de residuos sólidos", type: "Plan", status: "Vigente", exp: "31/12/2025" },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{r.req}</td>
                <td className="py-3 px-4 text-gray-600">{r.type}</td>
                <td className="py-3 px-4"><Badge status={r.status as StatusBadge} /></td>
                <td className="py-3 px-4 text-gray-500">{r.exp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
];

// ─── ISO 45001 Content ────────────────────────────────────────────────────────
const iso45001Tabs: TabData[] = [
  {
    label: "Peligros y Riesgos",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Peligro</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Área</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nivel de riesgo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { hazard: "Trabajo en alturas > 1.8m", area: "Mantenimiento", risk: "Alta", control: "Arnés + permiso de trabajo" },
              { hazard: "Exposición a ruido industrial", area: "Producción", risk: "Media", control: "EPP auditivo obligatorio" },
              { hazard: "Manipulación de cargas > 25kg", area: "Logística", risk: "Media", control: "Capacitación ergonomía" },
              { hazard: "Contacto con sustancias químicas", area: "Laboratorio", risk: "Alta", control: "MSDS + EPP específico" },
              { hazard: "Tránsito vehicular en planta", area: "Patio", risk: "Crítico", control: "Señalización + velocidad 10km/h" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.hazard}</td>
                <td className="py-3 px-4 text-gray-600">{row.area}</td>
                <td className="py-3 px-4"><Badge status={row.risk as StatusBadge} /></td>
                <td className="py-3 px-4 text-gray-600">{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Incidentes",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Descripción</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { desc: "Caída a nivel en área mojada — sin lesión", date: "10/06/2025", type: "Cuasi accidente", status: "Cerrada" },
              { desc: "Golpe con montacargas — contusión leve", date: "02/06/2025", type: "Accidente leve", status: "En proceso" },
              { desc: "Derrame de ácido — sin contacto", date: "20/05/2025", type: "Cuasi accidente", status: "Cerrada" },
            ].map((inc, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700">{inc.desc}</td>
                <td className="py-3 px-4 text-gray-500">{inc.date}</td>
                <td className="py-3 px-4 text-gray-600">{inc.type}</td>
                <td className="py-3 px-4"><Badge status={inc.status as StatusBadge} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Inspecciones",
    content: (
      <div className="divide-y divide-gray-50">
        {[
          { name: "Inspección de extintores", freq: "Mensual", last: "01/06/2025", status: "Conforme", inspector: "Pedro Ruiz" },
          { name: "Revisión de EPP en bodega", freq: "Quincenal", last: "15/06/2025", status: "Conforme", inspector: "María Gómez" },
          { name: "Inspección de orden y limpieza — Planta 2", freq: "Semanal", last: "17/06/2025", status: "En revisión", inspector: "Carlos Vega" },
          { name: "Verificación de señalización vial", freq: "Mensual", last: "28/05/2025", status: "Conforme", inspector: "Pedro Ruiz" },
        ].map((insp, i) => (
          <div key={i} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-sm text-[#1A1A1A]">{insp.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Frecuencia: {insp.freq} · Inspector: {insp.inspector}</p>
            </div>
            <div className="text-right">
              <Badge status={insp.status as StatusBadge} />
              <p className="text-xs text-gray-400 mt-1">{insp.last}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Indicadores",
    content: (
      <div className="grid sm:grid-cols-3 gap-4 p-4">
        {[
          { name: "Tasa de frecuencia de accidentes", value: "1.2", unit: "por millón h/h", icon: "📉", trend: "↓ desde 2.1" },
          { name: "Días sin accidentes incapacitantes", value: "84", unit: "días consecutivos", icon: "📅", trend: "Récord del año" },
          { name: "Inspecciones completadas", value: "97%", unit: "sobre programadas", icon: "✅", trend: "+3% vs mes anterior" },
        ].map((kpi) => (
          <div key={kpi.name} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-2xl mb-3">{kpi.icon}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] mb-0.5">{kpi.value}</p>
            <p className="text-xs text-gray-500 mb-2">{kpi.unit}</p>
            <p className="text-sm font-medium text-gray-700 mb-1">{kpi.name}</p>
            <p className="text-xs text-green-600 font-medium">{kpi.trend}</p>
          </div>
        ))}
      </div>
    ),
  },
];

// ─── ISO 27001 Content ────────────────────────────────────────────────────────
const iso27001Tabs: TabData[] = [
  {
    label: "Activos de Información",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Activo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Clasificación</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Custodio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { asset: "Base de datos de clientes CRM", type: "Base de datos", class: "Confidencial", custodian: "Gerente Comercial" },
              { asset: "ERP — Sistema de Gestión Empresarial", type: "Software", class: "Crítico", custodian: "TI" },
              { asset: "Servidor de archivos compartidos", type: "Hardware", class: "Interno", custodian: "TI" },
              { asset: "Código fuente de aplicaciones propias", type: "Software", class: "Confidencial", custodian: "Desarrollo" },
              { asset: "Contratos y acuerdos legales", type: "Documento", class: "Confidencial", custodian: "Legal" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.asset}</td>
                <td className="py-3 px-4 text-gray-600">{row.type}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    row.class === "Crítico" ? "bg-red-50 text-red-700 border-red-200" :
                    row.class === "Confidencial" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {row.class}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{row.custodian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Riesgos",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Riesgo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Probabilidad</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Impacto</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tratamiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { risk: "Acceso no autorizado a base de datos de clientes", prob: "Media", impact: "Alta", treatment: "Autenticación MFA + cifrado" },
              { risk: "Pérdida de datos por fallo de servidor", prob: "Baja", impact: "Alta", treatment: "Backups diarios en la nube" },
              { risk: "Ataque de phishing a empleados", prob: "Alta", impact: "Media", treatment: "Capacitación + filtro de correo" },
              { risk: "Fuga de información por empleado saliente", prob: "Media", impact: "Alta", treatment: "Revocación inmediata de accesos" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700 max-w-xs">{row.risk}</td>
                <td className="py-3 px-4"><Badge status={row.prob as StatusBadge} /></td>
                <td className="py-3 px-4"><Badge status={row.impact as StatusBadge} /></td>
                <td className="py-3 px-4 text-gray-600">{row.treatment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Controles",
    content: (
      <div className="divide-y divide-gray-50">
        {[
          { control: "A.9.1 — Control de acceso lógico", status: "Implementado", review: "Jun 2025" },
          { control: "A.10.1 — Cifrado de información confidencial", status: "Implementado", review: "Jun 2025" },
          { control: "A.12.3 — Respaldo de información", status: "Implementado", review: "May 2025" },
          { control: "A.14.2 — Seguridad en desarrollo de software", status: "En revisión", review: "Jul 2025" },
          { control: "A.16.1 — Gestión de incidentes de seguridad", status: "Implementado", review: "Jun 2025" },
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
            <p className="font-medium text-sm text-[#1A1A1A]">{c.control}</p>
            <div className="flex items-center gap-3">
              <Badge status={c.status === "Implementado" ? "Activo" : "En revisión"} />
              <span className="text-xs text-gray-400">Rev: {c.review}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Incidentes",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Incidente</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Severidad</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { inc: "Intento de acceso con credenciales robadas (bloqueado)", date: "05/06/2025", sev: "Media", status: "Cerrada" },
              { inc: "Correo de phishing reportado por 3 empleados", date: "12/05/2025", sev: "Baja", status: "Cerrada" },
              { inc: "Servidor de pruebas expuesto temporalmente", date: "20/04/2025", sev: "Alta", status: "Cerrada" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700">{row.inc}</td>
                <td className="py-3 px-4 text-gray-500">{row.date}</td>
                <td className="py-3 px-4"><Badge status={row.sev as StatusBadge} /></td>
                <td className="py-3 px-4"><Badge status={row.status as StatusBadge} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
];

// ─── ISO 22000 Content ────────────────────────────────────────────────────────
const iso22000Tabs: TabData[] = [
  {
    label: "Puntos Críticos (HACCP)",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">PCC</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Peligro</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Límite crítico</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Monitoreo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { pcc: "PCC-1 Recepción de materias primas", hazard: "Biológico — Salmonella", limit: "Temp ≤ 4°C", monitor: "Termómetro c/ carga", status: "Conforme" },
              { pcc: "PCC-2 Proceso de pasteurización", hazard: "Biológico — E. coli", limit: "72°C / 15 seg", monitor: "Cont. automático", status: "Conforme" },
              { pcc: "PCC-3 Sellado de envases", hazard: "Físico — contaminación", limit: "Hermeticidad 100%", monitor: "Prueba c/ lote", status: "En revisión" },
              { pcc: "PCC-4 Almacenamiento en frío", hazard: "Biológico — crecimiento", limit: "≤ 2°C constante", monitor: "Sensor IoT 24/7", status: "Conforme" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.pcc}</td>
                <td className="py-3 px-4 text-gray-600">{row.hazard}</td>
                <td className="py-3 px-4 text-gray-600">{row.limit}</td>
                <td className="py-3 px-4 text-gray-600">{row.monitor}</td>
                <td className="py-3 px-4"><Badge status={row.status as StatusBadge} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Proveedores",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Proveedor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Material</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Categoría riesgo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aprobación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { supplier: "Lácteos del Norte S.A.", material: "Leche cruda", risk: "Alta", approval: "Aprobado" },
              { supplier: "Empaques Eco S.A.", material: "Envases plásticos", risk: "Baja", approval: "Aprobado" },
              { supplier: "Azúcares y Derivados", material: "Azúcar refinada", risk: "Media", approval: "Aprobado" },
              { supplier: "Transportes Frío Express", material: "Logística refrigerada", risk: "Alta", approval: "Pendiente" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-[#1A1A1A]">{row.supplier}</td>
                <td className="py-3 px-4 text-gray-600">{row.material}</td>
                <td className="py-3 px-4"><Badge status={row.risk as StatusBadge} /></td>
                <td className="py-3 px-4"><Badge status={row.approval as StatusBadge} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    label: "Trazabilidad",
    content: (
      <div className="divide-y divide-gray-50 p-4">
        <div className="pb-4">
          <p className="text-sm text-gray-500 mb-4">Trazabilidad del lote: <span className="font-semibold text-[#1A1A1A]">LOT-2025-06-042</span></p>
          <div className="space-y-3">
            {[
              { step: "Recepción MP", detail: "Leche cruda — Proveedor: Lácteos del Norte", date: "01/06/2025 06:30", status: "OK" },
              { step: "Control calidad entrada", detail: "pH: 6.8, Temp: 3.5°C, Acidez: 16°D", date: "01/06/2025 07:00", status: "OK" },
              { step: "Pasteurización", detail: "72°C por 18 segundos — Lote verificado", date: "01/06/2025 09:15", status: "OK" },
              { step: "Envasado", detail: "Línea 2 — 4,800 unidades de 1L", date: "01/06/2025 11:30", status: "OK" },
              { step: "Despacho", detail: "Distribución a cadenas de retail — Guía 0045", date: "02/06/2025 03:00", status: "OK" },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-medium text-sm text-[#1A1A1A]">{t.step}</p>
                  <p className="text-xs text-gray-500">{t.detail}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Verificación",
    content: (
      <div className="divide-y divide-gray-50">
        {[
          { activity: "Análisis microbiológico de producto terminado", freq: "Por lote", last: "18/06/2025", result: "Conforme" },
          { activity: "Calibración de termómetros de proceso", freq: "Trimestral", last: "01/04/2025", result: "Conforme" },
          { activity: "Verificación de cadena de frío en distribución", freq: "Mensual", last: "05/06/2025", result: "En revisión" },
          { activity: "Auditoría de buenas prácticas de manufactura", freq: "Semestral", last: "10/01/2025", result: "Conforme" },
        ].map((v, i) => (
          <div key={i} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-sm text-[#1A1A1A]">{v.activity}</p>
              <p className="text-xs text-gray-500 mt-0.5">Frecuencia: {v.freq} · Última: {v.last}</p>
            </div>
            <Badge status={v.result as StatusBadge} />
          </div>
        ))}
      </div>
    ),
  },
];

// ─── Demo content map ─────────────────────────────────────────────────────────

const DEMO_CONTENT: Record<string, { title: string; tabs: TabData[] }> = {
  "iso-9001": {
    title: "Demo — Sistema de Gestión de Calidad ISO 9001",
    tabs: iso9001Tabs,
  },
  "iso-14001": {
    title: "Demo — Sistema de Gestión Ambiental ISO 14001",
    tabs: iso14001Tabs,
  },
  "iso-45001": {
    title: "Demo — Sistema de Seguridad y Salud en el Trabajo ISO 45001",
    tabs: iso45001Tabs,
  },
  "iso-27001": {
    title: "Demo — Sistema de Seguridad de la Información ISO/IEC 27001",
    tabs: iso27001Tabs,
  },
  "iso-22000": {
    title: "Demo — Sistema de Inocuidad Alimentaria ISO 22000",
    tabs: iso22000Tabs,
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DemoPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState(0);

  const demo = DEMO_CONTENT[slug];

  if (!demo) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Demo no disponible</h1>
        <p className="text-gray-500 mb-6">Esta certificación aún no tiene demo disponible. Estamos trabajando en ello.</p>
        <Link href={`/${locale}/dashboard/demos`} className="bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors">
          Ver demos disponibles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Demo banner */}
      <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-medium text-[#1A1A1A]">
            Estás en <span className="font-bold text-[#F5A623]">modo DEMO</span> — Los datos son de muestra y no representan información real.
          </p>
        </div>
        <Link
          href={`/${locale}/contacto`}
          className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#e09410] transition-colors"
        >
          Activar sistema real →
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/${locale}/dashboard/demos`} className="text-sm text-gray-500 hover:text-[#F5A623] transition-colors mb-2 inline-block">
            ← Demos disponibles
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">{demo.title}</h1>
        </div>
        <Link
          href={`/${locale}/contacto`}
          className="flex-shrink-0 border border-[#F5A623] text-[#F5A623] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#F5A623] hover:text-[#1A1A1A] transition-colors"
        >
          Solicitar sistema real
        </Link>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Tab headers */}
        <div className="border-b border-gray-100 flex overflow-x-auto">
          {demo.tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === i
                  ? "border-[#F5A623] text-[#F5A623]"
                  : "border-transparent text-gray-500 hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-64">
          {demo.tabs[activeTab]?.content}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#1A1A1A] rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[#F5A623] font-semibold mb-1">¿Te gustó lo que ves?</p>
          <p className="text-gray-400 text-sm">
            Activa tu sistema real con datos de tu empresa y comienza el camino hacia la certificación.
          </p>
        </div>
        <Link
          href={`/${locale}/contacto`}
          className="flex-shrink-0 bg-[#F5A623] text-[#1A1A1A] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e09410] transition-colors text-sm"
        >
          Hablar con un experto →
        </Link>
      </div>
    </div>
  );
}
