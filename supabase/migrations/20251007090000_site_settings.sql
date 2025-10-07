-- Create a key-value table for site-wide settings (e.g., homepage background)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policies
-- 1) Anyone can read (public info used by homepage)
drop policy if exists "site_settings_read" on public.site_settings;
create policy "site_settings_read" on public.site_settings
for select
using (true);

-- 2) Only admins can insert/update/delete
-- Assumes 'users' table with 'user_id' = auth.uid() and user_type = 'admin'
drop policy if exists "site_settings_write_admins" on public.site_settings;
create policy "site_settings_write_admins" on public.site_settings
for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.user_id = auth.uid() and u.user_type = 'admin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.user_id = auth.uid() and u.user_type = 'admin'
  )
);

-- Helpful seed: ensure the key exists (optional)
insert into public.site_settings (key, value)
values ('home_background', jsonb_build_object('image_url', null))
on conflict (key) do nothing;


