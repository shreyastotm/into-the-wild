

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."event_creator_type" AS ENUM (
    'internal',
    'external'
);


ALTER TYPE "public"."event_creator_type" OWNER TO "postgres";


CREATE TYPE "public"."id_verification_status" AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


ALTER TYPE "public"."id_verification_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'Pending',
    'Paid',
    'Cancelled'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."post_type" AS ENUM (
    'message_board',
    'looking_for_trek'
);


ALTER TYPE "public"."post_type" OWNER TO "postgres";


CREATE TYPE "public"."renewal_status" AS ENUM (
    'active',
    'expired'
);


ALTER TYPE "public"."renewal_status" OWNER TO "postgres";


CREATE TYPE "public"."role_type" AS ENUM (
    'trek_lead',
    'medic',
    'carry_list'
);


ALTER TYPE "public"."role_type" OWNER TO "postgres";


CREATE TYPE "public"."target_type" AS ENUM (
    'trek',
    'user'
);


ALTER TYPE "public"."target_type" OWNER TO "postgres";


CREATE TYPE "public"."transport_mode" AS ENUM (
    'cars',
    'mini_van',
    'bus'
);


ALTER TYPE "public"."transport_mode" OWNER TO "postgres";


CREATE TYPE "public"."visibility" AS ENUM (
    'public',
    'private'
);


ALTER TYPE "public"."visibility" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (user_id, full_name, email, phone_number, subscription_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'subscription_type')::public.subscription_type
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "comment_id" integer NOT NULL,
    "post_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."comments_comment_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_comment_id_seq" OWNED BY "public"."comments"."comment_id";



