-- Database Verification and Fix Script
-- Run this in Supabase SQL Editor to verify and fix all gaps

BEGIN;

-- 1. VERIFY AND CREATE MISSING RPC FUNCTIONS

-- Create is_admin function
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

-- 2. VERIFY AND CREATE MISSING STORAGE BUCKETS

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

-- 3. CREATE STORAGE BUCKET POLICIES

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

-- 4. CREATE MISSING tent_rentals TABLE

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

-- 5. CREATE FUNCTION TO GET RESERVED TENT COUNT

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

-- 6. VERIFY ALL REQUIRED FUNCTIONS EXIST

DO $$
DECLARE
    missing_functions TEXT[] := ARRAY[]::TEXT[];
    func_name TEXT;
    required_functions TEXT[] := ARRAY[
        'get_trek_participant_count',
        'create_notification',
        'mark_notification_as_read',
        'get_user_notifications',
        'is_admin',
        'get_tent_reserved_count'
    ];
BEGIN
    FOREACH func_name IN ARRAY required_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = func_name 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN
            missing_functions := array_append(missing_functions, func_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE NOTICE 'Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE 'All required functions exist!';
    END IF;
END $$;

-- 7. VERIFY ALL REQUIRED TABLES EXIST

DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    required_tables TEXT[] := ARRAY[
        'users',
        'trek_events',
        'trek_registrations',
        'trek_comments',
        'notifications',
        'master_packing_items',
        'trek_costs',
        'tent_rentals'
    ];
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = table_name 
            AND table_schema = 'public'
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist!';
    END IF;
END $$;

-- 8. VERIFY STORAGE BUCKETS

DO $$
DECLARE
    missing_buckets TEXT[] := ARRAY[]::TEXT[];
    bucket_name TEXT;
    required_buckets TEXT[] := ARRAY[
        'payment-proofs',
        'avatars',
        'trek-images'
    ];
BEGIN
    FOREACH bucket_name IN ARRAY required_buckets
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = bucket_name
        ) THEN
            missing_buckets := array_append(missing_buckets, bucket_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_buckets, 1) > 0 THEN
        RAISE NOTICE 'Missing buckets: %', array_to_string(missing_buckets, ', ');
    ELSE
        RAISE NOTICE 'All required storage buckets exist!';
    END IF;
END $$;

COMMIT;

-- Final verification query
SELECT 
    'Database verification completed' AS status,
    NOW() AS completed_at;
