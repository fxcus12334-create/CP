
-- Fix function search_path
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Revoke direct execute on SECURITY DEFINER helpers (still callable from RLS policies)
revoke execute on function public.has_role(uuid, app_role) from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

-- Tighten lead insert policy (still allows anyone to submit, just requires basic fields)
drop policy if exists "Anyone submits leads" on public.property_leads;
create policy "Anyone submits leads" on public.property_leads
  for insert to anon, authenticated
  with check (
    char_length(full_name) between 1 and 200
    and char_length(email) between 3 and 200
    and email like '%_@_%._%'
  );

-- Remove broad listing on storage bucket; direct public URLs still work because bucket is public
drop policy if exists "Public read property images" on storage.objects;
