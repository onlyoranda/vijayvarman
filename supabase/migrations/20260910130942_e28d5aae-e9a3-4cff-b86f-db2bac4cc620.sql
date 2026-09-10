create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default 'Your name',
  headline text,
  country text,
  email text,
  linkedin_url text,
  profile_photo_url text,
  summary_professional text,
  summary_conversational text,
  quick_facts jsonb not null default '[]'::jsonb,
  resume_url_professional text,
  resume_url_conversational text,
  updated_at timestamptz not null default now()
);

grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Anyone can read the profile" on public.profiles
  for select to anon, authenticated using (true);

create policy "Only admin can modify the profile" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  skill_group_id uuid not null references public.skill_groups(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company text not null,
  job_title text not null,
  country text,
  employment_type text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary_professional text,
  summary_conversational text,
  achievements_professional jsonb not null default '[]'::jsonb,
  achievements_conversational jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null,
  qualification text not null,
  specialisation text,
  start_date date,
  end_date date,
  description_professional text,
  description_conversational text,
  sort_order integer not null default 0
);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  issuer text,
  date_awarded date,
  description_professional text,
  description_conversational text,
  url text,
  sort_order integer not null default 0
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  issuer text not null,
  issue_date date,
  expiry_date date,
  credential_id text,
  verification_url text,
  sort_order integer not null default 0
);

grant select on public.skill_groups, public.skills, public.experience, public.education, public.awards, public.certifications to anon, authenticated;
grant insert, update, delete on public.skill_groups, public.skills, public.experience, public.education, public.awards, public.certifications to authenticated;
grant all on public.skill_groups, public.skills, public.experience, public.education, public.awards, public.certifications to service_role;

alter table public.skill_groups enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.awards enable row level security;
alter table public.certifications enable row level security;

create policy "Public read" on public.skill_groups for select to anon, authenticated using (true);
create policy "Admin write" on public.skill_groups for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read" on public.skills for select to anon, authenticated using (true);
create policy "Admin write" on public.skills for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read" on public.experience for select to anon, authenticated using (true);
create policy "Admin write" on public.experience for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read" on public.education for select to anon, authenticated using (true);
create policy "Admin write" on public.education for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read" on public.awards for select to anon, authenticated using (true);
create policy "Admin write" on public.awards for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read" on public.certifications for select to anon, authenticated using (true);
create policy "Admin write" on public.certifications for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql set search_path = public;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();