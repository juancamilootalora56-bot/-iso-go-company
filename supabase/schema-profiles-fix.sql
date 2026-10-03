-- ============================================================
-- Fix: el registro de clientes (formulario público /auth/register)
-- fallaba con 403 al guardar los datos de la empresa en el paso 2,
-- porque a public.profiles le faltaba la policy de INSERT y los
-- GRANTs explícitos para la API.
-- ============================================================

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profiles to service_role;
grant select on public.demo_access to authenticated;
grant select on public.demo_access to service_role;
