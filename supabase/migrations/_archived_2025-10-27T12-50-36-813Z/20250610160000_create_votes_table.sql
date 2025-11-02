-- Migration to create the votes table and its related components
-- Skip if votes table already exists with different schema (from squashed migration)

DO $$
BEGIN
    -- Check if votes table already exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'votes') THEN
        -- Check if it has the old schema (id column instead of vote_id)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'votes' AND column_name = 'id') THEN
            RAISE NOTICE 'Votes table already exists with different schema. Skipping this migration.';
            RETURN;
        END IF;
    END IF;

    -- 1. Create ENUM type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_type') THEN
        CREATE TYPE "public"."target_type" AS ENUM ('trek', 'user', 'post');
    END IF;

-- 2. Create the votes table
CREATE TABLE IF NOT EXISTS "public"."votes" (
    "vote_id" integer NOT NULL,
    "voter_id" uuid NOT NULL REFERENCES auth.users(id),
    "target_type" "public"."target_type" NOT NULL,
    "target_id" integer NOT NULL,
    "vote_value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- 3. Create the sequence for the primary key
CREATE SEQUENCE IF NOT EXISTS "public"."votes_vote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 4. Link the sequence and set the primary key
ALTER SEQUENCE "public"."votes_vote_id_seq" OWNED BY "public"."votes"."vote_id";
ALTER TABLE ONLY "public"."votes" ALTER COLUMN "vote_id" SET DEFAULT nextval('public.votes_vote_id_seq'::regclass);
ALTER TABLE ONLY "public"."votes" ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id");

-- 5. Add policies
ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to vote" ON "public"."votes";
CREATE POLICY "Allow authenticated users to vote" ON "public"."votes" FOR ALL USING (auth.uid() = voter_id) WITH CHECK (auth.uid() = voter_id); 
END$$;