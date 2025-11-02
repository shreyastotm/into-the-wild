-- MIGRATION: 20250104000000_final_production_fixes.sql
-- Final production fixes for Into The Wild deployment
-- Addresses all missing functions, tables, and storage buckets

BEGIN;

-- 1. CREATE MISSING is_admin FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE user_id = user_id_param 
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- 2. CREATE MISSING tent_rentals TABLE
CREATE TABLE IF NOT EXISTS public.tent_rentals (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    tent_type TEXT NOT NULL,
    price_per_tent DECIMAL(10,2) NOT NULL,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tent_rentals
ALTER TABLE public.tent_rentals ENABLE ROW LEVEL SECURITY;

-- RLS policies for tent_rentals
DROP POLICY IF EXISTS "Public read access for tent rentals" ON public.tent_rentals;
CREATE POLICY "Public read access for tent rentals" ON public.tent_rentals 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tent rentals" ON public.tent_rentals;
CREATE POLICY "Admins can manage tent rentals" ON public.tent_rentals 
FOR ALL TO authenticated 
USING (public.is_admin());

-- 3. CREATE FUNCTION TO GET RESERVED TENT COUNT
CREATE OR REPLACE FUNCTION public.get_tent_reserved_count(trek_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(reserved_quantity) 
     FROM public.tent_rentals 
     WHERE trek_id = trek_id_param), 
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_tent_reserved_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tent_reserved_count(INTEGER) TO anon;

-- 4. CREATE REQUIRED STORAGE BUCKETS

-- Create payment-proofs bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false) 
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Create trek-images bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trek-images', 'trek-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. CREATE STORAGE BUCKET POLICIES

-- Payment proofs policies (private)
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
CREATE POLICY "Users can upload payment proofs" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
CREATE POLICY "Users can view own payment proofs" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
CREATE POLICY "Admins can view all payment proofs" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'payment-proofs' AND public.is_admin());

-- Avatars policies (public)
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Trek images policies (public)
DROP POLICY IF EXISTS "Users can upload trek images" ON storage.objects;
CREATE POLICY "Users can upload trek images" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'trek-images');

DROP POLICY IF EXISTS "Public read access for trek images" ON storage.objects;
CREATE POLICY "Public read access for trek images" ON storage.objects 
FOR SELECT USING (bucket_id = 'trek-images');

-- 6. UPDATE EXISTING BUCKET POLICIES (if they exist)
-- Update trek-assets bucket policies to be more specific
DROP POLICY IF EXISTS "Public Read Access for Trek Assets" ON storage.objects;
CREATE POLICY "Public Read Access for Trek Assets" ON storage.objects 
FOR SELECT USING (bucket_id = 'trek-assets');

DROP POLICY IF EXISTS "Authenticated Upload for Trek Assets" ON storage.objects;
CREATE POLICY "Authenticated Upload for Trek Assets" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'trek-assets');

-- 7. VERIFY AND FIX USER TABLE SCHEMA
-- Ensure all required columns exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trekking_experience TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pet_details TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS car_seating_capacity INTEGER;

-- 8. UPDATE handle_new_user FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ENSURE RLS POLICIES ARE CORRECT
-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
CREATE POLICY "Allow individual user read access" ON public.users 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
CREATE POLICY "Allow individual user update access" ON public.users 
FOR UPDATE USING (auth.uid() = user_id);

-- Trek events policies
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to view treks" ON public.trek_events;
CREATE POLICY "Allow all users to view treks" ON public.trek_events 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create treks" ON public.trek_events;
CREATE POLICY "Allow authenticated users to create treks" ON public.trek_events 
FOR INSERT TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tent_rentals_trek_id ON public.tent_rentals(trek_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_trek_events_status ON public.trek_events(status);

COMMIT;

-- Final verification
SELECT 
    'Final production fixes completed successfully' AS status,
    NOW() AS completed_at;
