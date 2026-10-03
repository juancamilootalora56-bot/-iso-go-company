-- ============================================================
-- Portal del cliente: permite que un usuario autenticado (no
-- colaborador interno) vea su propio lead/cliente en el CRM,
-- haciendo match por email, para alimentar "Mi Certificación".
-- ============================================================

create policy "leads_select_own_email" on public.leads
  for select using (email = (auth.jwt() ->> 'email'));

create policy "clientes_select_own_email" on public.clientes
  for select using (email = (auth.jwt() ->> 'email'));
