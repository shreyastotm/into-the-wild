-- create extension if not exists "postgis" with schema "public" version '3.3.7';

create type "public"."event_creator_type" as enum ('internal', 'external');

create type "public"."id_verification_status" as enum ('Pending', 'Verified', 'Rejected');

create type "public"."payment_status" as enum ('Pending', 'Paid', 'Cancelled');

create type "public"."post_type" as enum ('message_board', 'looking_for_trek');

create type "public"."renewal_status" as enum ('active', 'expired');

create type "public"."role_type" as enum ('trek_lead', 'medic', 'carry_list');

create type "public"."subscription_type" as enum ('community', 'self_service');

create type "public"."target_type" as enum ('trek', 'user');

create type "public"."transport_mode" as enum ('cars', 'mini_van', 'bus');

create type "public"."visibility" as enum ('public', 'private');

create sequence "public"."comments_comment_id_seq";

create sequence "public"."community_posts_post_id_seq";

create sequence "public"."expense_sharing_expense_id_seq";

create sequence "public"."logistics_logistics_id_seq";

create sequence "public"."packing_items_item_id_seq";

create sequence "public"."partners_partner_id_seq";

create sequence "public"."registrations_registration_id_seq";

create sequence "public"."roles_assignments_role_id_seq";

create sequence "public"."roles_role_id_seq";

create sequence "public"."subscriptions_billing_subscription_id_seq";

create sequence "public"."trek_events_trek_id_seq";

create sequence "public"."trek_expenses_id_seq";

create sequence "public"."votes_vote_id_seq";

create table "public"."ad_hoc_expense_shares" (
    "share_id" uuid not null default gen_random_uuid(),
    "expense_id" uuid,
    "user_id" integer not null,
    "status" text default 'Pending'::text,
    "rejection_reason" text,
    "responded_at" timestamp with time zone,
    "share_amount" numeric(10,2) not null
);


alter table "public"."ad_hoc_expense_shares" enable row level security;

