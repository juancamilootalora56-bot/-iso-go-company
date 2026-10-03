-- ============================================================
-- CRM interno — Fase 4b: datos de empresa/contacto en Cotizaciones
-- Ejecutar después de schema-crm-fase4.sql
-- ============================================================

alter table public.cotizaciones
  add column if not exists empresa             text,
  add column if not exists representante        text,
  add column if not exists telefono             text,
  add column if not exists email                text,
  add column if not exists num_colaboradores    int,
  add column if not exists num_procesos         int,
  add column if not exists producto             text;
