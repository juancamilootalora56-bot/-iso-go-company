-- ============================================================
-- CRM interno — Fase 2d: dueño/representante, dirección y N° de
-- colaboradores en Leads (para alimentar la base de datos de
-- empresas del admin)
-- ============================================================

alter table public.leads
  add column if not exists representante     text,
  add column if not exists direccion         text,
  add column if not exists num_colaboradores int;
