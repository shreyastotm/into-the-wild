-- 1. Ensure the trek-assets bucket exists (manual step if not, do this in the Supabase dashboard)
-- 2. Storage Policy: Allow authenticated users to upload to trek-assets
-- (Replace 'authenticated' with your actual role if different)

-- Policy for Storage
create policy "Allow upload for authenticated users on trek-assets"
  on storage.objects
  for insert
  using (
    bucket_id = 'trek-assets' AND auth.role() = 'authenticated'
  );

-- 3. RLS Policy: Allow authenticated users to insert trek events
create policy "Allow insert for authenticated users"
  on public.trek_events
  for insert
  using (auth.uid() is not null);

-- 4. RLS Policy: Allow authenticated users to insert fixed expenses
create policy "Allow insert for authenticated users"
  on public.trek_fixed_expenses
  for insert
  using (auth.uid() is not null);

-- 5. RLS Policy: Allow authenticated users to insert packing list items
create policy "Allow insert for authenticated users"
  on public.trek_packing_list
  for insert
  using (auth.uid() is not null);

-- 6. (Optional) Enable RLS if not already enabled
alter table public.trek_events enable row level security;
alter table public.trek_fixed_expenses enable row level security;
alter table public.trek_packing_list enable row level security;

-- 7. (Optional) Grant select to anon if you want public read access
-- grant select on table public.trek_events to anon;
-- grant select on table public.trek_fixed_expenses to anon;
-- grant select on table public.trek_packing_list to anon;

-- 8. (Manual) Ensure the trek-assets bucket exists in Supabase Storage Dashboard.
--    If not, create it with the correct name and permissions.

-- === DATABASE ENHANCEMENTS & MIGRATION ===

-- 9. Add 'category' column to expense_sharing if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='expense_sharing' AND column_name='category'
  ) THEN
    ALTER TABLE public.expense_sharing ADD COLUMN category VARCHAR(50);
  END IF;
END $$;

-- 10. Enhance comments table (add missing fields if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='post_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN post_id INTEGER;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='user_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN user_id INTEGER;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='body'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN body TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='created_at'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN created_at TIMESTAMP DEFAULT now();
  END IF;
END $$;

-- 11. Ensure ad_hoc_expense_shares table has required columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='ad_hoc_expense_shares' AND column_name='status'
  ) THEN
    ALTER TABLE public.ad_hoc_expense_shares ADD COLUMN status VARCHAR(20) DEFAULT 'Pending';
  END IF;
END $$;

-- 12. Update comments.post_id foreign key to reference trek_events
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments
  ADD CONSTRAINT comments_post_id_fkey
  FOREIGN KEY (post_id)
  REFERENCES trek_events (trek_id)
  ON DELETE CASCADE;

-- 13. RLS Policy: Allow authenticated users to insert comments
create policy "Allow insert for authenticated users"
  on public.comments
  for insert
  using (auth.uid() is not null);
alter table public.comments enable row level security;

-- 14. RLS Policy: Allow authenticated users to select trek events
create policy "Allow select for authenticated users"
  on public.trek_events
  for select
  using (auth.uid() is not null);

-- === ENHANCED TREK EVENTS SCHEMA ===
-- Add columns for image, GPX, route data, and weather
ALTER TABLE public.trek_events
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS gpx_file_url TEXT,
  ADD COLUMN IF NOT EXISTS route_data JSONB,
  ADD COLUMN IF NOT EXISTS weather_data JSONB;

-- === PATCH: Add GPX file support and packing items table ===
-- Add gpx_file_url and route_data columns to trek_events
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS gpx_file_url TEXT;
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS route_data JSONB;

-- Ensure packing_items table exists
CREATE TABLE IF NOT EXISTS public.packing_items (
  item_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Enable RLS and allow select for authenticated users on packing_items
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on packing_items"
  ON public.packing_items
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed default packing items (run only if table is empty)
INSERT INTO public.packing_items (name)
SELECT * FROM (VALUES
  ('Water Bottle'),
  ('Raincoat'),
  ('First Aid Kit'),
  ('Snacks'),
  ('Flashlight')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.packing_items WHERE name = v.name);

-- === CREATE trek_expenses TABLE FOR LEGACY COMPATIBILITY ===
CREATE TABLE IF NOT EXISTS public.trek_expenses (
  id SERIAL PRIMARY KEY,
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and grant API access for trek_expenses
ALTER TABLE public.trek_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_expenses"
  ON public.trek_expenses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_expenses"
  ON public.trek_expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow update for authenticated users on trek_expenses"
  ON public.trek_expenses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow delete for authenticated users on trek_expenses"
  ON public.trek_expenses FOR DELETE USING (auth.uid() IS NOT NULL);

-- === EXPENSES TABLE ===
CREATE TABLE IF NOT EXISTS public.trek_expenses (
  id SERIAL PRIMARY KEY,
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === PACKING LIST TABLE ===
CREATE TABLE IF NOT EXISTS public.trek_packing_list (
  id SERIAL PRIMARY KEY,
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT FALSE,
  item_order INTEGER DEFAULT 0
);

-- === COMMENTS TABLE ===
CREATE TABLE IF NOT EXISTS public.trek_comments (
  id SERIAL PRIMARY KEY,
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === INDEXES ===
CREATE INDEX IF NOT EXISTS idx_trek_expenses_trek_id ON public.trek_expenses(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_packing_list_trek_id ON public.trek_packing_list(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_comments_trek_id ON public.trek_comments(trek_id);

-- === RLS POLICIES FOR NEW TABLES ===
ALTER TABLE public.trek_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_packing_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_expenses"
  ON public.trek_expenses FOR INSERT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_expenses"
  ON public.trek_expenses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_packing_list"
  ON public.trek_packing_list FOR INSERT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_packing_list"
  ON public.trek_packing_list FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_comments"
  ON public.trek_comments FOR INSERT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_comments"
  ON public.trek_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- === PATCH: Enable REST API for trek_expenses ===
-- Grant API access to trek_expenses for authenticated users
ALTER TABLE public.trek_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_expenses"
  ON public.trek_expenses
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_expenses"
  ON public.trek_expenses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow update for authenticated users on trek_expenses"
  ON public.trek_expenses
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow delete for authenticated users on trek_expenses"
  ON public.trek_expenses
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- === PATCH: CREATE trek_packing_lists TABLE ===
CREATE TABLE IF NOT EXISTS public.trek_packing_lists (
  id SERIAL PRIMARY KEY,
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT FALSE,
  item_order INTEGER DEFAULT 0
);
ALTER TABLE public.trek_packing_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow select for authenticated users on trek_packing_lists"
  ON public.trek_packing_lists FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users on trek_packing_lists"
  ON public.trek_packing_lists FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow update for authenticated users on trek_packing_lists"
  ON public.trek_packing_lists FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow delete for authenticated users on trek_packing_lists"
  ON public.trek_packing_lists FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_trek_packing_lists_trek_id ON public.trek_packing_lists(trek_id);

-- === PATCH: Add item_order column to trek_packing_lists ===
ALTER TABLE public.trek_packing_lists ADD COLUMN IF NOT EXISTS item_order INTEGER DEFAULT 0;
