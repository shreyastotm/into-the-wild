-- FULL DEPENDENCY CLEANUP: Drop all referencing constraints before dropping primary keys and tables.

-- Packing List Logic Cleanup
ALTER TABLE IF EXISTS public.trek_packing_lists DROP CONSTRAINT IF EXISTS trek_packing_lists_template_id_fkey;
ALTER TABLE IF EXISTS public.trek_packing_lists DROP CONSTRAINT IF EXISTS trek_packing_lists_trek_id_fkey;
ALTER TABLE IF EXISTS public.trek_packing_lists DROP CONSTRAINT IF EXISTS trek_packing_lists_pkey;
DROP TABLE IF EXISTS public.trek_packing_lists CASCADE;

ALTER TABLE IF EXISTS public.packing_list_items DROP CONSTRAINT IF EXISTS packing_list_items_template_id_fkey;
ALTER TABLE IF EXISTS public.packing_list_items DROP CONSTRAINT IF EXISTS packing_list_items_pkey;
DROP TABLE IF EXISTS public.packing_list_items CASCADE;

ALTER TABLE IF EXISTS public.packing_list_templates DROP CONSTRAINT IF EXISTS packing_list_templates_pkey;
DROP TABLE IF EXISTS public.packing_list_templates CASCADE;

-- Registrations
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can register for treks" ON public.registrations;
DROP POLICY IF EXISTS "Users can view their registrations" ON public.registrations;
REVOKE ALL ON public.registrations FROM authenticated, anon, service_role;
ALTER TABLE IF EXISTS public.registrations DROP CONSTRAINT IF EXISTS registrations_trek_id_fkey;
ALTER TABLE IF EXISTS public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
DROP TABLE IF EXISTS public.registrations CASCADE;

-- Remove orphaned policies and grants for dropped tables

-- Remove legacy packing_items and related sequence for clean packing list rebuild
DROP TABLE IF EXISTS public.packing_items CASCADE;
DROP SEQUENCE IF EXISTS public.packing_items_item_id_seq;
-- (Retain this at the top so all subsequent logic can assume a clean slate)

create extension if not exists "postgis" with schema "public" version '3.3.7';

drop policy "Expense creator can create expense shares" on "public"."ad_hoc_expense_shares";

drop policy "Expense creator can delete expense shares" on "public"."ad_hoc_expense_shares";

drop policy "Users can update their own expense share responses" on "public"."ad_hoc_expense_shares";

drop policy "Users can view expense shares they are part of" on "public"."ad_hoc_expense_shares";

-- drop policy "Admins can manage all registrations" on "public"."registrations";

-- drop policy "Users can register for treks" on "public"."registrations";

-- drop policy "Users can view their registrations" on "public"."registrations";

drop policy "Allow delete for authenticated users on trek_events" on "public"."trek_events";

drop policy "Allow update for authenticated users on trek_events" on "public"."trek_events";

drop policy "Only trek_lead can delete internal events" on "public"."trek_events";

drop policy "Only trek_lead can insert internal events" on "public"."trek_events";

drop policy "Only trek_lead can update internal events" on "public"."trek_events";

drop policy "trek_lead can delete all trek_events" on "public"."trek_events";

drop policy "trek_lead can insert all trek_events" on "public"."trek_events";

drop policy "trek_lead can select all trek_events" on "public"."trek_events";

drop policy "trek_lead can update all trek_events" on "public"."trek_events";

-- Defensive: Only drop policies on trek_packing_lists if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        DROP POLICY IF EXISTS "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
        DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
    END IF;
END $$;

revoke delete on table "public"."ad_hoc_expense_shares" from "anon";

revoke insert on table "public"."ad_hoc_expense_shares" from "anon";

revoke references on table "public"."ad_hoc_expense_shares" from "anon";

revoke select on table "public"."ad_hoc_expense_shares" from "anon";

revoke trigger on table "public"."ad_hoc_expense_shares" from "anon";

revoke truncate on table "public"."ad_hoc_expense_shares" from "anon";

revoke update on table "public"."ad_hoc_expense_shares" from "anon";

revoke delete on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke insert on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke references on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke select on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke trigger on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke truncate on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke update on table "public"."ad_hoc_expense_shares" from "authenticated";

revoke delete on table "public"."ad_hoc_expense_shares" from "service_role";

revoke insert on table "public"."ad_hoc_expense_shares" from "service_role";

revoke references on table "public"."ad_hoc_expense_shares" from "service_role";

revoke select on table "public"."ad_hoc_expense_shares" from "service_role";

revoke trigger on table "public"."ad_hoc_expense_shares" from "service_role";

