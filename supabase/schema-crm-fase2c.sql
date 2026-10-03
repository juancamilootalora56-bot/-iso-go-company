-- ============================================================
-- CRM interno — Fase 2c: valor estimado en Leads (para el pipeline $)
-- Ejecutar después de schema-crm-fase2b.sql
-- ============================================================

alter table public.leads
  add column if not exists valor_estimado numeric(14,2) default 0;
