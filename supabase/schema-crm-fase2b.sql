-- ============================================================
-- CRM interno — Fase 2b: rubro y cargo en Leads
-- Ejecutar después de schema-crm-fase2.sql
-- ============================================================

alter table public.leads
  add column if not exists rubro text,
  add column if not exists cargo text;