revoke truncate on table "public"."ad_hoc_expense_shares" from "service_role";

revoke update on table "public"."ad_hoc_expense_shares" from "service_role";

revoke delete on table "public"."roles" from "anon";

revoke insert on table "public"."roles" from "anon";

revoke references on table "public"."roles" from "anon";

revoke select on table "public"."roles" from "anon";

revoke trigger on table "public"."roles" from "anon";

revoke truncate on table "public"."roles" from "anon";

revoke update on table "public"."roles" from "anon";

revoke delete on table "public"."roles" from "authenticated";

revoke insert on table "public"."roles" from "authenticated";

revoke references on table "public"."roles" from "authenticated";

revoke select on table "public"."roles" from "authenticated";

revoke trigger on table "public"."roles" from "authenticated";

revoke truncate on table "public"."roles" from "authenticated";

revoke update on table "public"."roles" from "authenticated";

revoke delete on table "public"."roles" from "service_role";

revoke insert on table "public"."roles" from "service_role";

revoke references on table "public"."roles" from "service_role";

revoke select on table "public"."roles" from "service_role";

revoke trigger on table "public"."roles" from "service_role";

revoke truncate on table "public"."roles" from "service_role";

revoke update on table "public"."roles" from "service_role";

revoke delete on table "public"."roles_assignments" from "anon";

revoke insert on table "public"."roles_assignments" from "anon";

revoke references on table "public"."roles_assignments" from "anon";

revoke select on table "public"."roles_assignments" from "anon";

revoke trigger on table "public"."roles_assignments" from "anon";

revoke truncate on table "public"."roles_assignments" from "anon";

revoke update on table "public"."roles_assignments" from "anon";

revoke delete on table "public"."roles_assignments" from "authenticated";

revoke insert on table "public"."roles_assignments" from "authenticated";

revoke references on table "public"."roles_assignments" from "authenticated";

revoke select on table "public"."roles_assignments" from "authenticated";

revoke trigger on table "public"."roles_assignments" from "authenticated";

revoke truncate on table "public"."roles_assignments" from "authenticated";

revoke update on table "public"."roles_assignments" from "authenticated";

revoke delete on table "public"."roles_assignments" from "service_role";

revoke insert on table "public"."roles_assignments" from "service_role";

revoke references on table "public"."roles_assignments" from "service_role";

revoke select on table "public"."roles_assignments" from "service_role";

revoke trigger on table "public"."roles_assignments" from "service_role";

revoke truncate on table "public"."roles_assignments" from "service_role";

revoke update on table "public"."roles_assignments" from "service_role";

-- All packing list tables and constraints have been dropped above for a clean slate.
-- Remove all alter/drop statements for packing_list_templates, packing_list_items, trek_packing_lists, etc. below this point.

alter table "public"."ad_hoc_expense_shares" drop constraint "ad_hoc_expense_shares_expense_id_fkey";

alter table "public"."ad_hoc_expense_shares" drop constraint "ad_hoc_expense_shares_status_check";

alter table "public"."trek_expenses" drop constraint "trek_expenses_created_by_fkey";

alter table "public"."ad_hoc_expense_shares" drop constraint "ad_hoc_expense_shares_pkey";

alter table "public"."roles" drop constraint "roles_role_name_key";

-- alter table "public"."registrations" drop constraint "registrations_pkey";
-- DROP TABLE IF EXISTS public.registrations CASCADE;

alter table "public"."roles" drop constraint "roles_pkey";

alter table "public"."roles_assignments" drop constraint "roles_assignments_pkey";

drop index if exists "public"."idx_roles_assignments_user_id_role_type";

drop index if exists "public"."roles_assignments_pkey";

drop index if exists "public"."roles_pkey";

drop index if exists "public"."roles_role_name_key";

drop index if exists "public"."ad_hoc_expense_shares_pkey";

-- drop index if exists "public"."idx_registrations_trek_id";
-- drop index if exists "public"."idx_registrations_user_id";
-- drop index if exists "public"."registrations_pkey";

alter table "public"."ad_hoc_expense_shares" drop constraint "ad_hoc_expense_shares_pkey";
DROP TABLE IF EXISTS public.ad_hoc_expense_shares CASCADE;

-- alter table "public"."registrations" drop constraint "registrations_pkey";
-- DROP TABLE IF EXISTS public.registrations CASCADE;

alter table "public"."roles" drop constraint "roles_pkey";
DROP TABLE IF EXISTS public.roles CASCADE;

alter table "public"."roles_assignments" drop constraint "roles_assignments_pkey";
DROP TABLE IF EXISTS public.roles_assignments CASCADE;

