-- ============================================================
-- CRM interno — Fase 3b: tipo de visita (para colores/leyenda)
-- Ejecutar después de schema-crm-fase3.sql
-- ============================================================

alter table public.visitas
  add column if not exists tipo text not null default 'reunion'
  check (tipo in ('reunion', 'demo', 'llamada', 'otro'));