CREATE TABLE IF NOT EXISTS "public"."community_posts" (
    "post_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "body" "text" NOT NULL,
    "post_type" "public"."post_type" NOT NULL,
    "visibility" "public"."visibility" DEFAULT 'public'::"public"."visibility" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."community_posts_post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."community_posts_post_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_posts_post_id_seq" OWNED BY "public"."community_posts"."post_id";



CREATE TABLE IF NOT EXISTS "public"."trek_packing_items" (
    "item_id" integer NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."trek_packing_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."packing_items_item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."packing_items_item_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."packing_items_item_id_seq" OWNED BY "public"."trek_packing_items"."item_id";



CREATE TABLE IF NOT EXISTS "public"."partners" (
    "partner_id" integer NOT NULL,
    "partner_name" character varying(255) NOT NULL,
    "contact_details" "jsonb",
    "verification_docs" "jsonb",
    "revenue_sharing_rate" numeric(5,2),
    "external_portal_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."partners_partner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."partners_partner_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."partners_partner_id_seq" OWNED BY "public"."partners"."partner_id";



CREATE TABLE IF NOT EXISTS "public"."trek_registrations" (
    "registration_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trek_id" integer NOT NULL,
    "booking_datetime" timestamp with time zone DEFAULT "now"(),
    "payment_status" "text" DEFAULT 'Pending'::"text",
    "cancellation_datetime" timestamp with time zone,
    "penalty_applied" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_registrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."registrations_registration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."registrations_registration_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."registrations_registration_id_seq" OWNED BY "public"."trek_registrations"."registration_id";



CREATE TABLE IF NOT EXISTS "public"."subscriptions_billing" (
    "subscription_id" integer NOT NULL,
    "user_id" integer,
    "subscription_type" character varying(50) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "billing_period" character varying(50) NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "renewal_status" "public"."renewal_status" DEFAULT 'active'::"public"."renewal_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions_billing" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_billing_subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."subscriptions_billing_subscription_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscriptions_billing_subscription_id_seq" OWNED BY "public"."subscriptions_billing"."subscription_id";



CREATE TABLE IF NOT EXISTS "public"."trek_ad_hoc_expense_shares" (
    "share_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expense_id" "uuid",
    "user_id" integer NOT NULL,
    "status" "text" DEFAULT 'Pending'::"text",
    "rejection_reason" "text",
    "responded_at" timestamp with time zone,
    "share_amount" numeric(10,2) NOT NULL,
    CONSTRAINT "ad_hoc_expense_shares_status_check" CHECK (("status" = ANY (ARRAY['Pending'::"text", 'Accepted'::"text", 'Rejected'::"text"])))
);


ALTER TABLE "public"."trek_ad_hoc_expense_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trek_ad_hoc_expenses" (
    "expense_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trek_id" integer,
    "payer_id" integer NOT NULL,
    "category" "text",
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "settled_at" timestamp with time zone,
    CONSTRAINT "trek_ad_hoc_expenses_category_check" CHECK (("category" = ANY (ARRAY['Fuel'::"text", 'Toll'::"text", 'Parking'::"text", 'Snacks'::"text", 'Meals'::"text", 'Water'::"text", 'Local Transport'::"text", 'Medical Supplies'::"text", 'Other'::"text"])))
);


ALTER TABLE "public"."trek_ad_hoc_expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trek_admin_approved_expenses" (
    "expense_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trek_id" integer,
    "category" "text",
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "approved" boolean DEFAULT false,
    "requested_by" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_admin_approved_expenses_category_check" CHECK (("category" = ANY (ARRAY['Camera Rental'::"text", 'Drone Rental'::"text", 'Guide Fees (custom)'::"text", 'Cook/Support Staff'::"text", 'Other Equipment'::"text"])))
);


ALTER TABLE "public"."trek_admin_approved_expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trek_events" (
    "trek_id" integer NOT NULL,
    "trek_name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "start_datetime" timestamp with time zone NOT NULL,
    "duration" interval,
    "cost" numeric(10,2) NOT NULL,
    "cancellation_policy" "text",
    "penalty_details" numeric(10,2),
    "max_participants" integer NOT NULL,
    "location" "text",
    "route_data" "jsonb",
    "transport_mode" "public"."transport_mode",
    "vendor_contacts" "jsonb",
    "pickup_time_window" "text",
    "event_creator_type" "public"."event_creator_type" DEFAULT 'internal'::"public"."event_creator_type",
    "partner_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "booking_amount" numeric(10,2),
    "collect_full_fee" boolean DEFAULT false,
    "image_url" "text",
    "gpx_file_url" "text",
    "is_finalized" boolean DEFAULT false
);


ALTER TABLE "public"."trek_events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trek_events"."partner_id" IS 'Null for internal events; set for micro-community (external) events';



COMMENT ON COLUMN "public"."trek_events"."is_finalized" IS 'True if trek event is fully detailed and registration requires payment/terms';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_events_trek_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_events_trek_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_events_trek_id_seq" OWNED BY "public"."trek_events"."trek_id";



CREATE TABLE IF NOT EXISTS "public"."trek_expenses" (
    "id" integer NOT NULL,
    "trek_id" integer,
    "title" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "type" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_expenses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trek_expenses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_expenses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_expenses_id_seq" OWNED BY "public"."trek_expenses"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_fixed_expenses" (
    "expense_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trek_id" integer,
    "expense_type" "text",
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "settled_at" timestamp with time zone,
    CONSTRAINT "trek_fixed_expenses_expense_type_check" CHECK (("expense_type" = ANY (ARRAY['Tickets'::"text", 'Forest Fees'::"text", 'Stay'::"text", 'Camping Equipment'::"text", 'Bonfire'::"text", 'Bird Watching Guide'::"text", 'Cooking Stove Rental'::"text", 'Other'::"text"])))
);


ALTER TABLE "public"."trek_fixed_expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "full_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone_number" character varying(50),
    "address" "text",
    "date_of_birth" "date",
    "id_verification_status" "public"."id_verification_status" DEFAULT 'Pending'::"public"."id_verification_status",
    "health_data" "jsonb",
    "trekking_experience" character varying(100),
    "badges" "jsonb",
    "interests" "jsonb",
    "pet_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "image_url" "text",
    "user_type" "text",
    "partner_id" "text",
    "indemnity_accepted" boolean DEFAULT false,
    "indemnity_accepted_at" timestamp with time zone,
    "verification_status" "text" DEFAULT 'pending'::"text",
    "verification_docs" "jsonb",
    "avatar_url" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."user_type" IS 'admin, micro_community, or trekker';



COMMENT ON COLUMN "public"."users"."partner_id" IS 'Set for micro-community users, null otherwise';



COMMENT ON COLUMN "public"."users"."indemnity_accepted" IS 'True if user has accepted indemnity form';



COMMENT ON COLUMN "public"."users"."indemnity_accepted_at" IS 'Timestamp when indemnity was accepted';



COMMENT ON COLUMN "public"."users"."verification_status" IS 'pending, verified, or rejected';



COMMENT ON COLUMN "public"."users"."verification_docs" IS 'JSON array of uploaded verification documents';



COMMENT ON COLUMN "public"."users"."avatar_url" IS 'URL to the user''s profile picture or avatar.';



CREATE TABLE IF NOT EXISTS "public"."votes" (
    "vote_id" integer NOT NULL,
    "voter_id" integer NOT NULL,
    "target_type" "public"."target_type" NOT NULL,
    "target_id" integer NOT NULL,
    "vote_value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."votes_vote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."votes_vote_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."votes_vote_id_seq" OWNED BY "public"."votes"."vote_id";



ALTER TABLE ONLY "public"."comments" ALTER COLUMN "comment_id" SET DEFAULT "nextval"('"public"."comments_comment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."community_posts" ALTER COLUMN "post_id" SET DEFAULT "nextval"('"public"."community_posts_post_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."partners" ALTER COLUMN "partner_id" SET DEFAULT "nextval"('"public"."partners_partner_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subscriptions_billing" ALTER COLUMN "subscription_id" SET DEFAULT "nextval"('"public"."subscriptions_billing_subscription_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_events" ALTER COLUMN "trek_id" SET DEFAULT "nextval"('"public"."trek_events_trek_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_expenses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_expenses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_packing_items" ALTER COLUMN "item_id" SET DEFAULT "nextval"('"public"."packing_items_item_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_registrations" ALTER COLUMN "registration_id" SET DEFAULT "nextval"('"public"."registrations_registration_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."votes" ALTER COLUMN "vote_id" SET DEFAULT "nextval"('"public"."votes_vote_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_ad_hoc_expense_shares"
    ADD CONSTRAINT "ad_hoc_expense_shares_pkey" PRIMARY KEY ("share_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_pkey" PRIMARY KEY ("post_id");



ALTER TABLE ONLY "public"."trek_packing_items"
    ADD CONSTRAINT "packing_items_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("partner_id");



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "registrations_pkey" PRIMARY KEY ("registration_id");



ALTER TABLE ONLY "public"."subscriptions_billing"
    ADD CONSTRAINT "subscriptions_billing_pkey" PRIMARY KEY ("subscription_id");



ALTER TABLE ONLY "public"."trek_ad_hoc_expenses"
    ADD CONSTRAINT "trek_ad_hoc_expenses_pkey" PRIMARY KEY ("expense_id");



ALTER TABLE ONLY "public"."trek_admin_approved_expenses"
    ADD CONSTRAINT "trek_admin_approved_expenses_pkey" PRIMARY KEY ("expense_id");



ALTER TABLE ONLY "public"."trek_events"
    ADD CONSTRAINT "trek_events_pkey" PRIMARY KEY ("trek_id");



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_fixed_expenses"
    ADD CONSTRAINT "trek_fixed_expenses_pkey" PRIMARY KEY ("expense_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id");



CREATE INDEX "idx_registrations_trek_id" ON "public"."trek_registrations" USING "btree" ("trek_id");



CREATE INDEX "idx_registrations_user_id" ON "public"."trek_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_trek_events_is_finalized" ON "public"."trek_events" USING "btree" ("is_finalized");



CREATE INDEX "idx_trek_events_partner_id" ON "public"."trek_events" USING "btree" ("partner_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profile"();



ALTER TABLE ONLY "public"."trek_ad_hoc_expense_shares"
    ADD CONSTRAINT "ad_hoc_expense_shares_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."trek_ad_hoc_expenses"("expense_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_ad_hoc_expenses"
    ADD CONSTRAINT "trek_ad_hoc_expenses_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_admin_approved_expenses"
    ADD CONSTRAINT "trek_admin_approved_expenses_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_fixed_expenses"
    ADD CONSTRAINT "trek_fixed_expenses_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all registrations" ON "public"."trek_registrations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage internal events" ON "public"."trek_events" TO "authenticated" USING (("event_creator_type" = 'internal'::"public"."event_creator_type"));



CREATE POLICY "Allow all deletes" ON "public"."trek_events" FOR DELETE USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."trek_events" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow delete for authenticated users" ON "public"."trek_packing_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow delete for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for authenticated users" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for authenticated users" ON "public"."trek_events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for authenticated users" ON "public"."trek_fixed_expenses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for authenticated users" ON "public"."trek_packing_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for all authenticated users" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select for authenticated users" ON "public"."trek_events" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for authenticated users" ON "public"."trek_packing_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select for authenticated users on packing_items" ON "public"."trek_packing_items" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for authenticated users on trek_events" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow update for authenticated" ON "public"."trek_events" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update for authenticated users" ON "public"."trek_packing_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow update for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Everyone can view admin approved expenses" ON "public"."trek_admin_approved_expenses" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek ad hoc expenses" ON "public"."trek_ad_hoc_expenses" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek fixed expenses" ON "public"."trek_fixed_expenses" FOR SELECT USING (true);



CREATE POLICY "Expense creator can create expense shares" ON "public"."trek_ad_hoc_expense_shares" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trek_ad_hoc_expenses"
  WHERE (("trek_ad_hoc_expenses"."expense_id" = "trek_ad_hoc_expense_shares"."expense_id") AND ("trek_ad_hoc_expenses"."payer_id" = (("auth"."uid"())::"text")::integer)))));



CREATE POLICY "Expense creator can delete expense shares" ON "public"."trek_ad_hoc_expense_shares" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trek_ad_hoc_expenses"
  WHERE (("trek_ad_hoc_expenses"."expense_id" = "trek_ad_hoc_expense_shares"."expense_id") AND ("trek_ad_hoc_expenses"."payer_id" = (("auth"."uid"())::"text")::integer)))));



CREATE POLICY "Micro-community can manage their own events" ON "public"."trek_events" TO "authenticated" USING ((("event_creator_type" = 'external'::"public"."event_creator_type") AND (("partner_id")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'partner_id'::"text"))));



CREATE POLICY "Users can create their own ad hoc expenses" ON "public"."trek_ad_hoc_expenses" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."uid"())::"text")::integer = "payer_id"));