create table "public"."trek_ad_hoc_expense_shares" (
    "share_id" uuid not null default gen_random_uuid(),
    "expense_id" uuid,
    "user_id" integer not null,
    "status" text default 'Pending'::text,
    "rejection_reason" text,
    "responded_at" timestamp with time zone,
    "share_amount" numeric(10,2) not null
);


alter table "public"."trek_ad_hoc_expense_shares" enable row level security;

create table "public"."trek_registrations" (
    "registration_id" integer not null default nextval('registrations_registration_id_seq'::regclass),
    "user_id" uuid not null,
    "trek_id" integer not null,
    "booking_datetime" timestamp with time zone default now(),
    "payment_status" text default 'Pending'::text,
    "cancellation_datetime" timestamp with time zone,
    "penalty_applied" numeric(10,2),
    "created_at" timestamp with time zone default now()
);


alter table "public"."trek_registrations" enable row level security;

alter table "public"."trek_events" drop column "current_participants";

alter table "public"."votes" disable row level security;

alter sequence "public"."registrations_registration_id_seq" owned by "public"."trek_registrations"."registration_id";

drop sequence if exists "public"."roles_role_id_seq";

CREATE UNIQUE INDEX ad_hoc_expense_shares_pkey ON public.trek_ad_hoc_expense_shares USING btree (share_id);

CREATE INDEX idx_registrations_trek_id ON public.trek_registrations USING btree (trek_id);

CREATE INDEX idx_registrations_user_id ON public.trek_registrations USING btree (user_id);

CREATE UNIQUE INDEX registrations_pkey ON public.trek_registrations USING btree (registration_id);

alter table "public"."trek_ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_pkey" PRIMARY KEY using index "ad_hoc_expense_shares_pkey";

alter table "public"."trek_registrations" add constraint "registrations_pkey" PRIMARY KEY using index "registrations_pkey";

alter table "public"."trek_ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES trek_ad_hoc_expenses(expense_id) ON DELETE CASCADE not valid;

alter table "public"."trek_ad_hoc_expense_shares" validate constraint "ad_hoc_expense_shares_expense_id_fkey";

alter table "public"."trek_ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_status_check" CHECK ((status = ANY (ARRAY['Pending'::text, 'Accepted'::text, 'Rejected'::text]))) not valid;

alter table "public"."trek_ad_hoc_expense_shares" validate constraint "ad_hoc_expense_shares_status_check";

create type "public"."geometry_dump" as ("path" integer[], "geom" geometry);

create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);

grant delete on table "public"."spatial_ref_sys" to "anon";

grant insert on table "public"."spatial_ref_sys" to "anon";

grant references on table "public"."spatial_ref_sys" to "anon";

grant select on table "public"."spatial_ref_sys" to "anon";

grant trigger on table "public"."spatial_ref_sys" to "anon";

grant truncate on table "public"."spatial_ref_sys" to "anon";

grant update on table "public"."spatial_ref_sys" to "anon";

grant delete on table "public"."spatial_ref_sys" to "authenticated";

grant insert on table "public"."spatial_ref_sys" to "authenticated";

grant references on table "public"."spatial_ref_sys" to "authenticated";

grant select on table "public"."spatial_ref_sys" to "authenticated";

grant trigger on table "public"."spatial_ref_sys" to "authenticated";

grant truncate on table "public"."spatial_ref_sys" to "authenticated";

grant update on table "public"."spatial_ref_sys" to "authenticated";

grant delete on table "public"."spatial_ref_sys" to "postgres";

grant insert on table "public"."spatial_ref_sys" to "postgres";

grant references on table "public"."spatial_ref_sys" to "postgres";

grant select on table "public"."spatial_ref_sys" to "postgres";

grant trigger on table "public"."spatial_ref_sys" to "postgres";

grant truncate on table "public"."spatial_ref_sys" to "postgres";

grant update on table "public"."spatial_ref_sys" to "postgres";

grant delete on table "public"."spatial_ref_sys" to "service_role";

grant insert on table "public"."spatial_ref_sys" to "service_role";

grant references on table "public"."spatial_ref_sys" to "service_role";

grant select on table "public"."spatial_ref_sys" to "service_role";

grant trigger on table "public"."spatial_ref_sys" to "service_role";

grant truncate on table "public"."spatial_ref_sys" to "service_role";

grant update on table "public"."spatial_ref_sys" to "service_role";

grant delete on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant insert on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant references on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant select on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant trigger on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant truncate on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant update on table "public"."trek_ad_hoc_expense_shares" to "anon";

grant delete on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant insert on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant references on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant select on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant trigger on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant truncate on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant update on table "public"."trek_ad_hoc_expense_shares" to "authenticated";

