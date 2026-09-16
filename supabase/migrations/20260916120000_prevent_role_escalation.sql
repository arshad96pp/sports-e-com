-- Closes two role-escalation gaps neither the app UI nor any server action
-- exposes, but both directly reachable against Supabase with the public
-- anon key (the real authorization boundary for a client-side Supabase app):
--
-- 1. handle_new_auth_user() trusted a client-supplied `role` in
--    raw_user_meta_data. The app's own signup form never sends `role`, but
--    calling supabase.auth.signUp({ options: { data: { role: 'super_admin' } } })
--    directly (e.g. from devtools) minted a super admin account outright.
--
-- 2. The profiles UPDATE RLS policy (profiles_update_own_or_admin) only
--    checks row ownership, not columns, so a signed-in user could call
--    supabase.from('profiles').update({ role: 'super_admin' }).eq('id', me)
--    on their own row and self-promote. RLS is row-scoped, not
--    column-scoped, so the existing policy alone can't prevent this.

-- 1) Never trust client-supplied role at signup — always start as 'customer'.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$;

-- 2) Column-level guard: a `role` change only sticks when made by the
-- service role (seed script) or by an existing super admin (admin panel,
-- acting through their own RLS-scoped session). Anyone else's attempted
-- role change is silently discarded, keeping their prior role.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.role() <> 'service_role'
     and not public.is_super_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();
