-- Campos de contexto de la organización en el perfil del cliente del portal.
-- El logo se guarda como data URL (base64) en texto, igual que las fotos de
-- Productos Estrella y Estructura Organizacional (sin bucket de Storage).

alter table public.profiles
  add column if not exists logo_url text,
  add column if not exists razon_social text,
  add column if not exists representante_legal text,
  add column if not exists ruc text,
  add column if not exists descripcion_empresa text,
  add column if not exists procesos_empresa text;