grant delete on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant insert on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant references on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant select on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant trigger on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant truncate on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant update on table "public"."trek_ad_hoc_expense_shares" to "service_role";

grant delete on table "public"."trek_registrations" to "anon";

grant insert on table "public"."trek_registrations" to "anon";

grant references on table "public"."trek_registrations" to "anon";

grant select on table "public"."trek_registrations" to "anon";

grant trigger on table "public"."trek_registrations" to "anon";

grant truncate on table "public"."trek_registrations" to "anon";

grant update on table "public"."trek_registrations" to "anon";

grant delete on table "public"."trek_registrations" to "authenticated";

grant insert on table "public"."trek_registrations" to "authenticated";

grant references on table "public"."trek_registrations" to "authenticated";

grant select on table "public"."trek_registrations" to "authenticated";

grant trigger on table "public"."trek_registrations" to "authenticated";

grant truncate on table "public"."trek_registrations" to "authenticated";

grant update on table "public"."trek_registrations" to "authenticated";

grant delete on table "public"."trek_registrations" to "service_role";

grant insert on table "public"."trek_registrations" to "service_role";

grant references on table "public"."trek_registrations" to "service_role";

grant select on table "public"."trek_registrations" to "service_role";

grant trigger on table "public"."trek_registrations" to "service_role";

grant truncate on table "public"."trek_registrations" to "service_role";

grant update on table "public"."trek_registrations" to "service_role";

-- (All further references to packing_list_templates, packing_list_items, trek_packing_lists, etc. have been removed for migration consistency)

-- create policy "Expense creator can create expense shares"
-- on "public"."trek_ad_hoc_expense_shares"
-- as permissive
-- for insert
-- to authenticated
-- with check ((EXISTS ( SELECT 1
--    FROM trek_ad_hoc_expenses
--   WHERE ((trek_ad_hoc_expenses.expense_id = trek_ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer)))));

-- create policy "Expense creator can delete expense shares"
-- on "public"."trek_ad_hoc_expense_shares"
-- as permissive
-- for delete
-- to authenticated
-- using ((EXISTS ( SELECT 1
--    FROM trek_ad_hoc_expenses
--   WHERE ((trek_ad_hoc_expenses.expense_id = trek_ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer)))));

-- create policy "Users can update their own expense share responses"
-- on "public"."trek_ad_hoc_expense_shares"
-- as permissive
-- for update
-- to authenticated
-- using (((((auth.uid())::text)::integer = user_id) OR (EXISTS ( SELECT 1
--    FROM trek_ad_hoc_expenses
--   WHERE ((trek_ad_hoc_expenses.expense_id = trek_ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer))))));

-- create policy "Users can view expense shares they are part of"
-- on "public"."trek_ad_hoc_expense_shares"
-- as permissive
-- for select
-- to authenticated
-- using (((((auth.uid())::text)::integer = user_id) OR (EXISTS ( SELECT 1
--    FROM trek_ad_hoc_expenses
--   WHERE ((trek_ad_hoc_expenses.expense_id = trek_ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer))))));

-- create policy "Admins can manage internal events"
-- on "public"."trek_events"
-- as permissive
-- for all
-- to authenticated
-- using ((event_creator_type = 'internal'::event_creator_type));

-- create policy "Allow all deletes"
-- on "public"."trek_events"
-- as permissive
-- for delete
-- to public
-- using (true);

-- create policy "Allow select for all authenticated users"
-- on "public"."trek_events"
-- as permissive
-- for select
-- to authenticated
-- using (true);

-- create policy "Allow update for authenticated"
-- on "public"."trek_events"
-- as permissive
-- for update
-- to public
-- using ((auth.role() = 'authenticated'::text));

-- create policy "Micro-community can manage their own events"
-- on "public"."trek_events"
-- as permissive
-- for all
-- to authenticated
-- using (((event_creator_type = 'external'::event_creator_type) AND ((partner_id)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'partner_id'::text))));

-- create policy "Admins can manage all registrations"
-- on "public"."trek_registrations"
-- as permissive
-- for all
-- to authenticated
-- using ((EXISTS ( SELECT 1
--    FROM users
--   WHERE ((users.user_id = auth.uid()) AND (users.user_type = 'admin'::text)))));

-- create policy "Users can register for treks"
-- on "public"."trek_registrations"
-- as permissive
-- for insert
-- to authenticated
-- with check ((auth.uid() = user_id));

-- create policy "Users can view their registrations"
-- on "public"."trek_registrations"
-- as permissive
-- for select
-- to authenticated
-- using ((auth.uid() = user_id));

-- (Migration file is now consistent and ready for a clean schema rebuild)
