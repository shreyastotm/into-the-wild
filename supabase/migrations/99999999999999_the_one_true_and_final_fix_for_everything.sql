-- MIGRATION: 99999999999999_the_one_true_and_final_fix_for_everything.sql
-- This single migration reconciles the entire database schema with the application code.
-- It addresses all user profile schema issues and the trek creation visibility problem.

BEGIN;

-- 1. Correct the 'users' table schema to perfectly match the frontend 'ProfileForm.tsx'.
-- This block renames 'name' to 'full_name' and adds every other missing column.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
      ALTER TABLE public.users RENAME COLUMN name TO full_name;
   END IF;
END $$;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trekking_experience TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pet_details TEXT;

-- 2. Correct the 'handle_new_user' function to align with the authoritative schema.
-- This ensures new users are created correctly with the 'full_name' field.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We now directly upsert, as RLS is handled by grants.
  -- The function maps the 'name' from auth metadata to 'full_name' in the public users table.
  INSERT INTO public.users (user_id, email, full_name, avatar_url, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(),
    is_verified = true
  -- We add a condition to NOT update an existing admin's record, preserving their role.
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Consolidate and re-apply all necessary permissions and policies.
-- Grant permissions for the trigger to bypass RLS.
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO service_role;

-- RLS policies for users to manage their own profiles.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
CREATE POLICY "Allow individual user read access" ON public.users FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
CREATE POLICY "Allow individual user update access" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- 4. Fix Trek Creation visibility by adding RLS policies to 'trek_events'.
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to create treks" ON public.trek_events;
CREATE POLICY "Allow authenticated users to create treks" ON public.trek_events FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all users to view treks" ON public.trek_events;
CREATE POLICY "Allow all users to view treks" ON public.trek_events FOR SELECT USING (true);


-- 5. Ensure the 'trek-assets' storage bucket and its policies are correct.
INSERT INTO storage.buckets (id, name, public) VALUES ('trek-assets', 'trek-assets', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Read Access for Trek Assets" ON storage.objects;
CREATE POLICY "Public Read Access for Trek Assets" ON storage.objects FOR SELECT USING ( bucket_id = 'trek-assets' );
DROP POLICY IF EXISTS "Authenticated Upload for Trek Assets" ON storage.objects;
CREATE POLICY "Authenticated Upload for Trek Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'trek-assets' );

COMMIT; 