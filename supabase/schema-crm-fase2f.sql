-- ============================================================
-- CRM interno — Fase 2f: campos específicos por etapa del pipeline
-- (Reunión, Presentación, Demo, Negociación, Ganado)
-- ============================================================

alter table public.leads
  -- Reunión
  add column if not exists reunion_fecha        timestamptz,
  add column if not exists reunion_lugar        text,
  add column if not exists reunion_participantes text,
  add column if not exists reunion_modalidad    text check (reunion_modalidad in ('presencial','virtual')),
  add column if not exists reunion_proximos_pasos text,

  -- Presentación
  add column if not exists presentacion_fecha        timestamptz,
  add column if not exists presentacion_lugar        text,
  add column if not exists presentacion_participantes text,
  add column if not exists presentacion_modalidad    text check (presentacion_modalidad in ('presencial','virtual')),
  add column if not exists presentacion_norma        text,
  add column if not exists presentacion_proximos_pasos text,

  -- Demo
  add column if not exists demo_fecha_entrega   timestamptz,
  add column if not exists demo_dias_acceso     int,
  add column if not exists demo_proximos_pasos  text,

  -- Negociación / Ganado (comparten el mismo esquema comercial)
  add column if not exists forma_pago       text check (forma_pago in ('contado','cuotas')),
  add column if not exists cuotas           int check (cuotas between 1 and 6),
  add column if not exists tipo_producto    text check (tipo_producto in ('solo_software','software_coordinacion')),
  add column if not exists fecha_inicio_servicio date;