CREATE POLICY "Users can delete their own ad hoc expenses" ON "public"."trek_ad_hoc_expenses" FOR DELETE TO "authenticated" USING (((("auth"."uid"())::"text")::integer = "payer_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can register for treks" ON "public"."trek_registrations" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can request admin approved expenses" ON "public"."trek_admin_approved_expenses" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."uid"())::"text")::integer = "requested_by"));



CREATE POLICY "Users can update their own ad hoc expenses" ON "public"."trek_ad_hoc_expenses" FOR UPDATE TO "authenticated" USING (((("auth"."uid"())::"text")::integer = "payer_id"));



CREATE POLICY "Users can update their own expense share responses" ON "public"."trek_ad_hoc_expense_shares" FOR UPDATE TO "authenticated" USING ((((("auth"."uid"())::"text")::integer = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."trek_ad_hoc_expenses"
  WHERE (("trek_ad_hoc_expenses"."expense_id" = "trek_ad_hoc_expense_shares"."expense_id") AND ("trek_ad_hoc_expenses"."payer_id" = (("auth"."uid"())::"text")::integer))))));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view expense shares they are part of" ON "public"."trek_ad_hoc_expense_shares" FOR SELECT TO "authenticated" USING ((((("auth"."uid"())::"text")::integer = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."trek_ad_hoc_expenses"
  WHERE (("trek_ad_hoc_expenses"."expense_id" = "trek_ad_hoc_expense_shares"."expense_id") AND ("trek_ad_hoc_expenses"."payer_id" = (("auth"."uid"())::"text")::integer))))));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their registrations" ON "public"."trek_registrations" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Verified micro-community can insert trek_events" ON "public"."trek_events" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("event_creator_type" = 'external'::"public"."event_creator_type") AND (( SELECT "count"(1) AS "count"
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'micro_community'::"text") AND ("u"."verification_status" = 'verified'::"text") AND ("u"."indemnity_accepted" = true) AND (("u"."partner_id")::integer = "trek_events"."partner_id"))) = 1)));



