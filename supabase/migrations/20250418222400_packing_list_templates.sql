-- Packing List Templates Redesign Migration

-- 1. Create packing_list_templates table
create table if not exists public.packing_list_templates (
    template_id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default now()
);

-- 2. Create packing_list_items table
create table if not exists public.packing_list_items (
    item_id uuid primary key default gen_random_uuid(),
    template_id uuid not null references public.packing_list_templates(template_id) on delete cascade,
    name text not null,
    mandatory boolean default false,
    item_order integer default 0
);

-- 3. Create trek_packing_lists join table
create table if not exists public.trek_packing_lists (
    trek_id integer not null references public.trek_events(trek_id) on delete cascade,
    template_id uuid not null references public.packing_list_templates(template_id) on delete cascade,
    primary key (trek_id, template_id)
);

-- Remove old trek_packing_lists table if exists (optional, only after migration)
-- drop table if exists public.trek_packing_lists_old;
