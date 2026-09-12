create schema if not exists private;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

revoke all on function private.has_role(uuid, public.app_role) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_role(uuid, public.app_role) to authenticated;

drop policy "Admin write" on public.awards;
create policy "Admin write" on public.awards for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin write" on public.certifications;
create policy "Admin write" on public.certifications for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin write" on public.education;
create policy "Admin write" on public.education for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin write" on public.experience;
create policy "Admin write" on public.experience for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin write" on public.skill_groups;
create policy "Admin write" on public.skill_groups for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin write" on public.skills;
create policy "Admin write" on public.skills for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Only admin can modify the profile" on public.profiles;
create policy "Only admin can modify the profile" on public.profiles for all to authenticated using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admin can manage resume files" on storage.objects;
create policy "Admin can manage resume files" on storage.objects for all to authenticated using (bucket_id = 'resumes' and private.has_role(auth.uid(), 'admin')) with check (bucket_id = 'resumes' and private.has_role(auth.uid(), 'admin'));

drop function public.has_role(uuid, public.app_role);

revoke select on public.profiles from anon;
grant select (id, first_name, headline, country, linkedin_url, profile_photo_url, summary_professional, summary_conversational, quick_facts, resume_url_professional, resume_url_conversational, updated_at) on public.profiles to anon;