create table "public"."comments" (
    "comment_id" integer not null default nextval('comments_comment_id_seq'::regclass),
    "post_id" integer not null,
    "user_id" integer not null,
    "body" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."comments" enable row level security;

create table "public"."community_posts" (
    "post_id" integer not null default nextval('community_posts_post_id_seq'::regclass),
    "user_id" integer not null,
    "title" character varying(255) not null,
    "body" text not null,
    "post_type" post_type not null,
    "visibility" visibility not null default 'public'::visibility,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."expense_sharing" (
    "expense_id" integer not null default nextval('expense_sharing_expense_id_seq'::regclass),
    "trek_id" integer not null,
    "description" text,
    "amount" numeric(10,2) not null,
    "expense_date" timestamp with time zone default now(),
    "payer_id" integer not null,
    "split_details" jsonb,
    "settlement_status" character varying(50) default 'Pending'::character varying,
    "created_at" timestamp with time zone default now(),
    "category" character varying(50)
);


create table "public"."logistics" (
    "logistics_id" integer not null default nextval('logistics_logistics_id_seq'::regclass),
    "trek_id" integer not null,
    "computed_pickup_route" jsonb,
    "user_starting_locations" jsonb,
    "additional_vendor_info" jsonb,
    "created_at" timestamp with time zone default now()
);


create table "public"."packing_items" (
    "item_id" integer not null default nextval('packing_items_item_id_seq'::regclass),
    "name" text not null
);


alter table "public"."packing_items" enable row level security;

create table "public"."partners" (
    "partner_id" integer not null default nextval('partners_partner_id_seq'::regclass),
    "partner_name" character varying(255) not null,
    "contact_details" jsonb,
    "verification_docs" jsonb,
    "revenue_sharing_rate" numeric(5,2),
    "external_portal_details" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "created_at" timestamp with time zone default now()
);


create table "public"."registrations" (
    "registration_id" integer not null default nextval('registrations_registration_id_seq'::regclass),
    "user_id" integer not null,
    "trek_id" integer not null,
    "booking_datetime" timestamp with time zone default now(),
    "payment_status" payment_status default 'Pending'::payment_status,
    "cancellation_datetime" timestamp with time zone,
    "penalty_applied" numeric(10,2),
    "created_at" timestamp with time zone default now()
);


create table "public"."roles" (
    "role_id" integer not null default nextval('roles_role_id_seq'::regclass),
    "role_name" text not null,
    "description" text
);


create table "public"."roles_assignments" (
    "role_id" integer not null default nextval('roles_assignments_role_id_seq'::regclass),
    "user_id" integer not null,
    "trek_id" integer not null,
    "role_type" role_type not null,
    "assignment_details" jsonb,
    "community_vote_score" numeric(10,2),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."subscriptions_billing" (
    "subscription_id" integer not null default nextval('subscriptions_billing_subscription_id_seq'::regclass),
    "user_id" integer,
    "subscription_type" character varying(50) not null,
    "amount" numeric(10,2) not null,
    "billing_period" character varying(50) not null,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone,
    "renewal_status" renewal_status default 'active'::renewal_status,
    "created_at" timestamp with time zone default now()
);


create table "public"."trek_ad_hoc_expenses" (
    "expense_id" uuid not null default gen_random_uuid(),
    "trek_id" integer,
    "payer_id" integer not null,
    "category" text,
    "amount" numeric(10,2) not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "settled_at" timestamp with time zone
);


alter table "public"."trek_ad_hoc_expenses" enable row level security;

create table "public"."trek_admin_approved_expenses" (
    "expense_id" uuid not null default gen_random_uuid(),
    "trek_id" integer,
    "category" text,
    "amount" numeric(10,2) not null,
    "description" text,
    "approved" boolean default false,
    "requested_by" integer not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."trek_admin_approved_expenses" enable row level security;

create table "public"."trek_events" (
    "trek_id" integer not null default nextval('trek_events_trek_id_seq'::regclass),
    "trek_name" character varying(255) not null,
    "description" text,
    "category" character varying(100),
    "start_datetime" timestamp with time zone not null,
    "duration" interval,
    "cost" numeric(10,2) not null,
    "cancellation_policy" text,
    "penalty_details" numeric(10,2),
    "max_participants" integer not null,
    "current_participants" integer default 0,
    "location" text,
    "route_data" jsonb,
    "transport_mode" transport_mode,
    "vendor_contacts" jsonb,
    "pickup_time_window" text,
    "event_creator_type" event_creator_type default 'internal'::event_creator_type,
    "partner_id" integer,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "booking_amount" numeric(10,2),
    "collect_full_fee" boolean default false,
    "image_url" text,
    "gpx_file_url" text
);


alter table "public"."trek_events" enable row level security;

create table "public"."trek_expenses" (
    "id" integer not null default nextval('trek_expenses_id_seq'::regclass),
    "trek_id" integer,
    "title" text not null,
    "amount" numeric not null,
    "type" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."trek_expenses" enable row level security;

create table "public"."trek_fixed_expenses" (
    "expense_id" uuid not null default gen_random_uuid(),
    "trek_id" integer,
    "expense_type" text,
    "amount" numeric(10,2) not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "settled_at" timestamp with time zone
);


alter table "public"."trek_fixed_expenses" enable row level security;

create table "public"."trek_packing_lists" (
    "item_id" uuid not null default gen_random_uuid(),
    "trek_id" integer,
    "item_order" integer default 0,
    "mandatory" boolean default false,
    "name" text
);


alter table "public"."trek_packing_lists" enable row level security;

create table "public"."user_expense_penalties" (
    "penalty_id" uuid not null default gen_random_uuid(),
    "user_id" integer not null,
    "trek_id" integer,
    "penalty_reason" text,
    "deducted_points" integer default 1,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_expense_penalties" enable row level security;

create table "public"."users" (
    "full_name" character varying(255) not null,
    "email" character varying(255) not null,
    "password_hash" character varying(255) not null,
    "phone_number" character varying(50),
    "address" text,
    "date_of_birth" date,
    "subscription_type" subscription_type not null,
    "id_verification_status" id_verification_status default 'Pending'::id_verification_status,
    "health_data" jsonb,
    "trekking_experience" character varying(100),
    "badges" jsonb,
    "interests" jsonb,
    "pet_details" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "user_id" uuid,
    "image_url" text
);


alter table "public"."users" enable row level security;

create table "public"."votes" (
    "vote_id" integer not null default nextval('votes_vote_id_seq'::regclass),
    "voter_id" integer not null,
    "target_type" target_type not null,
    "target_id" integer not null,
    "vote_value" integer not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."votes" enable row level security;

alter sequence "public"."comments_comment_id_seq" owned by "public"."comments"."comment_id";

alter sequence "public"."community_posts_post_id_seq" owned by "public"."community_posts"."post_id";

alter sequence "public"."expense_sharing_expense_id_seq" owned by "public"."expense_sharing"."expense_id";

alter sequence "public"."logistics_logistics_id_seq" owned by "public"."logistics"."logistics_id";

alter sequence "public"."packing_items_item_id_seq" owned by "public"."packing_items"."item_id";

alter sequence "public"."partners_partner_id_seq" owned by "public"."partners"."partner_id";

alter sequence "public"."registrations_registration_id_seq" owned by "public"."registrations"."registration_id";

alter sequence "public"."roles_assignments_role_id_seq" owned by "public"."roles_assignments"."role_id";

alter sequence "public"."roles_role_id_seq" owned by "public"."roles"."role_id";

alter sequence "public"."subscriptions_billing_subscription_id_seq" owned by "public"."subscriptions_billing"."subscription_id";

alter sequence "public"."trek_events_trek_id_seq" owned by "public"."trek_events"."trek_id";

alter sequence "public"."trek_expenses_id_seq" owned by "public"."trek_expenses"."id";

alter sequence "public"."votes_vote_id_seq" owned by "public"."votes"."vote_id";

CREATE UNIQUE INDEX ad_hoc_expense_shares_pkey ON public.ad_hoc_expense_shares USING btree (share_id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (comment_id);

CREATE UNIQUE INDEX community_posts_pkey ON public.community_posts USING btree (post_id);

CREATE UNIQUE INDEX expense_sharing_pkey ON public.expense_sharing USING btree (expense_id);

CREATE UNIQUE INDEX logistics_pkey ON public.logistics USING btree (logistics_id);

CREATE UNIQUE INDEX packing_items_pkey ON public.packing_items USING btree (item_id);

CREATE UNIQUE INDEX partners_pkey ON public.partners USING btree (partner_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX registrations_pkey ON public.registrations USING btree (registration_id);

CREATE UNIQUE INDEX roles_assignments_pkey ON public.roles_assignments USING btree (role_id);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (role_id);

CREATE UNIQUE INDEX roles_role_name_key ON public.roles USING btree (role_name);

CREATE UNIQUE INDEX subscriptions_billing_pkey ON public.subscriptions_billing USING btree (subscription_id);

CREATE UNIQUE INDEX trek_ad_hoc_expenses_pkey ON public.trek_ad_hoc_expenses USING btree (expense_id);

CREATE UNIQUE INDEX trek_admin_approved_expenses_pkey ON public.trek_admin_approved_expenses USING btree (expense_id);

CREATE UNIQUE INDEX trek_events_pkey ON public.trek_events USING btree (trek_id);

CREATE UNIQUE INDEX trek_expenses_pkey ON public.trek_expenses USING btree (id);

CREATE UNIQUE INDEX trek_fixed_expenses_pkey ON public.trek_fixed_expenses USING btree (expense_id);

CREATE UNIQUE INDEX trek_packing_lists_pkey ON public.trek_packing_lists USING btree (item_id);

CREATE UNIQUE INDEX user_expense_penalties_pkey ON public.user_expense_penalties USING btree (penalty_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (vote_id);

alter table "public"."ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_pkey" PRIMARY KEY using index "ad_hoc_expense_shares_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."community_posts" add constraint "community_posts_pkey" PRIMARY KEY using index "community_posts_pkey";

alter table "public"."expense_sharing" add constraint "expense_sharing_pkey" PRIMARY KEY using index "expense_sharing_pkey";

alter table "public"."logistics" add constraint "logistics_pkey" PRIMARY KEY using index "logistics_pkey";

alter table "public"."packing_items" add constraint "packing_items_pkey" PRIMARY KEY using index "packing_items_pkey";

alter table "public"."partners" add constraint "partners_pkey" PRIMARY KEY using index "partners_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."registrations" add constraint "registrations_pkey" PRIMARY KEY using index "registrations_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."roles_assignments" add constraint "roles_assignments_pkey" PRIMARY KEY using index "roles_assignments_pkey";

alter table "public"."subscriptions_billing" add constraint "subscriptions_billing_pkey" PRIMARY KEY using index "subscriptions_billing_pkey";

alter table "public"."trek_ad_hoc_expenses" add constraint "trek_ad_hoc_expenses_pkey" PRIMARY KEY using index "trek_ad_hoc_expenses_pkey";

alter table "public"."trek_admin_approved_expenses" add constraint "trek_admin_approved_expenses_pkey" PRIMARY KEY using index "trek_admin_approved_expenses_pkey";

alter table "public"."trek_events" add constraint "trek_events_pkey" PRIMARY KEY using index "trek_events_pkey";

alter table "public"."trek_expenses" add constraint "trek_expenses_pkey" PRIMARY KEY using index "trek_expenses_pkey";

alter table "public"."trek_fixed_expenses" add constraint "trek_fixed_expenses_pkey" PRIMARY KEY using index "trek_fixed_expenses_pkey";

alter table "public"."trek_packing_lists" add constraint "trek_packing_lists_pkey" PRIMARY KEY using index "trek_packing_lists_pkey";

alter table "public"."user_expense_penalties" add constraint "user_expense_penalties_pkey" PRIMARY KEY using index "user_expense_penalties_pkey";

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES trek_ad_hoc_expenses(expense_id) ON DELETE CASCADE not valid;

alter table "public"."ad_hoc_expense_shares" validate constraint "ad_hoc_expense_shares_expense_id_fkey";

alter table "public"."ad_hoc_expense_shares" add constraint "ad_hoc_expense_shares_status_check" CHECK ((status = ANY (ARRAY['Pending'::text, 'Accepted'::text, 'Rejected'::text]))) not valid;

alter table "public"."ad_hoc_expense_shares" validate constraint "ad_hoc_expense_shares_status_check";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."expense_sharing" add constraint "expense_sharing_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) not valid;

alter table "public"."expense_sharing" validate constraint "expense_sharing_trek_id_fkey";

alter table "public"."logistics" add constraint "logistics_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) not valid;

alter table "public"."logistics" validate constraint "logistics_trek_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."registrations" add constraint "registrations_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) not valid;

alter table "public"."registrations" validate constraint "registrations_trek_id_fkey";

alter table "public"."roles" add constraint "roles_role_name_key" UNIQUE using index "roles_role_name_key";

alter table "public"."roles_assignments" add constraint "roles_assignments_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) not valid;

alter table "public"."roles_assignments" validate constraint "roles_assignments_trek_id_fkey";

alter table "public"."trek_ad_hoc_expenses" add constraint "trek_ad_hoc_expenses_category_check" CHECK ((category = ANY (ARRAY['Fuel'::text, 'Toll'::text, 'Parking'::text, 'Snacks'::text, 'Meals'::text, 'Water'::text, 'Local Transport'::text, 'Medical Supplies'::text, 'Other'::text]))) not valid;

alter table "public"."trek_ad_hoc_expenses" validate constraint "trek_ad_hoc_expenses_category_check";

alter table "public"."trek_ad_hoc_expenses" add constraint "trek_ad_hoc_expenses_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."trek_ad_hoc_expenses" validate constraint "trek_ad_hoc_expenses_trek_id_fkey";

alter table "public"."trek_admin_approved_expenses" add constraint "trek_admin_approved_expenses_category_check" CHECK ((category = ANY (ARRAY['Camera Rental'::text, 'Drone Rental'::text, 'Guide Fees (custom)'::text, 'Cook/Support Staff'::text, 'Other Equipment'::text]))) not valid;

alter table "public"."trek_admin_approved_expenses" validate constraint "trek_admin_approved_expenses_category_check";

alter table "public"."trek_admin_approved_expenses" add constraint "trek_admin_approved_expenses_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."trek_admin_approved_expenses" validate constraint "trek_admin_approved_expenses_trek_id_fkey";

alter table "public"."trek_expenses" add constraint "trek_expenses_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."trek_expenses" validate constraint "trek_expenses_created_by_fkey";

alter table "public"."trek_expenses" add constraint "trek_expenses_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."trek_expenses" validate constraint "trek_expenses_trek_id_fkey";

alter table "public"."trek_fixed_expenses" add constraint "trek_fixed_expenses_expense_type_check" CHECK ((expense_type = ANY (ARRAY['Tickets'::text, 'Forest Fees'::text, 'Stay'::text, 'Camping Equipment'::text, 'Bonfire'::text, 'Bird Watching Guide'::text, 'Cooking Stove Rental'::text, 'Other'::text]))) not valid;

alter table "public"."trek_fixed_expenses" validate constraint "trek_fixed_expenses_expense_type_check";

alter table "public"."trek_fixed_expenses" add constraint "trek_fixed_expenses_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."trek_fixed_expenses" validate constraint "trek_fixed_expenses_trek_id_fkey";

alter table "public"."trek_packing_lists" add constraint "trek_packing_lists_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) ON DELETE CASCADE not valid;

alter table "public"."trek_packing_lists" validate constraint "trek_packing_lists_trek_id_fkey";

alter table "public"."user_expense_penalties" add constraint "user_expense_penalties_trek_id_fkey" FOREIGN KEY (trek_id) REFERENCES trek_events(trek_id) not valid;

alter table "public"."user_expense_penalties" validate constraint "user_expense_penalties_trek_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_user_id_fkey";

set check_function_bodies = off;

-- create type "public"."geometry_dump" as ("path" integer[], "geom" geometry);

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (user_id, full_name, email, phone_number, subscription_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'subscription_type'
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."ad_hoc_expense_shares" to "anon";

grant insert on table "public"."ad_hoc_expense_shares" to "anon";

grant references on table "public"."ad_hoc_expense_shares" to "anon";

grant select on table "public"."ad_hoc_expense_shares" to "anon";

grant trigger on table "public"."ad_hoc_expense_shares" to "anon";

grant truncate on table "public"."ad_hoc_expense_shares" to "anon";

grant update on table "public"."ad_hoc_expense_shares" to "anon";

grant delete on table "public"."ad_hoc_expense_shares" to "authenticated";

grant insert on table "public"."ad_hoc_expense_shares" to "authenticated";

grant references on table "public"."ad_hoc_expense_shares" to "authenticated";

grant select on table "public"."ad_hoc_expense_shares" to "authenticated";

grant trigger on table "public"."ad_hoc_expense_shares" to "authenticated";

grant truncate on table "public"."ad_hoc_expense_shares" to "authenticated";

grant update on table "public"."ad_hoc_expense_shares" to "authenticated";

grant delete on table "public"."ad_hoc_expense_shares" to "service_role";

grant insert on table "public"."ad_hoc_expense_shares" to "service_role";

grant references on table "public"."ad_hoc_expense_shares" to "service_role";

grant select on table "public"."ad_hoc_expense_shares" to "service_role";

grant trigger on table "public"."ad_hoc_expense_shares" to "service_role";

grant truncate on table "public"."ad_hoc_expense_shares" to "service_role";

grant update on table "public"."ad_hoc_expense_shares" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."community_posts" to "anon";

grant insert on table "public"."community_posts" to "anon";

grant references on table "public"."community_posts" to "anon";

grant select on table "public"."community_posts" to "anon";

grant trigger on table "public"."community_posts" to "anon";

grant truncate on table "public"."community_posts" to "anon";

grant update on table "public"."community_posts" to "anon";

grant delete on table "public"."community_posts" to "authenticated";

grant insert on table "public"."community_posts" to "authenticated";

grant references on table "public"."community_posts" to "authenticated";

grant select on table "public"."community_posts" to "authenticated";

grant trigger on table "public"."community_posts" to "authenticated";

grant truncate on table "public"."community_posts" to "authenticated";

grant update on table "public"."community_posts" to "authenticated";

grant delete on table "public"."community_posts" to "service_role";

grant insert on table "public"."community_posts" to "service_role";

grant references on table "public"."community_posts" to "service_role";

grant select on table "public"."community_posts" to "service_role";

grant trigger on table "public"."community_posts" to "service_role";

grant truncate on table "public"."community_posts" to "service_role";

grant update on table "public"."community_posts" to "service_role";

grant delete on table "public"."expense_sharing" to "anon";

grant insert on table "public"."expense_sharing" to "anon";

grant references on table "public"."expense_sharing" to "anon";

grant select on table "public"."expense_sharing" to "anon";

grant trigger on table "public"."expense_sharing" to "anon";

grant truncate on table "public"."expense_sharing" to "anon";

grant update on table "public"."expense_sharing" to "anon";

grant delete on table "public"."expense_sharing" to "authenticated";

grant insert on table "public"."expense_sharing" to "authenticated";

grant references on table "public"."expense_sharing" to "authenticated";

grant select on table "public"."expense_sharing" to "authenticated";

grant trigger on table "public"."expense_sharing" to "authenticated";

grant truncate on table "public"."expense_sharing" to "authenticated";

grant update on table "public"."expense_sharing" to "authenticated";

grant delete on table "public"."expense_sharing" to "service_role";

grant insert on table "public"."expense_sharing" to "service_role";

grant references on table "public"."expense_sharing" to "service_role";

grant select on table "public"."expense_sharing" to "service_role";

grant trigger on table "public"."expense_sharing" to "service_role";

grant truncate on table "public"."expense_sharing" to "service_role";

grant update on table "public"."expense_sharing" to "service_role";

grant delete on table "public"."logistics" to "anon";

grant insert on table "public"."logistics" to "anon";

grant references on table "public"."logistics" to "anon";

grant select on table "public"."logistics" to "anon";

grant trigger on table "public"."logistics" to "anon";

grant truncate on table "public"."logistics" to "anon";

grant update on table "public"."logistics" to "anon";

grant delete on table "public"."logistics" to "authenticated";

grant insert on table "public"."logistics" to "authenticated";

grant references on table "public"."logistics" to "authenticated";

grant select on table "public"."logistics" to "authenticated";

grant trigger on table "public"."logistics" to "authenticated";

grant truncate on table "public"."logistics" to "authenticated";

grant update on table "public"."logistics" to "authenticated";

grant delete on table "public"."logistics" to "service_role";

grant insert on table "public"."logistics" to "service_role";

grant references on table "public"."logistics" to "service_role";

grant select on table "public"."logistics" to "service_role";

grant trigger on table "public"."logistics" to "service_role";

grant truncate on table "public"."logistics" to "service_role";

grant update on table "public"."logistics" to "service_role";

grant delete on table "public"."packing_items" to "anon";

grant insert on table "public"."packing_items" to "anon";

grant references on table "public"."packing_items" to "anon";

grant select on table "public"."packing_items" to "anon";

grant trigger on table "public"."packing_items" to "anon";

grant truncate on table "public"."packing_items" to "anon";

grant update on table "public"."packing_items" to "anon";

grant delete on table "public"."packing_items" to "authenticated";

grant insert on table "public"."packing_items" to "authenticated";

grant references on table "public"."packing_items" to "authenticated";

grant select on table "public"."packing_items" to "authenticated";

grant trigger on table "public"."packing_items" to "authenticated";

grant truncate on table "public"."packing_items" to "authenticated";

grant update on table "public"."packing_items" to "authenticated";

grant delete on table "public"."packing_items" to "service_role";

grant insert on table "public"."packing_items" to "service_role";

grant references on table "public"."packing_items" to "service_role";

grant select on table "public"."packing_items" to "service_role";

grant trigger on table "public"."packing_items" to "service_role";

grant truncate on table "public"."packing_items" to "service_role";

grant update on table "public"."packing_items" to "service_role";

grant delete on table "public"."partners" to "anon";

grant insert on table "public"."partners" to "anon";

grant references on table "public"."partners" to "anon";

grant select on table "public"."partners" to "anon";

grant trigger on table "public"."partners" to "anon";

grant truncate on table "public"."partners" to "anon";

grant update on table "public"."partners" to "anon";

grant delete on table "public"."partners" to "authenticated";

grant insert on table "public"."partners" to "authenticated";

grant references on table "public"."partners" to "authenticated";

grant select on table "public"."partners" to "authenticated";

grant trigger on table "public"."partners" to "authenticated";

grant truncate on table "public"."partners" to "authenticated";

grant update on table "public"."partners" to "authenticated";

grant delete on table "public"."partners" to "service_role";

grant insert on table "public"."partners" to "service_role";

grant references on table "public"."partners" to "service_role";

grant select on table "public"."partners" to "service_role";

grant trigger on table "public"."partners" to "service_role";

grant truncate on table "public"."partners" to "service_role";

grant update on table "public"."partners" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."registrations" to "anon";

grant insert on table "public"."registrations" to "anon";

grant references on table "public"."registrations" to "anon";

grant select on table "public"."registrations" to "anon";

grant trigger on table "public"."registrations" to "anon";

grant truncate on table "public"."registrations" to "anon";

grant update on table "public"."registrations" to "anon";

grant delete on table "public"."registrations" to "authenticated";

grant insert on table "public"."registrations" to "authenticated";

grant references on table "public"."registrations" to "authenticated";

grant select on table "public"."registrations" to "authenticated";

grant trigger on table "public"."registrations" to "authenticated";

grant truncate on table "public"."registrations" to "authenticated";

grant update on table "public"."registrations" to "authenticated";

grant delete on table "public"."registrations" to "service_role";

grant insert on table "public"."registrations" to "service_role";

grant references on table "public"."registrations" to "service_role";

grant select on table "public"."registrations" to "service_role";

grant trigger on table "public"."registrations" to "service_role";

grant truncate on table "public"."registrations" to "service_role";

grant update on table "public"."registrations" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."roles_assignments" to "anon";

grant insert on table "public"."roles_assignments" to "anon";

grant references on table "public"."roles_assignments" to "anon";

grant select on table "public"."roles_assignments" to "anon";

grant trigger on table "public"."roles_assignments" to "anon";

grant truncate on table "public"."roles_assignments" to "anon";

grant update on table "public"."roles_assignments" to "anon";

grant delete on table "public"."roles_assignments" to "authenticated";

grant insert on table "public"."roles_assignments" to "authenticated";

grant references on table "public"."roles_assignments" to "authenticated";

grant select on table "public"."roles_assignments" to "authenticated";

grant trigger on table "public"."roles_assignments" to "authenticated";

grant truncate on table "public"."roles_assignments" to "authenticated";

grant update on table "public"."roles_assignments" to "authenticated";

grant delete on table "public"."roles_assignments" to "service_role";

grant insert on table "public"."roles_assignments" to "service_role";

grant references on table "public"."roles_assignments" to "service_role";

grant select on table "public"."roles_assignments" to "service_role";

grant trigger on table "public"."roles_assignments" to "service_role";

grant truncate on table "public"."roles_assignments" to "service_role";

grant update on table "public"."roles_assignments" to "service_role";

-- grant delete on table "public"."spatial_ref_sys" to "anon";
-- grant insert on table "public"."spatial_ref_sys" to "anon";
-- grant references on table "public"."spatial_ref_sys" to "anon";
-- grant select on table "public"."spatial_ref_sys" to "anon";
-- grant trigger on table "public"."spatial_ref_sys" to "anon";
-- grant truncate on table "public"."spatial_ref_sys" to "anon";
-- grant update on table "public"."spatial_ref_sys" to "anon";
-- grant delete on table "public"."spatial_ref_sys" to "authenticated";
-- grant insert on table "public"."spatial_ref_sys" to "authenticated";
-- grant references on table "public"."spatial_ref_sys" to "authenticated";
-- grant select on table "public"."spatial_ref_sys" to "authenticated";
-- grant trigger on table "public"."spatial_ref_sys" to "authenticated";
-- grant truncate on table "public"."spatial_ref_sys" to "authenticated";
-- grant update on table "public"."spatial_ref_sys" to "authenticated";
-- grant delete on table "public"."spatial_ref_sys" to "postgres";
-- grant insert on table "public"."spatial_ref_sys" to "postgres";
-- grant references on table "public"."spatial_ref_sys" to "postgres";
-- grant select on table "public"."spatial_ref_sys" to "postgres";
-- grant trigger on table "public"."spatial_ref_sys" to "postgres";
-- grant truncate on table "public"."spatial_ref_sys" to "postgres";
-- grant update on table "public"."spatial_ref_sys" to "postgres";
-- grant delete on table "public"."spatial_ref_sys" to "service_role";
-- grant insert on table "public"."spatial_ref_sys" to "service_role";
-- grant references on table "public"."spatial_ref_sys" to "service_role";
-- grant select on table "public"."spatial_ref_sys" to "service_role";
-- grant trigger on table "public"."spatial_ref_sys" to "service_role";
-- grant truncate on table "public"."spatial_ref_sys" to "service_role";
-- grant update on table "public"."spatial_ref_sys" to "service_role";

grant delete on table "public"."subscriptions_billing" to "anon";

grant insert on table "public"."subscriptions_billing" to "anon";

grant references on table "public"."subscriptions_billing" to "anon";

grant select on table "public"."subscriptions_billing" to "anon";

grant trigger on table "public"."subscriptions_billing" to "anon";

grant truncate on table "public"."subscriptions_billing" to "anon";

grant update on table "public"."subscriptions_billing" to "anon";

grant delete on table "public"."subscriptions_billing" to "authenticated";

grant insert on table "public"."subscriptions_billing" to "authenticated";

grant references on table "public"."subscriptions_billing" to "authenticated";

grant select on table "public"."subscriptions_billing" to "authenticated";

grant trigger on table "public"."subscriptions_billing" to "authenticated";

grant truncate on table "public"."subscriptions_billing" to "authenticated";

grant update on table "public"."subscriptions_billing" to "authenticated";

grant delete on table "public"."subscriptions_billing" to "service_role";

grant insert on table "public"."subscriptions_billing" to "service_role";

grant references on table "public"."subscriptions_billing" to "service_role";

grant select on table "public"."subscriptions_billing" to "service_role";

grant trigger on table "public"."subscriptions_billing" to "service_role";

grant truncate on table "public"."subscriptions_billing" to "service_role";

grant update on table "public"."subscriptions_billing" to "service_role";

grant delete on table "public"."trek_ad_hoc_expenses" to "anon";

grant insert on table "public"."trek_ad_hoc_expenses" to "anon";

grant references on table "public"."trek_ad_hoc_expenses" to "anon";

grant select on table "public"."trek_ad_hoc_expenses" to "anon";

grant trigger on table "public"."trek_ad_hoc_expenses" to "anon";

grant truncate on table "public"."trek_ad_hoc_expenses" to "anon";

grant update on table "public"."trek_ad_hoc_expenses" to "anon";

grant delete on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant insert on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant references on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant select on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant trigger on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant truncate on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant update on table "public"."trek_ad_hoc_expenses" to "authenticated";

grant delete on table "public"."trek_ad_hoc_expenses" to "service_role";

grant insert on table "public"."trek_ad_hoc_expenses" to "service_role";

grant references on table "public"."trek_ad_hoc_expenses" to "service_role";

grant select on table "public"."trek_ad_hoc_expenses" to "service_role";

grant trigger on table "public"."trek_ad_hoc_expenses" to "service_role";

grant truncate on table "public"."trek_ad_hoc_expenses" to "service_role";

grant update on table "public"."trek_ad_hoc_expenses" to "service_role";

grant delete on table "public"."trek_admin_approved_expenses" to "anon";

grant insert on table "public"."trek_admin_approved_expenses" to "anon";

grant references on table "public"."trek_admin_approved_expenses" to "anon";

grant select on table "public"."trek_admin_approved_expenses" to "anon";

grant trigger on table "public"."trek_admin_approved_expenses" to "anon";

grant truncate on table "public"."trek_admin_approved_expenses" to "anon";

grant update on table "public"."trek_admin_approved_expenses" to "anon";

grant delete on table "public"."trek_admin_approved_expenses" to "authenticated";

grant insert on table "public"."trek_admin_approved_expenses" to "authenticated";

grant references on table "public"."trek_admin_approved_expenses" to "authenticated";

grant select on table "public"."trek_admin_approved_expenses" to "authenticated";

grant trigger on table "public"."trek_admin_approved_expenses" to "authenticated";

grant truncate on table "public"."trek_admin_approved_expenses" to "authenticated";

grant update on table "public"."trek_admin_approved_expenses" to "authenticated";

grant delete on table "public"."trek_admin_approved_expenses" to "service_role";

grant insert on table "public"."trek_admin_approved_expenses" to "service_role";

grant references on table "public"."trek_admin_approved_expenses" to "service_role";

grant select on table "public"."trek_admin_approved_expenses" to "service_role";

grant trigger on table "public"."trek_admin_approved_expenses" to "service_role";

grant truncate on table "public"."trek_admin_approved_expenses" to "service_role";

grant update on table "public"."trek_admin_approved_expenses" to "service_role";

grant delete on table "public"."trek_events" to "anon";

grant insert on table "public"."trek_events" to "anon";

grant references on table "public"."trek_events" to "anon";

grant select on table "public"."trek_events" to "anon";

grant trigger on table "public"."trek_events" to "anon";

grant truncate on table "public"."trek_events" to "anon";

grant update on table "public"."trek_events" to "anon";

grant delete on table "public"."trek_events" to "authenticated";

grant insert on table "public"."trek_events" to "authenticated";

grant references on table "public"."trek_events" to "authenticated";

grant select on table "public"."trek_events" to "authenticated";

grant trigger on table "public"."trek_events" to "authenticated";

grant truncate on table "public"."trek_events" to "authenticated";

grant update on table "public"."trek_events" to "authenticated";

grant delete on table "public"."trek_events" to "service_role";

grant insert on table "public"."trek_events" to "service_role";

grant references on table "public"."trek_events" to "service_role";

grant select on table "public"."trek_events" to "service_role";

grant trigger on table "public"."trek_events" to "service_role";

grant truncate on table "public"."trek_events" to "service_role";

grant update on table "public"."trek_events" to "service_role";

grant delete on table "public"."trek_expenses" to "anon";

grant insert on table "public"."trek_expenses" to "anon";

grant references on table "public"."trek_expenses" to "anon";

grant select on table "public"."trek_expenses" to "anon";

grant trigger on table "public"."trek_expenses" to "anon";

grant truncate on table "public"."trek_expenses" to "anon";

grant update on table "public"."trek_expenses" to "anon";

grant delete on table "public"."trek_expenses" to "authenticated";

grant insert on table "public"."trek_expenses" to "authenticated";

grant references on table "public"."trek_expenses" to "authenticated";

grant select on table "public"."trek_expenses" to "authenticated";

grant trigger on table "public"."trek_expenses" to "authenticated";

grant truncate on table "public"."trek_expenses" to "authenticated";

grant update on table "public"."trek_expenses" to "authenticated";

grant delete on table "public"."trek_expenses" to "service_role";

grant insert on table "public"."trek_expenses" to "service_role";

grant references on table "public"."trek_expenses" to "service_role";

grant select on table "public"."trek_expenses" to "service_role";

grant trigger on table "public"."trek_expenses" to "service_role";

grant truncate on table "public"."trek_expenses" to "service_role";

grant update on table "public"."trek_expenses" to "service_role";

grant delete on table "public"."trek_fixed_expenses" to "anon";

grant insert on table "public"."trek_fixed_expenses" to "anon";

grant references on table "public"."trek_fixed_expenses" to "anon";

grant select on table "public"."trek_fixed_expenses" to "anon";

grant trigger on table "public"."trek_fixed_expenses" to "anon";

grant truncate on table "public"."trek_fixed_expenses" to "anon";

grant update on table "public"."trek_fixed_expenses" to "anon";

grant delete on table "public"."trek_fixed_expenses" to "authenticated";

grant insert on table "public"."trek_fixed_expenses" to "authenticated";

grant references on table "public"."trek_fixed_expenses" to "authenticated";

grant select on table "public"."trek_fixed_expenses" to "authenticated";

grant trigger on table "public"."trek_fixed_expenses" to "authenticated";

grant truncate on table "public"."trek_fixed_expenses" to "authenticated";

grant update on table "public"."trek_fixed_expenses" to "authenticated";

grant delete on table "public"."trek_fixed_expenses" to "service_role";

grant insert on table "public"."trek_fixed_expenses" to "service_role";

grant references on table "public"."trek_fixed_expenses" to "service_role";

grant select on table "public"."trek_fixed_expenses" to "service_role";

grant trigger on table "public"."trek_fixed_expenses" to "service_role";

grant truncate on table "public"."trek_fixed_expenses" to "service_role";

grant update on table "public"."trek_fixed_expenses" to "service_role";

grant delete on table "public"."trek_packing_lists" to "anon";

grant insert on table "public"."trek_packing_lists" to "anon";

grant references on table "public"."trek_packing_lists" to "anon";

grant select on table "public"."trek_packing_lists" to "anon";

grant trigger on table "public"."trek_packing_lists" to "anon";

grant truncate on table "public"."trek_packing_lists" to "anon";

grant update on table "public"."trek_packing_lists" to "anon";

grant delete on table "public"."trek_packing_lists" to "authenticated";

grant insert on table "public"."trek_packing_lists" to "authenticated";

grant references on table "public"."trek_packing_lists" to "authenticated";

grant select on table "public"."trek_packing_lists" to "authenticated";

grant trigger on table "public"."trek_packing_lists" to "authenticated";

grant truncate on table "public"."trek_packing_lists" to "authenticated";

grant update on table "public"."trek_packing_lists" to "authenticated";

grant delete on table "public"."trek_packing_lists" to "service_role";

grant insert on table "public"."trek_packing_lists" to "service_role";

grant references on table "public"."trek_packing_lists" to "service_role";

grant select on table "public"."trek_packing_lists" to "service_role";

grant trigger on table "public"."trek_packing_lists" to "service_role";

grant truncate on table "public"."trek_packing_lists" to "service_role";

grant update on table "public"."trek_packing_lists" to "service_role";

grant delete on table "public"."user_expense_penalties" to "anon";

grant insert on table "public"."user_expense_penalties" to "anon";

grant references on table "public"."user_expense_penalties" to "anon";

grant select on table "public"."user_expense_penalties" to "anon";

grant trigger on table "public"."user_expense_penalties" to "anon";

grant truncate on table "public"."user_expense_penalties" to "anon";

grant update on table "public"."user_expense_penalties" to "anon";

grant delete on table "public"."user_expense_penalties" to "authenticated";

grant insert on table "public"."user_expense_penalties" to "authenticated";

grant references on table "public"."user_expense_penalties" to "authenticated";

grant select on table "public"."user_expense_penalties" to "authenticated";

grant trigger on table "public"."user_expense_penalties" to "authenticated";

grant truncate on table "public"."user_expense_penalties" to "authenticated";

grant update on table "public"."user_expense_penalties" to "authenticated";

grant delete on table "public"."user_expense_penalties" to "service_role";

grant insert on table "public"."user_expense_penalties" to "service_role";

grant references on table "public"."user_expense_penalties" to "service_role";

grant select on table "public"."user_expense_penalties" to "service_role";

grant trigger on table "public"."user_expense_penalties" to "service_role";

grant truncate on table "public"."user_expense_penalties" to "service_role";

grant update on table "public"."user_expense_penalties" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."votes" to "anon";

grant insert on table "public"."votes" to "anon";

grant references on table "public"."votes" to "anon";

grant select on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant update on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";

grant delete on table "public"."votes" to "service_role";

grant insert on table "public"."votes" to "service_role";

grant references on table "public"."votes" to "service_role";

grant select on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";

grant update on table "public"."votes" to "service_role";

-- ADDED BY CASCADE: Ensure edit/delete for trek_events and trek_packing_lists work for admins and authenticated users

-- Allow authenticated users to update and delete trek_events they created or are assigned as trek_lead
create policy "Allow update for authenticated users on trek_events"
on "public"."trek_events"
as permissive
for update
  to authenticated
using ((auth.uid() IS NOT NULL));

create policy "Allow delete for authenticated users on trek_events"
on "public"."trek_events"
as permissive
for delete
  to authenticated
using ((auth.uid() IS NOT NULL));

-- Allow admins (trek_lead) to update and delete trek_packing_lists
create policy "Allow update for trek_lead on trek_packing_lists"
on "public"."trek_packing_lists"
as permissive
for update
  to authenticated
using (EXISTS (SELECT 1 FROM roles_assignments WHERE roles_assignments.user_id = ((auth.uid())::text)::integer AND roles_assignments.role_type = 'trek_lead'::role_type));

create policy "Allow delete for trek_lead on trek_packing_lists"
on "public"."trek_packing_lists"
as permissive
for delete
  to authenticated
using (EXISTS (SELECT 1 FROM roles_assignments WHERE roles_assignments.user_id = ((auth.uid())::text)::integer AND roles_assignments.role_type = 'trek_lead'::role_type));

-- Allow users to delete their own packing list items (if applicable, add logic here)
-- Example:
-- create policy "Allow users to delete their own packing list items"
-- on "public"."trek_packing_lists"
-- as permissive
-- for delete
--   to authenticated
-- using (user_id = ((auth.uid())::text)::integer);

create policy "Expense creator can create expense shares"
on "public"."ad_hoc_expense_shares"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM trek_ad_hoc_expenses
  WHERE ((trek_ad_hoc_expenses.expense_id = ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer)))));


create policy "Expense creator can delete expense shares"
on "public"."ad_hoc_expense_shares"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM trek_ad_hoc_expenses
  WHERE ((trek_ad_hoc_expenses.expense_id = ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer)))));


create policy "Users can update their own expense share responses"
on "public"."ad_hoc_expense_shares"
as permissive
for update
to authenticated
using (((((auth.uid())::text)::integer = user_id) OR (EXISTS ( SELECT 1
   FROM trek_ad_hoc_expenses
  WHERE ((trek_ad_hoc_expenses.expense_id = ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer))))));


create policy "Users can view expense shares they are part of"
on "public"."ad_hoc_expense_shares"
as permissive
for select
to authenticated
using (((((auth.uid())::text)::integer = user_id) OR (EXISTS ( SELECT 1
   FROM trek_ad_hoc_expenses
  WHERE ((trek_ad_hoc_expenses.expense_id = ad_hoc_expense_shares.expense_id) AND (trek_ad_hoc_expenses.payer_id = ((auth.uid())::text)::integer))))));


create policy "Allow insert for authenticated users"
on "public"."comments"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Allow select for authenticated users on packing_items"
on "public"."packing_items"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Everyone can view trek ad hoc expenses"
on "public"."trek_ad_hoc_expenses"
as permissive
for select
to public
using (true);


create policy "Users can create their own ad hoc expenses"
on "public"."trek_ad_hoc_expenses"
as permissive
for insert
to authenticated
with check ((((auth.uid())::text)::integer = payer_id));


create policy "Users can delete their own ad hoc expenses"
on "public"."trek_ad_hoc_expenses"
as permissive
for delete
to authenticated
using ((((auth.uid())::text)::integer = payer_id));


create policy "Users can update their own ad hoc expenses"
on "public"."trek_ad_hoc_expenses"
as permissive
for update
to authenticated
using ((((auth.uid())::text)::integer = payer_id));


create policy "Everyone can view admin approved expenses"
on "public"."trek_admin_approved_expenses"
as permissive
for select
to public
using (true);


create policy "Only administrators can delete admin approved expenses"
on "public"."trek_admin_approved_expenses"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can update admin approved expenses"
on "public"."trek_admin_approved_expenses"
as permissive
for update
to authenticated
using (((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))) OR (((auth.uid())::text)::integer = requested_by)));


create policy "Users can request admin approved expenses"
on "public"."trek_admin_approved_expenses"
as permissive
for insert
to authenticated
with check ((((auth.uid())::text)::integer = requested_by));


create policy "Allow authenticated insert"
on "public"."trek_events"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Allow insert for authenticated users"
on "public"."trek_events"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Allow select for authenticated users"
on "public"."trek_events"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow delete for authenticated users on trek_expenses"
on "public"."trek_expenses"
as permissive
for delete
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow insert for authenticated users on trek_expenses"
on "public"."trek_expenses"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Allow select for authenticated users on trek_expenses"
on "public"."trek_expenses"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow update for authenticated users on trek_expenses"
on "public"."trek_expenses"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow insert for authenticated users"
on "public"."trek_fixed_expenses"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Everyone can view trek fixed expenses"
on "public"."trek_fixed_expenses"
as permissive
for select
to public
using (true);


create policy "Only administrators can delete trek fixed expenses"
on "public"."trek_fixed_expenses"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can insert trek fixed expenses"
on "public"."trek_fixed_expenses"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can update trek fixed expenses"
on "public"."trek_fixed_expenses"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Allow insert for authenticated users"
on "public"."trek_packing_lists"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Everyone can view trek packing lists"
on "public"."trek_packing_lists"
as permissive
for select
to public
using (true);


create policy "Only administrators can create packing lists"
on "public"."trek_packing_lists"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can delete packing lists"
on "public"."trek_packing_lists"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can update packing lists"
on "public"."trek_packing_lists"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can create penalties"
on "public"."user_expense_penalties"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can delete penalties"
on "public"."user_expense_penalties"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Only administrators can update penalties"
on "public"."user_expense_penalties"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM roles_assignments
  WHERE ((roles_assignments.user_id = ((auth.uid())::text)::integer) AND (roles_assignments.role_type = 'trek_lead'::role_type)))));


create policy "Users can view their own penalties"
on "public"."user_expense_penalties"
as permissive
for select
to authenticated
using ((((auth.uid())::text)::integer = user_id));


create policy "Users can insert their own profile"
on "public"."users"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_user_profile();
