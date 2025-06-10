-- Migration to create the trek_packing_items table and its policies

-- 1. Create the table
CREATE TABLE IF NOT EXISTS "public"."trek_packing_items" (
    "item_id" integer NOT NULL,
    "name" "text" NOT NULL
);

-- 2. Create the sequence for the primary key
CREATE SEQUENCE IF NOT EXISTS "public"."trek_packing_items_item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 3. Link the sequence to the table's primary key
ALTER TABLE "public"."trek_packing_items" ALTER COLUMN "item_id" SET DEFAULT nextval('public.trek_packing_items_item_id_seq'::regclass);
ALTER SEQUENCE "public"."trek_packing_items_item_id_seq" OWNED BY "public"."trek_packing_items"."item_id";

-- 4. Set the primary key
ALTER TABLE ONLY "public"."trek_packing_items"
    ADD CONSTRAINT "packing_items_pkey" PRIMARY KEY ("item_id");

-- 5. Enable RLS and add policies
ALTER TABLE "public"."trek_packing_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON "public"."trek_packing_items";
CREATE POLICY "Allow select for authenticated users" ON "public"."trek_packing_items" FOR SELECT TO "authenticated" USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON "public"."trek_packing_items";
CREATE POLICY "Allow insert for authenticated users" ON "public"."trek_packing_items" FOR INSERT TO "authenticated" WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON "public"."trek_packing_items";
CREATE POLICY "Allow delete for authenticated users" ON "public"."trek_packing_items" FOR DELETE TO "authenticated" USING (true);

DROP POLICY IF EXISTS "Allow update for authenticated users" ON "public"."trek_packing_items";
CREATE POLICY "Allow update for authenticated users" ON "public"."trek_packing_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true); 