CREATE POLICY "Verified micro-community can update their trek_events" ON "public"."trek_events" FOR UPDATE TO "authenticated" USING ((("event_creator_type" = 'external'::"public"."event_creator_type") AND (( SELECT "count"(1) AS "count"
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'micro_community'::"text") AND ("u"."verification_status" = 'verified'::"text") AND ("u"."indemnity_accepted" = true) AND (("u"."partner_id")::integer = "trek_events"."partner_id"))) = 1)));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_ad_hoc_expense_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_ad_hoc_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_admin_approved_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_fixed_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_packing_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."community_posts" TO "anon";
GRANT ALL ON TABLE "public"."community_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."community_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_packing_items" TO "anon";
GRANT ALL ON TABLE "public"."trek_packing_items" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_packing_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."packing_items_item_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."packing_items_item_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."packing_items_item_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON SEQUENCE "public"."partners_partner_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."partners_partner_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."partners_partner_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_registrations" TO "anon";
GRANT ALL ON TABLE "public"."trek_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_registrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions_billing" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_ad_hoc_expense_shares" TO "anon";
GRANT ALL ON TABLE "public"."trek_ad_hoc_expense_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_ad_hoc_expense_shares" TO "service_role";



GRANT ALL ON TABLE "public"."trek_ad_hoc_expenses" TO "anon";
GRANT ALL ON TABLE "public"."trek_ad_hoc_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_ad_hoc_expenses" TO "service_role";



GRANT ALL ON TABLE "public"."trek_admin_approved_expenses" TO "anon";
GRANT ALL ON TABLE "public"."trek_admin_approved_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_admin_approved_expenses" TO "service_role";



GRANT ALL ON TABLE "public"."trek_events" TO "anon";
GRANT ALL ON TABLE "public"."trek_events" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_expenses" TO "anon";
GRANT ALL ON TABLE "public"."trek_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_expenses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_fixed_expenses" TO "anon";
GRANT ALL ON TABLE "public"."trek_fixed_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_fixed_expenses" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
